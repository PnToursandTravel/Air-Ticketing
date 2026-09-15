# Prepaid Wallet & Flight Booking Workflows

## 1. Prepaid Wallet Architecture
- **Financial Precision**: All monetary values are strictly represented in integer minor units (`amountMinor Int`, e.g. `$500.00` = `50000`). Zero floating-point arithmetic.
- **Append-Only Ledger**: Every balance mutation appends an immutable `WalletLedgerEntry` record containing transaction reference (`PN-WTX-XXXXXXXX`), before/after balance snapshots, actor user ID, and audit details.
- **Concurrency & Idempotency**: Atomic Prisma transactions (`prisma.$transaction`) with `IdempotencyKey` ensure that network retries never produce duplicate charges or double credits.

## 2. Booking Lifecycle & Atomic Funds Hold
1. **Search & Quote**: User searches itineraries and locks in a fare quote with an expiration timestamp (`PN-QTE-XXXXXXXX`).
2. **Reservation with Hold**:
   - Platform checks that agency's `availableBalanceMinor >= totalAmountMinor`.
   - Atomically decrements `availableBalanceMinor` and increments `heldBalanceMinor`.
   - Records ledger entry with type `BOOKING_HOLD`.
   - Creates booking with status `FUNDS_HELD` (`PN-BKG-XXXXXXXX`).
3. **Ticketing & Capture**:
   - Authorized ticketing agent issues ticket via provider.
   - Atomically captures hold by decrementing `heldBalanceMinor`.
   - Appends ledger entry with type `BOOKING_CAPTURE`.
   - Generates tax invoice (`PN-INV-XXXXXXXX`).
   - Booking marked `TICKETED`.
4. **Provider Failure / Void / Cancellation**:
   - If supplier fails or booking is voided, `WalletService.releaseHold()` is invoked.
   - Held funds return to `availableBalanceMinor`.
   - Appends ledger entry with type `BOOKING_RELEASE`.

## 3. Funding & Maker-Checker Workflows
1. **Agency Top-Up**: Agency submits top-up request (`PN-FND-XXXXXXXX`) with optional wire receipt.
2. **Finance Review**: Finance Officer reviews bank settlement and approves funding, executing `WalletService.creditWallet()`.
3. **Adjustments**:
   - Officer A initiates credit/debit adjustment (`PN-ADJ-XXXXXXXX`).
   - Officer B (separate user) reviews and approves under Maker-Checker rules.
