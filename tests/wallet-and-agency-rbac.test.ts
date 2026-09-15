import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { WalletService } from "@/lib/wallet/wallet-service";
import { AgencyService } from "@/lib/agency/agency-service";
import { IdempotencyService } from "@/lib/security/idempotency";

describe("Wallet Engine & Financial Integrity Tests", () => {
  let testAgencyId: string;
  const testActorId = "test-user-system";

  beforeAll(async () => {
    // Create a temporary test agency
    const testAgency = await prisma.agency.create({
      data: {
        reference: `PN-AGY-TEST-${Date.now()}`,
        name: "Test Financial Agency Ltd",
        contactEmail: `finance-test-${Date.now()}@pntoursandtravel.com`,
        contactPhone: "+256 700000000",
        status: "ACTIVE",
        walletBalanceMinor: 0,
        currency: "USD",
      },
    });
    testAgencyId = testAgency.id;
  });

  afterAll(async () => {
    // Clean up test agency and records
    if (testAgencyId) {
      await prisma.walletLedgerEntry.deleteMany({ where: { agencyId: testAgencyId } });
      await prisma.walletFundingRequest.deleteMany({ where: { agencyId: testAgencyId } });
      await prisma.walletAdjustment.deleteMany({ where: { agencyId: testAgencyId } });
      await prisma.wallet.deleteMany({ where: { agencyId: testAgencyId } });
      await prisma.agency.deleteMany({ where: { id: testAgencyId } });
    }
  });

  it("creates or fetches a zero-balance wallet safely", async () => {
    const wallet = await WalletService.getOrCreateWallet(testAgencyId);
    expect(wallet).toBeDefined();
    expect(wallet.agencyId).toBe(testAgencyId);
    expect(wallet.availableBalanceMinor).toBe(0);
    expect(wallet.heldBalanceMinor).toBe(0);
  });

  it("credits agency wallet with minor integer amounts and creates append-only ledger entry", async () => {
    const creditAmountMinor = 50000; // $500.00
    const result = await WalletService.creditWallet(
      testAgencyId,
      creditAmountMinor,
      "Bank wire deposit credit",
      testActorId
    );

    expect(result.availableBalanceMinor).toBe(50000);
    expect(result.transactionReference).toMatch(/^PN-WTX-/);

    // Verify ledger entry
    const ledger = await prisma.walletLedgerEntry.findFirst({
      where: { transactionReference: result.transactionReference },
    });
    expect(ledger).not.toBeNull();
    expect(ledger?.amountMinor).toBe(50000);
    expect(ledger?.type).toBe("CREDIT");
    expect(ledger?.balanceBeforeMinor).toBe(0);
    expect(ledger?.balanceAfterMinor).toBe(50000);
  });

  it("rejects funds hold if available balance is insufficient", async () => {
    const excessiveAmountMinor = 100000; // $1,000.00 (available is only $500)
    await expect(
      WalletService.holdFunds(testAgencyId, excessiveAmountMinor, "PN-BKG-FAIL-01", testActorId)
    ).rejects.toThrow(/INSUFFICIENT_FUNDS/);
  });

  it("successfully creates an atomic funds hold and updates available and held balances", async () => {
    const holdAmountMinor = 20000; // $200.00
    const hold = await WalletService.holdFunds(
      testAgencyId,
      holdAmountMinor,
      "PN-BKG-SUCCESS-01",
      testActorId
    );

    expect(hold.availableBalanceMinor).toBe(30000); // 50000 - 20000
    expect(hold.heldBalanceMinor).toBe(20000);

    const wallet = await WalletService.getOrCreateWallet(testAgencyId);
    expect(wallet.availableBalanceMinor).toBe(30000);
    expect(wallet.heldBalanceMinor).toBe(20000);
  });

  it("captures previously held funds when ticket is issued", async () => {
    const capture = await WalletService.captureHold(
      testAgencyId,
      20000,
      "PN-BKG-SUCCESS-01",
      "076-1234567890",
      testActorId
    );

    expect(capture.heldBalanceMinor).toBe(0);

    const wallet = await WalletService.getOrCreateWallet(testAgencyId);
    expect(wallet.availableBalanceMinor).toBe(30000);
    expect(wallet.heldBalanceMinor).toBe(0);
  });

  it("releases held funds back to available balance when booking fails or cancels", async () => {
    // 1. Hold $100
    await WalletService.holdFunds(testAgencyId, 10000, "PN-BKG-RELEASE-01", testActorId);
    let wallet = await WalletService.getOrCreateWallet(testAgencyId);
    expect(wallet.availableBalanceMinor).toBe(20000);
    expect(wallet.heldBalanceMinor).toBe(10000);

    // 2. Release hold
    await WalletService.releaseHold(
      testAgencyId,
      10000,
      "PN-BKG-RELEASE-01",
      "Provider reservation timeout",
      testActorId
    );

    wallet = await WalletService.getOrCreateWallet(testAgencyId);
    expect(wallet.availableBalanceMinor).toBe(30000);
    expect(wallet.heldBalanceMinor).toBe(0);
  });

  it("enforces Maker-Checker constraint on wallet adjustments", async () => {
    const initiatorId = "officer-finance-alice";
    const approverId = "officer-finance-bob";

    // 1. Create adjustment
    const adj = await prisma.walletAdjustment.create({
      data: {
        reference: `PN-ADJ-${Date.now()}`,
        agencyId: testAgencyId,
        type: "CREDIT",
        amountMinor: 15000,
        currency: "USD",
        reason: "Commercial credit voucher",
        status: "PENDING_APPROVAL",
        initiatedByUserId: initiatorId,
      },
    });

    // 2. Initiator trying to approve their own adjustment must FAIL
    await expect(
      WalletService.approveAdjustment(adj.id, initiatorId)
    ).rejects.toThrow(/MAKER_CHECKER_VIOLATION/);

    // 3. Independent second officer approving must SUCCEED
    const approved = await WalletService.approveAdjustment(adj.id, approverId);
    expect(approved.availableBalanceMinor).toBe(45000); // 30000 + 15000
  });
});

