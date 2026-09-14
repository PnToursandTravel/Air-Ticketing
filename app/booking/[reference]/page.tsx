"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Printer,
  Plane,
  Clock,
  Luggage,
  Phone,
  ShieldCheck,
  ArrowRight,
  Download,
  Share2,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { BookingRecord } from "@/types";
import { BookingService } from "@/lib/bookings/booking-service";
import { formatDuration, formatFlightDate, formatFlightTime, formatMoney } from "@/lib/utils";

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const reference = params.reference as string;
  const [booking, setBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    if (reference) {
      const found = BookingService.getByReference(reference);
      setBooking(found);
    }
  }, [reference]);

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-ink">Booking Reference Not Found</h2>
          <Button variant="primary" onClick={() => router.push("/")}>
            Return to Flight Search
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const offer = booking.offerSnapshot;
  const firstSeg = offer.outboundSegments[0];
  const lastSeg = offer.outboundSegments[offer.outboundSegments.length - 1];

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Top Success Banner */}
        <div className="bg-canvas rounded-xl p-8 border border-hairline shadow-soft-drop text-center space-y-4">
          <div className="w-14 h-14 rounded-pill bg-semantic-up/10 text-semantic-up flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <Badge variant="semantic-up" className="text-xs">
            {booking.status === "TICKETED" ? "E-Ticket Issued & Confirmed" : "Booking Confirmed"}
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-normal font-sans tracking-tight text-ink">
            Your flight reservation is complete.
          </h1>

          <p className="text-sm text-muted max-w-md mx-auto">
            A confirmation email with the official electronic ticket receipt has been dispatched to{" "}
            <span className="text-ink font-semibold">{booking.contactEmail}</span>.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="secondary-light"
              size="sm"
              onClick={() => window.print()}
              className="flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Itinerary</span>
            </Button>
            <Link href="/account/trips">
              <Button variant="primary" size="sm">
                View in My Trips
              </Button>
            </Link>
          </div>
        </div>

        {/* E-Ticket Official Slip Card */}
        <div className="bg-canvas rounded-xl border border-hairline shadow-lg overflow-hidden">
          {/* Slip Header */}
          <div className="bg-surface-dark text-on-dark p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img
                src="https://www.image2url.com/r2/default/images/1789406854595-5200c580-b543-4d37-b30f-73c90d73d473.png"
                alt="PN Tours and Travel"
                className="h-12 w-auto object-contain bg-white/10 p-1 rounded-sm"
              />
              <div>
                <span className="text-xs text-on-dark-soft uppercase font-mono tracking-wider block">
                  PN Tours & Travel • E-Ticket Receipt
                </span>
                <span className="text-2xl font-bold font-mono text-on-dark mt-0.5 block">
                  PNR: {booking.pnr || "PENDING"}
                </span>
                <span className="text-xs text-on-dark-soft font-mono">
                  Booking Reference #{booking.reference}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs space-y-1">
              <div className="text-on-dark-soft">
                Ticket Number:{" "}
                <span className="text-primary font-bold text-sm block sm:inline">
                  {booking.ticketNumbers?.[0] || "Issuance in Progress"}
                </span>
              </div>
              <div className="text-on-dark-soft">
                Status: <span className="text-semantic-up font-bold">{booking.status}</span>
              </div>
            </div>
          </div>

          {/* Slip Body */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Passenger Manifest */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                Passenger Manifest
              </h3>
              <div className="divide-y divide-hairline-soft border border-hairline rounded-md overflow-hidden">
                {booking.passengers.map((pax, i) => (
                  <div key={i} className="p-4 bg-canvas flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-sm text-ink block">
                        {pax.title} {pax.firstName} {pax.lastName}
                      </span>
                      <span className="text-muted font-mono">
                        Passport: {pax.passportNumber || "Verified"} • {pax.nationality || "UG"}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-muted block text-[11px]">Seat Status</span>
                      <span className="text-semantic-up font-bold">Confirmed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flight Segments */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                Flight Schedule & Itinerary
              </h3>
              <div className="bg-surface-soft rounded-lg p-6 border border-hairline space-y-6">
                {offer.outboundSegments.map((seg, idx) => (
                  <div key={seg.id} className="space-y-4">
                    <div className="flex items-center justify-between text-xs border-b border-hairline-soft pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-primary">{seg.flightNumber}</span>
                        <span>•</span>
                        <span className="font-semibold text-ink">{seg.airlineName}</span>
                      </div>
                      <Badge variant="pill">{seg.cabinClass}</Badge>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-4 text-xs">
                      <div>
                        <span className="text-muted block text-[11px]">Depart</span>
                        <span className="font-mono text-xl font-bold text-ink block">
                          {formatFlightTime(seg.departureTime)}
                        </span>
                        <span className="font-bold text-body">{seg.originAirport}</span>
                        <span className="text-muted block text-[10px]">
                          {formatFlightDate(seg.departureTime)}
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-mono text-muted">
                          {formatDuration(seg.durationMinutes)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-primary my-1" />
                        <span className="text-[10px] text-muted font-mono">{seg.aircraft}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-muted block text-[11px]">Arrive</span>
                        <span className="font-mono text-xl font-bold text-ink block">
                          {formatFlightTime(seg.arrivalTime)}
                        </span>
                        <span className="font-bold text-body">{seg.destinationAirport}</span>
                        <span className="text-muted block text-[10px]">
                          {formatFlightDate(seg.arrivalTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Barcode / QR Section */}
            <div className="pt-4 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                {/* Barcode visual lines */}
                <div className="h-12 flex items-center space-x-1 font-mono text-[9px] text-muted">
                  <div className="w-1 h-12 bg-ink"></div>
                  <div className="w-2 h-12 bg-ink"></div>
                  <div className="w-0.5 h-12 bg-ink"></div>
                  <div className="w-1.5 h-12 bg-ink"></div>
                  <div className="w-1 h-12 bg-ink"></div>
                  <div className="w-3 h-12 bg-ink"></div>
                  <div className="w-1 h-12 bg-ink"></div>
                  <div className="w-2 h-12 bg-ink"></div>
                  <div className="w-0.5 h-12 bg-ink"></div>
                  <div className="w-1.5 h-12 bg-ink"></div>
                  <div className="w-1 h-12 bg-ink"></div>
                  <div className="w-2.5 h-12 bg-ink"></div>
                  <div className="w-0.5 h-12 bg-ink"></div>
                </div>
                <div className="text-xs">
                  <span className="font-mono font-bold text-ink block">
                    ELECTRONIC TICKET PASS
                  </span>
                  <span className="text-muted font-mono text-[10px]">
                    ISSUED BY PN TOURS & TRAVEL LTD
                  </span>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-muted block text-[11px]">Total Paid:</span>
                <span className="font-mono font-bold text-lg text-primary">
                  {formatMoney(booking.priceSnapshot.totalMinor, booking.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Slip Footer Support */}
          <div className="bg-surface-soft p-4 border-t border-hairline text-xs text-muted flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>Need flight assistance? Contact 24/7 Desk: +256 785360444</span>
            </div>
            <span className="font-mono text-[10px]">Check-in opens 24h before departure</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
