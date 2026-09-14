"use client";

import React, { useState } from "react";
import { ArrowLeftRight, Calendar, Users, Sparkles, Search } from "lucide-react";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { Button } from "@/components/ui/Button";
import { CabinClass, FlightSearchRequest, TripType } from "@/types";

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
  const [paxOpen, setPaxOpen] = useState(false);

  const swapAirports = () => {
    const temp = originCode;
    setOriginCode(destinationCode);
    setDestinationCode(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  };

  const totalPassengers = adults + childrenCount + infants;

  return (
    <form
      action="javascript:void(0);"
      onSubmit={handleSearchSubmit}
      className="w-full bg-canvas rounded-xl p-4 sm:p-8 border border-hairline shadow-soft-drop"
    >
      {/* Top Filter Bar: Trip Type, Cabin Class, & Passengers */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-5 border-b border-hairline">
        {/* Trip type toggle pills */}
        <div className="inline-flex p-1 bg-surface-strong rounded-pill self-start">
          <button
            type="button"
            onClick={() => setTripType("ROUND_TRIP")}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-pill transition-all min-h-[36px] ${
              tripType === "ROUND_TRIP"
                ? "bg-canvas text-ink shadow-sm font-bold"
                : "text-muted hover:text-ink"
            }`}
          >
            Round Trip
          </button>
          <button
            type="button"
            onClick={() => setTripType("ONE_WAY")}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-pill transition-all min-h-[36px] ${
              tripType === "ONE_WAY"
                ? "bg-canvas text-ink shadow-sm font-bold"
                : "text-muted hover:text-ink"
            }`}
          >
            One Way
          </button>
        </div>

        {/* Cabin Class & Passenger Dropdowns */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
          {/* Cabin Class */}
          <select
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value as CabinClass)}
            className="h-10 px-3 bg-surface-strong text-ink font-semibold rounded-pill border-none outline-none cursor-pointer hover:bg-hairline transition-colors flex-1 sm:flex-initial"
            aria-label="Cabin Class"
          >
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Business Class</option>
            <option value="FIRST">First Class</option>
          </select>

          {/* Passenger Selector Popover */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => setPaxOpen(!paxOpen)}
              aria-expanded={paxOpen}
              aria-label="Select passengers"
              className="h-10 px-3 bg-surface-strong text-ink font-semibold rounded-pill flex items-center justify-center space-x-1.5 hover:bg-hairline transition-colors w-full sm:w-auto"
            >
              <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">
                {totalPassengers} Traveler{totalPassengers > 1 ? "s" : ""}
              </span>
            </button>

            {paxOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-canvas rounded-xl border border-hairline shadow-2xl p-4 z-50 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-ink block">Adults</span>
                    <span className="text-muted text-[10px]">Age 12+</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={() => setAdults(adults - 1)}
                      aria-label="Decrease adults"
                      className="w-8 h-8 rounded-pill bg-surface-strong font-bold text-ink disabled:opacity-40 min-h-[32px] flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-mono font-bold">{adults}</span>
                    <button
                      type="button"
                      disabled={adults >= 9}
                      onClick={() => setAdults(adults + 1)}
                      aria-label="Increase adults"
                      className="w-8 h-8 rounded-pill bg-surface-strong font-bold text-ink min-h-[32px] flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-ink block">Children</span>
                    <span className="text-muted text-[10px]">Age 2-11</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={childrenCount <= 0}
                      onClick={() => setChildrenCount(childrenCount - 1)}
                      aria-label="Decrease children"
                      className="w-8 h-8 rounded-pill bg-surface-strong font-bold text-ink disabled:opacity-40 min-h-[32px] flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-mono font-bold">{childrenCount}</span>
                    <button
                      type="button"
                      disabled={childrenCount >= 8}
                      onClick={() => setChildrenCount(childrenCount + 1)}
                      aria-label="Increase children"
                      className="w-8 h-8 rounded-pill bg-surface-strong font-bold text-ink min-h-[32px] flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-ink block">Infants</span>
                    <span className="text-muted text-[10px]">Under 2</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={infants <= 0}
                      onClick={() => setInfants(infants - 1)}
                      aria-label="Decrease infants"
                      className="w-8 h-8 rounded-pill bg-surface-strong font-bold text-ink disabled:opacity-40 min-h-[32px] flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-mono font-bold">{infants}</span>
                    <button
                      type="button"
                      disabled={infants >= adults}
                      onClick={() => setInfants(infants + 1)}
                      aria-label="Increase infants"
                      className="w-8 h-8 rounded-pill bg-surface-strong font-bold text-ink disabled:opacity-40 min-h-[32px] flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary-light"
                  size="sm"
                  className="w-full min-h-[40px]"
                  onClick={() => setPaxOpen(false)}
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Origin, Swap, Destination, Dates */}
      <div className="pt-5 space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-3 md:items-end">
        {/* Origin & Destination with Integrated Responsive Swap */}
        <div className="md:col-span-9 relative grid grid-cols-1 sm:grid-cols-11 gap-3 sm:gap-2 items-end">
          {/* Origin Airport */}
          <div className="sm:col-span-5">
            <AirportAutocomplete
              label="From (Origin)"
              value={originCode}
              excludeCode={destinationCode}
              onChange={(a) => setOriginCode(a.code)}
            />
          </div>

          {/* Swap Button (Smart Centered on both Mobile and Desktop) */}
          <div className="sm:col-span-1 flex justify-center items-center py-1 sm:pb-2">
            <button
              type="button"
              onClick={swapAirports}
              title="Swap Origin & Destination"
              aria-label="Swap Origin & Destination"
              className="w-10 h-10 rounded-pill bg-surface-strong hover:bg-hairline active:bg-primary/20 text-ink flex items-center justify-center transition-transform hover:rotate-180 duration-300 shadow-sm border border-hairline"
            >
              <ArrowLeftRight className="w-4 h-4 text-primary" />
            </button>
          </div>

          {/* Destination Airport */}
          <div className="sm:col-span-5">
            <AirportAutocomplete
              label="To (Destination)"
              value={destinationCode}
              excludeCode={originCode}
              onChange={(a) => setDestinationCode(a.code)}
            />
          </div>
        </div>

        {/* Departure Date */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Departure Date
          </label>
          <div className="relative">
            <input
              type="date"
              min={today}
              value={departureDate}
              onChange={(e) => {
                setDepartureDate(e.target.value);
                if (returnDate < e.target.value) setReturnDate(e.target.value);
              }}
              className="w-full h-14 px-4 bg-canvas text-ink text-sm font-mono rounded-md border border-hairline outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[56px]"
              aria-label="Departure Date"
            />
          </div>
        </div>
      </div>

      {/* Return Date row if Round-trip */}
      {tripType === "ROUND_TRIP" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Return Date
            </label>
            <input
              type="date"
              min={departureDate}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full h-14 px-4 bg-canvas text-ink text-sm font-mono rounded-md border border-hairline outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[56px]"
              aria-label="Return Date"
            />
          </div>
          <div className="md:col-span-6 flex items-end pt-2 md:pt-0">
            <Button
              type="submit"
              disabled={isLoading}
              variant="pill-cta"
              className="w-full min-h-[56px] text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Searching Live Airline Content...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Search Flights</span>
                </span>
              )}
            </Button>
          </div>
        </div>
      )}

      {tripType === "ONE_WAY" && (
        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            variant="pill-cta"
            className="w-full sm:w-auto px-10 min-h-[52px] text-base"
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>Searching Flights...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Search Flights</span>
              </span>
            )}
          </Button>
        </div>
      )}
    </form>
  );
};
