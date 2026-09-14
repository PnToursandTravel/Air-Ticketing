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
