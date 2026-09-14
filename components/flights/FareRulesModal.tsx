"use client";

import React from "react";
import { X, Plane, Clock, ShieldCheck, Luggage, ArrowRight } from "lucide-react";
import { Currency, FlightOffer } from "@/types";
import { formatDuration, formatFlightDate, formatFlightTime, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface FareRulesModalProps {
  offer: FlightOffer;
  currency?: Currency;
  onClose: () => void;
}

export const FareRulesModal: React.FC<FareRulesModalProps> = ({
  offer,
  currency = "USD",
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-canvas rounded-xl border border-hairline shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-hairline flex items-center justify-between bg-surface-soft">
          <div className="flex items-center space-x-2">
            <Plane className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-ink font-sans">
              Flight Itinerary & Fare Conditions
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-pill bg-canvas text-muted hover:text-ink flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Segments Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">
              Flight Segments
            </h4>
            <div className="space-y-6">
              {offer.outboundSegments.map((segment, idx) => (
                <div
                  key={segment.id}
                  className="bg-surface-soft rounded-lg p-4 border border-hairline-soft space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink">
                      Segment {idx + 1}: {segment.airlineName} ({segment.flightNumber})
                    </span>
                    <Badge variant="pill">{segment.aircraft}</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-muted block text-[11px]">Departs</span>
                      <span className="font-mono font-bold text-sm text-ink block">
                        {formatFlightTime(segment.departureTime)}
                      </span>
                      <span className="font-bold text-body">{segment.originAirport}</span>
                      <span className="text-muted block text-[10px]">
                        {formatFlightDate(segment.departureTime)}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-mono text-muted">
                        {formatDuration(segment.durationMinutes)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-primary my-0.5" />
                      <span className="text-[10px] text-semantic-up font-semibold">
                        {segment.cabinClass}
                      </span>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-muted block text-[11px]">Arrives</span>
                      <span className="font-mono font-bold text-sm text-ink block">
                        {formatFlightTime(segment.arrivalTime)}
                      </span>
                      <span className="font-bold text-body">{segment.destinationAirport}</span>
                      <span className="text-muted block text-[10px]">
                        {formatFlightDate(segment.arrivalTime)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Baggage & Inclusions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
              Included In This Fare
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start space-x-3 p-3 rounded-md bg-canvas border border-hairline">
                <Luggage className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink block">Baggage Allowance</span>
                  <span className="text-muted">{offer.baggageAllowance}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-md bg-canvas border border-hairline">
                <ShieldCheck className="w-4 h-4 text-semantic-up flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink block">Cancellation / Changes</span>
                  <span className="text-muted">
                    {offer.refundable
                      ? "Refundable with airline administrative fee"
                      : "Non-refundable ticket"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Price Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
              Itemized Fare Breakdown
            </h4>
            <div className="rounded-md border border-hairline bg-canvas p-4 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-body">
                <span>Airline Base Fare:</span>
                <span>{formatMoney(offer.price.baseFareMinor, currency)}</span>
              </div>
              <div className="flex justify-between text-body">
                <span>Government & Airport Taxes:</span>
                <span>{formatMoney(offer.price.taxesMinor, currency)}</span>
              </div>
              <div className="flex justify-between text-body">
                <span>Ticketing & Security Fees:</span>
                <span>{formatMoney(offer.price.feesMinor, currency)}</span>
              </div>
              <div className="border-t border-hairline pt-2 flex justify-between font-bold text-ink text-sm">
                <span>Total Payable:</span>
                <span className="text-primary">{formatMoney(offer.price.totalMinor, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-hairline bg-surface-soft flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
