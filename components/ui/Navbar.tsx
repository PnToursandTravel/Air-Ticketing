"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Globe, ChevronDown, Luggage, Plane, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const currencies: Currency[] = ["USD", "UGX", "EUR", "GBP", "KES"];
  const brandLogoUrl = "https://www.image2url.com/r2/default/images/1789406854595-5200c580-b543-4d37-b30f-73c90d73d473.png";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCurrencyOpen(false);
  }, [pathname]);

  // Handle escape key to close popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setCurrencyOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
        className={`text-xs py-1.5 px-3 sm:px-8 border-b ${
          darkHero
            ? "border-white/10 bg-surface-dark-elevated text-on-dark-soft"
            : "border-hairline bg-surface-soft text-body"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-4 truncate">
            <span className="flex items-center space-x-1.5 font-medium truncate">
              <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="hidden xs:inline">24/7 Desk:</span>
              <a
                href="tel:+256785360444"
                className="text-primary hover:underline font-mono font-bold text-xs"
                aria-label="Call 24/7 Ticketing Desk at +256 785360444"
              >
                +256 785360444
              </a>
            </span>
            <span className="hidden lg:inline text-muted-soft">|</span>
            <span className="hidden lg:inline text-muted font-normal text-[11px]">
              Direct Global Airline Content • Instant PNR Guarantee
            </span>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Currency selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCurrencyOpen(!currencyOpen)}
                aria-expanded={currencyOpen}
                aria-label="Select currency"
                className={`flex items-center space-x-1.5 font-mono text-xs px-2.5 py-1 rounded-pill border transition-colors min-h-[32px] ${
                  darkHero
                    ? "border-white/20 text-on-dark hover:bg-white/10"
                    : "border-hairline text-ink bg-canvas hover:bg-surface-soft"
                }`}
              >
                <Globe className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="font-bold">{currency}</span>
                <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
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
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-surface-soft font-mono flex items-center justify-between min-h-[36px] ${
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
        <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0" aria-label="PN Tours & Travel Home">
          {!logoError ? (
            <img
              src={brandLogoUrl}
              alt="PN Tours and Travel Logo"
              onError={() => setLogoError(true)}
              className="h-9 sm:h-10 w-auto object-contain rounded-sm flex-shrink-0"
            />
          ) : (
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-pill bg-primary/10 flex items-center justify-center p-1.5 border border-primary/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <Plane className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex flex-col truncate">
            <span className={`text-sm sm:text-base font-bold tracking-tight font-sans truncate ${darkHero ? "text-on-dark" : "text-ink"}`}>
              PN Tours & Travel
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-wider uppercase text-muted font-semibold">
              Air Ticketing
            </span>
          </div>
        </Link>

        {/* Center menu links - Desktop (>= md) */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium" aria-label="Main Navigation">
          <Link
            href="/"
            className={`transition-colors hover:text-primary py-2 ${
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
            className={`transition-colors hover:text-primary py-2 ${
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
            className={`transition-colors hover:text-primary flex items-center space-x-1.5 py-2 ${
              darkHero ? "text-on-dark/80" : "text-body"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span>24/7 Ticketing Desk</span>
          </a>
        </nav>

        {/* Right Action & Mobile Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link href="/account/trips" className="hidden sm:inline-block">
            <Button variant="primary" size="sm" className="flex items-center space-x-1.5 min-h-[40px]">
              <Luggage className="w-3.5 h-3.5" />
              <span>Manage Booking</span>
            </Button>
          </Link>

          {/* Mobile Hamburger Toggle Button (min 44px touch target) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className={`md:hidden w-11 h-11 rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
              darkHero
                ? "text-on-dark hover:bg-white/10 active:bg-white/20"
                : "text-ink hover:bg-surface-soft active:bg-hairline"
            }`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (< md) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-hairline bg-canvas text-ink animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          <nav className="p-4 space-y-3" aria-label="Mobile Navigation">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-colors min-h-[48px] ${
                linkActive("/")
                  ? "bg-primary/10 text-primary font-bold"
                  : "hover:bg-surface-soft text-ink"
              }`}
            >
              <Plane className="w-4 h-4 text-primary" />
              <span>Flight Search</span>
            </Link>

            <Link
              href="/account/trips"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-colors min-h-[48px] ${
                linkActive("/account/trips")
                  ? "bg-primary/10 text-primary font-bold"
                  : "hover:bg-surface-soft text-ink"
              }`}
            >
              <Luggage className="w-4 h-4 text-primary" />
              <span>My Trips & E-Tickets</span>
            </Link>

            <a
              href="tel:+256785360444"
              className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium hover:bg-surface-soft text-ink transition-colors min-h-[48px]"
            >
              <Phone className="w-4 h-4 text-primary" />
              <div>
                <span className="block font-semibold">24/7 Ticketing Hotline</span>
                <span className="text-xs text-primary font-mono font-bold">+256 785360444</span>
              </div>
            </a>

            {/* Currency Quick-Switch in Mobile Menu */}
            <div className="pt-2 pb-1 border-t border-hairline">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2 px-1">
                Display Currency
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {currencies.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCurrency(c);
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 text-xs font-mono font-bold rounded-md border text-center transition-all min-h-[44px] flex items-center justify-center ${
                      currency === c
                        ? "border-primary bg-primary text-on-primary shadow-sm"
                        : "border-hairline text-ink hover:bg-surface-soft"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Link href="/account/trips" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button variant="primary" size="md" className="w-full flex items-center justify-center space-x-2 min-h-[48px]">
                  <Luggage className="w-4 h-4" />
                  <span>Manage Booking & Check-in</span>
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

