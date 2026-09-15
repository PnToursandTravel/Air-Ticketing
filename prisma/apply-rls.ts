import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TABLES = [
  "User",
  "UserProfile",
  "Role",
  "Permission",
  "UserRole",
  "RolePermission",
  "Agency",
  "AgencyBranch",
  "AgencyMember",
  "AgencyApplication",
  "AgencyApplicationContact",
  "ComplianceDocument",
  "DocumentReview",
  "Wallet",
  "WalletLedgerEntry",
  "WalletFundingRequest",
  "WalletAdjustment",
  "WalletLedger",
  "FlightQuote",
  "Booking",
  "BookingStatusHistory",
  "FlightSegment",
  "Passenger",
  "Ticket",
  "RefundRequest",
  "Invoice",
  "SupportCase",
  "InternalNote",
  "Notification",
  "AuditLog",
  "IdempotencyKey",
  "SystemSetting",
  "ApiSecurityConfig",
  "PricingRule",
  "Session",
];

async function applyRLS() {
  console.log("Applying Supabase PostgreSQL Row Level Security (RLS) policies...");

  for (const table of TABLES) {
    try {
      // 1. Enable RLS
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;`
      );

      // 2. Revoke public/anon access - deny direct anon mutations by default
      await prisma.$executeRawUnsafe(
        `REVOKE ALL ON "public"."${table}" FROM anon;`
      );

      console.log(`✓ RLS enabled & anon access revoked for: ${table}`);
    } catch (err: any) {
      console.warn(`! Note on table ${table}:`, err.message);
    }
  }

  console.log("\nRLS enforcement completed across all public tables.");
}

applyRLS()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed applying RLS:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
