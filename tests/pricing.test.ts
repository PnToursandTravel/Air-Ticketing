import { describe, it, expect } from "vitest";
import { formatMoney, convertCurrency } from "@/lib/utils";
import { calculateBookingPrice, DEFAULT_PRICING_RULES } from "@/lib/pricing/engine";
import { FlightOffer } from "@/types";

describe("Financial Minor Units & Currency Arithmetic", () => {
  it("formats USD cents into human-readable currency", () => {
    expect(formatMoney(52000, "USD")).toBe("$520.00");
    expect(formatMoney(1050, "USD")).toBe("$10.50");
    expect(formatMoney(0, "USD")).toBe("$0.00");
  });

  it("formats UGX zero-decimal currency without fractional cents", () => {
    expect(formatMoney(1500000, "UGX")).toBe("UGX 1,500,000");
  });

  it("converts USD minor units to other currencies without floating-point error", () => {
    const usdMinor = 10000; // $100.00
    const ugxMinor = convertCurrency(usdMinor, "UGX");
    expect(ugxMinor).toBe(375000); // 100 * 3750
  });
});

describe("Multi-Tier Pricing Engine & Rule Precedence", () => {
  const dummyOffer: FlightOffer = {
    id: "off_test_01",
    provider: "MockFlightEngine",
    validatingAirlineCode: "EK",
    validatingAirlineName: "Emirates",
    outboundSegments: [],
    totalDurationMinutes: 300,
    stops: 0,
    cabinClass: "ECONOMY",
    fareBasisCode: "EFLEX",
    fareFamilyName: "Economy Standard",
    baggageAllowance: "2 x 23kg",
    refundable: true,
    changeAllowed: true,
    seatsRemaining: 9,
    price: {
      currency: "USD",
      baseFareMinor: 50000, // $500.00
      taxesMinor: 8000,     // $80.00
      feesMinor: 2000,      // $20.00
      adminMarkupMinor: 0,
      agentMarkupMinor: 0,
      totalMinor: 60000,
    },
    expiresAt: new Date().toISOString(),
  };

  it("applies airline-specific percentage markup when no agent rule matches", () => {
    // EK markup is 4% of $500.00 base fare = $20.00 (2000 minor)
    const breakdown = calculateBookingPrice(dummyOffer, DEFAULT_PRICING_RULES, {});
    expect(breakdown.adminMarkupMinor).toBe(2000);
    expect(breakdown.totalMinor).toBe(50000 + 8000 + 2000 + 2000);
  });

  it("gives highest priority to agent-specific markup over airline/global rules", () => {
    // Premier agency rule is FIXED $12.00 (1200 minor) with priority 10
    const breakdown = calculateBookingPrice(dummyOffer, DEFAULT_PRICING_RULES, {
      agencyId: "agency_premier_01",
    });
    expect(breakdown.adminMarkupMinor).toBe(1200);
  });

  it("adds custom agent markup on top of admin markup", () => {
    const breakdown = calculateBookingPrice(dummyOffer, DEFAULT_PRICING_RULES, {
      agentCustomMarkupMinor: 3000, // $30.00
    });
    expect(breakdown.agentMarkupMinor).toBe(3000);
    expect(breakdown.totalMinor).toBe(50000 + 8000 + 2000 + 2000 + 3000);
  });
});
