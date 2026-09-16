"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Currency } from "@/types";
import { convertCurrency, formatMoney } from "@/lib/utils";

const SUPPORTED_CURRENCIES: Currency[] = ["USD", "UGX", "EUR", "GBP", "KES"];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  format: (amountMinorUSD: number) => string;
  convert: (amountMinorUSD: number) => number;
  detectedCountry?: string | null;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  format: (amt) => formatMoney(amt, "USD"),
  convert: (amt) => amt,
  detectedCountry: null,
});

/**
 * Instant client-side heuristic from Browser TimeZone & Locale
 * Runs in 0ms synchronously before any network request completes.
 */
function detectClientCurrencyHeuristic(): Currency {
  try {
    if (typeof window === "undefined") return "USD";

    // 1. Timezone inspection
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Kampala") || tz.includes("Uganda")) return "UGX";
    if (tz.includes("Nairobi") || tz.includes("Kenya")) return "KES";
    if (tz.includes("London") || tz.includes("Belfast")) return "GBP";

    const euroTimezones = [
      "Paris", "Berlin", "Rome", "Madrid", "Amsterdam", "Brussels",
      "Vienna", "Dublin", "Helsinki", "Lisbon", "Athens", "Tallinn",
      "Riga", "Vilnius", "Bratislava", "Ljubljana", "Luxembourg"
    ];
    if (euroTimezones.some((city) => tz.includes(city))) {
      return "EUR";
    }

    // 2. Browser language inspection
    const languages = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
    for (const lang of languages) {
      const upper = lang.toUpperCase();
      if (upper.endsWith("-UG") || upper === "LG") return "UGX";
      if (upper.endsWith("-KE") || upper === "SW") return "KES";
      if (upper.endsWith("-GB")) return "GBP";
    }
  } catch {
    // Ignore error
  }
  return "USD";
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  useEffect(() => {
    let isManual = false;

    // 1. Check if user already manually selected a currency in the past
    try {
      isManual = localStorage.getItem("pntours_currency_manual") === "true";
      const saved = localStorage.getItem("pntours_preferred_currency") as Currency;
      if (isManual && saved && SUPPORTED_CURRENCIES.includes(saved)) {
        setCurrencyState(saved);
        return;
      }
    } catch {
      // Ignore
    }

    // 2. Zero-latency instant heuristic (e.g. Uganda time -> UGX right away)
    const instantCurrency = detectClientCurrencyHeuristic();
    if (instantCurrency && instantCurrency !== "USD") {
      setCurrencyState(instantCurrency);
    }

    // 3. Confirm with server-side edge geolocation endpoint (/api/v1/geo)
    let isMounted = true;
    fetch("/api/v1/geo")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;

        if (data.country) {
          setDetectedCountry(data.country);
        }

        // Only override if the user hasn't made an explicit manual choice
        const stillManual = localStorage.getItem("pntours_currency_manual") === "true";
        if (!stillManual && data.currency && SUPPORTED_CURRENCIES.includes(data.currency)) {
          setCurrencyState(data.currency);
          try {
            localStorage.setItem("pntours_preferred_currency", data.currency);
          } catch {
            // Ignore
          }
        }
      })
      .catch(() => {
        // Fallback silently
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem("pntours_preferred_currency", newCurrency);
      localStorage.setItem("pntours_currency_manual", "true"); // Marked as explicit user choice
    } catch {
      // Ignore
    }
  };

  const format = (amountMinorUSD: number) => {
    const convertedMinor = convertCurrency(amountMinorUSD, currency);
    return formatMoney(convertedMinor, currency);
  };

  const convert = (amountMinorUSD: number) => {
    return convertCurrency(amountMinorUSD, currency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, convert, detectedCountry }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export function useCurrency() {
  return useContext(CurrencyContext);
}
