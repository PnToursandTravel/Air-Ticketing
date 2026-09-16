"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TableProperties,
  Upload,
  FileSpreadsheet,
  RotateCw,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle2,
  Eye,
  X,
  ArrowUpDown,
  Plus,
  Trash2,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AdminNavBar } from "@/components/admin/AdminNavBar";
import { formatFlightDate, formatMoney, parseResponseJson, sanitizeErrorMessage } from "@/lib/utils";
import Link from "next/link";

interface SupplierTicketRecord {
  id: string;
  supplierReference: string;
  supplierName: string;
  airline: string;
  airlineCode?: string | null;
  origin: string;
  destination: string;
  travelDate: string;
  passengerType: string;
  cabinClass: string;
  currency: string;
  supplierPriceMinor: number;
  markupPercentage: number;
  profitMinor: number;
  customerPriceMinor: number;
  pricingStatus: string;
  markupRuleUsed: string;
  errorMessage?: string | null;
  isSold: boolean;
  bookingReference?: string | null;
  importedVia: string;
  createdAt: string;
  updatedAt: string;
}

export default function SupplierTicketResultsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupplierTicketRecord[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });

  // Markup settings info
  const [markupSettings, setMarkupSettings] = useState<{ defaultMarkupPercent: number; isAutomaticEnabled: boolean }>({
    defaultMarkupPercent: 10,
    isAutomaticEnabled: true,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [selectedAirline, setSelectedAirline] = useState("ALL");
  const [selectedCurrency, setSelectedCurrency] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  // Modals
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showSpreadsheetModal, setShowSpreadsheetModal] = useState(false);
  const [showRecalculateAllModal, setShowRecalculateAllModal] = useState(false);
  const [activeTicketDetail, setActiveTicketDetail] = useState<SupplierTicketRecord | null>(null);

  // CSV Import State
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [csvPreview, setCSVPreview] = useState<any | null>(null);
  const [csvUploading, setCSVUploading] = useState(false);

  // Spreadsheet Manual Entry State
  const [manualRows, setManualRows] = useState<any[]>([
    {
      supplierReference: "SUP-MAN-01",
      airline: "Emirates",
      route: "EBB-DXB",
      travelDate: new Date().toISOString().split("T")[0],
      currency: "USD",
      supplierPrice: "500",
    },
    {
      supplierReference: "SUP-MAN-02",
      airline: "Uganda Airlines",
      route: "EBB-NBO",
      travelDate: new Date().toISOString().split("T")[0],
      currency: "USD",
      supplierPrice: "300",
    },
    {
      supplierReference: "SUP-MAN-03",
      airline: "Qatar Airways",
      route: "EBB-DOH",
      travelDate: new Date().toISOString().split("T")[0],
      currency: "USD",
      supplierPrice: "650",
    },
  ]);
  const [manualSaving, setManualSaving] = useState(false);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Fetch tickets and settings
  const loadTickets = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (search) params.set("search", search);
      if (selectedAirline !== "ALL") params.set("airline", selectedAirline);
      if (selectedCurrency !== "ALL") params.set("currency", selectedCurrency);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);

      const res = await fetch(`/api/v1/admin/markup/tickets?${params.toString()}`);
      const { data } = await parseResponseJson(res);
      if (data?.success && data.data) {
        setTickets(data.data.tickets);
        setSummary(data.data.summary);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      console.error("Error loading tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const authRes = await fetch("/api/v1/auth/me");
        const { data: authData } = await parseResponseJson(authRes);
        if (!authRes.ok || !authData?.success || !authData.user || !["ADMIN", "SUPER_ADMIN", "OPERATIONS"].includes(authData.user.role)) {
          router.push("/admin/login");
          return;
        }
        setCurrentUser(authData.user);

        // Load markup settings
        const setRes = await fetch("/api/v1/admin/markup/settings");
        const { data: setData } = await parseResponseJson(setRes);
        if (setData?.success && setData.data) {
          setMarkupSettings({
            defaultMarkupPercent: setData.data.defaultMarkupPercent,
            isAutomaticEnabled: setData.data.isAutomaticEnabled,
          });
        }

        await loadTickets(1);
      } catch {
        router.push("/admin/login");
      }
    }
    init();
  }, [router]);

  // Trigger search on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedAirline, selectedCurrency, selectedStatus]);

  // Handle single ticket recalculation
  const handleRecalculateSingle = async (ticketId: string) => {
    setIsRecalculating(true);
    try {
      const res = await fetch("/api/v1/admin/markup/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "SINGLE", ticketIds: [ticketId] }),
      });
      const { data, error: parseError } = await parseResponseJson(res);
      if (!res.ok || !data?.success) throw new Error(data?.error || parseError || "Failed to recalculate ticket");

      setFeedback({ type: "success", message: data.message || "Ticket recalculated successfully." });
      setTimeout(() => setFeedback(null), 4000);
      await loadTickets(pagination.page);

      if (activeTicketDetail && activeTicketDetail.id === ticketId) {
        const updated = tickets.find((t) => t.id === ticketId);
        if (updated) setActiveTicketDetail(updated);
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: sanitizeErrorMessage(err, "Failed to recalculate ticket") });
    } finally {
      setIsRecalculating(false);
    }
  };

  // Handle selected tickets recalculation
  const handleRecalculateSelected = async () => {
    if (selectedTickets.length === 0) return;
    setIsRecalculating(true);
    try {
      const res = await fetch("/api/v1/admin/markup/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "SELECTED", ticketIds: selectedTickets }),
      });
      const { data, error: parseError } = await parseResponseJson(res);
      if (!res.ok || !data?.success) throw new Error(data?.error || parseError || "Failed to recalculate selected");

      setFeedback({ type: "success", message: data.message || "Selected tickets recalculated successfully." });
      setTimeout(() => setFeedback(null), 5000);
      setSelectedTickets([]);
      await loadTickets(pagination.page);
    } catch (err: any) {
      setFeedback({ type: "error", message: sanitizeErrorMessage(err, "Failed to recalculate selected") });
    } finally {
      setIsRecalculating(false);
    }
  };

  // Handle recalculate ALL unsold tickets
  const handleRecalculateAllUnsold = async () => {
    setIsRecalculating(true);
    setShowRecalculateAllModal(false);
    try {
      const res = await fetch("/api/v1/admin/markup/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "ALL_UNSOLD" }),
      });
      const { data, error: parseError } = await parseResponseJson(res);
      if (!res.ok || !data?.success) throw new Error(data?.error || parseError || "Failed to recalculate all unsold tickets");

      setFeedback({ type: "success", message: data.message || "All unsold tickets recalculated successfully." });
      setTimeout(() => setFeedback(null), 5000);
      await loadTickets(1);
    } catch (err: any) {
      setFeedback({ type: "error", message: sanitizeErrorMessage(err, "Failed to recalculate all unsold tickets") });
    } finally {
      setIsRecalculating(false);
    }
  };

  // Handle CSV upload preview
  const handleCSVPreview = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCSVFile(file);
    setCSVUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/admin/markup/preview-csv", {
        method: "POST",
        body: formData,
      });

      const { data, error: parseError } = await parseResponseJson(res);
      if (!res.ok || !data?.success) throw new Error(data?.error || parseError || "Failed to parse CSV");
      setCSVPreview(data.data);
    } catch (err: any) {
      setFeedback({ type: "error", message: sanitizeErrorMessage(err, "CSV error") });
    } finally {
      setCSVUploading(false);
    }
  };

  // Confirm CSV Import
  const handleConfirmCSVImport = async () => {
    if (!csvPreview || !csvPreview.preview || csvPreview.preview.length === 0) return;
    setCSVUploading(true);

    try {
      // Map preview rows to RawTicketInput format
      const validRows = csvPreview.preview.filter((r: any) => r.pricingStatus !== "Error");
      const ticketsToSave = validRows.map((r: any) => ({
        supplierReference: r.supplierReference,
        supplierName: r.supplierName,
        airline: r.airline,
        origin: r.origin,
        destination: r.destination,
        travelDate: r.travelDate,
        passengerType: r.passengerType,
        cabinClass: r.cabinClass,
        currency: r.currency,
        supplierPriceMinor: r.supplierPriceMinor,
      }));

      const res = await fetch("/api/v1/admin/markup/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets: ticketsToSave, importedVia: "CSV" }),
      });

      const { data, error: parseError } = await parseResponseJson(res);
      if (!res.ok || !data?.success) throw new Error(data?.error || parseError || "Failed to import CSV");

      setFeedback({ type: "success", message: data.message || "CSV tickets imported successfully." });
      setTimeout(() => setFeedback(null), 5000);
      setShowCSVModal(false);
      setCSVPreview(null);
      setCSVFile(null);
      await loadTickets(1);
    } catch (err: any) {
      setFeedback({ type: "error", message: sanitizeErrorMessage(err, "Failed to import CSV") });
    } finally {
      setCSVUploading(false);
    }
  };

  // Handle Spreadsheet row changes with real-time automatic calculation
  const handleManualRowChange = (index: number, field: string, value: string) => {
    const updated = [...manualRows];
    updated[index][field] = value;
    setManualRows(updated);
  };

  const addManualRow = () => {
    setManualRows([
      ...manualRows,
      {
        supplierReference: `SUP-MAN-0${manualRows.length + 1}`,
        airline: "Emirates",
        route: "EBB-DXB",
        travelDate: new Date().toISOString().split("T")[0],
        currency: "USD",
        supplierPrice: "400",
      },
    ]);
  };

  const removeManualRow = (index: number) => {
    if (manualRows.length <= 1) return;
    setManualRows(manualRows.filter((_, i) => i !== index));
  };

  // Submit Bulk Manual Entry
  const handleSaveManualSpreadsheet = async () => {
    setManualSaving(true);
    try {
      const ticketsToSave = manualRows.map((r) => {
        const parts = (r.route || "EBB-DXB").split("-");
        const origin = (parts[0] || "EBB").trim().toUpperCase();
        const destination = (parts[1] || "DXB").trim().toUpperCase();
        const price = parseFloat(r.supplierPrice) || 0;

        return {
          supplierReference: r.supplierReference || `MAN-${Date.now()}`,
          airline: r.airline || "Carrier",
          origin,
          destination,
          travelDate: r.travelDate || new Date().toISOString().split("T")[0],
          currency: r.currency || "USD",
          supplierPriceMinor: Math.round(price * 100),
          cabinClass: "ECONOMY",
          passengerType: "ADULT",
        };
      });

      const res = await fetch("/api/v1/admin/markup/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets: ticketsToSave, importedVia: "MANUAL" }),
      });

      const { data, error: parseError } = await parseResponseJson(res);
      if (!res.ok || !data?.success) throw new Error(data?.error || parseError || "Failed to save manual spreadsheet tickets");

      setFeedback({ type: "success", message: data.message || "Manual spreadsheet tickets saved successfully." });
      setTimeout(() => setFeedback(null), 5000);
      setShowSpreadsheetModal(false);
      await loadTickets(1);
    } catch (err: any) {
      setFeedback({ type: "error", message: sanitizeErrorMessage(err, "Failed to save manual spreadsheet tickets") });
    } finally {
      setManualSaving(false);
    }
  };

  // Toggle selection
  const toggleSelectTicket = (id: string) => {
    setSelectedTickets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(tickets.map((t) => t.id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header & Title */}
        <div className="space-y-2 border-b border-hairline pb-6">
          <div className="flex items-center space-x-2 text-xs text-muted">
            <Link href="/admin" className="hover:text-primary transition-colors">
              Admin Console
            </Link>
            <span>/</span>
            <span className="text-ink font-semibold">Supplier Ticket Results</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-sans tracking-tight text-ink">
                Supplier Ticket Results
              </h1>
              <p className="text-xs text-muted">
                Automatic bulk processing engine. System applies markup, calculates profit, and displays final customer price without manual effort.
              </p>
            </div>

            {/* Bulk Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="secondary-light"
                size="sm"
                onClick={() => setShowCSVModal(true)}
                className="flex items-center space-x-1.5 text-xs font-semibold"
              >
                <Upload className="w-3.5 h-3.5 text-primary" />
                <span>Upload Supplier Ticket Prices (CSV)</span>
              </Button>

              <Button
                variant="secondary-light"
                size="sm"
                onClick={() => setShowSpreadsheetModal(true)}
                className="flex items-center space-x-1.5 text-xs font-semibold"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
                <span>Bulk Manual Entry</span>
              </Button>

              <Button
                variant="pill-cta"
                size="sm"
                onClick={() => setShowRecalculateAllModal(true)}
                disabled={isRecalculating}
                className="flex items-center space-x-1.5 text-xs font-bold shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? "animate-spin" : ""}`} />
                <span>Recalculate All Unsold Tickets</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Shared Admin Navigation Tab Bar */}
        <AdminNavBar
          activeMarkupPercent={markupSettings.defaultMarkupPercent}
          isAutomaticEnabled={markupSettings.isAutomaticEnabled}
        />

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center space-x-3 text-xs font-semibold animate-in fade-in duration-200 ${
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

        {/* Summary Metric Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card variant="bordered" className="p-4 space-y-1">
              <span className="text-[10px] font-mono text-muted uppercase">Tickets Processed</span>
              <span className="text-2xl font-mono font-bold text-ink block">
                {summary.totalTicketsProcessed}
              </span>
              <span className="text-[11px] text-muted">All active supplier quotes</span>
            </Card>

            <Card variant="bordered" className="p-4 space-y-1">
              <span className="text-[10px] font-mono text-muted uppercase">Supplier Cost</span>
              <span className="text-2xl font-mono font-bold text-ink block">
                {formatMoney(summary.totalSupplierCostMinor, "USD")}
              </span>
              <span className="text-[11px] text-muted">Base net wholesale</span>
            </Card>

            <Card variant="bordered" className="p-4 space-y-1">
              <span className="text-[10px] font-mono text-muted uppercase">Customer Sales</span>
              <span className="text-2xl font-mono font-bold text-primary block">
                {formatMoney(summary.totalCustomerSalesMinor, "USD")}
              </span>
              <span className="text-[11px] text-muted">Total retail price</span>
            </Card>

            <Card variant="bordered" className="p-4 space-y-1 bg-emerald-50/50 border-emerald-200">
              <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold">Total Profit</span>
              <span className="text-2xl font-mono font-bold text-emerald-700 block">
                +{formatMoney(summary.totalExpectedProfitMinor, "USD")}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                Avg: {summary.averageMarkupPercentage}% markup
              </span>
            </Card>

            <Card variant="bordered" className="p-4 space-y-1">
              <span className="text-[10px] font-mono text-muted uppercase">Avg Profit / Ticket</span>
              <span className="text-2xl font-mono font-bold text-ink block">
                {formatMoney(summary.averageProfitPerTicketMinor, "USD")}
              </span>
              <span className="text-[11px] text-muted">Per passenger profit</span>
            </Card>
          </div>
        )}

        {/* Filter and Selection Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-hairline bg-surface-soft/40">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference, airline, route..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-hairline bg-canvas text-ink focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              aria-label="Filter by Airline"
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-hairline bg-canvas text-ink"
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
              className="px-3 py-2 text-xs rounded-lg border border-hairline bg-canvas text-ink"
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
              className="px-3 py-2 text-xs rounded-lg border border-hairline bg-canvas text-ink"
            >
              <option value="ALL">All Statuses</option>
              <option value="Calculated">Calculated</option>
              <option value="Updated">Updated</option>
              <option value="Price Changed">Price Changed</option>
              <option value="Booked">Booked</option>
              <option value="Paid">Paid</option>
              <option value="Ticketed">Ticketed</option>
              <option value="Error">Error</option>
            </select>
          </div>

          {/* Bulk Action on Selected */}
          {selectedTickets.length > 0 && (
            <div className="flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <span className="text-primary font-mono">{selectedTickets.length} Selected</span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRecalculateSelected}
                disabled={isRecalculating}
                className="text-xs h-7 px-2.5"
              >
                Recalculate Selected
              </Button>
            </div>
          )}
        </div>

        {/* AUTOMATIC PRICING TABLE */}
        <div className="border border-hairline rounded-xl overflow-hidden shadow-soft-drop bg-canvas">
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full min-w-[1050px] text-left text-xs">
              <thead className="bg-surface-soft border-b border-hairline text-muted uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all tickets"
                      checked={selectedTickets.length > 0 && selectedTickets.length === tickets.length}
                      onChange={toggleSelectAll}
                      className="rounded border-hairline text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="p-4">Ticket/Quote Reference</th>
                  <th className="p-4">Airline</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Travel Date</th>
                  <th className="p-4">Passenger Type</th>
                  <th className="p-4 text-right bg-surface-strong/30 font-bold">Supplier Price</th>
                  <th className="p-4 text-right bg-primary/5 text-primary font-bold">Our Markup</th>
                  <th className="p-4 text-right bg-emerald-50/70 text-emerald-900 font-bold">Our Profit</th>
                  <th className="p-4 text-right bg-primary/10 text-ink font-bold">Customer Price</th>
                  <th className="p-4 text-center">Currency</th>
                  <th className="p-4">Pricing Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={13} className="p-12 text-center text-muted font-sans">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading supplier ticket results...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-12 text-center text-muted font-sans space-y-2">
                      <p className="text-sm font-semibold text-ink">No supplier tickets found.</p>
                      <p className="text-xs">Upload a CSV or use Bulk Manual Entry above to process tickets.</p>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className={`hover:bg-surface-soft/60 transition-colors ${
                        selectedTickets.includes(ticket.id) ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          aria-label={`Select ticket ${ticket.supplierReference}`}
                          checked={selectedTickets.includes(ticket.id)}
                          onChange={() => toggleSelectTicket(ticket.id)}
                          className="rounded border-hairline text-primary focus:ring-primary"
                        />
                      </td>

                      {/* Ticket / Quote Ref */}
                      <td className="p-4 font-bold text-ink">
                        <span>{ticket.supplierReference}</span>
                        <span className="block text-[10px] text-muted font-normal font-sans">
                          {ticket.importedVia} • {ticket.supplierName}
                        </span>
                      </td>

                      {/* Airline */}
                      <td className="p-4 font-sans font-semibold text-ink">
                        {ticket.airline}
                      </td>

                      {/* Route */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-surface-soft border border-hairline font-bold text-ink">
                          {ticket.origin} → {ticket.destination}
                        </span>
                        <span className="block text-[10px] text-muted font-sans mt-0.5">
                          {ticket.cabinClass}
                        </span>
                      </td>

                      {/* Travel Date */}
                      <td className="p-4 font-sans text-muted">
                        {formatFlightDate(ticket.travelDate)}
                      </td>

                      {/* Passenger Type */}
                      <td className="p-4">
                        <Badge variant="pill">{ticket.passengerType}</Badge>
                      </td>

                      {/* SUPPLIER PRICE (Confidential) */}
                      <td className="p-4 text-right font-bold text-ink bg-surface-strong/20">
                        {formatMoney(ticket.supplierPriceMinor, ticket.currency as any)}
                      </td>

                      {/* OUR MARKUP */}
                      <td className="p-4 text-right font-bold text-primary bg-primary/5">
                        {ticket.markupPercentage}%
                      </td>

                      {/* OUR PROFIT */}
                      <td className="p-4 text-right font-bold text-emerald-600 bg-emerald-50/50">
                        +{formatMoney(ticket.profitMinor, ticket.currency as any)}
                      </td>

                      {/* CUSTOMER PRICE */}
                      <td className="p-4 text-right font-bold text-sm text-ink bg-primary/10">
                        {formatMoney(ticket.customerPriceMinor, ticket.currency as any)}
                      </td>

                      {/* Currency */}
                      <td className="p-4 text-center font-bold text-muted">
                        {ticket.currency}
                      </td>

                      {/* Pricing Status */}
                      <td className="p-4">
                        <Badge
                          variant={
                            ticket.pricingStatus === "Calculated"
                              ? "semantic-up"
                              : ticket.pricingStatus === "Updated"
                              ? "primary"
                              : ticket.pricingStatus === "Error"
                              ? "pill"
                              : ticket.pricingStatus === "Paid" || ticket.pricingStatus === "Ticketed"
                              ? "pill"
                              : "pill"
                          }
                          className={ticket.pricingStatus === "Error" ? "bg-rose-100 text-rose-800" : ""}
                        >
                          {ticket.pricingStatus}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5 font-sans">
                          <Button
                            variant="secondary-light"
                            size="sm"
                            onClick={() => setActiveTicketDetail(ticket)}
                            className="h-7 px-2 text-xs flex items-center space-x-1"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3 text-muted" />
                            <span>Details</span>
                          </Button>

                          <Button
                            variant="secondary-light"
                            size="sm"
                            onClick={() => handleRecalculateSingle(ticket.id)}
                            disabled={isRecalculating || ticket.isSold}
                            className="h-7 px-2 text-xs flex items-center space-x-1 hover:text-primary"
                            title="Recalculate Ticket"
                          >
                            <RotateCw className={`w-3 h-3 ${isRecalculating ? "animate-spin" : ""}`} />
                            <span>Recalculate</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-hairline bg-surface-soft/40 flex items-center justify-between text-xs text-muted">
              <span>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total tickets)
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary-light"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => loadTickets(pagination.page - 1)}
                  className="h-7 text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="secondary-light"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadTickets(pagination.page + 1)}
                  className="h-7 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL: CSV BULK UPLOAD */}
        {showCSVModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-canvas border border-hairline rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink">Upload Supplier Ticket Prices (CSV)</h3>
                    <p className="text-xs text-muted">Bulk ingest and automatically calculate markup on multiple tickets.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCSVModal(false);
                    setCSVPreview(null);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-surface-soft flex items-center justify-center text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-hairline rounded-xl p-6 text-center space-y-3 hover:border-primary/50 transition-colors bg-surface-soft/30">
                  <Upload className="w-8 h-8 text-primary mx-auto opacity-70" />
                  <div>
                    <p className="text-xs font-semibold text-ink">Select a CSV file from your computer</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Columns: supplier_reference, supplier_name, airline, origin, destination, travel_date, passenger_type, currency, supplier_price
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVPreview}
                    className="text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary/90 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <a
                    href="/api/v1/admin/markup/template"
                    download="supplier_tickets_template.csv"
                    className="text-primary hover:underline font-semibold flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Sample CSV Template</span>
                  </a>
                  <span className="text-muted">Supports UTF-8 CSV</span>
                </div>

                {/* CSV Preview Statistics */}
                {csvPreview && (
                  <div className="space-y-4 pt-4 border-t border-hairline">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-surface-soft border border-hairline text-center">
                        <span className="text-[10px] uppercase font-mono text-muted block">Total Uploaded</span>
                        <span className="text-lg font-bold font-mono text-ink">{csvPreview.totalRows} tickets</span>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                        <span className="text-[10px] uppercase font-mono text-emerald-700 block">Valid & Calculated</span>
                        <span className="text-lg font-bold font-mono text-emerald-700">{csvPreview.validCount} tickets</span>
                      </div>
                      <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center">
                        <span className="text-[10px] uppercase font-mono text-rose-700 block">Errors</span>
                        <span className="text-lg font-bold font-mono text-rose-700">{csvPreview.errorCount} tickets</span>
                      </div>
                    </div>

                    {csvPreview.errors && csvPreview.errors.length > 0 && (
                      <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1 max-h-32 overflow-y-auto">
                        <span className="font-bold block">Validation Errors:</span>
                        {csvPreview.errors.map((err: string, idx: number) => (
                          <div key={idx} className="text-[11px] font-mono">• {err}</div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-3 pt-2">
                      <Button
                        variant="secondary-light"
                        size="md"
                        onClick={() => {
                          setCSVPreview(null);
                          setCSVFile(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleConfirmCSVImport}
                        disabled={csvUploading || csvPreview.validCount === 0}
                        className="font-bold"
                      >
                        {csvUploading ? "Importing..." : `Confirm Import (${csvPreview.validCount} Tickets)`}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: SPREADSHEET BULK MANUAL ENTRY */}
        {showSpreadsheetModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-canvas border border-hairline rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink">Bulk Manual Entry Spreadsheet</h3>
                    <p className="text-xs text-muted">Paste or enter multiple supplier quotes. Markup, profit, and customer price calculate in real-time.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSpreadsheetModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-surface-soft flex items-center justify-center text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Spreadsheet Grid */}
              <div className="space-y-4">
                <div className="overflow-x-auto border border-hairline rounded-xl">
                  <table className="w-full text-xs text-left min-w-[750px]">
                    <thead className="bg-surface-soft border-b border-hairline text-muted uppercase font-mono text-[11px]">
                      <tr>
                        <th className="p-3">Supplier Reference</th>
                        <th className="p-3">Airline</th>
                        <th className="p-3">Route (ORG-DST)</th>
                        <th className="p-3">Travel Date</th>
                        <th className="p-3">Currency</th>
                        <th className="p-3 bg-surface-strong/20">Supplier Price</th>
                        <th className="p-3 text-right bg-primary/5 text-primary">Markup</th>
                        <th className="p-3 text-right bg-emerald-50 text-emerald-800">Our Profit</th>
                        <th className="p-3 text-right bg-primary/10 text-ink">Customer Price</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline font-mono">
                      {manualRows.map((row, idx) => {
                        const price = parseFloat(row.supplierPrice) || 0;
                        const markup = markupSettings.isAutomaticEnabled ? markupSettings.defaultMarkupPercent : 0;
                        const profit = price * (markup / 100);
                        const customerPrice = price + profit;

                        return (
                          <tr key={idx} className="hover:bg-surface-soft/40">
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.supplierReference}
                                onChange={(e) => handleManualRowChange(idx, "supplierReference", e.target.value)}
                                className="w-full px-2 py-1.5 rounded border border-hairline bg-canvas text-ink text-xs font-mono font-bold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.airline}
                                onChange={(e) => handleManualRowChange(idx, "airline", e.target.value)}
                                className="w-full px-2 py-1.5 rounded border border-hairline bg-canvas text-ink text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.route}
                                onChange={(e) => handleManualRowChange(idx, "route", e.target.value)}
                                className="w-full px-2 py-1.5 rounded border border-hairline bg-canvas text-ink text-xs font-mono font-bold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="date"
                                value={row.travelDate}
                                onChange={(e) => handleManualRowChange(idx, "travelDate", e.target.value)}
                                className="w-full px-2 py-1.5 rounded border border-hairline bg-canvas text-ink text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={row.currency}
                                onChange={(e) => handleManualRowChange(idx, "currency", e.target.value)}
                                className="w-full px-2 py-1.5 rounded border border-hairline bg-canvas text-ink text-xs font-bold font-mono"
                              >
                                <option value="USD">USD</option>
                                <option value="UGX">UGX</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="KES">KES</option>
                              </select>
                            </td>
                            <td className="p-2 bg-surface-strong/20">
                              <input
                                type="number"
                                step="0.01"
                                value={row.supplierPrice}
                                onChange={(e) => handleManualRowChange(idx, "supplierPrice", e.target.value)}
                                className="w-full px-2 py-1.5 rounded border border-hairline bg-canvas text-ink text-xs font-mono font-bold"
                              />
                            </td>
                            <td className="p-3 text-right bg-primary/5 text-primary font-bold">
                              {markup}%
                            </td>
                            <td className="p-3 text-right bg-emerald-50 text-emerald-700 font-bold">
                              +{row.currency} {profit.toFixed(2)}
                            </td>
                            <td className="p-3 text-right bg-primary/10 text-ink font-bold text-sm">
                              {row.currency} {customerPrice.toFixed(2)}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeManualRow(idx)}
                                className="text-muted hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="secondary-light"
                    size="sm"
                    onClick={addManualRow}
                    className="flex items-center space-x-1.5 text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary" />
                    <span>Add Row</span>
                  </Button>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="secondary-light"
                      size="md"
                      onClick={() => setShowSpreadsheetModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSaveManualSpreadsheet}
                      disabled={manualSaving}
                      className="font-bold px-6"
                    >
                      {manualSaving ? "Saving..." : `Confirm & Save ${manualRows.length} Tickets`}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: RECALCULATE ALL UNSOLD WARNING */}
        {showRecalculateAllModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-canvas border border-hairline rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center space-x-3 text-primary">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">Recalculate All Unsold Tickets</h3>
                  <p className="text-xs text-muted">Bulk pricing synchronization</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-soft border border-hairline space-y-2 text-xs leading-relaxed text-body">
                <p className="font-semibold text-ink">
                  You are about to recalculate all unsold tickets using the current markup percentage of <strong>{markupSettings.defaultMarkupPercent}%</strong>.
                </p>
                <div className="flex items-center space-x-2 text-emerald-700 font-semibold pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Paid and ticketed bookings will not be changed.</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <Button
                  variant="secondary-light"
                  size="md"
                  onClick={() => setShowRecalculateAllModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="pill-cta"
                  size="md"
                  onClick={handleRecalculateAllUnsold}
                  className="font-bold px-5"
                >
                  Yes, Recalculate Unsold Tickets
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: TICKET PRICING DETAILS */}
        {activeTicketDetail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-canvas border border-hairline rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <div>
                  <h3 className="text-lg font-bold text-ink">Ticket Pricing Details</h3>
                  <p className="text-xs text-muted font-mono">{activeTicketDetail.supplierReference}</p>
                </div>
                <button
                  onClick={() => setActiveTicketDetail(null)}
                  className="w-8 h-8 rounded-lg hover:bg-surface-soft flex items-center justify-center text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded bg-surface-soft">
                  <span className="text-muted font-sans">Supplier Price:</span>
                  <span className="font-bold text-ink">
                    {formatMoney(activeTicketDetail.supplierPriceMinor, activeTicketDetail.currency as any)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-surface-soft">
                  <span className="text-muted font-sans">Markup Percentage:</span>
                  <span className="font-bold text-primary">{activeTicketDetail.markupPercentage}%</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <span className="font-bold font-sans">Our Profit:</span>
                  <span className="font-bold text-emerald-700">
                    +{formatMoney(activeTicketDetail.profitMinor, activeTicketDetail.currency as any)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30 text-ink">
                  <span className="font-bold font-sans text-sm">Customer Price:</span>
                  <span className="font-bold text-base text-primary">
                    {formatMoney(activeTicketDetail.customerPriceMinor, activeTicketDetail.currency as any)}
                  </span>
                </div>

                <div className="pt-2 space-y-1.5 text-[11px] font-sans text-muted border-t border-hairline">
                  <div><strong>Markup Rule Used:</strong> {activeTicketDetail.markupRuleUsed}</div>
                  <div><strong>Calculation Time:</strong> {new Date(activeTicketDetail.updatedAt).toLocaleString("en-US")}</div>
                  <div><strong>Pricing Status:</strong> {activeTicketDetail.pricingStatus}</div>
                  <div><strong>Airline / Route:</strong> {activeTicketDetail.airline} ({activeTicketDetail.origin} → {activeTicketDetail.destination})</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-hairline">
                <Button
                  variant="secondary-light"
                  size="md"
                  onClick={() => setActiveTicketDetail(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleRecalculateSingle(activeTicketDetail.id)}
                  disabled={isRecalculating || activeTicketDetail.isSold}
                  className="font-bold"
                >
                  Recalculate This Ticket
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
