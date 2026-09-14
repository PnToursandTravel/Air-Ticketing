"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  History,
  Plane,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TextInput } from "@/components/ui/TextInput";
import { WalletService } from "@/lib/wallet/ledger";
import { BookingService } from "@/lib/bookings/booking-service";
import { formatFlightDate, formatMoney } from "@/lib/utils";
import Link from "next/link";

export default function AgentDashboardPage() {
  const router = useRouter();
  const walletId = "wallet_agency_01";
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [wallet, setWallet] = useState(() => WalletService.getWalletBalance(walletId));
  const [ledger, setLedger] = useState(() => WalletService.getLedger(walletId));
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("1000");
  const [topupSuccess, setTopupSuccess] = useState("");

  const agencyBookings = BookingService.getAll();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/v1/auth/me");
        const data = await res.json();
        if (!res.ok || !data.success || !data.user || !["AGENT_OWNER", "AGENT_STAFF"].includes(data.user.role)) {
          router.push("/agent/login");
          return;
        }
        setCurrentUser(data.user);
      } catch {
        router.push("/agent/login");
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/agent/login");
  };

  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(topupAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    const amountMinor = Math.round(amountVal * 100);
    WalletService.recordDeposit(
      walletId,
      amountMinor,
      currentUser?.id || "usr_agent_01",
      `Prepaid wire deposit approved by Finance ($${amountVal})`
    );

    setWallet(WalletService.getWalletBalance(walletId));
    setLedger(WalletService.getLedger(walletId));
    setTopupSuccess(`Top-up of $${amountVal.toFixed(2)} credited successfully to agency wallet.`);
    setTopupOpen(false);
    setTimeout(() => setTopupSuccess(""), 4000);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-center space-y-2 text-xs text-muted">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-pill animate-spin mx-auto" />
          <span>Verifying agency session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Badge variant="pill">B2B Agent Portal</Badge>
              <Badge variant="semantic-up">Active Agency</Badge>
            </div>
            <h1 className="text-3xl font-normal font-sans tracking-tight text-ink">
              {currentUser?.agencyName || "Premier Travel Bureau Uganda"}
            </h1>
            <p className="text-xs text-muted font-mono">
              Signed in as: <span className="text-ink font-semibold">{currentUser?.name}</span> ({currentUser?.email}) • IATA: 96-2 1849 2
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="primary" size="md" className="flex items-center space-x-1.5">
                <Plane className="w-4 h-4" />
                <span>Book Flight for Client</span>
              </Button>
            </Link>
            <Button
              variant="secondary-light"
              size="md"
              onClick={handleLogout}
              className="text-xs"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {topupSuccess && (
          <div className="p-4 rounded-xl bg-semantic-up/10 border border-semantic-up/20 text-semantic-up text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{topupSuccess}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Wallet Balance Card */}
          <Card variant="dark" className="space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-dark-soft uppercase font-mono tracking-wider">
                Agency Prepaid Wallet
              </span>
              <Wallet className="w-4 h-4 text-primary" />
            </div>

            <div>
              <span className="font-mono text-3xl sm:text-4xl font-bold text-on-dark block">
                {formatMoney(wallet.balanceMinor, wallet.currency)}
              </span>
              <span className="text-[11px] text-on-dark-soft">
                Atomic deduction on ticket issuance
              </span>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setTopupOpen(true)}
                className="w-full flex items-center justify-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Top-up Wallet Funds</span>
              </Button>
            </div>
          </Card>

          {/* Sales Card */}
          <Card variant="bordered" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted uppercase font-mono tracking-wider">
                Total Gross Sales
              </span>
              <TrendingUp className="w-4 h-4 text-semantic-up" />
            </div>

            <div>
              <span className="font-mono text-3xl sm:text-4xl font-bold text-ink block">
                $12,450.00
              </span>
              <span className="text-[11px] text-muted">
                18 tickets issued this month
              </span>
            </div>

            <div className="pt-2">
              <div className="h-9 px-3 bg-surface-soft rounded-pill flex items-center justify-between text-xs text-muted">
                <span>Earned Markup:</span>
                <span className="font-mono font-bold text-ink">$840.00</span>
              </div>
            </div>
          </Card>

          {/* Booking Stats Card */}
          <Card variant="bordered" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted uppercase font-mono tracking-wider">
                Active Agency Bookings
              </span>
              <Briefcase className="w-4 h-4 text-primary" />
            </div>

            <div>
              <span className="font-mono text-3xl sm:text-4xl font-bold text-ink block">
                {agencyBookings.length}
              </span>
              <span className="text-[11px] text-semantic-up font-semibold">
                100% issuance success rate
              </span>
            </div>

            <div className="pt-2">
              <div className="h-9 px-3 bg-surface-soft rounded-pill flex items-center justify-between text-xs text-muted">
                <span>Credit Facility:</span>
                <span className="text-muted font-semibold">Disabled (Prepaid Only)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Agency Ledger Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-normal font-sans tracking-tight text-ink">
              Wallet Transaction Ledger
            </h3>
            <span className="text-xs font-mono text-muted">
              Append-Only Financial Records
            </span>
          </div>

          <div className="border border-hairline rounded-xl overflow-hidden shadow-soft-drop bg-canvas">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-soft border-b border-hairline text-muted uppercase tracking-wider font-mono">
                  <tr>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Balance After</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline font-mono">
                  {ledger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-surface-soft transition-colors">
                      <td className="p-4 font-bold text-ink">{entry.id}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            entry.type === "DEPOSIT"
                              ? "semantic-up"
                              : entry.type === "BOOKING_DEBIT"
                              ? "semantic-down"
                              : "pill"
                          }
                        >
                          {entry.type}
                        </Badge>
                      </td>
                      <td className="p-4 font-sans text-body">{entry.description}</td>
                      <td
                        className={`p-4 font-bold ${
                          entry.amountMinor > 0 ? "text-semantic-up" : "text-semantic-down"
                        }`}
                      >
                        {entry.amountMinor > 0 ? "+" : ""}
                        {formatMoney(entry.amountMinor, entry.currency)}
                      </td>
                      <td className="p-4 font-bold text-ink">
                        {formatMoney(entry.balanceAfterMinor, entry.currency)}
                      </td>
                      <td className="p-4 text-muted font-sans">
                        {formatFlightDate(entry.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Agency Client Bookings */}
        <div className="space-y-4">
          <h3 className="text-xl font-normal font-sans tracking-tight text-ink">
            Agency Client Bookings
          </h3>

          <div className="divide-y divide-hairline border border-hairline rounded-xl overflow-hidden shadow-soft-drop bg-canvas">
            {agencyBookings.map((b) => (
              <div key={b.reference} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-ink">
                      #{b.reference}
                    </span>
                    <Badge variant={b.status === "TICKETED" ? "semantic-up" : "pill"}>
                      {b.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-body">
                    Client: <span className="font-bold text-ink">{b.passengers[0].firstName} {b.passengers[0].lastName}</span> • Route: {b.offerSnapshot.outboundSegments[0].originAirport} → {b.offerSnapshot.outboundSegments[0].destinationAirport}
                  </div>
                  <div className="text-[11px] text-muted font-mono">
                    PNR: {b.pnr || "PENDING"} • Airline: {b.offerSnapshot.validatingAirlineName}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-base text-ink">
                    {formatMoney(b.priceSnapshot.totalMinor, b.currency)}
                  </span>
                  <Link href={`/booking/${b.reference}`}>
                    <Button variant="secondary-light" size="sm">
                      Itinerary
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Top-up Modal */}
      {topupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
          <div className="bg-canvas rounded-xl border border-hairline shadow-2xl p-6 w-full max-w-md space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-ink">
              Top-up Prepaid Agency Wallet
            </h3>
            <p className="text-xs text-muted">
              Add funds immediately to your agency balance to issue tickets seamlessly.
            </p>

            <form action="javascript:void(0);" onSubmit={handleTopupSubmit} className="space-y-4">
              <TextInput
                label="Amount in USD ($)"
                type="number"
                min="100"
                step="50"
                required
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
              />

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="secondary-light"
                  size="sm"
                  onClick={() => setTopupOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Approve & Credit Balance
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
