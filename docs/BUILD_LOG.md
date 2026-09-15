# Build Log — PN Tours and Travel Air Ticketing Platform

All engineering milestones, architectural changes, testing results, and next actions are maintained in this living document.

---

## Milestone 0: Discovery, Foundation & Design System Setup
- **Date**: 2026-09-14
- **Status**: Completed
- **Completed Work**:
  - Researched specification requirements and inspected `DESIGN-Air.md`.
  - Created architectural documentation: `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/API_CONTRACT.md`, `docs/SECURITY.md`, `docs/OPERATIONS.md`, `docs/GO_LIVE_CHECKLIST.md`.
  - Defined design tokens, color palette, typography, and geometry following the institutional Coinbase aesthetic.
  - Formulated monorepo setup, environment variables configuration, and Docker containerization.
- **Files Created / Changed**:
  - `docs/ARCHITECTURE.md`
  - `docs/DECISIONS.md`
  - `docs/API_CONTRACT.md`
  - `docs/SECURITY.md`
  - `docs/OPERATIONS.md`
  - `docs/GO_LIVE_CHECKLIST.md`
  - `docs/BUILD_LOG.md`
  - `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.mjs`
  - `.env.example`, `Dockerfile`, `docker-compose.yml`
- **Assumptions**:
  - Operating currencies include USD, UGX, EUR, GBP, KES with auto/manual switcher and minor-unit arithmetic.
  - Agent wallet is enabled with append-only ledger; agent credit is disabled.

---

## Milestone 1: Flight Engine, Pricing & Double-Entry Ledger
- **Date**: 2026-09-14
- **Status**: Completed
- **Completed Work**:
  - Created normalized domain types in `types/index.ts`.
  - Implemented `lib/data/airports.ts` with comprehensive worldwide IATA airport dataset.
  - Created provider-agnostic flight search interface `IFlightProvider` and high-fidelity `MockFlightProvider` simulating Emirates, Uganda Airlines, Qatar Airways, KLM, British Airways, and Kenya Airways routes with layovers, baggage allowances, and live seat counts.
  - Implemented multi-tier pricing and markup engine in `lib/pricing/engine.ts` with precedence: Agent Specific > Route/Airline/Cabin > Global Default.
  - Implemented append-only transactional wallet ledger in `lib/wallet/ledger.ts`.
  - Implemented booking state machine (23 validated states) in `lib/bookings/booking-service.ts`.
- **Files Created**:
  - `types/index.ts`
  - `lib/data/airports.ts`
  - `lib/flights/provider-interface.ts`
  - `lib/flights/mock-provider.ts`
  - `lib/pricing/engine.ts`
  - `lib/wallet/ledger.ts`
  - `lib/bookings/booking-service.ts`
  - `lib/auth/session.ts`
  - `lib/utils.ts`

---

## Milestone 2: User Interfaces & Portals Adhering to DESIGN-Air.md
- **Date**: 2026-09-14
- **Status**: Completed
- **Completed Work**:
  - Created design system primitives in `components/ui/` (`Button.tsx`, `Badge.tsx`, `Card.tsx`, `TextInput.tsx`, `Navbar.tsx`, `Footer.tsx`).
  - Built `components/flights/AirportAutocomplete.tsx`, `components/flights/FlightSearchWidget.tsx`, `components/flights/FlightCard.tsx`, `components/flights/FareRulesModal.tsx`.
  - Built Customer Portal pages:
    - Homepage (`app/page.tsx`): Dark hero `#0a0b0d` with floating card mockups, search widget, and live results.
    - Checkout (`app/checkout/[bookingId]/page.tsx`): Passenger details, contact info, Card / Mobile Money / Bank Transfer payment selector.
    - Booking Confirmation (`app/booking/[reference]/page.tsx`): Confirmed PNR, 13-digit ticket numbers, barcode slip, and itinerary download.
    - My Trips (`app/account/trips/page.tsx`): Reservation lookup and status tracking.
  - Built Agent B2B Portal (`app/agent/page.tsx`): Prepaid wallet balance ($4,380.00), top-up modal, ledger audit table, and client bookings.
  - Built Admin Operations Console (`app/admin/page.tsx`): Metrics, supplier status matrix, pricing rules toggle, and ticketing retry trigger.
  - Implemented REST APIs in `app/api/v1/`: `/health`, `/flights/search`, `/bookings`, `/bookings/[reference]`.

---

## Milestone 3: Verification, Testing & QA
- **Date**: 2026-09-14
- **Status**: Completed
- **Testing Results**:
  - **Vitest Unit & Integration Suite**: 13/13 tests passed (100% success).
    - `tests/pricing.test.ts`: Minor units math, multi-currency conversion, agent markup precedence.
    - `tests/wallet-and-state.test.ts`: Wallet deposits, atomic debits, insufficient funds rejection, audit trail, and booking state transitions.
  - **TypeScript Strict Compilation**: `npm run typecheck` passed with 0 errors.
  - **Production Build**: `npm run build` generated 10 optimized pages and route handlers with 0 errors.
  - **Browser E2E QA**: End-to-end verification of customer search, checkout, PNR/e-ticket issuance, agent portal, and admin console passed cleanly.

