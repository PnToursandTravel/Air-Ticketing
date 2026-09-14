# Production Go-Live Checklist — PN Tours and Travel

Before marking this platform as commercially live for the public, complete and verify the following operational gates:

## 1. Flight Supplier & Accreditation
- [ ] Commercial agreement with GDS/NDC consolidator (e.g. Amadeus, Sabre, Travelport, Duffel, or certified airline NDC).
- [ ] Valid IATA Accreditation / TIDS / BSP credentials verified.
- [ ] Sandbox end-to-end booking and ticketing test completed with live aggregator.
- [ ] Supplier production API credentials placed in cloud secret manager (AWS Secrets Manager / Vault / Vercel Encrypted Secrets).
- [ ] Circuit breaker threshold and supplier timeout configured (default: 8000ms).

## 2. Payment Gateway Activation
- [ ] Merchant production account active (Flutterwave / Stripe / Pesapal).
- [ ] Webhook signature secret set in production environment variables.
- [ ] Real card and Mobile Money 3D-Secure charge test passed with nominal amount ($1 or UGX 5,000).
- [ ] Refund webhook replay and idempotency verified.

## 3. Security & Infrastructure
- [ ] HTTPS enforced with valid TLS certificate (HSTS enabled).
- [ ] Database backups configured with automated daily snapshots and point-in-time recovery (PITR).
- [ ] Rate limiting enabled on `/api/v1/flights/search`, `/api/v1/auth/login`, and `/api/v1/bookings`.
- [ ] All default demo passwords removed / rotated from database seed.
- [ ] Content Security Policy (CSP) and strict security headers active.

## 4. Compliance & Customer Support
- [ ] Terms and Conditions, Flight Cancellation/Refund Policies published and linked in checkout.
- [ ] Customer support telephone line (`+256 785360444`) active and staffed.
- [ ] Support email (`support@pntoursandtravel.com`) configured with DKIM/SPF/DMARC.
- [ ] PII retention and data deletion procedure documented.
