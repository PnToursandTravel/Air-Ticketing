"use client";

import React from "react";
import { ShieldCheck, Award, Globe, Plane } from "lucide-react";

interface Partner {
  name: string;
  type: "Airline" | "GDS" | "Partner";
  tagline?: string;
  code?: string;
}

const PARTNERS: Partner[] = [
  { name: "Emirates", type: "Airline", code: "EK" },
  { name: "Qatar Airways", type: "Airline", code: "QR" },
  { name: "Uganda Airlines", type: "Airline", code: "UR" },
  { name: "Kenya Airways", type: "Airline", code: "KQ" },
  { name: "British Airways", type: "Airline", code: "BA" },
  { name: "KLM Royal Dutch", type: "Airline", code: "KL" },
  { name: "Turkish Airlines", type: "Airline", code: "TK" },
  { name: "Ethiopian Airlines", type: "Airline", code: "ET" },
  { name: "flydubai", type: "Airline", code: "FZ" },
  { name: "Brussels Airlines", type: "Airline", code: "SN" },
  { name: "Amadeus GDS", type: "GDS", code: "1A" },
  { name: "IATA Accredited", type: "Partner", code: "IATA" },
  { name: "Travelport", type: "GDS", code: "1G" },
  { name: "Sabre Global", type: "GDS", code: "1S" },
];

export const PartnersCarousel: React.FC = () => {
  return (
    <section className="w-full py-10 sm:py-14 bg-surface-soft/60 border-y border-hairline overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
          <Globe className="w-3.5 h-3.5" />
          <span>Global Airfare Aggregation & GDS Feeds</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-ink tracking-tight">
          Compare real-time prices from 400+ airlines and global systems
        </h2>
        <p className="text-xs sm:text-sm text-body mt-2 max-w-2xl mx-auto">
          Direct institutional inventory connection through Amadeus, IATA Billing & Settlement Plan (BSP), and international airline desks.
        </p>
      </div>

      {/* Infinite scrolling marquee wrapper */}
      <div className="relative w-full flex overflow-x-hidden group">
        <div className="flex space-x-4 sm:space-x-6 animate-marquee py-2 group-hover:[animation-play-state:paused]">
          {[...PARTNERS, ...PARTNERS].map((partner, idx) => (
            <div
              key={`${partner.name}-${idx}`}
              className="flex-shrink-0 flex items-center space-x-3 bg-white px-5 py-3 rounded-2xl border border-hairline shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center font-mono font-bold text-xs text-primary border border-slate-100">
                {partner.code || "AIR"}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-ink whitespace-nowrap">
                  {partner.name}
                </span>
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                  {partner.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Subtle gradient edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-surface-soft to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-surface-soft to-transparent z-10" />
      </div>
    </section>
  );
};
