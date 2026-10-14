"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeftRight, Calendar as CalendarIcon, Users, Sparkles, Search, Check, ChevronDown, Bell } from "lucide-react";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { CabinClass, FlightSearchRequest, TripType } from "@/types";
import { cn } from "@/lib/utils";

interface FlightSearchWidgetProps {
  onSearch: (request: FlightSearchRequest) => void;
  isLoading?: boolean;
  initialValues?: Partial<FlightSearchRequest>;
}

export const FlightSearchWidget: React.FC<FlightSearchWidgetProps> = ({
  onSearch,
  isLoading = false,
  initialValues,
}) => {
  const [tripType, setTripType] = useState<TripType>(initialValues?.tripType || "ROUND_TRIP");
  const [originCode, setOriginCode] = useState(initialValues?.originCode || "EBB");
  const [destinationCode, setDestinationCode] = useState(initialValues?.destinationCode || "DXB");

  // Dates
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const nextTwoWeeks = new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [departureDate, setDepartureDate] = useState(initialValues?.departureDate || nextWeek);
  const [returnDate, setReturnDate] = useState(initialValues?.returnDate || nextTwoWeeks);
  const [cabinClass, setCabinClass] = useState<CabinClass>(initialValues?.cabinClass || "ECONOMY");

  // Passengers
  const [adults, setAdults] = useState(initialValues?.passengers?.adults || 1);
  const [childrenCount, setChildrenCount] = useState(initialValues?.passengers?.children || 0);
  const [infants, setInfants] = useState(initialValues?.passengers?.infants || 0);

  // Sub-bar options
  const [directFlightsOnly, setDirectFlightsOnly] = useState(false);
  const [addHotel, setAddHotel] = useState(false);
  const [dealAlertsActive, setDealAlertsActive] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertSubscribed, setAlertSubscribed] = useState(false);

  // Popover controls
  const [paxOpen, setPaxOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const paxRef = useRef<HTMLDivElement>(null);
  const datesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (paxRef.current && !paxRef.current.contains(event.target as Node)) {
        setPaxOpen(false);
      }
      if (datesRef.current && !datesRef.current.contains(event.target as Node)) {
        setDatesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const swapAirports = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const temp = originCode;
    setOriginCode(destinationCode);
    setDestinationCode(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPaxOpen(false);
    setDatesOpen(false);

    onSearch({
      tripType,
      originCode,
      destinationCode,
      departureDate,
      returnDate: tripType === "ROUND_TRIP" ? returnDate : undefined,
      cabinClass,
      passengers: {
        adults,
        children: childrenCount,
        infants,
      },
    });

    // Smooth scroll down to results section
    setTimeout(() => {
      const resultsEl = document.getElementById("flight-results");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  const totalPassengers = adults + childrenCount + infants;

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const cabinClassLabels: Record<CabinClass, string> = {
    ECONOMY: "Economy",
    PREMIUM_ECONOMY: "Prem. Economy",
    BUSINESS: "Business",
    FIRST: "First Class",
  };

  return (
    <div className="w-full">
      {/* 1. Trip Type Switcher Tabs (Round-Trip / One-Way) */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="relative inline-flex items-center space-x-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setTripType("ROUND_TRIP");
            }}
            className={cn(
              "px-4 py-2 text-sm font-semibold transition-all relative cursor-pointer select-none",
              tripType === "ROUND_TRIP"
                ? "text-white font-bold"
                : "text-white/70 hover:text-white"
            )}
          >
            Round-Trip
            {tripType === "ROUND_TRIP" && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full transition-all duration-300" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setTripType("ONE_WAY");
            }}
            className={cn(
              "px-4 py-2 text-sm font-semibold transition-all relative cursor-pointer select-none",
              tripType === "ONE_WAY"
                ? "text-white font-bold"
                : "text-white/70 hover:text-white"
            )}
          >
            One-Way
            {tripType === "ONE_WAY" && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full transition-all duration-300" />
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-white/80">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time IATA fares</span>
        </div>
      </div>

      {/* 2. Unified Single-Row Input Container */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative bg-slate-900/90 p-2 rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl backdrop-blur-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2 items-stretch">
          {/* Origin & Destination Group with Centered Swap (4 cols on lg, 4 cols on xl) */}
          <div className="md:col-span-2 lg:col-span-4 relative flex flex-col sm:flex-row items-center gap-1.5">
            {/* From Input */}
            <div className="w-full sm:flex-1 rounded-xl shadow-sm relative z-20">
              <AirportAutocomplete
                label="From"
                value={originCode}
                excludeCode={destinationCode}
                onChange={(a) => setOriginCode(a.code)}
                variant="segmented"
                inputPaddingClass="sm:pr-5"
              />
            </div>

            {/* Reverse / Swap Button */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
              <button
                type="button"
                onClick={swapAirports}
                title="Swap Departure and Destination"
                className="w-8 h-8 rounded-full bg-white text-ink border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 hover:scale-110 active:scale-95 transition-all group cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-primary transition-colors" />
              </button>
            </div>

            {/* To Input */}
            <div className="w-full sm:flex-1 rounded-xl shadow-sm relative z-10">
              <AirportAutocomplete
                label="To"
                value={destinationCode}
                excludeCode={originCode}
                onChange={(a) => setDestinationCode(a.code)}
                variant="segmented"
                inputPaddingClass="sm:pl-5"
              />
            </div>
          </div>

          {/* Dates Input (3 cols on lg, 3 cols on xl) */}
          <div ref={datesRef} className="md:col-span-1 lg:col-span-3 relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDatesOpen(!datesOpen);
              }}
              className={cn(
                "w-full h-[74px] px-4 py-3 bg-white text-left rounded-xl transition-all duration-150 flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm cursor-pointer",
                datesOpen && "ring-2 ring-primary/40"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-primary transition-colors block">
                  {tripType === "ROUND_TRIP" ? "Dates" : "Departure"}
                </span>
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
              <div className="text-sm font-bold text-ink truncate leading-tight w-full">
                {tripType === "ROUND_TRIP"
                  ? `${formatDateDisplay(departureDate)} - ${formatDateDisplay(returnDate)}`
                  : formatDateDisplay(departureDate)}
              </div>
            </button>

            {/* Dates Popover */}
            {datesOpen && (
              <div className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-white rounded-2xl border border-hairline shadow-2xl p-4 z-50 space-y-3">
                <div className="text-xs font-bold text-ink uppercase tracking-wider">
                  Select Travel Dates
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={departureDate}
                      onChange={(e) => {
                        setDepartureDate(e.target.value);
                        if (returnDate < e.target.value) setReturnDate(e.target.value);
                      }}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                  {tripType === "ROUND_TRIP" && (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Return Date
                      </label>
                      <input
                        type="date"
                        min={departureDate}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-ink focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDatesOpen(false);
                  }}
                  className="w-full py-2.5 bg-primary hover:bg-primary-active text-on-primary font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Confirm Dates
                </button>
              </div>
            )}
          </div>

          {/* Travelers & Cabin Class (3 cols on lg, 3 cols on xl) */}
          <div ref={paxRef} className="md:col-span-1 lg:col-span-3 relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPaxOpen(!paxOpen);
              }}
              className={cn(
                "w-full h-[74px] px-4 py-3 bg-white text-left rounded-xl transition-all duration-150 flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm cursor-pointer",
                paxOpen && "ring-2 ring-primary/40"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-primary transition-colors whitespace-nowrap block">
                  Travelers & Class
                </span>
                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0", paxOpen && "rotate-180")} />
              </div>
              <div className="text-sm font-bold text-ink truncate leading-tight w-full">
                {totalPassengers} {totalPassengers === 1 ? "Adult" : "Travelers"}, {cabinClassLabels[cabinClass]}
              </div>
            </button>

            {/* Travelers Popover */}
            {paxOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-hairline shadow-2xl p-4 z-50 space-y-4">
                <div className="text-xs font-bold text-ink uppercase tracking-wider border-b border-slate-100 pb-2">
                  Travelers & Cabin Class
                </div>

                {/* Steppers */}
                <div className="space-y-3">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-ink block">Adults</span>
                      <span className="text-[10px] text-slate-400">Age 13+</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        disabled={adults <= 1}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAdults(adults - 1);
                        }}
                        className="w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-ink">{adults}</span>
                      <button
                        type="button"
                        disabled={adults >= 9}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAdults(adults + 1);
                        }}
                        className="w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-ink block">Children</span>
                      <span className="text-[10px] text-slate-400">Ages 2 - 12</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        disabled={childrenCount <= 0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setChildrenCount(childrenCount - 1);
                        }}
                        className="w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-ink">{childrenCount}</span>
                      <button
                        type="button"
                        disabled={childrenCount >= 8}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setChildrenCount(childrenCount + 1);
                        }}
                        className="w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Infants */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-ink block">Infants</span>
                      <span className="text-[10px] text-slate-400">Under 2 (on lap)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        disabled={infants <= 0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setInfants(infants - 1);
                        }}
                        className="w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-ink">{infants}</span>
                      <button
                        type="button"
                        disabled={infants >= adults}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setInfants(infants + 1);
                        }}
                        className="w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cabin Class Selection */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Cabin Class
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"] as CabinClass[]).map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCabinClass(cls);
                        }}
                        className={cn(
                          "py-2 px-2.5 rounded-lg text-xs font-semibold text-left transition-colors border cursor-pointer",
                          cabinClass === cls
                            ? "bg-primary/10 border-primary text-ink font-bold ring-1 ring-primary"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {cabinClassLabels[cls]}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPaxOpen(false);
                  }}
                  className="w-full py-2.5 bg-ink hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Apply Selection
                </button>
              </div>
            )}
          </div>

          {/* Search Button (2 cols on lg, 2 cols on xl) */}
          <div className="md:col-span-2 lg:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[74px] px-6 bg-primary hover:bg-primary-bright active:bg-primary-active text-on-primary font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin flex-shrink-0" />
                  <span className="text-base font-bold">Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 flex-shrink-0" />
                  <span className="text-lg font-bold">Search</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Sub-bar: Direct Flights, Add Hotel, Price Alert Switch */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 text-xs text-white">
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={directFlightsOnly}
                onChange={(e) => setDirectFlightsOnly(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-400 bg-slate-700/60 cursor-pointer"
              />
              <span className="group-hover:text-primary transition-colors font-medium">Direct Flights</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={addHotel}
                onChange={(e) => setAddHotel(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-400 bg-slate-700/60 cursor-pointer"
              />
              <span className="group-hover:text-primary transition-colors font-medium">Add Hotel & Transfers</span>
            </label>
          </div>

          {/* Switch: Sign up for best flight deals */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              role="switch"
              aria-checked={dealAlertsActive}
              onClick={(e) => {
                e.preventDefault();
                if (!dealAlertsActive && !alertSubscribed) {
                  setShowAlertModal(true);
                } else {
                  setDealAlertsActive(!dealAlertsActive);
                }
              }}
              className={cn(
                "w-10 h-5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer",
                dealAlertsActive ? "bg-primary" : "bg-slate-600 hover:bg-slate-500"
              )}
            >
              <span
                className={cn(
                  "w-4 h-4 rounded-full bg-white transition-transform transform shadow-sm",
                  dealAlertsActive ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <span
              onClick={() => setShowAlertModal(true)}
              className="text-white/90 hover:text-white cursor-pointer font-medium flex items-center space-x-1"
            >
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span>Sign up for best flight deals</span>
            </span>
          </div>
        </div>
      </form>

      {/* Price Alert Subscription Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-hairline space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink">Be the first to know about price drops!</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Receive instant fare alert notifications when airlines discount flights from Entebbe and regional hubs.
              </p>
            </div>

            {alertSubscribed ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>You are subscribed! We will notify you when fares drop.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (alertEmail.includes("@")) {
                      setAlertSubscribed(true);
                      setDealAlertsActive(true);
                      setTimeout(() => setShowAlertModal(false), 1600);
                    }
                  }}
                  className="w-full h-12 bg-primary hover:bg-primary-bright font-bold text-on-primary rounded-xl text-sm transition-colors shadow-md cursor-pointer"
                >
                  Sign Up for Price Alerts
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowAlertModal(false)}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
