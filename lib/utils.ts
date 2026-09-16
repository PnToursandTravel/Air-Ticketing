import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Currency } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCY_RATES: Record<Currency, { rateAgainstUSD: number; symbol: string; decimals: number }> = {
  USD: { rateAgainstUSD: 1.0, symbol: "$", decimals: 2 },
  UGX: { rateAgainstUSD: 3750.0, symbol: "UGX ", decimals: 0 },
  EUR: { rateAgainstUSD: 0.92, symbol: "€", decimals: 2 },
  GBP: { rateAgainstUSD: 0.79, symbol: "£", decimals: 2 },
  KES: { rateAgainstUSD: 130.0, symbol: "KES ", decimals: 0 },
};

/**
 * Format minor currency units into human readable strings
 * (e.g. 52000 minor USD -> "$520.00", 150000000 minor UGX -> "UGX 1,500,000")
 */
export function formatMoney(amountMinor: number, currency: Currency = "USD"): string {
  const meta = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const majorValue = amountMinor / (meta.decimals === 0 ? 1 : 100);
  
  return (
    meta.symbol +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: meta.decimals,
      maximumFractionDigits: meta.decimals,
    }).format(majorValue)
  );
}

/**
 * Converts minor units of a base currency (USD) to target currency minor units
 */
export function convertCurrency(amountMinorUSD: number, targetCurrency: Currency): number {
  const meta = CURRENCY_RATES[targetCurrency];
  if (!meta) return amountMinorUSD;
  if (targetCurrency === "USD") return amountMinorUSD;

  // Convert USD minor to USD major, multiply by rate, then convert to target minor units
  const majorUSD = amountMinorUSD / 100;
  const majorTarget = majorUSD * meta.rateAgainstUSD;
  return meta.decimals === 0 ? Math.round(majorTarget) : Math.round(majorTarget * 100);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatFlightTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return isoString;
  }
}

export function formatFlightDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  } catch {
    return isoString;
  }
}

/**
 * Safely parse a fetch response as JSON, preventing SyntaxError: "Unexpected end of JSON input"
 * when the server responds with empty body, 204, or non-JSON content.
 */
export async function parseResponseJson<T = any>(
  res: Response
): Promise<{ data: T | null; error: string | null }> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      return {
        data: null,
        error: res.ok ? null : `Server returned empty response (HTTP ${res.status})`,
      };
    }
    const data = JSON.parse(text) as T;
    return { data, error: null };
  } catch {
    return {
      data: null,
      error: `Invalid response format from server (HTTP ${res.status})`,
    };
  }
}

/**
 * Safely parse incoming NextRequest JSON body without throwing "Unexpected end of JSON input"
 */
export async function parseRequestBody<T = any>(req: Request | any, defaultValue: T = {} as T): Promise<T> {
  try {
    const text = await req.text();
    if (!text || !text.trim()) return defaultValue;
    return JSON.parse(text) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Sanitize error messages so that cryptic technical errors like "Unexpected end of JSON input"
 * are translated into clear, actionable, and user-friendly messages.
 */
export function sanitizeErrorMessage(err: any, fallback = "An unexpected error occurred"): string {
  const msg = typeof err === "string" ? err : err?.message;
  if (!msg) return fallback;
  if (msg.includes("Unexpected end of JSON input") || msg.includes("is not valid JSON") || msg.includes("JSON.parse")) {
    return "The server returned an empty or invalid response. Please verify connectivity or try again.";
  }
  return msg;
}

