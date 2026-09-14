"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plane,
  ShieldCheck,
  CreditCard,
  Building2,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2,
  PhoneCall,
  Briefcase,
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
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>("USD");
  const [isSearching, setIsSearching] = useState(false);
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [activeFilterStops, setActiveFilterStops] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"PRICE" | "DURATION">("PRICE");
  const [hasSearched, setHasSearched] = useState(false);
  const [currentSearch, setCurrentSearch] = useState<FlightSearchRequest | null>(null);

  // Load initial search on page mount (EBB -> DXB)
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

  const handleSelectOffer = (offer: FlightOffer) => {
    // Create draft booking and navigate to checkout
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
      if (activeFilterStops === "NON_STOP") return o.stops === 0;
      if (activeFilterStops === "ONE_STOP") return o.stops === 1;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "PRICE") return a.price.totalMinor - b.price.totalMinor;
      return a.totalDurationMinutes - b.totalDurationMinutes;
    });

  return (
    <div className="flex-1 flex flex-col bg-canvas">
      {/* Top Navbar with darkHero theme to seamlessly blend with dark hero band */}
      <Navbar
        currentCurrency={currency}
        onCurrencyChange={(c) => setCurrency(c)}
        darkHero={true}
      />

      {/* Hero Section: Full Bleed Dark Band (#0a0b0d) matching DESIGN-Air.md */}
      <section className="bg-surface-dark text-on-dark pt-12 pb-24 px-4 sm:px-8 border-b border-white/10 relative overflow-hidden">
        {/* Subtle geometric grid line */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-12">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              <Badge variant="pill-dark" className="border border-white/20 text-on-dark">
                Worldwide Airline Ticketing
              </Badge>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-normal font-sans tracking-tight text-on-dark leading-[1.05]">
                Air travel, booked with <span className="text-primary font-medium">quiet precision.</span>
              </h1>

              <p className="text-base sm:text-lg text-on-dark-soft max-w-xl leading-relaxed">
                Direct flights, corporate bookings, and accredited travel agency issuance. Direct access to 400+ airlines, instant PNRs, and an immutable booking ledger.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a href="#flight-search">
                  <Button variant="pill-cta">
                    Search Flights
                  </Button>
                </a>
                <Link href="/agent">
                  <Button variant="outline-on-dark" size="lg">
                    Agency B2B Access
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Hero: Floating Product-UI Mockup Card (#16181c) */}
            <div className="lg:col-span-5 relative">
              <div className="bg-surface-dark-elevated rounded-xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 transform hover:-translate-y-1 transition-transform">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-pill bg-primary/20 flex items-center justify-center text-primary font-mono font-bold text-xs">
                      EK
                    </div>
                    <div>
                      <span className="font-bold text-sm text-on-dark block">Emirates EK730</span>
                      <span className="text-xs text-on-dark-soft">Boeing 777-300ER • Scheduled</span>
                    </div>
                  </div>
                  <Badge variant="semantic-up">Non-stop</Badge>
                </div>

                <div className="grid grid-cols-3 items-center text-center">
                  <div className="text-left">
                    <span className="font-mono text-2xl font-bold text-on-dark block">15:30</span>
                    <span className="text-xs font-mono text-on-dark-soft">EBB • Entebbe</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-on-dark-soft">5h 15m</span>
                    <Plane className="w-4 h-4 text-primary my-1" />
                    <span className="text-[10px] text-semantic-up">Direct Route</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-bold text-on-dark block">21:45</span>
                    <span className="text-xs font-mono text-on-dark-soft">DXB • Dubai</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-on-dark-soft">Instant PNR Guarantee</span>
                  <span className="font-mono font-bold text-base text-primary">PN-784K92</span>
                </div>
              </div>
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

      {/* Flight Search Results Section */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Results Header & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-hairline">
          <div>
            <h2 className="text-2xl font-normal font-sans tracking-tight text-ink">
              Available Flights
            </h2>
            <p className="text-xs text-muted mt-1">
              Showing {filteredOffers.length} available flight options with live seat availability
            </p>
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-3">
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
                All Flights
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
              className="h-9 px-3 bg-surface-strong text-ink text-xs font-semibold rounded-pill border-none outline-none cursor-pointer hover:bg-hairline"
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
              <h3 className="text-base font-bold text-ink">No flights found matching criteria</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Try selecting different airports or changing your departure date.
              </p>
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

      {/* Trust & Airline Network Band (Soft Gray Surface #f7f7f7) */}
      <section className="bg-surface-soft py-20 px-4 sm:px-8 border-y border-hairline">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="pill">Global Carrier Network</Badge>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-ink font-sans">
              Partnering with the world's premier airlines
            </h2>
            <p className="text-sm text-muted">
              Live seat inventories, verified ticket prefixes, and standard IATA baggage allowances across all cabins.
            </p>
          </div>

          {/* Airlines Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                className="bg-canvas p-6 rounded-xl border border-hairline hover:border-primary/40 transition-all flex items-center space-x-3.5 shadow-soft-drop"
              >
                <div className="w-10 h-10 rounded-pill bg-surface-strong flex items-center justify-center font-mono font-bold text-xs text-primary">
                  {airline.code}
                </div>
                <div>
                  <span className="font-bold text-sm text-ink block">{airline.name}</span>
                  <span className="text-[11px] text-muted font-mono">{airline.hub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid: 3 Pillars (Retail, B2B Agent, Operations) */}
      <section className="py-24 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="bordered" className="space-y-4">
            <div className="w-10 h-10 rounded-pill bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-ink">Retail Travelers</h3>
            <p className="text-xs text-muted leading-relaxed">
              Transparent, unbundled flight pricing with zero hidden checkout surcharges. Instant PNR issuance and printable PDF e-tickets.
            </p>
            <Link href="#flight-search" className="inline-flex items-center text-xs text-primary font-bold hover:underline">
              <span>Book Flight Now</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Card>

          <Card variant="bordered" className="space-y-4">
            <div className="w-10 h-10 rounded-pill bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-ink">B2B Travel Agencies</h3>
            <p className="text-xs text-muted leading-relaxed">
              Prepaid agency wallet with an append-only accounting ledger. Custom agency markups, passenger address books, and instant commission retention.
            </p>
            <Link href="/agent" className="inline-flex items-center text-xs text-primary font-bold hover:underline">
              <span>Access Agent Portal</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Card>

          <Card variant="bordered" className="space-y-4">
            <div className="w-10 h-10 rounded-pill bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-ink">Operations & Admin</h3>
            <p className="text-xs text-muted leading-relaxed">
              Real-time monitoring of ticket queues, supplier connection health matrix, multi-tier pricing rules engine, and immutable audit logs.
            </p>
            <Link href="/admin" className="inline-flex items-center text-xs text-primary font-bold hover:underline">
              <span>Open Admin Operations</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Card>
        </div>
      </section>

      {/* Pre-footer CTA Band Dark (#0a0b0d) matching cta-band-dark */}
      <section className="bg-surface-dark text-on-dark py-24 px-4 sm:px-8 border-t border-white/10 text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Badge variant="pill-dark" className="border border-white/20">
            24/7 Ticketing Desk
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-normal font-sans tracking-tight text-on-dark">
            Ready to book your next flight?
          </h2>
          <p className="text-sm text-on-dark-soft max-w-lg mx-auto">
            Contact our 24/7 reservations hotline at <span className="font-mono text-on-dark font-bold">+256 785360444</span> or start searching online now.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <a href="#flight-search">
              <Button variant="pill-cta">
                Book Flight Online
              </Button>
            </a>
            <a href="tel:+256785360444">
              <Button variant="outline-on-dark" size="lg">
                Call +256 785360444
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
