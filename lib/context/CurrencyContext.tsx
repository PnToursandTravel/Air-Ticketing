"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Currency } from "@/types";
import { convertCurrency, formatMoney } from "@/lib/utils";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  format: (amountMinorUSD: number) => string;
  convert: (amountMinorUSD: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  format: (amt) => formatMoney(amt, "USD"),
  convert: (amt) => amt,
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pntours_preferred_currency") as Currency;
      if (saved && ["USD", "UGX", "EUR", "GBP", "KES"].includes(saved)) {
        setCurrencyState(saved);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem("pntours_preferred_currency", newCurrency);
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
    <CurrencyContext.Provider value={{ currency, setCurrency, format, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export function useCurrency() {
  return useContext(CurrencyContext);
}
