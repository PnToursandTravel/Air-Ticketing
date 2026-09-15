"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, AlertCircle, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, roleCategory: "ADMIN" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed or insufficient privilege");
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate administrator");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-surface-dark p-4 text-on-dark">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-pill bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-on-dark">
            Internal Operations Console
          </h1>
          <p className="text-xs text-on-dark-soft">
            Authorized administrative & compliance personnel only.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface-dark-elevated rounded-xl p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono uppercase text-on-dark-soft tracking-wider">
              Security Level: Tier 1
            </span>
            <Badge variant="pill-dark" className="border-white/20">
              RBAC Enforced
            </Badge>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-semantic-down/20 border border-semantic-down/40 text-semantic-down text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-dark-soft mb-1.5">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pntoursandtravel.com"
                className="w-full h-12 px-4 bg-surface-dark text-on-dark text-sm rounded-md border border-white/15 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-dark-soft mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-12 px-4 bg-surface-dark text-on-dark text-sm rounded-md border border-white/15 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full h-12 text-sm font-semibold"
            >
              {loading ? "Verifying Credentials..." : "Authenticate & Access Console"}
            </Button>
          </form>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-on-dark-soft">
            <span className="flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-primary" />
              <span>Audit Logged Session</span>
            </span>
            <Link href="/" className="text-primary hover:underline font-semibold">
              Public Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
