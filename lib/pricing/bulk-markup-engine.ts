import { Currency } from "@/types";

export interface PricingCalculationInput {
  supplierPriceMinor: number;
  currency: Currency | string;
  airline?: string | null;
  airlineCode?: string | null;
  cabinClass?: string | null;
  origin?: string | null;
  destination?: string | null;
  passengerType?: string | null;
  manualOverrideCustomerPriceMinor?: number | null;
}

export interface MarkupRuleItem {
  id: string;
  name: string;
  priority: number;
  type: string; // "PERCENTAGE" or "FIXED"
  amountMinorOrPercent: number;
  appliesTo: string; // "GLOBAL", "AIRLINE", "CABIN", "ROUTE", "AGENT"
  targetCode?: string | null;
  active: boolean;
}

export interface PricingCalculationResult {
  supplierPriceMinor: number;
  markupPercentage: number;
  profitMinor: number;
  customerPriceMinor: number;
  currency: string;
  pricingStatus: "Calculated" | "Updated" | "Price Changed" | "Expired" | "Booked" | "Paid" | "Ticketed" | "Cancelled" | "Refunded" | "Error";
  markupRuleUsed: string;
  errorMessage?: string | null;
}

export const SUPPORTED_CURRENCIES = new Set(["USD", "UGX", "EUR", "GBP", "KES"]);

/**
 * Resolves the active markup rule based on priority hierarchy:
 * 1. Specific airline rule (highest priority)
 * 2. Cabin class rule
 * 3. Route / Scope rule
 * 4. Default global markup
 */
export function resolveMarkupRule(
  input: PricingCalculationInput,
  rules: MarkupRuleItem[] = [],
  defaultMarkupPercent: number = 10.0,
  isAutomaticEnabled: boolean = true
): { markupPercentage: number; ruleName: string } {
  // When automatic markup is turned OFF
  if (!isAutomaticEnabled) {
    return {
      markupPercentage: 0,
      ruleName: "Automatic Markup OFF (Supplier Price)",
    };
  }

  const activeRules = rules
    .filter((r) => r.active)
    .sort((a, b) => a.priority - b.priority);

  // 1. Airline specific rule
  if (input.airlineCode || input.airline) {
    const airlineRule = activeRules.find(
      (r) =>
        r.appliesTo === "AIRLINE" &&
        r.targetCode &&
        (r.targetCode.toUpperCase() === (input.airlineCode || "").toUpperCase() ||
          r.targetCode.toUpperCase() === (input.airline || "").toUpperCase())
    );
    if (airlineRule) {
      return {
        markupPercentage: airlineRule.amountMinorOrPercent,
        ruleName: `${airlineRule.name} – ${airlineRule.amountMinorOrPercent}%`,
      };
    }
  }

  // 2. Cabin class rule
  if (input.cabinClass) {
    const cabinRule = activeRules.find(
      (r) =>
        r.appliesTo === "CABIN" &&
        r.targetCode &&
        r.targetCode.toUpperCase() === input.cabinClass?.toUpperCase()
    );
    if (cabinRule) {
      return {
        markupPercentage: cabinRule.amountMinorOrPercent,
        ruleName: `${cabinRule.name} – ${cabinRule.amountMinorOrPercent}%`,
      };
    }
  }

  // 3. Route rule (e.g. EBB-NBO or INTERNATIONAL)
  if (input.origin && input.destination) {
    const routeCode = `${input.origin}-${input.destination}`.toUpperCase();
    const routeRule = activeRules.find(
      (r) =>
        r.appliesTo === "ROUTE" &&
        r.targetCode &&
        r.targetCode.toUpperCase() === routeCode
    );
    if (routeRule) {
      return {
        markupPercentage: routeRule.amountMinorOrPercent,
        ruleName: `${routeRule.name} – ${routeRule.amountMinorOrPercent}%`,
      };
    }
  }

  // 4. Fallback: Default Markup
  return {
    markupPercentage: defaultMarkupPercent,
    ruleName: `Default Markup – ${defaultMarkupPercent}%`,
  };
}

/**
 * Main Ticket Markup Calculation:
 * Profit Amount = Supplier Ticket Price × Markup Percentage
 * Customer Final Price = Supplier Ticket Price + Profit Amount
 */
