import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

export interface WalletHoldResult {
  holdId: string;
  transactionReference: string;
  availableBalanceMinor: number;
  heldBalanceMinor: number;
}

export class WalletService {
  /**
   * Formats a readable wallet transaction reference: PN-WTX-XXXXXXXX
   */
  static generateReference(): string {
    const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `PN-WTX-${rand}`;
  }

  /**
   * Safely verifies if a userId exists before assigning it to relational foreign keys.
   */
  static async resolveValidUserId(userId?: string | null, tx?: any): Promise<string | null> {
    if (!userId) return null;
    const client = tx || prisma;
    try {
      const u = await client.user.findUnique({ where: { id: userId }, select: { id: true } });
      return u ? u.id : null;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves or initializes agency wallet.
   */
  static async getOrCreateWallet(agencyId: string, tx?: any) {
    const client = tx || prisma;
    let wallet = await client.wallet.findUnique({
      where: { agencyId },
    });

    if (!wallet) {
      wallet = await client.wallet.create({
        data: {
          agencyId,
          currency: "USD",
          availableBalanceMinor: 0,
          heldBalanceMinor: 0,
          status: "ACTIVE",
        },
      });
    }

    return wallet;
  }

  /**
   * Creates an atomic hold on funds for a booking reservation.
   * Decrements available balance and increments held balance.
   */
  static async holdFunds(
    agencyId: string,
    amountMinor: number,
    bookingReference: string,
    actorUserId: string
  ): Promise<WalletHoldResult> {
    if (amountMinor <= 0) {
      throw new Error("INVALID_AMOUNT: Hold amount must be greater than zero.");
    }

    return await prisma.$transaction(async (tx) => {
      const validActorId = await this.resolveValidUserId(actorUserId, tx);
      const wallet = await this.getOrCreateWallet(agencyId, tx);

      if (wallet.status !== "ACTIVE") {
        throw new Error("WALLET_RESTRICTED: Agency wallet is not in active status.");
      }

      if (wallet.availableBalanceMinor < amountMinor) {
        throw new Error(
          `INSUFFICIENT_FUNDS: Available balance ($${(wallet.availableBalanceMinor / 100).toFixed(2)}) is less than required hold ($${(amountMinor / 100).toFixed(2)}).`
        );
      }

      const balanceBefore = wallet.availableBalanceMinor;
      const balanceAfter = balanceBefore - amountMinor;
      const ref = this.generateReference();

      // 1. Update wallet balances atomically
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalanceMinor: balanceAfter,
          heldBalanceMinor: wallet.heldBalanceMinor + amountMinor,
        },
      });

      // Also update agency balance mirror
      await tx.agency.update({
        where: { id: agencyId },
        data: {
          walletBalanceMinor: balanceAfter,
          heldBalanceMinor: updatedWallet.heldBalanceMinor,
        },
      });

      // 2. Append immutable ledger entry
      await tx.walletLedgerEntry.create({
        data: {
          transactionReference: ref,
          walletId: wallet.id,
          agencyId,
          type: "BOOKING_HOLD",
          status: "POSTED",
          amountMinor,
          balanceBeforeMinor: balanceBefore,
          balanceAfterMinor: balanceAfter,
          currency: wallet.currency,
          relatedBookingId: bookingReference,
          initiatedByUserId: validActorId,
          reason: `Prepaid hold for booking ${bookingReference}`,
        },
      });

      // 3. Audit log
      await tx.auditLog.create({
        data: {
          actorUserId: validActorId,
          agencyId,
          action: "WALLET_HOLD_CREATED",
          resourceType: "WALLET",
          resourceId: wallet.id,
          outcome: "SUCCESS",
          reason: `Held $${(amountMinor / 100).toFixed(2)} for ${bookingReference}`,
        },
      });

      return {
        holdId: ref,
        transactionReference: ref,
        availableBalanceMinor: updatedWallet.availableBalanceMinor,
        heldBalanceMinor: updatedWallet.heldBalanceMinor,
      };
    }, { maxWait: 15000, timeout: 25000 });
  }

  /**
   * Captures previously held funds when a ticket is issued.
   * Decrements held balance.
   */
  static async captureHold(
    agencyId: string,
    amountMinor: number,
    bookingReference: string,
    ticketNumber: string,
    actorUserId: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const validActorId = await this.resolveValidUserId(actorUserId, tx);
      const wallet = await this.getOrCreateWallet(agencyId, tx);
      const ref = this.generateReference();

      const newHeld = Math.max(0, wallet.heldBalanceMinor - amountMinor);

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { heldBalanceMinor: newHeld },
      });

      await tx.agency.update({
        where: { id: agencyId },
        data: { heldBalanceMinor: newHeld },
      });

      await tx.walletLedgerEntry.create({
        data: {
          transactionReference: ref,
          walletId: wallet.id,
          agencyId,
          type: "BOOKING_CAPTURE",
          status: "POSTED",
          amountMinor,
          balanceBeforeMinor: wallet.availableBalanceMinor,
          balanceAfterMinor: wallet.availableBalanceMinor,
          currency: wallet.currency,
          relatedBookingId: bookingReference,
          initiatedByUserId: validActorId,
          reason: `Capture hold for issued ticket ${ticketNumber}`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: validActorId,
          agencyId,
          action: "WALLET_HOLD_CAPTURED",
          resourceType: "WALLET",
          resourceId: wallet.id,
          outcome: "SUCCESS",
          reason: `Captured hold for ${bookingReference} ticket ${ticketNumber}`,
        },
      });

      return { transactionReference: ref, heldBalanceMinor: newHeld };
    }, { maxWait: 15000, timeout: 25000 });
  }

  /**
   * Releases previously held funds back to available balance (e.g. Booking failed or cancelled before ticketing).
   */
  static async releaseHold(
    agencyId: string,
    amountMinor: number,
    bookingReference: string,
    reason: string,
    actorUserId?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const validActorId = await this.resolveValidUserId(actorUserId, tx);
      const wallet = await this.getOrCreateWallet(agencyId, tx);
      const ref = this.generateReference();

      const newHeld = Math.max(0, wallet.heldBalanceMinor - amountMinor);
      const newAvailable = wallet.availableBalanceMinor + amountMinor;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalanceMinor: newAvailable,
          heldBalanceMinor: newHeld,
        },
      });

      await tx.agency.update({
        where: { id: agencyId },
        data: {
          walletBalanceMinor: newAvailable,
          heldBalanceMinor: newHeld,
        },
      });

      await tx.walletLedgerEntry.create({
        data: {
          transactionReference: ref,
          walletId: wallet.id,
          agencyId,
          type: "BOOKING_RELEASE",
          status: "POSTED",
          amountMinor,
          balanceBeforeMinor: wallet.availableBalanceMinor,
          balanceAfterMinor: newAvailable,
          currency: wallet.currency,
          relatedBookingId: bookingReference,
          initiatedByUserId: validActorId,
          reason: `Released hold: ${reason}`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: validActorId,
          agencyId,
          action: "WALLET_HOLD_RELEASED",
          resourceType: "WALLET",
          resourceId: wallet.id,
          outcome: "SUCCESS",
          reason: `Released hold $${(amountMinor / 100).toFixed(2)} for ${bookingReference}: ${reason}`,
        },
      });

      return { transactionReference: ref, availableBalanceMinor: newAvailable, heldBalanceMinor: newHeld };
    }, { maxWait: 15000, timeout: 25000 });
  }

  /**
   * Credits agency wallet with funds (e.g. Approved Top-Up).
   */
  static async creditWallet(
    agencyId: string,
    amountMinor: number,
    reason: string,
    actorUserId: string,
    fundingRequestId?: string
  ) {
    if (amountMinor <= 0) {
      throw new Error("INVALID_AMOUNT: Credit amount must be positive.");
    }

    return await prisma.$transaction(async (tx) => {
      const validActorId = await this.resolveValidUserId(actorUserId, tx);
      const wallet = await this.getOrCreateWallet(agencyId, tx);
      const ref = this.generateReference();

      const balanceBefore = wallet.availableBalanceMinor;
      const balanceAfter = balanceBefore + amountMinor;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { availableBalanceMinor: balanceAfter },
      });

      await tx.agency.update({
        where: { id: agencyId },
        data: { walletBalanceMinor: balanceAfter },
      });

      await tx.walletLedgerEntry.create({
        data: {
          transactionReference: ref,
          walletId: wallet.id,
          agencyId,
          type: fundingRequestId ? "TOP_UP_APPROVED" : "CREDIT",
          status: "POSTED",
          amountMinor,
          balanceBeforeMinor: balanceBefore,
          balanceAfterMinor: balanceAfter,
          currency: wallet.currency,
          relatedFundingRequestId: fundingRequestId || null,
          initiatedByUserId: validActorId,
          approvedByUserId: validActorId,
          reason,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: validActorId,
          agencyId,
          action: "WALLET_CREDITED",
          resourceType: "WALLET",
          resourceId: wallet.id,
          outcome: "SUCCESS",
          reason: `Credited $${(amountMinor / 100).toFixed(2)}: ${reason}`,
        },
      });

      return { transactionReference: ref, availableBalanceMinor: balanceAfter };
    }, { maxWait: 15000, timeout: 25000 });
  }

  /**
   * High-value adjustment approval enforcing Maker-Checker principles.
   * Maker (initiator) cannot approve their own adjustment.
   */
  static async approveAdjustment(
    adjustmentId: string,
    approverUserId: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const adj = await tx.walletAdjustment.findUnique({
        where: { id: adjustmentId },
      });

      if (!adj || adj.status !== "PENDING_APPROVAL") {
        throw new Error("ADJUSTMENT_NOT_ELIGIBLE: Adjustment record not found or already processed.");
      }

      // MAKER-CHECKER CONSTRAINT
      if (adj.initiatedByUserId === approverUserId) {
        throw new Error("MAKER_CHECKER_VIOLATION: Initiator cannot approve their own adjustment.");
      }

      const validApproverId = await this.resolveValidUserId(approverUserId, tx);
      const validInitiatorId = await this.resolveValidUserId(adj.initiatedByUserId, tx);

      const wallet = await this.getOrCreateWallet(adj.agencyId, tx);
      const ref = this.generateReference();

      let balanceBefore = wallet.availableBalanceMinor;
      let balanceAfter = balanceBefore;

      if (adj.type === "CREDIT") {
        balanceAfter += adj.amountMinor;
      } else if (adj.type === "DEBIT") {
        if (balanceBefore < adj.amountMinor) {
          throw new Error("INSUFFICIENT_FUNDS: Cannot debit wallet below zero.");
        }
        balanceAfter -= adj.amountMinor;
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { availableBalanceMinor: balanceAfter },
      });

      await tx.agency.update({
        where: { id: adj.agencyId },
        data: { walletBalanceMinor: balanceAfter },
      });

      await tx.walletAdjustment.update({
        where: { id: adj.id },
        data: {
          status: "APPROVED",
          approvedByUserId: validApproverId,
          approvedAt: new Date(),
        },
      });

      await tx.walletLedgerEntry.create({
        data: {
          transactionReference: ref,
          walletId: wallet.id,
          agencyId: adj.agencyId,
          type: "MANUAL_ADJUSTMENT",
          status: "POSTED",
          amountMinor: adj.amountMinor,
          balanceBeforeMinor: balanceBefore,
          balanceAfterMinor: balanceAfter,
          currency: wallet.currency,
          relatedAdjustmentId: adj.id,
          initiatedByUserId: validInitiatorId,
          approvedByUserId: validApproverId,
          reason: `Approved adjustment: ${adj.reason}`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: validApproverId,
          agencyId: adj.agencyId,
          action: "WALLET_ADJUSTMENT_APPROVED",
          resourceType: "WALLET_ADJUSTMENT",
          resourceId: adj.id,
          outcome: "SUCCESS",
          reason: `Approved ${adj.type} of $${(adj.amountMinor / 100).toFixed(2)} under Maker-Checker rules`,
        },
      });

      return { transactionReference: ref, availableBalanceMinor: balanceAfter };
    }, { maxWait: 15000, timeout: 25000 });
  }
}
