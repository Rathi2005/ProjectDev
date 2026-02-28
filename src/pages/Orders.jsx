import React, { useState, useEffect, useMemo } from "react";
import Header from "../components/user/Header";
import PaymentFlow from "../components/payment/PaymentFlow";
import CouponAndWallet from "../components/payment/CouponAndWallet";
import UpgradeModal from "../components/payment/UpgradeModal";
import PaymentModal from "../components/payment/PaymentModal";
import SortIcon from "../components/SortIcon";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// hooks
import useSortableData from "../hooks/useSortableData";

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
  Key,
  Play,
  Square,
  RefreshCw,
  Zap,
  Copy,
  Terminal,
  Monitor,
  HardDrive,
  Clock,
  Shield,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Lock,
  ShieldOff,
} from "lucide-react";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [powerLoading, setPowerLoading] = useState({});
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [passwordInputs, setPasswordInputs] = useState({});
  const [accountStatus, setAccountStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [vmLockStatus, setVmLockStatus] = useState({});
  const [passwordLoading, setPasswordLoading] = useState({});

  const navigate = useNavigate();

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

  const [vmPasswords, setVmPasswords] = useState({});
  const [passwordVisible, setPasswordVisible] = useState({});
  const [passwordFetching, setPasswordFetching] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [retryOrder, setRetryOrder] = useState(null);
  const [showRetryPayment, setShowRetryPayment] = useState(false);

  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const [copiedIp, setCopiedIp] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  useEffect(() => {
    if (!orders.length) return;

    const token = localStorage.getItem("token");

    orders.forEach(async (order) => {
      const vmId = order.originalData?.vmId || order.id;

      try {
        const res = await fetch(`${BASE_URL}/api/vms/${vmId}/lock-status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();

        setVmLockStatus((prev) => ({
          ...prev,
          [vmId]: data,
        }));
      } catch (err) {
        console.error("Failed to fetch lock status", err);
      }
    });
  }, [orders, BASE_URL]);

  const isVmLocked = (order) => {
    const vmId = order.originalData?.vmId || order.id;
    return vmLockStatus[vmId]?.isLocked;
  };

  useEffect(() => {
    const checkAccountStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${BASE_URL}/api/user/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch account status");

        const data = await res.json();
        setAccountStatus(data);
      } catch (err) {
        console.error("Account status check failed", err);
      } finally {
        setStatusLoading(false);
      }
    };

    checkAccountStatus();
  }, [BASE_URL]);

  const isWindows = navigator.userAgent.toLowerCase().includes("windows");

  const handleSSH = (order) => {
    const username = getDefaultUsername(order.osType);
    const command = `ssh ${username}@${order.ipAddress}`;

    if (isWindows) {
      toast.success("SSH command copied! Paste in PowerShell or CMD.");
      navigator.clipboard.writeText(command);
    } else {
      window.location.href = `ssh://${username}@${order.ipAddress}`;
    }
  };

  // Fetch User Orders from API
  useEffect(() => {
    if (statusLoading) return;
    if (accountStatus?.isLocked) {
      setLoading(false);
      return;
    }
    async function fetchUserOrders() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("No authentication token found");
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/api/users/orders/my-orders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        // Transform the data to match our expected structure
        const transformedOrders = Array.isArray(data)
          ? data.map((item) => ({
              id: item.vmId,
              orderId: item.orderId,
              vmName: item.vmName,
              status: item.status,
              liveState: item.liveState,
              ipAddress: item.ipAddress,
              createdAt: item.billing?.boughtAt,
              planType: item.billing?.planType,
              priceTotal: item.billing?.monthlyPlan,
              cores: item.specs?.cores,
              ramMb: item.specs?.ramMb,
              diskGb: item.specs?.diskGb,
              osType: item.specs?.osType,
              expiresAt: item.billing?.expiresAt,
              durationMonths: item.billing?.durationMonths,
              serverLocation: item.serverLocation,
              isProtected: item.isProtected,
              originalData: item,
              isoName: item.specs?.isoName,
            }))
          : [];

        setOrders(transformedOrders);
      } catch (err) {
        toast.error("Error fetching user orders");
      } finally {
        setLoading(false);
      }
    }

    fetchUserOrders();
  }, [BASE_URL, statusLoading, accountStatus]);

  // Filter orders based on selected status
  const filteredOrders = useMemo(() => {
    if (selectedStatus === "ALL") return orders;
    return orders.filter(
      (order) => order.status?.toUpperCase() === selectedStatus.toUpperCase(),
    );
  }, [orders, selectedStatus]);

  const { sortedItems, requestSort, sortConfig } =
    useSortableData(filteredOrders);

  const handleCouponApply = async (couponCode) => {
    if (priceLoading) return false;
    try {
      setPriceLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          orderAmount: priceBreakdown?.originalAmount ?? 0,
        }),
      });

      if (!res.ok) throw new Error("Invalid coupon");

      const data = await res.json();
      console.log(data);

      if (!data.valid) {
        throw new Error("Coupon not valid");
      }

      // APPLY COUPON HERE
      setPriceBreakdown((prev) => {
        const updated = {
          ...prev,
          couponCode: data.code,
          discountAmount: data.discountAmount,
          payableAmount: data.finalAmount,
          couponStatus: "APPLIED",
        };
        return updated;
      });
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setPriceLoading(false);
    }
  };

  const getDefaultUsername = (osType) => {
    if (!osType) return "root";

    const normalized = osType.toUpperCase();

    if (normalized === "WINDOWS") return "Administrator";

    return "root"; // all Linux types
  };

  const renderSortIcon = (columnKey) => {
    // Not currently sorted column
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="w-3 h-3 ml-1 text-gray-600 opacity-40" />;
    }

    // Active sorted column
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3 ml-1 text-indigo-600" />
    ) : (
      <ChevronDown className="w-3 h-3 ml-1 text-indigo-600" />
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);

      if (params.get("payment") === "success") {
        DarkSwal.fire({
          icon: "success",
          title: "Payment Successful",
          text: "Your plan has been updated successfully. It will be visible in a few moments.",
        });

        // remove ?payment=success from URL
        window.history.replaceState({}, "", "/orders");
      }
    }, 2000);
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
        url = `${BASE_URL}/api/users/${userId}/vms/${vmId}/rebuild?isoId=${isoId}`;
      } else {
        url = `${BASE_URL}/api/users/${userId}/vms/${vmId}/control?action=${action}`;
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

      setOrders((prev) =>
        prev.map((o) =>
          o.id === vmId
            ? {
                ...o,
                orderId: o.orderId,
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
            : o,
        ),
      );

      if (action === "stop") {
        setPasswordVisible((prev) => ({
          ...prev,
          [vmId]: false,
        }));
      }
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

  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig]);

  const createRetryPaymentSession = async (order) => {
    const token = localStorage.getItem("token");
    const paymentOrderId = order.orderId ?? order.originalData?.orderId;

    const res = await fetch(
      `${BASE_URL}/api/user/payments/${paymentOrderId}/retry`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Unable to retry payment");
    }

    const data = await res.json();

    if (!data.paymentSessionId) {
      throw new Error("Payment session not received");
    }

    return data.paymentSessionId; // ✅ IMPORTANT
  };

  const calculateRenewalPrice = async (couponCode = null) => {
    if (!upgradeVm) return null;

    try {
      setPriceLoading(true);

      const token = localStorage.getItem("token");

      const payload = {
        vmId: upgradeVm.id,
        planType: upgradeVm.planType || "SHARED",
        cpuPriceId: selectedCpu,
        ramPriceId: selectedRam,
        diskPriceId: selectedDisk,
        bandwidthPriceId: selectedBandwidth,
        monthsToAdd: addMonths,
        couponCode,
      };

      const res = await fetch(
        `${BASE_URL}/api/billing/price/calculate-renewal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to calculate price");
      }

      const data = await res.json();
      setPriceBreakdown(data);

      return data; // ✅ IMPORTANT
    } catch (err) {
      toast.error(err.message);
      return null;
    } finally {
      setPriceLoading(false);
    }
  };

  // Derived values for pagination
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentOrders = sortedItems.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    if (!expandedRow) return;

    const order = orders.find((o) => o.id === expandedRow);
    if (!order) return;

    const vmId = order.originalData?.vmId || order.id;

    // fetch only if not already loaded
    if (!vmPasswords.hasOwnProperty(vmId)) {
      fetchVmPassword(order);
    }
  }, [expandedRow, orders]);

  const preparePayment = async () => {
    const result = await calculateRenewalPrice(); // waits
    if (!result) return;

    setShowPaymentFlow(true); // ✅ open AFTER price exists
  };

  const fetchBasicIsos = async (serverId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${BASE_URL}/api/users/servers/${serverId}/isos/basic`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
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

        didOpen: () => {
          const select = Swal.getInput();
          if (select) {
            // Style the select box
            select.style.backgroundColor = "#151c2f";
            select.style.color = "#e5e7eb";
            select.style.border = "1px solid #4f46e5";
            select.style.borderRadius = "6px";
            select.style.padding = "10px";

            // 🔹 THIS is the part you were looking for
            select.querySelectorAll("option").forEach((opt) => {
              opt.style.background = "#151c2f";
              opt.style.color = "#e5e7eb";
            });
          }
        },

        inputValidator: (value) => {
          if (!value) return "Please select an ISO";
        },
      });

      if (!isoId) return;

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

  const fetchVmPassword = async (order) => {
    const token = localStorage.getItem("token");
    const userId = order.originalData?.userId;
    const vmId = order.originalData?.vmId || order.id; // Add fallback

    if (!userId || !vmId) {
      toast.error("Cannot fetch password: missing server information");
      return;
    }

    if (order.liveState?.toUpperCase() !== "RUNNING") {
      return;
    }

    try {
      setPasswordFetching((p) => ({ ...p, [vmId]: true }));

      const res = await fetch(
        `${BASE_URL}/api/users/${userId}/vms/${vmId}/password`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Password not set");
      }

      const data = await res.json();

      setVmPasswords((p) => ({
        ...p,
        [vmId]: data.password || null,
      }));

      setPasswordVisible((p) => ({ ...p, [vmId]: false }));
    } catch (err) {
      setVmPasswords((p) => ({ ...p, [vmId]: null }));
      toast.error("Password not set");
    } finally {
      setPasswordFetching((p) => ({ ...p, [vmId]: false }));
    }
  };

  const isRebuildBlockedTime = () => {
    const hourIST = Number(
      new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      }).format(new Date()),
    );

    return hourIST >= 9 && hourIST < 11;
  };

  const canViewPassword = (order) =>
    order.status === "ACTIVE" && order.liveState?.toUpperCase() === "RUNNING";

  const togglePasswordView = (order) => {
    const vmId = order.originalData?.vmId || order.id; // Add fallback

    if (!vmPasswords.hasOwnProperty(vmId)) {
      fetchVmPassword(order);
    } else {
      setPasswordVisible((p) => ({
        ...p,
        [vmId]: !p[vmId],
      }));
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

  const handleCopy = (text, vmId) => {
    navigator.clipboard.writeText(text);

    setCopiedIp(vmId);

    setTimeout(() => {
      setCopiedIp(null);
    }, 2000);
  };

  const statusOptions = [
    { value: "ALL", label: "All Servers" },
    { value: "ACTIVE", label: "Active" },
    { value: "STOPPED", label: "Stopped" },
    { value: "PENDING_PAYMENT", label: "Pending" },
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
    const vmId = order.originalData?.vmId || order.id;

    const strongPasswordPattern =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!password) {
      toast.error("Password is required.");
      return;
    }

    if (!strongPasswordPattern.test(password)) {
      toast.error(
        "Password must be at least 8 characters long and include uppercase, lowercase, special character and number.",
      );
      return;
    }

    const userId = order.originalData.userId;

    try {
      setPasswordLoading((prev) => ({ ...prev, [vmId]: true }));

      const res = await fetch(
        `${BASE_URL}/api/users/${userId}/vms/${vmId}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to save password");
      }

      toast.success("Password saved successfully");

      // Update UI immediately (NO reload)
      setVmPasswords((prev) => ({ ...prev, [vmId]: password }));
      setPasswordVisible((prev) => ({ ...prev, [vmId]: true }));

      // Auto-hide after 10 seconds
      setTimeout(() => {
        setPasswordVisible((prev) => ({ ...prev, [vmId]: false }));
      }, 10000);

      // Clear input
      setPasswordInputs((prev) => ({ ...prev, [order.id]: "" }));
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setPasswordLoading((prev) => ({ ...prev, [vmId]: false }));
    }
  };

  const canShowDropdown = (status) => {
    const s = status?.toUpperCase();
    return s === "ACTIVE" || s === "STOPPED" || s === "ERROR";
  };

  const showDetailsModal = (order) => {
    Swal.fire({
      title: "Server Details",
      html: `
      <div class="text-left">
        <pre class="text-xs bg-[#0b1220] p-4 rounded-lg overflow-auto max-h-[500px] text-gray-200">
${JSON.stringify(order.originalData ?? order, null, 2)}
        </pre>
      </div>
    `,
      width: "850px",
      confirmButtonText: "Close",
      background: "#0e1525",
      color: "#e5e7eb",
      confirmButtonColor: "#4f46e5",
    });
  };

  // Update openUpgradeModal to prepare payment config
  const openUpgradeModal = async (order) => {
    setUpgradeVm(order);
    setUpgradeModalOpen(true); // OPEN FIRST

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/pricing/upgrades/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPricingOptions(data);
    } catch {
      toast.error("Failed to load pricing");
    }
  };

  const createUpgradeSession = async ({ useWallet, couponCode }) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${BASE_URL}/api/vms/renew/${upgradeVm.id}/upgrade-renew`,
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
            useWalletBalance: useWallet,
            couponCode,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        // ✅ CLOSE PAYMENT MODAL FIRST
        setShowPaymentFlow(false);

        // small delay ensures modal unmounts
        setTimeout(() => {
          DarkSwal.fire({
            icon: "error",
            title: "Payment Failed",
            text: data.error || data.message || "Upgrade / renewal failed",
          });
        }, 150);

        return null;
      }

      // Wallet instant success
      if (data.status === "COMPLETED") {
        setShowPaymentFlow(false);

        setTimeout(() => {
          DarkSwal.fire({
            icon: "success",
            title: "Upgrade Successful",
            text: data.message,
          }).then(() => window.location.reload());
        }, 150);

        return null;
      }

      // Payment required
      if (data.paymentSessionId) {
        return data.paymentSessionId;
      }

      throw new Error("Unexpected upgrade response");
    } catch (err) {
      setShowPaymentFlow(false);

      setTimeout(() => {
        DarkSwal.fire({
          icon: "error",
          title: "Payment Failed",
          text: err.message,
        });
      }, 150);

      return null;
    }
  };

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen">
      <Header />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#151c2f",
            color: "#ffffff",
            border: "1px solid #4f46e5",
            borderRadius: "8px",
          },
        }}
      />

      <main className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        {!statusLoading && accountStatus?.isLocked && (
          <div
            className="absolute inset-0 z-[50] bg-black/60 backdrop-blur-md
                  flex items-center justify-center"
          >
            <div className="text-center px-6">
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <Shield className="w-10 h-10 text-red-400 opacity-80" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Account Suspended
              </h2>

              <p className="text-gray-300 max-w-md mx-auto">
                Your services are temporarily stopped by the administrator.
                <br />
                Please contact support for more information.
              </p>
            </div>
          </div>
        )}

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
                  onClick={() =>
                    navigate("/dashboard", {
                      state: { scrollTo: "create-server" },
                    })
                  }
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
                      {sortedItems.length} server
                      {sortedItems.length !== 1 ? "s" : ""} •
                      {
                        filteredOrders.filter(
                          (o) => o.status?.toUpperCase() === "ACTIVE",
                        ).length
                      }{" "}
                      Active •
                      {
                        filteredOrders.filter(
                          (o) => o.status?.toUpperCase() === "STOPPED",
                        ).length
                      }{" "}
                      Stopped
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    Showing {Math.min(startIndex + 1, sortedItems.length)}-
                    {Math.min(startIndex + itemsPerPage, sortedItems.length)}
                    of {sortedItems.length}
                  </div>
                </div>
              </div>

              {sortedItems.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left">
                      <thead className="bg-[#1a2337] text-gray-300 uppercase text-xs">
                        <tr>
                          <th
                            onClick={() => requestSort("vmName")}
                            className="py-3 px-4 cursor-pointer select-none hover:text-indigo-400"
                          >
                            <div className="flex items-center">
                              Server Name
                              <SortIcon
                                columnKey="vmName"
                                sortConfig={sortConfig}
                              />
                            </div>
                          </th>
                          <th className="py-3 px-4 sm:px-6 font-medium">
                            Resources
                          </th>
                          <th className="py-3 px-4 sm:px-6 font-medium">
                            IP Address
                          </th>
                          <th
                            onClick={() => requestSort("expiresAt")}
                            className="py-3 px-4 cursor-pointer select-none hover:text-indigo-400"
                          >
                            <div className="flex items-center">
                              Expire On
                              <SortIcon
                                columnKey="expiresAt"
                                sortConfig={sortConfig}
                              />
                            </div>
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
                                <div className="flex items-center gap-2 text-gray-300">
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
                                {formatDateShort(order.expiresAt)}
                              </td>
                              <td className="py-3 px-4 sm:px-6">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    order.status,
                                  )}`}
                                >
                                  {getStatusText(order.status)}
                                </span>
                              </td>
                              <td className="py-3 px-4 sm:px-6">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getLiveStatusColor(
                                    order.liveState,
                                  )}`}
                                >
                                  {order.liveState?.toUpperCase() || "UNKNOWN"}
                                </span>
                              </td>
                              <td className="py-3 px-4 sm:px-6">
                                <div className="flex items-center gap-2">
                                  {order.status === "PENDING_PAYMENT" ? (
                                    <button
                                      onClick={() => {
                                        setRetryOrder(order);
                                        setShowRetryPayment(true);
                                      }}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700
        text-white rounded-lg text-xs font-semibold transition"
                                    >
                                      Make Payment
                                    </button>
                                  ) : isVmLocked(order) ? (
                                    <div
                                      title={
                                        vmLockStatus[
                                          order.originalData?.vmId || order.id
                                        ]?.message
                                      }
                                      className="p-2 rounded-lg bg-red-900/20 border border-red-900/40"
                                    >
                                      <Lock className="w-4 h-4 text-red-400" />
                                    </div>
                                  ) : (
                                    /* ⬇️ NORMAL EXPAND */
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
                                  )}
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

                                            <div
                                              className={`grid gap-4 ${
                                                order.isProtected
                                                  ? "grid-cols-2"
                                                  : "grid-cols-1"
                                              }`}
                                            >
                                              {" "}
                                              {/* ISO Name */}
                                              <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                  <FileText className="w-4 h-4 text-indigo-400" />
                                                  <span>ISO</span>
                                                </div>
                                                <p className="text-sm font-semibold text-white">
                                                  {order.isoName || "N/A"}
                                                </p>
                                              </div>
                                              {/* Protection Status */}
                                              {order.isProtected && (
                                                <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                    <Shield className="w-4 h-4 text-green-400" />
                                                    <span>Protection</span>
                                                  </div>

                                                  <p className="text-sm font-semibold text-green-400">
                                                    Protected
                                                  </p>
                                                </div>
                                              )}
                                            </div>

                                            <div className="pt-4 border-t border-indigo-900/30">
                                              <button
                                                onClick={() =>
                                                  showDetailsModal(order)
                                                }
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                                              >
                                                <FileText className="w-4 h-4" />
                                                View Full Details
                                              </button>
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
                                                  order.priceTotal,
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
                                                  order.expiresAt,
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
                                                      order.expiresAt,
                                                    )}{" "}
                                                    days
                                                  </span>
                                                </div>
                                              </div>
                                            )}

                                            <div className="pt-3 border-t border-indigo-900/30 space-y-3">
                                              {/* Plan Type */}
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">
                                                  Plan Type
                                                </span>
                                                <span className="px-3 py-1 bg-indigo-900/30 rounded-full text-sm font-medium">
                                                  {order.planType || "Standard"}
                                                </span>
                                              </div>

                                              {/* Server Location */}
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">
                                                  Server Location
                                                </span>
                                                <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm font-medium">
                                                  {order.serverLocation ||
                                                    "Unknown"}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Connection & Controls Card */}
                                        <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] rounded-xl border border-indigo-900/50 p-4 sm:p-6">
                                          {/* Server Password Setup */}

                                          <div className="bg-[#0e1525]/50 border border-indigo-900/40 rounded-lg p-4">
                                            <h4 className="flex text-sm font-semibold text-indigo-300 mb-2">
                                              <Lock className="w-5 h-5 text-red-400 mr-1" />{" "}
                                              Server Access Password
                                            </h4>

                                            <p className="text-xs text-gray-400 mb-3">
                                              Set a password to enable VM
                                              actions and remote access.
                                              <br />
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

                                          {/* VM Password Viewer */}
                                          <div className="bg-[#0e1525]/50 border border-indigo-900/40 rounded-lg p-4 mt-1">
                                            <h4 className="text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                                              <Key className="w-5 h-5 text-yellow-400" />
                                              VM Details
                                            </h4>

                                            <div className="space-y-3 text-sm">
                                              {/* Username */}
                                              <div className="flex items-center">
                                                <span className="text-gray-400">
                                                  Username
                                                </span>
                                                <span className="font-semibold text-white ml-2">
                                                  {getDefaultUsername(
                                                    order.osType,
                                                  )}
                                                </span>
                                              </div>

                                              {/* Password */}
                                              <div className="flex items-center">
                                                <span className="text-gray-400">
                                                  Password
                                                </span>

                                                <div className="flex items-center justify-between ml-2 w-full">
                                                  {/* Password / Status */}
                                                  <div>
                                                    {(() => {
                                                      const vmId =
                                                        order.originalData
                                                          ?.vmId || order.id;

                                                      return passwordFetching[
                                                        vmId
                                                      ] ? (
                                                        <span className="text-gray-400 text-sm">
                                                          Loading...
                                                        </span>
                                                      ) : vmPasswords[vmId] ? (
                                                        <code className="bg-[#151c2f] px-1 py-1 rounded font-mono text-white">
                                                          {passwordVisible[vmId]
                                                            ? vmPasswords[vmId]
                                                            : "••••••••"}
                                                        </code>
                                                      ) : (
                                                        <span className="text-sm text-red-400">
                                                          Password not set
                                                        </span>
                                                      );
                                                    })()}
                                                  </div>

                                                  {/* Eye Button */}
                                                  {(() => {
                                                    const vmId =
                                                      order.originalData
                                                        ?.vmId || order.id;
                                                    return (
                                                      <button
                                                        onClick={() =>
                                                          canViewPassword(
                                                            order,
                                                          ) &&
                                                          togglePasswordView(
                                                            order,
                                                          )
                                                        }
                                                        disabled={
                                                          !canViewPassword(
                                                            order,
                                                          )
                                                        }
                                                        className={`p-1.5 rounded transition
          ${
            canViewPassword(order)
              ? "hover:bg-indigo-900/30"
              : "opacity-40 cursor-not-allowed"
          }`}
                                                      >
                                                        <Eye className="w-4 h-4 text-indigo-400" />
                                                      </button>
                                                    );
                                                  })()}
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-3 mt-4 sm:mb-6">
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
                                                        order.ipAddress,
                                                        order.id,
                                                      )
                                                    }
                                                    className="text-sm flex items-center gap-1 transition-all"
                                                  >
                                                    {copiedIp === order.id ? (
                                                      <>
                                                        <Copy className="w-4 h-4 text-indigo-400" />
                                                        <span className="text-indigo-400 font-medium">
                                                          Copied
                                                        </span>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <Copy className="w-4 h-4 text-indigo-400" />
                                                        <span className="text-indigo-400 hover:text-indigo-300">
                                                          Copy
                                                        </span>
                                                      </>
                                                    )}
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
                                                <div className="grid grid-cols-3 gap-3">
                                                  {/* SSH */}
                                                  <button
                                                    onClick={() =>
                                                      handleSSH(order)
                                                    }
                                                    className="flex items-center justify-center gap-2 p-3 bg-[#0e1525]
   hover:bg-indigo-900/20 border border-indigo-900/50
   rounded-lg text-indigo-300 text-sm transition-colors"
                                                  >
                                                    <Terminal className="w-4 h-4" />
                                                    SSH
                                                  </button>
                                                  {/* Console */}
                                                  <button
                                                    onClick={() =>
                                                      toast.success(
                                                        "Console access would open here",
                                                      )
                                                    }
                                                    className="flex items-center justify-center gap-2 p-3 bg-[#0e1525]
                   hover:bg-indigo-900/20 border border-indigo-900/50
                   rounded-lg text-indigo-300 text-sm transition-colors"
                                                  >
                                                    <Monitor className="w-4 h-4" />
                                                    Console
                                                  </button>

                                                  {/* Performance */}
                                                  <button
                                                    onClick={() =>
                                                      navigate(
                                                        `/user/vms/${order.id}/performance`,
                                                        {
                                                          state: {
                                                            userId:
                                                              order.originalData
                                                                .userId,
                                                            serverId:
                                                              order.originalData
                                                                .serverId,
                                                            vmName:
                                                              order.vmName,
                                                          },
                                                        },
                                                      )
                                                    }
                                                    className="flex items-center justify-center gap-2 p-3 bg-indigo-600
                   hover:bg-indigo-700 text-white rounded-lg text-sm
                   font-semibold transition-colors"
                                                  >
                                                    <Activity className="w-4 h-4" />
                                                    Performance
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
                                                      "start",
                                                    )
                                                  }
                                                  disabled={
                                                    !canAction(
                                                      order.liveState,
                                                      "start",
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
                                                      "stop",
                                                    )
                                                  }
                                                  disabled={
                                                    !canAction(
                                                      order.liveState,
                                                      "stop",
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
                                                      "reboot",
                                                    )
                                                  }
                                                  disabled={
                                                    !canAction(
                                                      order.liveState,
                                                      "reboot",
                                                    ) || powerLoading[order.id]
                                                  }
                                                  className="flex items-center justify-center gap-2 p-2 bg-purple-900/30 hover:bg-purple-900/50 disabled:opacity-50 text-purple-300 rounded text-sm transition-colors"
                                                >
                                                  <RefreshCw className="w-4 h-4" />
                                                  Reboot
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    if (
                                                      isRebuildBlockedTime()
                                                    ) {
                                                      Swal.fire({
                                                        icon: "warning",
                                                        title:
                                                          "Maintenance Window",
                                                        text: "Rebuild is disabled between 9 AM and 11 AM (IST)",
                                                        background: "#0e1525",
                                                        color: "#e5e7eb",
                                                      });
                                                      return;
                                                    }
                                                    promptRebuildWithIso(order);
                                                  }}
                                                  disabled={
                                                    powerLoading[order.id] ||
                                                    isRebuildBlockedTime()
                                                  }
                                                  title={
                                                    isRebuildBlockedTime()
                                                      ? "Rebuild disabled from 9 AM to 11 AM"
                                                      : "Rebuild server"
                                                  }
                                                  className={`flex items-center justify-center gap-2 p-2 rounded text-sm transition
    ${
      isRebuildBlockedTime()
        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
        : "bg-orange-900/30 hover:bg-orange-900/50 text-orange-300"
    }`}
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
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-4 sm:p-6 border-t border-indigo-900/30">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-400">
                          Showing {startIndex + 1} to{" "}
                          {Math.min(
                            startIndex + itemsPerPage,
                            sortedItems.length,
                          )}{" "}
                          of {sortedItems.length} servers
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
                    onClick={() =>
                      navigate("/dashboard", {
                        state: { scrollTo: "create-server" },
                      })
                    }
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600
             hover:from-indigo-700 hover:to-purple-700
             text-white rounded-lg font-medium transition-all hover:scale-105"
                  >
                    Create Your First Server
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        pricingOptions={pricingOptions}
        selectedCpu={selectedCpu}
        setSelectedCpu={setSelectedCpu}
        selectedRam={selectedRam}
        setSelectedRam={setSelectedRam}
        selectedDisk={selectedDisk}
        setSelectedDisk={setSelectedDisk}
        selectedBandwidth={selectedBandwidth}
        setSelectedBandwidth={setSelectedBandwidth}
        addMonths={addMonths}
        setAddMonths={setAddMonths}
        onContinue={preparePayment}
        priceLoading={priceLoading}
      />

      <PaymentModal
        open={showPaymentFlow}
        onClose={() => setShowPaymentFlow(false)}
        priceBreakdown={priceBreakdown}
        priceLoading={priceLoading}
        onCreateSession={createUpgradeSession}
        onCouponApply={handleCouponApply}
      />

      {showRetryPayment && retryOrder && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm
                  flex items-center justify-center p-4"
        >
          <div
            className="bg-[#0e1525] w-full max-w-md rounded-xl
                    border border-indigo-900/50"
          >
            <div
              className="p-6 border-b border-indigo-900/40
                      flex justify-between items-center"
            >
              <h2 className="text-lg font-bold text-white">Complete Payment</h2>
              <button
                onClick={() => setShowRetryPayment(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <PaymentFlow
                onCreateSession={() => createRetryPaymentSession(retryOrder)}
                onClose={() => {
                  setShowRetryPayment(false);
                  window.location.reload(); // optional
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
