import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Cpu,
  MemoryStick,
  HardDrive,
  Calendar,
  IndianRupee,
  User,
  Mail,
  MapPin,
  Server,
  FileText,
  Activity,
  CircleAlert,
  Wifi,
  HardDriveIcon,
  Edit,
  Power,
  RefreshCw,
  Shield,
  ShieldOff,
  Trash2,
  Download,
  Copy,
  Globe,
  Layers,
  Database,
  Key,
  Terminal,
  AlertTriangle,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Lock,
  Unlock,
  BarChart,
  Users,
  CreditCard,
  Home,
  Phone,
} from "lucide-react";
import MacAddressManager from "./MacAddressManager";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [powerLoading, setPowerLoading] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [ipChangeLoading, setIpChangeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const DarkSwal = Swal.mixin({
    background: "#1e2640",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#4b5563",
    buttonsStyling: true,
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem("adminToken");

      const res = await fetch(
        `${BASE_URL}/api/admin/vms?dbOrderId=${orderId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );

      if (res.status === 401) {
        DarkSwal.fire({
          icon: "error",
          title: "Unauthorized",
          text: "Please login again",
          timer: 3000,
          showConfirmButton: false,
        });
        navigate("/admin/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch order");

      const data = await res.json();

      // SAME WRAPPER AS OrdersPage
      const orderData = data.vms?.[0];
      if (!orderData) throw new Error("Order not found");

      const transformedOrder = {
        id: orderData.dbOrderId,
        dbOrderId: orderData.dbOrderId,

        serverId: orderData.serverId,
        vmid: orderData.proxmoxVmid,
        internalVmid: orderData.internalVmId,

        monthlyPrice: orderData.monthlyPrice,
        paidAmount: orderData.totalAmount,
        totalAmount: orderData.totalAmount,

        vmName: orderData.vmName,
        isoName: orderData.os,
        planType: orderData.planType,

        cores: orderData.cores,
        ramMb: orderData.ramMb,
        diskGb: orderData.diskGb,

        ipAddress: orderData.ipAddress || "",

        createdAt: orderData.createdAt,
        expiresAt: orderData.expiresAt,

        status: orderData.status,
        liveState: orderData.liveState,

        user: {
          firstName: orderData.customerName || "—",
          lastName: "",
          email: orderData.customerEmail || "—",
          billingAddress: orderData.billingAddress || null,
        },

        originalData: orderData,
      };

      setOrder(transformedOrder);
    } catch (err) {
      toast.error(err.message || "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "SUSPENDED":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "PENDING_PAYMENT":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "MAINTENANCE":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "ERROR":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "EXPIRED":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-700/20 text-gray-300 border-gray-700/30";
    }
  };

  const getLiveStatusColor = (status) => {
    const normalized = normalizeLiveStatus(status);
    switch (normalized) {
      case "START":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "STOP":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "REBOOT":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "HIBERNATE":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "RESUME":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const normalizeLiveStatus = (status) => {
    if (!status) return "UNKNOWN";
    const s = status.toLowerCase();
    if (s === "running") return "START";
    if (s === "stopped") return "STOP";
    if (s === "not_provisioned") return "NOT_PROVISIONED";
    if (s === "hibernated/paused") return "HIBERNATE";
    return "UNKNOWN";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  const handlePowerAction = async (action) => {
    if (!order) return;

    setPowerLoading(true);
    try {
      const adminToken = localStorage.getItem("adminToken");

      DarkSwal.fire({
        title: "Sending Command",
        text: `Sending ${action} command...`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await fetch(
        `${BASE_URL}/api/admin/vms/order/${order.id}/power?action=${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );

      if (!res.ok) throw new Error("Power operation failed");

      DarkSwal.close();
      DarkSwal.fire({
        icon: "success",
        title: "Success",
        text: `VM ${action.toUpperCase()} command sent successfully`,
        timer: 3000,
        showConfirmButton: false,
      });

      // Refresh order details after a delay
      setTimeout(fetchOrderDetails, 2000);
    } catch (err) {
      DarkSwal.fire({
        icon: "error",
        title: "Failed",
        text: `Failed to ${action} VM`,
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setPowerLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleGoBack = () => {
    navigate("/admin/orders");
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: "specs",
      label: "Specifications",
      icon: <Server className="w-4 h-4" />,
    },
    {
      id: "billing",
      label: "Billing",
      icon: <CreditCard className="w-4 h-4" />,
    },
    { id: "customer", label: "Customer", icon: <Users className="w-4 h-4" /> },
    { id: "actions", label: "Actions", icon: <Terminal className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0e1525] to-[#151c2f] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-400 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0e1525] to-[#151c2f] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 bg-red-500/20 rounded-full mb-4">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            The requested order could not be found.
          </p>
          <button
            onClick={handleGoBack}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Go Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e1525] to-[#151c2f] text-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0e1525]/90 backdrop-blur-xl border-b border-indigo-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-indigo-900/30 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  Order #{order.dbOrderId}
                </h1>
                <p className="text-sm text-gray-400">
                  {order.vmName || "Unnamed VM"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
              >
                {order.status}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getLiveStatusColor(order.liveState)}`}
              >
                {normalizeLiveStatus(order.liveState)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-6">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-indigo-900/30 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-900/30 text-gray-400 hover:text-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="w-full space-y-6">
          {/* Left Column - Main Info */}
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-900/20 to-indigo-900/10 border border-indigo-900/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Monthly Price</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(order.monthlyPrice)}
                      </p>
                    </div>
                    <div className="p-2 bg-indigo-900/30 rounded-lg">
                      <IndianRupee className="w-6 h-6 text-indigo-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-900/10 border border-emerald-900/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Paid</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <div className="p-2 bg-emerald-900/30 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-900/20 to-cyan-900/10 border border-cyan-900/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">VM ID</p>
                      <p className="text-2xl font-bold text-white font-mono">
                        {order.vmid || "—"}
                      </p>
                    </div>
                    <div className="p-2 bg-cyan-900/30 rounded-lg">
                      <Database className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* IP Address Card */}
              <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] border border-indigo-900/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-900/30 rounded-lg">
                      <Globe className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        IP Address
                      </h3>
                      <p className="text-sm text-gray-400">
                        Primary network interface
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard(order.ipAddress)}
                    className="px-3 py-1.5 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 rounded-lg text-sm transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-[#0e1525] rounded-lg p-4">
                  <code className="text-2xl font-mono font-bold text-white">
                    {order.ipAddress || "Not assigned"}
                  </code>
                  {order.ipAddress && (
                    <p className="text-sm text-gray-400 mt-2">
                      Access via SSH:{" "}
                      <span className="text-cyan-400">
                        ssh root@{order.ipAddress}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Timelines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] border border-indigo-900/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-900/30 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Created
                      </h3>
                      <p className="text-sm text-gray-400">
                        Order creation date
                      </p>
                    </div>
                  </div>
                  <div className="text-lg font-medium text-white">
                    {formatDate(order.createdAt)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] border border-indigo-900/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-900/30 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Expires
                      </h3>
                      <p className="text-sm text-gray-400">
                        Service expiration date
                      </p>
                    </div>
                  </div>
                  <div className="text-lg font-medium text-white">
                    {formatDate(order.expiresAt) || "No expiration set"}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Specifications Tab */}
          {activeTab === "specs" && (
            <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] border border-indigo-900/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-900/30 rounded-lg">
                  <Server className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Server Specifications
                  </h3>
                  <p className="text-sm text-gray-400">
                    Hardware configuration details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0e1525] rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-900/30 rounded-lg">
                      <Cpu className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">CPU Cores</p>
                      <p className="text-3xl font-bold text-white">
                        {order.cores}
                        <span className="text-sm text-gray-400 ml-1">
                          cores
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0e1525] rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-900/30 rounded-lg">
                      <MemoryStick className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">RAM</p>
                      <p className="text-3xl font-bold text-white">
                        {order.ramMb}
                        <span className="text-sm text-gray-400 ml-1">MB</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0e1525] rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-yellow-900/30 rounded-lg">
                      <HardDriveIcon className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Storage</p>
                      <p className="text-3xl font-bold text-white">
                        {order.diskGb}
                        <span className="text-sm text-gray-400 ml-1">
                          GB SSD
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0e1525] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      Operating System
                    </span>
                  </div>
                  <p className="text-lg font-medium text-white">
                    {order.isoName || "Not specified"}
                  </p>
                </div>

                <div className="bg-[#0e1525] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Plan Type</span>
                  </div>
                  <p className="text-lg font-medium text-white">
                    {order.planType || "Standard"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] border border-indigo-900/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-900/30 rounded-lg">
                  <CreditCard className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Billing Information
                  </h3>
                  <p className="text-sm text-gray-400">
                    Payment and subscription details
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0e1525] rounded-xl p-5">
                    <p className="text-sm text-gray-400 mb-2">
                      Monthly Subscription
                    </p>
                    <p className="text-3xl font-bold text-emerald-400">
                      {formatCurrency(order.monthlyPrice)}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Recurring monthly charge
                    </p>
                  </div>

                  <div className="bg-[#0e1525] rounded-xl p-5">
                    <p className="text-sm text-gray-400 mb-2">
                      Total Amount Paid
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      One-time payment
                    </p>
                  </div>
                </div>

                <div className="bg-[#0e1525] rounded-xl p-5">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Payment History
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-indigo-900/20 rounded-lg">
                      <div>
                        <p className="font-medium text-white">
                          Initial Payment
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-xs text-gray-400">Completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Tab */}
          {activeTab === "customer" && order.user && (
            <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] border border-indigo-900/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Customer Information
                  </h3>
                  <p className="text-sm text-gray-400">
                    Details about the customer
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0e1525] rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-900/30 rounded-lg">
                        <User className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Customer Name</p>
                        <p className="text-xl font-semibold text-white">
                          {order.user.firstName} {order.user.lastName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0e1525] rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-900/30 rounded-lg">
                        <Mail className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email Address</p>
                        <p className="text-xl font-semibold text-white break-all">
                          {order.user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(order.user.email)}
                      className="mt-3 w-full px-3 py-1.5 bg-green-900/20 hover:bg-green-900/30 text-green-400 rounded-lg text-sm transition-colors"
                    >
                      Copy Email
                    </button>
                  </div>
                </div>

                {order.user.billingAddress && (
                  <div className="bg-[#0e1525] rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-900/30 rounded-lg">
                        <Home className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          Billing Address
                        </h4>
                        <p className="text-sm text-gray-400">
                          Customer's registered address
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-white">
                          {order.user.billingAddress.streetAddress}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4" />
                        <span className="text-gray-300">
                          {order.user.billingAddress.city},{" "}
                          {order.user.billingAddress.state}{" "}
                          {order.user.billingAddress.postalCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4" />
                        <span className="text-gray-400">
                          {order.user.billingAddress.country}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === "actions" && (
            <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] border border-indigo-900/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-900/30 rounded-lg">
                  <Terminal className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Administrative Actions
                  </h3>
                  <p className="text-sm text-gray-400">Manage VM operations</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Power Controls */}
                <div className="bg-[#0e1525] rounded-xl p-5">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Power Controls
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={() => handlePowerAction("start")}
                      disabled={powerLoading}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </button>
                    <button
                      onClick={() => handlePowerAction("stop")}
                      disabled={powerLoading}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      Stop
                    </button>
                    <button
                      onClick={() => handlePowerAction("reboot")}
                      disabled={powerLoading}
                      className="px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reboot
                    </button>
                    <button
                      onClick={() => handlePowerAction("hibernate")}
                      disabled={powerLoading}
                      className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Hibernate
                    </button>
                  </div>
                </div>

                {/* Advanced Actions */}
                <div className="bg-[#0e1525] rounded-xl p-5">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Advanced Actions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        /* Add rebuild handler */
                      }}
                      disabled={adminActionLoading}
                      className="px-4 py-3 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/30 text-yellow-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Rebuild VM
                    </button>
                    <button
                      onClick={() => {
                        /* Add termination override handler */
                      }}
                      disabled={adminActionLoading}
                      className="px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 text-purple-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Toggle Protection
                    </button>
                    <button
                      onClick={() => {
                        /* Add IP change handler */
                      }}
                      disabled={ipChangeLoading}
                      className="px-4 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-600/30 text-cyan-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Change IP
                    </button>
                    <MacAddressManager 
                      targetId={order.internalVmid} 
                      onSuccess={fetchOrderDetails} 
                    />
                    <button
                      onClick={() => {
                        /* Add destroy handler */
                      }}
                      disabled={adminActionLoading}
                      className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Destroy VM
                    </button>
                  </div>
                </div>

                {/* Utility Actions */}
                <div className="bg-[#0e1525] rounded-xl p-5">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Utilities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleCopyToClipboard(order.ipAddress)}
                      className="px-4 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-600/30 text-indigo-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy IP
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/admin/vms/${order.internalVmid}/performance`)
                      }
                      className="px-4 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 text-green-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <BarChart className="w-4 h-4" />
                      View Metrics
                    </button>
                    <button
                      onClick={() => {
                        /* Add console access handler */
                      }}
                      className="px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Terminal className="w-4 h-4" />
                      Console Access
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
