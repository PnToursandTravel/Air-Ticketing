"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  RotateCcw,
  AlertOctagon,
  Clock,
  CreditCard,
  FileText,
  Building2,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  Receipt,
  Scale,
  DollarSign,
  Printer,
  ShieldCheck,
} from "lucide-react";

export default function RefundPolicyPage() {
  const lastUpdated = "September 16, 2026";

  const sections = [
    { id: "scope", title: "1. Scope & IATA Fare Rule Hierarchy" },
    { id: "voluntary", title: "2. Voluntary Cancellations & Penalties" },
    { id: "involuntary", title: "3. Involuntary Refunds (Airlines Delays & Cancellations)" },
    { id: "taxes-fees", title: "4. Government Taxes & Surcharges (YQ/YR)" },
    { id: "no-show", title: "5. Passenger No-Show Policy & Forfeiture" },
    { id: "partially-used", title: "6. Partially Flown Tickets & Pro-Rata Reissue" },
    { id: "payment-method", title: "7. Original Form of Payment (OFOP) & AML" },
    { id: "timelines", title: "8. Settlement Cycles & Processing Timelines" },
    { id: "compassionate", title: "9. Medical Emergencies & Compassionate Waivers" },
    { id: "request-procedure", title: "10. How to Submit a Refund Request" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-surface-secondary text-on-dark py-16 px-4 sm:px-8 border-b border-hairline-dark relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="semantic-up">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              IATA Resolution 824r Standard
            </Badge>
            <Badge variant="pill">
              Aviation Consumer Rights Aligned
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-sans text-on-dark">
            International Flight Refund & Cancellation Policy
          </h1>

          <p className="text-sm sm:text-base text-on-dark-soft max-w-3xl leading-relaxed">
            Transparent refund rules, airline fare basis terms, cancellation penalties, and 
            statutory passenger rights governed by IATA BSP/ARC regulations and operating airline tariffs.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-on-dark-soft/80">
            <span className="font-mono">Last Reviewed: {lastUpdated}</span>
            <span>•</span>
            <span>IATA Agency: 96-2 1849 2</span>
            <span>•</span>
            <button
              onClick={() => typeof window !== "undefined" && window.print()}
              className="inline-flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors font-medium cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Policy</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Table of Contents Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 space-y-3 bg-surface p-4 rounded-xl border border-hairline shadow-subtle">
              <p className="text-xs font-bold uppercase tracking-wider text-muted font-sans">
                On This Page
              </p>
              <nav className="space-y-1 text-xs">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block py-1.5 px-2 rounded text-body hover:text-primary hover:bg-canvas transition-colors truncate"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
              <div className="pt-3 border-t border-hairline text-center">
                <Link
                  href="/terms-of-carriage"
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center space-x-1"
                >
                  <Scale className="w-3 h-3" />
                  <span>Terms of Carriage</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Detailed Policy Text */}
          <div className="lg:col-span-3 space-y-10 text-sm leading-relaxed text-body">
            
            {/* Highlights Card */}
            <Card className="p-6 bg-surface border-primary/20 rounded-xl space-y-3 shadow-subtle">
              <div className="flex items-center space-x-2 text-primary font-semibold">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-base">Aviation Consumer Protection Standard</span>
              </div>
              <p className="text-xs sm:text-sm text-body leading-normal">
                PN Tours and Travel acts as an accredited travel agency under International Air Transport 
                Association (IATA) regulations. All ticket cancellations and refund determinations are 
                principally dictated by the specific <strong>Operating Airline&apos;s Fare Basis Rules</strong> filed 
                with ATPCO/GDS at the instant of electronic ticketing.
              </p>
            </Card>

            {/* Section 1: Scope & Hierarchy */}
            <section id="scope" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-ink flex items-center space-x-2 border-b border-hairline pb-2">
                <Scale className="w-5 h-5 text-primary flex-shrink-0" />
                <span>1. Scope & IATA Fare Rule Hierarchy</span>
              </h2>
              <p>
                This Refund Policy establishes the contractual terms governing flight cancellations, 
                ticket refunds, and fare adjustments processed through PN Tours and Travel (&ldquo;PN Tours&rdquo;, 
                &ldquo;we&rdquo;, &ldquo;us&rdquo;) for scheduled commercial airline passenger tickets.
              </p>
              <p>
                When you purchase an air ticket on our platform, a dual contractual framework applies:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Ticketing Agency Service Agreement:</strong> Between you (the Passenger) and PN Tours and Travel 
                  for search, booking aggregation, ticketing fulfillment, and customer support.
                </li>
                <li>
                  <strong>Contract of Carriage:</strong> Between you (the Passenger) and the validated Operating Airline 
                  (or Ticketing Carrier) under international air transport conventions (Warsaw / Montreal Convention 1999) 
                  and the carrier&apos;s filed tariff rules.
                </li>
              </ul>
              <p className="bg-canvas p-3 rounded border border-hairline text-xs">
                <strong>Legal Rule:</strong> Airlines retain full authority over their published fare basis restrictions. 
                PN Tours and Travel cannot override, waive, or contravene an airline&apos;s automated GDS fare rules 
                without an official written waiver code or authority issued by that carrier.
              </p>
            </section>

            {/* Section 2: Voluntary Cancellations */}
            <section id="voluntary" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-ink flex items-center space-x-2 border-b border-hairline pb-2">
                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                <span>2. Voluntary Cancellations & Fare Basis Penalties</span>
              </h2>
              <p>
                A &ldquo;Voluntary Cancellation&rdquo; occurs when a passenger chooses not to travel for personal reasons, 
                business schedule changes, passport/visa complications, or any condition not caused by airline disruption.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-lg border border-hairline bg-surface space-y-1.5">
                  <span className="font-bold text-ink text-xs block">Non-Refundable Fares</span>
                  <p className="text-[11px] text-muted leading-tight">
                    Basic Economy, promo, and deeply discounted saver fares. The base fare and airline fuel surcharges 
                    (YQ/YR) are 100% non-refundable upon cancellation.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg border border-hairline bg-surface space-y-1.5">
                  <span className="font-bold text-ink text-xs block">Refundable With Penalty</span>
                  <p className="text-[11px] text-muted leading-tight">
                    Standard Economy & Business class. Refundable subject to airline-imposed cancellation penalty 
                    (typically $100–$350+ per ticket depending on routing) deducted prior to payout.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg border border-hairline bg-surface space-y-1.5">
                  <span className="font-bold text-ink text-xs block">Fully Flexible Fares</span>
                  <p className="text-[11px] text-muted leading-tight">
                    Full-fare Economy, Premium, or First Class. 100% refundable with zero airline penalty when cancelled 
                    prior to scheduled flight departure.
                  </p>
                </div>
              </div>
              <p className="text-xs pt-1">
                <strong>Agency Administrative Fee:</strong> In addition to airline cancellation penalties, PN Tours 
                and Travel applies a standard administrative cancellation processing fee (USD $35 or local equivalent 
                per ticket) to cover manual GDS coupon refund transactions and financial settlement handling.
              </p>
            </section>

            {/* Section 3: Involuntary Refunds */}
            <section id="involuntary" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-ink flex items-center space-x-2 border-b border-hairline pb-2">
                <AlertOctagon className="w-5 h-5 text-semantic-up flex-shrink-0" />
                <span>3. Involuntary Refunds (Airline Delays, Cancellations & Schedule Changes)</span>
              </h2>
              <p>
                An &ldquo;Involuntary Refund&rdquo; arises when the airline fails to provide the booked carriage, 
                including but not limited to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Flight cancellation by the airline without acceptable re-accommodation;</li>
                <li>
                  Substantial schedule modification (typically departure or arrival adjusted by more than 3 to 5 hours, 
                  or an unviable connection resulting in a misconnect);
                </li>
                <li>Involuntary denied boarding due to airline overbooking;</li>
                <li>Omission of an agreed scheduled stopping place or downgrade to a lower class of cabin.</li>
              </ul>
              <div className="p-4 rounded-lg bg-semantic-up/10 border border-semantic-up/20 space-y-2">
                <p className="text-xs font-semibold text-semantic-up">
                  Passenger Entitlements Under Involuntary Irregularities
                </p>
                <p className="text-xs text-body leading-normal">
                  In an involuntary cancellation, passengers are entitled under international civil aviation regulations 
                  (including US DOT 14 CFR Part 260/259, European Regulation EC 261/2004, and UK Air Passenger Rights) 
                  to a <strong>100% full refund</strong> of all unused flight segments, with zero airline cancellation 
                  penalties and a full waiver of agency processing fees.
                </p>
              </div>
            </section>

            {/* Section 4: Taxes and Surcharges */}
            <section id="taxes-fees" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-ink flex items-center space-x-2 border-b border-hairline pb-2">
                <Receipt className="w-5 h-5 text-primary flex-shrink-0" />
                <span>4. Government Taxes & Surcharges (YQ / YR)</span>
              </h2>
              <p>
                Air ticket prices comprise Base Fare, Government/Airport Taxes, and Carrier-Imposed Surcharges:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Statutory Government & Airport Taxes (e.g., US, GB, DE, TS codes):</strong> 
                  These represent passenger-boarding facility charges and security fees collected by the airline on 
                  behalf of civil aviation authorities. If a non-refundable ticket is cancelled completely unflown, 
                  unconsumed statutory government taxes are generally refundable upon request under international law.
                </li>
                <li>
                  <strong>Carrier Surcharges (YQ / YR):</strong> Airline fuel and operational surcharges. In non-refundable 
                  tickets, YQ/YR surcharges follow the exact refundability of the base fare according to airline ATPCO filing 
                  rules and are non-refundable on most promotional fares.
                </li>
              </ul>
            </section>

            {/* Section 5: No-Show Policy */}
            <section id="no-show" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-ink flex items-center space-x-2 border-b border-hairline pb-2">
                <AlertTriangle className="w-5 h-5 text-semantic-down flex-shrink-0" />
                <span>5. Passenger No-Show Policy & Forfeiture</span>
              </h2>
              <p>
                A passenger is classified as a &ldquo;No-Show&rdquo; if they fail to check in and board their scheduled 
                flight before airport gate closure, or fail to cancel their electronic reservation with PN Tours or the 
                airline prior to the scheduled departure cutoff (usually 3 to 24 hours before flight time).
              </p>
              <div className="p-3.5 rounded-lg border border-semantic-down/30 bg-semantic-down/5 space-y-1.5">
                <p className="text-xs font-bold text-semantic-down">Consequences of a No-Show Status:</p>
                <p className="text-xs text-body leading-normal">
                  In international GDS systems, a No-Show automatically voids the remaining coupons of the ticket. 
                  Most airlines impose severe No-Show penalty fees (often exceeding the ticket value) or completely 
                  forfeit the entire ticket balance. PN Tours and Travel cannot override airline GDS No-Show penalties.
                </p>
              </div>
            </section>

            {/* Section 6: Partially Used Tickets */}
            <section id="partially-used" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-ink flex items-center space-x-2 border-b border-hairline pb-2">
                <RotateCcw className="w-5 h-5 text-primary flex-shrink-0" />
                <span>6. Partially Flown Tickets & Pro-Rata Reissue</span>
              </h2>
              <p>
                If a passenger flies the outbound flight coupon of a roundtrip itinerary and requests to cancel the 
                return journey:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>The refund is NOT 50% of the ticket price:</strong> International airline fare recalculation 
                  rules require that the completed outbound leg be re-priced at the published <em>full unrestricted one-way 
                  fare</em> for that route on the travel date.
                </li>
                <li>
                  If the standalone one-way fare plus applicable cancellation penalties equals or exceeds the total roundtrip 
                  fare originally paid, the residual refund value is <strong>zero ($0.00)</strong>.
                </li>
                <li>
                  Only unconsumed government arrival/departure taxes for the unflown sector remain eligible for refund.
                </li>
              </ul>
            </section>

            {/* Section 7: OFOP & AML */}
            <section id="payment-method" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-ink flex items-center space-x-2 border-b border-hairline pb-2">
                <CreditCard className="w-5 h-5 text-primary flex-shrink-0" />
                <span>7. Original Form of Payment (OFOP) & AML Compliance</span>
              </h2>
              <p>
                Under International Air Transport Association (IATA) Resolution 824r, Banking AML (Anti-Money Laundering) 
                statutes, and credit card association network rules (Visa, MasterCard, American Express):
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Mandatory Refund Matching:</strong> All approved refund disbursements must be credited 
                  <strong>strictly back to the original source of payment</strong> (the exact credit card, debit card, or 
                  payment gateway transaction ID) used at booking.
                </li>
                <li>
                  <strong>No Third-Party or Cash Transfers:</strong> Refunds will not be issued in cash, transferred to 
                  an alternate credit card, or wired to a third party under any circumstances.
                </li>
                <li>
                  <strong>Expired or Replaced Cards:</strong> If your original payment card has expired, been stolen, or 
                  replaced, card issuers and banking networks automatically route the refund settlement credit to your 
                  underlying active bank account.
                </li>
              </ul>
            </section>

            {/* Section 8: Processing Timelines */}
            <section id="timelines" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-ink flex items-center space-x-2 border-b border-hairline pb-2">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <span>8. Settlement Cycles & Processing Timelines</span>
              </h2>
              <p>
                Once a refund request has been verified and approved by the operating carrier:
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Automated GDS Refunds:</strong> Submitted directly to the airline via Amadeus/Sabre/Travelport 
                    BSP settlement. Processed by payment processors within <strong>7 to 14 business days</strong>.
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Manual Airline Refund Applications (RA):</strong> In itineraries involving schedule irregularities, 
                    bankrupt carriers, or medical waivers, the request must be audited manually by airline revenue accounting. 
                    Airline processing cycles typically require <strong>4 to 8 weeks</strong>.
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Card Issuer Posting:</strong> After our payment gateway releases the credit, your issuing bank 
                    determines when the funds appear on your monthly statement (normally within 1–2 billing cycles).
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9: Compassionate Waivers */}
            <section id="compassionate" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-ink flex items-center space-x-2 border-b border-hairline pb-2">
                <DollarSign className="w-5 h-5 text-primary flex-shrink-0" />
                <span>9. Medical Emergencies & Compassionate Waivers</span>
              </h2>
              <p>
                Many airlines offer compassionate waiver policies for unexpected hospitalization or death of a passenger 
                or immediate family member (spouse, child, parent).
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  Official medical documentation (stamped hospital admission record showing unfitness to fly on travel dates) 
                  or an official death certificate must be submitted.
                </li>
                <li>
                  PN Tours and Travel will transmit the documentation to the airline&apos;s waiver desk for special authorization 
                  (Waiver Code / OSI PNR entry).
                </li>
                <li>
                  Waiver approvals are at the sole discretion of the airline&apos;s corporate medical and legal departments.
                </li>
              </ul>
            </section>

            {/* Section 10: How to Submit */}
            <section id="request-procedure" className="space-y-3 scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-ink flex items-center space-x-2 border-b border-hairline pb-2">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>10. How to Submit a Formal Refund Request</span>
              </h2>
              <p>
                To avoid automated GDS No-Show penalties, all cancellation and refund requests must be logged through our 
                official channels as early as possible:
              </p>
              <div className="bg-surface p-4 rounded-xl border border-hairline space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="font-semibold text-ink block">Step 1: Locate PNR</span>
                    <span className="text-muted">Have your 6-character Airline PNR or PN Tours Booking ID ready.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-ink block">Step 2: Submit Notice</span>
                    <span className="text-muted">Email support@pntoursandtravel.com with subject &ldquo;REFUND REQUEST - [PNR]&rdquo;.</span>
                  </div>
                  <div>
                    <span className="font-semibold text-ink block">Step 3: Authorize Breakdown</span>
                    <span className="text-muted">Review our formal fee breakdown and provide written confirmation to finalize.</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">PN Tours &amp; Travel Passenger Support Desk</p>
                    <p className="text-muted font-mono">Email: refunds@pntoursandtravel.com | Phone: +256 700 000 000</p>
                  </div>
                  <Link href="/terms-of-carriage">
                    <Button variant="secondary-light" size="sm">
                      View Terms of Carriage
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