describe("Idempotency Service Tests", () => {
  it("executes operation and caches result for subsequent identical requests", async () => {
    const testKey = `test-idemp-${Date.now()}`;
    const payload = { amount: 100, currency: "USD" };
    let executionCount = 0;

    const op = async () => {
      executionCount++;
      return { data: { success: true, count: executionCount }, statusCode: 200 };
    };

    // First run: executes operation
    const res1 = await IdempotencyService.run(testKey, "TEST_ACTION", payload, "test-user", op);
    expect(res1.cached).toBe(false);
    expect(res1.data.count).toBe(1);

    // Second run with same key: returns cached result without re-executing
    const res2 = await IdempotencyService.run(testKey, "TEST_ACTION", payload, "test-user", op);
    expect(res2.cached).toBe(true);
    expect(res2.data.count).toBe(1);
    expect(executionCount).toBe(1); // Not called again!

    // Cleanup
    await prisma.idempotencyKey.deleteMany({ where: { key: testKey } });
  });

  it("rejects request if idempotency key is reused with a different payload", async () => {
    const testKey = `test-conflict-${Date.now()}`;
    const payloadA = { bookingId: "PN-BKG-01" };
    const payloadB = { bookingId: "PN-BKG-02" }; // Changed payload!

    await IdempotencyService.run(testKey, "BOOKING_MUTATION", payloadA, "user-1", async () => ({
      data: { created: true },
    }));

    await expect(
      IdempotencyService.run(testKey, "BOOKING_MUTATION", payloadB, "user-1", async () => ({
        data: { created: true },
      }))
    ).rejects.toThrow(/IDEMPOTENCY_CONFLICT/);

    // Cleanup
    await prisma.idempotencyKey.deleteMany({ where: { key: testKey } });
  });
});

describe("Agency Onboarding & Application Lifecycle Tests", () => {
  let createdTrackingId: string;
  let createdAppId: string;

  it("submits a comprehensive agency application and generates readable tracking reference", async () => {
    const appData = {
      agencyLegalName: "Victoria Nile Expeditions & Travel Ltd",
      agencyTradeName: "Nile Expeditions",
      registrationNumber: "UG-REG-8921849",
      licenseNumber: "UTB-LIC-2026-991",
      officialEmail: `nile.travel.${Date.now()}@example.com`,
      businessPhone: "+256 414 000111",
      address: "Plot 42 Jinja Road, Kampala",
      primaryContact: {
        fullName: "Patrick Okello",
        position: "Managing Director",
        email: `patrick.okello.${Date.now()}@example.com`,
        phone: "+256 772 111222",
      },
    };

    const res = await AgencyService.submitApplication(appData);
    expect(res.trackingId).toMatch(/^PN-APP-/);
    createdTrackingId = res.trackingId;
    createdAppId = res.applicationId;

    const dbApp = await prisma.agencyApplication.findUnique({
      where: { trackingId: res.trackingId },
      include: { contacts: true },
    });
    expect(dbApp).not.toBeNull();
    expect(dbApp?.status).toBe("SUBMITTED");
    expect(dbApp?.contacts.length).toBe(1);
  });

  it("approves application, creates Agency, Wallet, and Agency Owner user", async () => {
    const approved = await AgencyService.approveApplication(createdAppId, "admin-reviewer-id");
    expect(approved.status).toBe("APPROVED");
    expect(approved.agencyReference).toMatch(/^PN-AGY-/);

    // Verify agency created in DB
    const agency = await prisma.agency.findUnique({
      where: { id: approved.agencyId },
      include: { wallet: true },
    });
    expect(agency).not.toBeNull();
    expect(agency?.status).toBe("ACTIVE");
    expect(agency?.wallet).not.toBeNull();
    expect(agency?.wallet?.availableBalanceMinor).toBe(0);

    // Clean up
    await prisma.wallet.deleteMany({ where: { agencyId: approved.agencyId } });
    await prisma.agencyMember.deleteMany({ where: { agencyId: approved.agencyId } });
    await prisma.agency.deleteMany({ where: { id: approved.agencyId } });
    await prisma.agencyApplicationContact.deleteMany({ where: { applicationId: createdAppId } });
    await prisma.agencyApplication.deleteMany({ where: { id: createdAppId } });
  });
});
