import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { DbSettingsService } from "@/lib/settings/db-settings";

describe("Cryptographic Password Hashing & Verification", () => {
  it("hashes password and verifies successfully with correct plaintext", () => {
    const plain = "Admin@PN2026!";
    const hash = hashPassword(plain);

    expect(hash).toContain(":");
    expect(verifyPassword(plain, hash)).toBe(true);
  });

  it("fails verification with incorrect password", () => {
    const plain = "Admin@PN2026!";
    const hash = hashPassword(plain);

    expect(verifyPassword("WrongPassword123", hash)).toBe(false);
  });
});

describe("Database Security & Secret Masking", () => {
  it("masks secret tokens so only prefix and suffix are visible", () => {
    const secret = "sk_test_98fbc10842a981048b209e";
    const masked = DbSettingsService.maskSecret(secret);

    expect(masked).toBe("sk_t••••••••209e");
    expect(masked).not.toContain("98fbc108");
  });

  it("handles short secrets securely", () => {
    expect(DbSettingsService.maskSecret("short")).toBe("••••••••");
  });
});

describe("Database Hydration & User Queries", () => {
  it("queries the user table and retrieves the seeded super admin", async () => {
    const { prisma } = await import("@/lib/db/prisma");
    const user = await prisma.user.findUnique({
      where: { email: "admin@pntoursandtravel.com" },
    });

    expect(user).not.toBeNull();
    expect(user?.email).toBe("admin@pntoursandtravel.com");
    expect(user?.role).toBe("SUPER_ADMIN");
    expect(user?.isActive).toBe(true);
    expect(verifyPassword("Admin@PN2026!", user!.passwordHash)).toBe(true);
  });

  it("queries agency records from database", async () => {
    const { prisma } = await import("@/lib/db/prisma");
    const agencies = await prisma.agency.findMany();

    expect(agencies.length).toBeGreaterThan(0);
    expect(agencies[0].contactEmail).toBe("agent@pntoursandtravel.com");
  });

  it("hydrates and queries cleanly from embedded database snapshot", async () => {
    const { EMBEDDED_DEV_DB_BASE64 } = await import("@/lib/db/embedded-db");
    const { PrismaClient } = await import("@prisma/client");
    const fs = await import("fs");
    const path = await import("path");
    const os = await import("os");

    expect(EMBEDDED_DEV_DB_BASE64.length).toBeGreaterThan(1000);
    
    // Simulate serverless tmp database
    const testTmpDb = path.join(os.tmpdir(), `test-serverless-${Date.now()}.db`);
    fs.writeFileSync(testTmpDb, Buffer.from(EMBEDDED_DEV_DB_BASE64, "base64"));

    const client = new PrismaClient({
      datasources: {
        db: {
          url: `file:${testTmpDb.replace(/\\/g, "/")}`,
        },
      },
    });

    const admin = await client.user.findUnique({
      where: { email: "admin@pntoursandtravel.com" },
    });

    expect(admin).not.toBeNull();
    expect(admin?.role).toBe("SUPER_ADMIN");

    await client.$disconnect();
  });
});