---

## Milestone 4: Database Authentication, Credential Persistence & Navigation Redesign
- **Date**: 2026-09-14
- **Status**: Completed
- **Completed Work**:
  - Integrated Prisma ORM with SQLite database engine (`dev.db`).
  - Defined complete relational schema: `User`, `Session`, `Agency`, `ApiSecurityConfig`, `Booking`, `Ticket`, `WalletLedger`, `PricingRule`, and `AuditLog`.
  - Implemented cryptographic password hashing (PBKDF2 SHA-512) and session token management in `lib/auth/password.ts` and `lib/auth/auth-service.ts`.
  - Implemented database-stored API and security configuration service in `lib/settings/db-settings.ts` with secret masking (e.g. `sk_t••••••••8491`) and immutable audit logging.
  - Built dedicated login interfaces:
    - Agency B2B Login at `/agent/login` with agency application/registration tab.
    - Staff Operations Login at `/admin/login` with high-security theme and RBAC enforcement.
  - Implemented route protection: `/agent` and `/admin` redirect unauthenticated visitors to their respective login portals; added Sign Out buttons to both dashboards.
  - Redesigned top navigation (`Navbar.tsx`): Main menu now displays *strictly customer travel options* (Flight Search, My Trips, 24/7 Hotline, Currency Switcher), completely removing Admin/Agent links and portal switchers from public view.
  - Positioned discreet partner and staff login links in the footer under **Partner & Staff Portals**.
  - Seeded database with pre-hashed credentials:
    - Super Admin: `admin@pntoursandtravel.com` / `Admin@PN2026!`
    - Travel Agency: `agent@pntoursandtravel.com` / `Agent@PN2026!`
    - Customer: `customer@example.com` / `Customer@PN2026!`
  - Verified test suite: 17/17 tests passing in Vitest.
  - Verified production build: 16 routes compiled cleanly with 0 errors.
  - Verified browser subagent flow: confirmed customer-only navbar, footer partner links, agency login/logout, and admin credentials management with edit modal.

---

## Milestone 5: Serverless SQLite Persistence & Error 14 Auto-Hydration Resolution
- **Date**: 2026-09-15
- **Status**: Completed
- **Problem Statement**:
  - In serverless cloud deployments (such as Vercel and AWS Lambda), the runtime deployment root (`/var/task`) is strictly mounted as a read-only filesystem (`EROFS`).
  - SQLite requires read-write access for locking and journaling (`-wal` / `-shm` / `-journal`). When Next.js API routes executed `prisma.user.findUnique()`, the POSIX read-only constraint resulted in:
    `Invalid prisma.user.findUnique() invocation: Error querying the database: Error code 14: Unable to open the database file`
- **Solution & Architecture**:
  - Implemented serverless runtime detection in `lib/db/prisma.ts`. On Vercel / serverless platforms, the database is mapped to `/tmp/dev.db` (the only writable directory).
  - Created `lib/db/embedded-db.ts` containing an embedded base64 snapshot of the pre-seeded SQLite database.
  - On cold boot, if `/tmp/dev.db` is not present, `prisma.ts` attempts to copy the bundled database from candidate disk locations, and falls back to instantly hydrating `/tmp/dev.db` from the embedded snapshot with full read-write permissions (`0o666`).
  - Configured `next.config.mjs` with `experimental.outputFileTracingIncludes` to ensure `prisma/dev.db` and schema are packaged with serverless bundles.
  - Added unit and integration tests in `tests/auth-and-db.test.ts` verifying that seeded credentials, agency records, and serverless snapshot hydration all function smoothly.
- **Verification**:
  - Vitest test suite: 20/20 tests passed cleanly.
  - Next.js production build: 16 routes compiled with zero errors and zero warnings.

---

## Milestone 6: Supabase PostgreSQL Migration, MCP Server Integration & Live E2E Verification
- **Date**: 2026-09-15
- **Status**: Completed
- **Completed Work**:
  - Migrated primary database from local SQLite to **Supabase PostgreSQL** (`aws-1-eu-west-1.pooler.supabase.com`).
  - Applied and verified Prisma migrations: 36 public tables deployed with zero pending migrations.
  - Configured Model Context Protocol (MCP) server integration in `.mcp.json` pointing to `https://mcp.supabase.com/mcp` for agentic database querying and documentation tools.
  - Verified remote GitHub repository (`PnToursandTravel/Air-Ticketing`) on `main` branch.
  - Verified Vercel CI/CD build command (`prisma generate && prisma migrate deploy && next build`).
  - Executed automated Vitest test suite across all 4 suites: 31/31 tests passing (Auth, RBAC, Financial Ledger, Idempotency, Pricing).
  - Executed production build and end-to-end tests: verified `/api/v1/health` (`HEALTHY`, database `CONNECTED`), `/api/v1/flights/search` (8 live flight offers returned), and browser UI flows.
- **Verification**:
  - Test Suite: 31/31 passing tests.
  - TypeScript: 0 type errors.
  - Next.js Build: 25 static and dynamic pages generated.
  - Live Endpoints: Health check and flight search returning live data.


