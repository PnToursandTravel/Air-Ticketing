# Role-Based Access Control (RBAC) & Multi-Tenant Isolation

The platform enforces strict server-side authorization through roles and granular permissions.

## 1. System Roles

### Internal Operations Roles
- `SUPER_ADMIN`: Unrestricted administrative oversight and access.
- `ADMIN`: General management of agencies, bookings, and operations.
- `COMPLIANCE_OFFICER`: Review of agency applications and legal compliance documents.
- `FINANCE_OFFICER`: Wallet top-up approvals, adjustments, and financial reports.
- `OPERATIONS_AGENT`: Operational flight management and customer support.
- `TICKETING_AGENT`: Ticket issuance and void workflows.
- `SUPPORT_AGENT`: Customer inquiry resolution and support cases.
- `AUDITOR`: Strictly read-only access to audit logs and financial statements.

### Agency B2B Roles
- `AGENCY_OWNER`: Full management of agency profile, staff members, wallet, and bookings.
- `AGENCY_MANAGER`: Operational booking and staff oversight.
- `AGENCY_BOOKING_AGENT`: Flight search, quoting, and reservation booking.
- `AGENCY_FINANCE`: Wallet balance review, statements, and top-up funding requests.
- `AGENCY_VIEWER`: Read-only access to agency bookings.

## 2. Multi-Tenant Isolation
Agency A must never access Agency B's data under any circumstances.
Enforced via:
1. **Server Guard**: `requireAgencyResourceAccess(agencyId)` compares authenticated user's `agencyId` with requested resource.
2. **Database Row Level Security (RLS)**: PostgreSQL tables have RLS enabled, revoking anonymous mutations by default.
3. **Storage Isolation**: Documents stored under private buckets partitioned by agency ID (`agencies/{agencyId}/...`).

## 3. High-Risk Operation Constraints
- **MFA Assurance**: Required before approving applications, crediting wallets, adjusting balances, or issuing tickets.
- **Maker-Checker Protocol**: High-value adjustments require two distinct finance officers. The officer who initiates an adjustment cannot approve it.
