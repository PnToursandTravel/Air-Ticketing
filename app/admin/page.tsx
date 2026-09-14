"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Server,
  TrendingUp,
  RotateCw,
  Sliders,
  DollarSign,
  Activity,
  CheckCircle2,
  Users,
  Plus,
  Search,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TextInput } from "@/components/ui/TextInput";
import { BookingService } from "@/lib/bookings/booking-service";
import { DEFAULT_PRICING_RULES } from "@/lib/pricing/engine";
import { BookingRecord, PricingRule } from "@/types";
import { formatFlightDate, formatMoney } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>(() => BookingService.getAll());
  const [rules, setRules] = useState<PricingRule[]>(DEFAULT_PRICING_RULES);
  const [retryingRef, setRetryingRef] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const handleRetryTicketing = async (reference: string) => {
    setRetryingRef(reference);
    try {
      const updated = await BookingService.retryTicketing(reference);
      setBookings(BookingService.getAll());
      setFeedback(`Ticketing re-issued successfully for #${reference}. PNR: ${updated.pnr}`);
      setTimeout(() => setFeedback(""), 5000);
    } catch (err: any) {
      setFeedback(`Retry failed: ${err?.message}`);
    } finally {
      setRetryingRef(null);
    }
  };

  const toggleRuleActive = (ruleId: string) => {
    setRules(
      rules.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Badge variant="pill">Operations & Control</Badge>
              <Badge variant="semantic-up">System Healthy</Badge>
            </div>
            <h1 className="text-3xl font-normal font-sans tracking-tight text-ink">
              Admin Operations Console
            </h1>
            <p className="text-xs text-muted font-mono">
              Role: SUPER_ADMIN • Environment: SANDBOX • Session: Active
            </p>
          </div>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* System Health & Operations Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <Card variant="bordered" className="space-y-2">
            <span className="text-xs text-muted font-mono uppercase">Total Bookings</span>
            <span className="font-mono text-3xl font-bold text-ink block">
              {bookings.length}
            </span>
            <span className="text-[11px] text-semantic-up font-semibold">
              Live reservations tracking
            </span>
          </Card>

          <Card variant="bordered" className="space-y-2">
            <span className="text-xs text-muted font-mono uppercase">Ticketing Rate</span>
            <span className="font-mono text-3xl font-bold text-semantic-up block">
              98.8%
            </span>
            <span className="text-[11px] text-muted">
              Auto-recovery active
            </span>
          </Card>

          <Card variant="bordered" className="space-y-2">
            <span className="text-xs text-muted font-mono uppercase">Gross Bookings</span>
            <span className="font-mono text-3xl font-bold text-ink block">
              $18,920.00
            </span>
            <span className="text-[11px] text-muted">
              Processed this week
            </span>
          </Card>

          <Card variant="bordered" className="space-y-2">
            <span className="text-xs text-muted font-mono uppercase">Supplier Latency</span>
            <span className="font-mono text-3xl font-bold text-primary block">
              42ms
            </span>
            <span className="text-[11px] text-semantic-up font-semibold">
              Mock Engine Online
            </span>
          </Card>
        </div>

        {/* Supplier Connection Status Matrix */}
        <div className="space-y-4">
          <h3 className="text-xl font-normal font-sans tracking-tight text-ink">
            Supplier & GDS Connection Matrix
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="bordered" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink">MockFlightEngine</span>
                <Badge variant="semantic-up">SANDBOX_CONNECTED</Badge>
              </div>
              <p className="text-xs text-muted">
                Simulates live 400+ airline inventories, PNR generation, and 13-digit ticket numbers.
              </p>
              <div className="text-[11px] font-mono text-muted">
                Latency: 42ms • Status: Operational
              </div>
            </Card>

            <Card variant="bordered" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink">IATA NDC / GDS Adapter</span>
                <Badge variant="pill">NOT_CONFIGURED</Badge>
              </div>
              <p className="text-xs text-muted">
                Provider-agnostic interface slot awaiting client IATA/GDS credentials.
              </p>
              <div className="text-[11px] font-mono text-muted">
                Pending commercial credentials
              </div>
            </Card>

            <Card variant="bordered" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink">Payment Gateway (Momo & Card)</span>
                <Badge variant="semantic-up">SANDBOX_CONNECTED</Badge>
              </div>
              <p className="text-xs text-muted">
                Local gateway abstraction simulating Visa, Mastercard, MTN and Airtel Mobile Money.
              </p>
              <div className="text-[11px] font-mono text-muted">
                Webhooks: Verified
              </div>
            </Card>
          </div>
        </div>

        {/* Pricing Rules Engine */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-normal font-sans tracking-tight text-ink">
                Multi-Tier Pricing & Markup Engine
              </h3>
              <p className="text-xs text-muted">
                Precedence: Agent Specific &gt; Route/Airline/Cabin &gt; Global Default
              </p>
            </div>
          </div>

          <div className="border border-hairline rounded-xl overflow-hidden shadow-soft-drop bg-canvas">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft border-b border-hairline text-muted uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Rule Name</th>
                  <th className="p-4">Scope</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Markup Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-surface-soft transition-colors">
                    <td className="p-4 font-mono font-bold text-ink">{rule.priority}</td>
                    <td className="p-4 font-bold text-ink">{rule.name}</td>
                    <td className="p-4">
                      <Badge variant="pill">{rule.appliesTo} {rule.targetCode ? `(${rule.targetCode})` : ""}</Badge>
                    </td>
                    <td className="p-4 font-mono">{rule.type}</td>
                    <td className="p-4 font-mono font-bold text-primary">
                      {rule.type === "FIXED"
                        ? `$${(rule.amountMinorOrPercent / 100).toFixed(2)}`
                        : `${rule.amountMinorOrPercent}%`}
                    </td>
                    <td className="p-4">
                      <Badge variant={rule.active ? "semantic-up" : "pill"}>
                        {rule.active ? "ACTIVE" : "DISABLED"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="secondary-light"
                        size="sm"
                        onClick={() => toggleRuleActive(rule.id)}
                      >
                        {rule.active ? "Disable" : "Enable"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking Queue & Ticketing Operations */}
        <div className="space-y-4">
          <h3 className="text-xl font-normal font-sans tracking-tight text-ink">
            Booking & Ticketing Lifecycle Queue
          </h3>

          <div className="border border-hairline rounded-xl overflow-hidden shadow-soft-drop bg-canvas">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft border-b border-hairline text-muted uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Traveler</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Booking Status</th>
                  <th className="p-4">Ticket Status</th>
                  <th className="p-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {bookings.map((b) => (
                  <tr key={b.reference} className="hover:bg-surface-soft transition-colors">
                    <td className="p-4 font-mono font-bold text-ink">
                      #{b.reference}
                      {b.pnr && <span className="block text-[10px] text-muted font-normal">PNR: {b.pnr}</span>}
                    </td>
                    <td className="p-4 font-sans text-body">
                      {b.passengers[0].firstName} {b.passengers[0].lastName}
                    </td>
                    <td className="p-4 font-mono">
                      {b.offerSnapshot.outboundSegments[0].originAirport} → {b.offerSnapshot.outboundSegments[0].destinationAirport}
                    </td>
                    <td className="p-4 font-mono font-bold text-ink">
                      {formatMoney(b.priceSnapshot.totalMinor, b.currency)}
                    </td>
                    <td className="p-4">
                      <Badge variant={b.status === "TICKETED" ? "semantic-up" : "pill"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={b.ticketStatus === "ISSUED" ? "semantic-up" : "pill"}>
                        {b.ticketStatus}
                      </Badge>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {b.status !== "TICKETED" && (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={retryingRef === b.reference}
                          onClick={() => handleRetryTicketing(b.reference)}
                        >
                          {retryingRef === b.reference ? "Issuing..." : "Retry Ticketing"}
                        </Button>
                      )}
                      <Link href={`/booking/${b.reference}`}>
                        <Button variant="secondary-light" size="sm">
                          View Slip
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
