import React, { useState, useEffect, useMemo } from "react";
import Header from "../components/user/Header";
import Footer from "../components/user/Footer";
import { useUserPastOrders } from "../hooks/user/useUserPastOrders";
import { downloadUserInvoice } from "../api/userOrdersApi";
import Pagination from "../components/Pagination";
import { useDebounce } from "../hooks/useDebounce";
import toast from "react-hot-toast";
import {
  FileText,
  Clock,
  XCircle,
  Download,
  Search,
  Calendar,
  Server,
  Loader2,
  AlertCircle,
  Filter,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const MONTHS = [
  { value: "", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [{ value: "", label: "All Years" }];
  for (let y = currentYear; y >= 2024; y--) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
}

const getStatusColor = (status) => {
  const s = status?.toUpperCase();
  if (s?.includes("DESTROYED") || s?.includes("DELETED")) {
    return "text-red-400 bg-red-400/10 border-red-400/20";
  }
  if (s?.includes("EXPIRED")) {
    return "text-orange-400 bg-orange-400/10 border-orange-400/20";
  }
  if (s?.includes("USER")) {
    return "text-blue-400 bg-blue-400/10 border-blue-400/20";
  }
  return "text-gray-400 bg-gray-400/10 border-gray-400/20";
};

const getStatusIcon = (status) => {
  const s = status?.toUpperCase();
  if (s?.includes("DESTROYED") || s?.includes("DELETED")) {
    return <XCircle className="w-3.5 h-3.5" />;
  }
  if (s?.includes("EXPIRED")) {
    return <Clock className="w-3.5 h-3.5" />;
  }
  return <FileText className="w-3.5 h-3.5" />;
};

const formatStatusLabel = (status) => {
  if (!status) return "Unknown";
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatSpecs = (specs) => {
  if (!specs) return "N/A";
  if (typeof specs === "string") return specs;
  const parts = [];
  if (specs.cpu) parts.push(`${specs.cpu}C`);
  if (specs.ramMb) parts.push(`${(specs.ramMb / 1024).toFixed(0)}GB RAM`);
  if (specs.diskGb) parts.push(`${specs.diskGb}GB Disk`);
  return parts.join(" / ") || "N/A";
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);

// ─── Component ──────────────────────────────────────────────────────────────

export default function Invoices() {
  // ── Filters ──
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm.trim(), 500);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // ── Pagination ──
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // ── Data ──
  const [orders, setOrders] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  const yearOptions = useMemo(() => getYearOptions(), []);

  // ── React Query ──
  const {
    data: ordersData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useUserPastOrders({
    page,
    size,
    search: debouncedSearch,
    month,
    year,
  });

  // ── Sync response → local state ──
  useEffect(() => {
    if (!ordersData) return;

    setTotalItems(ordersData.totalItems || 0);
    setTotalPages(ordersData.totalPages || 0);

    const normalized = (ordersData.orders || []).map((o) => ({
      id: o.virtualMachineId || o.orderId,
      orderId: o.orderId,
      paymentId: o.paymentId,
      vmName: o.serverName || "N/A",
      ipAddress: o.ip || "N/A",
      specs: formatSpecs(o.specs),
      amount: o.totalPaidAmount || 0,
      osName: o.osName || "N/A",
      osType: o.osType || "N/A",
      planType: o.planType || "N/A",
      deletionStatus: o.deletionStatus || "UNKNOWN",
      creationTime: o.creationTime,
      deletionTime: o.deletionTime,
      expiryTime: o.expiryTime,
      rawData: o,
    }));

    setOrders(normalized);
  }, [ordersData]);

  // ── Reset page on filter change ──
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, month, year]);

  // ── Invoice download (use paymentId as primary, orderId as fallback) ──
  const handleDownloadInvoice = async (order) => {
    const invoiceId = order.paymentId || order.orderId;
    if (!invoiceId) return;

    try {
      setDownloadingId(invoiceId);
      await downloadUserInvoice(invoiceId);
    } catch (err) {
      toast.error(err.message || "Invoice download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Clear all filters ──
  const clearFilters = () => {
    setSearchTerm("");
    setMonth("");
    setYear("");
    setPage(0);
  };

  const hasActiveFilters = searchTerm || month || year;

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      {/* ── Header ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      <main className="flex-1 mt-[72px] p-4 sm:p-6 lg:p-10 space-y-6">
        {/* ── Page Title ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">
              Invoices
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              View your order history and download invoices
            </p>
          </div>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-900/30 hover:bg-indigo-800/30
                       border border-indigo-700/50 text-indigo-300
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                       flex items-center gap-2 self-start sm:self-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-red-900/20 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">
              {error.message || "Failed to load invoices"}
            </span>
            <button
              onClick={refetch}
              className="text-red-200 hover:text-white underline text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Filters Bar ── */}
        <div className="bg-[#151c2f] border border-indigo-900/30 rounded-xl p-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by VM name or IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0e1525]
                           border border-indigo-900/50 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500
                           hover:border-indigo-500/60 transition-colors
                           placeholder:text-gray-500"
              />
            </div>

            {/* Month Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-[#0e1525]
                           border border-indigo-900/50 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500
                           hover:border-indigo-500/60 transition-colors
                           appearance-none min-w-[160px] text-gray-200"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-[#0e1525]
                           border border-indigo-900/50 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500
                           hover:border-indigo-500/60 transition-colors
                           appearance-none min-w-[140px] text-gray-200"
              >
                {yearOptions.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium
                           text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50
                           border border-gray-700/50 rounded-lg transition-colors"
              >
                <Filter className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto rounded-2xl border border-indigo-900/30 shadow-lg bg-[#151c2f]/50">
          {/* Fetching indicator bar */}
          {isFetching && !isLoading && (
            <div className="h-0.5 bg-indigo-600/30 overflow-hidden">
              <div className="h-full bg-indigo-500 animate-pulse w-full" />
            </div>
          )}

          <table className="min-w-full text-left border-collapse">
            <thead className="bg-[#151c2f] text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="py-3.5 px-6 font-medium">Server</th>
                <th className="py-3.5 px-6 font-medium">IP Address</th>
                <th className="py-3.5 px-6 font-medium">OS / Plan</th>
                <th className="py-3.5 px-6 font-medium">Specs</th>
                <th className="py-3.5 px-6 font-medium">Amount</th>
                <th className="py-3.5 px-6 font-medium">Created</th>
                <th className="py-3.5 px-6 font-medium">Deleted</th>
                <th className="py-3.5 px-6 font-medium">Status</th>
                <th className="py-3.5 px-6 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-indigo-900/20">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="text-center py-20">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
                      <p className="mt-4 text-gray-400">
                        Loading invoices...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-20 text-red-300"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-12 h-12 text-red-400/60" />
                      <p>{error.message || "Failed to load invoices"}</p>
                      <button
                        onClick={refetch}
                        className="text-sm text-indigo-400 hover:text-indigo-300 underline"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-20">
                    <div className="flex flex-col items-center justify-center">
                      <Server className="w-16 h-16 text-gray-600 mb-4" />
                      <p className="text-gray-400 text-lg">
                        No invoices found
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {hasActiveFilters
                          ? "Try adjusting your filters"
                          : "Your expired or deleted orders will appear here"}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id || order.paymentId}
                    className="hover:bg-indigo-900/10 transition-colors"
                  >
                    {/* Server Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="font-medium text-white">
                          {order.vmName}
                        </span>
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 text-xs rounded bg-gray-800/50 font-mono">
                        {order.ipAddress}
                      </span>
                    </td>

                    {/* OS / Plan */}
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-white">{order.osName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.planType}</p>
                      </div>
                    </td>

                    {/* Specs */}
                    <td className="py-4 px-6">
                      <div className="bg-indigo-900/20 border border-indigo-700/30 rounded px-2 py-1 inline-block text-sm">
                        {order.specs}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 font-semibold">
                      {formatCurrency(order.amount)}
                    </td>

                    {/* Created */}
                    <td className="py-4 px-6 text-gray-300 text-sm">
                      {formatDate(order.creationTime)}
                    </td>

                    {/* Deleted */}
                    <td className="py-4 px-6 text-gray-300 text-sm">
                      {formatDate(order.deletionTime)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border
                                    flex items-center gap-1.5 w-fit whitespace-nowrap
                                    ${getStatusColor(order.deletionStatus)}`}
                      >
                        {getStatusIcon(order.deletionStatus)}
                        {formatStatusLabel(order.deletionStatus)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      {(() => {
                        const invoiceId = order.paymentId || order.orderId;
                        const hasPayment = order.amount > 0;
                        const invoiceTitle = !hasPayment
                          ? "No payment recorded for this order"
                          : !invoiceId
                            ? "No invoice available"
                            : "Download Invoice";
                        return (
                          <span className="inline-block" title={invoiceTitle}>
                            <button
                              onClick={() => handleDownloadInvoice(order)}
                              disabled={!invoiceId || !hasPayment || downloadingId === invoiceId}
                              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all
                                ${
                                  invoiceId && hasPayment
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:shadow-indigo-600/20"
                                    : "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                              {downloadingId === invoiceId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                              {!hasPayment ? "No Payment" : "Invoice"}
                            </button>
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalItems > 0 && (
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p - 1)}
            showingFrom={page * size + 1}
            showingTo={Math.min((page + 1) * size, totalItems)}
            totalItems={totalItems}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
