import React, { useState, useEffect } from "react";
import Header from "../../../components/admin/adminHeader";
import Footer from "../../../components/user/Footer";
import AdminUserSearch from "../../../components/admin/UsersDetails/AdminUserSearch";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  MinusCircle,
  DollarSign,
  FileText,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const UsersWalletPage = () => {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("CREDIT");
  const [description, setDescription] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  // Users Search
  const [selectedUser, setSelectedUser] = useState(null);
  const [walletLogs, setWalletLogs] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalDebits: 0,
    totalTransactions: 0,
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  const fetchWalletLogs = async (userId) => {
    try {
      setLoadingWallet(true);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        alert("Admin session expired. Please login again.");
        return;
      }

      const res = await fetch(
        `${BASE_URL}/api/admin/wallet/users/${userId}/logs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.status === 403) {
        throw new Error("You are not authorized to view wallet logs");
      }

      if (!res.ok) throw new Error("Failed to fetch wallet logs");

      const data = await res.json();
      setWalletLogs(data || []);
      setWalletBalance(data?.length ? data[0].balanceAfter : 0);

      // Calculate stats
      const credits = data.filter((log) => log.type === "CREDIT");
      const debits = data.filter((log) => log.type === "DEBIT");
      setStats({
        totalCredits: credits.reduce((sum, log) => sum + log.amount, 0),
        totalDebits: debits.reduce((sum, log) => sum + log.amount, 0),
        totalTransactions: data.length,
      });
    } catch (err) {
      console.error("Wallet fetch error:", err.message);
      setWalletLogs([]);
      setWalletBalance(0);
      setStats({ totalCredits: 0, totalDebits: 0, totalTransactions: 0 });
    } finally {
      setLoadingWallet(false);
    }
  };

  const adjustWallet = async () => {
    if (!selectedUser) {
      alert("Please select a user first");
      return;
    }
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (!description.trim()) {
      alert("Description is required");
      return;
    }
    if (type === "DEBIT" && amount > walletBalance) {
      alert(`Insufficient balance. Available: ₹${walletBalance}`);
      return;
    }

    try {
      setAdjusting(true);
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${BASE_URL}/api/admin/wallet/adjust`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: Number(amount),
          type,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAmount("");
      setDescription("");
      await fetchWalletLogs(selectedUser.id);

      // Success notification
      alert(
        `${type === "CREDIT" ? "Credited" : "Debited"} ₹${amount} successfully!`,
      );
    } catch (err) {
      alert(err.message || "Wallet update failed");
    } finally {
      setAdjusting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <div className="container mx-auto px-6 py-8 min-w-full">
        {/* ===== PAGE HEADER ===== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/settings")}
                className="group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-emerald-500/10 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
              </button>

              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                <Wallet className="w-8 h-8 text-emerald-400" />
              </div>

              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  User Wallet Management
                </h1>
                <p className="text-gray-400 mt-1">
                  Manage user wallets, track transactions, and adjust balances
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* ===== USER SEARCH CARD ===== */}
          <div className="lg:col-span-2 bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <User className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Select User</h2>
                <p className="text-gray-400 text-sm">
                  Search for a user to manage their wallet
                </p>
              </div>
            </div>

            <AdminUserSearch
              BASE_URL={BASE_URL}
              onUserSelect={(user) => {
                setSelectedUser(user);
                fetchWalletLogs(user.id);
              }}
            />

            {selectedUser && (
              <div className="mb-2 mt-2">
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-800/20 border border-gray-700/50 rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <User className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </h3>
                        <p className="text-gray-400">{selectedUser.email}</p>
                        <p className="text-sm text-gray-500">
                          ID: {selectedUser.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="text-center p-4 bg-gray-800/50 rounded-xl min-w-[180px]">
                        <p className="text-sm text-gray-400 mb-1">
                          Current Balance
                        </p>
                        <p className="text-3xl font-bold text-emerald-300">
                          {formatCurrency(walletBalance || 0)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Available to spend
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===== QUICK STATS ===== */}
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Wallet Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Credits</p>
                    <p className="text-lg font-semibold text-emerald-400">
                      {formatCurrency(stats.totalCredits)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Debits</p>
                    <p className="text-lg font-semibold text-red-400">
                      {formatCurrency(stats.totalDebits)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Transactions</p>
                    <p className="text-lg font-semibold">
                      {stats.totalTransactions}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SELECTED USER INFO ===== */}
        {selectedUser && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* ===== ADJUST WALLET FORM ===== */}
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  Adjust Wallet Balance
                </h3>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <DollarSign className="w-5 h-5 text-gray-500" />
                      </div>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-10 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Transaction Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setType("CREDIT")}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                          type === "CREDIT"
                            ? "bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400"
                            : "bg-gray-800/50 border border-gray-700 text-gray-400 hover:bg-gray-800"
                        }`}
                      >
                        <PlusCircle className="w-5 h-5" />
                        Credit
                      </button>
                      <button
                        type="button"
                        onClick={() => setType("DEBIT")}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                          type === "DEBIT"
                            ? "bg-red-500/20 border-2 border-red-500/50 text-red-400"
                            : "bg-gray-800/50 border border-gray-700 text-gray-400 hover:bg-gray-800"
                        }`}
                      >
                        <MinusCircle className="w-5 h-5" />
                        Debit
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Description
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                      </div>
                      <textarea
                        placeholder="Enter transaction description (required)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full pl-10 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={adjustWallet}
                    disabled={adjusting}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all ${
                      adjusting
                        ? "bg-gray-700 cursor-not-allowed"
                        : type === "CREDIT"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                          : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    }`}
                  >
                    {adjusting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        {type === "CREDIT" ? (
                          <PlusCircle className="w-6 h-6" />
                        ) : (
                          <MinusCircle className="w-6 h-6" />
                        )}
                        {type === "CREDIT" ? "Credit Wallet" : "Debit Wallet"}
                      </>
                    )}
                  </button>

                  {type === "DEBIT" && amount > walletBalance && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 text-sm">
                        Warning: Debit amount exceeds available balance
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ===== TRANSACTION HISTORY ===== */}
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    Transaction History
                  </h3>
                  <span className="text-sm text-gray-400">
                    {walletLogs.length} transactions
                  </span>
                </div>

                {loadingWallet ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                  </div>
                ) : walletLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-300 mb-2">
                      No Transactions Yet
                    </h4>
                    <p className="text-gray-500">
                      This user hasn't made any wallet transactions
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {walletLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800/70 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                log.type === "CREDIT"
                                  ? "bg-emerald-500/20"
                                  : "bg-red-500/20"
                              }`}
                            >
                              {log.type === "CREDIT" ? (
                                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                            <div>
                              <span
                                className={`font-medium ${
                                  log.type === "CREDIT"
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {log.type}
                              </span>
                              <p className="text-sm text-gray-400">
                                {formatDate(log.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-lg font-semibold ${
                                log.type === "CREDIT"
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {log.type === "CREDIT" ? "+" : "-"}
                              {formatCurrency(log.amount)}
                            </p>
                            <p className="text-sm text-gray-400">
                              Balance: {formatCurrency(log.balanceAfter)}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mt-2 pl-11">
                          {log.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ===== EMPTY STATE ===== */}
        {!selectedUser && (
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-300 mb-3">
              Select a User to Begin
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Search for a user above to view their wallet balance, transaction
              history, and manage their funds.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default UsersWalletPage;
