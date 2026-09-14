import { UserRole } from "@/types";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  agencyId?: string;
  agencyName?: string;
}

export const DEMO_USERS: Record<string, SessionUser> = {
  customer: {
    id: "usr_customer_01",
    email: "customer@example.com",
    name: "Denis Ayiko",
    role: "CUSTOMER",
  },
  agent: {
    id: "usr_agent_01",
    email: "agent@pntoursandtravel.com",
    name: "Sarah Nantongo",
    role: "AGENT_OWNER",
    agencyId: "agency_premier_01",
    agencyName: "Premier Travel Bureau Uganda",
  },
  admin: {
    id: "usr_admin_01",
    email: "admin@pntoursandtravel.com",
    name: "System Operations Admin",
    role: "SUPER_ADMIN",
  },
};

export class AuthService {
  static getDemoUser(roleKey: "customer" | "agent" | "admin"): SessionUser {
    return DEMO_USERS[roleKey];
  }

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
