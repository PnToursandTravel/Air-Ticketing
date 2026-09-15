import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "./password";
import { cookies } from "next/headers";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  agencyId: string | null;
  agencyName?: string | null;
}

const SESSION_COOKIE_NAME = "pntours_session";

export class AuthService {
  /**
   * Authenticate user against database credentials and role constraints
   */
  static async login(
    email: string,
    plainPassword: string,
    roleCategory: "ADMIN" | "AGENT" | "CUSTOMER",
    ipAddress?: string
  ): Promise<{ user: AuthenticatedUser; sessionToken: string }> {
    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { agency: true },
    });

    if (!user || !user.isActive || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    const isValidPassword = verifyPassword(plainPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Role authorization check
    if (roleCategory === "ADMIN") {
      if (!["ADMIN", "SUPER_ADMIN", "OPERATIONS", "FINANCE"].includes(user.role)) {
        throw new Error("Access denied: Account does not have administrative privileges");
      }
    } else if (roleCategory === "AGENT") {
      if (!["AGENT_OWNER", "AGENT_STAFF"].includes(user.role)) {
        throw new Error("Access denied: Account is not registered as an accredited agency");
      }
    }

    // Create session in database
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expiresAt,
        ipAddress: ipAddress || "127.0.0.1",
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorEmail: user.email,
        action: "USER_LOGIN_SUCCESS",
        target: roleCategory,
        details: `Logged in to ${roleCategory} portal`,
        ipAddress: ipAddress || "127.0.0.1",
      },
    });

    // Set HTTP-only secure cookie
    try {
      const cookieStore = cookies();
      cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
      });
    } catch {
      // Ignore if called outside server request context
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        agencyId: user.agencyId,
        agencyName: user.agency?.name || null,
      },
      sessionToken,
    };
  }

  /**
   * Get current authenticated user from cookie session
   */
  static async getCurrentUser(): Promise<AuthenticatedUser | null> {
    try {
      const cookieStore = cookies();
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      if (!token) return null;

      const session = await prisma.session.findUnique({
        where: { sessionToken: token },
        include: {
          user: {
            include: { agency: true },
          },
        },
      });

      if (!session || session.expiresAt < new Date()) {
        return null;
      }

      const { user } = session;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        agencyId: user.agencyId,
        agencyName: user.agency?.name || null,
      };
    } catch {
      return null;
    }
  }

  /**
   * Destroy session in database and clear cookie
   */
  static async logout(): Promise<void> {
    try {
      const cookieStore = cookies();
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      if (token) {
        await prisma.session.deleteMany({
          where: { sessionToken: token },
        });
        cookieStore.delete(SESSION_COOKIE_NAME);
      }
    } catch {
      // Ignore error if already logged out
    }
  }
}
