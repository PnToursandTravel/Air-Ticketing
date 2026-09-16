"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, AlertCircle, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { parseResponseJson, sanitizeErrorMessage } from "@/lib/utils";

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

      const { data, error: parseError } = await parseResponseJson(res);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || parseError || "Authentication failed or insufficient privilege");
      }

      router.push("/admin");
    } catch (err: any) {
      setError(sanitizeErrorMessage(err, "Failed to authenticate administrator"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-canvas p-4 text-ink">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2.5 mx-auto">
            <div className="w-12 h-12 rounded-pill bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-ink">
            Internal Operations Console
          </h1>
          <p className="text-xs text-muted">
            Authorized administrative & compliance personnel only.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface-card rounded-xl p-8 border border-hairline shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <span className="text-xs font-mono uppercase text-muted tracking-wider">
              Security Level: Tier 1
            </span>
            <Badge variant="pill">
              RBAC Enforced
            </Badge>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-semantic-down/10 border border-semantic-down/20 text-semantic-down text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pntoursandtravel.com"
                className="w-full h-12 px-4 bg-surface-soft text-ink text-sm rounded-md border border-hairline outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-12 px-4 bg-surface-soft text-ink text-sm rounded-md border border-hairline outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted"
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

          <div className="pt-2 border-t border-hairline flex items-center justify-between text-xs text-muted">
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
