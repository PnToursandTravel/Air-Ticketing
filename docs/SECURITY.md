# Security Architecture & Controls — PN Tours and Travel

## 1. Threat Model & Asset Classification

The platform manages high-value financial assets (agent wallets, booking funds) and sensitive traveler Personally Identifiable Information (PII) including passport numbers, birth dates, full legal names, and contact details.

### Security Guarantees
1. **PCI-DSS Compliance**: No raw credit card primary account numbers (PAN), CVVs, or cardholder credentials touch our servers. Checkout relies strictly on hosted payment fields / tokenized provider intents.
2. **PII Masking & Protection**: Passports and dates of birth are encrypted at rest and masked in support dashboards.
3. **Session & Token Security**: Authentication tokens are stored exclusively in HTTP-only, `SameSite=Lax` (or `Strict`), `Secure` cookies. Browser scripts cannot read authentication secrets.
4. **Idempotency Keys**: All financial operations (wallet debits, payment captures, ticket issuance triggers, refund approvals) require an `Idempotency-Key` HTTP header to prevent duplicate debits from network retries.
5. **Zero Secret Leakage**: API secrets, database passwords, and supplier tokens are excluded from Git, front-end client bundles, and error log dumps.

---

## 2. Role-Based Authorization & Object-Level Checks

Authorization is enforced at both route middleware and domain service layers:
- An Agent cannot view, query, or book on behalf of another agency (`agency_id` object check).
- A Customer cannot view another traveler's booking without matching booking reference and verified email.
- Financial adjustments require the `FINANCE` or `SUPER_ADMIN` role with an immutable audit log reason.

---

## 3. Rate Limiting & Abuse Prevention

- `POST /api/v1/flights/search`: 30 requests / min per IP.
- `POST /api/v1/auth/login`: 5 attempts / 5 mins per IP with lockout.
- `POST /api/v1/bookings`: 10 requests / min per user session.
