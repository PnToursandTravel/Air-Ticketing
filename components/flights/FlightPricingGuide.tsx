"use client";

import React, { useState } from "react";
import {
  Clock,
  Calendar,
  SunMoon,
  CalendarDays,
  MapPin,
  PlaneTakeoff,
  Fuel,
  GitFork,
  Tag,
  ChevronDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GuideItem {
  icon: React.ElementType;
  title: string;
  summary: string;
  detail: string;
  tip: string;
}

const PRICING_FACTORS: GuideItem[] = [
  {
    icon: Clock,
    title: "Timing Is Key",
    summary: "Booking at the sweet spot (6-8 weeks prior) prevents paying steep late-minute premiums.",
    detail:
      "Airlines use dynamic yield management systems that increase prices as flight departure nears. Booking 45 to 60 days ahead generally yields the lowest published tariff classes.",
    tip: "Avoid waiting until the final 14 days before departure when corporate fare buckets dominate.",
  },
  {
    icon: Calendar,
    title: "High and Low Seasons",
    summary: "School holidays, Christmas, and peak safari seasons drive seasonal ticket spikes.",
    detail:
      "Carriers operate summer and winter flight schedules with variable baseline seat pricing. Traveling during shoulder months (e.g. October, May) cuts round-trip costs significantly.",
    tip: "Shifting your departure by just 3 to 5 days outside holiday weekends can save up to 30%.",
  },
  {
    icon: SunMoon,
    title: "Time of Day Matters",
    summary: "Early dawn departures and late red-eye flights usually carry lower demand and price tags.",
    detail:
      "Midday and evening prime-time flights fill up fastest with business executives, driving algorithmic price increases on those specific flight slots.",
    tip: "Look for 4:00 AM - 6:00 AM flights from Entebbe for cheaper regional connector fares.",
  },
  {
    icon: CalendarDays,
    title: "Best Days to Book & Travel",
    summary: "Midweek departures on Tuesday and Wednesday are consistently cheaper than weekend trips.",
    detail:
      "Airlines adjust unsold weekend inventory on Monday nights, creating competitive flash pricing across GDS channels starting Tuesday mornings.",
    tip: "Depart on a Wednesday and return the following Tuesday for maximum round-trip savings.",
  },
  {
    icon: MapPin,
    title: "Destination Popularity",
    summary: "High-volume routes benefit from fierce airline competition and lower seat miles.",
    detail:
      "Routes with multiple daily flights like Entebbe to Dubai (served by Emirates, Uganda Airlines, flydubai) have frequent promotional fare battles compared to single-carrier destinations.",
    tip: "Monitor competing carriers on the same corridor using our unified flight search.",
  },
  {
    icon: PlaneTakeoff,
    title: "Airline Choice & Alliances",
    summary: "Low-cost carriers vs. full-service legacy airlines with included baggage allowances.",
    detail:
      "Budget airlines appear cheaper at first glance, but checked baggage fees (23kg x 2) can quickly exceed the base fare difference of an inclusive carrier like Emirates or KLM.",
    tip: "Always check total baggage allowance before comparing headline prices.",
  },
  {
    icon: Fuel,
    title: "Fuel Surcharges & Taxes",
    summary: "A significant chunk of any international ticket consists of government airport fees.",
    detail:
      "Carrier-imposed fuel surcharges (YQ/YR) fluctuate with global jet fuel index prices. Certain transit airports also impose higher passenger facility charges (PFC).",
    tip: "Our pricing breakdown displays taxes and carrier surcharges transparently upfront.",
  },
  {
    icon: GitFork,
    title: "Direct vs. Connecting Flights",
    summary: "Layovers in Doha, Addis Ababa, or Nairobi often cost less than direct non-stop flights.",
    detail:
      "Direct flights command a convenience premium for business travelers. If you have extra time, connecting itineraries often offer massive cost discounts.",
    tip: "Consider 2-hour layovers in Addis Ababa or Nairobi for affordable international flights.",
  },
  {
    icon: Tag,
    title: "Consolidator & Partner Fares",
    summary: "Institutional travel agencies have direct access to private corporate and tour tariffs.",
    detail:
      "Through IATA accreditation and high-volume BSP ticketing, PN Tours & Travel secures negotiated partner fares that are not visible on public retail search engines.",
    tip: "Book through our ticketing desk for access to verified agent consolidator rates.",
  },
];

export const FlightPricingGuide: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <section className="w-full py-16 sm:py-24 bg-surface-soft/40 border-t border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <Info className="w-3.5 h-3.5" />
            <span>Smart Traveler Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-tight">
            How Flight Prices Are Determined
          </h2>
          <p className="text-xs sm:text-base text-body leading-relaxed">
            Ever notice how flight prices seem to fluctuate constantly? Airline algorithms analyze real-time seat inventory, demand patterns, and market competition. Understanding these 9 factors will help you book smarter every time.
          </p>
        </div>

        {/* 9-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRICING_FACTORS.map((item, idx) => {
            const Icon = item.icon;
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={item.title}
                className={cn(
                  "bg-white rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between group hover:shadow-lg",
                  isExpanded
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-slate-200 hover:border-primary/40 shadow-sm"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center text-primary transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-ink group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-body mt-2 leading-relaxed">
                    {item.summary}
                  </p>

                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.detail}
                      </p>
                      <div className="p-2.5 rounded-xl bg-primary/10 text-ink text-[11px] font-medium">
                        <strong className="text-primary font-bold">Pro Tip: </strong>
                        {item.tip}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(idx)}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary hover:text-primary-active transition-colors"
                  >
                    <span>{isExpanded ? "Show Less" : "Learn More"}</span>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
