"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Sliders,
  TableProperties,
  TrendingUp,
  ShieldCheck,
  Plane,
} from "lucide-react";

interface AdminNavBarProps {
  activeMarkupPercent?: number;
  isAutomaticEnabled?: boolean;
}

export const AdminNavBar: React.FC<AdminNavBarProps> = ({
  activeMarkupPercent,
  isAutomaticEnabled = true,
}) => {
  const pathname = usePathname();

  const links = [
    {
      href: "/admin",
      label: "Operations Console",
      icon: Activity,
      exact: true,
    },
    {
      href: "/admin/markup-settings",
      label: "Markup Settings",
      icon: Sliders,
      badge:
        activeMarkupPercent !== undefined
          ? `${activeMarkupPercent}%`
          : undefined,
    },
    {
      href: "/admin/supplier-tickets",
      label: "Supplier Ticket Results",
      icon: TableProperties,
    },
    {
      href: "/admin/profit-dashboard",
      label: "Profit Dashboard",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="border-b border-hairline bg-surface-soft/60 backdrop-blur-sm -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto touch-scroll py-1">
          {links.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-ink hover:bg-surface-soft hover:text-primary"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive
                        ? "bg-black/20 text-on-primary"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Global Markup Status Indicator */}
        <div className="flex items-center space-x-3 text-xs flex-shrink-0">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-hairline bg-canvas text-ink shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isAutomaticEnabled ? "bg-emerald-500 animate-pulse" : "bg-muted"
              }`}
            />
            <span className="text-[11px] text-muted">Automatic Markup:</span>
            <span
              className={`font-mono font-bold text-xs ${
                isAutomaticEnabled ? "text-emerald-600" : "text-muted"
              }`}
            >
              {isAutomaticEnabled ? "ON" : "OFF"}
            </span>
          </div>

          {activeMarkupPercent !== undefined && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-ink shadow-sm font-mono text-xs">
              <span className="text-[11px] text-muted">Rate:</span>
              <span className="font-bold text-primary">{activeMarkupPercent}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
