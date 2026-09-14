"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Globe, ChevronDown, Luggage, Plane } from "lucide-react";
import { Button } from "./Button";
import { Currency } from "@/types";
import { useCurrency } from "@/lib/context/CurrencyContext";

interface NavbarProps {
  darkHero?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ darkHero = false }) => {
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const currencies: Currency[] = ["USD", "UGX", "EUR", "GBP", "KES"];
  const brandLogoUrl = "https://www.image2url.com/r2/default/images/1789406854595-5200c580-b543-4d37-b30f-73c90d73d473.png";

  const navClasses = darkHero
    ? "bg-surface-dark text-on-dark border-b border-white/10"
    : "bg-canvas text-ink border-b border-hairline";

  const linkActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-200 ${navClasses}`}>
      {/* Top micro-bar: 24/7 hotline and multi-currency */}
      <div
        className={`text-xs py-1.5 px-4 sm:px-8 border-b ${
          darkHero
            ? "border-white/10 bg-surface-dark-elevated text-on-dark-soft"
            : "border-hairline bg-surface-soft text-body"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>24/7 Ticketing Desk:</span>
              <a href="tel:+256785360444" className="text-primary hover:underline font-mono font-bold">
                +256 785360444
              </a>
            </span>
            <span className="hidden md:inline text-muted-soft">|</span>
            <span className="hidden md:inline text-muted font-normal">
              Direct Global Airline Content • Zero Hidden Checkout Fees
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Currency selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className={`flex items-center space-x-1.5 font-mono text-xs px-2.5 py-1 rounded-pill border transition-colors ${
                  darkHero
                    ? "border-white/20 text-on-dark hover:bg-white/10"
                    : "border-hairline text-ink bg-canvas hover:bg-surface-soft"
                }`}
              >
                <Globe className="w-3 h-3 text-primary" />
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {currencyOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-canvas text-ink rounded-md border border-hairline shadow-2xl py-1 z-50 animate-in fade-in">
                  <div className="px-3 py-1 text-[10px] font-bold text-muted uppercase tracking-wider border-b border-hairline">
                    Select Currency
                  </div>
                  {currencies.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCurrency(c);
                        setCurrencyOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-surface-soft font-mono flex items-center justify-between ${
                        currency === c ? "text-primary font-bold bg-surface-soft" : "text-ink"
                      }`}
                    >
                      <span>{c}</span>
                      {currency === c && <span className="text-primary text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation: Customer Travel Only */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand logo & title */}
        <Link href="/" className="flex items-center space-x-3 group">
          {!logoError ? (
            <img
              src={brandLogoUrl}
              alt="PN Tours and Travel Logo"
              onError={() => setLogoError(true)}
              className="h-10 w-auto object-contain rounded-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-pill bg-primary/10 flex items-center justify-center p-1.5 border border-primary/20 group-hover:scale-105 transition-transform">
              <Plane className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex flex-col">
            <span className={`text-base font-bold tracking-tight font-sans ${darkHero ? "text-on-dark" : "text-ink"}`}>
              PN Tours & Travel
            </span>
            <span className="text-[10px] tracking-wider uppercase text-muted font-semibold">
              Air Ticketing
            </span>
          </div>
        </Link>

        {/* Center menu links - Customer Travel Only */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link
            href="/"
            className={`transition-colors hover:text-primary ${
              linkActive("/")
                ? "text-primary font-semibold"
                : darkHero
                ? "text-on-dark/80"
                : "text-body"
            }`}
          >
            Flight Search
          </Link>
          <Link
            href="/account/trips"
            className={`transition-colors hover:text-primary ${
              linkActive("/account/trips")
                ? "text-primary font-semibold"
                : darkHero
                ? "text-on-dark/80"
                : "text-body"
            }`}
          >
            My Trips & E-Tickets
          </Link>
          <a
            href="tel:+256785360444"
            className={`transition-colors hover:text-primary flex items-center space-x-1.5 ${
              darkHero ? "text-on-dark/80" : "text-body"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span>24/7 Ticketing Desk</span>
          </a>
        </nav>

        {/* Right Action: Customer Manage Booking */}
        <div className="flex items-center space-x-3">
          <Link href="/account/trips">
            <Button variant="primary" size="sm" className="flex items-center space-x-1.5">
              <Luggage className="w-3.5 h-3.5" />
              <span>Manage Booking</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
