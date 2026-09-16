"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plane, Phone, Mail, MapPin, ShieldCheck, Briefcase, Lock, Award, Globe, ExternalLink, UserPlus, Compass, Ticket, CheckCircle2, PhoneCall } from "lucide-react";
import { Button } from "./Button";

export const Footer: React.FC = () => {
  const [logoError, setLogoError] = useState(false);
  const brandLogoUrl = "https://www.image2url.com/r2/default/images/1789406854595-5200c580-b543-4d37-b30f-73c90d73d473.png";

  return (
    <footer className="bg-canvas text-body border-t border-hairline pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-hairline">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              {!logoError ? (
                <img
                  src={brandLogoUrl}
                  alt="PN Tours and Travel Logo"
                  onError={() => setLogoError(true)}
                  className="h-10 w-auto object-contain rounded-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-pill bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Plane className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <span className="text-base font-bold text-ink tracking-tight block">
                  PN Tours and Travel
                </span>
                <span className="text-[10px] tracking-wider uppercase text-muted font-semibold">
                  Air Ticketing & Reservation Platform
                </span>
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              Official IATA-aligned online air travel ticketing portal of PN Tours and Travel Ltd. Search, compare, and instantly book scheduled commercial flights worldwide.
            </p>

            <div className="pt-2 space-y-2 text-xs text-body font-mono">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>24/7 Ticketing Desk: +256 785360444</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>Email: support@pntoursandtravel.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Operations: Kampala, Uganda / Global Network</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
              <div className="flex items-center space-x-2 text-xs text-muted">
                <Award className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Certified Agency Portal</span>
              </div>
              
              <a
                href="https://pntoursandtravel.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button
                  variant="secondary-light"
                  size="sm"
                  className="flex items-center space-x-1.5 text-xs border border-hairline font-semibold hover:border-primary/50"
                >
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <span>Visit pntoursandtravel.com</span>
                  <ExternalLink className="w-3 h-3 text-muted" />
                </Button>
              </a>
            </div>
          </div>

          {/* Flights Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Traveler Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://pntoursandtravel.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors flex items-center space-x-1.5 font-semibold text-primary"
                >
                  <Compass className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>Tours & Holiday Packages</span>
                  <ExternalLink className="w-3 h-3 text-muted ml-0.5" />
                </a>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition-colors flex items-center space-x-1.5">
                  <Plane className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>International Flight Search</span>
                </Link>
              </li>
              <li>
                <Link href="/account/trips" className="hover:text-primary transition-colors flex items-center space-x-1.5">
                  <Ticket className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>Manage Booking & E-Tickets</span>
                </Link>
              </li>
              <li>
                <Link href="/account/trips" className="hover:text-primary transition-colors flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>Check-in Assistance</span>
                </Link>
              </li>
              <li>
                <a href="tel:+256785360444" className="hover:text-primary transition-colors flex items-center space-x-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>24/7 Reservations Hotline</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Partner & Staff Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Partner & Staff</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/agent/login"
                  className="hover:text-primary transition-colors flex items-center space-x-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  <span>Agent B2B Portal Login</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/agent/login"
                  className="hover:text-primary transition-colors flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-primary" />
                  <span>New Agency Application</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="hover:text-primary transition-colors flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span>Staff Operations Login</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Trust & Accreditation</h4>
            <div className="space-y-2 text-xs text-muted leading-relaxed">
              <div className="flex items-center space-x-1.5 text-ink font-semibold">
                <ShieldCheck className="w-4 h-4 text-semantic-up" />
                <span>Encrypted Reservations</span>
              </div>
              <p>
                All bookings and payment transactions are protected by TLS 1.3 encryption and institutional session security.
              </p>
              <div className="pt-2 flex items-center space-x-1.5 text-ink font-semibold">
                <Award className="w-4 h-4 text-primary" />
                <span className="font-mono text-[11px]">IATA Accreditation: 96-2 1849 2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Band */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted space-y-4 md:space-y-0 text-center md:text-left">
          <p>© {new Date().getFullYear()} PN Tours and Travel. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-carriage" className="hover:text-ink transition-colors">Terms of Carriage</Link>
            <Link href="/refund-policy" className="hover:text-ink transition-colors">Refund Policies</Link>
            <Link href="/admin/login" className="hover:text-ink transition-colors flex items-center space-x-1 text-muted">
              <Lock className="w-3 h-3" />
              <span>Internal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
