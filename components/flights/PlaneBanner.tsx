"use client";

import React from "react";
import { Plane, ArrowRight, Sparkles, TrendingDown, CheckCircle2 } from "lucide-react";
import { useCurrency } from "@/lib/context/CurrencyContext";

interface PlaneBannerProps {
  onSelectRoute?: (origin: string, destination: string) => void;
}

export const PlaneBanner: React.FC<PlaneBannerProps> = ({ onSelectRoute }) => {
  const { format } = useCurrency();

  const liveFarePills = [
    {
      airline: "Emirates",
      route: "Dubai (DXB)",
      origin: "EBB",
      dest: "DXB",
      basePriceMinorUSD: 42000,
      positionClass: "top-4 -left-4 sm:-left-8",
      animClass: "animate-float",
    },
    {
      airline: "Uganda Airlines",
      route: "Nairobi (NBO)",
      origin: "EBB",
      dest: "NBO",
      basePriceMinorUSD: 24000,
      positionClass: "bottom-8 -left-2 sm:-left-6",
      animClass: "animate-float-delayed",
    },
    {
      airline: "British Airways",
      route: "London (LHR)",
      origin: "EBB",
      dest: "LHR",
      basePriceMinorUSD: 58000,
      positionClass: "top-10 -right-4 sm:-right-8",
      animClass: "animate-float-alt",
    },
    {
      airline: "Qatar Airways",
      route: "Doha (DOH)",
      origin: "EBB",
      dest: "DOH",
      basePriceMinorUSD: 46000,
      positionClass: "bottom-14 -right-2 sm:-right-6",
      animClass: "animate-float",
    },
    {
      airline: "KLM Royal Dutch",
      route: "Amsterdam (AMS)",
      origin: "EBB",
      dest: "AMS",
      basePriceMinorUSD: 61000,
      positionClass: "-top-6 left-1/3",
      animClass: "animate-float-delayed",
    },
  ];

  const handleRouteClick = (origin: string, dest: string) => {
    if (onSelectRoute) {
      onSelectRoute(origin, dest);
    } else {
      const el = document.getElementById("flight-search");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="w-full py-16 sm:py-24 bg-gradient-to-b from-canvas via-surface-soft to-canvas relative overflow-hidden">
      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Real-Time Fare Comparison Engine</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight leading-[1.12]">
              We compare the best flight prices available online from leading airlines
            </h2>

            <p className="text-sm sm:text-base text-body leading-relaxed max-w-xl">
              PN Tours & Travel connects directly with IATA GDS backbones, low-cost carriers, and institutional consolidator desks. We scan thousands of routing combinations in seconds to deliver guaranteed seats at the lowest available fares.
            </p>

            {/* Feature bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center space-x-2.5 text-xs sm:text-sm font-semibold text-ink">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Zero Hidden Baggage Fees</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs sm:text-sm font-semibold text-ink">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Instant Guaranteed PNR</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs sm:text-sm font-semibold text-ink">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Flexible Date Rebooking</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs sm:text-sm font-semibold text-ink">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>24/7 Desk Support</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <a
                href="#flight-search"
                className="inline-flex items-center space-x-3 px-8 py-4 rounded-2xl bg-ink hover:bg-slate-800 text-white font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-200 group transform hover:-translate-y-0.5"
              >
                <span>Search tickets now</span>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Visual: Stylized Airplane with Floating Live Price Pills */}
          <div className="lg:col-span-6 relative flex items-center justify-center py-10 sm:py-16">
            <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
              {/* Airplane Graphic Background Rings */}
              <div className="absolute inset-8 rounded-full border border-primary/20 animate-pulse" />
              <div className="absolute inset-16 rounded-full border border-slate-200" />
              <div className="absolute inset-28 rounded-full bg-gradient-to-tr from-primary/10 to-slate-100 shadow-inner" />

              {/* Main Aircraft Icon Graphic */}
              <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-ink p-8 shadow-2xl flex flex-col items-center justify-center text-white transform -rotate-12 hover:rotate-0 transition-transform duration-500 border border-white/20">
                <Plane className="w-24 h-24 sm:w-28 sm:h-28 text-primary drop-shadow-[0_10px_20px_rgba(212,175,55,0.4)]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-primary-bright mt-2">
                  Live Global GDS
                </span>
                <span className="text-[10px] text-slate-400">Entebbe Hub</span>
              </div>

              {/* Floating Live Fare Pills */}
              {liveFarePills.map((pill, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleRouteClick(pill.origin, pill.dest)}
                  className={`absolute z-20 ${pill.positionClass} ${pill.animClass} group cursor-pointer focus:outline-none`}
                >
                  <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl group-hover:border-primary group-hover:scale-105 group-active:scale-95 transition-all">
                    <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold font-mono">
                      ✈
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                        {pill.airline}
                      </div>
                      <div className="text-xs font-bold text-ink truncate max-w-[110px]">
                        {pill.route}
                      </div>
                    </div>
                    <div className="pl-1 border-l border-slate-100">
                      <span className="text-sm font-bold text-primary font-mono block">
                        {format(pill.basePriceMinorUSD)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
