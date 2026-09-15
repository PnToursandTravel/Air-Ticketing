const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verify() {
  console.log("Connecting to Supabase PostgreSQL database...");
  
  // 1. Query Super Admin user
  const admin = await prisma.user.findUnique({
    where: { email: "admin@pntoursandtravel.com" },
    include: { agency: true },
  });

  if (!admin) {
    throw new Error("Admin user not found in Supabase database!");
  }

  console.log("LIVE QUERY VERIFIED:");
  console.log(` - Admin Email: ${admin.email}`);
  console.log(` - Admin Name: ${admin.name}`);
  console.log(` - Role: ${admin.role}`);
  console.log(` - Active: ${admin.isActive}`);

  // 2. Query normal travel agent user
  const agent = await prisma.user.findUnique({
    where: { email: "agent@pntoursandtravel.com" },
    include: { agency: true },
  });
  console.log(` - Agent Email: ${agent?.email} (Agency: ${agent?.agency?.name})`);

  // 3. Count records across tables
  const userCount = await prisma.user.count();
  const agencyCount = await prisma.agency.count();
  const configCount = await prisma.apiSecurityConfig.count();
  const ruleCount = await prisma.pricingRule.count();
  const bookingCount = await prisma.booking.count();
  const ledgerCount = await prisma.walletLedger.count();
  const logCount = await prisma.auditLog.count();

  console.log("DATABASE COUNTS IN SUPABASE:");
  console.log(` - Users: ${userCount}`);
  console.log(` - Agencies: ${agencyCount}`);
  console.log(` - Security Configs: ${configCount}`);
  console.log(` - Pricing Rules: ${ruleCount}`);
  console.log(` - Bookings: ${bookingCount}`);
  console.log(` - Wallet Ledgers: ${ledgerCount}`);
  console.log(` - Audit Logs: ${logCount}`);

  console.log("\nALL SUPABASE QUERIES PASSED 100% CLEANLY!");
}

verify()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
