const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const dbPath = path.resolve(__dirname, "dev.db");
const backupDbPath = path.resolve(__dirname, "dev.db.backup");

// 1. Physical copy of the SQLite database
fs.copyFileSync(dbPath, backupDbPath);
console.log("Physical database backup created at:", backupDbPath);

// 2. Extract and serialize all records to JSON
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:" + dbPath.replace(/\\/g, "/"),
    },
  },
});

async function backup() {
  const data = {
    users: await prisma.user.findMany(),
    agencies: await prisma.agency.findMany(),
    configs: await prisma.apiSecurityConfig.findMany(),
    rules: await prisma.pricingRule.findMany(),
    ledgers: await prisma.walletLedger.findMany(),
    bookings: await prisma.booking.findMany(),
    tickets: await prisma.ticket.findMany(),
    logs: await prisma.auditLog.findMany(),
    sessions: await prisma.session.findMany(),
  };

  const jsonPath = path.resolve(__dirname, "sqlite_backup_data.json");
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");
  console.log("JSON export created at:", jsonPath);
  console.log("Exported records summary:");
  for (const [table, rows] of Object.entries(data)) {
    console.log(` - ${table}: ${rows.length} records`);
  }
}

backup()
  .catch((err) => {
    console.error("Backup failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
