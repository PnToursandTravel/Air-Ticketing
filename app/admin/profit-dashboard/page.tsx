"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Download,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  FileSpreadsheet,
  CheckCircle2,
  PieChart,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AdminNavBar } from "@/components/admin/AdminNavBar";
import { formatMoney, formatFlightDate } from "@/lib/utils";
import Link from "next/link";

export default function ProfitDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profit Metrics Data
  const [summary, setSummary] = useState<any>({
    totalTicketsProcessed: 0,
    totalSupplierCostMinor: 0,
    totalCustomerSalesMinor: 0,
    totalExpectedProfitMinor: 0,
    averageProfitPerTicketMinor: 0,
    averageMarkupPercentage: 10,
  });
  const [tickets, setTickets] = useState<any[]>([]);

  // Filters
  const [dateRange, setDateRange] = useState<string>("ALL");
  const [selectedAirline, setSelectedAirline] = useState<string>("ALL");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const authRes = await fetch("/api/v1/auth/me");
        const authData = await authRes.json();
        if (!authRes.ok || !authData.success || !authData.user || !["ADMIN", "SUPER_ADMIN", "OPERATIONS"].includes(authData.user.role)) {
          router.push("/admin/login");
          return;
        }
        setCurrentUser(authData.user);

        const params = new URLSearchParams();
        params.set("pageSize", "100");
        if (selectedAirline !== "ALL") params.set("airline", selectedAirline);
        if (selectedCurrency !== "ALL") params.set("currency", selectedCurrency);
        if (selectedStatus !== "ALL") params.set("status", selectedStatus);

        const res = await fetch(`/api/v1/admin/markup/tickets?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setSummary(data.data.summary);
          setTickets(data.data.tickets);
        }
      } catch (err) {
        console.error("Failed to load profit data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router, dateRange, selectedAirline, selectedCurrency, selectedStatus]);

  // Export CSV Report
  const handleExportCSV = () => {
    if (tickets.length === 0) return;

    const headers = [
      "Ticket Reference",
      "Supplier Name",
      "Airline",
      "Origin",
      "Destination",
      "Travel Date",
      "Passenger Type",
      "Currency",
      "Supplier Price",
      "Our Markup %",
      "Our Profit",
      "Customer Price",
      "Pricing Status",
      "Calculation Time",
    ];

    const rows = tickets.map((t) => [
      `"${t.supplierReference}"`,
      `"${t.supplierName}"`,
      `"${t.airline}"`,
      `"${t.origin}"`,
      `"${t.destination}"`,
      `"${new Date(t.travelDate).toISOString().split("T")[0]}"`,
      `"${t.passengerType}"`,
      `"${t.currency}"`,
      (t.supplierPriceMinor / 100).toFixed(2),
      t.markupPercentage,
      (t.profitMinor / 100).toFixed(2),
      (t.customerPriceMinor / 100).toFixed(2),
      `"${t.pricingStatus}"`,
      `"${new Date(t.updatedAt).toISOString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `profit_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 py-10 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-hairline pb-6">
          <div className="flex items-center space-x-2 text-xs text-muted print:hidden">
            <Link href="/admin" className="hover:text-primary transition-colors">
              Admin Console
            </Link>
            <span>/</span>
            <span className="text-ink font-semibold">Profit Dashboard</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-sans tracking-tight text-ink">
                Profit Dashboard
              </h1>
              <p className="text-xs text-muted">
                Executive financial overview of ticket processing volume, supplier wholesale costs, gross customer sales, and net realized profits.
              </p>
            </div>

            {/* Print & Export Actions */}
            <div className="flex items-center space-x-3 print:hidden">
              <Button
                variant="secondary-light"
                size="sm"
                onClick={handlePrint}
                className="flex items-center space-x-1.5 text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 text-xs font-bold shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Shared Admin Navigation Tab Bar */}
        <div className="print:hidden">
          <AdminNavBar />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-hairline bg-surface-soft/40 print:hidden">
          <div className="flex items-center space-x-2 text-xs font-bold text-ink">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Filters:</span>
          </div>

          <select
            aria-label="Filter by Airline"
            value={selectedAirline}
            onChange={(e) => setSelectedAirline(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-hairline bg-canvas text-ink"
          >
            <option value="ALL">All Airlines</option>
            <option value="Emirates">Emirates</option>
            <option value="Uganda Airlines">Uganda Airlines</option>
            <option value="Kenya Airways">Kenya Airways</option>
            <option value="Qatar Airways">Qatar Airways</option>
            <option value="Ethiopian Airlines">Ethiopian Airlines</option>
          </select>

          <select
            aria-label="Filter by Currency"
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-hairline bg-canvas text-ink"
          >
            <option value="ALL">All Currencies</option>
            <option value="USD">USD</option>
            <option value="UGX">UGX</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="KES">KES</option>
          </select>

          <select
            aria-label="Filter by Pricing Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-hairline bg-canvas text-ink"
          >
            <option value="ALL">All Statuses</option>
            <option value="Calculated">Calculated</option>
            <option value="Updated">Updated</option>
            <option value="Booked">Booked</option>
            <option value="Paid">Paid</option>
            <option value="Ticketed">Ticketed</option>
          </select>
        </div>

        {/* 5 KEY PROFIT METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Total Tickets Processed */}
          <Card variant="bordered" className="p-6 space-y-2 shadow-sm">
            <span className="text-xs text-muted font-mono uppercase">Total Tickets Processed</span>
            <span className="font-mono text-3xl font-bold text-ink block">
              {summary.totalTicketsProcessed}
            </span>
            <span className="text-[11px] text-muted font-sans">
              All supplier flight quotes
            </span>
          </Card>

          {/* Total Supplier Cost */}
          <Card variant="bordered" className="p-6 space-y-2 shadow-sm">
            <span className="text-xs text-muted font-mono uppercase">Total Supplier Cost</span>
            <span className="font-mono text-3xl font-bold text-ink block">
              {formatMoney(summary.totalSupplierCostMinor, "USD")}
            </span>
            <span className="text-[11px] text-muted font-sans">
              Net carrier cost payable
            </span>
          </Card>

          {/* Total Customer Sales */}
          <Card variant="bordered" className="p-6 space-y-2 shadow-sm">
            <span className="text-xs text-muted font-mono uppercase">Total Customer Sales</span>
            <span className="font-mono text-3xl font-bold text-primary block">
              {formatMoney(summary.totalCustomerSalesMinor, "USD")}
            </span>
            <span className="text-[11px] text-muted font-sans">
              Gross retail price
            </span>
          </Card>

          {/* Total Expected Profit */}
          <Card variant="bordered" className="p-6 space-y-2 shadow-sm bg-emerald-50/60 border-emerald-300">
            <span className="text-xs text-emerald-800 font-mono uppercase font-bold">Total Expected Profit</span>
            <span className="font-mono text-3xl font-bold text-emerald-700 block">
              +{formatMoney(summary.totalExpectedProfitMinor, "USD")}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold font-sans">
              Net profit margin earned
            </span>
          </Card>

          {/* Average Profit Per Ticket */}
          <Card variant="bordered" className="p-6 space-y-2 shadow-sm">
            <span className="text-xs text-muted font-mono uppercase">Average Profit / Ticket</span>
            <span className="font-mono text-3xl font-bold text-ink block">
              {formatMoney(summary.averageProfitPerTicketMinor, "USD")}
            </span>
            <span className="text-[11px] text-muted font-sans">
              Per issued ticket
            </span>
          </Card>
        </div>

        {/* Detailed Profit Analysis Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-ink">Ticket-Level Profit Ledger</h3>
            <span className="text-xs text-muted font-mono">
              Showing {tickets.length} recent calculations
            </span>
          </div>

          <div className="border border-hairline rounded-xl overflow-hidden shadow-soft-drop bg-canvas">
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full min-w-[950px] text-left text-xs">
                <thead className="bg-surface-soft border-b border-hairline text-muted uppercase font-mono">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Airline</th>
                    <th className="p-4">Route</th>
                    <th className="p-4">Travel Date</th>
                    <th className="p-4 text-right bg-surface-strong/20">Supplier Price</th>
                    <th className="p-4 text-right bg-primary/5 text-primary">Our Markup</th>
                    <th className="p-4 text-right bg-emerald-50 text-emerald-800">Our Profit</th>
                    <th className="p-4 text-right bg-primary/10 text-ink font-bold">Customer Price</th>
                    <th className="p-4 text-center">Currency</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline font-mono">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-muted font-sans">
                        Loading profit ledger...
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-muted font-sans">
                        No transactions recorded for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-surface-soft/60 transition-colors">
                        <td className="p-4 font-bold text-ink">{t.supplierReference}</td>
                        <td className="p-4 font-sans">{t.airline}</td>
                        <td className="p-4 font-bold">{t.origin} → {t.destination}</td>
                        <td className="p-4 font-sans text-muted">{formatFlightDate(t.travelDate)}</td>
                        <td className="p-4 text-right bg-surface-strong/20 text-ink">
                          {formatMoney(t.supplierPriceMinor, t.currency)}
                        </td>
                        <td className="p-4 text-right bg-primary/5 text-primary font-bold">
                          {t.markupPercentage}%
                        </td>
                        <td className="p-4 text-right bg-emerald-50 text-emerald-600 font-bold">
                          +{formatMoney(t.profitMinor, t.currency)}
                        </td>
                        <td className="p-4 text-right bg-primary/10 text-ink font-bold text-sm">
                          {formatMoney(t.customerPriceMinor, t.currency)}
                        </td>
                        <td className="p-4 text-center text-muted font-bold">{t.currency}</td>
                        <td className="p-4">
                          <Badge variant={t.pricingStatus === "Error" ? "pill" : "semantic-up"}>
                            {t.pricingStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
