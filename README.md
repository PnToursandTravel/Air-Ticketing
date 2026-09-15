# PN Tours & Travel — Enterprise B2B Air Ticketing Platform

> Enterprise-grade, provider-agnostic B2B travel platform for **PN Tours and Travel**, featuring accredited agency onboarding, prepaid wallet management, atomic flight booking holds/captures, compliance review, and internal operations administration.

---

## 1. System Architecture & Core Portals

The platform is structured into three connected but strictly separated areas:

### A. Public Website (`/`, `/agency-applications`)
- **Retail Flight Search**: Flight search across global carriers (Emirates, Uganda Airlines, Qatar Airways, KLM, Kenya Airways, Ethiopian Airlines, etc.).
- **Agency Accreditation Application**: Full onboarding pipeline for accredited travel agencies with company registration, IATA/TIDS, and operating license details.
- **Application Tracking**: Secure tracking via readable tracking ID (`PN-APP-XXXXXXXX`).
- **Strict Boundary**: Public users cannot access agency dashboards, wallet ledgers, or internal consoles.

### B. Agency B2B Portal (`/agent`, `/agency-login`)
- **Accredited Sign-In**: Dedicated login with tenant isolation.
- **Prepaid Wallet & Append-Only Ledger**: All financial arithmetic in integer minor units (`amountMinor Int`). Zero floating-point rounding errors.
- **Atomic Booking Holds & Captures**: Balance is atomically held on booking quote, captured on ticket issuance, and released on cancellation.
- **Funding Top-Up Requests**: Submission of wire/mobile money deposits with proof of payment attachment (`PN-FND-XXXXXXXX`).
- **Multi-Tenant Isolation**: Agency A is cryptographically and logically isolated from Agency B.

### C. Internal Operations Console (`/admin`, `/staff-login`)
- **Accreditation & Compliance Review**: Review agency applications, verify submitted documents, and approve agencies.
- **Zero-Balance Agency Provisioning**: Approving an agency atomically creates the Agency record (`PN-AGY-XXXXXXXX`), initial zero-balance Wallet, and invites the Agency Owner via Supabase Auth.
- **Maker-Checker Financial Approvals**: High-value adjustments require two distinct finance officers (initiator cannot self-approve).
- **Agency Lifecycle**: Audit-logged agency suspension and reactivation.
- **Immutable Audit Trail**: Paginated inspection of audit logs covering authentication, wallet mutations, and ticket issuance.

---

## 2. Technology Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript.
- **Database**: Supabase PostgreSQL on AWS EU-West-1.
- **ORM**: Prisma ORM 5.22.
- **Security & RBAC**: Row Level Security (RLS) enabled on all 35 tables; server-side granular permissions engine.
- **Authentication**: Supabase Auth (Email/Password, Session Cookies, TOTP MFA).
- **Storage**: Supabase Storage with private buckets and short-lived signed URLs.
- **Testing**: Vitest unit & integration test suite (31 tests passed).
- **Deployment**: Vercel-ready with automated build script.

---

## 3. Quick Start & Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation & Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Push schema to Supabase PostgreSQL (if needed)
npx prisma db push

# 3. Seed roles and permissions matrix
npx tsx prisma/seed-roles.ts

# 4. Verify TypeScript compilation
npm run typecheck

# 5. Run full test suite
npm test

# 6. Build production bundle
npm run build

# 7. Start server
npm run dev
```

---

## 4. Super Admin Bootstrap CLI

To provision the initial Super Admin user without exposing credentials:
```bash
export INITIAL_SUPER_ADMIN_EMAIL="admin@pntoursandtravel.com"
export INITIAL_SUPER_ADMIN_NAME="Denis Ayiko (Super Admin)"
export INITIAL_SUPER_ADMIN_PASSWORD="Your-Secure-16-Character-Password!"

npm run bootstrap:super-admin
```
The command provisions the user in Supabase Auth, links the Prisma User record, assigns the `SUPER_ADMIN` role, writes an immutable audit record, and refuses duplicate executions.

---

## 5. Documentation Directory

- [API Reference](file:///c:/Users/ayiko/Desktop/PntoursandTravel%20air%20Ticketing/docs/API.md)
- [RBAC & Tenant Isolation](file:///c:/Users/ayiko/Desktop/PntoursandTravel%20air%20Ticketing/docs/RBAC.md)
- [Prepaid Wallet & Booking Workflows](file:///c:/Users/ayiko/Desktop/PntoursandTravel%20air%20Ticketing/docs/WALLET_AND_BOOKING_WORKFLOWS.md)
- [Supabase Configuration Guide](file:///c:/Users/ayiko/Desktop/PntoursandTravel%20air%20Ticketing/docs/SUPABASE_SETUP.md)
- [Deployment Runbook](file:///c:/Users/ayiko/Desktop/PntoursandTravel%20air%20Ticketing/docs/DEPLOYMENT.md)
