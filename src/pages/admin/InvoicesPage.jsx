import React, { useEffect, useState, useCallback } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import Swal from "sweetalert2";
import Pagination from "../../components/Pagination";
import toast from "react-hot-toast";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Search,
  Eye,
} from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("adminToken");

  const [page, setPage] = useState(0); // 0-based
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [paymentStats, setPaymentStats] = useState({
    totalPayments: 0,
    paidPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchPaymentStats() {
      try {
        if (!token) return;

        const res = await fetch(`${BASE_URL}/api/admin/stats/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch payment stats");

        const data = await res.json();

        setPaymentStats({
          totalPayments: data.totalPayments || 0,
          paidPayments: data.paidPayments || 0,
          pendingPayments: data.pendingPayments || 0,
          failedPayments: data.failedPayments || 0,
        });
      } catch (err) {
        toast.error("Failed to load payment insights");
      } finally {
        setLoadingStats(false);
      }
    }

    fetchPaymentStats();
  }, []);

  const fetchInvoices = useCallback(async () => {
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const searchParam = searchTerm
        ? `&search=${encodeURIComponent(searchTerm)}`
        : "";

      const res = await fetch(
        `${BASE_URL}/api/admin/payments/overview?page=${page}&size=${size}${searchParam}&sortBy=timestamp&sortDir=desc`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!res.ok) throw new Error("Failed to fetch invoices");

      const data = await res.json();

      setTotalItems(data.totalItems || 0);
      setTotalPages(data.totalPages || 0);

      const normalized = (data.payments || []).map((p) => {
        const issueDate = new Date(p.timestamp);

        return {
          recordId: p.recordId,
          transactionId: p.orderTransactionId,

          customerName: p.customerName || "N/A",
          customerEmail: p.customerEmail || "N/A",

          server: p.vmName || "N/A",
          specs: p.specs || "N/A",

          issueDateRaw: p.timestamp,
          issueDate: issueDate.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),

          dueDate: calculateDueDate(issueDate),

          amount: new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(p.amount),

          rawAmount: p.amount,

          paymentMethod: p.gatewayId || "N/A",
          status: p.status?.toUpperCase() || "UNKNOWN",
          transactionId: p.orderTransactionId,

          paymentType: p.paymentType,
          totalAmount: p.totalAmount,
          gatewayAmount: p.gatewayAmount,
          couponDiscount: p.couponDiscount,
          couponCode: p.couponCode,
          recordType: p.recordType,
          ipAddress : p.ipAddress || "N/A",

          rawData: p,
        };
      });

      setInvoices(normalized);
    } catch (err) {
      toast.error("Failed to fetch invoices");
      setError(err.message || "Unable to load invoices");
    } finally {
      setLoading(false);
    }
  }, [token, page, size, searchTerm]);

  const showInvoiceDetails = (invoice) => {
    const cleanData = { ...invoice.rawData };

    // Optional: remove internal fields if needed
    delete cleanData.recordId;

    showKeyValueModal(`Invoice ${invoice.invoiceId}`, cleanData);
  };

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices, page, size, searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const isPaidStatus = (status) => {
    if (!status) return false;
    return status.toUpperCase().startsWith("PAID");
  };

  const calculateDueDate = (issueDate) => {
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from issue
    return dueDate.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const showKeyValueModal = (title, data) => {
    const renderObject = (obj, level = 0) => {
      return Object.entries(obj || {})
        .map(([key, value]) => {
          const padding = level * 18;

          if (value === null || value === undefined) {
            return `
            <div style="margin-left:${padding}px">
<span class="text-gray-400">
  ${key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}:
</span>
              <span class="text-gray-300 ml-2">—</span>
            </div>
          `;
          }

          if (Array.isArray(value)) {
            return `
            <div style="margin-left:${padding}px; margin-top:8px">
              <div class="text-indigo-400 font-semibold">${key}</div>
              ${value
                .map(
                  (item, idx) => `
                    <div style="margin-left:${padding + 18}px">
                      <span class="text-gray-400">[${idx}]</span>
                      ${
                        typeof item === "object"
                          ? renderObject(item, level + 2)
                          : `<span class="text-gray-200 ml-2">${item}</span>`
                      }
                    </div>
                  `,
                )
                .join("")}
            </div>
          `;
          }

          if (typeof value === "object") {
            return `
            <div style="margin-left:${padding}px; margin-top:8px">
              <div class="text-indigo-400 font-semibold">${key}</div>
              ${renderObject(value, level + 1)}
            </div>
          `;
          }

          return `
  <div style="margin-left:${padding}px">
    <span class="text-gray-400">
      ${key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}:
    </span>
    <span class="text-gray-200 ml-2">${value}</span>
  </div>
`;
        })
        .join("");
    };

    Swal.fire({
      title,
      width: "900px",
      background: "#1e2640",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
      html: `
      <div class="text-left text-sm max-h-[550px] overflow-auto space-y-1">
        ${renderObject(data)}
      </div>
    `,
    });
  };

  const generateInvoice = async (recordId) => {
    if (!recordId || !token) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/payments/${recordId}/invoice`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch invoice");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");

      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      toast.error("Invoice download failed");
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      PAID: "text-green-400 bg-green-400/10 border-green-400/20",
      PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
      FAILED: "text-red-400 bg-red-400/10 border-red-400/20",
      REFUNDED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      CANCELLED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    };

    return (
      statusMap[status] || "text-gray-400 bg-gray-400/10 border-gray-400/20"
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="w-4 h-4" />;
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "FAILED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const insights = [
    {
      title: "Total Payments",
      value: paymentStats.totalPayments,
      icon: <FileText className="w-6 h-6 text-indigo-400" />,
    },
    {
      title: "Paid Payments",
      value: paymentStats.paidPayments,
      icon: <CheckCircle className="w-6 h-6 text-green-400" />,
      percentage:
        paymentStats.totalPayments > 0
          ? Math.round(
              (paymentStats.paidPayments / paymentStats.totalPayments) * 100,
            )
          : 0,
    },
    {
      title: "Pending Payments",
      value: paymentStats.pendingPayments,
      icon: <Clock className="w-6 h-6 text-yellow-400" />,
    },
    {
      title: "Failed Payments",
      value: paymentStats.failedPayments,
      icon: <XCircle className="w-6 h-6 text-red-400" />,
    },
  ];

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      <main className="flex-1 mt-[72px] p-6 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-wide">Invoices</h1>
            <p className="text-gray-400 mt-1">
              Manage and track all payment invoices
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchInvoices}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-900/30 hover:bg-indigo-800/30 border border-indigo-700/50 text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || loadingStats ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={fetchInvoices}
              className="ml-2 text-red-200 hover:text-white underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] border border-indigo-900/30 rounded-2xl p-5 shadow-lg hover:border-indigo-700/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-400 text-sm">{insight.title}</h3>
                  <p className="text-3xl font-semibold mt-2">{insight.value}</p>
                  {insight.percentage && (
                    <p className="text-xs text-gray-400 mt-1">
                      {insight.percentage}% of total
                    </p>
                  )}
                </div>
                <div className="p-3 bg-[#0e1525] rounded-xl border border-indigo-900/40">
                  {insight.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#151c2f] border border-indigo-900/30 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, order ID, gateway, IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0e1525]
                   border border-indigo-900/50 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-indigo-900/30 shadow-lg bg-[#151c2f]/50">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-[#151c2f] text-gray-300 uppercase text-sm">
              <tr>
                <th className="py-3 px-6 font-medium">Transaction ID</th>
                <th className="py-3 px-6 font-medium">Customer</th>
                <th className="py-3 px-6 font-medium">VM</th>
                <th className="py-3 px-6 font-medium">Issue Date</th>
                <th className="py-3 px-6 font-medium">Amount</th>
                <th className="py-3 px-6 font-medium">Payment Type</th>
                <th className="py-3 px-6 font-medium">IP Address</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-20">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                      <p className="mt-4 text-gray-400">Loading invoices...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="text-center py-20 text-red-300">
                    {error}
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-20">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-16 h-16 text-gray-600 mb-4" />
                      <p className="text-gray-400 text-lg">No invoices found</p>
                      <p className="text-gray-500 text-sm mt-1">
                        All payments will appear here once processed
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr
                    key={invoice.invoiceId}
                    className="border-t border-indigo-900/30 hover:bg-indigo-900/10 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="text-indigo-300">
                          {invoice.transactionId}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium">{invoice.customerName}</p>
                        {invoice.transactionId && (
                          <p className="text-xs text-gray-400 mt-1">
                            TXN: {invoice.transactionId.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="bg-indigo-900/20 border border-indigo-700/30 rounded px-2 py-1 inline-block">
                        {invoice.server}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p>{invoice.issueDate}</p>
                        <p className="text-xs text-gray-400">
                          Due: {invoice.dueDate}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      {invoice.amount}
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      {invoice.paymentType || "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 text-xs rounded bg-gray-800/50">
                        {invoice.ipAddress}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(
                            invoice.status,
                          )}`}
                        >
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {/* DETAILS BUTTON */}
                        <button
                          onClick={() => showInvoiceDetails(invoice)}
                          className="flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium bg-indigo-900/40 hover:bg-indigo-800 text-indigo-300 border border-indigo-700/40 transition"
                        >
                          <Eye className="w-4 h-4" />
                          Details
                        </button>

                        {/* DOWNLOAD BUTTON */}
                        <button
                          onClick={() => generateInvoice(invoice.recordId)}
                          disabled={!isPaidStatus(invoice.status)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition
      ${
        isPaidStatus(invoice.status)
          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
          : "bg-gray-700/50 text-gray-400 cursor-not-allowed"
      }`}
                        >
                          <Download className="w-4 h-4" />
                          Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
