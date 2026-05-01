import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Header from "../components/user/Header";
import PaymentFlow from "../components/payment/PaymentFlow";
import CouponAndWallet from "../components/payment/CouponAndWallet";
import UpgradeModal from "../components/payment/UpgradeModal";
import PaymentModal from "../components/payment/PaymentModal";
import PaytmQRModal from "../components/payment/PaytmQRModal";
import { verifyPayment } from "../services/PaymentService";
import SortIcon from "../components/SortIcon";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";

// hooks — React Query is now the SINGLE SOURCE OF TRUTH for orders
import useSortableData from "../hooks/useSortableData";
import { useUserOrders, USER_ORDERS_QUERY_KEY } from "../hooks/useUserOrders";
import { useDebounce } from "../hooks/useDebounce";
import { fetchUserOrderDetails } from "../api/userMyOrdersApi";

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
  User,
  MapPin,
  Globe,
  HardDriveIcon,
} from "lucide-react";


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
    case "REBOOTING":
      return "text-purple-400 bg-purple-400/10 border border-purple-400/20";
    case "HIBERNATE":
      return "text-indigo-400 bg-indigo-400/10 border border-indigo-400/20";
    case "RESUME":
      return "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20";
    case "STARTING":
    case "STOPPING":
    case "MIGRATING":
    case "REBUILDING":
      return "text-blue-400 bg-blue-400/10 border border-blue-400/20";
    case "SUSPENDED":
      return "text-orange-400 bg-orange-400/10 border border-orange-400/20";
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
  if (s === "hibernated/paused" || s === "hibernated" || s === "paused") return "HIBERNATE";
  if (s === "starting") return "STARTING";
  if (s === "stopping") return "STOPPING";
  if (s === "rebooting") return "REBOOTING";
  if (s === "migrating") return "MIGRATING";
  if (s === "suspended") return "SUSPENDED";
  if (s === "rebuilding") return "REBUILDING";
  return status.toUpperCase();
};

const canAction = (liveStatus, action) => {
  const status = normalizeLiveStatus(liveStatus);
  const rules = {
    START: ["stop", "reboot", "hibernate"],
    STOP: ["start"],
    HIBERNATE: ["resume"],
    RESUME: ["stop"],
    REBOOT: [],
    STARTING: [],
    STOPPING: [],
    REBOOTING: [],
    MIGRATING: [],
    REBUILDING: [],
    SUSPENDED: ["start"],
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
  });
};

