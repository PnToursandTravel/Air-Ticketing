import { describe, it, expect } from "vitest";
import {
  calculateTicketMarkup,
  resolveMarkupRule,
  isTicketModifiable,
  PricingCalculationInput,
  MarkupRuleItem,
} from "@/lib/pricing/bulk-markup-engine";

describe("Bulk Ticket Markup Engine - Core Calculations", () => {
  it("calculates profit and customer price correctly with default 10% markup", () => {
    // Formula:
    // Profit Amount = Supplier Ticket Price × Markup Percentage
    // Customer Final Price = Supplier Ticket Price + Profit Amount
    // Example: Supplier USD 500 (50000 minor), 10% Markup => Profit USD 50 (5000 minor), Customer USD 550 (55000 minor)
    const input: PricingCalculationInput = {
      supplierPriceMinor: 50000,
      currency: "USD",
      airline: "Ethiopian Airlines",
      origin: "EBB",
      destination: "NBO",
    };

    const result = calculateTicketMarkup(input, [], 10.0, true);

    expect(result.pricingStatus).toBe("Calculated");
    expect(result.markupPercentage).toBe(10.0);
    expect(result.profitMinor).toBe(5000); // USD 50
    expect(result.customerPriceMinor).toBe(55000); // USD 550
    expect(result.errorMessage).toBeNull();
  });

  it("processes multiple supplier ticket results matching spec examples", () => {
    // Ticket 1: USD 300 (30000 minor), 10% => Profit USD 30 (3000 minor), Customer USD 330 (33000 minor)
    const t1 = calculateTicketMarkup({ supplierPriceMinor: 30000, currency: "USD" }, [], 10.0, true);
    expect(t1.profitMinor).toBe(3000);
    expect(t1.customerPriceMinor).toBe(33000);

    // Ticket 2: USD 500 (50000 minor), 10% => Profit USD 50 (5000 minor), Customer USD 550 (55000 minor)
    const t2 = calculateTicketMarkup({ supplierPriceMinor: 50000, currency: "USD" }, [], 10.0, true);
    expect(t2.profitMinor).toBe(5000);
    expect(t2.customerPriceMinor).toBe(55000);

    // Ticket 3: USD 800 (80000 minor), 10% => Profit USD 80 (8000 minor), Customer USD 880 (88000 minor)
    const t3 = calculateTicketMarkup({ supplierPriceMinor: 80000, currency: "USD" }, [], 10.0, true);
    expect(t3.profitMinor).toBe(8000);
    expect(t3.customerPriceMinor).toBe(88000);
  });

  it("handles automatic markup turned OFF (displays supplier price without adding markup)", () => {
    const input: PricingCalculationInput = {
      supplierPriceMinor: 50000,
      currency: "USD",
      airline: "Emirates",
    };

    const result = calculateTicketMarkup(input, [], 10.0, false);

    expect(result.markupPercentage).toBe(0);
    expect(result.profitMinor).toBe(0);
    expect(result.customerPriceMinor).toBe(50000);
    expect(result.markupRuleUsed).toContain("Automatic Markup OFF");
  });

  it("handles manual staff price override if authorized admin specifies a customer price", () => {
    const input: PricingCalculationInput = {
      supplierPriceMinor: 50000,
      currency: "USD",
      manualOverrideCustomerPriceMinor: 58000, // Custom admin set price: $580
    };

    const result = calculateTicketMarkup(input, [], 10.0, true);

    expect(result.profitMinor).toBe(8000); // USD 80 profit
    expect(result.customerPriceMinor).toBe(58000);
    expect(result.markupPercentage).toBe(16); // 80 / 500 = 16%
    expect(result.markupRuleUsed).toBe("Manual Staff Override");
  });
});

describe("Bulk Ticket Markup Engine - Validation & Error Handling", () => {
  it("marks ticket with Error when supplier price is missing or zero/negative", () => {
    const zeroPrice = calculateTicketMarkup({ supplierPriceMinor: 0, currency: "USD" }, [], 10.0, true);
    expect(zeroPrice.pricingStatus).toBe("Error");
    expect(zeroPrice.errorMessage).toContain("greater than zero");

    const negativePrice = calculateTicketMarkup({ supplierPriceMinor: -100, currency: "USD" }, [], 10.0, true);
    expect(negativePrice.pricingStatus).toBe("Error");
    expect(negativePrice.errorMessage).toContain("greater than zero");
  });

  it("marks ticket with Error when currency is missing or unsupported", () => {
    const noCurrency = calculateTicketMarkup({ supplierPriceMinor: 50000, currency: "" }, [], 10.0, true);
    expect(noCurrency.pricingStatus).toBe("Error");
    expect(noCurrency.errorMessage).toBe("Missing currency");

    const unsupported = calculateTicketMarkup({ supplierPriceMinor: 50000, currency: "XYZ" }, [], 10.0, true);
    expect(unsupported.pricingStatus).toBe("Error");
    expect(unsupported.errorMessage).toContain("Unsupported currency");
  });

  it("marks ticket with Error when default markup percentage is negative", () => {
    const invalidMarkup = calculateTicketMarkup({ supplierPriceMinor: 50000, currency: "USD" }, [], -5.0, true);
    expect(invalidMarkup.pricingStatus).toBe("Error");
    expect(invalidMarkup.errorMessage).toBe("Invalid markup percentage");
  });
});

