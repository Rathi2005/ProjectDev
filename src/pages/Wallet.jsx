import React, { useState, useEffect } from "react";
import Header from "./../components/user/Header";
import Footer from "./../components/user/Footer";
import toast from "react-hot-toast";
// import PaymentFlow from "./../components/payment/PaymentFlow";

import { walletTopUp, verifyPayment } from "../services/PaymentService";
import PaytmQRModal from "../components/payment/PaytmQRModal";
import { useRef } from "react";

import {
  CreditCard,
  DollarSign,
  IndianRupee,
  TrendingUp,
  Download,
  Upload,
  History,
  Wallet,
  Shield,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function WalletPage() {
  const [transactions, setTransactions] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Add fund
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [amount, setAmount] = useState("");

  // Balance
  const [fiatBalance, setFiatBalance] = useState(0);
  const [currency, setCurrency] = useState("INR");
  const [walletLoading, setWalletLoading] = useState(true);

  const recentTransactions = transactions.slice(0, 10);
  const [showAllTxModal, setShowAllTxModal] = useState(false);

  const [gateway, setGateway] = useState("CASHFREE");
  const [qrData, setQrData] = useState(null);
  const pollRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Fetch wallet data from API
  useEffect(() => {
    fetchWalletData();
    fetchWalletLogs();
  }, []);

  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);

      const res = await fetch(`${BASE_URL}/api/wallet`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch wallet");
      }

      const data = await res.json();

      setFiatBalance(data.balance);
      setCurrency(data.currency);
    } catch (err) {
      console.error(err);
    } finally {
      setWalletLoading(false);
    }
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (paymentId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;

    let attempts = 0;
    const maxAttempts = 40;

    pollRef.current = setInterval(async () => {
      try {
        attempts++;
        const res = await verifyPayment(paymentId, "PAYTM");

        if (
          res.status === "PAID_AND_PROVISIONING" ||
          res.status === "WALLET_TOPPED_UP"
        ) {
          stopPolling();
          setQrData(null);
          toast.success("Wallet topped up successfully!");
          fetchWalletData();
          fetchWalletLogs();
          return;
        }

        if (attempts >= maxAttempts) {
          stopPolling();
          setQrData(null);
          toast("Payment not confirmed yet. You can retry.");
        }
      } catch (err) {
        console.error("Polling error:", err);
        stopPolling();
      }
    }, 3000);
  };

  const handleAddFunds = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true); // add loading state if not present: const [loading, setLoading] = useState(false);
      const data = await walletTopUp(amount, gateway);

      // Case 1: Paytm QR
      if (data.paymentUrl === "PAYTM_QR_FLOW") {
        setShowAddFunds(false);
        setQrData({
          upiString: data.upiString,
          paymentId: data.paymentId,
          amount: Number(amount),
        });
        startPolling(data.paymentId);
        return;
      }

      // Case 2: Cashfree
      if (data.paymentSessionId) {
        const cashfree = window.Cashfree({
          mode:
            import.meta.env.VITE_CASHFREE_MODE === "production"
              ? "production"
              : "sandbox",
        });
        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: "_self",
          onClose: handlePaymentClose,
        });
        setShowAddFunds(false);
      }

      // Case 3: Wallet fully covered (shouldn't happen for top-up but handle anyway)
      if (data.status === "COMPLETED") {
        toast.success("Wallet topped up successfully!");
        fetchWalletData();
        fetchWalletLogs();
        setShowAddFunds(false);
      }
    } catch (err) {
      toast.error(err.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClose = () => {
    Swal.fire({
      icon: "info",
      title: "Payment Processing",
      text: "Your payment is being verified. Wallet will update shortly.",
      background: "#0e1525",
      color: "#e5e7eb",
    });

    setShowAddFunds(false);

    // Refresh wallet after webhook finishes
    setTimeout(fetchWalletData, 4000);
  };

  const fetchWalletLogs = async () => {
    try {
      setLogsLoading(true);

      const res = await fetch(`${BASE_URL}/api/wallet/logs`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch wallet logs");
      }

      const data = await res.json();

      // Normalize backend logs → UI format
      const formattedLogs = data.map((log) => ({
        id: log.id,
        type: log.type === "CREDIT" ? "deposit" : "withdrawal",
        amount: log.type === "CREDIT" ? log.amount : -log.amount,
        description: log.description,
        date: log.createdAt.split("T")[0],
        status: "completed", // wallet logs are already settled
        method: "Wallet",
        referenceId: log.referenceId,
        balanceAfter: log.balanceAfter,
      }));

      setTransactions(formattedLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-900/20 text-green-400 border-green-900/30";
      case "pending":
        return "bg-yellow-900/20 text-yellow-400 border-yellow-900/30";
      case "failed":
        return "bg-red-900/20 text-red-400 border-red-900/30";
      default:
        return "bg-gray-900/20 text-gray-400 border-gray-900/30";
    }
  };

  return (
    <>
      {/* Use your existing Header component */}
      <Header />

      <div className="min-h-screen bg-[#0e1525] pt-6">
        <div className="min-w-fit mx-auto px-4 sm:px-6 lg:px-8">
          {/* Wallet Header */}
          <div className="border-b border-gray-800 pb-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-indigo-400" />
                  My Wallet
                </h1>
                <p className="text-gray-400 mt-2">
                  Manage your funds and transactions
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Column - Balance & Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Balance Cards Row */}
              <div className="grid grid-cols-1 gap-6">
                {/* Fiat Balance Card */}
                <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-gray-800 rounded-2xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-400 text-sm">Fiat Balance</p>
                      <h2 className="text-3xl font-bold text-white mt-2">
                        ₹{fiatBalance.toFixed(2)}
                      </h2>
                    </div>
                    <div className="bg-indigo-900/30 p-3 rounded-xl">
                      <IndianRupee className="w-8 h-8 text-indigo-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-[#121a2a] border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowAddFunds(true)}
                    className="flex flex-col items-center p-4 bg-indigo-900/20 hover:bg-indigo-900/30 border border-indigo-900/30 rounded-xl transition-all hover:scale-[1.02] group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-indigo-900/40 flex items-center justify-center mb-3 group-hover:bg-indigo-900/60">
                      <Plus className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="text-white font-medium">Add Funds</span>
                    <span className="text-xs text-gray-400 mt-1">
                      Credit Card
                    </span>
                  </button>
                  <button className="flex flex-col items-center p-4 bg-gray-900/20 hover:bg-gray-800/30 border border-gray-800 rounded-xl transition-all hover:scale-[1.02] group">
                    <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center mb-3 group-hover:bg-gray-700">
                      <Download className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-white font-medium">Export</span>
                    <span className="text-xs text-gray-400 mt-1">
                      CSV / PDF
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Recent Transactions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Recent Transactions */}
              <div className="bg-[#121a2a] border border-gray-800 rounded-2xl p-6 h-[380px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-400" />
                    Recent Transactions
                  </h3>
                  <span className="text-sm text-gray-400">
                    {transactions.length} total
                  </span>
                </div>
                <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2">
                  {logsLoading ? (
                    <p className="text-gray-400 text-sm">
                      Loading transactions...
                    </p>
                  ) : transactions.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                      No transactions found
                    </p>
                  ) : (
                    recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-900/30 rounded-xl transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              transaction.amount > 0
                                ? "bg-green-900/30"
                                : "bg-red-900/30"
                            }`}
                          >
                            {transaction.amount > 0 ? (
                              <ArrowDownRight className="w-5 h-5 text-green-400" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm group-hover:text-indigo-300 transition-colors">
                              {transaction.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                {transaction.date} • {transaction.referenceId}
                              </span>

                              <span className="text-xs px-2 py-0.5 rounded border bg-gray-900/30 border-gray-700">
                                {transaction.method}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${transaction.amount > 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {transaction.amount > 0 ? "+" : ""}₹
                            {Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-1 justify-end mt-1">
                            {getStatusIcon(transaction.status)}
                            <span
                              className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(transaction.status)}`}
                            >
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => setShowAllTxModal(true)}
                  className="w-full mt-6 py-3 text-center text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium border-t border-gray-800 pt-4"
                >
                  View All Transactions →
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-[#121a2a] border border-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-6">
              Wallet Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  ₹{fiatBalance.toFixed(2)}
                </p>

                <p className="text-sm text-gray-400">Total Balance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  ₹{fiatBalance.toFixed(2)}
                </p>

                <p className="text-sm text-gray-400">This Month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {transactions.length}
                </p>
                <p className="text-sm text-gray-400">Transactions</p>
              </div>
            </div>
          </div>

          {/* Add Funds Modal */}
          {showAddFunds && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-[#121a2a] border border-gray-800 rounded-2xl w-full max-w-md animate-fadeIn">
                <div className="p-6 border-b border-gray-800">
                  <h3 className="text-xl font-bold text-white">
                    Add Funds to Wallet
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Amount (Rupees)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          placeholder="0.00"
                          min="1"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="pt-4">
                      <p className="text-sm text-gray-400 mb-2">
                        Quick Amounts
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {[10, 50, 100, 500].map((quickAmount) => (
                          <button
                            key={quickAmount}
                            onClick={() => setAmount(quickAmount.toString())}
                            className="py-2 text-center border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            ₹{quickAmount}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    {/* Gateway Selector */}
                    <div className="grid grid-cols-2 gap-3">
                      {["CASHFREE", "PAYTM"].map((gw) => (
                        <button
                          key={gw}
                          onClick={() => setGateway(gw)}
                          className={`py-2 rounded-xl border text-sm font-medium transition-all ${
                            gateway === gw
                              ? "border-indigo-500 bg-indigo-900/30 text-indigo-300"
                              : "border-gray-700 text-gray-400 hover:bg-gray-800"
                          }`}
                        >
                          {gw === "CASHFREE" ? "💳 Cashfree" : "📱 Paytm / UPI"}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleAddFunds}
                        disabled={loading}
                        className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition-colors"
                      >
                        {loading ? "Processing..." : `Pay ₹${amount || "0"}`}
                      </button>
                      <button
                        onClick={() => setShowAddFunds(false)}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {qrData && (
            <PaytmQRModal
              qrData={qrData}
              onClose={() => {
                stopPolling();
                setQrData(null);
              }}
              stopPolling={stopPolling}
            />
          )}

          {showAllTxModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-[#121a2a] border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    All Transactions
                  </h3>
                  <button
                    onClick={() => setShowAllTxModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-900/30"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {transaction.date} • {transaction.referenceId}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            transaction.amount > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}₹
                          {Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(transaction.status)}`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
