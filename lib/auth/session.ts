import { UserRole } from "@/types";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  agencyId?: string;
  agencyName?: string;
}

export class AuthService {

  static canAccessAgentPortal(user?: SessionUser | null): boolean {
    if (!user) return false;
    return ["AGENT_OWNER", "AGENT_STAFF", "ADMIN", "SUPER_ADMIN"].includes(user.role);
  }

  static canAccessAdminPortal(user?: SessionUser | null): boolean {
    if (!user) return false;
    return ["ADMIN", "SUPER_ADMIN", "OPERATIONS", "FINANCE", "SUPPORT"].includes(user.role);
  }

  static canAdjustWallet(user?: SessionUser | null): boolean {
    if (!user) return false;
    return ["FINANCE", "SUPER_ADMIN"].includes(user.role);
  }

  static canManagePricing(user?: SessionUser | null): boolean {
    if (!user) return false;
    return ["ADMIN", "SUPER_ADMIN"].includes(user.role);
  }
}
