"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AgentLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Login form state
  const [email, setEmail] = useState("agent@pntoursandtravel.com");
  const [password, setPassword] = useState("Agent@PN2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Registration form state
  const [regAgencyName, setRegAgencyName] = useState("");
  const [regIata, setRegIata] = useState("");
  const [regLicense, setRegLicense] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, roleCategory: "AGENT" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid agency login credentials");
      }

      router.push("/agent");
    } catch (err: any) {
      setError(err?.message || "Failed to log in to agency portal");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess(
      `Agency registration for "${regAgencyName}" has been received. Our compliance team will review your IATA/trade license credentials and activate your prepaid wallet.`
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-surface-soft p-4">
      {/* Background brand anchor */}
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-pill bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-ink tracking-tight font-sans">
              PN Tours & Travel
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-ink tracking-tight font-sans">
            Agency B2B Travel Portal
          </h1>
          <p className="text-xs text-muted">
            Accredited travel agent access, prepaid wallet issuance, and B2B flight reservations.
          </p>
        </div>

        {/* Card Box */}
        <Card variant="light" className="p-8 space-y-6">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-surface-strong rounded-pill text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTab("LOGIN")}
              className={`py-2 rounded-pill transition-all ${
                tab === "LOGIN" ? "bg-canvas text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              Agency Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab("REGISTER")}
              className={`py-2 rounded-pill transition-all ${
                tab === "REGISTER" ? "bg-canvas text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              New Agency Application
            </button>
          </div>

          {tab === "LOGIN" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-semantic-down/10 border border-semantic-down/20 text-semantic-down text-xs font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <TextInput
                label="Agency Registered Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@agency.com"
              />

              <TextInput
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />

              {/* Demo Account Callout */}
              <div className="p-3 rounded-md bg-primary/5 border border-primary/10 text-xs space-y-1">
                <span className="font-bold text-ink block">Demo Agency Credentials:</span>
                <div className="font-mono text-[11px] text-muted space-y-0.5">
                  <div>Email: <span className="text-ink font-semibold">agent@pntoursandtravel.com</span></div>
                  <div>Password: <span className="text-ink font-semibold">Agent@PN2026!</span></div>
                </div>
              </div>

              <Button
                type="submit"
                variant="pill-cta"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Verifying Agency..." : "Log In to Agent Portal"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {regSuccess ? (
                <div className="p-4 rounded-md bg-semantic-up/10 border border-semantic-up/20 text-semantic-up text-xs space-y-2">
                  <div className="flex items-center space-x-2 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Application Submitted</span>
                  </div>
                  <p>{regSuccess}</p>
                  <Button
                    type="button"
                    variant="secondary-light"
                    size="sm"
                    onClick={() => {
                      setRegSuccess("");
                      setTab("LOGIN");
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <>
                  <TextInput
                    label="Agency Trade / Legal Name"
                    required
                    value={regAgencyName}
                    onChange={(e) => setRegAgencyName(e.target.value)}
                    placeholder="e.g. Skyline Travel Bureau Ltd"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextInput
                      label="IATA / TIDS Number"
                      value={regIata}
                      onChange={(e) => setRegIata(e.target.value)}
                      placeholder="e.g. 96-2 1849 2"
                    />
                    <TextInput
                      label="Operating License"
                      required
                      value={regLicense}
                      onChange={(e) => setRegLicense(e.target.value)}
                      placeholder="e.g. UG-TR-2024"
                    />
                  </div>
                  <TextInput
                    label="Official Email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="bookings@agency.com"
                  />
                  <TextInput
                    label="Business Telephone"
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+256 785360444"
                  />
                  <Button type="submit" variant="pill-cta" className="w-full min-h-[44px]">
                    Submit Agency Application
                  </Button>
                </>
              )}
            </form>
          )}

          {/* Secure indicator */}
          <div className="pt-2 border-t border-hairline flex items-center justify-between text-xs text-muted">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-semantic-up" />
              <span>TLS 1.3 Encrypted Session</span>
            </span>
            <Link href="/" className="text-primary hover:underline font-semibold">
              Return to Public Site
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
