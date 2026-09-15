# Supabase Setup & Architecture Guide

## 1. Environment Connection
The platform utilizes two PostgreSQL connection strings configured in `.env`:
- `DATABASE_URL`: Transaction mode connection pooler (port `6543`) with `pgbouncer=true` for serverless application runtimes.
- `DIRECT_URL`: Direct session connection (port `5432`) for Prisma migrations and schema operations.

## 2. Supabase Auth Architecture
- **Identity Provider**: Supabase Auth handles email/password credentials, email verification, invitations, and TOTP Multi-Factor Authentication.
- **Prisma Synchronization**: The Prisma `User.id` maps 1:1 with the Supabase Auth UUID.
- **Client Boundaries**:
  - `lib/supabase/client.ts`: Browser client using public anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
  - `lib/supabase/server.ts`: Server SSR client using secure cookies.
  - `lib/supabase/admin.ts`: Server-only high-privilege admin client using `SUPABASE_SERVICE_ROLE_KEY`. Never exposed to client components.

## 3. Row Level Security (RLS)
RLS is active across all 35 public application tables.
- By default, anonymous (`anon`) access is completely revoked.
- Data access is mediated through server-side Route Handlers with RBAC permission checks and multi-tenant scoping.

## 4. Private Storage Buckets
Create the following private buckets in the Supabase Dashboard (`Storage` -> `Buckets`):
- `agency-compliance-documents` (Private)
- `wallet-payment-proofs` (Private)
- `booking-documents` (Private)
- `private-invoices` (Private)

Access to documents in these buckets requires short-lived signed URLs generated via `StorageService.createSignedUrl()` after verifying the requester's agency ownership or internal compliance privileges.
