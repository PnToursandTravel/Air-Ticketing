import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with PN Tours & Travel records...");

  // 1. Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.walletLedger.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.apiSecurityConfig.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();

  // 2. Create Agency Profile
  const agency = await prisma.agency.create({
    data: {
      id: "agency_premier_01",
      name: "Premier Travel Bureau Uganda",
      iataNumber: "96-2 1849 2",
      licenseNumber: "UG-TR-2024-892",
      contactEmail: "agent@pntoursandtravel.com",
      contactPhone: "+256 785360444",
      status: "ACTIVE",
      walletBalanceMinor: 438000, // $4,380.00
      currency: "USD",
    },
  });

  // 3. Create Users with Secure Non-Hardcoded Credentials
  const adminSecret = process.env.INITIAL_SUPER_ADMIN_PASSWORD || crypto.randomBytes(16).toString("hex");
  const agentSecret = process.env.INITIAL_AGENT_PASSWORD || crypto.randomBytes(16).toString("hex");
  const customerSecret = crypto.randomBytes(16).toString("hex");

  const adminPasswordHash = hashPassword(adminSecret);
  const agentPasswordHash = hashPassword(agentSecret);
  const customerPasswordHash = hashPassword(customerSecret);

  const adminUser = await prisma.user.create({
    data: {
      id: "usr_admin_01",
      email: "admin@pntoursandtravel.com",
      passwordHash: adminPasswordHash,
      name: "Denis Ayiko (Super Admin)",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  const agentUser = await prisma.user.create({
    data: {
      id: "usr_agent_01",
      email: "agent@pntoursandtravel.com",
      passwordHash: agentPasswordHash,
      name: "Sarah Nantongo (Agency Lead)",
      role: "AGENT_OWNER",
      agencyId: agency.id,
      isActive: true,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      id: "usr_customer_01",
      email: "customer@example.com",
      passwordHash: customerPasswordHash,
      name: "Denis Traveler",
      role: "CUSTOMER",
      isActive: true,
    },
  });

  // 4. Seed API & Security Configurations
  const apiConfigs = [
    {
      category: "SUPPLIER",
      configKey: "SUPPLIER_PROVIDER_NAME",
      configValue: "MockFlightEngine (IATA Agnostic)",
      isSecret: false,
      description: "Active flight search and ticketing supplier engine",
    },
    {
      category: "SUPPLIER",
      configKey: "SUPPLIER_ENV",
      configValue: "sandbox",
      isSecret: false,
      description: "Supplier environment: mock, sandbox, or production",
    },
    {
      category: "SUPPLIER",
      configKey: "SUPPLIER_BASE_URL",
      configValue: "https://api.supplier-sandbox.example.com/v1",
      isSecret: false,
      description: "Base endpoint for flight content and booking orders",
    },
    {
      category: "SUPPLIER",
      configKey: "SUPPLIER_CLIENT_ID",
      configValue: "pn_tours_client_89104",
      isSecret: false,
      description: "Supplier OAuth client ID",
    },
    {
      category: "SUPPLIER",
      configKey: "SUPPLIER_CLIENT_SECRET",
      configValue: "sk_test_98fbc10842a981048b209e",
      isSecret: true,
      description: "Supplier OAuth client secret (encrypted in storage)",
    },
    {
      category: "IATA",
      configKey: "IATA_ACCREDITATION_NUMBER",
      configValue: "96-2 1849 2",
      isSecret: false,
      description: "Agency official IATA numeric identification code",
    },
    {
      category: "IATA",
      configKey: "IATA_TICKETING_AUTHORITY",
      configValue: "BSP-UGANDA-ACTIVE",
      isSecret: false,
      description: "Billing and Settlement Plan (BSP) issuance accreditation",
    },
    {
      category: "PAYMENT",
      configKey: "PAYMENT_GATEWAY_PROVIDER",
      configValue: "MockPaymentGateway (Card & Mobile Money)",
      isSecret: false,
      description: "Primary payment gateway processor",
    },
    {
      category: "PAYMENT",
      configKey: "PAYMENT_PUBLIC_KEY",
      configValue: "pk_test_4892019482104",
      isSecret: false,
      description: "Public publishable client token for checkout",
    },
    {
      category: "PAYMENT",
      configKey: "PAYMENT_SECRET_KEY",
      configValue: "sk_test_secret_9981028491",
      isSecret: true,
      description: "Private API key for charge captures and refunds",
    },
    {
      category: "PAYMENT",
      configKey: "PAYMENT_WEBHOOK_SECRET",
      configValue: "whsec_9849201849201",
      isSecret: true,
      description: "Signature key to verify incoming payment webhooks",
    },
    {
      category: "SECURITY",
      configKey: "SESSION_SECRET",
      configValue: "pntours-production-session-crypto-key-2026",
      isSecret: true,
      description: "Cryptographic secret used for HTTP-only session tokens",
    },
  ];

  for (const conf of apiConfigs) {
    await prisma.apiSecurityConfig.create({
      data: {
        ...conf,
        updatedBy: adminUser.id,
      },
    });
  }

  // 5. Seed Multi-Tier Pricing Rules
  const pricingRules = [
    {
      id: "rule_global_default",
      name: "Global Airline Service Fee",
      priority: 100,
      type: "FIXED",
      amountMinorOrPercent: 2000, // $20.00
      appliesTo: "GLOBAL",
      active: true,
    },
    {
      id: "rule_airline_emirates",
      name: "Emirates Premium Route Markup",
      priority: 80,
      type: "PERCENTAGE",
      amountMinorOrPercent: 4, // 4%
      appliesTo: "AIRLINE",
      targetCode: "EK",
      active: true,
    },
    {
      id: "rule_cabin_business",
      name: "Business Class Booking Surcharge",
      priority: 70,
      type: "PERCENTAGE",
      amountMinorOrPercent: 5, // 5%
      appliesTo: "CABIN",
      targetCode: "BUSINESS",
      active: true,
    },
    {
      id: "rule_agent_special",
      name: "Premier Agency Preferred Rate",
      priority: 10,
      type: "FIXED",
      amountMinorOrPercent: 1200, // $12.00
      appliesTo: "AGENT",
      targetCode: agency.id,
      active: true,
    },
  ];

  for (const r of pricingRules) {
    await prisma.pricingRule.create({ data: r });
  }

  // 6. Seed Agency Ledger Entries
  await prisma.walletLedger.create({
    data: {
      agencyId: agency.id,
      type: "DEPOSIT",
      amountMinor: 500000,
      balanceBeforeMinor: 0,
      balanceAfterMinor: 500000,
      currency: "USD",
      description: "Initial agency prepaid deposit via Bank Wire",
      actorId: adminUser.id,
    },
  });

  await prisma.walletLedger.create({
    data: {
      agencyId: agency.id,
      type: "BOOKING_DEBIT",
      amountMinor: -62000,
      balanceBeforeMinor: 500000,
      balanceAfterMinor: 438000,
      currency: "USD",
      bookingReference: "PN-748921",
      description: "Flight booking payment for EBB-DXB (PNR: PN784K)",
      actorId: agentUser.id,
    },
  });

  // 7. Seed Initial Booking & Tickets
  const sampleOffer = {
    id: "off_ek_001",
    validatingAirlineCode: "EK",
    validatingAirlineName: "Emirates",
    totalDurationMinutes: 315,
    stops: 0,
    cabinClass: "ECONOMY",
    baggageAllowance: "2 x 23kg Checked Bags",
    outboundSegments: [
      {
        id: "seg_1",
        airlineCode: "EK",
        airlineName: "Emirates",
        flightNumber: "EK730",
        aircraft: "Boeing 777-300ER",
        originAirport: "EBB",
        destinationAirport: "DXB",
        departureTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 315 * 60000).toISOString(),
        durationMinutes: 315,
        cabinClass: "ECONOMY",
      },
    ],
  };

  const samplePrice = {
    currency: "USD",
    baseFareMinor: 52000,
    taxesMinor: 8500,
    feesMinor: 1500,
    adminMarkupMinor: 2000,
    agentMarkupMinor: 0,
    totalMinor: 64000,
  };

  const samplePax = [
    {
      title: "MR",
      firstName: "Denis",
      lastName: "Ayiko",
      passportNumber: "UG849201",
      nationality: "UG",
    },
  ];

  const booking1 = await prisma.booking.create({
    data: {
      reference: "PN-748921",
      pnr: "PN784K",
      status: "TICKETED",
      paymentStatus: "SUCCEEDED",
      ticketStatus: "ISSUED",
      userId: customerUser.id,
      contactEmail: "traveler@example.com",
      contactPhone: "+256 785360444",
      currency: "USD",
      priceSnapshotJson: JSON.stringify(samplePrice),
      offerSnapshotJson: JSON.stringify(sampleOffer),
      passengersJson: JSON.stringify(samplePax),
    },
  });

  await prisma.ticket.create({
    data: {
      bookingId: booking1.id,
      ticketNumber: "176-4892019482",
      passengerName: "Denis Ayiko",
      airlineCode: "EK",
    },
  });

  // 8. Seed Initial Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      action: "SYSTEM_INITIALIZATION",
      target: "DATABASE",
      details: "Database initialized with secure seed data and encrypted configuration keys",
      ipAddress: "127.0.0.1",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