const getDaysRemaining = (expiresAt) => {
  if (!expiresAt) return 0;
  const now = new Date();
  const exp = new Date(expiresAt);
  const diffTime = exp - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const getDefaultUsername = (osType) => {
  if (!osType) return "root / Administrator";
  const os = osType.toLowerCase();
  if (os.includes("windows")) return "Administrator";
  return "root";
};

const getRenewButtonConfig = (order) => {
  if (order.status === "ACTIVE") {
    return { label: "Renew / Upgrade", color: "bg-indigo-600 hover:bg-indigo-700" };
  }
  if (order.status === "PENDING_PAYMENT") {
    return { label: "Complete Payment", color: "bg-yellow-600 hover:bg-yellow-700" };
  }
  if (order.status === "EXPIRED") {
    return { label: "Renew Now", color: "bg-orange-600 hover:bg-orange-700" };
  }
  return null;
};

export default function UserOrdersPage() {
  // ─── React Query: SINGLE SOURCE OF TRUTH for orders ─────────────────────
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Search (raw → debounced)
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm.trim(), 500);

  // Pagination (1-based for UI, 0-based sent to API)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [expandedRow, setExpandedRow] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Account status
  const [accountStatus, setAccountStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // ── React Query hook — replaces the old setInterval + useState ──
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isFetching,
    isError,
    error: queryError,
  } = useUserOrders({
    page: currentPage - 1,
    size: itemsPerPage,
    search: debouncedSearch,
    rawSearch: searchTerm,
    enabled: !statusLoading && !accountStatus?.isLocked,
  });

  // Derive from React Query data — NO local orders useState
  // CRITICAL: React Query v5 preserves `data` from the last successful fetch
  // even when a background refetch fails. The `?? []` is a safety net only.
  const orders = ordersData?.orders ?? [];
  const totalPages = ordersData?.totalPages ?? 1;
  const totalItems = ordersData?.totalItems ?? 0;
  const loading = ordersLoading && orders.length === 0;
  const tableLoading = isFetching && orders.length > 0;

  /** Invalidate orders cache — call this after ANY mutation */
  const invalidateOrders = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [USER_ORDERS_QUERY_KEY] });
  }, [queryClient]);

  // ── UI-only state (not data ownership) ──
  const [powerLoading, setPowerLoading] = useState({});
  const [passwordInputs, setPasswordInputs] = useState({});
  const [vmLockStatus, setVmLockStatus] = useState({});
  const [passwordLoading, setPasswordLoading] = useState({});
  const [macLoading, setMacLoading] = useState({});
  const [networkLoading, setNetworkLoading] = useState({});

  // Repayment / upgrade modals
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

  const [retryOrder, setRetryOrder] = useState(null);
  const [showRetryPayment, setShowRetryPayment] = useState(false);

  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const [copiedIp, setCopiedIp] = useState(null);

  const [qrData, setQrData] = useState(null);
  const pollRef = useRef(null);



  // ─── Memoized constants ───────────────────────────────────────────────────
  const isWindows = useMemo(
    () => navigator.userAgent.toLowerCase().includes("windows"),
    [],
  );

  // DarkSwal defined FIRST so all callbacks below can safely reference it
  const DarkSwal = useMemo(
    () =>
      Swal.mixin({
        background: "#0e1525",
        color: "#e5e7eb",
        confirmButtonColor: "#4f46e5",
        cancelButtonColor: "#334155",
      }),
    [],
  );

  // ─── Pure helper callbacks ────────────────────────────────────────────────
  const getDefaultUsername = useCallback((osType) => {
    if (!osType) return "root";
    const normalized = osType.toUpperCase();
    if (normalized.includes("WINDOWS")) return "Administrator";
    return "root";
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatDateShort = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  }, []);

  const formatRamGb = useCallback((ramMb) => {
    const numericRamMb = Number(ramMb);
    if (!Number.isFinite(numericRamMb) || numericRamMb <= 0) return "0";
    return Number((numericRamMb / 1024).toFixed(2)).toString();
  }, []);

  const getStatusText = useCallback((status) => {
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
  }, []);

  const getStatusColor = useCallback((status) => {
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
  }, []);

  const getLiveStatusColor = useCallback((status) => {
    const normalized = status?.toUpperCase();
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
  }, []);

  const canAction = useCallback((liveStatus, action) => {
    const status = liveStatus?.toUpperCase();
    const rules = {
      RUNNING: ["stop", "reboot", "hibernate"],
      STOPPED: ["start"],
      REBOOTING: [],
      UNKNOWN: [],
    };
    return rules[status]?.includes(action) ?? false;
  }, []);

  const getDaysRemaining = useCallback((expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    return Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
  }, []);

  const getBillingState = useCallback(
    (expiresAt) => {
      const days = getDaysRemaining(expiresAt);
      if (days > 7) return "ACTIVE";
      if (days > 0) return "EXPIRING_SOON";
      if (days === 0) return "EXPIRED";
      if (days >= -3) return "GRACE";
      return "DESTROY_PENDING";
    },
    [getDaysRemaining],
  );

  const getRenewButtonConfig = useCallback(
    (order) => {
      if (order.status?.toUpperCase() === "SUSPENDED") {
        return { label: "Repay & Activate", color: "bg-red-600" };
      }

      const state = getBillingState(order.expiresAt);

      switch (state) {
        case "ACTIVE":
          return { label: "Extend Plan", color: "bg-indigo-600" };
        case "EXPIRING_SOON":
          return { label: "Renew Now", color: "bg-yellow-600" };
        case "EXPIRED":
          return { label: "Pay to Reactivate", color: "bg-red-600" };
        case "GRACE":
          return { label: "Pay & Restore", color: "bg-orange-600" };
        case "DESTROY_PENDING":
          return null;
        default:
          return null;
      }
    },
    [getBillingState],
  );

  const isRebuildBlockedTime = useCallback(() => {
    const hourIST = Number(
      new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      }).format(new Date()),
    );
    return hourIST >= 9 && hourIST < 11;
  }, []);

  const canViewPassword = useCallback(
    (order) =>
      order.status === "ACTIVE" && order.liveState?.toUpperCase() === "RUNNING",
    [],
  );

  const isVmLocked = useCallback(
    (order) => {
      const vmId = order.originalData?.vmId || order.id;
      return vmLockStatus[vmId]?.isLocked;
    },
    [vmLockStatus],
  );

  const handleSearch = useCallback(() => {
    // debouncedSearch is now auto-managed by useDebounce hook.
    // Just reset pagination on explicit search action.
    setCurrentPage(1);
  }, []);

  const toggleRow = useCallback(
    async (vmId) => {
      if (expandedRow === vmId) {
        setExpandedRow(null);
        return;
      }
      setExpandedRow(vmId);

      // Fetch details if not already present in cache
      if (!orderDetails[vmId]) {
        setDetailsLoading(true);
        try {
          const details = await fetchUserOrderDetails(vmId);
          setOrderDetails((prev) => ({ ...prev, [vmId]: details }));
        } catch (err) {
          toast.error("Failed to fetch VM details");
          setExpandedRow(null);
        } finally {
          setDetailsLoading(false);
        }
      }
    },
    [expandedRow, orderDetails],
  );

  const handleRefreshSingle = useCallback(async (vmId) => {
    setDetailsLoading(true);
    try {
      const details = await fetchUserOrderDetails(vmId);
      setOrderDetails((prev) => ({ ...prev, [vmId]: details }));
      // Also invalidate main query to sync the table state (e.g. power state)
      invalidateOrders();
    } catch (err) {
      console.error("Manual refresh of details failed", err);
      toast.error("Failed to refresh status");
    } finally {
      setDetailsLoading(false);
    }
  }, [invalidateOrders]);

  const handleRefresh = useCallback(async () => {
    invalidateOrders();
    if (expandedRow) {
      // If a row is expanded, refresh its details too
      const vmId = orders.find(o => o.id === expandedRow)?.originalData?.vmId;
      if (vmId) handleRefreshSingle(vmId);
    }
  }, [expandedRow, orders, invalidateOrders, handleRefreshSingle]);

  const handleCopy = useCallback((text, vmId) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(vmId);
    setTimeout(() => setCopiedIp(null), 2000);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (paymentId) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;

      if (!paymentId) {
        console.error("Cannot start polling: paymentId is undefined");
        return;
      }

      let attempts = 0;
      const maxAttempts = 100; // 5 mins at 3s interval

      pollRef.current = setInterval(async () => {
        try {
          if (attempts >= maxAttempts) {
            stopPolling();
            setQrData(null);
            toast("Payment not confirmed yet. You can retry.");
            return;
          }
          attempts++;
          // D-1 FIX: verifyPayment now validates response shape.
          // ApiError is thrown on HTTP errors or missing `status` field.
          const res = await verifyPayment(paymentId, "PAYTM");

          const successStates = ["SUCCESS", "COMPLETED", "PAID", "WALLET_TOPPED_UP", "PAID_AND_PROVISIONING"];
          const failureStates = ["FAILED", "CANCELLED", "EXPIRED"];

          if (successStates.includes(res.status)) {
            stopPolling();
            toast.success("Payment successful");
            setQrData(null);
            invalidateOrders();
            return;
          }

          if (failureStates.includes(res.status)) {
            stopPolling();
            setQrData(null);
            toast.error(`Payment ${res.status.toLowerCase()}`);
            return;
          }
        } catch (err) {
          // D-1 FIX: Stop polling on errors instead of silently continuing.
          // Prevents infinite 500-loop and informs the user.
          console.error("Payment polling failed:", err);
          stopPolling();
          setQrData(null);
          toast.error(err.message || "Payment verification failed");
        }
      }, 3000);
    },
    [stopPolling, invalidateOrders],
  );

  const handleClosePaymentModal = useCallback(
    () => setShowPaymentFlow(false),
    [],
  );
  const handleCloseUpgradeModal = useCallback(
    () => setUpgradeModalOpen(false),
    [],
  );

  // ─── Async action callbacks ───────────────────────────────────────────────
  const handleSSH = useCallback(
    (order) => {
      const username = getDefaultUsername(order.osType);
      const command = `ssh ${username}@${order.ipAddress}`;
      if (isWindows) {
        toast.success("SSH command copied! Paste in PowerShell or CMD.");
        navigator.clipboard.writeText(command);
      } else {
        window.location.href = `ssh://${username}@${order.ipAddress}`;
      }
    },
    [isWindows, getDefaultUsername],
  );

  const showDetailsModal = useCallback((order) => {
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
  }, []);

  const handlePowerAction = useCallback(
    async (order, action, isoId = null) => {
      const token = localStorage.getItem("token");
      if (!token) {
        DarkSwal.fire({
          icon: "warning",
          title: "Session Expired",
          text: "Please login again to continue.",
        }).then(() => {
          window.location.href = "/login";
        });
        return;
      }

      const vmId = order.originalData?.vmId || order.id || order.vmId;
      // Backend securely overrides userId via JWT, so we can use '0' as a fallback for route matching
      const userId =
        order.userId ||
        order.originalData?.userId ||
        accountStatus?.id ||
        accountStatus?.userId ||
        "0";

      if (!vmId) {
        DarkSwal.fire({
          icon: "error",
          title: "Action Failed",
          text: "Missing VM details. Please refresh and try again.",
        });
        return;
      }

      try {
        setPowerLoading((prev) => ({ ...prev, [vmId]: action }));
        let url = "";
        let options = { method: "POST", headers: {} };

        if (action === "rebuild") {
          url = `/api/users/${userId}/vms/${vmId}/rebuild?isoId=${isoId}`;
          options.headers["Content-Length"] = "0";
        } else {
          url = `/api/users/${userId}/vms/${vmId}/control?action=${action}`;
        }

        await apiClient(url, options, { auth: "user" });

        DarkSwal.fire({
          icon: "success",
          title: "Request Sent",
          text: `${action.toUpperCase()} request sent successfully.`,
        });

        // A-4 FIX: NO optimistic state update.
        // Instead, invalidate React Query cache so the next poll fetches real server state.
        invalidateOrders();

        if (action === "stop") {
          setPasswordVisible((prev) => ({ ...prev, [vmId]: false }));
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
    },
    [DarkSwal, accountStatus, invalidateOrders],
  );

  const fetchAvailableIsos = useCallback(async (zoneId) => {
    return apiClient(
      `/api/users/zones/${zoneId}/isos`,
      { method: "GET" },
      { auth: "user" }
    );
  }, []);

  const fetchAvailableIsosByServer = useCallback(async (serverId) => {
    return apiClient(
      `/api/users/servers/${serverId}/isos/basic`,
      { method: "GET" },
      { auth: "user" }
    );
  }, []);

  const promptRebuildWithIso = useCallback(
    async (order) => {
      try {
        const vmId = order.originalData?.vmId || order.id;
        let details = orderDetails[vmId];

        let zoneId =
          order.originalData?.zoneId ||
          order.originalData?.zone?.id ||
          details?.zoneId ||
          details?.zone?.id ||
          details?.server?.zoneId ||
          details?.server?.zone?.id;

        // Force fetch if details missing OR zoneId still missing from cached details
        if (!zoneId && vmId) {
          try {
            details = await fetchUserOrderDetails(vmId);
            setOrderDetails((prev) => ({ ...prev, [vmId]: details }));
            
            // Re-evaluate zoneId with fresh details
            zoneId =
              details?.zoneId ||
              details?.zone?.id ||
              details?.server?.zoneId ||
              details?.server?.zone?.id ||
              details?.data?.zoneId ||
              details?.data?.zone?.id ||
              details?.data?.server?.zoneId ||
              details?.data?.server?.zone?.id;
          } catch (err) {
            console.error("Failed to fetch order details", err);
          }
        }

        if (!zoneId) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Zone ID is missing for this VM. Please refresh details.",
            background: "#0e1525",
            color: "#e5e7eb",
          });
          return;
        }

        const isos = await fetchAvailableIsos(zoneId);

        let isosList = Array.isArray(isos) ? isos : (isos?.data || []);

        if (!isosList || !isosList.length) {
          Swal.fire({
            icon: "warning",
            title: "No ISOs Available",
            background: "#0e1525",
            color: "#e5e7eb",
          });
          return;
        }

        const isoOptions = {};
        isosList.forEach((i) => {
          isoOptions[i.id] = i.name || i.iso || i.osType || `ISO ${i.id}`;
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
              select.style.backgroundColor = "#151c2f";
              select.style.color = "#e5e7eb";
              select.style.border = "1px solid #4f46e5";
              select.style.borderRadius = "6px";
              select.style.padding = "10px";
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
    },
    [fetchAvailableIsos, fetchAvailableIsosByServer, handlePowerAction, orderDetails],
  );

  const handleReconfigureNetwork = useCallback(
    async (order) => {
      const vmId = order.originalData?.vmId || order.id;
      if (networkLoading[vmId]) return;

      const confirm = await DarkSwal.fire({
        title: "Reconfigure Network?",
        html: `
        <div class="text-left space-y-3">
          <p class="text-sm text-yellow-500 font-semibold flex items-center gap-2">
            <span class="p-1 bg-yellow-500/10 rounded-full">⚠️</span>
            Warning: This action will REBOOT your server.
          </p>
          <p class="text-sm text-gray-400">
            This will forcefully reconfigure and fix the network settings of your VM if the IP stops responding or the MAC address gets detached.
          </p>
        </div>
      `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Reconfigure",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#ef4444",
      });

      if (!confirm.isConfirmed) return;

      try {
        setNetworkLoading((prev) => ({ ...prev, [vmId]: true }));

        const data = await apiClient(
          `/api/users/vms/${vmId}/reconfigure-network`,
          { method: "POST" },
          { auth: "user" },
        );

        invalidateOrders();
        toast.success(data.message || "Network reconfiguration initiated.");

        DarkSwal.fire({
          icon: "success",
          title: "Success",
          text: data.message || "Network reconfiguration initiated. Your server will reboot shortly.",
        });
      } catch (err) {
        toast.error(err.message);
        DarkSwal.fire({
          icon: "error",
          title: "Operation Failed",
          text: err.message,
        });
      } finally {
        setNetworkLoading((prev) => ({ ...prev, [vmId]: false }));
      }
    },
    [DarkSwal, networkLoading, invalidateOrders],
  );

  const handleRegenerateMac = useCallback(
    async (order) => {
      const vmId = order.originalData?.vmId || order.id;
      if (macLoading[vmId]) return;

      const confirm = await DarkSwal.fire({
        title: "Regenerate MAC Address?",
        html: `
        <div class="text-left space-y-3">
          <p class="text-sm text-yellow-500 font-semibold flex items-center gap-2">
            <span class="p-1 bg-yellow-500/10 rounded-full">⚠️</span>
            Warning: This action will REBOOT your server.
          </p>
          <p class="text-sm text-gray-400">
            A new MAC address will be automatically generated by Proxmox. Please ensure you have saved all work before proceeding.
          </p>
        </div>
      `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Regenerate & Reboot",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#ef4444",
      });

      if (!confirm.isConfirmed) return;

      const token = localStorage.getItem("token");
      try {
        setMacLoading((prev) => ({ ...prev, [vmId]: true }));

        const data = await apiClient(
          `/api/users/vms/${vmId}/mac/regenerate`,
          { method: "POST" },
          { auth: "user" },
        );

        // E-1 FIX: Invalidate cache instead of manual state patching
        invalidateOrders();

        toast.success(`MAC Address updated: ${data.newMac}`);

        DarkSwal.fire({
          icon: "success",
          title: "Success",
          text: `MAC address successfully regenerated. Your server is now rebooting.`,
        });
      } catch (err) {
        toast.error(err.message);
        DarkSwal.fire({
          icon: "error",
          title: "Operation Failed",
          text: err.message,
        });
      } finally {
        setMacLoading((prev) => ({ ...prev, [vmId]: false }));
      }
    },
    [DarkSwal, macLoading, invalidateOrders],
  );

  const fetchVmPassword = useCallback(async (order) => {
    const userId = order.originalData?.userId;
    const vmId = order.originalData?.vmId || order.id;

    if (!userId || !vmId) {
      toast.error("Cannot fetch password: missing server information");
      return;
    }

    if (order.liveState?.toUpperCase() !== "RUNNING") return;

    try {
      setPasswordFetching((p) => ({ ...p, [vmId]: true }));
      const data = await apiClient(
        `/api/users/${userId}/vms/${vmId}/password`,
        {},
        { auth: "user" },
      );
      setVmPasswords((p) => ({ ...p, [vmId]: data.password || null }));
      setPasswordVisible((p) => ({ ...p, [vmId]: false }));
    } catch (err) {
      setVmPasswords((p) => ({ ...p, [vmId]: null }));
      toast.error("Password not set");
    } finally {
      setPasswordFetching((p) => ({ ...p, [vmId]: false }));
    }
  }, []);

  const togglePasswordView = useCallback(
    (order) => {
      const vmId = order.originalData?.vmId || order.id;
      if (!vmPasswords.hasOwnProperty(vmId)) {
        fetchVmPassword(order);
      } else {
        setPasswordVisible((p) => ({ ...p, [vmId]: !p[vmId] }));
      }
    },
    [vmPasswords, fetchVmPassword],
  );

  const handleSavePassword = useCallback(
    async (order) => {
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
        await apiClient(
          `/api/users/${userId}/vms/${vmId}/password`,
          {
            method: "PUT",
            body: JSON.stringify({ password }),
          },
          { auth: "user" },
        );
        toast.success("Password saved successfully");
        setVmPasswords((prev) => ({ ...prev, [vmId]: password }));
        setPasswordVisible((prev) => ({ ...prev, [vmId]: true }));
        setTimeout(() => {
          setPasswordVisible((prev) => ({ ...prev, [vmId]: false }));
        }, 10000);
        setPasswordInputs((prev) => ({ ...prev, [order.id]: "" }));
      } catch (err) {
        toast.error(`❌ ${err.message}`);
      } finally {
        setPasswordLoading((prev) => ({ ...prev, [vmId]: false }));
      }
    },
    [passwordInputs],
  );

  const handleCouponApply = useCallback(
    async (couponCode) => {
      if (priceLoading) return false;
      try {
        setPriceLoading(true);
        const data = await apiClient(
          "/api/coupons/validate",
          {
            method: "POST",
            body: JSON.stringify({
              code: couponCode.trim(),
              orderAmount: priceBreakdown?.originalAmount ?? 0,
            }),
          },
          { auth: "user" },
        );
        if (!data.valid) throw new Error("Coupon not valid");
        setPriceBreakdown((prev) => ({
          ...prev,
          couponCode: data.code,
          discountAmount: data.discountAmount,
          payableAmount: data.finalAmount,
          couponStatus: "APPLIED",
        }));
        return true;
      } catch (err) {
        toast.error(err.message);
        return false;
      } finally {
        setPriceLoading(false);
      }
    },
    [priceLoading, priceBreakdown],
  );

  const calculateRenewalPrice = useCallback(
    async (couponCode = null) => {
      if (!upgradeVm) return null;
      try {
        setPriceLoading(true);
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
        const data = await apiClient(
          "/api/billing/price/calculate-renewal",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          { auth: "user" },
        );
        setPriceBreakdown(data);
        return data;
      } catch (err) {
        toast.error(err.message);
        return null;
      } finally {
        setPriceLoading(false);
      }
    },
    [
      upgradeVm,
      selectedCpu,
      selectedRam,
      selectedDisk,
      selectedBandwidth,
      addMonths,
    ],
  );

  const preparePayment = useCallback(async () => {
    const result = await calculateRenewalPrice();
    setUpgradeModalOpen(false);
    if (!result) return;
    setShowPaymentFlow(true);
  }, [calculateRenewalPrice]);

  const createUpgradeSession = useCallback(
    async ({ useWallet, couponCode, gateway }) => {
      try {
        const data = await apiClient(
          `/api/vms/renew/${upgradeVm.id}/upgrade-renew?gateway=${encodeURIComponent(gateway)}`,
          {
            method: "POST",
            body: JSON.stringify({
              addMonths,
              useWalletBalance: useWallet,
              couponCode,
              planType: upgradeVm.planType || "DEDICATED",
              cpuPriceId: selectedCpu,
              ramPriceId: selectedRam,
              diskPriceId: selectedDisk,
              bandwidthPriceId: selectedBandwidth,
            }),
          },
          { auth: "user" },
        );

        if (data.status === "COMPLETED") {
          setShowPaymentFlow(false);
          setTimeout(() => {
            DarkSwal.fire({
              icon: "success",
              title: "Upgrade Successful",
              text: data.message,
            }).then(() => {
              invalidateOrders();
            });
          }, 150);
          return null;
        }
        if (data.paymentSessionId) return data;
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
    },
    [
      upgradeVm,
      addMonths,
      selectedCpu,
      selectedRam,
      selectedDisk,
      selectedBandwidth,
      DarkSwal,
    ],
  );

  const handleCreateSession = useCallback(
    async ({ gateway, useWallet, couponCode }) => {
      const data = await createUpgradeSession({
        gateway,
        useWallet,
        couponCode,
      });
      if (!data) return null;
      if (data.status === "COMPLETED") {
        toast.success("Payment successful");
        invalidateOrders();
        return { status: "COMPLETED" };
      }
      if (data.paymentUrl === "PAYTM_QR_FLOW") {
        const resolvedPaymentId = data.paymentId || data.id || data.orderId;
        setShowRetryPayment(false);
        setQrData({
          upiString: data.upiString,
          paymentId: resolvedPaymentId,
          amount: data.remainingToPay,
        });
        if (resolvedPaymentId) {
          startPolling(resolvedPaymentId);
        } else {
          console.error("No payment ID found in upgrade response", data);
          toast.error("Could not initiate payment tracking.");
        }
        return { paymentUrl: "PAYTM_QR_FLOW" };
      }
      if (data.paymentSessionId) return data;
      return null;
    },
    [createUpgradeSession, startPolling],
  );

  const createRetryPaymentSession = useCallback(
    async (order, gateway, useWallet) => {
      const paymentOrderId = order.orderId ?? order.originalData?.orderId;
      // D-4: /api/user/ (singular) matches backend contract
      const data = await apiClient(
        `/api/user/payments/${paymentOrderId}/retry?gateway=${encodeURIComponent(gateway)}&useWalletBalance=${useWallet}`,
        { method: "POST" },
        { auth: "user" },
      );
      return data;
    },
    [],
  );

  const openUpgradeModal = useCallback(async (order) => {
    setUpgradeVm(order);
    setUpgradeModalOpen(true);
    try {
      const data = await apiClient(
        `/api/pricing/upgrades/${order.id}`,
        {},
        { auth: "user" },
      );
      setPricingOptions(data);
      setSelectedCpu(data.cpuOptions?.[0]?.tier?.id || null);
      setSelectedRam(data.ramOptions?.[0]?.tier?.id || null);
      setSelectedDisk(data.diskOptions?.[0]?.tier?.id || null);
      setSelectedBandwidth(data.bandwidthOptions?.[0]?.tier?.id || null);
    } catch {
      toast.error("Failed to load pricing");
    }
  }, []);

  // ─── Derived / memoised data ──────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    if (selectedStatus === "ALL") return orders;
    return orders.filter(
      (order) => order.status?.toUpperCase() === selectedStatus.toUpperCase(),
    );
  }, [orders, selectedStatus]);

  const { sortedItems, requestSort, sortConfig } =
    useSortableData(filteredOrders);

  // currentOrders IS sortedItems — no copying
  const currentOrders = sortedItems;

  // ─── Effects ──────────────────────────────────────────────────────────────
  // Cleanup payment polling on unmount (QR/UPI payment polling only)
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const anyModalOpen =
      showPaymentFlow || upgradeModalOpen || showRetryPayment || !!qrData;
    if (anyModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflowY = "scroll";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
    };
  }, [showPaymentFlow, upgradeModalOpen, showRetryPayment, qrData]);

  // Payment success redirect toast
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        // Ensure fresh data after payment redirect
        invalidateOrders();
        DarkSwal.fire({
          icon: "success",
          title: "Payment Successful",
          text: "Your plan has been updated successfully. It will be visible in a few moments.",
        });
        window.history.replaceState({}, "", "/orders");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [DarkSwal, invalidateOrders]);

  // Account status check
  useEffect(() => {
    const checkAccountStatus = async () => {
      try {
        const data = await apiClient("/api/user/status", {}, { auth: "user" });
        setAccountStatus(data);
      } catch (err) {
        console.error("Account status check failed", err);
      } finally {
        setStatusLoading(false);
      }
    };
    checkAccountStatus();
  }, []);

  // A-3 FIX: The old setInterval + useState loop has been REMOVED.
  // Orders are now fetched by the `useUserOrders` React Query hook (defined at the top).
  // React Query handles: deduplication, polling (8s), stale detection, caching, and cleanup.

  // C-1 FIX: Fetch lock status ONLY for the expanded row, not all orders
  useEffect(() => {
    if (!expandedRow) return;
    const order = orders.find((o) => o.id === expandedRow);
    if (!order) return;
    const vmId = order.originalData?.vmId || order.id;
    // Only fetch if we don't already have it
    if (vmLockStatus[vmId] !== undefined) return;
    (async () => {
      try {
        const data = await apiClient(
          `/api/vms/${vmId}/lock-status`,
          {},
          { auth: "user" },
        );
        setVmLockStatus((prev) => ({ ...prev, [vmId]: data }));
      } catch (err) {
        console.error("Failed to fetch lock status", err);
      }
    })();
  }, [expandedRow, orders, vmLockStatus]);



  // Reset page to 1 whenever sort or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig, debouncedSearch]);

  // ─── Render ───────────────────────────────────────────────────────────────
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
        {/* Account suspended overlay */}
        {!statusLoading && accountStatus?.isLocked && (
          <div className="absolute inset-0 z-[50] bg-black/60 backdrop-blur-md flex items-center justify-center">
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
                {/* Search Box */}
                <div className="flex items-center bg-[#151c2f] border border-indigo-900/50 rounded-lg overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search by name, IP, VMID..."
                    value={searchTerm}
                    autoComplete="search-no-autofill"
                    name="vm-search"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    className="bg-transparent text-sm text-white outline-none px-3 py-2 w-48 placeholder-gray-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    Search
                  </button>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2 bg-[#151c2f] border border-indigo-900/50 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-transparent text-sm text-white outline-none appearance-none"
                  >
                    <option value="ALL" className="bg-[#151c2f]">
                      All Servers
                    </option>
                    <option value="ACTIVE" className="bg-[#151c2f]">
                      Active
                    </option>
                    <option value="STOPPED" className="bg-[#151c2f]">
                      Stopped
                    </option>
                    <option value="PENDING_PAYMENT" className="bg-[#151c2f]">
                      Pending
                    </option>
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
                  onClick={handleRefresh}
                  className="px-4 py-2.5 border border-indigo-900/50 hover:bg-indigo-900/20 text-indigo-300 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${tableLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* Servers Table */}
            <div className="bg-[#151c2f] border border-indigo-900/30 rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-indigo-900/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-white">
                        Virtual Machines
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        {totalItems} server{totalItems !== 1 ? "s" : ""} •{" "}
                        {
                          filteredOrders.filter(
                            (o) => o.status?.toUpperCase() === "ACTIVE",
                          ).length
                        }{" "}
                        Active •{" "}
                        {
                          filteredOrders.filter(
                            (o) => o.status?.toUpperCase() === "STOPPED",
                          ).length
                        }{" "}
                        Stopped
                      </p>
                    </div>
                    {tableLoading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                    {totalItems} servers
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
                                    <span>{order.cores ? `${order.cores} vCPU` : "-"}</span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <MemoryStick className="w-3 h-3 text-gray-400" />
                                    <span>
                                      {order.ramMb
                                        ? `${formatRamGb(order.ramMb)}GB`
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
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                                >
                                  {getStatusText(order.status)}
                                </span>
                              </td>

                              <td className="py-3 px-4 sm:px-6">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getLiveStatusColor(order.liveState)}`}
                                >
                                  {order.liveState?.toUpperCase() || "UNKNOWN"}
                                </span>
                              </td>

                              <td className="py-3 px-4 sm:px-6">
                                <div className="flex items-center gap-2">
                                  {order.status === "PENDING_PAYMENT" && (
                                    <button
                                      onClick={() => {
                                        setRetryOrder(order);
                                        setShowRetryPayment(true);
                                      }}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                                    >
                                      Make Payment
                                    </button>
                                  )}

                                  {isVmLocked(order) && (
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
                                  )}
<button
                                    onClick={() => toggleRow(order.id, order.originalData.vmId)}
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
                            {expandedRow === order.id && (
                              <tr className="bg-[#0f172a] border-t border-indigo-900/30">
                                <td colSpan="7" className="p-0">
                                  <div className="p-4 sm:p-6">
                                    {detailsLoading ? (
                                      <div className="flex flex-col items-center justify-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                                        <p className="text-gray-400">Loading server details...</p>
                                      </div>
                                    ) : (() => {
                                      const details = orderDetails[order.originalData.vmId] || {};
                                      return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                          {/* ── Server Specifications Card ── */}
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
                                                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                    <Cpu className="w-4 h-4" />
                                                    <span>CPU Cores</span>
                                                  </div>
                                                  <p className="text-2xl font-bold text-white">
                                                    {details.cores || 0}
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
                                                  <p className="text-2xl font-bold text-white">
                                                    {formatRamGb(details.ramMb)}
                                                    <span className="text-sm text-gray-400 ml-1">
                                                      GB
                                                    </span>
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                  <HardDriveIcon className="w-4 h-4 text-indigo-400" />
                                                  <span>Storage</span>
                                                </div>
                                                <p className="text-2xl font-bold text-white">
                                                  {details.diskGb || 0}
                                                  <span className="text-sm text-gray-400 ml-1">
                                                    GB SSD
                                                  </span>
                                                </p>
                                              </div>

                                              <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                    <Globe className="w-4 h-4" />
                                                    <span>OS</span>
                                                  </div>
                                                  <p className="text-sm font-medium text-white truncate">
                                                    {details.osName || order.osType || "N/A"}
                                                  </p>
                                                </div>

                                                <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                    <Wifi className="w-4 h-4" />
                                                    <span>IP Address</span>
                                                  </div>
                                                  <p className="text-sm font-medium text-white truncate">
                                                    {order.ipAddress || "N/A"}
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                  <Activity className="w-4 h-4" />
                                                  <span>Live Status</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <span
                                                    className={`w-2 h-2 rounded-full ${
                                                      (order.liveState?.toUpperCase() || "UNKNOWN") === "RUNNING"
                                                        ? "bg-green-400 animate-pulse"
                                                        : "bg-red-400"
                                                    }`}
                                                  ></span>
                                                  <span className="text-sm font-medium text-white">
                                                    {order.liveState?.toUpperCase() || "UNKNOWN"}
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="pt-3 border-t border-indigo-900/30">
                                                <div className="flex items-center justify-between mb-2">
                                                  <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider font-bold">
                                                    <Server className="w-3 h-3" />
                                                    <span>MAC Address</span>
                                                  </div>
                                                  <code className="text-[10px] bg-indigo-950/50 px-2 py-0.5 rounded text-indigo-300 border border-indigo-500/20 font-mono">
                                                    {details.macAddress || "N/A"}
                                                  </code>
                                                </div>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRegenerateMac(order);
                                                  }}
                                                  disabled={macLoading[order.originalData?.vmId || order.id]}
                                                  className="relative z-20 flex items-center justify-center gap-2 w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-lg border border-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                                >
                                                  {macLoading[order.originalData?.vmId || order.id] ? (
                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                  ) : (
                                                    <RefreshCw className="w-3 h-3 group-hover/btn:rotate-180 transition-transform duration-500" />
                                                  )}
                                                  REGENERATE MAC
                                                </button>
                                              </div>
                                            </div>
                                          </div>

                                          {/* ── Billing Details Card ── */}
                                          <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] rounded-xl border border-indigo-900/50 p-4 sm:p-6">
                                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                              <div className="p-2 bg-indigo-900/30 rounded-lg">
                                                <FileText className="w-5 h-5 text-indigo-400" />
                                              </div>
                                              <h3 className="text-lg font-semibold text-indigo-300">
                                                Billing & Location
                                              </h3>
                                            </div>

                                            <div className="space-y-4">
                                              <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                  <IndianRupee className="w-4 h-4" />
                                                  <span>Monthly Cost</span>
                                                </div>
                                                <p className="text-2xl font-bold text-emerald-300">
                                                  {formatCurrency(order.priceTotal)}
                                                </p>
                                              </div>

                                              <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Created</span>
                                                  </div>
                                                  <p className="text-sm font-medium text-white">
                                                    {formatDate(details.createdAt || order.createdAt)}
                                                  </p>
                                                </div>

                                                <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                                    <MapPin className="w-4 h-4 text-orange-400" />
                                                    <span>Location</span>
                                                  </div>
                                                  <p className="text-sm font-medium text-white">
                                                    {details.serverName || order.vmName || "N/A"}
                                                  </p>
                                                </div>
                                              </div>

                                              {(() => {
                                                const renewConfig = getRenewButtonConfig(order);
                                                return (
                                                  renewConfig && (
                                                    <button
                                                      onClick={() => openUpgradeModal(order)}
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
                                                      {getDaysRemaining(order.expiresAt)} days
                                                    </span>
                                                  </div>
                                                </div>
                                              )}

                                              <div className="pt-3 border-t border-indigo-900/30 space-y-3">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-sm text-gray-400">
                                                    Plan Type
                                                  </span>
                                                  <span className="px-3 py-1 bg-indigo-900/30 rounded-full text-sm font-medium">
                                                    {order.planType || "Standard"}
                                                  </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                  <span className="text-sm text-gray-400">
                                                    Server Location
                                                  </span>
                                                  <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm font-medium">
                                                    {details.serverLocation || order.serverLocation || "Unknown"}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* ── Connection & Controls Card ── */}
                                          <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] rounded-xl border border-indigo-900/50 p-4 sm:p-6">
                                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                              <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-900/30 rounded-lg">
                                                  <Lock className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-indigo-300">
                                                  Security & Connection
                                                </h3>
                                              </div>
                                              <button
                                                onClick={() => handleRefreshSingle(order.originalData.vmId)}
                                                className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/20 transition-all flex items-center gap-2 group"
                                                title="Refresh status"
                                              >
                                                <RefreshCw className={`w-3.5 h-3.5 ${detailsLoading ? "animate-spin" : ""}`} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Sync Status</span>
                                              </button>
                                            </div>

                                            <div className="space-y-4">
                                              <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                  <User className="w-4 h-4" />
                                                  <span>Username</span>
                                                </div>
                                                <p className="text-sm font-semibold text-white font-mono">
                                                  {getDefaultUsername(order.osType)}
                                                </p>
                                              </div>

                                              <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                  <Key className="w-4 h-4" />
                                                  <span>Password</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                  <p className="text-sm font-semibold text-white font-mono truncate mr-2">
                                                    {passwordVisible[order.id]
                                                      ? details.password || "N/A"
                                                      : "••••••••••••"}
                                                  </p>
                                                  <button
                                                    onClick={() =>
                                                      setPasswordVisible((prev) => ({
                                                        ...prev,
                                                        [order.id]: !prev[order.id],
                                                      }))
                                                    }
                                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                                  >
                                                    {passwordVisible[order.id] ? (
                                                      <EyeOff className="w-4 h-4 text-gray-400" />
                                                    ) : (
                                                      <Eye className="w-4 h-4 text-gray-400" />
                                                    )}
                                                  </button>
                                                </div>
                                              </div>
                                              <button
                                                onClick={async () => {
                                                  const { value: newPassword } = await DarkSwal.fire({
                                                    title: 'Change VM Password',
                                                    html: `
                                                      <p style="color:#9ca3af;font-size:13px;margin-bottom:12px;">Enter a new password for your VM. It must be at least 8 characters with uppercase, lowercase, number & special character.</p>
                                                    `,
                                                    input: 'password',
                                                    inputPlaceholder: 'Enter new password',
                                                    showCancelButton: true,
                                                    confirmButtonText: 'Update Password',
                                                    cancelButtonText: 'Cancel',
                                                    confirmButtonColor: '#4f46e5',
                                                    cancelButtonColor: '#334155',
                                                    inputAttributes: { autocomplete: 'new-password' },
                                                    didOpen: () => {
                                                      const input = Swal.getInput();
                                                      if (input) {
                                                        input.style.backgroundColor = '#151c2f';
                                                        input.style.color = '#e5e7eb';
                                                        input.style.border = '1px solid #4f46e5';
                                                        input.style.borderRadius = '6px';
                                                        input.style.padding = '10px';
                                                        input.style.paddingRight = '40px';
                                                        // wrap input in a relative container for the eye button
                                                        const wrapper = input.parentElement;
                                                        if (wrapper) {
                                                          wrapper.style.position = 'relative';
                                                          const eyeBtn = document.createElement('button');
                                                          eyeBtn.type = 'button';
                                                          eyeBtn.style.cssText = 'position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:4px;color:#9ca3af;display:flex;align-items:center;';
                                                          const eyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
                                                          const eyeClosed = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
                                                          eyeBtn.innerHTML = eyeOpen;
                                                          eyeBtn.addEventListener('click', () => {
                                                            const isPassword = input.type === 'password';
                                                            input.type = isPassword ? 'text' : 'password';
                                                            eyeBtn.innerHTML = isPassword ? eyeClosed : eyeOpen;
                                                          });
                                                          wrapper.appendChild(eyeBtn);
                                                        }
                                                      }
                                                    },
                                                    inputValidator: (value) => {
                                                      if (!value) return 'Password is required';
                                                      const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
                                                      if (!pattern.test(value)) return 'Min 8 chars with uppercase, lowercase, number & special character.';
                                                    },
                                                  });
                                                  if (!newPassword) return;
                                                  const vmId = order.originalData?.vmId || order.id;
                                                  const userId = order.originalData?.userId;
                                                  try {
                                                    setPasswordLoading((prev) => ({ ...prev, [vmId]: true }));
                                                    await apiClient(
                                                      `/api/users/${userId}/vms/${vmId}/password`,
                                                      {
                                                        method: 'PUT',
                                                        body: JSON.stringify({ password: newPassword }),
                                                      },
                                                      { auth: 'user' },
                                                    );
                                                    toast.success('Password updated successfully');
                                                    setVmPasswords((prev) => ({ ...prev, [vmId]: newPassword }));
                                                    setPasswordVisible((prev) => ({ ...prev, [vmId]: true }));
                                                    setTimeout(() => {
                                                      setPasswordVisible((prev) => ({ ...prev, [vmId]: false }));
                                                    }, 10000);
                                                  } catch (err) {
                                                    DarkSwal.fire({
                                                      icon: 'error',
                                                      title: 'Password Change Failed',
                                                      text: err.message,
                                                    });
                                                  } finally {
                                                    setPasswordLoading((prev) => ({ ...prev, [vmId]: false }));
                                                  }
                                                }}
                                                disabled={order.status !== 'ACTIVE'}
                                                className="text-indigo-400 hover:text-indigo-300 text-xs mt-1 hover:underline transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                              >
                                                Change Password
                                              </button>

                                              {order.ipAddress && order.liveState?.toUpperCase() === "RUNNING" && (
                                                <div className="grid grid-cols-2 gap-2 mt-4">
                                                  <button
                                                    onClick={() => handleSSH(order)}
                                                    className="flex items-center justify-center gap-2 p-2 bg-[#0e1525] hover:bg-indigo-900/20 border border-indigo-900/50 rounded-lg text-indigo-300 text-xs transition-colors"
                                                  >
                                                    <Terminal className="w-4 h-4" />
                                                    SSH
                                                  </button>
                                                  <button
                                                    onClick={() => navigate(`/user/vms/${order.id}/performance`, {
                                                      state: {
                                                        userId: order.originalData?.userId || accountStatus?.id || accountStatus?.userId,
                                                        serverId: order.originalData?.serverId,
                                                        vmName: order.vmName,
                                                      },
                                                    })}
                                                    className="flex items-center justify-center gap-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                                                  >
                                                    <Activity className="w-4 h-4" />
                                                    Performance
                                                  </button>
                                                </div>
                                              )}

                                              {/* Power Controls */}
                                              <div className="pt-3 border-t border-indigo-900/30">
                                                <div className="grid grid-cols-2 gap-2">
                                                  <button
                                                    onClick={() => handlePowerAction(order, "start")}
                                                    disabled={!canAction(order.liveState, "start") || order.status !== "ACTIVE" || !!powerLoading[order.originalData?.vmId || order.id]}
                                                    className="flex items-center justify-center gap-2 p-2 bg-green-900/30 hover:bg-green-900/50 disabled:opacity-30 text-green-300 rounded text-xs transition-colors"
                                                  >
                                                    <Play className="w-3 h-3" />
                                                    Start
                                                  </button>
                                                  <button
                                                    onClick={() => handlePowerAction(order, "stop")}
                                                    disabled={!canAction(order.liveState, "stop") || order.status !== "ACTIVE" || !!powerLoading[order.originalData?.vmId || order.id]}
                                                    className="flex items-center justify-center gap-2 p-2 bg-red-900/30 hover:bg-red-900/50 disabled:opacity-30 text-red-300 rounded text-xs transition-colors"
                                                  >
                                                    <Square className="w-3 h-3" />
                                                    Stop
                                                  </button>
                                                  <button
                                                    onClick={() => handlePowerAction(order, "reboot")}
                                                    disabled={!canAction(order.liveState, "reboot") || order.status !== "ACTIVE" || !!powerLoading[order.originalData?.vmId || order.id]}
                                                    className="flex items-center justify-center gap-2 p-2 bg-purple-900/30 hover:bg-purple-900/50 disabled:opacity-30 text-purple-300 rounded text-xs transition-colors"
                                                  >
                                                    <RefreshCw className="w-3 h-3" />
                                                    Reboot
                                                  </button>
                                                  <button
                                                    onClick={() => promptRebuildWithIso(order)}
                                                    disabled={order.status !== "ACTIVE" || !!powerLoading[order.originalData?.vmId || order.id]}
                                                    className="flex items-center justify-center gap-2 p-2 bg-orange-900/30 hover:bg-orange-900/50 disabled:opacity-30 text-orange-300 rounded text-xs transition-colors"
                                                  >
                                                    <HardDrive className="w-3 h-3" />
                                                    Rebuild
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Reconfigure Network */}
                                              <div className="pt-3 border-t border-indigo-900/30">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReconfigureNetwork(order);
                                                  }}
                                                  disabled={networkLoading[order.originalData?.vmId || order.id] || order.status !== "ACTIVE"}
                                                  className="flex items-center justify-center gap-2 w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-lg border border-yellow-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                  {networkLoading[order.originalData?.vmId || order.id] ? (
                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                  ) : (
                                                    <Wifi className="w-3 h-3" />
                                                  )}
                                                  RECONFIGURE NETWORK
                                                </button>
                                              </div>

                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })()}
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
                          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                          {totalItems} servers
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

      {/* ── Modals ── */}
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={handleCloseUpgradeModal}
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
        onClose={handleClosePaymentModal}
        priceBreakdown={priceBreakdown}
        priceLoading={priceLoading}
        onCreateSession={handleCreateSession}
        onCouponApply={handleCouponApply}
      />

      {showRetryPayment && retryOrder && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1525] w-full max-w-md rounded-xl border border-indigo-900/50">
            <div className="p-6 border-b border-indigo-900/40 flex justify-between items-center">
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
                onCreateSession={({ gateway, useWallet }) =>
                  createRetryPaymentSession(retryOrder, gateway, useWallet)
                }
                onClose={() => {
                  setShowRetryPayment(false);
                  setRefreshTrigger((prev) => prev + 1);
                }}
                onShowQR={(data) => {
                  setQrData(data);
                  startPolling(data.paymentId);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {qrData && (
        <PaytmQRModal
          qrData={qrData}
          onClose={() => {
            setQrData(null);
            stopPolling();
          }}
          stopPolling={stopPolling}
        />
      )}
    </div>
  );
}