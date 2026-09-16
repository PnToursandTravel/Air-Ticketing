import { prisma } from "@/lib/db/prisma";
import {
  calculateTicketMarkup,
  isTicketModifiable,
  PricingCalculationInput,
} from "./bulk-markup-engine";

export interface TicketFilterOptions {
  search?: string;
  airline?: string;
  currency?: string;
  pricingStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface RawTicketInput {
  supplierReference: string;
  supplierName?: string;
  airline: string;
  airlineCode?: string;
  origin: string;
  destination: string;
  travelDate: string | Date;
  passengerType?: string;
  cabinClass?: string;
  currency: string;
  supplierPriceMinor: number;
}

export class SupplierTicketService {
  /**
   * Fetch current markup configuration or initialize with default
   */
  static async getMarkupSettings() {
    let setting = await prisma.markupSetting.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!setting) {
      setting = await prisma.markupSetting.create({
        data: {
          defaultMarkupPercent: 10.0,
          isAutomaticEnabled: true,
        },
      });
    }

    return setting;
  }

  /**
   * Update default markup percentage or toggle automatic markup
   */
  static async updateMarkupSettings(params: {
    defaultMarkupPercent: number;
    isAutomaticEnabled: boolean;
    actorUserId?: string;
    actorEmail?: string;
  }) {
    const current = await this.getMarkupSettings();

    const updated = await prisma.markupSetting.update({
      where: { id: current.id },
      data: {
        defaultMarkupPercent: Number(params.defaultMarkupPercent),
        isAutomaticEnabled: params.isAutomaticEnabled,
        updatedByUserId: params.actorUserId || null,
        updatedByEmail: params.actorEmail || null,
      },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          actorUserId: params.actorUserId || null,
          actorEmail: params.actorEmail || "operations@pntoursandtravel.com",
          action: "MARKUP_SETTINGS_UPDATED",
          resourceType: "PRICING_CONFIG",
          resourceId: updated.id,
          outcome: "SUCCESS",
          details: `Updated default markup to ${params.defaultMarkupPercent}% (Automatic: ${
            params.isAutomaticEnabled ? "ON" : "OFF"
          })`,
          beforeStateJson: JSON.stringify({
            defaultMarkupPercent: current.defaultMarkupPercent,
            isAutomaticEnabled: current.isAutomaticEnabled,
          }),
          afterStateJson: JSON.stringify({
            defaultMarkupPercent: updated.defaultMarkupPercent,
            isAutomaticEnabled: updated.isAutomaticEnabled,
          }),
        },
      });
    } catch {
      // Non-blocking audit log
    }

    return updated;
  }

  /**
   * Fetch active tiered pricing rules
   */
  static async getActivePricingRules() {
    try {
      return await prisma.pricingRule.findMany({
        where: { active: true },
        orderBy: { priority: "asc" },
      });
    } catch {
      return [];
    }
  }

  /**
   * Process a single ticket calculation
   */
  static async calculateSingleTicket(input: PricingCalculationInput) {
    const settings = await this.getMarkupSettings();
    const rules = await this.getActivePricingRules();

    return calculateTicketMarkup(
      input,
      rules,
      settings.defaultMarkupPercent,
      settings.isAutomaticEnabled
    );
  }

  /**
   * Bulk ingest and calculate tickets from API, CSV, or Spreadsheet paste
   */
  static async processBulkTickets(
    tickets: RawTicketInput[],
    importedVia: "API" | "CSV" | "MANUAL" = "API"
  ) {
    const settings = await this.getMarkupSettings();
    const rules = await this.getActivePricingRules();

    let validCount = 0;
    let errorCount = 0;
    const processedTicketsData: any[] = [];
    const calculationErrors: { row: number; reference: string; error: string }[] = [];

    tickets.forEach((ticket, idx) => {
      const calculation = calculateTicketMarkup(
        {
          supplierPriceMinor: ticket.supplierPriceMinor,
          currency: ticket.currency,
          airline: ticket.airline,
          airlineCode: ticket.airlineCode,
          cabinClass: ticket.cabinClass,
          origin: ticket.origin,
          destination: ticket.destination,
          passengerType: ticket.passengerType,
        },
        rules,
        settings.defaultMarkupPercent,
        settings.isAutomaticEnabled
      );

      if (calculation.pricingStatus === "Error") {
        errorCount++;
        calculationErrors.push({
          row: idx + 1,
          reference: ticket.supplierReference || `ROW-${idx + 1}`,
          error: calculation.errorMessage || "Validation error",
        });
      } else {
        validCount++;
      }

      // Safe date parse
      let parsedDate = new Date();
      if (ticket.travelDate) {
        const d = new Date(ticket.travelDate);
        if (!isNaN(d.getTime())) parsedDate = d;
      }

      processedTicketsData.push({
        supplierReference: ticket.supplierReference || `SUP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        supplierName: ticket.supplierName || "IATA Direct Connect",
        airline: ticket.airline || "Unknown Carrier",
        airlineCode: ticket.airlineCode || null,
        origin: (ticket.origin || "EBB").toUpperCase(),
        destination: (ticket.destination || "DXB").toUpperCase(),
        travelDate: parsedDate,
        passengerType: (ticket.passengerType || "ADULT").toUpperCase(),
        cabinClass: (ticket.cabinClass || "ECONOMY").toUpperCase(),
        currency: (ticket.currency || "USD").toUpperCase(),
        supplierPriceMinor: calculation.supplierPriceMinor,
        markupPercentage: calculation.markupPercentage,
        profitMinor: calculation.profitMinor,
        customerPriceMinor: calculation.customerPriceMinor,
        pricingStatus: calculation.pricingStatus,
        markupRuleUsed: calculation.markupRuleUsed,
        errorMessage: calculation.errorMessage || null,
        isSold: false,
        importedVia,
      });
    });

    // Save valid tickets in bulk
    const validRecords = processedTicketsData.filter((t) => t.pricingStatus !== "Error");
    if (validRecords.length > 0) {
      await prisma.supplierTicket.createMany({
        data: validRecords,
      });
    }

    return {
      totalReceived: tickets.length,
      validCount,
      errorCount,
      errors: calculationErrors,
      preview: processedTicketsData.slice(0, 10),
    };
  }

  /**
   * Recalculate tickets with current active markup settings.
   * STRICT SAFETY: Never mutates PAID, TICKETED, or REFUNDED bookings.
   */
  static async recalculateTickets(params: {
    scope: "ALL_UNSOLD" | "SELECTED" | "SINGLE";
    ticketIds?: string[];
    actorUserId?: string;
    actorEmail?: string;
  }) {
    const settings = await this.getMarkupSettings();
    const rules = await this.getActivePricingRules();

    let targetTickets: any[] = [];

    if (params.scope === "SINGLE" && params.ticketIds?.[0]) {
      const ticket = await prisma.supplierTicket.findUnique({
        where: { id: params.ticketIds[0] },
      });
      if (ticket) targetTickets = [ticket];
    } else if (params.scope === "SELECTED" && params.ticketIds && params.ticketIds.length > 0) {
      targetTickets = await prisma.supplierTicket.findMany({
        where: { id: { in: params.ticketIds } },
      });
    } else {
      // ALL_UNSOLD: only tickets not marked sold and not in locked statuses
      targetTickets = await prisma.supplierTicket.findMany({
        where: {
          isSold: false,
          pricingStatus: { notIn: ["Paid", "Ticketed", "Refunded", "Cancelled"] },
        },
      });
    }

    let recalculatedCount = 0;
    let skippedCount = 0;

    for (const ticket of targetTickets) {
      // Verify modifiability
      if (!isTicketModifiable(ticket.pricingStatus, ticket.isSold)) {
        skippedCount++;
        continue;
      }

      const calculation = calculateTicketMarkup(
        {
          supplierPriceMinor: ticket.supplierPriceMinor,
          currency: ticket.currency,
          airline: ticket.airline,
          airlineCode: ticket.airlineCode,
          cabinClass: ticket.cabinClass,
          origin: ticket.origin,
          destination: ticket.destination,
          passengerType: ticket.passengerType,
        },
        rules,
        settings.defaultMarkupPercent,
        settings.isAutomaticEnabled
      );

      await prisma.supplierTicket.update({
        where: { id: ticket.id },
        data: {
          markupPercentage: calculation.markupPercentage,
          profitMinor: calculation.profitMinor,
          customerPriceMinor: calculation.customerPriceMinor,
          pricingStatus: "Updated",
          markupRuleUsed: calculation.markupRuleUsed,
          errorMessage: null,
          updatedAt: new Date(),
        },
      });

      recalculatedCount++;
    }

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          actorUserId: params.actorUserId || null,
          actorEmail: params.actorEmail || "operations@pntoursandtravel.com",
          action: "BULK_RECALCULATION_EXECUTED",
          resourceType: "SUPPLIER_TICKETS",
          outcome: "SUCCESS",
          details: `Recalculated ${recalculatedCount} unsold tickets using ${settings.defaultMarkupPercent}% markup. Skipped ${skippedCount} protected/paid tickets.`,
        },
      });
    } catch {
      // Non-blocking
    }

    return {
      totalFound: targetTickets.length,
      recalculatedCount,
      skippedCount,
      markupUsed: settings.defaultMarkupPercent,
    };
  }

  /**
   * List tickets with filtering, pagination, and profit summary
   */
  static async listTickets(filters: TicketFilterOptions = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(10, Number(filters.pageSize) || 25));
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { supplierReference: { contains: q, mode: "insensitive" } },
        { airline: { contains: q, mode: "insensitive" } },
        { origin: { contains: q, mode: "insensitive" } },
        { destination: { contains: q, mode: "insensitive" } },
      ];
    }

    if (filters.airline && filters.airline !== "ALL") {
      where.airline = { contains: filters.airline, mode: "insensitive" };
    }

    if (filters.currency && filters.currency !== "ALL") {
      where.currency = filters.currency.toUpperCase();
    }

    if (filters.pricingStatus && filters.pricingStatus !== "ALL") {
      where.pricingStatus = filters.pricingStatus;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [totalCount, tickets] = await Promise.all([
      prisma.supplierTicket.count({ where }),
      prisma.supplierTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    // Financial Metrics Summary across matching tickets
    const aggregates = await prisma.supplierTicket.aggregate({
      where,
      _sum: {
        supplierPriceMinor: true,
        profitMinor: true,
        customerPriceMinor: true,
      },
      _avg: {
        profitMinor: true,
        markupPercentage: true,
      },
    });

    return {
      tickets,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      summary: {
        totalTicketsProcessed: totalCount,
        totalSupplierCostMinor: aggregates._sum.supplierPriceMinor || 0,
        totalCustomerSalesMinor: aggregates._sum.customerPriceMinor || 0,
        totalExpectedProfitMinor: aggregates._sum.profitMinor || 0,
        averageProfitPerTicketMinor: Math.round(aggregates._avg.profitMinor || 0),
        averageMarkupPercentage: Number((aggregates._avg.markupPercentage || 0).toFixed(2)),
      },
    };
  }

  /**
   * Parse and validate CSV string for pre-import preview
   */
  static async parseAndValidateCSV(csvText: string) {
    const settings = await this.getMarkupSettings();
    const rules = await this.getActivePricingRules();

    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      return {
        totalRows: 0,
        validCount: 0,
        errorCount: 0,
        preview: [],
        errors: ["CSV file is empty or missing headers."],
      };
    }

    const headerLine = lines[0].toLowerCase();
    const headers = headerLine.split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));

    const rows = lines.slice(1);
    const parsedTickets: any[] = [];
    const errorMessages: string[] = [];

    rows.forEach((row, index) => {
      // Split by comma ignoring commas inside quotes
      const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(",");
      const cleanValues = values.map((v) => v.trim().replace(/^["']|["']$/g, ""));

      const record: Record<string, string> = {};
      headers.forEach((h, i) => {
        record[h] = cleanValues[i] || "";
      });

      const ref = record["supplier_reference"] || record["reference"] || `CSV-${index + 1}`;
      const airline = record["airline"] || "Carrier";
      const origin = (record["origin"] || "EBB").toUpperCase();
      const destination = (record["destination"] || "DXB").toUpperCase();
      const currency = (record["currency"] || "USD").toUpperCase();
      const rawPrice = parseFloat(record["supplier_price"] || record["price"] || "0");
      const priceMinor = Math.round(rawPrice * 100);

      const calculation = calculateTicketMarkup(
        {
          supplierPriceMinor: priceMinor,
          currency,
          airline,
          origin,
          destination,
          cabinClass: record["cabin_class"] || "ECONOMY",
          passengerType: record["passenger_type"] || "ADULT",
        },
        rules,
        settings.defaultMarkupPercent,
        settings.isAutomaticEnabled
      );

      if (calculation.pricingStatus === "Error") {
        errorMessages.push(`Row ${index + 2} (${ref}): ${calculation.errorMessage}`);
      }

      parsedTickets.push({
        supplierReference: ref,
        supplierName: record["supplier_name"] || "IATA Direct Connect",
        airline,
        origin,
        destination,
        travelDate: record["travel_date"] || new Date().toISOString().split("T")[0],
        passengerType: (record["passenger_type"] || "ADULT").toUpperCase(),
        cabinClass: (record["cabin_class"] || "ECONOMY").toUpperCase(),
        currency,
        supplierPriceMinor: priceMinor,
        markupPercentage: calculation.markupPercentage,
        profitMinor: calculation.profitMinor,
        customerPriceMinor: calculation.customerPriceMinor,
        pricingStatus: calculation.pricingStatus,
        markupRuleUsed: calculation.markupRuleUsed,
        errorMessage: calculation.errorMessage,
      });
    });

    const validCount = parsedTickets.filter((t) => t.pricingStatus !== "Error").length;
    const errorCount = parsedTickets.length - validCount;

    return {
      totalRows: parsedTickets.length,
      validCount,
      errorCount,
      preview: parsedTickets,
      errors: errorMessages,
    };
  }
}
