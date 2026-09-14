# Operations & Runbooks — PN Tours and Travel

## 1. Ticketing Lifecycle & Failure Handling

When a customer or agent pays for a flight, payment success does NOT immediately guarantee ticket issuance. The lifecycle follows strict state machine transitions:

```
[ PAYMENT_CONFIRMED ]
         │
         ▼
[ TICKETING_PENDING ] ──────► Background Ticketing Job (Idempotent)
         │                                   │
         ├─── Provider Success ──────────────▼────► [ TICKETED ] (PNR + e-Ticket issued)
         │
         └─── Provider Error / Outage ───────► [ TICKETING_FAILED ]
                                                     │
                                                     ▼
                                          Operations Incident Alert
                                        (Manual retry or Void/Refund)
```

### Runbook: Handling `TICKETING_FAILED`
1. Access Admin Portal at `/admin/bookings`.
2. Filter status by `TICKETING_FAILED`.
3. Inspect `supplier_api_logs` attached to the booking to identify the failure reason (e.g. fare expired, seat class closed, supplier timeout).
4. **Action Options**:
   - **Retry Issuance**: Click `Retry Ticketing` if the supplier experienced a transient network glitch.
   - **Alternative Booking**: Re-book passenger on matching cabin/fare.
   - **Customer Refund**: Click `Initiate Refund` to reverse the payment transaction cleanly back to the customer's payment source or agent wallet.

---

## 2. Wallet Ledger Reconciliation

1. The wallet balance of an agency equals:
   $$\text{Current Balance} = \sum \text{DEPOSITS} + \sum \text{REFUND\_CREDITS} - \sum \text{BOOKING\_DEBITS} \pm \sum \text{ADJUSTMENTS}$$
2. Reconcile ledger integrity weekly using the automated ledger audit job.
3. Every manual adjustment requires `approved_by_user_id` and a detailed textual reason.
