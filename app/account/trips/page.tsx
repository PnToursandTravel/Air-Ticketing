"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Plane, Calendar, ArrowRight, ShieldCheck, FileText, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { BookingService } from "@/lib/bookings/booking-service";
import { BookingRecord } from "@/types";
import { formatFlightDate, formatFlightTime, formatMoney } from "@/lib/utils";

export default function MyTripsPage() {
  const [searchRef, setSearchRef] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<BookingRecord | null>(null);
  const [searchError, setSearchError] = useState("");

  const allBookings = BookingService.getAll();

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    setSearchResult(null);

    const found = BookingService.getByReference(searchRef);
    if (!found) {
      setSearchError("No booking found with this reference number. Please check and retry.");
      return;
    }

    if (searchEmail && found.contactEmail.toLowerCase() !== searchEmail.toLowerCase()) {
      setSearchError("The email address provided does not match the contact on this reservation.");
      return;
    }

    setSearchResult(found);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="space-y-2 border-b border-hairline pb-6">
          <Badge variant="pill">Customer Portal</Badge>
          <h1 className="text-3xl sm:text-4xl font-normal font-sans tracking-tight text-ink">
            My Trips & Booking Management
          </h1>
          <p className="text-sm text-muted max-w-xl">
            Look up your flight reservations, download official e-ticket receipts, and request itinerary modifications.
          </p>
        </div>

        {/* Lookup Card */}
        <Card variant="bordered" className="max-w-2xl space-y-6">
          <h3 className="text-base font-bold text-ink font-sans">
            Retrieve Flight Reservation
          </h3>

          <form action="javascript:void(0);" onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="Booking Reference (e.g. PN-748921)"
                required
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                placeholder="PN-XXXXXX"
              />

              <TextInput
                label="Passenger Email"
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="traveler@example.com"
              />
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto min-h-[44px]">
              Find Reservation
            </Button>
          </form>

          {searchError && (
            <div className="p-4 rounded-md bg-semantic-down/10 text-semantic-down text-xs font-medium border border-semantic-down/20 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {searchResult && (
            <div className="p-6 rounded-xl bg-surface-soft border border-hairline space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-base text-ink block">
                    Reference #{searchResult.reference}
                  </span>
                  <span className="text-xs text-muted font-mono">
                    PNR: {searchResult.pnr || "Pending"}
                  </span>
                </div>
                <Badge
                  variant={searchResult.status === "TICKETED" ? "semantic-up" : "pill"}
                >
                  {searchResult.status}
                </Badge>
              </div>

              <div className="text-xs text-body">
                <span>Passenger: </span>
                <span className="font-bold text-ink">
                  {searchResult.passengers[0].firstName} {searchResult.passengers[0].lastName}
                </span>
                <span className="mx-2">•</span>
                <span>Airline: </span>
                <span className="font-bold text-ink">
                  {searchResult.offerSnapshot.validatingAirlineName}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="font-mono font-bold text-primary text-sm">
                  {formatMoney(searchResult.priceSnapshot.totalMinor, searchResult.currency)}
                </span>
                <Link href={`/booking/${searchResult.reference}`}>
                  <Button variant="secondary-light" size="sm" className="min-h-[44px]">
                    View Full E-Ticket
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Existing System Bookings Stream */}
        <div className="space-y-4">
          <h3 className="text-xl font-normal font-sans tracking-tight text-ink">
            Recent System Bookings
          </h3>

          <div className="space-y-4">
            {allBookings.map((b) => {
              const seg = b.offerSnapshot.outboundSegments[0];
              const lastSeg = b.offerSnapshot.outboundSegments[b.offerSnapshot.outboundSegments.length - 1];

              return (
                <div
                  key={b.reference}
                  className="bg-canvas rounded-xl p-6 border border-hairline shadow-soft-drop flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-sm text-ink">
                        #{b.reference}
                      </span>
                      {b.pnr && (
                        <Badge variant="pill" className="font-mono text-[10px]">
                          PNR: {b.pnr}
                        </Badge>
                      )}
                      <Badge variant={b.status === "TICKETED" ? "semantic-up" : "pill"}>
                        {b.status}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-semibold text-body">
                      <span>{seg.originAirport}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-primary" />
                      <span>{lastSeg.destinationAirport}</span>
                      <span className="text-muted font-normal">• {b.offerSnapshot.validatingAirlineName}</span>
                    </div>

                    <div className="text-xs text-muted">
                      <span>Traveler: {b.passengers[0].firstName} {b.passengers[0].lastName}</span>
                      <span className="mx-2">•</span>
                      <span>Date: {formatFlightDate(seg.departureTime)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-hairline">
                    <span className="font-mono font-bold text-base text-ink">
                      {formatMoney(b.priceSnapshot.totalMinor, b.currency)}
                    </span>
                    <Link href={`/booking/${b.reference}`}>
                      <Button variant="secondary-light" size="sm" className="min-h-[44px]">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
