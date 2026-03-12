import React, { useState, useEffect } from "react";
import {
  Server,
  Play,
  Square,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Cpu,
  MemoryStick,
  HardDrive,
  Globe,
  Calendar,
  User,
  Mail,
  Wifi,
  Eye,
  EyeOff,
  Key,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  HardDriveIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { apiFetch } from "../utils/api";
import Swal from "sweetalert2";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [powerLoading, setPowerLoading] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);
  const [vmDetails, setVmDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  const [isos, setIsos] = useState([]);
  const [selectedVM, setSelectedVM] = useState(null);
  const [selectedIso, setSelectedIso] = useState("");
  const [rebuildLoading, setRebuildLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({});

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // SweetAlert dark theme
  const DarkSwal = Swal.mixin({
    background: "#1e2640",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#4b5563",
    buttonsStyling: true,
  });

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
    // Fetch VM details when expanding
    if (expandedRow !== id) {
      fetchVmDetails(id);
    }
  };

  const togglePassword = (id) => {
    setShowPassword((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getDefaultUsername = (osType) => {
    if (!osType) return "root";

    const normalized = osType.toUpperCase();

    if (normalized === "WINDOWS") return "Administrator";

    return "root";
  };

  // Fetch VMs
  useEffect(() => {
    async function fetchVMs() {
      try {
        const data = await apiFetch("/api/reseller/user/vms");

        const formatted = data.map((vm) => ({
          vmid: vm.vmid,
          id: vm.id,
          dbOrderId: vm.dbOrderId,
          name: vm.name,
          ipAddress: vm.ipAddress,
          os: vm.osName,
          status: vm.status,
          liveState: vm.liveStatus,
          createdAt: vm.assignedTime,
          expiresAt: vm.expiresAt,
          cores: vm.cores,
          ramMb: vm.ramMb,
          diskGb: vm.diskGb,
          monthlyPrice: vm.monthlyPrice,
          totalAmount: vm.totalAmount,
          planType: vm.planType,
          serverId: vm.serverId,
          internalVmid: vm.internalVmid,
          user: {
            firstName: vm.customerName?.split(" ")[0] || "User",
            lastName: vm.customerName?.split(" ").slice(1).join(" ") || "",
            email: vm.customerEmail,
          },
        }));

        setOrders(formatted);
      } catch {
        toast.error("Failed to fetch servers");
      } finally {
        setLoading(false);
      }
    }

    fetchVMs();
  }, []);

  // Fetch VM details
  const fetchVmDetails = async (orderId) => {
    try {
      setLoadingDetails((prev) => ({ ...prev, [orderId]: true }));
      const data = await apiFetch(`/api/reseller/user/vms/${orderId}/details`);

      setVmDetails((prev) => ({
        ...prev,
        [orderId]: {
          cpu: data.cpuCores,
          ram: data.ram,
          storage: data.storage,
          vmid: data.proxmoxVmid,
          os: data.os,
          osType: data.osType,  
          ip: data.ipAddress,
          password: data.password,
        },
      }));
    } catch {
      toast.error("Failed to fetch VM details");
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const updateVmPassword = async (order) => {
    const { value: newPassword } = await DarkSwal.fire({
      title: "Change VM Password",
      input: "password",
      inputLabel: "Enter new password",
      inputPlaceholder: "New password",
      showCancelButton: true,
      confirmButtonText: "Update Password",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value || value.trim() === "") {
          return "New password is required";
        }
      },
    });

    if (!newPassword) return;

    try {
      DarkSwal.fire({
        title: "Updating Password",
        text: "Applying new password...",
        allowOutsideClick: false,
        didOpen: () => DarkSwal.showLoading(),
      });

      const res = await apiFetch(
        `/api/reseller/user/vms/${order.id}/password`,
        {
          method: "POST",
          body: JSON.stringify({
            newPassword: newPassword,
          }),
        },
      );

      DarkSwal.close();

      DarkSwal.fire({
        icon: "success",
        title: "Password Updated",
        text: res.message || "Password updated successfully",
        timer: 3000,
        showConfirmButton: false,
      });

      // update visible password if already shown
      setVmDetails((prev) => ({
        ...prev,
        [order.id]: {
          ...prev[order.id],
          password: newPassword,
        },
      }));
    } catch (err) {
      DarkSwal.fire({
        icon: "error",
        title: "Failed",
        text: err.message || "Password update failed",
      });
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Power actions
  const handlePowerAction = async (order, action) => {
    try {
      setPowerLoading((p) => ({ ...p, [order.id]: action }));

      await apiFetch(`/api/reseller/user/vms/${order.id}/${action}`, {
        method: "POST",
      });

      toast.success(`${action} request sent`);

      setOrders((prev) =>
        prev.map((vm) =>
          vm.id === order.id
            ? {
                ...vm,
                liveState:
                  action === "start"
                    ? "running"
                    : action === "stop"
                      ? "stopped"
                      : "rebooting",
              }
            : vm,
        ),
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPowerLoading((p) => ({ ...p, [order.id]: null }));
    }
  };

  const openRebuildModal = async (order) => {
    try {
      const data = await apiFetch(`/api/reseller/user/vms/${order.id}/isos`);
      setIsos(data);
      setSelectedVM(order);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const startPolling = () => {
    const interval = setInterval(async () => {
      const data = await apiFetch("/api/reseller/user/vms");

      const formatted = data.map((vm) => ({
        vmid: vm.vmid,
        id: vm.id,
        name: vm.name,
        ipAddress: vm.ipAddress,
        os: vm.osName,
        status: vm.status,
        liveState: vm.liveStatus,
        createdAt: vm.assignedTime,
      }));

      setOrders(formatted);

      const rebuilding = formatted.some((vm) =>
        vm.status?.startsWith("REBUILD"),
      );

      if (!rebuilding) clearInterval(interval);
    }, 7000);
  };

  const handleRebuild = async () => {
    if (!selectedIso) {
      toast.error("Please select an OS");
      return;
    }

    try {
      setRebuildLoading(true);

      const res = await apiFetch(
        `/api/reseller/user/vms/${selectedVM.id}/rebuild`,
        {
          method: "POST",
          body: JSON.stringify({
            newIsoId: Number(selectedIso),
          }),
        },
      );

      DarkSwal.fire({
        icon: "success",
        title: "Rebuild Initiated",
        text: res.message || "VM rebuild started successfully",
        timer: 3000,
        showConfirmButton: false,
      });

      setSelectedVM(null);
      startPolling();
    } catch (err) {
      DarkSwal.fire({
        icon: "error",
        title: "Rebuild Failed",
        text: err.message || "Failed to rebuild VM",
      });
    } finally {
      setRebuildLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "text-green-400 bg-green-400/10 border border-green-400/20";
      case "PENDING":
      case "PENDING_PAYMENT":
        return "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20";
      case "CREATING":
        return "text-blue-400 bg-blue-400/10 border border-blue-400/20";
      case "FAILED":
        return "text-red-400 bg-red-400/10 border border-red-400/20";
      case "EXPIRED":
        return "text-orange-400 bg-orange-400/10 border border-orange-400/20";
      case "SUSPENDED":
        return "text-purple-400 bg-purple-400/10 border border-purple-400/20";
      default:
        return "text-gray-400 bg-gray-700/10 border border-gray-700/20";
    }
  };

  const getLiveStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "running":
        return "text-green-400 bg-green-400/10 border border-green-400/20";
      case "stopped":
        return "text-gray-400 bg-gray-400/10 border border-gray-400/20";
      case "rebooting":
        return "text-purple-400 bg-purple-400/10 border border-purple-400/20";
      default:
        return "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20";
    }
  };

  const canAction = (liveStatus, action) => {
    const status = liveStatus?.toLowerCase();

    const rules = {
      running: ["stop", "reboot"],
      stopped: ["start"],
      rebooting: [],
    };

    return rules[status]?.includes(action) ?? false;
  };

  if (loading) {
    return (
      <div className="bg-[#0e1525] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-400">Loading your servers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e2640",
            color: "#fff",
            border: "1px solid rgba(99,102,241,0.3)",
          },
        }}
      />

      <style>{`
        .swal2-popup {
          border-radius: 16px;
          border: 1px solid rgba(99,102,241,0.25);
          box-shadow: 0 0 30px rgba(99,102,241,0.15);
        }
        .swal2-input,
        .swal2-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #e5e7eb;
        }
      `}</style>

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
              <Server className="w-6 h-6 text-white" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              My Servers
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            Total Servers: {orders.length}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-[#151c2f] rounded-xl border border-indigo-900/30">
            <div className="inline-block p-4 bg-indigo-900/20 rounded-full mb-4">
              <Server className="w-12 h-12 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Servers Found
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              You don't have any active servers. Visit our store to purchase
              one.
            </p>
          </div>
        ) : (
          <div className="bg-[#151c2f] border border-indigo-900/30 rounded-xl shadow-lg overflow-hidden">
            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1a2337] text-gray-300 uppercase text-xs">
                  <tr>
                    <th className="py-3 px-6">Server Name</th>
                    <th className="py-3 px-6">OS</th>
                    <th className="py-3 px-6">IP Address</th>
                    <th className="py-3 px-6">Created On</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Live Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <React.Fragment key={order.id}>
                      {/* Main Row */}
                      <tr
                        className={`border-t border-indigo-900/20 hover:bg-indigo-900/10 transition-all cursor-pointer ${
                          expandedRow === order.id ? "bg-indigo-900/10" : ""
                        }`}
                        onClick={() => toggleRow(order.id)}
                      >
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2 text-indigo-300 font-medium">
                            {expandedRow === order.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            <Server className="w-4 h-4" />
                            <span>{order.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <span className="text-sm">{order.os}</span>
                        </td>
                        <td className="py-3 px-6">
                          <code className="bg-[#0e1525] px-2 py-1 rounded text-xs font-mono">
                            {order.ipAddress || "N/A"}
                          </code>
                        </td>
                        <td className="py-3 px-6 text-sm">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getLiveStatusColor(
                              order.liveState,
                            )}`}
                          >
                            {order.liveState?.toUpperCase() || "UNKNOWN"}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedRow === order.id && (
                        <tr className="bg-[#0f172a] border-t border-indigo-900/30">
                          <td colSpan="6" className="p-0">
                            <div className="p-6">
                              {/* Details Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Server Specifications Card */}
                                <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] rounded-xl border border-indigo-900/50 p-6">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-900/30 rounded-lg">
                                      <Server className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-indigo-300">
                                      Server Specifications
                                    </h3>
                                  </div>

                                  {loadingDetails[order.id] ? (
                                    <div className="flex justify-center py-4">
                                      <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                            <Cpu className="w-4 h-4" />
                                            <span>CPU</span>
                                          </div>
                                          <p className="text-xl font-bold text-white">
                                            {vmDetails[order.id]?.cpu ||
                                              order.cores ||
                                              0}
                                            <span className="text-sm text-gray-400 ml-1">
                                              cores
                                            </span>
                                          </p>
                                        </div>

                                        <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                            <MemoryStick className="w-4 h-4" />
                                            <span>RAM</span>
                                          </div>
                                          <p className="text-xl font-bold text-white">
                                            {vmDetails[order.id]?.ram ||
                                              order.ramMb ||
                                              0}
                                            <span className="text-sm text-gray-400 ml-1">
                                              MB
                                            </span>
                                          </p>
                                        </div>
                                      </div>

                                      <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                          <HardDriveIcon className="w-4 h-4" />
                                          <span>Storage</span>
                                        </div>
                                        <p className="text-xl font-bold text-white">
                                          {vmDetails[order.id]?.storage ||
                                            order.diskGb ||
                                            0}
                                          <span className="text-sm text-gray-400 ml-1">
                                            GB SSD
                                          </span>
                                        </p>
                                      </div>

                                      <div className="pt-4 border-t border-indigo-900/30">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-400">
                                            VM ID
                                          </span>
                                          <code className="bg-indigo-900/30 px-3 py-1 rounded text-sm font-mono">
                                            {vmDetails[order.id]?.vmid ||
                                              order.vmid ||
                                              "N/A"}
                                          </code>
                                        </div>
                                      </div>

                                      <div className="pt-4 border-t border-indigo-900/30">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-400">
                                            Plan Type
                                          </span>
                                          <span className="px-3 py-1 bg-indigo-900/30 rounded-full text-xs font-medium">
                                            {order.planType || "Standard"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Access Information Card */}
                                <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] rounded-xl border border-indigo-900/50 p-6">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-900/30 rounded-lg">
                                      <Key className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-indigo-300">
                                      Access Information
                                    </h3>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                        <Wifi className="w-4 h-4" />
                                        <span>IP Address</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <code className="text-white font-mono">
                                          {order.ipAddress || "N/A"}
                                        </code>
                                        {order.ipAddress && (
                                          <button
                                            onClick={() =>
                                              copyToClipboard(order.ipAddress)
                                            }
                                            className="p-1 hover:bg-indigo-600/20 rounded"
                                          >
                                            <Copy className="w-4 h-4 text-gray-400" />
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    <div className="bg-[#0e1525]/50 rounded-lg p-3 space-y-3">
                                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                        <Key className="w-4 h-4" />
                                        <span>Password</span>
                                      </div>

                                      <div className="flex items-center justify-between">
                                        {showPassword[order.id] ? (
                                          <div className="flex items-center gap-2 flex-1">
                                            <code className="text-white font-mono text-sm break-all">
                                              {vmDetails[order.id]?.password}
                                            </code>

                                            <button
                                              onClick={() =>
                                                copyToClipboard(
                                                  vmDetails[order.id]?.password,
                                                )
                                              }
                                              className="p-1 hover:bg-indigo-600/20 rounded"
                                            >
                                              <Copy className="w-4 h-4 text-gray-400" />
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="text-gray-400">
                                            ••••••••
                                          </span>
                                        )}

                                        <button
                                          onClick={() =>
                                            togglePassword(order.id)
                                          }
                                          className="p-1 hover:bg-indigo-600/20 rounded transition"
                                        >
                                          {showPassword[order.id] ? (
                                            <EyeOff className="w-4 h-4 text-indigo-300" />
                                          ) : (
                                            <Eye className="w-4 h-4 text-indigo-300" />
                                          )}
                                        </button>
                                      </div>

                                      {/* CHANGE PASSWORD BUTTON */}
                                      <button
                                        onClick={() => updateVmPassword(order)}
                                        disabled={
                                          order.liveState?.toLowerCase() !==
                                          "running"
                                        }
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 
    bg-indigo-600/20 hover:bg-indigo-600/40 
    text-indigo-300 rounded-md text-xs transition
    disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <Key className="w-4 h-4" />
                                        Change Password
                                      </button>
                                    </div>

                                    <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                        <User className="w-4 h-4" />
                                        <span>Username</span>
                                      </div>
                                      <p className="text-white">
                                        {getDefaultUsername(vmDetails[order.id]?.osType)}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Details Card */}
                                <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] rounded-xl border border-indigo-900/50 p-6 md:col-span-2 lg:col-span-1">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-900/30 rounded-lg">
                                      <Calendar className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-indigo-300">
                                      Order Details
                                    </h3>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                      <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                          <Calendar className="w-4 h-4" />
                                          <span>Created</span>
                                        </div>
                                        <p className="text-sm font-medium text-white">
                                          {formatDate(order.createdAt)}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                        <Globe className="w-4 h-4" />
                                        <span>Operating System</span>
                                      </div>
                                      <p className="text-base font-medium text-white">
                                        {order.os}
                                      </p>
                                    </div>

                                    {order.monthlyPrice > 0 && (
                                      <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                        <span className="text-sm text-gray-400 block mb-1">
                                          Monthly Price
                                        </span>
                                        <p className="text-2xl font-bold text-emerald-300">
                                          {formatCurrency(order.monthlyPrice)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                  onClick={() =>
                                    handlePowerAction(order, "start")
                                  }
                                  disabled={
                                    !canAction(order.liveState, "start") ||
                                    powerLoading[order.id]
                                  }
                                  className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition"
                                >
                                  {powerLoading[order.id] === "start"
                                    ? "Starting..."
                                    : "Start"}
                                </button>

                                <button
                                  onClick={() =>
                                    handlePowerAction(order, "stop")
                                  }
                                  disabled={
                                    !canAction(order.liveState, "stop") ||
                                    powerLoading[order.id]
                                  }
                                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition"
                                >
                                  {powerLoading[order.id] === "stop"
                                    ? "Stopping..."
                                    : "Stop"}
                                </button>

                                <button
                                  onClick={() =>
                                    handlePowerAction(order, "reboot")
                                  }
                                  disabled={
                                    !canAction(order.liveState, "reboot") ||
                                    powerLoading[order.id]
                                  }
                                  className="flex-1 sm:flex-none px-4 py-2 border border-purple-500/30 hover:bg-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-purple-300 rounded-lg font-medium text-sm transition"
                                >
                                  {powerLoading[order.id] === "reboot"
                                    ? "Rebooting..."
                                    : "Reboot"}
                                </button>

                                <button
                                  onClick={() => openRebuildModal(order)}
                                  className="flex-1 sm:flex-none px-4 py-2 border border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-300 rounded-lg font-medium text-sm transition"
                                >
                                  Rebuild
                                </button>

                                <button
                                  onClick={() => fetchVmDetails(order.id)}
                                  className="flex-1 sm:flex-none px-4 py-2 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-300 rounded-lg font-medium text-sm transition"
                                >
                                  <Eye className="w-4 h-4 inline mr-1" />
                                  Refresh Details
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

            {/* Mobile View */}
            <div className="lg:hidden">
              <div className="space-y-4 p-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#1a2337] border border-indigo-900/30 rounded-lg p-4"
                  >
                    <div
                      className="flex justify-between items-start cursor-pointer"
                      onClick={() => toggleRow(order.id)}
                    >
                      <div>
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          <Server className="w-4 h-4 text-indigo-400" />
                          {order.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {order.ipAddress || "No IP"}
                        </p>
                      </div>
                      {expandedRow === order.id ? (
                        <ChevronUp className="w-5 h-5 text-indigo-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <span className="text-gray-400">OS:</span>
                        <p className="text-white">{order.os}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <p
                          className={`font-semibold ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </p>
                      </div>
                    </div>

                    {expandedRow === order.id && (
                      <div className="mt-4 pt-4 border-t border-indigo-900/30">
                        {/* Simplified mobile expanded view */}
                        <div className="space-y-3">
                          <div>
                            <span className="text-gray-400 text-sm">
                              Created:
                            </span>
                            <p className="text-white">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">
                              Expires:
                            </span>
                            <p className="text-white">
                              {formatDate(order.expiresAt)}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <button
                              onClick={() => handlePowerAction(order, "start")}
                              className="px-3 py-1 bg-indigo-600 rounded text-xs"
                            >
                              Start
                            </button>
                            <button
                              onClick={() => handlePowerAction(order, "stop")}
                              className="px-3 py-1 bg-gray-600 rounded text-xs"
                            >
                              Stop
                            </button>
                            <button
                              onClick={() => handlePowerAction(order, "reboot")}
                              className="px-3 py-1 bg-purple-600 rounded text-xs"
                            >
                              Reboot
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Rebuild Modal */}
      {selectedVM && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-[#151c2f] p-6 rounded-xl w-96 border border-indigo-900/50 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-indigo-300">
              Rebuild {selectedVM.name}
            </h2>

            <p className="text-sm text-red-400 mb-4">
              ⚠️ This will erase all data on the server and reinstall the OS.
            </p>

            <select
              className="w-full p-3 bg-[#0e1525] rounded-lg border border-indigo-900/40 text-white mb-4"
              value={selectedIso}
              onChange={(e) => setSelectedIso(e.target.value)}
            >
              <option value="">Select Operating System</option>
              {isos.map((iso) => (
                <option key={iso.id} value={iso.id}>
                  {iso.isoName}
                </option>
              ))}
            </select>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedVM(null);
                  setSelectedIso("");
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRebuild}
                disabled={rebuildLoading || !selectedIso}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition"
              >
                {rebuildLoading ? "Rebuilding..." : "Confirm Rebuild"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
