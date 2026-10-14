"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plane,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2,
  PhoneCall,
  Phone,
  ArrowRight,
  TrendingDown,
  Award,
  Luggage,
  Calendar,
  Compass,
  Globe,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FlightSearchWidget } from "@/components/flights/FlightSearchWidget";
import { FlightCard } from "@/components/flights/FlightCard";
import { PartnersCarousel } from "@/components/flights/PartnersCarousel";
import { PlaneBanner } from "@/components/flights/PlaneBanner";
import { FlightPricingGuide } from "@/components/flights/FlightPricingGuide";
import { Currency, FlightOffer, FlightSearchRequest } from "@/types";
import { flightProvider } from "@/lib/flights/mock-provider";
import { BookingService } from "@/lib/bookings/booking-service";
import { useCurrency } from "@/lib/context/CurrencyContext";
import { formatMoney } from "@/lib/utils";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { currency, setCurrency, format } = useCurrency();

  const [isSearching, setIsSearching] = useState(false);
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [activeFilterStops, setActiveFilterStops] = useState<string>("ALL");
  const [selectedAirline, setSelectedAirline] = useState<string>("ALL");
  const [sortTab, setSortTab] = useState<"CHEAPEST" | "BEST" | "FASTEST">("BEST");
  const [hasSearched, setHasSearched] = useState(false);
  const [currentSearch, setCurrentSearch] = useState<FlightSearchRequest | null>(null);

  // Popular route shortcuts
  const popularRoutes = [
    { from: "EBB", to: "DXB", label: "Entebbe → Dubai", airline: "Emirates" },
    { from: "EBB", to: "LHR", label: "Entebbe → London", airline: "British Airways" },
    { from: "EBB", to: "NBO", label: "Entebbe → Nairobi", airline: "Uganda Airlines" },
    { from: "EBB", to: "DOH", label: "Entebbe → Doha", airline: "Qatar Airways" },
    { from: "EBB", to: "JNB", label: "Entebbe → Johannesburg", airline: "Uganda Airlines" },
    { from: "EBB", to: "AMS", label: "Entebbe → Amsterdam", airline: "KLM" },
  ];

  // Curated live destination deals with base prices in USD minor
  const featuredDeals = [
    {
      city: "Dubai, UAE",
      airportCode: "DXB",
      originCode: "EBB",
      basePriceMinorUSD: 42000,
      airline: "Emirates & Uganda Airlines",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80",
      tag: "Best Seller",
    },
    {
      city: "London, UK",
      airportCode: "LHR",
      originCode: "EBB",
      basePriceMinorUSD: 58000,
      airline: "British Airways & Qatar Airways",
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80",
      tag: "Popular Route",
    },
    {
      city: "Nairobi, Kenya",
      airportCode: "NBO",
      originCode: "EBB",
      basePriceMinorUSD: 24000,
      airline: "Uganda Airlines & Kenya Airways",
      image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80",
      tag: "Short Haul",
    },
    {
      city: "Doha, Qatar",
      airportCode: "DOH",
      originCode: "EBB",
      basePriceMinorUSD: 46000,
      airline: "Qatar Airways",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
      tag: "Premium Hub",
    },
    {
      city: "Johannesburg, South Africa",
      airportCode: "JNB",
      originCode: "EBB",
      basePriceMinorUSD: 39000,
      airline: "Uganda Airlines",
      image: "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?auto=format&fit=crop&w=600&q=80",
      tag: "Direct Flight",
    },
    {
      city: "Amsterdam, Netherlands",
      airportCode: "AMS",
      originCode: "EBB",
      basePriceMinorUSD: 61000,
      airline: "KLM Royal Dutch",
      image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=600&q=80",
      tag: "European Gate",
    },
  ];

  // Initial flight search on load
  useEffect(() => {
    handleSearch({
      tripType: "ROUND_TRIP",
      originCode: "EBB",
      destinationCode: "DXB",
      departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      returnDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      cabinClass: "ECONOMY",
      passengers: { adults: 1, children: 0, infants: 0 },
      currency,
    });
  }, [currency]);

  const handleSearch = async (request: FlightSearchRequest) => {
    setIsSearching(true);
    setCurrentSearch(request);
    try {
      const response = await flightProvider.searchFlights({
        ...request,
        currency,
      });
      setOffers(response.offers);
      setHasSearched(true);
    } catch (err) {
      console.error("Flight search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickRoute = (from: string, to: string) => {
    const dep = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const ret = new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    handleSearch({
      tripType: "ROUND_TRIP",
      originCode: from,
      destinationCode: to,
      departureDate: dep,
      returnDate: ret,
      cabinClass: "ECONOMY",
      passengers: { adults: 1, children: 0, infants: 0 },
      currency,
    });

    const el = document.getElementById("flight-search");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectOffer = (offer: FlightOffer) => {
    const draft = BookingService.createBookingDraft(
      offer,
      [
        {
          type: "ADULT",
          title: "MR",
          firstName: "Denis",
          lastName: "Ayiko",
          dateOfBirth: "1990-05-14",
          gender: "MALE",
          passportNumber: "UG849201",
          passportExpiry: "2031-10-20",
          nationality: "UG",
        },
      ],
      { email: "traveler@example.com", phone: "+256 785360444" }
    );
    router.push(`/checkout/${draft.reference}`);
  };

  // Filter and sort offers
  const filteredOffers = useMemo(() => {
    return offers
      .filter((o) => {
        if (activeFilterStops === "NON_STOP" && o.stops !== 0) return false;
        if (activeFilterStops === "ONE_STOP" && o.stops !== 1) return false;
        if (selectedAirline !== "ALL" && o.validatingAirlineCode !== selectedAirline) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortTab === "CHEAPEST") {
          return a.price.totalMinor - b.price.totalMinor;
        }
        if (sortTab === "FASTEST") {
          return a.totalDurationMinutes - b.totalDurationMinutes;
        }
        // "BEST": weighted score of price and duration
        const aScore = a.price.totalMinor + a.totalDurationMinutes * 50;
        const bScore = b.price.totalMinor + b.totalDurationMinutes * 50;
        return aScore - bScore;
      });
  }, [offers, activeFilterStops, selectedAirline, sortTab]);

  // Derived statistics for sort cards
  const cheapestPriceMinor = useMemo(() => {
    if (offers.length === 0) return 0;
    return Math.min(...offers.map((o) => o.price.totalMinor));
  }, [offers]);

  const fastestDurationMinutes = useMemo(() => {
    if (offers.length === 0) return 0;
    return Math.min(...offers.map((o) => o.totalDurationMinutes));
  }, [offers]);

  const formatHoursMins = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex-1 flex flex-col bg-canvas min-h-screen">
      {/* Top Navbar */}
      <Navbar darkHero={false} />

      {/* 1. Main Hero Shell: Rounded Dark Card Inspired by BestFlightsPrices */}
      <section className="p-2 sm:p-4 md:p-6 pb-0 max-w-[1440px] mx-auto w-full relative z-30">
        <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-b from-[#081830] via-[#0b2244] to-[#040e1c] text-white p-5 sm:p-8 md:p-12 pb-28 sm:pb-36 md:pb-40 shadow-2xl border border-slate-800/80">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none rounded-2xl md:rounded-3xl" />

          <div className="relative z-10 max-w-5xl mx-auto space-y-6 sm:space-y-8">
            {/* Hero Top Title & Value Proposition */}
            <div className="text-center space-y-3 pt-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white/90 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Institutional Air Ticketing & Global GDS</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-sans tracking-tight text-white leading-[1.08]">
                Explore Unbeatable Flight Prices.
              </h1>

              <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                Compare real-time airline fares, institutional GDS inventory, and guaranteed PNR ticketing across 400+ carriers worldwide.
              </p>
            </div>

            {/* Quick Popular Route Chips - Placed cleanly above search */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 pb-1">
              <span className="font-semibold uppercase tracking-wider text-slate-400 text-[11px] mr-1 select-none">
                Popular:
              </span>
              {popularRoutes.map((r) => (
                <button
                  key={`${r.from}-${r.to}`}
                  onClick={() => handleQuickRoute(r.from, r.to)}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-primary/20 hover:text-primary text-white text-[11px] font-medium border border-white/10 transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <span>{r.label}</span>
                </button>
              ))}
            </div>

            {/* Central Unified Search Form Component */}
            <div id="flight-search" className="pt-1">
              <FlightSearchWidget
                onSearch={handleSearch}
                isLoading={isSearching}
                initialValues={currentSearch || undefined}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Partners Carousel: Airlines & Global Aggregators */}
      <PartnersCarousel />

      {/* 3. Interactive Plane Showcase Banner */}
      <PlaneBanner onSelectRoute={handleQuickRoute} />

      {/* 4. Flight Search Results Stream (with Best / Cheapest / Fastest sort tabs) */}
      <section id="flight-results" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Results Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="pill">Live Search Feed</Badge>
              <span className="text-xs font-mono text-muted">
                {currentSearch?.originCode} → {currentSearch?.destinationCode}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
              Available Flights
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Showing {filteredOffers.length} options with guaranteed seat confirmation
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-muted font-medium">
            <span>Currency:</span>
            <span className="font-bold text-primary font-mono text-sm">{currency}</span>
          </div>
        </div>

        {/* 3 Summary Sorting Cards: Cheapest / Best / Fastest (BestFlightsPrices Style) */}
        {offers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {/* Cheapest Card */}
            <button
              type="button"
              onClick={() => setSortTab("CHEAPEST")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                sortTab === "CHEAPEST"
                  ? "bg-primary/10 border-primary ring-2 ring-primary/20 shadow-md"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cheapest
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-ink">
                  {cheapestPriceMinor ? formatMoney(cheapestPriceMinor, currency) : "—"}
                </span>
                <span className="text-[11px] text-muted">Lowest fare</span>
              </div>
            </button>

            {/* Best Card */}
            <button
              type="button"
              onClick={() => setSortTab("BEST")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                sortTab === "BEST"
                  ? "bg-primary/10 border-primary ring-2 ring-primary/20 shadow-md"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Best Value
                </span>
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-ink">Recommended</span>
                <span className="text-[11px] text-muted">Time & cost balanced</span>
              </div>
            </button>

            {/* Fastest Card */}
            <button
              type="button"
              onClick={() => setSortTab("FASTEST")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                sortTab === "FASTEST"
                  ? "bg-primary/10 border-primary ring-2 ring-primary/20 shadow-md"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Fastest
                </span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-ink">
                  {fastestDurationMinutes ? formatHoursMins(fastestDurationMinutes) : "—"}
                </span>
                <span className="text-[11px] text-muted">Shortest flight</span>
              </div>
            </button>
          </div>
        )}

        {/* Filter Bar Controls */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center space-x-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>

            {/* Stops Filter Buttons */}
            <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setActiveFilterStops("ALL")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeFilterStops === "ALL"
                    ? "bg-ink text-white font-bold"
                    : "text-slate-600 hover:text-ink"
                }`}
              >
                All Stops
              </button>
              <button
                onClick={() => setActiveFilterStops("NON_STOP")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeFilterStops === "NON_STOP"
                    ? "bg-ink text-white font-bold"
                    : "text-slate-600 hover:text-ink"
                }`}
              >
                Direct Only
              </button>
              <button
                onClick={() => setActiveFilterStops("ONE_STOP")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeFilterStops === "ONE_STOP"
                    ? "bg-ink text-white font-bold"
                    : "text-slate-600 hover:text-ink"
                }`}
              >
                1 Stop
              </button>
            </div>

            {/* Airline Dropdown */}
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="h-9 px-3 bg-white text-ink text-xs font-semibold rounded-xl border border-slate-200 outline-none cursor-pointer hover:border-primary/40 transition-colors"
            >
              <option value="ALL">All Airlines</option>
              <option value="EK">Emirates (EK)</option>
              <option value="UR">Uganda Airlines (UR)</option>
              <option value="QR">Qatar Airways (QR)</option>
              <option value="KQ">Kenya Airways (KQ)</option>
              <option value="KL">KLM Royal Dutch (KL)</option>
              <option value="BA">British Airways (BA)</option>
            </select>
          </div>

          {(activeFilterStops !== "ALL" || selectedAirline !== "ALL") && (
            <button
              onClick={() => {
                setActiveFilterStops("ALL");
                setSelectedAirline("ALL");
              }}
              className="text-xs font-bold text-primary hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Flight Cards Stream */}
        <div className="space-y-4">
          {filteredOffers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-200 shadow-sm">
              <Plane className="w-10 h-10 text-muted mx-auto" />
              <h3 className="text-lg font-bold text-ink">No flights matching active filters</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Try resetting your stop or airline filter to view all available flights for this route.
              </p>
              <Button
                variant="secondary-light"
                size="sm"
                onClick={() => {
                  setSelectedAirline("ALL");
                  setActiveFilterStops("ALL");
                }}
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            filteredOffers.map((offer) => (
              <FlightCard
                key={offer.id}
                offer={offer}
                currency={currency}
                onSelectOffer={handleSelectOffer}
              />
            ))
          )}
        </div>
      </section>

      {/* 5. Curated Top Destinations Grid ("Top Travel Destinations") */}
      <section id="featured-deals" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-surface-soft/60 border-t border-hairline">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="pill">Top Destinations</Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink">
                Popular Flight Destinations from Entebbe
              </h2>
              <p className="text-xs sm:text-sm text-muted">
                Confirmed live availability, instant booking reference, and direct IATA ticketing.
              </p>
            </div>

            <span className="text-xs font-mono text-muted">
              Display Currency: <span className="text-primary font-bold">{currency}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDeals.map((deal) => (
              <div
                key={deal.city}
                onClick={() => handleQuickRoute(deal.originCode, deal.airportCode)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={deal.image}
                    alt={deal.city}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/95 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
                      {deal.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-slate-900/90 backdrop-blur-sm text-white text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-white/10 shadow-sm">
                      {deal.originCode} → {deal.airportCode}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-ink group-hover:text-primary transition-colors">
                      {deal.city}
                    </h3>
                    <span className="text-xs text-muted block mt-0.5">{deal.airline}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-muted block">Fares from</span>
                      <span className="font-mono font-bold text-lg text-primary">
                        {format(deal.basePriceMinorUSD)}
                      </span>
                    </div>

                    <Button
                      variant="secondary-light"
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary transition-colors text-xs font-bold"
                    >
                      <span>View Deals</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Educational Transparency Guide: "How Flight Prices Are Determined" */}
      <FlightPricingGuide />

      {/* 7. Institutional Trust & Accreditation */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-hairline">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-ink">Guaranteed Instant PNR</h3>
            <p className="text-xs text-muted leading-relaxed">
              Every confirmed reservation generates an immediate airline booking reference (PNR) and electronic ticket receipt.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-ink">Transparent Pricing</h3>
            <p className="text-xs text-muted leading-relaxed">
              Zero hidden payment surcharges. All airport taxes, security surcharges, and baggage allowances are clearly disclosed before checkout.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-ink">IATA Standards</h3>
            <p className="text-xs text-muted leading-relaxed">
              Built to IATA Billing and Settlement Plan (BSP) standards for certified international flight ticketing and passenger manifests.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-ink">24/7 Ticketing Desk</h3>
            <p className="text-xs text-muted leading-relaxed">
              Reach our active reservation team directly at{" "}
              <a href="tel:+256785360444" className="font-mono text-primary font-bold hover:underline">
                +256 785360444
              </a>{" "}
              for immediate flight assistance.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Pre-footer CTA */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <Badge variant="pill">24/7 Flight Support</Badge>
          <h2 className="text-2xl sm:text-4xl font-bold font-sans tracking-tight text-white">
            Ready to book your next flight?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Search online for instant confirmation or speak directly with our international flight desk at{" "}
            <a href="tel:+256785360444" className="font-mono text-primary font-bold hover:underline">
              +256 785360444
            </a>.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#flight-search" className="w-full sm:w-auto">
              <Button variant="pill-cta" className="w-full sm:w-auto px-8 min-h-[48px] shadow-lg">
                Search Flights Now
              </Button>
            </a>
            <a href="tel:+256785360444" className="w-full sm:w-auto">
              <Button
                variant="secondary-light"
                size="lg"
                className="w-full sm:w-auto px-6 min-h-[48px] bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span>Call +256 785360444</span>
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
