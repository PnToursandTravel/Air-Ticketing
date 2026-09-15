const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function importData() {
  const jsonPath = path.resolve(__dirname, "sqlite_backup_data.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error("Backup file not found at " + jsonPath);
  }

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw);

  console.log("Starting data import to PostgreSQL...");

  // 1. Agencies
  console.log(`Importing ${data.agencies.length} agencies...`);
  for (const agency of data.agencies) {
    await prisma.agency.upsert({
      where: { id: agency.id },
      update: {},
      create: {
        id: agency.id,
        name: agency.name,
        iataNumber: agency.iataNumber,
        licenseNumber: agency.licenseNumber,
        contactEmail: agency.contactEmail,
        contactPhone: agency.contactPhone,
        status: agency.status,
        walletBalanceMinor: agency.walletBalanceMinor,
        currency: agency.currency,
        createdAt: new Date(agency.createdAt),
        updatedAt: new Date(agency.updatedAt),
      },
    });
  }

  // 2. Users (Preserve password hashes, IDs, and roles)
  console.log(`Importing ${data.users.length} users...`);
  for (const user of data.users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        agencyId: user.agencyId,
        isActive: user.isActive,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
  }

  // 3. API Security Configurations
  console.log(`Importing ${data.configs.length} API security configurations...`);
  for (const conf of data.configs) {
    await prisma.apiSecurityConfig.upsert({
      where: { configKey: conf.configKey },
      update: {},
      create: {
        id: conf.id,
        category: conf.category,
        configKey: conf.configKey,
        configValue: conf.configValue,
        isSecret: conf.isSecret,
        description: conf.description,
        updatedBy: conf.updatedBy,
        updatedAt: new Date(conf.updatedAt),
      },
    });
  }

  // 4. Pricing Rules
  console.log(`Importing ${data.rules.length} pricing rules...`);
  for (const rule of data.rules) {
    await prisma.pricingRule.upsert({
      where: { id: rule.id },
      update: {},
      create: {
        id: rule.id,
        name: rule.name,
        priority: rule.priority,
        type: rule.type,
        amountMinorOrPercent: rule.amountMinorOrPercent,
        appliesTo: rule.appliesTo,
        targetCode: rule.targetCode,
        active: rule.active,
        createdAt: new Date(rule.createdAt),
        updatedAt: new Date(rule.updatedAt),
      },
    });
  }

  // 5. Wallet Ledgers
  console.log(`Importing ${data.ledgers.length} ledger entries...`);
  for (const entry of data.ledgers) {
    await prisma.walletLedger.upsert({
      where: { id: entry.id },
      update: {},
      create: {
        id: entry.id,
        agencyId: entry.agencyId,
        type: entry.type,
        amountMinor: entry.amountMinor,
        balanceBeforeMinor: entry.balanceBeforeMinor,
        balanceAfterMinor: entry.balanceAfterMinor,
        currency: entry.currency,
        bookingReference: entry.bookingReference,
        description: entry.description,
        actorId: entry.actorId,
        createdAt: new Date(entry.createdAt),
      },
    });
  }

  // 6. Bookings
  console.log(`Importing ${data.bookings.length} bookings...`);
  for (const booking of data.bookings) {
    await prisma.booking.upsert({
      where: { reference: booking.reference },
      update: {},
      create: {
        id: booking.id,
        reference: booking.reference,
        pnr: booking.pnr,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        ticketStatus: booking.ticketStatus,
        userId: booking.userId,
        agencyId: booking.agencyId,
        contactEmail: booking.contactEmail,
        contactPhone: booking.contactPhone,
        currency: booking.currency,
        priceSnapshotJson: booking.priceSnapshotJson,
        offerSnapshotJson: booking.offerSnapshotJson,
        passengersJson: booking.passengersJson,
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt),
      },
    });
  }

  // 7. Tickets
  console.log(`Importing ${data.tickets.length} tickets...`);
  for (const ticket of data.tickets) {
    await prisma.ticket.upsert({
      where: { ticketNumber: ticket.ticketNumber },
      update: {},
      create: {
        id: ticket.id,
        bookingId: ticket.bookingId,
        ticketNumber: ticket.ticketNumber,
        passengerName: ticket.passengerName,
        airlineCode: ticket.airlineCode,
        issuedAt: new Date(ticket.issuedAt),
      },
    });
  }

  // 8. Audit Logs
  console.log(`Importing ${data.logs.length} audit logs...`);
  for (const log of data.logs) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: {},
      create: {
        id: log.id,
        actorId: log.actorId,
        actorEmail: log.actorEmail,
        action: log.action,
        target: log.target,
        details: log.details,
        ipAddress: log.ipAddress,
        createdAt: new Date(log.createdAt),
      },
    });
  }

  console.log("Data migration to PostgreSQL completed successfully!");
}

importData()
  .catch((err) => {
    console.error("Data migration failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
