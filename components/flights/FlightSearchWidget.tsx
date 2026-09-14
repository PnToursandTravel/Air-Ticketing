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
      className="w-full bg-canvas rounded-xl p-6 sm:p-8 border border-hairline shadow-soft-drop"
    >
      {/* Top Filter Bar: Trip Type & Cabin Class */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-hairline">
        {/* Trip type toggle pills */}
        <div className="inline-flex p-1 bg-surface-strong rounded-pill">
          <button
            type="button"
            onClick={() => setTripType("ROUND_TRIP")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-pill transition-all ${
              tripType === "ROUND_TRIP"
                ? "bg-canvas text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            Round Trip
          </button>
          <button
            type="button"
            onClick={() => setTripType("ONE_WAY")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-pill transition-all ${
              tripType === "ONE_WAY"
                ? "bg-canvas text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            One Way
          </button>
        </div>

        {/* Cabin Class & Passenger Dropdowns */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Cabin Class */}
          <select
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value as CabinClass)}
            className="h-9 px-3 bg-surface-strong text-ink font-semibold rounded-pill border-none outline-none cursor-pointer hover:bg-hairline transition-colors"
          >
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Business Class</option>
            <option value="FIRST">First Class</option>
          </select>

          {/* Passenger Selector Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPaxOpen(!paxOpen)}
              className="h-9 px-3 bg-surface-strong text-ink font-semibold rounded-pill flex items-center space-x-1.5 hover:bg-hairline transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>
                {totalPassengers} Traveler{totalPassengers > 1 ? "s" : ""}
              </span>
            </button>

            {paxOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-canvas rounded-xl border border-hairline shadow-2xl p-4 z-50 space-y-4">
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
                      className="w-7 h-7 rounded-pill bg-surface-strong font-bold text-ink disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-mono font-bold">{adults}</span>
                    <button
                      type="button"
                      disabled={adults >= 9}
                      onClick={() => setAdults(adults + 1)}
                      className="w-7 h-7 rounded-pill bg-surface-strong font-bold text-ink"
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
                      className="w-7 h-7 rounded-pill bg-surface-strong font-bold text-ink disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-mono font-bold">{childrenCount}</span>
                    <button
                      type="button"
                      disabled={childrenCount >= 8}
                      onClick={() => setChildrenCount(childrenCount + 1)}
                      className="w-7 h-7 rounded-pill bg-surface-strong font-bold text-ink"
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
                      className="w-7 h-7 rounded-pill bg-surface-strong font-bold text-ink disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-mono font-bold">{infants}</span>
                    <button
                      type="button"
                      disabled={infants >= adults}
                      onClick={() => setInfants(infants + 1)}
                      className="w-7 h-7 rounded-pill bg-surface-strong font-bold text-ink disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary-light"
                  size="sm"
                  className="w-full"
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-6 items-end">
        {/* Origin Airport */}
        <div className="md:col-span-4">
          <AirportAutocomplete
            label="From (Origin)"
            value={originCode}
            excludeCode={destinationCode}
            onChange={(a) => setOriginCode(a.code)}
          />
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center pb-1">
          <button
            type="button"
            onClick={swapAirports}
            title="Swap Origin & Destination"
            className="w-10 h-10 rounded-pill bg-surface-strong hover:bg-hairline text-ink flex items-center justify-center transition-transform hover:rotate-180 duration-300"
          >
            <ArrowLeftRight className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* Destination Airport */}
        <div className="md:col-span-4">
          <AirportAutocomplete
            label="To (Destination)"
            value={destinationCode}
            excludeCode={originCode}
            onChange={(a) => setDestinationCode(a.code)}
          />
        </div>

        {/* Departure Date */}
        <div className={`md:col-span-${tripType === "ROUND_TRIP" ? "3" : "3"}`}>
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
              className="w-full h-14 px-4 bg-canvas text-ink text-sm font-mono rounded-md border border-hairline outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
              className="w-full h-14 px-4 bg-canvas text-ink text-sm font-mono rounded-md border border-hairline outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="md:col-span-6 flex items-end">
            <Button
              type="submit"
              disabled={isLoading}
              variant="pill-cta"
              className="w-full"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Searching Live Airline Content...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
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
            className="w-full sm:w-auto px-10"
          >
            {isLoading ? "Searching Flights..." : "Search Flights"}
          </Button>
        </div>
      )}
    </form>
  );
};