export function calculateTicketMarkup(
  input: PricingCalculationInput,
  rules: MarkupRuleItem[] = [],
  defaultMarkupPercent: number = 10.0,
  isAutomaticEnabled: boolean = true
): PricingCalculationResult {
  const currency = (input.currency || "").toUpperCase();

  // Validation 1: Missing or invalid currency
  if (!currency) {
    return {
      supplierPriceMinor: input.supplierPriceMinor || 0,
      markupPercentage: 0,
      profitMinor: 0,
      customerPriceMinor: input.supplierPriceMinor || 0,
      currency: "USD",
      pricingStatus: "Error",
      markupRuleUsed: "Validation Failed",
      errorMessage: "Missing currency",
    };
  }

  if (!SUPPORTED_CURRENCIES.has(currency)) {
    return {
      supplierPriceMinor: input.supplierPriceMinor || 0,
      markupPercentage: 0,
      profitMinor: 0,
      customerPriceMinor: input.supplierPriceMinor || 0,
      currency,
      pricingStatus: "Error",
      markupRuleUsed: "Validation Failed",
      errorMessage: `Unsupported currency '${currency}'`,
    };
  }

  // Validation 2: Missing or non-positive supplier price
  if (input.supplierPriceMinor === undefined || input.supplierPriceMinor === null || isNaN(input.supplierPriceMinor)) {
    return {
      supplierPriceMinor: 0,
      markupPercentage: 0,
      profitMinor: 0,
      customerPriceMinor: 0,
      currency,
      pricingStatus: "Error",
      markupRuleUsed: "Validation Failed",
      errorMessage: "Missing supplier price",
    };
  }

  if (input.supplierPriceMinor <= 0) {
    return {
      supplierPriceMinor: input.supplierPriceMinor,
      markupPercentage: 0,
      profitMinor: 0,
      customerPriceMinor: 0,
      currency,
      pricingStatus: "Error",
      markupRuleUsed: "Validation Failed",
      errorMessage: "Supplier price must be greater than zero",
    };
  }

  // Validation 3: Invalid markup percentage
  if (defaultMarkupPercent < 0 || isNaN(defaultMarkupPercent)) {
    return {
      supplierPriceMinor: input.supplierPriceMinor,
      markupPercentage: 0,
      profitMinor: 0,
      customerPriceMinor: input.supplierPriceMinor,
      currency,
      pricingStatus: "Error",
      markupRuleUsed: "Validation Failed",
      errorMessage: "Invalid markup percentage",
    };
  }

  // If manual customer price override provided by authorized staff
  if (input.manualOverrideCustomerPriceMinor && input.manualOverrideCustomerPriceMinor >= input.supplierPriceMinor) {
    const profitMinor = input.manualOverrideCustomerPriceMinor - input.supplierPriceMinor;
    const markupPercentage = Number(((profitMinor / input.supplierPriceMinor) * 100).toFixed(2));
    return {
      supplierPriceMinor: input.supplierPriceMinor,
      markupPercentage,
      profitMinor,
      customerPriceMinor: input.manualOverrideCustomerPriceMinor,
      currency,
      pricingStatus: "Calculated",
      markupRuleUsed: "Manual Staff Override",
      errorMessage: null,
    };
  }

  // Automatic rule resolution
  const { markupPercentage, ruleName } = resolveMarkupRule(
    input,
    rules,
    defaultMarkupPercent,
    isAutomaticEnabled
  );

  // Profit Amount = Supplier Ticket Price × Markup Percentage
  const profitMinor = Math.round(input.supplierPriceMinor * (markupPercentage / 100));

  // Customer Final Price = Supplier Ticket Price + Profit Amount
  const customerPriceMinor = input.supplierPriceMinor + profitMinor;

  return {
    supplierPriceMinor: input.supplierPriceMinor,
    markupPercentage,
    profitMinor,
    customerPriceMinor,
    currency,
    pricingStatus: "Calculated",
    markupRuleUsed: ruleName,
    errorMessage: null,
  };
}

/**
 * Check whether a ticket can be recalculated.
 * PAID, TICKETED, and REFUNDED tickets are permanently frozen.
 */
export function isTicketModifiable(status: string, isSold: boolean): boolean {
  if (isSold) return false;
  const lockedStatuses = new Set(["PAID", "TICKETED", "REFUNDED", "CANCELLED"]);
  return !lockedStatuses.has(status.toUpperCase());
}