describe("Bulk Ticket Markup Engine - Rule Hierarchy & Priority", () => {
  const rules: MarkupRuleItem[] = [
    {
      id: "rule-airline-qr",
      name: "Qatar Airways Special",
      priority: 1,
      type: "PERCENTAGE",
      amountMinorOrPercent: 12.0,
      appliesTo: "AIRLINE",
      targetCode: "QR",
      active: true,
    },
    {
      id: "rule-cabin-biz",
      name: "Business Class Luxury",
      priority: 2,
      type: "PERCENTAGE",
      amountMinorOrPercent: 15.0,
      appliesTo: "CABIN",
      targetCode: "BUSINESS",
      active: true,
    },
    {
      id: "rule-route-ebb-nbo",
      name: "Regional Route EBB-NBO",
      priority: 3,
      type: "PERCENTAGE",
      amountMinorOrPercent: 8.0,
      appliesTo: "ROUTE",
      targetCode: "EBB-NBO",
      active: true,
    },
  ];

  it("gives highest priority to specific airline rule", () => {
    const resolution = resolveMarkupRule(
      {
        supplierPriceMinor: 50000,
        currency: "USD",
        airlineCode: "QR",
        cabinClass: "BUSINESS", // Even if business, airline has higher precedence
      },
      rules,
      10.0,
      true
    );

    expect(resolution.markupPercentage).toBe(12.0);
    expect(resolution.ruleName).toContain("Qatar Airways Special");
  });

  it("applies cabin class rule when no airline rule matches", () => {
    const resolution = resolveMarkupRule(
      {
        supplierPriceMinor: 50000,
        currency: "USD",
        airlineCode: "EK",
        cabinClass: "BUSINESS",
      },
      rules,
      10.0,
      true
    );

    expect(resolution.markupPercentage).toBe(15.0);
    expect(resolution.ruleName).toContain("Business Class Luxury");
  });

  it("applies route rule when neither airline nor cabin matches", () => {
    const resolution = resolveMarkupRule(
      {
        supplierPriceMinor: 50000,
        currency: "USD",
        airlineCode: "KQ",
        cabinClass: "ECONOMY",
        origin: "EBB",
        destination: "NBO",
      },
      rules,
      10.0,
      true
    );

    expect(resolution.markupPercentage).toBe(8.0);
    expect(resolution.ruleName).toContain("Regional Route EBB-NBO");
  });

  it("falls back to default markup when no specific rules match", () => {
    const resolution = resolveMarkupRule(
      {
        supplierPriceMinor: 50000,
        currency: "USD",
        airlineCode: "KQ",
        cabinClass: "ECONOMY",
        origin: "EBB",
        destination: "DXB",
      },
      rules,
      10.0,
      true
    );

    expect(resolution.markupPercentage).toBe(10.0);
    expect(resolution.ruleName).toContain("Default Markup – 10%");
  });
});

describe("Bulk Recalculation Safety & Booking Protection", () => {
  it("allows recalculation on unsold, newly calculated tickets", () => {
    expect(isTicketModifiable("Calculated", false)).toBe(true);
    expect(isTicketModifiable("Updated", false)).toBe(true);
    expect(isTicketModifiable("Price Changed", false)).toBe(true);
  });

  it("strictly prevents recalculation on paid and ticketed bookings", () => {
    // Paid bookings must retain original pricing snapshot
    expect(isTicketModifiable("Paid", false)).toBe(false);
    expect(isTicketModifiable("PAID", false)).toBe(false);

    // Issued e-tickets must retain original pricing snapshot
    expect(isTicketModifiable("Ticketed", false)).toBe(false);
    expect(isTicketModifiable("TICKETED", false)).toBe(false);

    // Cancelled and refunded records keep original audit history
    expect(isTicketModifiable("Refunded", false)).toBe(false);
    expect(isTicketModifiable("Cancelled", false)).toBe(false);

    // Any ticket flagged as sold is immutable
    expect(isTicketModifiable("Calculated", true)).toBe(false);
  });
});
