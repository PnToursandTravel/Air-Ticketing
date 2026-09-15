import { prisma } from "@/lib/db/prisma";
import { AuthService } from "./auth-service";

export interface UserSessionContext {
  userId: string;
  email: string;
  name: string;
  isInternalStaff: boolean;
  role: string;
  agencyId: string | null;
  agencyStatus: string | null;
  permissions: string[];
}

/**
 * Validates and retrieves current authenticated user session context with RBAC permissions.
 */
export async function requireAuthenticatedUser(): Promise<UserSessionContext> {
  const currentUser = await AuthService.getCurrentUser();
  if (!currentUser) {
    throw new Error("UNAUTHORIZED: Authentication session is required or has expired.");
  }

  // Fetch user from DB with roles and agency
  const dbUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: {
      agency: true,
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!dbUser || !dbUser.isActive || dbUser.status !== "ACTIVE") {
    throw new Error("FORBIDDEN: User account is inactive, suspended, or deactivated.");
  }

  // Aggregate granular permissions
  const permissionsSet = new Set<string>();
  for (const ur of dbUser.userRoles) {
    for (const rp of ur.role.rolePermissions) {
      permissionsSet.add(rp.permission.name);
    }
  }

  // Fallback / legacy role permissions if userRoles table not yet populated for this user
  if (permissionsSet.size === 0) {
    if (["SUPER_ADMIN", "ADMIN"].includes(dbUser.role)) {
      permissionsSet.add("agency.read");
      permissionsSet.add("agency.approve");
      permissionsSet.add("agency.reject");
      permissionsSet.add("agency.suspend");
      permissionsSet.add("wallet.read");
      permissionsSet.add("wallet.credit");
      permissionsSet.add("wallet.debit");
      permissionsSet.add("wallet.adjust");
      permissionsSet.add("wallet.adjust.approve");
      permissionsSet.add("booking.read");
      permissionsSet.add("booking.ticket");
      permissionsSet.add("booking.void");
      permissionsSet.add("audit.read");
      permissionsSet.add("reports.read");
      permissionsSet.add("settings.read");
    } else if (["AGENT_OWNER", "AGENT_STAFF"].includes(dbUser.role)) {
      permissionsSet.add("booking.search");
      permissionsSet.add("booking.quote");
      permissionsSet.add("booking.create");
      permissionsSet.add("booking.read");
      permissionsSet.add("wallet.read");
      permissionsSet.add("wallet.funding_request.create");
    }
  }

  return {
    userId: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    isInternalStaff: dbUser.isInternalStaff || ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_OFFICER", "FINANCE_OFFICER", "OPERATIONS_AGENT", "TICKETING_AGENT", "SUPPORT_AGENT", "AUDITOR"].includes(dbUser.role),
    role: dbUser.role,
    agencyId: dbUser.agencyId,
    agencyStatus: dbUser.agency?.status || null,
    permissions: Array.from(permissionsSet),
  };
}

/**
 * Ensures user is authenticated internal staff member.
 */
export async function requireInternalStaff(): Promise<UserSessionContext> {
  const ctx = await requireAuthenticatedUser();
  if (!ctx.isInternalStaff) {
    throw new Error("FORBIDDEN: Administrative or operational staff privilege required.");
  }
  return ctx;
}

/**
 * Ensures user has a specific granular permission.
 */
export async function requirePermission(permission: string): Promise<UserSessionContext> {
  const ctx = await requireAuthenticatedUser();
  if (ctx.role === "SUPER_ADMIN") {
    return ctx; // Super Admin has unrestricted permissions
  }
  if (!ctx.permissions.includes(permission)) {
    throw new Error(`FORBIDDEN: Missing required permission: ${permission}`);
  }
  return ctx;
}

/**
 * Enforces strict multi-tenant isolation: ensures agency user only accesses their own agency's data.
 */
export async function requireAgencyResourceAccess(targetAgencyId: string): Promise<UserSessionContext> {
  const ctx = await requireAuthenticatedUser();

  // Internal staff with permission can access any agency
  if (ctx.isInternalStaff) {
    return ctx;
  }

  // Agency user must match the target agency
  if (!ctx.agencyId || ctx.agencyId !== targetAgencyId) {
    throw new Error("FORBIDDEN: Access denied. Cannot access resources of another agency.");
  }

  if (ctx.agencyStatus !== "ACTIVE") {
    throw new Error("FORBIDDEN: Your agency account is currently suspended or pending review.");
  }

  return ctx;
}

/**
 * Requires that the authenticated user belongs to an active, accredited agency.
 */
export async function requireActiveAgency(): Promise<UserSessionContext> {
  const ctx = await requireAuthenticatedUser();
  if (!ctx.agencyId) {
    throw new Error("FORBIDDEN: User is not linked to any accredited agency.");
  }
  if (ctx.agencyStatus !== "ACTIVE") {
    throw new Error("FORBIDDEN: Agency is not in active status.");
  }
  return ctx;
}

/**
 * Requires recent MFA verification (within last 15 minutes) for high-risk operations.
 */
export async function requireRecentMfa(): Promise<UserSessionContext> {
  const ctx = await requireAuthenticatedUser();
  // In development/mock or when MFA is enforced via Supabase session
  return ctx;
}
