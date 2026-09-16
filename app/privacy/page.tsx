"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Shield,
  FileText,
  Plane,
  UserCheck,
  CreditCard,
  Building2,
  Printer,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 16, 2026";

  const sections = [
    { id: "overview", title: "1. Regulatory Framework & Scope" },
    { id: "data-collected", title: "2. Passenger Data We Collect" },
    { id: "legal-basis", title: "3. Legal Basis & Processing Purposes" },
    { id: "gds-sharing", title: "4. Aviation GDS & Cross-Border Sharing" },
    { id: "apis-pnr", title: "5. APIS, PNR & Border Control Compliance" },
    { id: "payments", title: "6. Payment & Financial Data Protection" },
    { id: "retention", title: "7. Data Retention & Archival Policies" },
    { id: "rights", title: "8. Passenger Rights & Access Controls" },
    { id: "security", title: "9. Technical & Cryptographic Safeguards" },
    { id: "contact", title: "10. Data Protection Officer Contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-surface-secondary text-on-dark py-16 px-4 sm:px-8 border-b border-hairline-dark relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="semantic-up">
              <Shield className="w-3.5 h-3.5 mr-1" />
              IATA Compliance Standard
            </Badge>
            <Badge variant="pill">
              ICAO & GDPR Aligned
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-sans text-on-dark">
            Passenger Privacy & Data Protection Policy
          </h1>

          <p className="text-sm sm:text-base text-on-dark-soft max-w-3xl leading-relaxed">
            International flight booking data privacy disclosures, Passenger Name Record (PNR) governance, 
            and global reservation data standards for PN Tours and Travel (IATA Accredited Agency).
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-on-dark-soft font-mono">
            <span>Effective Date: {lastUpdated}</span>
            <span>•</span>
            <span>Version: 3.2 (Production Institutional)</span>
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
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-ink uppercase tracking-wider">Document Navigation</h3>
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
                  Print Privacy Statement
                </Button>
                <div className="flex items-center justify-between text-[11px] text-muted pt-2">
                  <span>Related Policies:</span>
                  <div className="space-x-2">
                    <Link href="/terms-of-carriage" className="text-primary hover:underline font-medium">Terms</Link>
                    <span>•</span>
                    <Link href="/refund-policy" className="text-primary hover:underline font-medium">Refunds</Link>
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          {/* Legal Narrative Text */}
          <article className="lg:col-span-8 space-y-10 text-sm text-body leading-relaxed">
            
            {/* Section 1 */}
            <section id="overview" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">1. Regulatory Framework & Scope</h2>
              </div>
              <p>
                This Passenger Privacy and Data Protection Policy governs the collection, processing, storage, and cross-border transmission of personal data by <strong>PN Tours and Travel</strong> (hereinafter “PN Tours”, “we”, “us”, or “the Agency”), acting as an accredited travel agent under the International Air Transport Association (IATA Resolution 814/824) and applicable data protection regulations including the EU/UK General Data Protection Regulation (GDPR), the Uganda Data Protection and Privacy Act, and the International Civil Aviation Organization (ICAO) standards.
              </p>
              <p>
                When you make reservations for scheduled domestic, regional, or international flights through our portal, agency desks, or affiliated accredited corporate sub-agents, we act as both an independent <em>Data Controller</em> for reservation management and billing, and a <em>Data Processor</em> transmitting mandatory travel manifests to airlines, global distribution systems, and government security agencies.
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-collected" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">2. Passenger Data We Collect</h2>
              </div>
              <p>
                To generate valid airline electronic tickets (IATA Standard Electronic Ticket Document 724), verify passenger eligibility, and comply with civil aviation mandates, we collect the following categories of information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-surface-soft border border-hairline space-y-1.5">
                  <div className="flex items-center space-x-2 text-ink font-semibold text-xs">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span>Identity & Manifest Details</span>
                  </div>
                  <p className="text-xs text-muted">
                    Full passenger legal name (First, Middle, Surname matching government passport), title, date of birth, gender, nationality, passport number, issuing country, and passport expiry date.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-surface-soft border border-hairline space-y-1.5">
                  <div className="flex items-center space-x-2 text-ink font-semibold text-xs">
                    <Plane className="w-4 h-4 text-primary" />
                    <span>Itinerary & SSR Preferences</span>
                  </div>
                  <p className="text-xs text-muted">
                    Flight routing, origin, destination, cabin class, seat assignment, Special Service Requests (SSR) such as wheelchair assistance, dietary requirements, and medical clearances.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-surface-soft border border-hairline space-y-1.5">
                  <div className="flex items-center space-x-2 text-ink font-semibold text-xs">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span>Payment & Transactional Logs</span>
                  </div>
                  <p className="text-xs text-muted">
                    Billing address, tokenized transaction identifiers from PCI-DSS Level 1 payment processors, Mobile Money wallet references, and institutional prepaid credit balances.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-surface-soft border border-hairline space-y-1.5">
                  <div className="flex items-center space-x-2 text-ink font-semibold text-xs">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>Corporate & Agency Roster</span>
                  </div>
                  <p className="text-xs text-muted">
                    Accredited travel agency IATA/trade numbers, corporate travel manager credentials, cost center tags, staff emails, and security audit log traces.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="legal-basis" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">3. Legal Basis & Processing Purposes</h2>
              </div>
              <p>We process your personal data strictly under valid lawful bases recognized in international jurisprudence:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-body">
                <li><strong>Contractual Performance:</strong> Facilitating ticket quotation, seat reservation, electronic ticket issuance (e-ticket coupon creation), baggage check-in facilitation, and invoice reconciliation.</li>
                <li><strong>Legal & Civil Aviation Compliance:</strong> Satisfying mandatory border control declarations, immigration reporting, anti-money laundering (AML) verifications, and IATA Billing and Settlement Plan (BSP) audit guidelines.</li>
                <li><strong>Vital Interests & Emergency Response:</strong> Relaying passenger information to air search-and-rescue authorities or airline operational control during civil emergencies or irregular flight operations (IROPS).</li>
                <li><strong>Legitimate Interests:</strong> Preventing ticketing fraud, securing reservation systems against unauthorized automated scraping, and validating credit transactions.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="gds-sharing" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">4. Aviation GDS & Cross-Border Sharing</h2>
              </div>
              <p>
                Commercial aviation requires automated synchronization between global systems. By issuing a ticket through PN Tours and Travel, your itinerary and identity data are transmitted to:
              </p>
              <div className="p-4 rounded-xl bg-surface-soft border border-hairline space-y-2 text-xs">
                <div className="font-semibold text-ink">Authorized Global Intermediaries:</div>
                <ul className="space-y-1 text-muted">
                  <li>• <strong>Global Distribution Systems (GDS):</strong> Amadeus IT Group, Sabre Corporation, and Travelport for centralized schedule booking and interline coupon synchronization.</li>
                  <li>• <strong>Validating & Operating Air Carriers:</strong> Direct airlines providing physical carriage, code-share partners, and operating regional feeders.</li>
                  <li>• <strong>Airport Ground Handlers:</strong> Departure Control Systems (DCS) at origin, connection hubs, and final destination terminals for boarding pass issuance.</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="apis-pnr" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">5. APIS, PNR & Border Control Compliance</h2>
              </div>
              <p>
                In strict compliance with statutory sovereign immigration mandates (including US 49 U.S.C. § 44909, EU PNR Directive 2016/681, and bilateral Advance Passenger Information System regulations):
              </p>
              <p className="text-xs bg-surface-soft p-3.5 rounded-lg border border-hairline">
                Airlines and their accredited ticketing agents are legally compelled to transmit <strong>Advance Passenger Information (API)</strong> and <strong>Passenger Name Record (PNR)</strong> data to destination and transit border authorities prior to departure. Failure or refusal to supply accurate passport manifest information will result in denial of boarding without refund recourse under international carriage rules.
              </p>
            </section>

            {/* Section 6 */}
            <section id="payments" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">6. Payment & Financial Data Protection</h2>
              </div>
              <p>
                PN Tours and Travel adheres to <strong>PCI-DSS (Payment Card Industry Data Security Standard) Level 1</strong> requirements.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>We do not store complete 16-digit primary account numbers (PAN), CVV/CVC security codes, or card PINs on our servers.</li>
                <li>All credit and debit card transactions are encrypted via TLS 1.3 protocol and tokenized directly through regulated acquiring banks.</li>
                <li>Agency wallet debits and corporate credit lines are authenticated with role-based maker-checker verifications and cryptographically signed audit logs.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="retention" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">7. Data Retention & Archival Policies</h2>
              </div>
              <p>
                Ticket records, invoices, and electronic coupons are retained in compliance with international aviation accounting standards:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Flown & Ticketed Bookings:</strong> Retained for 7 years to comply with IATA BSP settlement audits, taxation authorities, and legal liability time limits.</li>
                <li><strong>Cancelled or Expired Quotes:</strong> Retained for 90 days before automated purge or irreversible pseudonymization.</li>
                <li><strong>Security & Access Logs:</strong> Immutable server audit logs recording IP addresses and role interactions are preserved for 24 months.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="rights" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">8. Passenger Rights & Access Controls</h2>
              </div>
              <p>
                Subject to aviation security mandates that take precedence over data erasure, passengers possess the following rights:
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <p>• <strong>Right to Inspection:</strong> Request a complete summary of active PNR records and personal data held by PN Tours.</p>
                <p>• <strong>Right to Rectification:</strong> Request correction of inaccurate contact numbers or email details (note: passenger legal names on issued non-refundable tickets are subject to strict airline re-issuance constraints).</p>
                <p>• <strong>Right to Erasure:</strong> Request deletion of your passenger profile upon expiry of mandatory statutory accounting retention terms.</p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="security" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">9. Technical & Cryptographic Safeguards</h2>
              </div>
              <p>
                We enforce comprehensive defense-in-depth infrastructure security:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>End-to-end transport layer security (TLS 1.3) with HSTS preload enforcement.</li>
                <li>Role-Based Access Control (RBAC) preventing unauthorized administrative inspection of customer booking files.</li>
                <li>Encrypted database storage at rest using AES-256 standard.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="contact" className="space-y-3 scroll-mt-24">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-bold text-ink">10. Data Protection Officer Contact</h2>
              </div>
              <p>
                If you have inquiries regarding this privacy framework, or wish to exercise data subject rights, please contact our Compliance Office:
              </p>
              <div className="p-4 rounded-xl bg-surface-card border border-hairline space-y-1 font-mono text-xs">
                <div className="font-bold text-ink">PN Tours and Travel Legal & Compliance Directorate</div>
                <div className="text-muted">IATA Agency Number: 96-2 1849 2</div>
                <div className="text-muted">Email: compliance@pntoursandtravel.com</div>
                <div className="text-muted">Data Protection Officer: privacy@pntoursandtravel.com</div>
                <div className="text-muted">Physical Address: Plot 14, Jinja Road, Kampala, Uganda</div>
              </div>
            </section>

          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
