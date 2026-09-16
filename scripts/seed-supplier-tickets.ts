import { prisma } from "../lib/db/prisma";
import { SupplierTicketService } from "../lib/pricing/supplier-ticket-service";

async function seed() {
  console.log("Seeding sample supplier tickets...");

  // Ensure default markup setting
  await SupplierTicketService.getMarkupSettings();

  const sampleTickets = [
    {
      supplierReference: "IATA-EBB-NBO-001",
      supplierName: "IATA Direct Connect",
      airline: "Kenya Airways",
      airlineCode: "KQ",
      origin: "EBB",
      destination: "NBO",
      travelDate: new Date("2026-10-15"),
      passengerType: "ADULT",
      cabinClass: "ECONOMY",
      currency: "USD",
      supplierPriceMinor: 30000, // $300
    },
    {
      supplierReference: "IATA-EBB-ADD-002",
      supplierName: "Amadeus GDS",
      airline: "Ethiopian Airlines",
      airlineCode: "ET",
      origin: "EBB",
      destination: "ADD",
      travelDate: new Date("2026-10-18"),
      passengerType: "ADULT",
      cabinClass: "ECONOMY",
      currency: "USD",
      supplierPriceMinor: 50000, // $500
    },
    {
      supplierReference: "IATA-EBB-DXB-003",
      supplierName: "Emirates Direct Connect",
      airline: "Emirates",
      airlineCode: "EK",
      origin: "EBB",
      destination: "DXB",
      travelDate: new Date("2026-11-01"),
      passengerType: "ADULT",
      cabinClass: "ECONOMY",
      currency: "USD",
      supplierPriceMinor: 80000, // $800
    },
    {
      supplierReference: "IATA-EBB-DOH-004",
      supplierName: "Qatar Airways API",
      airline: "Qatar Airways",
      airlineCode: "QR",
      origin: "EBB",
      destination: "DOH",
      travelDate: new Date("2026-11-05"),
      passengerType: "ADULT",
      cabinClass: "BUSINESS",
      currency: "USD",
      supplierPriceMinor: 145000, // $1,450
    },
    {
      supplierReference: "IATA-EBB-LHR-005",
      supplierName: "British Airways NDC",
      airline: "British Airways",
      airlineCode: "BA",
      origin: "EBB",
      destination: "LHR",
      travelDate: new Date("2026-11-12"),
      passengerType: "ADULT",
      cabinClass: "ECONOMY",
      currency: "USD",
      supplierPriceMinor: 92000, // $920
    },
    {
      supplierReference: "IATA-EBB-JNB-006",
      supplierName: "South African Airways Direct",
      airline: "South African Airways",
      airlineCode: "SA",
      origin: "EBB",
      destination: "JNB",
      travelDate: new Date("2026-11-20"),
      passengerType: "ADULT",
      cabinClass: "ECONOMY",
      currency: "USD",
      supplierPriceMinor: 48000, // $480
    },
  ];

  const result = await SupplierTicketService.processBulkTickets(sampleTickets, "API");
  console.log(`Seeded ${result.validCount} tickets successfully.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
