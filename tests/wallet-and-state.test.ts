import { describe, it, expect } from "vitest";
import { WalletService } from "@/lib/wallet/ledger";
import { BookingService } from "@/lib/bookings/booking-service";
import { BookingStatus } from "@/types";

describe("Prepaid Agency Wallet & Ledger Integrity", () => {
  const testWalletId = `test_wallet_${Date.now()}`;

  it("initializes an empty wallet with zero balance", () => {
    const { balanceMinor } = WalletService.getWalletBalance(testWalletId);
    expect(balanceMinor).toBe(0);
  });

  it("records a deposit and updates balance accurately", () => {
    const entry = WalletService.recordDeposit(
      testWalletId,
      200000, // $2,000.00
      "usr_finance",
      "Test Wire Transfer"
    );
    expect(entry.balanceBeforeMinor).toBe(0);
    expect(entry.balanceAfterMinor).toBe(200000);

    const current = WalletService.getWalletBalance(testWalletId);
    expect(current.balanceMinor).toBe(200000);
  });

  it("deducts booking payment atomically from wallet", () => {
    const debit = WalletService.recordDebitForBooking(
      testWalletId,
      50000, // $500.00
      "PN-998811",
      "usr_agent"
    );
    expect(debit.amountMinor).toBe(-50000);
    expect(debit.balanceAfterMinor).toBe(150000);

    const current = WalletService.getWalletBalance(testWalletId);
    expect(current.balanceMinor).toBe(150000);
  });

  it("rejects booking debit when funds are insufficient", () => {
    expect(() => {
      WalletService.recordDebitForBooking(
        testWalletId,
        99999999, // exceed balance
        "PN-OVERFLOW",
        "usr_agent"
      );
    }).toThrow(/Insufficient wallet funds/);
  });

  it("requires an audit reason for manual adjustments", () => {
    expect(() => {
      WalletService.recordManualAdjustment(testWalletId, 1000, "", "usr_admin");
    }).toThrow(/detailed audit reason is mandatory/);
  });
});

describe("Booking State Machine Transitions", () => {
  it("allows valid transitions through the booking lifecycle", () => {
    expect(BookingService.validateTransition("PENDING_PAYMENT", "PAYMENT_CONFIRMED")).toBe(true);
    expect(BookingService.validateTransition("PAYMENT_CONFIRMED", "TICKETING_PENDING")).toBe(true);
    expect(BookingService.validateTransition("TICKETING_PENDING", "TICKETED")).toBe(true);
  });

  it("rejects illegal transitions that bypass payment or ticketing checks", () => {
    expect(BookingService.validateTransition("DRAFT", "TICKETED")).toBe(false);
    expect(BookingService.validateTransition("PENDING_PAYMENT", "TICKETED")).toBe(false);
    expect(BookingService.validateTransition("SOLD_OUT", "TICKETED")).toBe(false);
  });
});
