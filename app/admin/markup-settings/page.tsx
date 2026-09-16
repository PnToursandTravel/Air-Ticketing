"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  Power,
  Save,
  HelpCircle,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TextInput } from "@/components/ui/TextInput";
import { AdminNavBar } from "@/components/admin/AdminNavBar";
import { parseResponseJson, sanitizeErrorMessage } from "@/lib/utils";
import Link from "next/link";

export default function MarkupSettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Settings state
  const [defaultMarkupPercent, setDefaultMarkupPercent] = useState<number>(10);
  const [isAutomaticEnabled, setIsAutomaticEnabled] = useState<boolean>(true);
  const [sampleCalc, setSampleCalc] = useState<any>(null);

  // Live Playground calculation state
  const [testSupplierPrice, setTestSupplierPrice] = useState<number>(500);

  useEffect(() => {
    async function loadData() {
      try {
        const authRes = await fetch("/api/v1/auth/me");
        const { data: authData } = await parseResponseJson(authRes);
        if (!authRes.ok || !authData?.success || !authData.user || !["ADMIN", "SUPER_ADMIN", "OPERATIONS"].includes(authData.user.role)) {
          router.push("/admin/login");
          return;
        }
        setCurrentUser(authData.user);

        const res = await fetch("/api/v1/admin/markup/settings");
        const { data } = await parseResponseJson(res);
        if (data?.success && data.data) {
          setDefaultMarkupPercent(data.data.defaultMarkupPercent);
          setIsAutomaticEnabled(data.data.isAutomaticEnabled);
          setSampleCalc(data.data.sampleCalculation);
        }
      } catch (err) {
        console.error("Failed to load markup settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleSaveMarkup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/v1/admin/markup/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultMarkupPercent,
          isAutomaticEnabled,
        }),
      });

      const { data, error: parseError } = await parseResponseJson(res);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || parseError || "Failed to save markup settings");
      }

      setFeedback({
        type: "success",
        message: data.message || "Markup settings saved successfully.",
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: sanitizeErrorMessage(err, "An error occurred while saving."),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAutoMarkup = async () => {
    const nextState = !isAutomaticEnabled;
    setIsAutomaticEnabled(nextState);
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/v1/admin/markup/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultMarkupPercent,
          isAutomaticEnabled: nextState,
        }),
      });

      const { data, error: parseError } = await parseResponseJson(res);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || parseError || "Failed to update automatic markup status");
      }

      setFeedback({
        type: "success",
        message: `Automatic Markup turned ${nextState ? "ON" : "OFF"} successfully.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setIsAutomaticEnabled(!nextState); // Revert
      setFeedback({
        type: "error",
        message: sanitizeErrorMessage(err, "An error occurred while toggling markup."),
      });
    } finally {
      setSaving(false);
    }
  };

  // Interactive calculation
  const calculatedProfit = isAutomaticEnabled
    ? (testSupplierPrice * (defaultMarkupPercent / 100))
    : 0;
  const calculatedCustomerPrice = testSupplierPrice + calculatedProfit;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-center space-y-2 text-xs text-muted">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <span>Loading Markup Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Breadcrumb & Header */}
        <div className="space-y-2 border-b border-hairline pb-6">
          <div className="flex items-center space-x-2 text-xs text-muted">
            <Link href="/admin" className="hover:text-primary transition-colors">
              Admin Console
            </Link>
            <span>/</span>
            <span className="text-ink font-semibold">Markup Settings</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-sans tracking-tight text-ink">
                Markup Settings
              </h1>
              <p className="text-xs text-muted">
                Configure your global profit markup percentage automatically applied to all IATA and flight supplier ticket prices.
              </p>
            </div>

            {/* Quick Status Cards */}
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 rounded-xl border border-hairline bg-surface-soft text-left shadow-sm">
                <span className="text-[10px] uppercase font-mono text-muted block">Automatic Status</span>
                <span
                  className={`text-sm font-mono font-bold flex items-center space-x-1.5 ${
                    isAutomaticEnabled ? "text-emerald-600" : "text-muted"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAutomaticEnabled ? "bg-emerald-500 animate-pulse" : "bg-muted"
                    }`}
                  />
                  <span>Automatic Markup: {isAutomaticEnabled ? "ON" : "OFF"}</span>
                </span>
              </div>

              <div className="px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 text-left shadow-sm">
                <span className="text-[10px] uppercase font-mono text-muted block">Current Rate</span>
                <span className="text-sm font-mono font-bold text-primary">
                  {defaultMarkupPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Shared Admin Navigation Tab Bar */}
        <AdminNavBar
          activeMarkupPercent={defaultMarkupPercent}
          isAutomaticEnabled={isAutomaticEnabled}
        />

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center space-x-3 text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Configuration */}
          <div className="lg:col-span-7 space-y-6">
            <Card variant="bordered" className="p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink">Markup Configuration</h2>
                    <p className="text-xs text-muted">Primary calculation parameters for customer ticket pricing</p>
                  </div>
                </div>

                <Badge variant={isAutomaticEnabled ? "semantic-up" : "pill"}>
                  {isAutomaticEnabled ? "ACTIVE (AUTO)" : "PAUSED (OFF)"}
                </Badge>
              </div>

              <form onSubmit={handleSaveMarkup} className="space-y-6">
                {/* Markup Percentage Input */}
                <div className="space-y-2">
                  <label htmlFor="markup-input" className="block text-sm font-bold text-ink">
                    Our Default Markup: %
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      id="markup-input"
                      type="number"
                      step="0.5"
                      min="0"
                      max="200"
                      value={defaultMarkupPercent}
                      onChange={(e) => setDefaultMarkupPercent(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-lg border border-hairline bg-surface-soft text-ink font-mono text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary pr-12 transition-all"
                      placeholder="10"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xl text-muted font-bold">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    Recommended rate: 8% to 15%. This rate applies automatically to every incoming supplier quote.
                  </p>
                </div>

                {/* Clear Explanation Box */}
                <div className="p-4 rounded-xl bg-surface-soft border border-hairline space-y-2 text-xs text-body leading-relaxed">
                  <div className="flex items-center space-x-2 text-ink font-bold">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    <span>How this works:</span>
                  </div>
                  <p>
                    This percentage will automatically be added to every supplier ticket price.
                  </p>
                  <p className="font-mono bg-canvas p-2.5 rounded border border-hairline text-ink">
                    A supplier ticket of <strong>USD 500</strong> with a <strong>{defaultMarkupPercent}%</strong> markup will be shown to the customer as <strong>USD {(500 * (1 + (isAutomaticEnabled ? defaultMarkupPercent / 100 : 0))).toFixed(2)}</strong>.
                    <br />
                    Our profit will be <strong>USD {(500 * (isAutomaticEnabled ? defaultMarkupPercent / 100 : 0)).toFixed(2)}</strong>.
                  </p>
                  {!isAutomaticEnabled && (
                    <p className="text-rose-600 font-semibold pt-1">
                      ⚠️ Automatic markup is currently OFF. Supplier prices will be shown to customers without adding any markup, unless authorized staff manually enter a custom price.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-hairline">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={saving}
                    className="flex items-center space-x-2 font-bold px-6 shadow-sm min-h-[44px]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? "Saving..." : "Save Markup"}</span>
                  </Button>

                  <Button
                    type="button"
                    variant={isAutomaticEnabled ? "secondary-light" : "pill-cta"}
                    size="md"
                    onClick={handleToggleAutoMarkup}
                    disabled={saving}
                    className={`flex items-center space-x-2 font-semibold min-h-[44px] ${
                      !isAutomaticEnabled ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>
                      {isAutomaticEnabled
                        ? "Turn Automatic Markup Off"
                        : "Turn Automatic Markup On"}
                    </span>
                  </Button>
                </div>
              </form>
            </Card>

            {/* Safety Notice */}
            <div className="p-4 rounded-xl border border-hairline bg-canvas flex items-start space-x-3 text-xs text-muted">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-ink block">Automatic Price Protection Active</span>
                <p>
                  Changing the default markup percentage applies immediately to new and unsold flight options.
                  Already confirmed, paid, or ticketed bookings are permanently locked and cannot be altered.
                </p>
              </div>
            </div>
          </div>

          {/* Live Interactive Pricing Demonstration Card */}
          <div className="lg:col-span-5 space-y-6">
            <Card variant="bordered" className="p-6 sm:p-8 space-y-6 shadow-sm bg-surface-soft/40">
              <div className="border-b border-hairline pb-4">
                <div className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" />
                  <span>Real-Time Calculation Test</span>
                </div>
                <h3 className="text-base font-bold text-ink mt-1">Live Profit Preview</h3>
                <p className="text-xs text-muted">Test how any supplier quote is calculated using your active settings.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="sample-supplier-price" className="block text-xs font-semibold text-ink mb-1">
                    Sample Supplier Ticket Price (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted text-sm">$</span>
                    <input
                      id="sample-supplier-price"
                      type="number"
                      value={testSupplierPrice}
                      onChange={(e) => setTestSupplierPrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 rounded-md border border-hairline bg-canvas text-ink font-mono text-base font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-hairline text-xs font-mono">
                  <div className="flex items-center justify-between p-2.5 rounded bg-canvas border border-hairline">
                    <span className="text-muted font-sans">Supplier Price:</span>
                    <span className="font-bold text-ink">${testSupplierPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded bg-canvas border border-hairline">
                    <span className="text-muted font-sans">Our Markup:</span>
                    <span className="font-bold text-primary">
                      {isAutomaticEnabled ? `${defaultMarkupPercent}%` : "0% (OFF)"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <span className="font-bold font-sans">Our Profit:</span>
                    <span className="font-bold text-sm text-emerald-700">
                      +${calculatedProfit.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30 text-ink">
                    <span className="font-bold font-sans text-sm">Customer Price:</span>
                    <span className="font-bold text-lg text-primary font-mono">
                      ${calculatedCustomerPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-muted space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Customer sees only <strong>${calculatedCustomerPrice.toFixed(2)}</strong>.</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Supplier cost and profit are confidential and stored backend-only.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-hairline">
                <Link href="/admin/supplier-tickets" className="w-full block">
                  <Button variant="secondary-light" size="sm" className="w-full flex items-center justify-center space-x-2 text-xs font-semibold">
                    <span>View Supplier Ticket Results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
