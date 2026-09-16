"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plane,
  ShieldCheck,
  Building2,
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
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FlightSearchWidget } from "@/components/flights/FlightSearchWidget";
import { FlightCard } from "@/components/flights/FlightCard";
import { Currency, FlightOffer, FlightSearchRequest } from "@/types";
import { flightProvider } from "@/lib/flights/mock-provider";
import { BookingService } from "@/lib/bookings/booking-service";
import { useCurrency } from "@/lib/context/CurrencyContext";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { currency, format } = useCurrency();

  const [isSearching, setIsSearching] = useState(false);
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [activeFilterStops, setActiveFilterStops] = useState<string>("ALL");
  const [selectedAirline, setSelectedAirline] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"PRICE" | "DURATION">("PRICE");
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
      image: "/images/destinations/nairobi.jpg",
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
  const filteredOffers = offers
    .filter((o) => {
      if (activeFilterStops === "NON_STOP" && o.stops !== 0) return false;
      if (activeFilterStops === "ONE_STOP" && o.stops !== 1) return false;
      if (selectedAirline !== "ALL" && o.validatingAirlineCode !== selectedAirline) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "PRICE") return a.price.totalMinor - b.price.totalMinor;
      return a.totalDurationMinutes - b.totalDurationMinutes;
    });

  return (
    <div className="flex-1 flex flex-col bg-canvas">
      {/* Top Navbar */}
      <Navbar darkHero={false} />

      {/* Hero Section: Crisp White Canvas with Deep Navy and Royal Gold Branding */}
      <section className="bg-canvas text-ink pt-14 pb-28 px-4 sm:px-8 border-b border-hairline relative overflow-hidden">
        {/* Subtle geometric dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#07111f12_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-4">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center space-x-2">
                <Badge variant="pill">
                  IATA Industry Ticketing Standards
                </Badge>
                <span className="hidden sm:inline-flex text-xs text-muted font-mono">
                  • 400+ Airlines
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal font-sans tracking-tight text-ink leading-[1.08]">
                Air travel, booked with <span className="text-primary font-medium">quiet precision.</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-body max-w-xl leading-relaxed">
                Direct airline flight search, corporate travel management, and instant electronic ticket receipts. Direct access to international carriers with guaranteed PNR issuance.
              </p>

              {/* Traveler CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <a href="#flight-search" className="w-full sm:w-auto">
                  <Button variant="pill-cta" className="w-full justify-center min-h-[48px]">
                    Search Flights Now
                  </Button>
                </a>
                <a href="#featured-deals" className="w-full sm:w-auto">
                  <Button variant="secondary-light" size="lg" className="w-full justify-center min-h-[48px]">
                    Explore Top Deals
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Hero: Layered Product-UI Mockup Card (#16181c) */}
            <div className="lg:col-span-5 relative">
              <div className="bg-surface-dark-elevated rounded-xl p-5 sm:p-8 border border-white/15 shadow-2xl space-y-5 sm:space-y-6 transform hover:-translate-y-1 transition-transform">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-pill bg-primary/20 flex items-center justify-center text-primary font-mono font-bold text-xs flex-shrink-0">
                      EK
                    </div>
                    <div>
                      <span className="font-bold text-sm text-on-dark block">Emirates EK730</span>
                      <span className="text-xs text-on-dark-soft font-mono">Boeing 777-300ER • Scheduled</span>
                    </div>
                  </div>
                  <Badge variant="semantic-up">Non-stop</Badge>
                </div>

                <div className="grid grid-cols-3 items-center text-center">
                  <div className="text-left">
                    <span className="font-mono text-xl sm:text-2xl font-bold text-on-dark block">15:30</span>
                    <span className="text-[11px] sm:text-xs font-mono text-on-dark-soft uppercase">EBB • Entebbe</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-on-dark-soft">5h 15m</span>
                    <Plane className="w-4 h-4 text-primary my-1" />
                    <span className="text-[10px] text-semantic-up font-semibold">Direct Route</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xl sm:text-2xl font-bold text-on-dark block">21:45</span>
                    <span className="text-[11px] sm:text-xs font-mono text-on-dark-soft uppercase">DXB • Dubai</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-on-dark-soft">Guaranteed E-Ticket Pass</span>
                  <span className="font-mono font-bold text-base text-primary">PNR: PNJDBE94</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Popular Route Chips (Smooth Touch Flick on Mobile) */}
          <div className="pt-2 space-y-2">
            <span className="text-xs uppercase font-mono tracking-wider text-muted block">
              Popular Flight Routes
            </span>
            <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto pb-2 sm:pb-0 touch-scroll gap-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {popularRoutes.map((r) => (
                <button
                  key={`${r.from}-${r.to}`}
                  onClick={() => handleQuickRoute(r.from, r.to)}
                  className="px-3.5 py-1.5 rounded-pill bg-surface-card hover:bg-surface-soft text-ink text-xs font-medium border border-hairline transition-colors flex items-center space-x-1.5 group flex-shrink-0 min-h-[36px]"
                >
                  <Compass className="w-3 h-3 text-primary group-hover:rotate-45 transition-transform flex-shrink-0" />
                  <span className="whitespace-nowrap">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Embedded Search Widget */}
          <div id="flight-search" className="pt-4">
            <FlightSearchWidget
              onSearch={handleSearch}
              isLoading={isSearching}
              initialValues={currentSearch || undefined}
            />
          </div>
        </div>
      </section>

      {/* Flight Search Results Stream */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Results Header & Advanced Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-hairline">
          <div>
            <h2 className="text-2xl sm:text-3xl font-normal font-sans tracking-tight text-ink">
              Available Flights
            </h2>
            <p className="text-xs text-muted mt-1">
              Showing {filteredOffers.length} available flight options with live seat inventories
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Airline Dropdown */}
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="h-9 px-3 bg-surface-strong text-ink text-xs font-semibold rounded-pill border-none outline-none cursor-pointer hover:bg-hairline transition-colors"
            >
              <option value="ALL">All Airlines</option>
              <option value="EK">Emirates (EK)</option>
              <option value="UR">Uganda Airlines (UR)</option>
              <option value="QR">Qatar Airways (QR)</option>
              <option value="KQ">Kenya Airways (KQ)</option>
              <option value="KL">KLM Royal Dutch (KL)</option>
              <option value="BA">British Airways (BA)</option>
            </select>

            {/* Stops Filter */}
            <div className="inline-flex p-1 bg-surface-strong rounded-pill text-xs">
              <button
                onClick={() => setActiveFilterStops("ALL")}
                className={`px-3 py-1 rounded-pill font-medium transition-colors ${
                  activeFilterStops === "ALL"
                    ? "bg-canvas text-ink shadow-sm font-bold"
                    : "text-muted hover:text-ink"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilterStops("NON_STOP")}
                className={`px-3 py-1 rounded-pill font-medium transition-colors ${
                  activeFilterStops === "NON_STOP"
                    ? "bg-canvas text-ink shadow-sm font-bold"
                    : "text-muted hover:text-ink"
                }`}
              >
                Direct Only
              </button>
              <button
                onClick={() => setActiveFilterStops("ONE_STOP")}
                className={`px-3 py-1 rounded-pill font-medium transition-colors ${
                  activeFilterStops === "ONE_STOP"
                    ? "bg-canvas text-ink shadow-sm font-bold"
                    : "text-muted hover:text-ink"
                }`}
              >
                1 Stop
              </button>
            </div>

            {/* Sort Toggle */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-3 bg-surface-strong text-ink text-xs font-semibold rounded-pill border-none outline-none cursor-pointer hover:bg-hairline transition-colors"
            >
              <option value="PRICE">Sort: Lowest Price</option>
              <option value="DURATION">Sort: Shortest Duration</option>
            </select>
          </div>
        </div>

        {/* Flight Cards Stream */}
        <div className="pt-8 space-y-4">
          {filteredOffers.length === 0 ? (
            <div className="bg-surface-soft rounded-xl p-12 text-center space-y-3 border border-hairline">
              <Plane className="w-8 h-8 text-muted mx-auto" />
              <h3 className="text-base font-bold text-ink">No flights matching active filters</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Try clearing airline or stop filters to view all available flights.
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

      {/* Featured Global Deals Section */}
      <section id="featured-deals" className="py-20 px-4 sm:px-8 bg-surface-soft border-t border-hairline">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="pill">Global Fares</Badge>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-ink font-sans">
                Top International Flight Deals
              </h2>
              <p className="text-sm text-muted">
                Hand-picked flight specials with confirmed live availability and guaranteed ticket issuance.
              </p>
            </div>
            <span className="text-xs font-mono text-muted">
              Currency: <span className="text-primary font-bold">{currency}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDeals.map((deal) => (
              <div
                key={deal.city}
                onClick={() => handleQuickRoute(deal.originCode, deal.airportCode)}
                className="bg-surface-card rounded-xl overflow-hidden border border-hairline shadow-soft-drop hover:shadow-xl hover:border-primary/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div className="h-44 w-full relative overflow-hidden bg-surface-soft">
                  <img
                    src={deal.image}
                    alt={deal.city}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-canvas/90 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-pill border border-hairline">
                      {deal.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-canvas/90 backdrop-blur-sm text-ink text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-hairline">
                      {deal.originCode} → {deal.airportCode}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-ink group-hover:text-primary transition-colors">
                      {deal.city}
                    </h3>
                    <span className="text-xs text-muted block">{deal.airline}</span>
                  </div>

                  <div className="pt-2 border-t border-hairline flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-muted block">Fares from</span>
                      <span className="font-mono font-bold text-lg text-primary">
                        {format(deal.basePriceMinorUSD)}
                      </span>
                    </div>

                    <Button variant="secondary-light" size="sm" className="group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <span>Book Flight</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Airline Network Section */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="pill">Direct Carrier Network</Badge>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-ink font-sans">
            Accredited with Premier Global Airlines
          </h2>
          <p className="text-sm text-muted">
            Direct airline ticketing authorities, verified ticket prefixes, and standard IATA baggage allowances across all cabins.
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { name: "Emirates", code: "EK", hub: "Dubai (DXB)" },
            { name: "Uganda Airlines", code: "UR", hub: "Entebbe (EBB)" },
            { name: "Qatar Airways", code: "QR", hub: "Doha (DOH)" },
            { name: "Kenya Airways", code: "KQ", hub: "Nairobi (NBO)" },
            { name: "KLM Royal Dutch", code: "KL", hub: "Amsterdam (AMS)" },
            { name: "British Airways", code: "BA", hub: "London (LHR)" },
            { name: "Ethiopian Airlines", code: "ET", hub: "Addis Ababa (ADD)" },
            { name: "Turkish Airlines", code: "TK", hub: "Istanbul (IST)" },
          ].map((airline) => (
            <div
              key={airline.code}
              className="bg-surface-card p-4 sm:p-6 rounded-xl border border-hairline hover:border-primary/40 transition-all flex items-center space-x-3.5 shadow-soft-drop"
            >
              <div className="w-10 h-10 rounded-pill bg-surface-soft flex items-center justify-center font-mono font-bold text-xs text-primary border border-hairline">
                {airline.code}
              </div>
              <div>
                <span className="font-bold text-sm text-ink block">{airline.name}</span>
                <span className="text-[11px] text-muted font-mono">{airline.hub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Guarantees Section */}
      <section className="bg-surface-soft py-20 px-4 sm:px-8 border-y border-hairline">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-pill bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-ink">Guaranteed Instant PNR</h3>
            <p className="text-xs text-muted leading-relaxed">
              Every confirmed reservation generates an immediate airline booking reference (PNR) and electronic ticket receipt.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-pill bg-primary/10 flex items-center justify-center text-primary">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-ink">Transparent Pricing</h3>
            <p className="text-xs text-muted leading-relaxed">
              Zero hidden payment surcharges. All airport taxes, security surcharges, and baggage allowances are clearly disclosed before checkout.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-pill bg-primary/10 flex items-center justify-center text-primary">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-ink">IATA Standards</h3>
            <p className="text-xs text-muted leading-relaxed">
              Built to IATA Billing and Settlement Plan (BSP) standards for certified international flight ticketing and passenger manifests.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-pill bg-primary/10 flex items-center justify-center text-primary">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-ink">24/7 Ticketing Desk</h3>
            <p className="text-xs text-muted leading-relaxed">
              Reach our active reservation team directly at <span className="font-mono text-ink font-bold">+256 785360444</span> for immediate flight assistance.
            </p>
          </div>
        </div>
      </section>

      {/* Pre-footer CTA Band */}
      <section className="bg-canvas text-ink py-20 sm:py-24 px-4 sm:px-8 border-t border-hairline text-center relative overflow-hidden">
        {/* Subtle geometric dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#07111f12_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <Badge variant="pill">
            24/7 Flight Support
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal font-sans tracking-tight text-ink">
            Ready to book your next flight?
          </h2>
          <p className="text-sm sm:text-base text-body max-w-lg mx-auto leading-relaxed">
            Book online for instant confirmation or call our international ticketing hotline at{" "}
            <a href="tel:+256785360444" className="font-mono text-ink hover:text-primary font-bold transition-colors">
              +256 785360444
            </a>.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <a href="#flight-search" className="w-full sm:w-auto">
              <Button variant="pill-cta" className="w-full justify-center min-h-[48px] shadow-md">
                Search Flights Now
              </Button>
            </a>
            <a href="tel:+256785360444" className="w-full sm:w-auto">
              <Button
                variant="secondary-light"
                size="lg"
                className="w-full justify-center min-h-[48px] border border-hairline hover:border-primary/50 shadow-sm flex items-center space-x-2"
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
