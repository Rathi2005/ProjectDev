import React, { useState, useEffect, useMemo } from "react";
import Header from "../components/user/Header";
import PaymentFlow from "../components/payment/PaymentFlow";
import Swal from "sweetalert2";

import {
  Cpu,
  MemoryStick,
  Server,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  Wifi,
  Calendar,
  IndianRupee,
  Power,
  Play,
  Square,
  RefreshCw,
  Moon,
  Zap,
  Copy,
  Terminal,
  Monitor,
  HardDrive,
  Clock,
  Shield,
  AlertCircle,
  X,
} from "lucide-react";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [powerLoading, setPowerLoading] = useState({});
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [passwordInputs, setPasswordInputs] = useState({});
  const [passwordLoading, setPasswordLoading] = useState({});

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Repayment
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeVm, setUpgradeVm] = useState(null);
  const [pricingOptions, setPricingOptions] = useState(null);

  const [selectedCpu, setSelectedCpu] = useState(null);
  const [selectedRam, setSelectedRam] = useState(null);
  const [selectedDisk, setSelectedDisk] = useState(null);
  const [selectedBandwidth, setSelectedBandwidth] = useState(null);
  const [addMonths, setAddMonths] = useState(0);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Fetch User Orders from API
  useEffect(() => {
    async function fetchUserOrders() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No authentication token found");
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/users/orders/my-orders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          console.error("Unauthorized — invalid or expired token");
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        // Transform the data to match our expected structure
        const transformedOrders = Array.isArray(data)
          ? data.map((order) => ({
              id: order.vmId,
              vmName: order.vmName,
              status: order.status,
              liveState: order.liveState,
              ipAddress: order.ipAddress,
              createdAt: order.billing?.boughtAt,
              planType: order.billing?.planType,
              priceTotal: order.billing?.totalPaidAmount,
              cores: order.specs?.cores,
              ramMb: order.specs?.ramMb,
              diskGb: order.specs?.diskGb,
              expiresAt: order.billing?.expiresAt,
              durationMonths: order.billing?.durationMonths,
              // Keep original data for reference
              originalData: order,
            }))
          : [];

        setOrders(transformedOrders);
      } catch (err) {
        console.error("Error fetching user orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserOrders();
  }, [BASE_URL]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);

      if (params.get("payment") === "success") {
        DarkSwal.fire({
          icon: "success",
          title: "Payment Successful 🎉",
          text: "Your plan has been updated successfully. It will be visible in a few moments.",
        });

        // remove ?payment=success from URL
        window.history.replaceState({}, "", "/orders");
      }
    }, 2000); // ⏱️ 2 seconds delay
    return () => clearTimeout(timer);
  }, []);

  const DarkSwal = Swal.mixin({
    background: "#0e1525",
    color: "#e5e7eb",
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#334155",
  });

  const handlePowerAction = async (order, action, isoId = null) => {
    const token = localStorage.getItem("token");
    if (!token) {
      DarkSwal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Please login again to continue.",
      }).then(() => {
        window.location.href = "/login";
      });

      window.location.href = "/login";
      return;
    }

    const vmId = order.originalData.vmId;
    const userId = order.originalData.userId;

    try {
      setPowerLoading((prev) => ({ ...prev, [vmId]: action }));

      let url = "";
      let method = "POST";

      if (action === "rebuild") {
        // ✅ Separate rebuild API
        url = `${BASE_URL}/users/${userId}/vms/${vmId}/rebuild?isoId=${isoId}`;
      } else {
        // ✅ Normal power actions
        url = `${BASE_URL}/users/${userId}/vms/${vmId}/control?action=${action}`;
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Power action failed");
      }

      DarkSwal.fire({
        icon: "success",
        title: "Request Sent",
        text: `${action.toUpperCase()} request sent successfully.`,
      });

      // ✅ Optimistic UI update
      setOrders((prev) =>
        prev.map((o) =>
          o.id === vmId
            ? {
                ...o,
                status:
                  action === "start"
                    ? "ACTIVE"
                    : action === "stop"
                    ? "STOPPED"
                    : action === "reboot"
                    ? "REBOOTING"
                    : action === "rebuild"
                    ? "PROVISIONING"
                    : o.status,
                liveState:
                  action === "start"
                    ? "RUNNING"
                    : action === "stop"
                    ? "STOPPED"
                    : action === "reboot"
                    ? "REBOOTING"
                    : o.liveState,
              }
            : o
        )
      );
    } catch (err) {
      DarkSwal.fire({
        icon: "error",
        title: "Action Failed",
        text: err.message,
      });
    } finally {
      setPowerLoading((prev) => ({ ...prev, [vmId]: null }));
    }
  };

  // Filter orders based on selected status
  const filteredOrders = useMemo(() => {
    if (selectedStatus === "ALL") return orders;
    return orders.filter(
      (order) => order.status?.toUpperCase() === selectedStatus.toUpperCase()
    );
  }, [orders, selectedStatus]);

  // Derived values for pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const preparePayment = () => {
    if (!selectedCpu || !selectedRam || !selectedDisk || !selectedBandwidth) {
      DarkSwal.fire({
        icon: "error",
        title: "Incomplete Selection",
        text: "Please select all resource options.",
      });

      return;
    }

    setShowPaymentFlow(true);
  };

  const fetchBasicIsos = async (serverId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${BASE_URL}/users/servers/${serverId}/isos/basic`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to fetch ISOs");
    }

    return await res.json(); // [{ id, iso }]
  };

  const promptRebuildWithIso = async (order) => {
    try {
      const serverId = order.originalData.serverId; // adjust if different
      const userId = order.originalData.userId;

      const isos = await fetchBasicIsos(serverId);

      if (!isos.length) {
        Swal.fire({
          icon: "warning",
          title: "No ISOs Available",
          background: "#0e1525",
          color: "#e5e7eb",
        });
        return;
      }

      const isoOptions = {};
      isos.forEach((i) => {
        isoOptions[i.id] = i.iso;
      });

      const { value: isoId } = await Swal.fire({
        title: "Rebuild Server",
        text: "⚠️ Rebuild will erase all data. Select an ISO to continue.",
        input: "select",
        inputOptions: isoOptions,
        inputPlaceholder: "Select ISO",
        showCancelButton: true,
        confirmButtonText: "Rebuild",
        cancelButtonText: "Cancel",
        background: "#0e1525",
        color: "#e5e7eb",
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#334155",
        inputValidator: (value) => {
          if (!value) return "Please select an ISO";
        },
      });

      if (!isoId) return;

      // 🔥 Call rebuild API
      await handlePowerAction(order, "rebuild", isoId);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Rebuild Failed",
        text: err.message,
        background: "#0e1525",
        color: "#e5e7eb",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "text-green-400 bg-green-400/10 border border-green-400/20";
      case "PENDING_PAYMENT":
      case "PENDING":
        return "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20";
      case "CREATING":
      case "PROVISIONING":
        return "text-blue-400 bg-blue-400/10 border border-blue-400/20";
      case "FAILED":
      case "ERROR":
        return "text-red-400 bg-red-400/10 border border-red-400/20";
      case "EXPIRED":
        return "text-orange-400 bg-orange-400/10 border border-orange-400/20";
      case "CANCELLED":
        return "text-red-500 bg-red-500/10 border border-red-500/20";
      case "STOPPED":
        return "text-gray-400 bg-gray-700/10 border border-gray-700/20";
      case "REBOOTING":
        return "text-purple-400 bg-purple-400/10 border border-purple-400/20";
      default:
        return "text-gray-400 bg-gray-700/10 border border-gray-700/20";
    }
  };

  const getLiveStatusColor = (status) => {
    const normalized = normalizeLiveStatus(status);
    switch (normalized) {
      case "RUNNING":
        return "text-green-400 bg-green-400/10 border border-green-400/20";
      case "STOPPED":
        return "text-gray-400 bg-gray-400/10 border border-gray-400/20";
      case "REBOOTING":
        return "text-purple-400 bg-purple-400/10 border border-purple-400/20";
      case "HIBERNATED":
        return "text-indigo-400 bg-indigo-400/10 border border-indigo-400/20";
      case "PAUSED":
        return "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20";
      default:
        return "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20";
    }
  };

  const normalizeLiveStatus = (status) => {
    if (!status) return "UNKNOWN";
    return status.toUpperCase();
  };

  const canAction = (liveStatus, action) => {
    const status = normalizeLiveStatus(liveStatus);
    const rules = {
      RUNNING: ["stop", "reboot", "hibernate"],
      STOPPED: ["start"],
      REBOOTING: [],
      UNKNOWN: [],
    };
    return rules[status]?.includes(action) ?? false;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "Active";
      case "PENDING_PAYMENT":
        return "Payment Pending";
      case "PENDING":
        return "Pending";
      case "CREATING":
        return "Creating";
      case "PROVISIONING":
        return "Provisioning";
      case "FAILED":
        return "Failed";
      case "EXPIRED":
        return "Expired";
      case "CANCELLED":
        return "Cancelled";
      case "STOPPED":
        return "Stopped";
      case "REBOOTING":
        return "Rebooting";
      default:
        return status || "Unknown";
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    DarkSwal.fire({
      icon: "success",
      title: "Copied",
      text: "Copied to clipboard successfully.",
    });
  };

  const statusOptions = [
    { value: "ALL", label: "All Servers" },
    { value: "ACTIVE", label: "Active" },
    { value: "STOPPED", label: "Stopped" },
    { value: "PENDING", label: "Pending" },
    { value: "CREATING", label: "Creating" },
    { value: "FAILED", label: "Failed" },
  ];

  // Calculate days remaining until expiration
  const getDaysRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    return Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
  };

  // -------------- billing state --------------
  const getBillingState = (expiresAt) => {
    const days = getDaysRemaining(expiresAt);

    if (days > 7) return "ACTIVE";
    if (days > 0) return "EXPIRING_SOON";
    if (days === 0) return "EXPIRED";
    if (days >= -3) return "GRACE";
    return "DESTROY_PENDING";
  };

  // ------------- Renew Button Config -------------
  const getRenewButtonConfig = (expiresAt) => {
    const state = getBillingState(expiresAt);

    switch (state) {
      case "ACTIVE":
        return { label: "Extend Plan", color: "bg-indigo-600" };
      case "EXPIRING_SOON":
        return { label: "Renew Now", color: "bg-yellow-600" };
      case "EXPIRED": // on expiry day
        return { label: "Pay to Reactivate", color: "bg-red-600" };
      case "GRACE": // within 3 days after expiry
        return { label: "Pay & Restore", color: "bg-orange-600" };
      case "DESTROY_PENDING":
        return null; // hide button
      default:
        return null;
    }
  };

  // ------------- Handle Save Password -------------
  const handleSavePassword = async (order) => {
    const token = localStorage.getItem("token");
    const password = passwordInputs[order.id];

    if (!password || password.length < 6 || !/^[a-zA-Z0-9]+$/.test(password)) {
      alert("Password must be alphanumeric and at least 6 characters long");
      return;
    }

    const userId = order.originalData.userId;
    const vmId = order.originalData.vmId;

    try {
      setPasswordLoading((prev) => ({ ...prev, [vmId]: true }));

      const res = await fetch(
        `${BASE_URL}/users/${userId}/vms/${vmId}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to save password");
      }

      alert("✅ Password saved successfully");

      // Optional: clear input after save
      setPasswordInputs((prev) => ({ ...prev, [order.id]: "" }));
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setPasswordLoading((prev) => ({ ...prev, [vmId]: false }));
    }
  };

  const canShowDropdown = (status) => {
    const s = status?.toUpperCase();
    return s === "ACTIVE" || s === "STOPPED";
  };

  // Update openUpgradeModal to prepare payment config
  const openUpgradeModal = async (order) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/pricing/upgrades/${order.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load pricing");

      const data = await res.json();
      console.log(data);

      setUpgradeVm(order);
      setPricingOptions(data);

      // Set defaults
      setSelectedCpu(data.cpuOptions?.[0]?.tier.id ?? null);
      setSelectedRam(data.ramOptions?.[0]?.tier.id ?? null);
      setSelectedDisk(data.diskOptions?.[0]?.tier.id ?? null);
      setSelectedBandwidth(data.bandwidthOptions?.[0]?.tier.id ?? null);
      setAddMonths(1); // Default to 1 month

      setUpgradeModalOpen(true);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Unable to Load Upgrade Options",
        text: err.message,
        background: "#0e1525",
        color: "#e5e7eb",
      });
    }
  };

  const createUpgradeSession = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${BASE_URL}/vms/renew/${upgradeVm.id}/upgrade-renew`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planType: upgradeVm.planType || "DEDICATED",
          cpuPriceId: selectedCpu,
          ramPriceId: selectedRam,
          diskPriceId: selectedDisk,
          bandwidthPriceId: selectedBandwidth,
          addMonths,
        }),
      }
    );

    if (!res.ok) throw new Error("Failed to initiate payment");

    const data = await res.json();
    if (!data.paymentSessionId) {
      throw new Error("Payment session not received");
    }
    return data.paymentSessionId;
  };

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen">
      <Header />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
              <p className="text-gray-400">Loading your servers...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <a className="text-gray-400 text-sm mt-1" href="/dashboard">
                  ← Back to dashboard
                </a>
                <br />
                <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">
                  My Servers
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Manage and monitor your virtual machines
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Status Filter */}
                <div className="flex items-center gap-2 bg-[#151c2f] border border-indigo-900/50 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-transparent text-sm text-white outline-none appearance-none"
                  >
                    {statusOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-[#151c2f]"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={() => (window.location.href = "/create-server")}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Server className="w-4 h-4" />
                  New Server
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2.5 border border-indigo-900/50 hover:bg-indigo-900/20 text-indigo-300 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Servers Table */}
            <div className="bg-[#151c2f] border border-indigo-900/30 rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-indigo-900/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-white">
                      Virtual Machines
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      {filteredOrders.length} server
                      {filteredOrders.length !== 1 ? "s" : ""} •
                      {
                        filteredOrders.filter(
                          (o) => o.status?.toUpperCase() === "ACTIVE"
                        ).length
                      }{" "}
                      Active •
                      {
                        filteredOrders.filter(
                          (o) => o.status?.toUpperCase() === "STOPPED"
                        ).length
                      }{" "}
                      Stopped
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    Showing {Math.min(startIndex + 1, filteredOrders.length)}-
                    {Math.min(startIndex + itemsPerPage, filteredOrders.length)}{" "}
                    of {filteredOrders.length}
                  </div>
                </div>
              </div>

              {filteredOrders.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left">
                      <thead className="bg-[#1a2337] text-gray-300 uppercase text-xs">
                        <tr>
                          <th className="py-3 px-4 sm:px-6 font-medium">
                            Server Name
                          </th>
                          <th className="py-3 px-4 sm:px-6 font-medium">
                            Resources
                          </th>
                          <th className="py-3 px-4 sm:px-6 font-medium">
                            IP Address
                          </th>
                          <th className="py-3 px-4 sm:px-6 font-medium">
                            Created
                          </th>
                          <th className="py-3 px-4 sm:px-6 font-medium">
                            Status
                          </th>
                          <th className="py-3 px-4 sm:px-6 font-medium">
                            Live Status
                          </th>
                          <th className="py-3 px-4 sm:px-6 font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {currentOrders.map((order) => (
                          <React.Fragment key={order.id}>
                            {/* Main Row */}
                            <tr className="border-t border-indigo-900/20 hover:bg-indigo-900/10 transition-all">
                              <td className="py-3 px-4 sm:px-6">
                                {canShowDropdown(order.status) ? (
                                  <button
                                    onClick={() => toggleRow(order.id)}
                                    className="text-left w-full flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors"
                                  >
                                    {expandedRow === order.id ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                    <div className="flex items-center gap-2">
                                      <Server className="w-4 h-4 text-gray-400" />
                                      <div>
                                        <p className="font-medium text-sm">
                                          {order.vmName || `Server-${order.id}`}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          {order.planType || "Standard"}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <Server className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <p className="font-medium text-sm">
                                        {order.vmName || `Server-${order.id}`}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {order.planType || "Standard"}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 sm:px-6">
                                <div className="text-xs">
                                  <div className="flex items-center gap-1">
                                    <Cpu className="w-3 h-3 text-gray-400" />
                                    <span>{order.cores || 0} vCPU</span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <MemoryStick className="w-3 h-3 text-gray-400" />
                                    <span>
                                      {order.ramMb
                                        ? `${order.ramMb / 1024}GB`
                                        : "0GB"}{" "}
                                      RAM
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 sm:px-6">
                                {order.ipAddress ? (
                                  <div className="flex items-center gap-1">
                                    <Wifi className="w-3 h-3 text-gray-400" />
                                    <code className="text-xs font-mono bg-[#0e1525] px-2 py-1 rounded">
                                      {order.ipAddress}
                                    </code>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    Not assigned
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 sm:px-6 text-xs">
                                {formatDateShort(order.createdAt)}
                              </td>
                              <td className="py-3 px-4 sm:px-6">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {getStatusText(order.status)}
                                </span>
                              </td>
                              <td className="py-3 px-4 sm:px-6">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getLiveStatusColor(
                                    order.liveState
                                  )}`}
                                >
                                  {order.liveState?.toUpperCase() || "UNKNOWN"}
                                </span>
                              </td>
                              <td className="py-3 px-4 sm:px-6">
                                <div className="flex items-center gap-2">
                                  {canAction(
                                    order.liveState,
                                    normalizeLiveStatus(order.liveState) ===
                                      "RUNNING"
                                      ? "stop"
                                      : "start"
                                  ) && (
                                    <button
                                      onClick={() =>
                                        handlePowerAction(
                                          order,
                                          normalizeLiveStatus(
                                            order.liveState
                                          ) === "RUNNING"
                                            ? "stop"
                                            : "start"
                                        )
                                      }
                                      disabled={powerLoading[order.id]}
                                      className="p-1.5 hover:bg-indigo-900/30 rounded-lg transition-colors"
                                      title={
                                        normalizeLiveStatus(order.liveState) ===
                                        "RUNNING"
                                          ? "Stop"
                                          : "Start"
                                      }
                                    >
                                      {normalizeLiveStatus(order.liveState) ===
                                      "RUNNING" ? (
                                        <Square className="w-4 h-4 text-red-400" />
                                      ) : (
                                        <Play className="w-4 h-4 text-green-400" />
                                      )}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => toggleRow(order.id)}
                                    className="p-1.5 hover:bg-indigo-900/30 rounded-lg transition-colors"
                                    title={
                                      expandedRow === order.id
                                        ? "Collapse"
                                        : "Expand"
                                    }
                                  >
                                    {expandedRow === order.id ? (
                                      <ChevronUp className="w-4 h-4 text-indigo-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-indigo-400" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {/* Expanded Details */}
                            {canShowDropdown(order.status) &&
                              expandedRow === order.id && (
                                <tr className="bg-[#0f172a] border-t border-indigo-900/30">
                                  <td colSpan="7" className="p-0">
                                    <div className="p-4 sm:p-6">
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {/* Server Specifications Card */}
                                        <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] rounded-xl border border-indigo-900/50 p-4 sm:p-6">
                                          <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                            <div className="p-2 bg-indigo-900/30 rounded-lg">
                                              <Server className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-indigo-300">
                                              Server Specifications
                                            </h3>
                                          </div>

                                          <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                  <Cpu className="w-4 h-4" />
                                                  <span>CPU Cores</span>
                                                </div>
                                                <p className="text-xl font-bold text-white">
                                                  {order.cores || 0}
                                                  <span className="text-sm text-gray-400 ml-1">
                                                    cores
                                                  </span>
                                                </p>
                                              </div>

                                              <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                  <MemoryStick className="w-4 h-4" />
                                                  <span>RAM</span>
                                                </div>
                                                <p className="text-xl font-bold text-white">
                                                  {order.ramMb
                                                    ? `${order.ramMb / 1024}`
                                                    : 0}
                                                  <span className="text-sm text-gray-400 ml-1">
                                                    GB
                                                  </span>
                                                </p>
                                              </div>
                                            </div>

                                            <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                <HardDrive className="w-4 h-4" />
                                                <span>Storage</span>
                                              </div>
                                              <p className="text-xl font-bold text-white">
                                                {order.diskGb || 0}
                                                <span className="text-sm text-gray-400 ml-1">
                                                  GB SSD
                                                </span>
                                              </p>
                                            </div>

                                            <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                <Activity className="w-4 h-4" />
                                                <span>VM ID</span>
                                              </div>
                                              <p className="text-sm font-semibold text-white font-mono">
                                                #{order.id}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Billing Details Card */}
                                        <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] rounded-xl border border-indigo-900/50 p-4 sm:p-6">
                                          <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                            <div className="p-2 bg-indigo-900/30 rounded-lg">
                                              <FileText className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-indigo-300">
                                              Billing Details
                                            </h3>
                                          </div>

                                          <div className="space-y-4">
                                            <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                <IndianRupee className="w-4 h-4" />
                                                <span>Monthly Cost</span>
                                              </div>
                                              <p className="text-2xl font-bold text-emerald-300">
                                                {formatCurrency(
                                                  order.priceTotal
                                                )}
                                              </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                  <Calendar className="w-4 h-4" />
                                                  <span>Created</span>
                                                </div>
                                                <p className="text-sm font-medium text-white">
                                                  {formatDate(order.createdAt)}
                                                </p>
                                              </div>

                                              <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                  <Calendar className="w-4 h-4" />
                                                  <span>Expires</span>
                                                </div>
                                                <p className="text-sm font-medium text-white">
                                                  {formatDate(order.expiresAt)}
                                                </p>
                                              </div>
                                            </div>

                                            {(() => {
                                              const renewConfig =
                                                getRenewButtonConfig(
                                                  order.expiresAt
                                                );
                                              return (
                                                renewConfig && (
                                                  <button
                                                    onClick={() =>
                                                      openUpgradeModal(order)
                                                    }
                                                    className={`mt-4 w-full text-white px-4 py-2 rounded-lg text-sm font-semibold ${renewConfig.color}`}
                                                  >
                                                    {renewConfig.label}
                                                  </button>
                                                )
                                              );
                                            })()}

                                            {order.expiresAt && (
                                              <div className="pt-3 border-t border-indigo-900/30">
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-yellow-400" />
                                                    <span className="text-sm text-gray-400">
                                                      Days Remaining
                                                    </span>
                                                  </div>
                                                  <span className="text-lg font-bold text-white">
                                                    {getDaysRemaining(
                                                      order.expiresAt
                                                    )}{" "}
                                                    days
                                                  </span>
                                                </div>
                                              </div>
                                            )}

                                            <div className="pt-3 border-t border-indigo-900/30">
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">
                                                  Plan Type
                                                </span>
                                                <span className="px-3 py-1 bg-indigo-900/30 rounded-full text-sm font-medium">
                                                  {order.planType || "Standard"}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Connection & Controls Card */}
                                        <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] rounded-xl border border-indigo-900/50 p-4 sm:p-6">
                                          {/* Server Password Setup */}
                                          <div className="bg-[#0e1525]/50 border border-indigo-900/40 rounded-lg p-4">
                                            <h4 className="text-sm font-semibold text-indigo-300 mb-2">
                                              🔐 Server Access Password
                                            </h4>

                                            <p className="text-xs text-gray-400 mb-3">
                                              Set a password to enable VM
                                              actions and remote access.
                                              <br />
                                              <span className="text-yellow-400">
                                                Alphanumeric • Minimum 6
                                                characters
                                              </span>
                                            </p>

                                            <div className="flex gap-2">
                                              <input
                                                type="password"
                                                placeholder="Enter password"
                                                value={
                                                  passwordInputs[order.id] || ""
                                                }
                                                onChange={(e) =>
                                                  setPasswordInputs((prev) => ({
                                                    ...prev,
                                                    [order.id]: e.target.value,
                                                  }))
                                                }
                                                className="flex-1 bg-[#151c2f] border border-indigo-900/50 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                                              />

                                              <button
                                                onClick={() =>
                                                  handleSavePassword(order)
                                                }
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-semibold"
                                              >
                                                Save
                                              </button>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                            <div className="p-2 bg-indigo-900/30 rounded-lg">
                                              <Zap className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-indigo-300">
                                              Connection & Controls
                                            </h3>
                                          </div>

                                          <div className="space-y-4">
                                            {order.ipAddress && (
                                              <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-3">
                                                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                    <Wifi className="w-4 h-4" />
                                                    <span>IP Address</span>
                                                  </div>
                                                  <button
                                                    onClick={() =>
                                                      handleCopy(
                                                        order.ipAddress
                                                      )
                                                    }
                                                    className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                                  >
                                                    <Copy className="w-4 h-4" />
                                                    Copy
                                                  </button>
                                                </div>
                                                <code className="text-base font-mono text-white break-all">
                                                  {order.ipAddress}
                                                </code>
                                              </div>
                                            )}

                                            {/* Connection Buttons */}
                                            {order.ipAddress &&
                                              order.liveState?.toUpperCase() ===
                                                "RUNNING" && (
                                                <div className="grid grid-cols-2 gap-3">
                                                  <a
                                                    href={`ssh://root@${order.ipAddress}`}
                                                    className="flex items-center justify-center gap-2 p-3 bg-[#0e1525] hover:bg-indigo-900/20 border border-indigo-900/50 rounded-lg text-indigo-300 text-sm transition-colors"
                                                  >
                                                    <Terminal className="w-4 h-4" />
                                                    SSH Connection
                                                  </a>
                                                  <button
                                                    onClick={() =>
                                                      alert(
                                                        "Console access would open here"
                                                      )
                                                    }
                                                    className="flex items-center justify-center gap-2 p-3 bg-[#0e1525] hover:bg-indigo-900/20 border border-indigo-900/50 rounded-lg text-indigo-300 text-sm transition-colors"
                                                  >
                                                    <Monitor className="w-4 h-4" />
                                                    Console Access
                                                  </button>
                                                </div>
                                              )}

                                            {/* Power Controls */}
                                            <div className="pt-3 border-t border-indigo-900/30">
                                              <h4 className="text-sm font-semibold text-white mb-3">
                                                Power Controls
                                              </h4>
                                              <div className="grid grid-cols-2 gap-2">
                                                <button
                                                  onClick={() =>
                                                    handlePowerAction(
                                                      order,
                                                      "start"
                                                    )
                                                  }
                                                  disabled={
                                                    !canAction(
                                                      order.liveState,
                                                      "start"
                                                    ) || powerLoading[order.id]
                                                  }
                                                  className="flex items-center justify-center gap-2 p-2 bg-green-900/30 hover:bg-green-900/50 disabled:opacity-50 text-green-300 rounded text-sm transition-colors"
                                                >
                                                  <Play className="w-4 h-4" />
                                                  Start
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    handlePowerAction(
                                                      order,
                                                      "stop"
                                                    )
                                                  }
                                                  disabled={
                                                    !canAction(
                                                      order.liveState,
                                                      "stop"
                                                    ) || powerLoading[order.id]
                                                  }
                                                  className="flex items-center justify-center gap-2 p-2 bg-red-900/30 hover:bg-red-900/50 disabled:opacity-50 text-red-300 rounded text-sm transition-colors"
                                                >
                                                  <Square className="w-4 h-4" />
                                                  Stop
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    handlePowerAction(
                                                      order,
                                                      "reboot"
                                                    )
                                                  }
                                                  disabled={
                                                    !canAction(
                                                      order.liveState,
                                                      "reboot"
                                                    ) || powerLoading[order.id]
                                                  }
                                                  className="flex items-center justify-center gap-2 p-2 bg-purple-900/30 hover:bg-purple-900/50 disabled:opacity-50 text-purple-300 rounded text-sm transition-colors"
                                                >
                                                  <RefreshCw className="w-4 h-4" />
                                                  Reboot
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    promptRebuildWithIso(order)
                                                  }
                                                  disabled={
                                                    powerLoading[order.id]
                                                  }
                                                  className="flex items-center justify-center gap-2 p-2 bg-orange-900/30 hover:bg-orange-900/50 disabled:opacity-50 text-orange-300 rounded text-sm transition-colors"
                                                >
                                                  <AlertCircle className="w-4 h-4" />
                                                  Rebuild
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {upgradeModalOpen && pricingOptions && (
                    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-gradient-to-b from-[#0e1525] to-[#151c2f] w-full max-w-2xl rounded-xl border border-indigo-900/50 shadow-2xl shadow-indigo-900/20 overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-indigo-900/40 flex-shrink-0">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-indigo-900/30 rounded-lg">
                              <Zap className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-white">
                                Upgrade / Extend Plan
                              </h2>
                              <p className="text-sm text-gray-400">
                                Customize your server resources
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Modal Content - Compact layout */}
                        <div className="p-6">
                          {/* Resource Selection Grid - 2 columns */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* CPU */}
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <Cpu className="w-4 h-4" />
                                CPU Cores
                              </label>
                              <select
                                className="w-full bg-[#151c2f] border border-indigo-900/50 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                                value={selectedCpu}
                                onChange={(e) =>
                                  setSelectedCpu(Number(e.target.value))
                                }
                              >
                                {pricingOptions.cpuOptions.map((c) => (
                                  <option
                                    key={c.tier.id}
                                    value={c.tier.id}
                                    className="bg-[#151c2f] text-white"
                                  >
                                    {c.tier.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* RAM */}
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <MemoryStick className="w-4 h-4" />
                                RAM
                              </label>
                              <select
                                className="w-full bg-[#151c2f] border border-indigo-900/50 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                                value={selectedRam}
                                onChange={(e) =>
                                  setSelectedRam(Number(e.target.value))
                                }
                              >
                                {pricingOptions.ramOptions.map((r) => (
                                  <option
                                    key={r.tier.id}
                                    value={r.tier.id}
                                    className="bg-[#151c2f] text-white"
                                  >
                                    {r.tier.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Disk */}
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <HardDrive className="w-4 h-4" />
                                Storage
                              </label>
                              <select
                                className="w-full bg-[#151c2f] border border-indigo-900/50 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                                value={selectedDisk}
                                onChange={(e) =>
                                  setSelectedDisk(Number(e.target.value))
                                }
                              >
                                {pricingOptions.diskOptions.map((d) => (
                                  <option
                                    key={d.tier.id}
                                    value={d.tier.id}
                                    className="bg-[#151c2f] text-white"
                                  >
                                    {d.tier.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Bandwidth */}
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <Wifi className="w-4 h-4" />
                                Bandwidth
                              </label>
                              <select
                                className="w-full bg-[#151c2f] border border-indigo-900/50 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                                value={selectedBandwidth}
                                onChange={(e) =>
                                  setSelectedBandwidth(Number(e.target.value))
                                }
                              >
                                {pricingOptions.bandwidthOptions.map((b) => (
                                  <option
                                    key={b.tier.id}
                                    value={b.tier.id}
                                    className="bg-[#151c2f] text-white"
                                  >
                                    {b.tier.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Duration Input - Compact */}
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Plan Duration</span>
                              </div>
                            </label>

                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    max="12"
                                    value={addMonths}
                                    onChange={(e) =>
                                      setAddMonths(Number(e.target.value))
                                    }
                                    className="w-full bg-[#151c2f] border border-indigo-900/50 rounded-lg p-3 pl-10 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                                    placeholder="Months (0 = upgrade only)"
                                  />
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                  </div>
                                </div>

                                {/* Quick duration buttons */}
                                <div className="flex gap-2 mt-2">
                                  {[0, 1, 3, 6, 12].map((months) => (
                                    <button
                                      key={months}
                                      type="button"
                                      onClick={() => setAddMonths(months)}
                                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                        addMonths === months
                                          ? "border-indigo-500 bg-indigo-900/30 text-white"
                                          : "border-indigo-900/40 text-gray-400 hover:bg-indigo-900/20"
                                      }`}
                                    >
                                      {months === 0
                                        ? "Upgrade only"
                                        : `${months} mo`}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Duration status indicator */}
                              <div
                                className={`p-3 rounded-lg border text-sm min-w-[200px] ${
                                  addMonths === 0
                                    ? "border-indigo-900/40 bg-indigo-900/10 text-indigo-300"
                                    : "border-green-900/40 bg-green-900/10 text-green-300"
                                }`}
                              >
                                {addMonths === 0 ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    <span>
                                      <span className="font-semibold">
                                        Upgrade Only
                                      </span>{" "}
                                      - No plan extension
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>
                                      <span className="font-semibold">
                                        {addMonths} month
                                        {addMonths !== 1 ? "s" : ""} extension
                                      </span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 mt-8">
                            <button
                              onClick={() => setUpgradeModalOpen(false)}
                              className="flex-1 px-4 py-3 border border-gray-600 hover:bg-gray-800/30 text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                            <button
                              onClick={preparePayment}
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                              <>
                                <IndianRupee className="w-4 h-4" />
                                Continue to Payment
                              </>
                            </button>
                          </div>

                          {/* Security Note */}
                          <div className="mt-4 pt-4 border-t border-indigo-900/30">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-green-400" />
                              <p className="text-xs text-gray-400">
                                <span className="text-green-400 font-medium">
                                  Secure payment
                                </span>{" "}
                                powered by Cashfree
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Modal */}
                  {showPaymentFlow && upgradeVm && (
                    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-gradient-to-b from-[#0e1525] to-[#151c2f] w-full max-w-md rounded-xl border border-indigo-900/50 shadow-2xl shadow-indigo-900/20 overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-indigo-900/40 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-900/30 rounded-lg">
                              <IndianRupee className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-white">
                                Complete Payment
                              </h2>
                              <p className="text-sm text-gray-400">
                                {upgradeVm?.vmName || `Server-${upgradeVm?.id}`}
                              </p>
                            </div>
                          </div>

                          {/* ❌ Close Button */}
                          <button
                            onClick={() => {
                              setShowPaymentFlow(false);
                              setUpgradeModalOpen(false);
                            }}
                            className="text-gray-400 hover:text-white transition text-xl leading-none"
                            aria-label="Close modal"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                          {/* Payment Summary */}
                          <div className="mb-6 p-4 bg-indigo-900/10 border border-indigo-900/30 rounded-lg">
                            <h4 className="text-sm font-semibold text-indigo-300 mb-2">
                              Order Summary
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">
                                  Resource Upgrade:
                                </span>
                                <span className="text-white">
                                  {addMonths === 0 ? "Yes" : "No"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">
                                  Plan Extension:
                                </span>
                                <span className="text-white">
                                  {addMonths > 0
                                    ? `${addMonths} month${
                                        addMonths !== 1 ? "s" : ""
                                      }`
                                    : "None"}
                                </span>
                              </div>
                              <div className="pt-2 border-t border-indigo-900/30">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Total:</span>
                                  <span className="text-lg font-bold text-emerald-400">
                                    {/* You can add price calculation here */}
                                    Calculate amount
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* PaymentFlow handles everything */}
                          <div className="p-6">
                            <PaymentFlow
                              onCreateSession={createUpgradeSession}
                              onClose={() => {
                                setShowPaymentFlow(false);
                                setUpgradeModalOpen(false);
                                window.location.reload();
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-4 sm:p-6 border-t border-indigo-900/30">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-400">
                          Showing {startIndex + 1} to{" "}
                          {Math.min(
                            startIndex + itemsPerPage,
                            filteredOrders.length
                          )}{" "}
                          of {filteredOrders.length} servers
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-indigo-900/50 rounded-lg text-indigo-300 hover:bg-indigo-900/20 disabled:opacity-50 text-sm"
                          >
                            Previous
                          </button>

                          <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }

                              return (
                                <button
                                  key={i}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-1 rounded-md border text-sm ${
                                    currentPage === pageNum
                                      ? "bg-indigo-600 border-indigo-600 text-white"
                                      : "border-indigo-900/50 text-gray-400 hover:bg-indigo-900/20"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                              <>
                                <span className="text-gray-500 px-1">...</span>
                                <button
                                  onClick={() => setCurrentPage(totalPages)}
                                  className="px-3 py-1 rounded-md border border-indigo-900/50 text-gray-400 hover:bg-indigo-900/20 text-sm"
                                >
                                  {totalPages}
                                </button>
                              </>
                            )}
                          </div>

                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-indigo-900/50 rounded-lg text-indigo-300 hover:bg-indigo-900/20 disabled:opacity-50 text-sm"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="inline-block p-4 bg-indigo-900/20 rounded-full mb-4">
                    <Server className="w-12 h-12 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {selectedStatus === "ALL"
                      ? "No Servers Yet"
                      : `No ${selectedStatus} Servers`}
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-6">
                    {selectedStatus === "ALL"
                      ? "You haven't created any servers. Deploy your first virtual machine to get started."
                      : `You don't have any servers with ${selectedStatus.toLowerCase()} status.`}
                  </p>
                  <button
                    onClick={() => (window.location.href = "/create-server")}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all hover:scale-105"
                  >
                    Create Your First Server
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
