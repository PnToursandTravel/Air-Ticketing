"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, Phone, Globe, Shield, User, Briefcase, ChevronDown } from "lucide-react";
import { Button } from "./Button";
import { Currency } from "@/types";

interface NavbarProps {
  currentCurrency?: Currency;
  onCurrencyChange?: (c: Currency) => void;
  darkHero?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCurrency = "USD",
  onCurrencyChange,
  darkHero = false,
}) => {
  const pathname = usePathname();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  const currencies: Currency[] = ["USD", "UGX", "EUR", "GBP", "KES"];

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
      {/* Top micro-bar for 24/7 hotline and multi-currency notice */}
      <div className={`text-xs py-1.5 px-4 sm:px-8 border-b ${darkHero ? "border-white/10 bg-surface-dark-elevated text-on-dark-soft" : "border-hairline bg-surface-soft text-body"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>24/7 Ticketing Desk:</span>
              <a href="tel:+256785360444" className="text-primary hover:underline font-mono">
                +256 785360444
              </a>
            </span>
            <span className="hidden md:inline text-muted-soft">|</span>
            <span className="hidden md:inline text-muted font-normal">
              Worldwide IATA Flight Content & Immediate PNR Issuance
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Currency selector */}
            <div className="relative">
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className={`flex items-center space-x-1 font-mono text-xs px-2 py-0.5 rounded-pill border ${darkHero ? "border-white/20 text-on-dark" : "border-hairline text-ink bg-canvas"}`}
              >
                <Globe className="w-3 h-3 text-primary" />
                <span>{currentCurrency}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {currencyOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-canvas text-ink rounded-md border border-hairline shadow-lg py-1 z-50">
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        if (onCurrencyChange) onCurrencyChange(c);
                        setCurrencyOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-surface-soft font-mono flex items-center justify-between ${
                        currentCurrency === c ? "text-primary font-bold" : "text-ink"
                      }`}
                    >
                      <span>{c}</span>
                      {currentCurrency === c && <span className="text-primary text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Demo switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center space-x-1"
              >
                <span>Switch Portal</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
              {roleOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-canvas text-ink rounded-md border border-hairline shadow-xl py-1 z-50">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-muted border-b border-hairline">
                    Demo Portals
                  </div>
                  <Link
                    href="/"
                    onClick={() => setRoleOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-xs hover:bg-surface-soft text-ink"
                  >
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>Customer Portal</span>
                  </Link>
                  <Link
                    href="/agent"
                    onClick={() => setRoleOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-xs hover:bg-surface-soft text-ink"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    <span>Agent B2B Portal</span>
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setRoleOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-xs hover:bg-surface-soft text-ink"
                  >
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span>Admin Operations</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand logo & title */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-pill bg-primary/10 flex items-center justify-center p-1.5 border border-primary/20 group-hover:scale-105 transition-transform">
            <Plane className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className={`text-base font-bold tracking-tight font-sans ${darkHero ? "text-on-dark" : "text-ink"}`}>
              PN Tours & Travel
            </span>
            <span className="text-[10px] tracking-wider uppercase text-muted font-semibold">
              Air Ticketing Platform
            </span>
          </div>
        </Link>

        {/* Center menu links */}
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
            My Trips
          </Link>
          <Link
            href="/agent"
            className={`transition-colors hover:text-primary ${
              linkActive("/agent")
                ? "text-primary font-semibold"
                : darkHero
                ? "text-on-dark/80"
                : "text-body"
            }`}
          >
            Agent Portal
          </Link>
          <Link
            href="/admin"
            className={`transition-colors hover:text-primary ${
              linkActive("/admin")
                ? "text-primary font-semibold"
                : darkHero
                ? "text-on-dark/80"
                : "text-body"
            }`}
          >
            Admin Operations
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center space-x-3">
          <Link href="/agent">
            <Button variant={darkHero ? "secondary-dark" : "secondary-light"} size="sm">
              Agent Log In
            </Button>
          </Link>
          <Link href="/account/trips">
            <Button variant="primary" size="sm">
              Manage Booking
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
