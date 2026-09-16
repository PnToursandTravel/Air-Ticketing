"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Plane,
  CreditCard,
  Smartphone,
  Building,
  Lock,
  Luggage,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { BookingRecord, Currency, Passenger } from "@/types";
import { BookingService } from "@/lib/bookings/booking-service";
import { formatDuration, formatFlightDate, formatFlightTime, formatMoney } from "@/lib/utils";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const bookingReference = params.bookingId as string;

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "MOMO" | "BANK">("CARD");

  // Traveler forms
  const [passengers, setPassengers] = useState<Passenger[]>([
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
  ]);

  const [contactEmail, setContactEmail] = useState("traveler@example.com");
  const [contactPhone, setContactPhone] = useState("+256 785360444");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (bookingReference) {
      const found = BookingService.getByReference(bookingReference);
      if (found) {
        setBooking(found);
        setPassengers(found.passengers);
        setContactEmail(found.contactEmail);
        setContactPhone(found.contactPhone);
      }
      setLoading(false);
    }
  }, [bookingReference]);

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handlePayAndIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setErrorMsg("Please accept the terms of carriage and refund policies");
      return;
    }

    setProcessingPayment(true);
    setErrorMsg("");

    try {
      // Simulate payment processing and background ticketing transition
      const updatedBooking = await BookingService.completePaymentAndIssueTicket(
        bookingReference,
        paymentMethod
      );
      router.push(`/booking/${updatedBooking.reference}`);
    } catch (err: any) {
      setErrorMsg(err?.message || "Payment or ticketing failed. Please retry.");
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <Sparkles className="w-8 h-8 text-primary animate-spin mx-auto" />
            <span className="text-sm font-semibold text-ink">Loading booking session...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto flex flex-col items-center justify-center p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-semantic-down" />
          <h2 className="text-2xl font-bold text-ink">Booking Reference Not Found</h2>
          <p className="text-sm text-muted">
            The requested booking reservation #{bookingReference} has expired or does not exist.
          </p>
          <Button variant="primary" onClick={() => router.push("/")}>
            Back to Flight Search
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

      <main className="flex-1 py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="flex items-center justify-between pb-8 border-b border-hairline mb-8">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-muted block">
              Reference #{booking.reference}
            </span>
            <h1 className="text-2xl sm:text-3xl font-normal font-sans tracking-tight text-ink">
              Passenger Details & Payment
            </h1>
          </div>
          <div className="flex items-center space-x-2 text-xs text-semantic-up font-semibold bg-semantic-up/10 px-3 py-1.5 rounded-pill">
            <ShieldCheck className="w-4 h-4" />
            <span>Fares Secured & Revalidated</span>
          </div>
        </div>

        <form action="javascript:void(0);" onSubmit={handlePayAndIssue} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Traveler & Payment Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Passenger Details */}
            <Card variant="bordered" className="space-y-6">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <h3 className="text-base font-bold text-ink font-sans">
                  Traveler 1 (Primary Passenger)
                </h3>
                <Badge variant="pill">Adult (Age 12+)</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                    Title
                  </label>
                  <select
                    value={passengers[0].title}
                    onChange={(e) => handlePassengerChange(0, "title", e.target.value)}
                    className="w-full h-12 px-3 bg-surface-soft text-ink text-sm rounded-md border border-hairline outline-none focus:border-primary"
                  >
                    <option value="MR">Mr.</option>
                    <option value="MRS">Mrs.</option>
                    <option value="MS">Ms.</option>
                    <option value="MISS">Miss</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <TextInput
                    label="First & Middle Names (as in passport)"
                    required
                    value={passengers[0].firstName}
                    onChange={(e) => handlePassengerChange(0, "firstName", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                  label="Last Name / Surname"
                  required
                  value={passengers[0].lastName}
                  onChange={(e) => handlePassengerChange(0, "lastName", e.target.value)}
                />

                <TextInput
                  label="Date of Birth"
                  type="date"
                  required
                  value={passengers[0].dateOfBirth}
                  onChange={(e) => handlePassengerChange(0, "dateOfBirth", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <TextInput
                  label="Passport Number"
                  required
                  value={passengers[0].passportNumber || ""}
                  onChange={(e) => handlePassengerChange(0, "passportNumber", e.target.value)}
                />

                <TextInput
                  label="Passport Expiry"
                  type="date"
                  required
                  value={passengers[0].passportExpiry || ""}
                  onChange={(e) => handlePassengerChange(0, "passportExpiry", e.target.value)}
                />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                    Nationality
                  </label>
                  <select
                    value={passengers[0].nationality || "UG"}
                    onChange={(e) => handlePassengerChange(0, "nationality", e.target.value)}
                    className="w-full h-12 px-3 bg-surface-soft text-ink text-sm rounded-md border border-hairline outline-none focus:border-primary"
                  >
                    <option value="UG">Uganda (UG)</option>
                    <option value="KE">Kenya (KE)</option>
                    <option value="RW">Rwanda (RW)</option>
                    <option value="TZ">Tanzania (TZ)</option>
                    <option value="AE">United Arab Emirates (AE)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="US">United States (US)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* 2. Contact Details */}
            <Card variant="bordered" className="space-y-4">
              <h3 className="text-base font-bold text-ink font-sans border-b border-hairline pb-3">
                Booking Contact & E-Ticket Delivery
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                  label="Email Address (for e-ticket PDF)"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />

                <TextInput
                  label="Mobile Phone (SMS flight alerts)"
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </Card>

            {/* 3. Payment Method */}
            <Card variant="bordered" className="space-y-6">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <h3 className="text-base font-bold text-ink font-sans">
                  Select Payment Method
                </h3>
                <span className="text-xs text-muted flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-semantic-up" />
                  <span>256-bit TLS Encrypted</span>
                </span>
              </div>

              {/* Payment Tabs */}
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`p-3.5 sm:p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 min-h-[64px] ${
                    paymentMethod === "CARD"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-hairline hover:bg-surface-soft active:bg-hairline"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold text-ink">Card</span>
                  <span className="text-[10px] text-muted">Visa / Mastercard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("MOMO")}
                  className={`p-3.5 sm:p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 min-h-[64px] ${
                    paymentMethod === "MOMO"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-hairline hover:bg-surface-soft active:bg-hairline"
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold text-ink">Mobile Money</span>
                  <span className="text-[10px] text-muted">MTN / Airtel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("BANK")}
                  className={`p-3.5 sm:p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 min-h-[64px] ${
                    paymentMethod === "BANK"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-hairline hover:bg-surface-soft active:bg-hairline"
                  }`}
                >
                  <Building className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold text-ink">Bank Transfer</span>
                  <span className="text-[10px] text-muted">EFT / Wire</span>
                </button>
              </div>

              {/* Payment Fields Mock */}
              {paymentMethod === "CARD" && (
                <div className="space-y-4 pt-2">
                  <TextInput
                    label="Cardholder Name"
                    defaultValue="Denis Ayiko"
                    placeholder="Full name as on card"
                  />
                  <TextInput
                    label="Card Number"
                    defaultValue="4111 •••• •••• 8829"
                    placeholder="16-digit card number"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput label="Expiry" defaultValue="12/28" placeholder="MM/YY" />
                    <TextInput label="CVV / CVC" defaultValue="•••" placeholder="3 digits" />
                  </div>
                </div>
              )}

              {paymentMethod === "MOMO" && (
                <div className="space-y-4 pt-2">
                  <TextInput
                    label="Registered Mobile Number"
                    defaultValue="+256 785360444"
                    helperText="Prompt will be dispatched to your phone for PIN authorization"
                  />
                </div>
              )}

              {paymentMethod === "BANK" && (
                <div className="bg-surface-soft p-4 rounded-md border border-hairline text-xs space-y-2 font-mono">
                  <div className="font-bold text-ink">PN Tours and Travel Bank Details:</div>
                  <div>Bank: Stanbic Bank Uganda</div>
                  <div>Account Name: PN Tours and Travel Ltd</div>
                  <div>Account No: 9030018492018</div>
                  <div>Swift: SBICUGKX</div>
                </div>
              )}
            </Card>

            {/* Terms checkbox */}
            <div className="flex items-start space-x-3 text-xs text-body p-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded text-primary focus:ring-primary h-5 w-5 flex-shrink-0 cursor-pointer"
              />
              <label htmlFor="terms" className="cursor-pointer select-none leading-relaxed">
                I confirm the passenger names match their travel documents. I agree to the{" "}
                <Link href="/terms-of-carriage" target="_blank" className="underline hover:text-primary font-medium">
                  Terms of Carriage
                </Link>
                , international airline fare rules, and{" "}
                <Link href="/refund-policy" target="_blank" className="underline hover:text-primary font-medium">
                  Refund Policies
                </Link>
                .
              </label>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-md bg-semantic-down/10 border border-semantic-down/20 text-semantic-down text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Mobile Primary Submit Button (< lg) */}
            <div className="block lg:hidden pt-2">
              <Button
                type="submit"
                variant="pill-cta"
                disabled={processingPayment}
                className="w-full min-h-[52px] text-base"
              >
                {processingPayment ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Confirming & Issuing Ticket...</span>
                  </span>
                ) : (
                  <span>Pay & Issue E-Ticket • {formatMoney(booking.priceSnapshot.totalMinor, booking.currency)}</span>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <Card variant="bordered" className="space-y-6 sticky top-24">
              <div className="border-b border-hairline pb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-muted">
                  Itinerary Summary
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-bold text-base text-ink">
                    {offer.validatingAirlineName} ({firstSeg.flightNumber})
                  </span>
                </div>
              </div>

              {/* Route Summary */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-sm text-ink block">
                      {firstSeg.originAirport}
                    </span>
                    <span className="text-[11px] text-muted">
                      {formatFlightDate(firstSeg.departureTime)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-muted">
                      {formatDuration(offer.totalDurationMinutes)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span className="text-[10px] text-semantic-up">
                      {offer.stops === 0 ? "Non-stop" : "1 Stop"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-ink block">
                      {lastSeg.destinationAirport}
                    </span>
                    <span className="text-[11px] text-muted">
                      {formatFlightDate(lastSeg.arrivalTime)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline-soft flex items-center space-x-2 text-muted">
                  <Luggage className="w-3.5 h-3.5" />
                  <span>{offer.baggageAllowance}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-hairline pt-4 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between text-body">
                  <span>Airline Base Fare:</span>
                  <span>{formatMoney(booking.priceSnapshot.baseFareMinor, booking.currency)}</span>
                </div>
                <div className="flex justify-between text-body">
                  <span>Taxes & Airport Surcharges:</span>
                  <span>{formatMoney(booking.priceSnapshot.taxesMinor, booking.currency)}</span>
                </div>
                <div className="flex justify-between text-body">
                  <span>Ticketing & Security:</span>
                  <span>{formatMoney(booking.priceSnapshot.feesMinor + booking.priceSnapshot.adminMarkupMinor, booking.currency)}</span>
                </div>

                <div className="border-t border-hairline pt-3 flex justify-between font-bold text-ink text-base">
                  <span>Total Amount:</span>
                  <span className="text-primary font-mono text-xl">
                    {formatMoney(booking.priceSnapshot.totalMinor, booking.currency)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="pill-cta"
                disabled={processingPayment}
                className="w-full"
              >
                {processingPayment ? (
                  <span className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Confirming & Issuing Ticket...</span>
                  </span>
                ) : (
                  <span>Pay & Issue E-Ticket</span>
                )}
              </Button>
            </Card>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
