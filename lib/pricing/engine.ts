import { Currency, FlightOffer, FlightPriceBreakdown, PricingRule } from "@/types";
import { convertCurrency } from "@/lib/utils";

// Default system pricing rules
export const DEFAULT_PRICING_RULES: PricingRule[] = [
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
    targetCode: "agency_premier_01",
    active: true,
  },
];

export interface PriceCalculationContext {
  agencyId?: string;
  agentCustomMarkupMinor?: number;
  targetCurrency?: Currency;
}

export function calculateBookingPrice(
  offer: FlightOffer,
  rules: PricingRule[] = DEFAULT_PRICING_RULES,
  context: PriceCalculationContext = {}
): FlightPriceBreakdown {
  const currency = context.targetCurrency || offer.price.currency;
  
  // Base fare and supplier taxes
  const baseMinor = convertCurrency(offer.price.baseFareMinor, currency);
  const taxesMinor = convertCurrency(offer.price.taxesMinor, currency);
  const feesMinor = convertCurrency(offer.price.feesMinor, currency);

  let adminMarkupMinor = 0;

  // Filter active rules sorted by priority (lowest number = highest priority)
  const activeRules = rules
    .filter((r) => r.active)
    .sort((a, b) => a.priority - b.priority);

  // 1. Check Agent-specific rule first if agent context exists
  let matchedRule: PricingRule | undefined;
  if (context.agencyId) {
    matchedRule = activeRules.find(
      (r) => r.appliesTo === "AGENT" && r.targetCode === context.agencyId
    );
  }

  // 2. Check Route / Airline / Cabin rules
  if (!matchedRule) {
    matchedRule = activeRules.find((r) => {
      if (r.appliesTo === "AIRLINE" && r.targetCode === offer.validatingAirlineCode) return true;
      if (r.appliesTo === "CABIN" && r.targetCode === offer.cabinClass) return true;
      return false;
    });
  }

  // 3. Fallback to Global rule
  if (!matchedRule) {
    matchedRule = activeRules.find((r) => r.appliesTo === "GLOBAL");
  }

  // Apply markup based on matched rule
  if (matchedRule) {
    if (matchedRule.type === "FIXED") {
      adminMarkupMinor = convertCurrency(matchedRule.amountMinorOrPercent, currency);
    } else {
      // Percentage of base fare
      adminMarkupMinor = Math.round((baseMinor * matchedRule.amountMinorOrPercent) / 100);
    }
  }

  // Add agent custom markup if specified by agency
  const agentMarkupMinor = context.agentCustomMarkupMinor
    ? convertCurrency(context.agentCustomMarkupMinor, currency)
    : 0;

  const totalMinor = baseMinor + taxesMinor + feesMinor + adminMarkupMinor + agentMarkupMinor;

  return {
    currency,
    baseFareMinor: baseMinor,
    taxesMinor,
    feesMinor,
    adminMarkupMinor,
    agentMarkupMinor,
    totalMinor,
  };
}
