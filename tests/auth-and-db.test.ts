import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { DbSettingsService } from "@/lib/settings/db-settings";

describe("Cryptographic Password Hashing & Verification", () => {
  it("hashes password and verifies successfully with correct plaintext", () => {
    const plain = "TestGenericSecret#2026";
    const hash = hashPassword(plain);

    expect(hash).toContain(":");
    expect(verifyPassword(plain, hash)).toBe(true);
  });

  it("fails verification with incorrect password", () => {
    const plain = "TestGenericSecret#2026";
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
    expect(user!.passwordHash).toBeDefined();
    expect(user!.passwordHash?.split(":").length).toBe(2);
  });

  it("queries agency records from database", async () => {
    const { prisma } = await import("@/lib/db/prisma");
    const agencies = await prisma.agency.findMany();

    expect(agencies.length).toBeGreaterThan(0);
    expect(agencies[0].contactEmail).toBe("agent@pntoursandtravel.com");
  });

  it("verifies exported backup data integrity", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const jsonPath = path.resolve("./prisma/sqlite_backup_data.json");
    expect(fs.existsSync(jsonPath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    expect(data.users.length).toBe(3);
    const admin = data.users.find((u: any) => u.email === "admin@pntoursandtravel.com");
    expect(admin).toBeDefined();
    expect(admin.role).toBe("SUPER_ADMIN");
    expect(verifyPassword("Admin@PN2026!", admin.passwordHash)).toBe(true);
  });
});


