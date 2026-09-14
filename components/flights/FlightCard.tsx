"use client";

import React, { useState } from "react";
import { Plane, Clock, Luggage, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { FlightOffer, Currency } from "@/types";
import { formatDuration, formatFlightTime, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FareRulesModal } from "./FareRulesModal";

interface FlightCardProps {
  offer: FlightOffer;
  currency?: Currency;
  onSelectOffer: (offer: FlightOffer) => void;
  isAgent?: boolean;
}

export const FlightCard: React.FC<FlightCardProps> = ({
  offer,
  currency = "USD",
  onSelectOffer,
  isAgent = false,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const firstSeg = offer.outboundSegments[0];
  const lastSeg = offer.outboundSegments[offer.outboundSegments.length - 1];

  return (
    <>
      <div className="bg-canvas rounded-xl p-6 border border-hairline hover:border-muted/40 transition-all duration-200 shadow-soft-drop flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Airline, Times, Layovers */}
        <div className="flex-1 space-y-4">
          {/* Top Airline Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-pill bg-surface-strong flex items-center justify-center font-mono font-bold text-xs text-primary">
                {offer.validatingAirlineCode}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-ink">{offer.validatingAirlineName}</span>
                <span className="text-xs text-muted font-mono">{firstSeg.flightNumber} • {firstSeg.aircraft}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center space-x-2">
              <Badge variant="pill">{offer.fareFamilyName}</Badge>
              {offer.refundable ? (
                <Badge variant="semantic-up">Refundable</Badge>
              ) : (
                <Badge variant="pill">Non-Refundable</Badge>
              )}
            </div>
          </div>

          {/* Flight Journey Timeline */}
          <div className="grid grid-cols-3 items-center gap-2 pt-2">
            {/* Departure */}
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-ink block">
                {formatFlightTime(firstSeg.departureTime)}
              </span>
              <span className="font-mono font-semibold text-xs text-body uppercase tracking-wider">
                {firstSeg.originAirport}
              </span>
            </div>

            {/* Flight Path Line */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-mono text-muted flex items-center space-x-1 mb-1">
                <Clock className="w-3 h-3 text-muted" />
                <span>{formatDuration(offer.totalDurationMinutes)}</span>
              </span>
              <div className="w-full flex items-center">
                <div className="h-[2px] bg-hairline flex-1"></div>
                <Plane className="w-3.5 h-3.5 text-primary rotate-90 mx-1 flex-shrink-0" />
                <div className="h-[2px] bg-hairline flex-1"></div>
              </div>
              <span className="text-[10px] font-semibold mt-1 text-body">
                {offer.stops === 0 ? (
                  <span className="text-semantic-up">Non-stop</span>
                ) : (
                  <span className="text-muted">
                    1 Stop ({offer.outboundSegments[0].destinationAirport})
                  </span>
                )}
              </span>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <span className="font-mono text-xl sm:text-2xl font-bold text-ink block">
                {formatFlightTime(lastSeg.arrivalTime)}
              </span>
              <span className="font-mono font-semibold text-xs text-body uppercase tracking-wider">
                {lastSeg.destinationAirport}
              </span>
            </div>
          </div>

          {/* Footer details info */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
            <span className="flex items-center space-x-1.5">
              <Luggage className="w-3.5 h-3.5 text-muted" />
              <span>{offer.baggageAllowance}</span>
            </span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="text-primary hover:underline font-semibold flex items-center space-x-0.5"
            >
              <Info className="w-3.5 h-3.5 mr-1" />
              <span>Flight Details & Fare Rules</span>
            </button>
            {offer.seatsRemaining <= 5 && (
              <span className="text-semantic-down font-mono font-bold text-[11px]">
                Only {offer.seatsRemaining} seats left
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Price & CTA */}
        <div className="md:border-l md:border-hairline md:pl-8 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center pt-4 md:pt-0 border-t md:border-t-0 border-hairline">
          <div className="text-left md:text-right">
            <span className="text-xs text-muted block">Total per traveler</span>
            <span className="font-mono text-2xl sm:text-3xl font-bold text-ink">
              {formatMoney(offer.price.totalMinor, currency)}
            </span>
            <span className="text-[11px] text-muted block">Taxes & fees included</span>
          </div>

          <div className="pt-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => onSelectOffer(offer)}
              className="flex items-center space-x-1.5 px-6"
            >
              <span>Select Flight</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Fare Rules Modal */}
      {detailsOpen && (
        <FareRulesModal offer={offer} currency={currency} onClose={() => setDetailsOpen(false)} />
      )}
    </>
  );
};
