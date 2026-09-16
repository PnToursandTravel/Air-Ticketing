"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  KeyRound,
  Lock,
  Edit,
  Save,
  X,
  Database,
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
import { AdminNavBar } from "@/components/admin/AdminNavBar";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [bookings, setBookings] = useState<BookingRecord[]>(() => BookingService.getAll());
  const [rules, setRules] = useState<PricingRule[]>(DEFAULT_PRICING_RULES);
  const [retryingRef, setRetryingRef] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  // Database API & Security Settings state
  const [configs, setConfigs] = useState<any[]>([]);
  const [editingConfig, setEditingConfig] = useState<any | null>(null);
  const [newConfigValue, setNewConfigValue] = useState("");
  const [updatingConfig, setUpdatingConfig] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editingConfig) {
        setEditingConfig(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingConfig]);

  useEffect(() => {
    async function checkAuthAndLoadData() {
      try {
        const res = await fetch("/api/v1/auth/me");
        const data = await res.json();
        if (!res.ok || !data.success || !data.user || !["ADMIN", "SUPER_ADMIN", "OPERATIONS"].includes(data.user.role)) {
          router.push("/admin/login");
          return;
        }
        setCurrentUser(data.user);

        // Load database settings
        const settingsRes = await fetch("/api/v1/admin/settings");
        const settingsData = await settingsRes.json();
        if (settingsData.success) {
          setConfigs(settingsData.data);
        }
      } catch {
        router.push("/admin/login");
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuthAndLoadData();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

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

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig) return;
    setUpdatingConfig(true);

    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configKey: editingConfig.configKey,
          newValue: newConfigValue,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update configuration");
      }

      // Refresh configs
      const settingsRes = await fetch("/api/v1/admin/settings");
      const settingsData = await settingsRes.json();
      if (settingsData.success) {
        setConfigs(settingsData.data);
      }

      setFeedback(`Updated ${editingConfig.configKey} in database successfully.`);
      setTimeout(() => setFeedback(""), 4000);
      setEditingConfig(null);
    } catch (err: any) {
      setFeedback(err?.message || "Error updating setting");
    } finally {
      setUpdatingConfig(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-center space-y-2 text-xs text-muted">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-pill animate-spin mx-auto" />
          <span>Authenticating operations console...</span>
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
              <Badge variant="pill">Operations & Control</Badge>
              <Badge variant="semantic-up">System Healthy</Badge>
              <Badge variant="pill" className="bg-primary/10 text-primary font-mono text-[10px]">
                Database: Supabase PostgreSQL Active
              </Badge>
            </div>
            <h1 className="text-3xl font-normal font-sans tracking-tight text-ink">
              Admin Operations Console
            </h1>
            <p className="text-xs text-muted font-mono">
              Signed in: <span className="text-ink font-semibold">{currentUser?.name}</span> ({currentUser?.email}) • Role: {currentUser?.role}
            </p>
          </div>

          <div className="flex items-center space-x-3">
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

        {/* Shared Admin Navigation Tab Bar */}
        <AdminNavBar />

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

        {/* DATABASE API & SECURITY CREDENTIALS MODULE */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-normal font-sans tracking-tight text-ink">
                  Database API & Security Settings
                </h3>
              </div>
              <p className="text-xs text-muted">
                All supplier endpoints, IATA credentials, and payment gateway secrets stored securely in the database.
              </p>
            </div>
            <Badge variant="pill">
              {configs.length} Database Parameters Active
            </Badge>
          </div>

          <div className="border border-hairline rounded-xl overflow-hidden shadow-soft-drop bg-canvas">
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full min-w-[680px] text-left text-xs">
                <thead className="bg-surface-soft border-b border-hairline text-muted uppercase tracking-wider font-mono">
                  <tr>
                    <th className="p-4">Category</th>
                    <th className="p-4">Parameter Key</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Value (Masked)</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline font-mono">
                  {configs.map((cfg) => (
                    <tr key={cfg.id} className="hover:bg-surface-soft transition-colors">
                      <td className="p-4">
                        <Badge
                          variant={
                            cfg.category === "SUPPLIER"
                              ? "primary"
                              : cfg.category === "IATA"
                              ? "semantic-up"
                              : cfg.category === "PAYMENT"
                              ? "pill"
                              : "pill"
                          }
                        >
                          {cfg.category}
                        </Badge>
                      </td>
                      <td className="p-4 font-bold text-ink">{cfg.configKey}</td>
                      <td className="p-4 font-sans text-muted text-xs">{cfg.description}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded font-mono text-[11px] ${
                          cfg.isSecret ? "bg-surface-strong text-muted" : "bg-primary/5 text-primary font-bold"
                        }`}>
                          {cfg.displayValue}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="secondary-light"
                          size="sm"
                          onClick={() => {
                            setEditingConfig(cfg);
                            setNewConfigValue(cfg.configValue);
                          }}
                          className="flex items-center space-x-1 ml-auto"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full min-w-[700px] text-left text-xs">
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
        </div>

        {/* Booking Queue & Ticketing Operations */}
        <div className="space-y-4">
          <h3 className="text-xl font-normal font-sans tracking-tight text-ink">
            Booking & Ticketing Lifecycle Queue
          </h3>

          <div className="border border-hairline rounded-xl overflow-hidden shadow-soft-drop bg-canvas">
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full min-w-[760px] text-left text-xs">
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
        </div>
      </main>

      {/* Edit Config Modal */}
      {editingConfig && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-config-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <div className="bg-canvas rounded-xl border border-hairline shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto touch-scroll space-y-4 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-primary flex-shrink-0" />
                <h3 id="admin-config-title" className="font-bold text-base text-ink">
                  Update Database Configuration
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingConfig(null)}
                aria-label="Close dialog"
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-pill bg-surface-soft hover:bg-hairline flex items-center justify-center text-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="text-xs space-y-1">
                <span className="font-mono font-bold text-primary block">
                  {editingConfig.configKey}
                </span>
                <span className="text-muted block">
                  {editingConfig.description}
                </span>
              </div>

              <TextInput
                label="New Configuration Value"
                required
                value={newConfigValue}
                onChange={(e) => setNewConfigValue(e.target.value)}
                placeholder="Enter value..."
              />

              <div className="p-3 bg-surface-soft rounded-md border border-hairline text-xs text-muted flex items-center space-x-2">
                <Lock className="w-4 h-4 text-primary flex-shrink-0" />
                <span>This mutation will be recorded in the immutable database audit trail.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="secondary-light"
                  size="sm"
                  onClick={() => setEditingConfig(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={updatingConfig}
                  className="flex items-center space-x-1.5 min-h-[38px]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{updatingConfig ? "Saving to Database..." : "Save Configuration"}</span>
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
