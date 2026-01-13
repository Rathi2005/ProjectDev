import React, { useEffect, useState, useCallback } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import Swal from "sweetalert2";
import Pagination from "../../components/Pagination";
import { FileText, CheckCircle, Clock, XCircle, Download } from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("adminToken");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(invoices.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentInvoices = invoices.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [invoices]);

  const fetchPaymentsOverview = async () => {
    const res = await fetch(`${BASE_URL}/api/admin/payments/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch payments overview");
    }

    return res.json();
  };

  const fetchMasterLedger = async () => {
    const res = await fetch(`${BASE_URL}/api/admin/payments/master-ledger`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch master ledger");
    }

    return res.json();
  };

  const fetchInvoices = useCallback(async () => {
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 🔹 Fetch APIs separately
      const overviewData = await fetchPaymentsOverview();
      const ledgerData = await fetchMasterLedger();

      // 🔹 Build lookup map
      const ledgerMap = new Map(
        ledgerData.map((item) => [item.transactionId, item])
      );

      const normalized = overviewData.map((payment) => {
        const ledgerMatch = ledgerMap.get(payment.transactionId);

        const issueDate = new Date(payment.paymentTime);
        const formattedDate = issueDate.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return {
          paymentId: payment.paymentId,
          invoiceId: `INV-${payment.paymentId.toString().padStart(6, "0")}`,
          customerName: payment.customerName || "N/A",
          server: payment.vmName || "N/A",

          issueDateRaw: payment.paymentTime,
          issueDate: formattedDate,
          dueDate: calculateDueDate(issueDate),

          amount: new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
          }).format(payment.amount),

          rawAmount: payment.amount,
          paymentMethod: payment.gatewayId || "N/A",
          status: payment.paymentStatus?.toUpperCase() || "UNKNOWN",
          transactionId: payment.transactionId,
          ledgerData: ledgerMatch,
        };
      });

      normalized.sort(
        (a, b) => new Date(b.issueDateRaw) - new Date(a.issueDateRaw)
      );

      setInvoices(normalized);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
      setError(err.message || "Unable to load invoices. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

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
              <span class="text-gray-400">${key}:</span>
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
                  `
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
            <span class="text-gray-400">${key}:</span>
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

  const generateInvoice = async (paymentId) => {
    if (!paymentId || !token) {
      alert("Missing payment ID or authentication");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/payments/${paymentId}/invoice`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invoice");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      // Open in new tab
      window.open(url, "_blank");

      // Optional cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (err) {
      console.error("Invoice download failed:", err);
      alert("Could not generate invoice. Please try again.");
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

  // Calculate stats
  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "PAID").length,
    pending: invoices.filter((i) => i.status === "PENDING").length,
    failed: invoices.filter((i) => i.status === "FAILED").length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv.rawAmount || 0), 0),
  };

  const insights = [
    {
      title: "Total Invoices",
      value: stats.total,
      icon: <FileText className="w-6 h-6 text-indigo-400" />,
    },
    {
      title: "Paid Invoices",
      value: stats.paid,
      icon: <CheckCircle className="w-6 h-6 text-green-400" />,
      percentage:
        stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0,
    },
    {
      title: "Pending Invoices",
      value: stats.pending,
      icon: <Clock className="w-6 h-6 text-yellow-400" />,
    },
    {
      title: "Failed Invoices",
      value: stats.failed,
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
              {loading ? "Refreshing..." : "Refresh"}
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

        <div className="overflow-x-auto rounded-2xl border border-indigo-900/30 shadow-lg bg-[#151c2f]/50">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-[#151c2f] text-gray-300 uppercase text-sm">
              <tr>
                <th className="py-3 px-6 font-medium">Invoice ID</th>
                <th className="py-3 px-6 font-medium">Customer</th>
                <th className="py-3 px-6 font-medium">Server</th>
                <th className="py-3 px-6 font-medium">Issue Date</th>
                <th className="py-3 px-6 font-medium">Amount</th>
                <th className="py-3 px-6 font-medium">Order Id</th>
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
                currentInvoices.map((invoice) => (
                  <tr
                    key={invoice.invoiceId}
                    className="border-t border-indigo-900/30 hover:bg-indigo-900/10 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="text-indigo-300">
                          {invoice.invoiceId}
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
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 text-xs rounded bg-gray-800/50">
                        {invoice.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2 min-w-[180px]">
                        {/* Top row */}
                        <div className="flex gap-2">
                          {invoice.paymentId && (
                            <button
                              onClick={() => generateInvoice(invoice.paymentId)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs transition-all"
                            >
                              <Download className="w-4 h-4" />
                              Invoice
                            </button>
                          )}
                        </div>

                        {/* Bottom row */}
                        {invoice.ledgerData && (
                          <button
                            onClick={() =>
                              showKeyValueModal(
                                "Order Details",
                                invoice.ledgerData
                              )
                            }
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-300 text-xs"
                          >
                            <FileText className="w-4 h-4" />
                            Order Details
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {invoices.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showingFrom={startIndex + 1}
            showingTo={Math.min(endIndex, invoices.length)}
            totalItems={invoices.length}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
