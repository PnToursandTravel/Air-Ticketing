import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INTERNAL_ROLES = [
  { name: "SUPER_ADMIN", description: "Unrestricted institutional administration and oversight", isInternal: true },
  { name: "ADMIN", description: "General administration, bookings, and agency operations", isInternal: true },
  { name: "COMPLIANCE_OFFICER", description: "Agency onboarding, IATA compliance, and document reviews", isInternal: true },
  { name: "FINANCE_OFFICER", description: "Wallet funding, ledger management, refunds, and adjustments", isInternal: true },
  { name: "OPERATIONS_AGENT", description: "Flight operations, schedule changes, and customer support", isInternal: true },
  { name: "TICKETING_AGENT", description: "Flight reservation ticketing, voiding, and reissuing", isInternal: true },
  { name: "SUPPORT_AGENT", description: "Customer and agency inquiry ticket management", isInternal: true },
  { name: "AUDITOR", description: "Strictly read-only access to audit logs and financial statements", isInternal: true },
];

const AGENCY_ROLES = [
  { name: "AGENCY_OWNER", description: "Full control over agency profile, staff, wallet, and bookings", isInternal: false },
  { name: "AGENCY_MANAGER", description: "Operational management of bookings, staff, and funding requests", isInternal: false },
  { name: "AGENCY_BOOKING_AGENT", description: "Flight search, quotes, and reservation booking agent", isInternal: false },
  { name: "AGENCY_FINANCE", description: "Wallet review, statements, and funding requests submission", isInternal: false },
  { name: "AGENCY_VIEWER", description: "Read-only access to agency bookings and statements", isInternal: false },
];

const PERMISSIONS = [
  // Agency permissions
  { name: "agency.read", category: "AGENCY", description: "View agency details and profile" },
  { name: "agency.update", category: "AGENCY", description: "Update agency details" },
  { name: "agency.approve", category: "AGENCY", description: "Approve pending agency applications" },
  { name: "agency.reject", category: "AGENCY", description: "Reject agency applications" },
  { name: "agency.suspend", category: "AGENCY", description: "Suspend agency operational access" },
  { name: "agency.reactivate", category: "AGENCY", description: "Reactivate suspended agency" },
  { name: "agency.documents.review", category: "AGENCY", description: "Review compliance documents" },

  // Agency user permissions
  { name: "agency_user.read", category: "AGENCY_USER", description: "View agency staff members" },
  { name: "agency_user.invite", category: "AGENCY_USER", description: "Invite new agency staff" },
  { name: "agency_user.update", category: "AGENCY_USER", description: "Update agency staff roles" },
  { name: "agency_user.deactivate", category: "AGENCY_USER", description: "Deactivate agency staff" },

  // Wallet permissions
  { name: "wallet.read", category: "WALLET", description: "View wallet balance and ledger" },
  { name: "wallet.funding_request.create", category: "WALLET", description: "Submit wallet top-up request" },
  { name: "wallet.funding_request.review", category: "WALLET", description: "Review and approve funding requests" },
  { name: "wallet.credit", category: "WALLET", description: "Manually credit agency wallet" },
  { name: "wallet.debit", category: "WALLET", description: "Debit agency wallet" },
  { name: "wallet.adjust", category: "WALLET", description: "Initiate wallet adjustment" },
  { name: "wallet.adjust.approve", category: "WALLET", description: "Approve high-value wallet adjustment (maker-checker)" },
  { name: "wallet.statement.export", category: "WALLET", description: "Export wallet transactions and statements" },

  // Booking permissions
  { name: "booking.search", category: "BOOKING", description: "Search flights and availability" },
  { name: "booking.quote", category: "BOOKING", description: "Generate binding fare quotes" },
  { name: "booking.create", category: "BOOKING", description: "Create reservation with wallet hold" },
  { name: "booking.read", category: "BOOKING", description: "View booking details" },
  { name: "booking.update", category: "BOOKING", description: "Modify booking passenger details" },
  { name: "booking.cancel.request", category: "BOOKING", description: "Request booking cancellation" },
  { name: "booking.cancel.process", category: "BOOKING", description: "Process approved cancellation" },
  { name: "booking.ticket", category: "BOOKING", description: "Issue flight ticket" },
  { name: "booking.void", category: "BOOKING", description: "Void issued ticket" },
  { name: "booking.refund.request", category: "BOOKING", description: "Request booking refund" },
  { name: "booking.refund.process", category: "BOOKING", description: "Process and execute refund" },

  // Staff permissions
  { name: "staff.read", category: "STAFF", description: "View internal staff members" },
  { name: "staff.invite", category: "STAFF", description: "Invite new internal staff" },
  { name: "staff.update", category: "STAFF", description: "Update internal staff roles" },
  { name: "staff.deactivate", category: "STAFF", description: "Deactivate internal staff" },
  { name: "staff.reactivate", category: "STAFF", description: "Reactivate internal staff" },
  { name: "staff.sessions.revoke", category: "STAFF", description: "Revoke active staff sessions" },

  // Roles & permissions management
  { name: "roles.read", category: "ROLES", description: "View roles" },
  { name: "roles.manage", category: "ROLES", description: "Create or modify roles" },
  { name: "permissions.manage", category: "ROLES", description: "Assign permissions to roles" },

  // Audit & reports
  { name: "audit.read", category: "AUDIT", description: "View immutable audit logs" },
  { name: "reports.read", category: "REPORTS", description: "View operational and financial reports" },
  { name: "reports.export", category: "REPORTS", description: "Export sensitive reports" },

  // Settings
  { name: "settings.read", category: "SETTINGS", description: "View system security configurations" },
  { name: "settings.manage", category: "SETTINGS", description: "Update system settings" },
];

