"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Globe, ChevronDown, Luggage, Plane, Menu, X, ExternalLink, Compass } from "lucide-react";
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

  const navClasses = "bg-canvas text-ink border-b border-hairline";

  const linkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-200 shadow-sm ${navClasses}`}>
      {/* Top utility bar */}
      <div className="bg-surface-soft/80 border-b border-hairline py-1.5 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 text-muted">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-ink">IATA Accredited</span>
            </span>
            <span className="hidden sm:inline text-hairline">|</span>
            <span className="hidden sm:inline">24/7 Ticketing Desk</span>
            <span className="hidden md:inline text-hairline">|</span>
            <a
              href="tel:+256785360444"
              className="hidden md:inline-flex items-center space-x-1 text-primary hover:underline font-mono font-bold"
            >
              <Phone className="w-3 h-3" />
              <span>+256 785360444</span>
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {/* Currency selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCurrencyOpen(!currencyOpen)}
                aria-expanded={currencyOpen}
                aria-label="Select display currency"
                className="flex items-center space-x-1 font-mono font-bold hover:text-primary transition-colors py-1 px-2 rounded hover:bg-surface text-ink text-xs min-h-[32px]"
              >
                <Globe className="w-3.5 h-3.5 text-muted" />
                <span>{currency}</span>
                <ChevronDown className={`w-3 h-3 text-muted transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
              </button>

              {currencyOpen && (
                <div
                  className="absolute right-0 mt-1 w-28 rounded-lg shadow-xl border border-hairline py-1 z-50 bg-canvas text-ink animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                >
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted border-b border-hairline">
                    Currency
                  </div>
                  {currencies.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCurrency(c);
                        setCurrencyOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono font-bold hover:bg-surface-soft flex items-center justify-between ${
                        currency === c ? "text-primary bg-primary/5" : "text-ink"
                      }`}
                      role="menuitem"
                    >
                      <span>{c}</span>
                      {currency === c && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-hairline">|</span>

            <Link
              href="/account/trips"
              className="hover:text-primary transition-colors py-1 text-muted hover:text-ink font-medium min-h-[32px] flex items-center"
            >
              My Bookings
            </Link>

            <span className="text-hairline">|</span>

            <Link
              href="/admin/login"
              className="hover:text-primary transition-colors py-1 text-muted hover:text-ink font-medium min-h-[32px] flex items-center"
            >
              Agent Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center space-x-3 group min-w-0" aria-label="PN Tours & Travel Air Ticketing Home">
          {!logoError ? (
            <img
              src={brandLogoUrl}
              alt="PN Tours & Travel Logo"
              className="h-10 sm:h-12 w-auto max-w-[140px] sm:max-w-[170px] object-contain flex-shrink-0 transition-transform group-hover:scale-[1.02]"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
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
        <nav className="hidden md:flex items-center space-x-7 text-sm font-medium" aria-label="Main Navigation">
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
            href="https://pntoursandtravel.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors hover:text-primary py-2 flex items-center space-x-1.5 group ${
              darkHero ? "text-on-dark/80" : "text-body"
            }`}
          >
            <span>Tours & Holiday Packages</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors opacity-70" />
          </a>
        </nav>

        {/* Right Action & Mobile Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link href="/account/trips" className="inline-flex items-center">
            <Button variant="primary" size="sm" className="flex items-center space-x-1.5 min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 text-xs sm:text-sm font-semibold">
              <Luggage className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Manage Booking</span>
              <span className="xs:hidden">Manage</span>
            </Button>
          </Link>

          {/* Mobile Hamburger Toggle Button (min 44px touch target) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className={`md:hidden w-10 h-10 sm:w-11 sm:h-11 rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
              darkHero
                ? "text-on-dark hover:bg-white/10 active:bg-white/20"
                : "text-ink hover:bg-surface-soft active:bg-hairline"
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (< md) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-hairline bg-canvas text-ink animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          <nav className="p-4 space-y-3" aria-label="Mobile Navigation">
            {/* 1. Flight Search */}
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

            {/* 2. My Trips & E-Tickets */}
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

            {/* 3. Tours & Holiday Packages */}
            <a
              href="https://pntoursandtravel.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-lg text-sm font-medium hover:bg-surface-soft text-ink transition-colors min-h-[48px] border border-hairline/60"
            >
              <div className="flex items-center space-x-3">
                <Compass className="w-4 h-4 text-primary" />
                <span className="font-semibold text-primary">Tours & Holiday Packages</span>
              </div>
              <ExternalLink className="w-4 h-4 text-muted" />
            </a>

            {/* 4. Manage Booking & Check-in */}
            <Link
              href="/account/trips"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-lg text-sm font-semibold bg-primary text-on-primary hover:bg-primary/90 transition-all min-h-[48px] shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <Luggage className="w-4 h-4" />
                <span>Manage Booking & Check-in</span>
              </div>
              <span className="text-[10px] bg-black/15 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                Instant Access
              </span>
            </Link>

            {/* 5. 24/7 Ticketing Hotline */}
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
          </nav>
        </div>
      )}
    </header>
  );
};

