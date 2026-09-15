import { prisma } from "@/lib/db/prisma";
import { WalletService } from "@/lib/wallet/wallet-service";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export class AgencyService {
  /**
   * Generates a readable application tracking reference: PN-APP-XXXXXXXX
   */
  static generateTrackingId(): string {
    const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `PN-APP-${rand}`;
  }

  /**
   * Generates a readable agency reference: PN-AGY-XXXXXXXX
   */
  static generateAgencyReference(): string {
    const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `PN-AGY-${rand}`;
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
   * Submits a new agency accreditation application.
   */
  static async submitApplication(data: {
    agencyLegalName: string;
    agencyTradeName: string;
    registrationNumber: string;
    taxId?: string;
    iataNumber?: string;
    tidsNumber?: string;
    licenseNumber: string;
    officialEmail: string;
    businessPhone: string;
    address: string;
    country?: string;
    website?: string;
    primaryContact: {
      fullName: string;
      position: string;
      email: string;
      phone: string;
    };
  }) {
    const trackingId = this.generateTrackingId();
    const verificationToken = crypto.randomBytes(24).toString("hex");

    return await prisma.$transaction(async (tx) => {
      const app = await tx.agencyApplication.create({
        data: {
          trackingId,
          agencyLegalName: data.agencyLegalName,
          agencyTradeName: data.agencyTradeName,
          registrationNumber: data.registrationNumber,
          taxId: data.taxId || null,
          iataNumber: data.iataNumber || null,
          tidsNumber: data.tidsNumber || null,
          licenseNumber: data.licenseNumber,
          officialEmail: data.officialEmail.trim().toLowerCase(),
          businessPhone: data.businessPhone,
          address: data.address,
          country: data.country || "Uganda",
          website: data.website || null,
          status: "SUBMITTED",
          verificationToken,
          isEmailVerified: false,
          contacts: {
            create: {
              fullName: data.primaryContact.fullName,
              position: data.primaryContact.position,
              email: data.primaryContact.email.trim().toLowerCase(),
              phone: data.primaryContact.phone,
            },
          },
        },
        include: {
          contacts: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "AGENCY_APPLICATION_SUBMITTED",
          resourceType: "AGENCY_APPLICATION",
          resourceId: app.id,
          outcome: "SUCCESS",
          reason: `Agency ${data.agencyTradeName} submitted application with tracking ${trackingId}`,
        },
      });

      return {
        trackingId: app.trackingId,
        applicationId: app.id,
        verificationToken,
      };
    });
  }

  /**
   * Approves an agency application, provisions an agency record, zero-balance wallet,
   * and agency owner user with Supabase Auth invitation.
   */
  static async approveApplication(applicationId: string, reviewerUserId: string) {
    return await prisma.$transaction(async (tx) => {
      const app = await tx.agencyApplication.findUnique({
        where: { id: applicationId },
        include: { contacts: true },
      });

      if (!app) {
        throw new Error("APPLICATION_NOT_FOUND: Application does not exist.");
      }

      if (app.status === "APPROVED") {
        throw new Error("APPLICATION_ALREADY_APPROVED: This application has already been processed.");
      }

      const agencyRef = this.generateAgencyReference();
      const primaryContact = app.contacts[0];
      const ownerEmail = (primaryContact?.email || app.officialEmail).trim().toLowerCase();
      const ownerName = primaryContact?.fullName || app.agencyTradeName;

      // 1. Create Agency
      const agency = await tx.agency.create({
        data: {
          reference: agencyRef,
          name: app.agencyTradeName,
          legalName: app.agencyLegalName,
          companyRegNumber: app.registrationNumber,
          iataNumber: app.iataNumber,
          tidsNumber: app.tidsNumber,
          licenseNumber: app.licenseNumber,
          contactEmail: app.officialEmail,
          contactPhone: app.businessPhone,
          address: app.address,
          country: app.country,
          status: "ACTIVE",
          walletBalanceMinor: 0,
          heldBalanceMinor: 0,
          currency: "USD",
        },
      });

      // 2. Create Zero-Balance Wallet
      const wallet = await tx.wallet.create({
        data: {
          agencyId: agency.id,
          currency: "USD",
          availableBalanceMinor: 0,
          heldBalanceMinor: 0,
          status: "ACTIVE",
        },
      });

      // 3. Provision Agency Owner in Supabase Auth and Prisma
      let authUserId: string | null = null;
      try {
        const supabaseAdmin = createAdminClient();
        const { data: authData } = await supabaseAdmin.auth.admin.inviteUserByEmail(ownerEmail, {
          data: {
            name: ownerName,
            agencyId: agency.id,
            role: "AGENCY_OWNER",
          },
        });
        if (authData?.user) {
          authUserId = authData.user.id;
        }
      } catch (err: any) {
        console.warn("[Agency Approve] Supabase Auth invite note:", err.message);
      }

      const ownerUser = await tx.user.upsert({
        where: { email: ownerEmail },
        update: {
          name: ownerName,
          role: "AGENT_OWNER",
          agencyId: agency.id,
          status: "ACTIVE",
          isActive: true,
        },
        create: {
          id: authUserId || undefined,
          email: ownerEmail,
          name: ownerName,
          role: "AGENT_OWNER",
          agencyId: agency.id,
          status: "ACTIVE",
          isActive: true,
        },
      });

      // 4. Assign AgencyMember record
      await tx.agencyMember.create({
        data: {
          agencyId: agency.id,
          userId: ownerUser.id,
          role: "AGENCY_OWNER",
          status: "ACTIVE",
        },
      });

      // 5. Update Application Status
      await tx.agencyApplication.update({
        where: { id: app.id },
        data: {
          status: "APPROVED",
          statusReason: `Approved by reviewer ${reviewerUserId}`,
        },
      });

      // 6. Audit Log
      const validReviewerId = await this.resolveValidUserId(reviewerUserId, tx);
      await tx.auditLog.create({
        data: {
          actorUserId: validReviewerId,
          agencyId: agency.id,
          action: "AGENCY_APPLICATION_APPROVED",
          resourceType: "AGENCY",
          resourceId: agency.id,
          outcome: "SUCCESS",
          reason: `Approved application ${app.trackingId}. Created agency ${agency.reference} and wallet ${wallet.id}`,
        },
      });

      return {
        agencyId: agency.id,
        agencyReference: agency.reference,
        ownerEmail,
        status: "APPROVED",
      };
    }, { maxWait: 15000, timeout: 25000 });
  }

  /**
   * Suspends an agency from active booking/ticketing operations.
   */
  static async suspendAgency(agencyId: string, reason: string, actorUserId: string) {
    return await prisma.$transaction(async (tx) => {
      const validActorId = await this.resolveValidUserId(actorUserId, tx);
      const agency = await tx.agency.update({
        where: { id: agencyId },
        data: { status: "SUSPENDED" },
      });

      await tx.wallet.updateMany({
        where: { agencyId },
        data: { status: "SUSPENDED" },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: validActorId,
          agencyId,
          action: "AGENCY_SUSPENDED",
          resourceType: "AGENCY",
          resourceId: agencyId,
          outcome: "SUCCESS",
          reason,
        },
      });

      return agency;
    });
  }

  /**
   * Reactivates a suspended agency.
   */
  static async reactivateAgency(agencyId: string, reason: string, actorUserId: string) {
    return await prisma.$transaction(async (tx) => {
      const validActorId = await this.resolveValidUserId(actorUserId, tx);
      const agency = await tx.agency.update({
        where: { id: agencyId },
        data: { status: "ACTIVE" },
      });

      await tx.wallet.updateMany({
        where: { agencyId },
        data: { status: "ACTIVE" },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: validActorId,
          agencyId,
          action: "AGENCY_REACTIVATED",
          resourceType: "AGENCY",
          resourceId: agencyId,
          outcome: "SUCCESS",
          reason,
        },
      });

      return agency;
    });
  }
}