export async function seedRolesAndPermissions() {
  console.log("Seeding Roles and Permissions into Supabase PostgreSQL...");

  // 1. Seed Permissions
  const permissionMap: Record<string, string> = {};
  for (const p of PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { name: p.name },
      update: { category: p.category, description: p.description },
      create: p,
    });
    permissionMap[p.name] = record.id;
  }
  console.log(`✓ Seeded ${Object.keys(permissionMap).length} granular permissions.`);

  // 2. Seed Roles
  const allRoles = [...INTERNAL_ROLES, ...AGENCY_ROLES];
  const roleMap: Record<string, string> = {};
  for (const r of allRoles) {
    const record = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description, isInternal: r.isInternal },
      create: r,
    });
    roleMap[r.name] = record.id;
  }
  console.log(`✓ Seeded ${allRoles.length} system roles.`);

  // 3. Define Role -> Permission Matrix
  const roleMatrix: Record<string, string[]> = {
    SUPER_ADMIN: PERMISSIONS.map((p) => p.name), // All permissions
    ADMIN: PERMISSIONS.map((p) => p.name).filter(
      (p) => !["roles.manage", "permissions.manage"].includes(p)
    ),
    COMPLIANCE_OFFICER: [
      "agency.read", "agency.update", "agency.approve", "agency.reject",
      "agency.suspend", "agency.reactivate", "agency.documents.review",
      "audit.read", "reports.read",
    ],
    FINANCE_OFFICER: [
      "wallet.read", "wallet.funding_request.review", "wallet.credit",
      "wallet.debit", "wallet.adjust", "wallet.adjust.approve",
      "wallet.statement.export", "booking.refund.process", "reports.read", "reports.export",
    ],
    OPERATIONS_AGENT: [
      "booking.read", "booking.update", "booking.cancel.process",
      "reports.read", "agency.read",
    ],
    TICKETING_AGENT: [
      "booking.read", "booking.ticket", "booking.void", "reports.read",
    ],
    SUPPORT_AGENT: [
      "agency.read", "booking.read",
    ],
    AUDITOR: [
      "audit.read", "reports.read", "agency.read", "booking.read", "wallet.read",
    ],
    AGENCY_OWNER: [
      "agency.read", "agency.update", "agency_user.read", "agency_user.invite",
      "agency_user.update", "agency_user.deactivate", "wallet.read",
      "wallet.funding_request.create", "wallet.statement.export",
      "booking.search", "booking.quote", "booking.create", "booking.read",
      "booking.update", "booking.cancel.request", "booking.refund.request",
    ],
    AGENCY_MANAGER: [
      "agency.read", "agency_user.read", "wallet.read", "wallet.funding_request.create",
      "booking.search", "booking.quote", "booking.create", "booking.read",
      "booking.cancel.request",
    ],
    AGENCY_BOOKING_AGENT: [
      "booking.search", "booking.quote", "booking.create", "booking.read",
      "booking.cancel.request",
    ],
    AGENCY_FINANCE: [
      "wallet.read", "wallet.funding_request.create", "wallet.statement.export",
      "booking.read",
    ],
    AGENCY_VIEWER: [
      "booking.read", "wallet.read",
    ],
  };

  for (const [roleName, permissions] of Object.entries(roleMatrix)) {
    const roleId = roleMap[roleName];
    if (!roleId) continue;

    for (const permName of permissions) {
      const permissionId = permissionMap[permName];
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
    }
  }

  console.log("✓ All Role-Permission mappings seeded successfully.");
}

if (require.main === module) {
  seedRolesAndPermissions()
    .then(() => {
      console.log("Role and Permission initialization complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
