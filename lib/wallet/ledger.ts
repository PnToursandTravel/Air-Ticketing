import { Currency, WalletLedgerEntry } from "@/types";

// In-memory persistent ledger storage for mock / demonstration
const ledgerEntries: WalletLedgerEntry[] = [
  {
    id: "wled_init_001",
    walletId: "wallet_agency_01",
    type: "DEPOSIT",
    amountMinor: 500000, // $5,000.00
    balanceBeforeMinor: 0,
    balanceAfterMinor: 500000,
    currency: "USD",
    description: "Initial agency prepaid deposit via Bank Wire",
    actorId: "usr_finance_01",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "wled_init_002",
    walletId: "wallet_agency_01",
    type: "BOOKING_DEBIT",
    amountMinor: -62000, // -$620.00
    balanceBeforeMinor: 500000,
    balanceAfterMinor: 438000,
    currency: "USD",
    bookingReference: "PN48291",
    description: "Flight booking payment for EBB-DXB (PNR: PN48291)",
    actorId: "usr_agent_01",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export class WalletService {
  static getWalletBalance(walletId: string): { balanceMinor: number; currency: Currency } {
    const entries = ledgerEntries.filter((e) => e.walletId === walletId);
    if (entries.length === 0) {
      return { balanceMinor: 0, currency: "USD" };
    }
    const latest = entries[entries.length - 1];
    return { balanceMinor: latest.balanceAfterMinor, currency: latest.currency };
  }

  static getLedger(walletId: string): WalletLedgerEntry[] {
    return ledgerEntries
      .filter((e) => e.walletId === walletId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static recordDeposit(
    walletId: string,
    amountMinor: number,
    actorId: string,
    description: string,
    currency: Currency = "USD"
  ): WalletLedgerEntry {
    if (amountMinor <= 0) throw new Error("Deposit amount must be positive");
    const { balanceMinor } = this.getWalletBalance(walletId);
    const balanceAfterMinor = balanceMinor + amountMinor;

    const entry: WalletLedgerEntry = {
      id: `wled_${Math.random().toString(36).substring(2, 9)}`,
      walletId,
      type: "DEPOSIT",
      amountMinor,
      balanceBeforeMinor: balanceMinor,
      balanceAfterMinor,
      currency,
      description,
      actorId,
      createdAt: new Date().toISOString(),
    };

    ledgerEntries.push(entry);
    return entry;
  }

  static recordDebitForBooking(
    walletId: string,
    amountMinor: number,
    bookingReference: string,
    actorId: string
  ): WalletLedgerEntry {
    if (amountMinor <= 0) throw new Error("Debit amount must be positive");
    const { balanceMinor, currency } = this.getWalletBalance(walletId);
    if (balanceMinor < amountMinor) {
      throw new Error(`Insufficient wallet funds. Current balance: ${balanceMinor}, required: ${amountMinor}`);
    }

    const balanceAfterMinor = balanceMinor - amountMinor;

    const entry: WalletLedgerEntry = {
      id: `wled_${Math.random().toString(36).substring(2, 9)}`,
      walletId,
      type: "BOOKING_DEBIT",
      amountMinor: -amountMinor,
      balanceBeforeMinor: balanceMinor,
      balanceAfterMinor,
      currency,
      bookingReference,
      description: `Flight ticket issuance payment for reference #${bookingReference}`,
      actorId,
      createdAt: new Date().toISOString(),
    };

    ledgerEntries.push(entry);
    return entry;
  }

  static recordManualAdjustment(
    walletId: string,
    amountMinor: number, // can be positive (credit) or negative (debit)
    reason: string,
    actorId: string
  ): WalletLedgerEntry {
    if (!reason || reason.trim().length < 5) {
      throw new Error("A detailed audit reason is mandatory for manual adjustments");
    }

    const { balanceMinor, currency } = this.getWalletBalance(walletId);
    const balanceAfterMinor = balanceMinor + amountMinor;
    if (balanceAfterMinor < 0) {
      throw new Error("Manual adjustment would result in a negative wallet balance");
    }

    const entry: WalletLedgerEntry = {
      id: `wled_adj_${Math.random().toString(36).substring(2, 9)}`,
      walletId,
      type: "MANUAL_ADJUSTMENT",
      amountMinor,
      balanceBeforeMinor: balanceMinor,
      balanceAfterMinor,
      currency,
      description: `Manual adjustment by admin: ${reason}`,
      actorId,
      createdAt: new Date().toISOString(),
    };

    ledgerEntries.push(entry);
    return entry;
  }
}
