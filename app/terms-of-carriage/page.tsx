"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FileCheck,
  Plane,
  AlertTriangle,
  Clock,
  Luggage,
  ShieldAlert,
  Scale,
  Printer,
  FileText,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export default function TermsOfCarriagePage() {
  const lastUpdated = "September 16, 2026";

  const sections = [
    { id: "preamble", title: "1. International Conventions & Scope" },
    { id: "agency-role", title: "2. Role of PN Tours and Travel (IATA Agent)" },
    { id: "ticket-validity", title: "3. Ticket Validity & Coupon Sequence" },
    { id: "travel-docs", title: "4. Passport, Visa & Border Compliance" },
    { id: "checkin-deadlines", title: "5. Check-In & Boarding Deadlines" },
    { id: "baggage-dangerous", title: "6. Baggage Rules & Dangerous Goods" },
    { id: "schedules-delays", title: "7. Flight Schedules, Delays & Irregularities" },
    { id: "refusal-carriage", title: "8. Refusal of Carriage & Passenger Conduct" },
    { id: "liability-limits", title: "9. Montreal Convention Liability Limits" },
    { id: "governing-law", title: "10. Applicable Law & Dispute Resolution" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-surface-secondary text-on-dark py-16 px-4 sm:px-8 border-b border-hairline-dark relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="semantic-up">
              <Scale className="w-3.5 h-3.5 mr-1" />
              IATA Resolution 724 Standard
            </Badge>
            <Badge variant="pill">
              Montreal Convention 1999
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-sans text-on-dark">
            General Conditions of International Carriage
          </h1>

          <p className="text-sm sm:text-base text-on-dark-soft max-w-3xl leading-relaxed">
            International air travel terms governing passenger carriage, electronic ticketing, baggage liabilities, 
            flight schedule adjustments, and sovereign entry compliance for PN Tours and Travel.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-on-dark-soft font-mono">
            <span>Effective Date: {lastUpdated}</span>
            <span>•</span>
            <span>Standard: Warsaw & Montreal Conventions</span>
            <span>•</span>
            <span>IATA Code: 96-2 1849 2</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Quick Table of Contents Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <Card variant="bordered" className="p-6 sticky top-24 space-y-4 bg-surface-soft/40 backdrop-blur-sm">
              <div className="flex items-center space-x-2 border-b border-hairline pb-3">
                <FileCheck className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-ink uppercase tracking-wider">Carriage Articles</h3>
              </div>

              <nav className="space-y-1.5">
                {sections.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-xs text-body hover:text-primary transition-colors py-1 px-2 rounded hover:bg-surface-soft font-medium"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>

              <div className="pt-4 border-t border-hairline space-y-2">
                <Button
                  variant="secondary-light"
                  size="sm"
                  onClick={() => window.print()}
                  className="w-full text-xs justify-center"
                >
                  <Printer className="w-3.5 h-3.5 mr-2" />
                  Print Terms of Carriage
                </Button>
                <div className="flex items-center justify-between text-[11px] text-muted pt-2">
                  <span>Related Disclosures:</span>
                  <div className="space-x-2">
                    <Link href="/refund-policy" className="text-primary hover:underline font-medium">Refund Rules</Link>
                    <span>•</span>
                    <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy</Link>
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          {/* Legal Narrative Text */}
          <article className="lg:col-span-8 space-y-10 text-sm text-body leading-relaxed">

            {/* Section 1 */}
            <section id="preamble" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">1. International Conventions & Scope</h2>
              </div>
              <p>
                Carriage hereunder is subject to the rules and limitations relating to liability established by either the <strong>Montreal Convention 1999</strong> (Convention for the Unification of Certain Rules for International Carriage by Air) or the <strong>Warsaw Convention 1929</strong> (including its Hague Protocol 1955 and Guadalajara Convention 1961), depending on the origin, transit points, and destination of the booked itinerary.
              </p>
              <p>
                These General Conditions of Carriage apply to all electronic ticket documents, itineraries, and baggage checks issued by <strong>PN Tours and Travel</strong>, acting on behalf of validated operating air carriers, whether booked directly by consumer passengers or through accredited corporate travel agencies.
              </p>
            </section>

            {/* Section 2 */}
            <section id="agency-role" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">2. Role of PN Tours and Travel (IATA Agent)</h2>
              </div>
              <p>
                PN Tours and Travel operates as an accredited IATA ticketing agent (Agency No. <strong>96-2 1849 2</strong>). In issuing tickets, PN Tours acts strictly as a commercial intermediary between the traveler and the operating carrier(s).
              </p>
              <div className="p-4 rounded-xl bg-surface-soft border border-hairline text-xs space-y-1.5 text-muted">
                <div className="font-bold text-ink flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Carrier Contract of Carriage Distinction</span>
                </div>
                <p>
                  The physical contract of air carriage is directly between the passenger and the operating airline named on the electronic ticket coupon. The operating airline’s individual Conditions of Carriage, tariff filings, and passenger rights commitments are incorporated herein by reference.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="ticket-validity" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">3. Ticket Validity & Coupon Sequence</h2>
              </div>
              <p>
                Unless otherwise explicitly specified in the fare rules associated with your ticket:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs">
                <li><strong>Period of Validity:</strong> A standard published-fare international ticket is valid for carriage for one (1) year from the date of issuance, or, if travel has commenced, one (1) year from the date of the first coupon travel. Promotional or restricted tactical fares carry shorter validity periods as stated on the electronic itinerary.</li>
                <li><strong>Strict Sequence of Flight Coupons (IATA Resolution 723a):</strong> Flight coupons must be used in the exact consecutive sequence as originally booked. If a passenger fails to use an outbound segment (or any intermediate transit leg) without prior written carrier re-routing, all subsequent and return segments will be automatically cancelled by the airline’s reservation system without entitlement to refund.</li>
                <li><strong>Non-Transferability:</strong> Tickets are strictly non-transferable. Travel may only be undertaken by the passenger named in the booking record. Any name correction required due to clerical error must comply with airline-specific name modification guidelines prior to departure.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="travel-docs" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">4. Passport, Visa & Border Compliance</h2>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <div className="font-bold flex items-center space-x-1.5 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <span>Mandatory Passenger Travel Document Responsibility</span>
                </div>
                <p>
                  It is the sole and absolute legal responsibility of each passenger to acquire, hold, and present all required valid passports, entry visas, transit visas, health certificates, yellow fever cards, and customs documentation required by the laws of countries of origin, transit, and destination.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>Passports must have a minimum validity of six (6) months beyond the scheduled return date for international itineraries.</li>
                <li>PN Tours and Travel and the operating carrier assume zero financial liability for passengers denied boarding or entry by sovereign immigration authorities. Fines, detention expenses, or deportation costs assessed against the carrier will be billed directly to the passenger.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="checkin-deadlines" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">5. Check-In & Boarding Deadlines</h2>
              </div>
              <p>
                To maintain safe flight dispatch and on-time international performance, strict airport deadlines are enforced:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                <div className="p-3.5 rounded-lg bg-surface-soft border border-hairline space-y-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <div className="font-bold text-ink">Long-Haul International</div>
                  <div className="text-muted font-mono">Arrive 3.5 to 4 Hours Prior</div>
                  <div className="text-[11px] text-muted">Counter closes 60m before departure</div>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-soft border border-hairline space-y-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <div className="font-bold text-ink">Regional & Continental</div>
                  <div className="text-muted font-mono">Arrive 2.5 to 3 Hours Prior</div>
                  <div className="text-[11px] text-muted">Counter closes 45m before departure</div>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-soft border border-hairline space-y-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <div className="font-bold text-ink">Boarding Gate Cut-Off</div>
                  <div className="text-muted font-mono">Closes 15-20 Min Prior</div>
                  <div className="text-[11px] text-muted">Doors sealed per ICAO safety</div>
                </div>
              </div>
              <p className="text-xs text-muted">
                Failure to complete check-in or present at the boarding gate by the designated time constitutes a <strong>Passenger No-Show</strong>. Airlines reserve the right to reassign reserved seating and forfeit the coupon value.
              </p>
            </section>

            {/* Section 6 */}
            <section id="baggage-dangerous" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">6. Baggage Rules & Dangerous Goods</h2>
              </div>
              <p>
                Baggage allowances (weight concept or piece concept) are governed by the validating carrier and indicated on your Electronic Ticket Receipt:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>Cabin Baggage:</strong> Generally limited to one (1) piece not exceeding 7kg–10kg (depending on airline) and standard dimensions (55 x 38 x 20 cm) plus one small personal item (handbag or laptop case).</li>
                <li><strong>Checked Baggage:</strong> Standard economy tickets typically allow one or two checked bags (23kg each). Excess weight or oversized items incur standard airline tariffs at airport check-in.</li>
                <li><strong>Prohibited & Dangerous Goods (IATA DGR):</strong> Passengers are strictly prohibited from packing hazardous substances in baggage, including flammable liquids, compressed gases, corrosives, explosives, firearms without police permits, and lithium batteries in checked luggage. Spare lithium power banks must be carried in cabin baggage only.</li>
                <li><strong>Fragile & Valuable Articles:</strong> Money, jewelry, negotiable documents, business files, passports, laptops, and vital medicines must not be placed in checked baggage. Airlines limit liability for loss of un-declared valuables in checked baggage.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="schedules-delays" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">7. Flight Schedules, Delays & Irregularities</h2>
              </div>
              <p>
                Schedules shown on published timetables or booking confirmations may change between the date of publication and the date of travel:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>Airlines will take all reasonable measures to transport passengers and baggage with reasonable dispatch. However, advertised times are not guaranteed and do not form part of the contract of carriage.</li>
                <li>In the event of flight delays, cancellations, or involuntary schedule revisions exceeding three (3) hours, operating carriers will provide re-accommodation on the next available flight, or process an involuntary refund through PN Tours in accordance with applicable consumer aviation standards (e.g. EU261, US DOT, or East African Civil Aviation regulations).</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="refusal-carriage" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">8. Refusal of Carriage & Passenger Conduct</h2>
              </div>
              <p>
                The operating carrier reserves the statutory right to refuse carriage or deplane any passenger if, in the carrier’s reasonable judgment:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>Such action is necessary for reasons of civil aviation safety, public health, or security.</li>
                <li>The passenger is visibly intoxicated by alcohol or impaired by narcotics.</li>
                <li>The passenger uses abusive language, engages in unruly conduct, or refuses to obey lawful crew instructions.</li>
                <li>The passenger’s travel documents are fraudulent or non-compliant with immigration laws.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="liability-limits" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">9. Montreal Convention Liability Limits</h2>
              </div>
              <p>
                Where the Montreal Convention 1999 applies, carrier liability is defined in <strong>Special Drawing Rights (SDR)</strong> as established by the International Monetary Fund:
              </p>
              <div className="p-4 rounded-xl bg-surface-soft border border-hairline space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-hairline pb-2 font-bold text-ink">
                  <span>Category</span>
                  <span>Montreal Convention Cap (SDR)</span>
                </div>
                <div className="flex justify-between text-body">
                  <span>Passenger Death or Bodily Injury:</span>
                  <span>Strict liability up to 128,821 SDR</span>
                </div>
                <div className="flex justify-between text-body">
                  <span>Passenger Delay:</span>
                  <span>Up to 5,346 SDR</span>
                </div>
                <div className="flex justify-between text-body">
                  <span>Baggage Destruction, Loss, or Delay:</span>
                  <span>Up to 1,288 SDR per passenger</span>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section id="governing-law" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">10. Applicable Law & Dispute Resolution</h2>
              </div>
              <p>
                Agency ticketing agreements are executed under the laws of Uganda. Any dispute arising out of ticketing intermediation that cannot be amicably resolved shall be subject to the exclusive jurisdiction of the competent courts of Kampala, without prejudice to consumer rights under international aviation conventions.
              </p>
              <div className="p-4 rounded-xl bg-surface-card border border-hairline space-y-1 font-mono text-xs">
                <div className="font-bold text-ink">PN Tours and Travel Legal Affairs</div>
                <div className="text-muted">Inquiries: legal@pntoursandtravel.com</div>
                <div className="text-muted">Telephone: +256 700 000000 / +256 414 000000</div>
              </div>
            </section>

          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
