import { NextRequest, NextResponse } from "next/server";
import { Currency } from "@/types";

const EUROZONE_COUNTRIES = new Set([
  "AT", "BE", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT",
  "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

function resolveCurrencyFromCountry(countryCode?: string | null): Currency {
  if (!countryCode) return "USD";
  const code = countryCode.trim().toUpperCase();

  if (code === "UG") return "UGX";
  if (code === "KE") return "KES";
  if (code === "GB") return "GBP";
  if (EUROZONE_COUNTRIES.has(code)) return "EUR";

  return "USD";
}

export async function GET(request: NextRequest) {
  // 1. Inspect Vercel / Cloudflare edge geo headers
  const countryHeader =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    (request as unknown as { geo?: { country?: string } }).geo?.country;

  let country = countryHeader ? countryHeader.toUpperCase() : null;

  // 2. If no header present (e.g. localhost development), optionally resolve from public geo
  if (!country && process.env.NODE_ENV !== "production") {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const res = await fetch("https://ipapi.co/json/", {
        signal: controller.signal,
        headers: { "User-Agent": "pntours-geo/1.0" },
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data && data.country_code) {
          country = data.country_code.toUpperCase();
        }
      }
    } catch {
      // Ignore fallback errors
    }
  }

  const currency = resolveCurrencyFromCountry(country);

  return NextResponse.json(
    {
      country: country || "UNKNOWN",
      currency,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
