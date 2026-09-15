# Deployment & Operations Runbook

## 1. Production Deployment on Vercel
The repository includes automated Vercel build configuration in `vercel.json`:
- **Build Command**: `prisma generate && next build`
- **Output Directory**: `.next`

### Required Environment Variables on Vercel
- `NEXT_PUBLIC_APP_URL`: Production domain (e.g. `https://air-ticketing.pntoursandtravel.com`).
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (`https://vfjriqhfwnubjtepyork.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (Server-only).
- `DATABASE_URL`: Supabase connection pooler URL (port `6543`).
- `DIRECT_URL`: Supabase direct connection URL (port `5432`).
- `SESSION_SECRET`: Strong 32+ character random string.

## 2. Super Admin Bootstrap Process
To bootstrap the initial Super Admin account without exposing credentials:
1. In your secure server terminal or deployment environment, export:
   ```bash
   export INITIAL_SUPER_ADMIN_EMAIL="admin@pntoursandtravel.com"
   export INITIAL_SUPER_ADMIN_NAME="Denis Ayiko (Super Admin)"
   export INITIAL_SUPER_ADMIN_PASSWORD="Your-Secure-16-Character-Password!"
   ```
2. Run the bootstrap command:
   ```bash
   npm run bootstrap:super-admin
   ```
3. The CLI provisions the user, assigns `SUPER_ADMIN` role, writes an immutable audit record, and refuses duplicate executions.
4. Unset or clear the `INITIAL_SUPER_ADMIN_*` variables immediately afterwards:
   ```bash
   unset INITIAL_SUPER_ADMIN_EMAIL INITIAL_SUPER_ADMIN_NAME INITIAL_SUPER_ADMIN_PASSWORD
   ```

## 3. Verification & Health Checks
- **Health Check**: `GET /api/v1/health` returns `200 OK`.
- **Database Status**: Verified via `node prisma/verify-supabase.js`.
- **Automated Tests**:
  ```bash
  npm run typecheck
  npm test
  ```
