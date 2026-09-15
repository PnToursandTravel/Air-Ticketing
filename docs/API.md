# PN Tours & Travel: Enterprise B2B API Reference

All endpoints are versioned under `/api/v1/`.

## Authentication & Session
- `POST /api/v1/auth/login`: Authenticates user credentials against database and role constraints. Returns session token in secure HTTP-only cookie.
- `POST /api/v1/auth/logout`: Clears session cookie and revokes session record in database.
- `GET  /api/v1/auth/me`: Returns current authenticated user profile.
- `GET  /api/v1/auth/session`: Returns authenticated context with granular RBAC permissions, agency status, and staff context.

## Agency Onboarding & Applications
- `POST /api/v1/agency-applications`: Public endpoint for accredited travel agencies to submit onboarding applications with legal entity details, IATA/TIDS, and primary contact. Generates `PN-APP-XXXXXXXX` tracking ID. Protected by Idempotency (`X-Idempotency-Key`).
- `GET  /api/v1/agency-applications/:trackingId`: Public tracking endpoint returning applicant-safe status without leaking internal staff review notes.

## Agency B2B Portal
- `GET  /api/v1/agency/wallet`: Returns authenticated agency's prepaid wallet balance, held funds, and recent ledger entries.
- `GET  /api/v1/agency/wallet/funding-requests`: Lists all top-up requests submitted by the agency.
- `POST /api/v1/agency/wallet/funding-requests`: Submits a new top-up request with payment method and proof of payment reference.
- `POST /api/v1/flights/search`: Searches flights through provider abstraction.
- `POST /api/v1/bookings`: Creates flight booking reservation with atomic wallet hold.
- `GET  /api/v1/bookings/:reference`: Retrieves booking details.

## Internal Operations Console
- `GET  /api/v1/admin/applications`: Lists all pending and processed agency applications (requires `agency.read`).
- `POST /api/v1/admin/applications/:id/approve`: Approves agency application, provisions `PN-AGY-XXXXXXXX`, zero-balance Wallet, and invites Agency Owner via Supabase Auth Admin. (Requires `agency.approve` + MFA).
- `GET  /api/v1/admin/agencies`: Lists accredited agencies, wallet summaries, and user rosters.
- `POST /api/v1/admin/agencies/:id/suspend`: Suspends agency from booking and funding operations. (Requires `agency.suspend` + MFA).
- `POST /api/v1/admin/agencies/:id/reactivate`: Restores suspended agency. (Requires `agency.reactivate` + MFA).
- `GET  /api/v1/admin/wallets`: Lists all agency wallets, available/held balances, and pending funding requests.
- `POST /api/v1/admin/wallets/:agencyId/credit`: Credits funds to agency wallet after wire verification. (Requires `wallet.credit` + MFA).
- `GET  /api/v1/admin/wallet-adjustments`: Lists manual adjustment requests.
- `POST /api/v1/admin/wallet-adjustments`: Initiates manual adjustment.
- `POST /api/v1/admin/wallet-adjustments/:id/approve`: Approves adjustment enforcing Maker-Checker separation (initiator cannot approve).
- `GET  /api/v1/admin/audit-logs`: Paginated inspection of immutable audit trail with actor, action, resource, and date filters.
- `GET  /api/v1/admin/settings`: Retrieves security and supplier configurations.
