import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import {
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Cpu,
  MemoryStick,
  HardDrive,
  Globe,
  Calendar,
  IndianRupee,
  User,
  Mail,
  MapPin,
  Server,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  CircleAlert,
  Wifi,
  HardDriveIcon,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Fetch Orders from API
  useEffect(() => {
    async function fetchOrders() {
      try {
        const adminToken = localStorage.getItem("adminToken");

        const res = await fetch(`${BASE_URL}/admin/vms`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        });

        if (res.status === 401) {
          console.error("Unauthorized — invalid or expired token");
          return;
        }

        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const [powerLoading, setPowerLoading] = useState({});

  const handlePowerAction = async (orderId, action) => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      alert("Admin not authenticated");
      return;
    }

    try {
      setPowerLoading((prev) => ({ ...prev, [orderId]: action }));

      const res = await fetch(
        `${BASE_URL}/admin/vms/order/${orderId}/power?action=${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Power operation failed");
      }

      alert(`✅ VM ${action.toUpperCase()} command sent successfully`);

      // Optional: refresh orders to reflect new state
      // fetchOrders();
    } catch (err) {
      console.error(err);
      alert(`❌ Failed to ${action} VM`);
    } finally {
      setPowerLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  // Dynamic insights calculation
  const insights = useMemo(() => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter(
      (o) => o.status === "ACTIVE" || o.status === "Active"
    ).length;
    const pendingOrders = orders.filter(
      (o) => o.status === "PENDING_PAYMENT" || o.status === "Pending"
    ).length;
    const cancelledOrders = orders.filter((o) =>
      [
        "CANCELLED",
        "Cancelled",
        "EXPIRED",
        "Expired",
        "FAILED",
        "Failed",
      ].includes(o.status)
    ).length;

    const revenue = orders
      .filter((order) => order.status === "ACTIVE" || order.status === "Active")
      .reduce((sum, order) => sum + (order.priceTotal || 0), 0);

    return [
      {
        title: "Total Orders",
        value: totalOrders,
        icon: <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />,
        subtitle: "All time",
        color: "text-indigo-400",
      },
      {
        title: "Active Orders",
        value: activeOrders,
        icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />,
        subtitle: "Currently running",
        color: "text-green-400",
      },
      {
        title: "Pending Orders",
        value: pendingOrders,
        icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />,
        subtitle: "Awaiting payment",
        color: "text-yellow-400",
      },
      {
        title: "Cancelled / Failed",
        value: cancelledOrders,
        icon: <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />,
        subtitle: "Not active",
        color: "text-red-400",
      },
      {
        title: "Total Revenue",
        value: `₹${revenue.toFixed(2)}`,
        icon: (
          <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
        ),
        subtitle: "From active orders",
        color: "text-emerald-400",
      },
    ];
  }, [orders]);

  // Derived values
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "text-green-400 bg-green-400/10 border border-green-400/20";
      case "PENDING_PAYMENT":
      case "PENDING":
        return "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20";
      case "CREATING":
        return "text-blue-400 bg-blue-400/10 border border-blue-400/20";
      case "FAILED":
        return "text-red-400 bg-red-400/10 border border-red-400/20";
      case "EXPIRED":
        return "text-orange-400 bg-orange-400/10 border border-orange-400/20";
      case "CANCELLED":
        return "text-red-500 bg-red-500/10 border border-red-500/20";
      default:
        return "text-gray-400 bg-gray-700/10 border border-gray-700/20";
    }
  };

  const getLiveStatusColor = (status) => {
    switch (status) {
      case "START":
        return "text-green-400 bg-green-400/10 border border-green-400/20";
      case "STOP":
        return "text-gray-400 bg-gray-400/10 border border-gray-400/20";
      case "REBOOT":
        return "text-purple-400 bg-purple-400/10 border border-purple-400/20";
      case "HIBERNATE":
        return "text-indigo-400 bg-indigo-400/10 border border-indigo-400/20";
      case "RESUME":
        return "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20";
      default:
        return "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20";
    }
  };

  const normalizeLiveStatus = (status) => {
    if (!status) return "UNKNOWN";

    const s = status.toLowerCase();

    if (s === "running") return "START";
    if (s === "stopped") return "STOP";
    if (s === "not_provisioned") return "NOT_PROVISIONED";
    if (s === "hibernated/paused") return "HIBERNATE"
    return "UNKNOWN";
  };

  const canAction = (liveStatus, action) => {
    const status = normalizeLiveStatus(liveStatus);

    const rules = {
      START: ["stop", "reboot", "hibernate"],
      STOP: ["start"],
      HIBERNATE: ["resume"],
      RESUME: ["stop"],
      REBOOT: ["start", "stop", "hibernate", "reboot", "resume"],
      NOT_PROVISIONED: [],
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getPaymentMethod = (order) => {
    // Check for payment method in the order data
    if (order.paymentMethod) return order.paymentMethod;
    if (order.user?.paymentMethod) return order.user.paymentMethod;
    return "N/A";
  };

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      <main className="flex-1 mt-[72px] p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">
            Orders Management
          </h1>
          <div className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
              <p className="text-gray-400">Fetching orders...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Insights - Responsive Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              {insights.map((ins, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] border border-indigo-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xs sm:text-sm text-gray-400 font-medium">
                        {ins.title}
                      </h3>
                      <p
                        className={`text-2xl sm:text-3xl font-bold mt-1 ${ins.color}`}
                      >
                        {ins.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {ins.subtitle}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-[#0e1525] rounded-lg sm:rounded-xl border border-indigo-900/40">
                      {ins.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Container */}
            <div className="bg-[#151c2f] border border-indigo-900/30 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mt-6">
              {/* Table Header */}
              <div className="p-4 sm:p-6 border-b border-indigo-900/30">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Order List
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Showing {startIndex + 1}-
                  {Math.min(startIndex + itemsPerPage, orders.length)} of{" "}
                  {orders.length} orders
                </p>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left">
                  <thead className="bg-[#1a2337] text-gray-300 uppercase text-xs sm:text-sm">
                    <tr>
                      <th className="py-3 px-4 sm:px-6">Order ID</th>
                      <th className="py-3 px-4 sm:px-6">Customer</th>
                      <th className="py-3 px-4 sm:px-6">Server</th>
                      <th className="py-3 px-4 sm:px-6">OS</th>
                      <th className="py-3 px-4 sm:px-6">Plan</th>
                      <th className="py-3 px-4 sm:px-6">IP</th>
                      <th className="py-3 px-4 sm:px-6">Created</th>
                      <th className="py-3 px-4 sm:px-6">Price</th>
                      <th className="py-3 px-4 sm:px-6">Status</th>
                      <th className="py-3 px-4 sm:px-6">Live Status</th>
                      <th className="py-3 px-4 sm:px-6">Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        {/* CLICKABLE MAIN ROW */}
                        <tr
                          className={`border-t border-indigo-900/20 hover:bg-indigo-900/10 transition-all ${
                            expandedRow === order.id ? "bg-indigo-900/10" : ""
                          }`}
                        >
                          <td className="py-3 px-4 sm:px-6">
                            <button
                              onClick={() => toggleRow(order.id)}
                              className="text-left w-full flex items-center gap-2 text-indigo-300 font-medium hover:text-indigo-200 transition-colors"
                            >
                              {expandedRow === order.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                              <span>#{String(order.id).slice(0, 8)}...</span>
                            </button>
                          </td>
                          <td className="py-3 px-4 sm:px-6">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm sm:text-base">
                                {order.user?.firstName} {order.user?.lastName}
                              </span>
                              <span className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-[150px]">
                                {order.user?.email}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 sm:px-6">
                            <div className="flex items-center gap-2">
                              <Server className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              <span className="text-sm">{order.planType}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 sm:px-6">
                            <div className="text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px]">
                              {order.isoName}
                            </div>
                          </td>
                          <td className="py-3 px-4 sm:px-6">
                            <span className="px-2 py-1 bg-indigo-900/30 rounded text-xs">
                              {order.planType || "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-4 sm:px-6">
                            <div className="flex items-center gap-1">
                              <Wifi className="w-3 h-3 text-gray-400" />
                              <code className="bg-indigo-900/30 px-2 py-1 rounded text-xs">
                                {order.ipAddress || "N/A"}
                              </code>
                            </div>
                          </td>
                          <td className="py-3 px-4 sm:px-6 text-xs sm:text-sm">
                            {order.createdAt?.split("T")[0]}
                          </td>
                          <td className="py-3 px-4 sm:px-6 font-semibold text-green-300">
                            {formatCurrency(order.priceTotal)}
                          </td>
                          <td className="py-3 px-4 sm:px-6">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 sm:px-6">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getLiveStatusColor(
                                normalizeLiveStatus(order.liveState)
                              )}`}
                            >
                              {normalizeLiveStatus(order.liveState)}
                            </span>
                          </td>
                          <td className="py-3 px-4 sm:px-6">
                            <button
                              onClick={() => toggleRow(order.id)}
                              className="p-1.5 hover:bg-indigo-900/30 rounded-lg transition-colors"
                              title={
                                expandedRow === order.id ? "Collapse" : "Expand"
                              }
                            >
                              {expandedRow === order.id ? (
                                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* EXPANDED DROPDOWN ROW - Responsive */}
                        {expandedRow === order.id && (
                          <tr className="bg-[#0f172a] border-t border-indigo-900/30">
                            <td colSpan="10" className="p-0">
                              <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                  {/* Server Specifications Card */}
                                  <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] rounded-xl border border-indigo-900/50 p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                      <div className="p-2 bg-indigo-900/30 rounded-lg">
                                        <Server className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                                      </div>
                                      <h3 className="text-base sm:text-lg font-semibold text-indigo-300">
                                        Server Specifications
                                      </h3>
                                    </div>

                                    <div className="space-y-3 sm:space-y-4">
                                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                          <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                                            <Cpu className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span>CPU Cores</span>
                                          </div>
                                          <p className="text-lg sm:text-xl font-bold text-white">
                                            {order.cores || 0}
                                            <span className="text-xs sm:text-sm text-gray-400 ml-1">
                                              cores
                                            </span>
                                          </p>
                                        </div>

                                        <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                          <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                                            <MemoryStick className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span>RAM</span>
                                          </div>
                                          <p className="text-lg sm:text-xl font-bold text-white">
                                            {order.ramMb || 0}
                                            <span className="text-xs sm:text-sm text-gray-400 ml-1">
                                              MB
                                            </span>
                                          </p>
                                        </div>
                                      </div>

                                      <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                                          <HardDriveIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                          <span>Storage</span>
                                        </div>
                                        <p className="text-lg sm:text-xl font-bold text-white">
                                          {order.diskGb || 0}
                                          <span className="text-xs sm:text-sm text-gray-400 ml-1">
                                            GB SSD
                                          </span>
                                        </p>
                                      </div>

                                      <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                                          <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                                          <span>Operating System</span>
                                        </div>
                                        <p className="text-sm sm:text-base font-medium text-white truncate">
                                          {order.isoName || "Not specified"}
                                        </p>
                                      </div>

                                      {order.vmid && (
                                        <div className="pt-3 border-t border-indigo-900/30">
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs sm:text-sm text-gray-400">
                                              VM ID
                                            </span>
                                            <code className="bg-indigo-900/30 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-mono">
                                              {order.vmid}
                                            </code>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Order Details Card */}
                                  <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] rounded-xl border border-indigo-900/50 p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                      <div className="p-2 bg-indigo-900/30 rounded-lg">
                                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                                      </div>
                                      <h3 className="text-base sm:text-lg font-semibold text-indigo-300">
                                        Order Details
                                      </h3>
                                    </div>

                                    <div className="space-y-3 sm:space-y-4">
                                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                          <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                                            <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span>Order ID</span>
                                          </div>
                                          <p className="text-sm sm:text-base font-semibold text-white font-mono">
                                            #{order.id}
                                          </p>
                                        </div>

                                        <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                          <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span>Created</span>
                                          </div>
                                          <p className="text-xs sm:text-sm font-medium text-white">
                                            {formatDate(order.createdAt)}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                                          <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                                          <span>Total Amount</span>
                                        </div>
                                        <p className="text-xl sm:text-2xl font-bold text-emerald-300">
                                          {formatCurrency(order.priceTotal)}
                                        </p>
                                      </div>

                                      <div className="pt-3 border-t border-indigo-900/30">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs sm:text-sm text-gray-400">
                                            Plan Type
                                          </span>
                                          <span className="px-2 sm:px-3 py-1 bg-indigo-900/30 rounded-full text-xs sm:text-sm font-medium">
                                            {order.planType || "Standard"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Customer & Billing Card */}
                                  <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] rounded-xl border border-indigo-900/50 p-4 sm:p-6 md:col-span-2 lg:col-span-1">
                                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                      <div className="p-2 bg-indigo-900/30 rounded-lg">
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                                      </div>
                                      <h3 className="text-base sm:text-lg font-semibold text-indigo-300">
                                        Customer Information
                                      </h3>
                                    </div>

                                    <div className="space-y-3 sm:space-y-4">
                                      <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                          <span>Customer Name</span>
                                        </div>
                                        <p className="text-sm sm:text-base font-semibold text-white">
                                          {order.user?.firstName}{" "}
                                          {order.user?.lastName}
                                        </p>
                                      </div>

                                      <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                                          <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                                          <span>Email Address</span>
                                        </div>
                                        <p className="text-sm sm:text-base font-medium text-white break-words">
                                          {order.user?.email || "N/A"}
                                        </p>
                                      </div>

                                      {order.user?.billingAddress && (
                                        <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                          <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-2">
                                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span>Billing Address</span>
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-sm text-white">
                                              {
                                                order.user.billingAddress
                                                  .streetAddress
                                              }
                                            </p>
                                            <p className="text-xs text-gray-300">
                                              {order.user.billingAddress.city},{" "}
                                              {order.user.billingAddress.state}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                              {
                                                order.user.billingAddress
                                                  .country
                                              }
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      {/* Payment Method - Only show if available */}
                                      {getPaymentMethod(order) !== "N/A" && (
                                        <div className="pt-3 border-t border-indigo-900/30">
                                          <div className="flex items-center gap-2">
                                            <CircleAlert className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs sm:text-sm text-gray-400">
                                              Payment Method:{" "}
                                              <span className="text-white">
                                                {getPaymentMethod(order)}
                                              </span>
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons - Responsive */}
                                <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                                  <button
                                    onClick={() =>
                                      handlePowerAction(order.id, "start")
                                    }
                                    disabled={
                                      !canAction(order.liveState, "start") ||
                                      powerLoading[order.id]
                                    }
                                    className="flex-1 sm:flex-none px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm"
                                  >
                                    Start
                                  </button>

                                  <button
                                    onClick={() =>
                                      handlePowerAction(order.id, "stop")
                                    }
                                    disabled={
                                      !canAction(order.liveState, "stop") ||
                                      powerLoading[order.id]
                                    }
                                    className="flex-1 sm:flex-none px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm"
                                  >
                                    Stop
                                  </button>

                                  <button
                                    onClick={() =>
                                      handlePowerAction(order.id, "reboot")
                                    }
                                    disabled={
                                      !canAction(order.liveState, "reboot") ||
                                      powerLoading[order.id]
                                    }
                                    className="flex-1 sm:flex-none px-3 py-2 border border-red-500/30 hover:bg-red-500/10 disabled:opacity-50 text-red-300 rounded-lg font-medium text-sm"
                                  >
                                    Hard Reboot
                                  </button>

                                  <button
                                    className="flex-1 sm:flex-none px-3 py-2 border border-red-500/30 hover:bg-red-500/10 disabled:opacity-50 text-red-300 rounded-lg font-medium text-sm"
                                  >
                                    Easy Reboot
                                  </button>
                                  <button
                                    className="flex-1 sm:flex-none px-3 py-2 border border-red-500/30 hover:bg-red-500/10 disabled:opacity-50 text-red-300 rounded-lg font-medium text-sm"
                                  >
                                    Destroy
                                  </button>
                                  <button
                                    className="flex-1 sm:flex-none px-3 py-2 border border-red-500/30 hover:bg-red-500/10 disabled:opacity-50 text-red-300 rounded-lg font-medium text-sm"
                                  >
                                    Rebuild
                                  </button>

                                  <button
                                    onClick={() =>
                                      handlePowerAction(order.id, "hibernate")
                                    }
                                    disabled={
                                      !canAction(
                                        order.liveState,
                                        "hibernate"
                                      ) || powerLoading[order.id]
                                    }
                                    className="flex-1 sm:flex-none px-3 py-2 border border-indigo-500/30 hover:bg-indigo-500/10 disabled:opacity-50 text-indigo-300 rounded-lg font-medium text-sm"
                                  >
                                    Hibernate
                                  </button>

                                  <button
                                    onClick={() =>
                                      handlePowerAction(order.id, "resume")
                                    }
                                    disabled={
                                      !canAction(order.liveState, "resume") ||
                                      powerLoading[order.id]
                                    }
                                    className="flex-1 sm:flex-none px-3 py-2 border border-indigo-500/30 hover:bg-indigo-500/10 disabled:opacity-50 text-indigo-300 rounded-lg font-medium text-sm"
                                  >
                                    Resume
                                  </button>
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

              {/* Pagination - Responsive */}
              <div className="p-4 sm:p-6 border-t border-indigo-900/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-gray-400">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(startIndex + itemsPerPage, orders.length)} of{" "}
                    {orders.length} entries
                  </p>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 border border-indigo-900/50 rounded-lg text-indigo-300 hover:bg-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => {
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
                            className={`px-2 sm:px-3 py-1 rounded-md border text-xs sm:text-sm ${
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
                            className="px-2 sm:px-3 py-1 rounded-md border border-indigo-900/50 text-gray-400 hover:bg-indigo-900/20 text-xs sm:text-sm"
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
                      className="px-3 sm:px-4 py-1.5 sm:py-2 border border-indigo-900/50 rounded-lg text-indigo-300 hover:bg-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {orders.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-indigo-900/20 rounded-full mb-4">
                  <Package className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Orders Found
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  There are no orders in the system yet. Orders will appear here
                  once customers make purchases.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
