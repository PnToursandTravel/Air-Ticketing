import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import os from "os";
import { EMBEDDED_DEV_DB_BASE64 } from "./embedded-db";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Resolves SQLite database location and hydrates database in serverless/readonly environments.
 * On Vercel and AWS Lambda, the root deployment directory (/var/task) is strictly read-only.
 * SQLite requires write access for locking and journals; therefore, the database is placed
 * in /tmp and automatically hydrated from the project template or embedded snapshot.
 */
function resolveDatabaseUrl(): string {
  // Respect explicit DATABASE_URL if configured
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:./")) {
    return process.env.DATABASE_URL;
  }

  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.NETLIFY ||
    process.env.VERCEL_ENV
  );

  if (isServerless) {
    const tmpDir = os.tmpdir() || "/tmp";
    const tmpDbPath = path.join(tmpDir, "dev.db");

    let isHydrated = false;
    try {
      if (fs.existsSync(tmpDbPath) && fs.statSync(tmpDbPath).size > 0) {
        isHydrated = true;
      }
    } catch {
      isHydrated = false;
    }

    if (!isHydrated) {
      // 1. Try copying from local bundled disk candidates
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.resolve(__dirname, "dev.db"),
        path.resolve(__dirname, "..", "prisma", "dev.db"),
        path.resolve(__dirname, "..", "..", "prisma", "dev.db"),
        path.resolve(__dirname, "..", "..", "..", "prisma", "dev.db"),
        "/var/task/prisma/dev.db",
        "/var/task/dev.db",
      ];

      for (const candidate of candidates) {
        try {
          if (fs.existsSync(candidate) && fs.statSync(candidate).size > 0) {
            fs.copyFileSync(candidate, tmpDbPath);
            try {
              fs.chmodSync(tmpDbPath, 0o666);
            } catch {
              // Ignore chmod error if unsupported
            }
            isHydrated = true;
            break;
          }
        } catch {
          // Continue to next candidate
        }
      }

      // 2. Fallback to embedded base64 snapshot if disk candidates weren't traced
      if (!isHydrated && EMBEDDED_DEV_DB_BASE64) {
        try {
          const buffer = Buffer.from(EMBEDDED_DEV_DB_BASE64, "base64");
          fs.writeFileSync(tmpDbPath, buffer);
          try {
            fs.chmodSync(tmpDbPath, 0o666);
          } catch {
            // Ignore chmod error
          }
          isHydrated = true;
        } catch (err) {
          console.error("[Prisma] Failed to hydrate SQLite db from embedded snapshot:", err);
        }
      }
    }

    const normalizedPath = tmpDbPath.replace(/\\/g, "/");
    return `file:${normalizedPath}`;
  }

  // Local / standard Node server development
  const localDb = path.resolve(process.cwd(), "prisma", "dev.db");
  try {
    if (!fs.existsSync(localDb)) {
      const dir = path.dirname(localDb);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (EMBEDDED_DEV_DB_BASE64) {
        fs.writeFileSync(localDb, Buffer.from(EMBEDDED_DEV_DB_BASE64, "base64"));
      }
    }
  } catch (err) {
    console.error("[Prisma] Error ensuring local dev.db:", err);
  }

  const normalizedLocal = localDb.replace(/\\/g, "/");
  return `file:${normalizedLocal}`;
}

const dbUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
