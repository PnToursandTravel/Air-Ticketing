import React from "react";
import Link from "next/link";
import { Plane, Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-canvas text-body border-t border-hairline pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-hairline">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-pill bg-primary/10 flex items-center justify-center p-1.5 border border-primary/20">
                <Plane className="w-4 h-4 text-primary" />
              </div>
              <span className="text-lg font-bold text-ink tracking-tight font-sans">
                PN Tours & Travel
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-sm">
              Worldwide air ticketing, corporate travel management, and IATA-accredited agency booking solutions. Built with institutional reliability, immediate e-ticketing, and transparent fare conditions.
            </p>
            <div className="pt-2 space-y-2 text-xs text-body font-mono">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>Hotline: +256 785360444 (24/7 Desk)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>Email: support@pntoursandtravel.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Headquarters: Kampala, Uganda / Worldwide Operations</span>
              </div>
            </div>
          </div>

          {/* Flights Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Flight Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  International Flight Search
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Domestic & Regional Flights
                </Link>
              </li>
              <li>
                <Link href="/account/trips" className="hover:text-primary transition-colors">
                  Manage Booking & E-Tickets
                </Link>
              </li>
              <li>
                <Link href="/account/trips" className="hover:text-primary transition-colors">
                  Online Flight Check-in
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Flight Schedule Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Agency & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">B2B & Partners</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/agent" className="hover:text-primary transition-colors">
                  Agent B2B Portal
                </Link>
              </li>
              <li>
                <Link href="/agent" className="hover:text-primary transition-colors">
                  Prepaid Wallet & Ledger
                </Link>
              </li>
              <li>
                <Link href="/agent" className="hover:text-primary transition-colors">
                  Agency Registration
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Admin Operations Console
                </Link>
              </li>
              <li>
                <Link href="/admin/pricing" className="hover:text-primary transition-colors">
                  Global Fare Markup Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Trust & Security</h4>
            <div className="space-y-2 text-xs text-muted leading-relaxed">
              <div className="flex items-center space-x-1.5 text-ink font-semibold">
                <ShieldCheck className="w-4 h-4 text-semantic-up" />
                <span>Encrypted Transactions</span>
              </div>
              <p>
                All bookings, customer passport credentials, and payments are guarded by TLS 1.3 encryption and institutional RBAC.
              </p>
              <div className="pt-2 text-[11px] font-mono text-muted">
                IATA Industry Compliant Architecture
              </div>
            </div>
          </div>
        </div>

        {/* Legal Band */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} PN Tours and Travel. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-ink transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-ink transition-colors cursor-pointer">Terms of Carriage</span>
            <span className="hover:text-ink transition-colors cursor-pointer">Refund & Cancellation Rules</span>
            <span className="hover:text-ink transition-colors cursor-pointer">Security Disclosures</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
