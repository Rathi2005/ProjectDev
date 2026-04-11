import React, { useState, useMemo, useRef, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useAdminOrders } from "../../hooks/useAdminOrders";
import { useAdminStats } from "../../hooks/useAdminStats";
import { useQueryClient } from "@tanstack/react-query";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import Swal from "sweetalert2";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import SortIcon from "../../components/SortIcon";
import toast from "react-hot-toast";
import {
  Package,
  Clock,
  XCircle,
  Cpu,
  MemoryStick,
  Globe,
  Calendar,
  IndianRupee,
  User,
  Mail,
  MapPin,
  Server,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  CircleAlert,
  Wifi,
  HardDriveIcon,
  Trash2,
  Users, // Add this import
  Eye, // Add this import
  Edit,
  ShieldCheck,
  Search,
  Filter,
  X,
} from "lucide-react";

export default function OrdersPage() {
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [ipChangeLoading, setIpChangeLoading] = useState({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0); // 0-based
  const [size, setSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const debouncedSearch = useDebounce(searchQuery.trim(), 500);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    const handleEsc = (event) => {
      if (event.key === "Escape") setIsFilterOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  const requestSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isFetching,
    refetch: refetchOrders,
  } = useAdminOrders({
    page,
    size,
    statusFilter,
    search: debouncedSearch,
    searchBy,
    rawSearch: searchQuery,
    sortBy: sortConfig?.key || "createdAt",
    sortDir: sortConfig?.direction || "desc",
  });

  // ── User-intent loader tracking ──────────────────────────────────────
  // Set to true ONLY by explicit user actions (page change, search, filter).
  // Background polls (refetchInterval) never touch this ref.
  // Auto-clears when fetch completes.
  const fetchIntentRef = useRef(false);
  if (!isFetching) fetchIntentRef.current = false;
  const showTableLoader = isFetching && fetchIntentRef.current;

  // Derive orders from React Query data — no useState copy, no re-render cascade
  const orders = useMemo(() => {
    const vmList = ordersData?.vms || [];
    return vmList.map((order) => ({
      id: order.dbOrderId,
      dbOrderId: order.dbOrderId,
      serverId: order.serverId,
      vmid: order.proxmoxVmid,
      internalVmid: order.internalVmId,
      isProtected: order.isProtected ?? false,
      priceTotal: order.totalAmount,
      monthlyPrice: order.monthlyPrice,
      paidAmount: order.paidAmount,
      vmName: order.vmName,
      isoName: order.os,
      planType: order.planType,
      cores: order.cores,
      ramMb: order.ramMb,
      diskGb: order.diskGb,
      ipAddress: order.ipAddress || "",
      createdAt: order.createdAt,
      expiresAt: order.expiresAt,
      status: order.status,
      liveState: order.liveState,
      isLocked: order.status?.toUpperCase() === "LOCKED",
      user: {
        firstName: order.customerName || "—",
        lastName: "",
        email: order.customerEmail || "—",
        billingAddress: order.billingAddress || null,
      },
      originalData: order,
    }));
  }, [ordersData]);

  const totalItems = ordersData?.totalItems || 0;
  const totalPages = ordersData?.totalPages || 0;

  const { data: statsData } = useAdminStats();

  // Derive stats from React Query data — same pattern, no useState copy
  const stats = useMemo(() => ({
    totalOrders: statsData?.orders?.totalOrders || 0,
    activeOrders: statsData?.orders?.activeOrders || 0,
    pendingOrders: statsData?.orders?.pendingOrders || 0,
    failedOrders: statsData?.failed?.totalFailedOrders || 0,
    totalDeletedVms: statsData?.deleted?.totalDeletedVms || 0,
    totalUsers: statsData?.users?.totalUsers || 0,
  }), [statsData]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedRevenuePeriod, setSelectedRevenuePeriod] = useState("all");

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const DarkSwal = Swal.mixin({
    background: "#1e2640",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#4b5563",
    buttonsStyling: true,
  });

  // State for additional insights
  const [revenueStats, setRevenueStats] = useState({
    all: 0,
    one_year: 0,
    this_year: 0,
    this_month: 0,
  });

  // Debounce is now handled by useDebounce hook above (line 53)

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const sortConfigObj = {
    key: sortConfig?.key,
    direction: sortConfig?.direction,
  };

  // Search page-reset: reset in onChange handler instead of useEffect
  // to avoid the double-API-call race condition

  const handleStatusChange = (e) => {
    fetchIntentRef.current = true;
    setStatusFilter(e.target.value);
    setPage(0); // reset pagination
  };

  const [powerLoading, setPowerLoading] = useState({});

  const handlePowerAction = async (orderId, action) => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      DarkSwal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "Admin not authenticated",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    DarkSwal.fire({
      title: "Sending Command",
      text: `Sending ${action} command...`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      setPowerLoading((prev) => ({ ...prev, [orderId]: action }));

      const res = await fetch(
        `${BASE_URL}/api/admin/vms/order/${orderId}/power?action=${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Power operation failed");
      }

      DarkSwal.close();
      DarkSwal.fire({
        icon: "success",
        title: "Success",
        text: `VM ${action.toUpperCase()} command sent successfully`,
        timer: 3000,
        showConfirmButton: false,
      });
      await refetchOrders();
    } catch (err) {
      DarkSwal.fire({
        icon: "error",
        title: "Failed",
        text: `Failed to ${action} VM`,
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setPowerLoading((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  // ---------- EASY REBOOT HANDLER ----------
  const [adminActionLoading, setAdminActionLoading] = useState({});

  const handleEasyReboot = async (orderId) => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      DarkSwal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "Admin not authenticated",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    const result = await DarkSwal.fire({
      title: "Easy Reboot",
      html: "Easy Reboot will force stop & start the VM.<br><br>Continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, continue",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    DarkSwal.fire({
      title: "Processing",
      text: "Initiating easy reboot...",
      allowOutsideClick: false,
      didOpen: () => {
        DarkSwal.showLoading();
      },
    });

    try {
      setAdminActionLoading((p) => ({ ...p, [orderId]: "easy-reboot" }));

      const res = await fetch(
        `${BASE_URL}/api/admin/vms/order/${orderId}/reboot-easy`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );

      if (!res.ok) throw new Error(await res.text());

      DarkSwal.close();
      DarkSwal.fire({
        icon: "success",
        title: "Success",
        text: "Easy reboot initiated",
        timer: 3000,
        showConfirmButton: false,
      });
      await refetchOrders();
    } catch (err) {
      toast.error(err);
      DarkSwal.fire({
        icon: "error",
        title: "Failed",
        text: "Easy reboot failed",
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setAdminActionLoading((p) => ({ ...p, [orderId]: null }));
    }
  };

  // ---------- REBUILD HANDLER ----------
  const [selectedIso, setSelectedIso] = useState("");

  const fetchBasicIsos = async (serverId) => {
    const adminToken = localStorage.getItem("adminToken");

    const res = await fetch(
      `${BASE_URL}/api/admin/servers/${serverId}/isos/details`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to fetch ISOs");
    }

    return await res.json(); // [{ id, iso, vmid, server }]
  };

  const promptRebuildWithIso = async (orderId) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        DarkSwal.fire({
          icon: "error",
          title: "Authentication Required",
          text: "Admin not authenticated",
          timer: 3000,
          showConfirmButton: false,
        });
        return;
      }

      // Get order details
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        DarkSwal.fire({
          icon: "error",
          title: "Order Not Found",
          text: "Could not find the order",
          timer: 3000,
          showConfirmButton: false,
        });
        return;
      }

      // Fetch available ISOs
      const isos = await fetchBasicIsos(order.serverId);

      if (!isos.length) {
        DarkSwal.fire({
          icon: "warning",
          title: "No ISOs Available",
          text: "No ISO images available for this server",
          background: "#1e2640",
          color: "#ffffff",
        });
        return;
      }

      // Create ISO options for dropdown
      const isoOptions = {};
      isos.forEach((i) => {
        isoOptions[i.id] = i.iso;
      });

      // Show ISO selection dialog
      const { value: isoId } = await DarkSwal.fire({
        title: "Rebuild VM",
        html: '<strong class="text-red-400">⚠️ Rebuild will ERASE all data and reinstall OS.</strong><br><br>Select an ISO to continue:',
        input: "select",
        inputOptions: isoOptions,
        inputPlaceholder: "Select ISO",
        showCancelButton: true,
        confirmButtonText: "Rebuild",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        reverseButtons: true,
        inputValidator: (value) => {
          if (!value) return "Please select an ISO";
        },
      });

      if (!isoId) return;

      // Confirm rebuild
      const confirmResult = await DarkSwal.fire({
        title: "Confirm Rebuild",
        html: '<strong class="text-red-500">⚠️ This will ERASE ALL DATA on the VM!</strong><br><br>Are you sure you want to rebuild?',
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, rebuild",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!confirmResult.isConfirmed) return;

      DarkSwal.fire({
        title: "Processing",
        text: "Starting VM rebuild...",
        allowOutsideClick: false,
        didOpen: () => {
          DarkSwal.showLoading();
        },
      });

      try {
        setAdminActionLoading((p) => ({ ...p, [orderId]: "rebuild" }));

        const res = await fetch(
          `${BASE_URL}/api/admin/vms/order/${orderId}/rebuild?isoId=${isoId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          },
        );

        if (!res.ok) throw new Error(await res.text());

        DarkSwal.close();
        DarkSwal.fire({
          icon: "success",
          title: "Success",
          text: "VM rebuild started",
          timer: 3000,
          showConfirmButton: false,
        });
        await refetchOrders();
      } catch (err) {
        DarkSwal.fire({
          icon: "error",
          title: "Failed",
          text: "VM rebuild failed",
          timer: 3000,
          showConfirmButton: false,
        });
      } finally {
        setAdminActionLoading((p) => ({ ...p, [orderId]: null }));
      }
    } catch (err) {
      DarkSwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch ISOs",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  // Remove the old handleRebuild function and use this new one
  const handleRebuild = promptRebuildWithIso;

  // ---------- DESTROY HANDLER ----------
  const handleDestroy = async (orderId) => {
    const result1 = await DarkSwal.fire({
      title: "Confirm Destruction",
      html: '<strong class="text-red-600">This will PERMANENTLY destroy the VM and release IP.</strong><br><br>This action cannot be undone!',
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Continue",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result1.isConfirmed) return;

    const { value: confirmText } = await DarkSwal.fire({
      title: "Final Confirmation",
      input: "text",
      inputLabel: "Type DESTROY to confirm irreversible deletion:",
      inputPlaceholder: "Type DESTROY here",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Confirm Destroy",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value || value.toUpperCase() !== "DESTROY") {
          return "You must type DESTROY exactly to continue";
        }
      },
    });

    if (!confirmText) {
      DarkSwal.fire({
        icon: "error",
        title: "Cancelled",
        text: "Confirmation failed",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    DarkSwal.fire({
      title: "Destroying VM",
      text: "Please wait while the VM is being destroyed...",
      allowOutsideClick: false,
      didOpen: () => {
        DarkSwal.showLoading();
      },
    });

    try {
      setAdminActionLoading((p) => ({ ...p, [orderId]: "destroy" }));

      const res = await fetch(
        `${BASE_URL}/api/admin/vms/order/${orderId}/remove`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      if (!res.ok) throw new Error(await res.text());

      DarkSwal.close();
      DarkSwal.fire({
        icon: "success",
        title: "Success",
        text: "VM removal initiated",
        timer: 3000,
        showConfirmButton: false,
      });
      await refetchOrders();
    } catch (err) {
      DarkSwal.fire({
        icon: "error",
        title: "Failed",
        text: "VM destroy failed",
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setAdminActionLoading((p) => ({ ...p, [orderId]: null }));
    }
  };

  // ---------- UNLOCK HANDLER ----------
  const handleVmLockToggle = async (orderId, lock) => {
    const adminToken = localStorage.getItem("adminToken");

    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/vms/order/${orderId}/lock?lock=${lock}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to update lock");

      toast.success(lock ? "VM Locked" : "VM Unlocked");

      await refetchOrders(); // ✅ ADD THIS
    } catch (err) {
      toast.error("Failed to update lock status");
    }
  };

  // expandedRow is intentionally NOT reset on data change — keeps admin's
  // context stable during 10s polling cycles and pagination transitions

  const handleUpdateExpiry = async (order) => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) return;

    const { value: newExpiry } = await DarkSwal.fire({
      title: "Update Expiry Date",
      html: `
        <p class="text-sm text-gray-300 mb-2">
          Current Expiry:
          <strong>${order.expiresAt ? formatDate(order.expiresAt) : "N/A"}</strong>
        </p>
      `,
      input: "datetime-local",
      inputLabel: "Select new expiry date",
      showCancelButton: true,
      confirmButtonText: "Update Expiry",
      cancelButtonText: "Cancel",
      background: "#1e2640",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#4b5563",
      inputValidator: (value) => {
        if (!value) return "Expiry date is required";
      },
    });

    if (!newExpiry) return;

    try {
      DarkSwal.fire({
        title: "Updating Expiry",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => DarkSwal.showLoading(),
      });

      const res = await fetch(`${BASE_URL}/api/admin/vms/update-expiry`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          newExpiryDate: newExpiry.replace("T", " ") + ":00",
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      DarkSwal.close();
      DarkSwal.fire({
        icon: "success",
        title: "Expiry Updated",
        text: "Order expiry updated successfully",
        timer: 3000,
        showConfirmButton: false,
      });
      await refetchOrders();
    } catch (err) {
      DarkSwal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message || "Failed to update expiry",
      });
    }
  };

  // Add this function before the insights useMemo:
  const getRevenueSubtitle = (period) => {
    switch (period) {
      case "all":
        return "All time revenue";
      case "one_year":
        return "Last 365 days";
      case "this_year":
        return "This calendar year";
      case "this_month":
        return "This month";
      default:
        return "All time revenue";
    }
  };

  // ✅ Add this function BEFORE the insights useMemo:
  const handleVmidEdit = async (vmid, currentVmid) => {
    const { value: newVmid } = await DarkSwal.fire({
      title: "Edit VMID",
      input: "number",
      inputLabel: `Current VMID: ${vmid}`,
      inputPlaceholder: "Enter new VMID (e.g., 105)",
      inputValue: vmid,
      showCancelButton: true,
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
      background: "#1e2640",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#4b5563",
      inputValidator: (value) => {
        if (!value) return "VMID is required";
        const numValue = Number(value);
        if (isNaN(numValue)) return "Must be a number";
        if (numValue > 9999) return "VMID must be less than 10000";
      },
    });

    if (!newVmid || Number(newVmid) === currentVmid) return;

    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await fetch(
        `${BASE_URL}/api/admin/vms/${currentVmid}/manual-vmid-sync?newVmid=${newVmid}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ newProxmoxVmid: Number(newVmid) }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update VMID");
      }

      await DarkSwal.fire({
        icon: "success",
        title: "VMID Updated",
        text: `VMID changed from ${vmid} to ${newVmid}`,
        timer: 3000,
        showConfirmButton: false,
        background: "#1e2640",
        color: "#ffffff",
      });
      await refetchOrders();
    } catch (err) {
      DarkSwal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message || "Failed to update VMID",
        background: "#1e2640",
        color: "#ffffff",
      });
    }
  };

  // Dynamic insights calculation - Updated with new APIs
  const insights = useMemo(
    () => [
      {
        title: "Total Orders",
        value: stats.totalOrders,
        icon: <Package className="w-6 h-6 text-indigo-400" />,
        subtitle: "All time",
        color: "text-indigo-400",
      },
      {
        title: "Garbage Records",
        value: stats.failedOrders,
        icon: <XCircle className="w-6 h-6 text-red-400" />,
        subtitle: "Payment / Provision failures",
        color: "text-red-400",
        hasLink: true,
      },
      {
        title: "Total Users",
        value: stats.totalUsers,
        icon: <Users className="w-6 h-6 text-blue-400" />,
        subtitle: "Registered users",
        color: "text-blue-400",
        hasLink: true,
      },
      {
        title: "Deleted VMs",
        value: stats.totalDeletedVms,
        icon: <Trash2 className="w-6 h-6 text-orange-400" />,
        subtitle: "Permanently removed",
        color: "text-orange-400",
        hasLink: true,
      },
    ],
    [stats],
  );

  const showOrderDetailsModal = (order) => {
    const data = order.originalData ?? order;

    const renderObject = (obj, level = 0) => {
      return Object.entries(obj)
        .map(([key, value]) => {
          const padding = level * 16;

          if (value === null || value === undefined) {
            return `
                <div style="margin-left:${padding}px">
                  <span class="text-gray-400">${key}:</span>
                  <span class="text-gray-300 ml-2">—</span>
                </div>
              `;
          }

          if (typeof value === "object" && !Array.isArray(value)) {
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
      title: "Order Details",
      width: "900px",
      background: "#1e2640",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
      html: `
          <div class="text-left text-sm max-h-[500px] overflow-auto space-y-2">
            ${renderObject(data)}
          </div>
        `,
    });
  };

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
    // Transitional states — no longer silently dropped to UNKNOWN
    if (s === "starting") return "STARTING";
    if (s === "stopping") return "STOPPING";
    if (s === "rebooting") return "REBOOTING";
    if (s === "migrating") return "MIGRATING";
    if (s === "suspended") return "SUSPENDED";
    if (s === "rebuilding") return "REBUILDING";
    // Fallback: return actual status in uppercase instead of hiding it as UNKNOWN
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
      // Transitional states — all actions blocked until transition completes
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

  // ---------- TERMINATION OVERRIDE HANDLER ----------
  const handleTerminationOverride = async (vmId, enable) => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      DarkSwal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "Admin not authenticated",
      });
      return;
    }

    const actionText = enable
      ? "ENABLE termination protection (Prevent Destruction)"
      : "DISABLE termination protection (Allow Normal Expiry)";

    const confirm = await DarkSwal.fire({
      title: "Confirm Action",
      html: `<strong>${actionText}</strong><br/><br/>Are you sure?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: enable ? "Enable Protection" : "Disable Protection",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      DarkSwal.fire({
        title: "Updating",
        text: "Updating termination override...",
        allowOutsideClick: false,
        didOpen: () => DarkSwal.showLoading(),
      });

      const res = await fetch(
        `${BASE_URL}/api/admin/vms/${vmId}/termination-override?enabled=${enable}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update termination override");
      }

      const data = await res.json();

      DarkSwal.close();
      DarkSwal.fire({
        icon: "success",
        title: "Updated Successfully",
        text: data.statusDesc,
        timer: 3000,
        showConfirmButton: false,
      });
      await refetchOrders();
    } catch (err) {
      DarkSwal.fire({
        icon: "error",
        title: "Failed",
        text: err.message || "Termination override update failed",
      });
    }
  };

  // ---------- FETCH AVAILABLE IPS FOR VMID CHANGE ----------
  const fetchAvailableIps = async (serverId) => {
    const adminToken = localStorage.getItem("adminToken");

    const res = await fetch(
      `${BASE_URL}/api/admin/vms/${serverId}/available-ips`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return await res.json();
  };

  // ------- IP CHANGE HANDLER --------
  const handleChangeIp = async (order) => {
    // ⛔ Prevent double click
    if (ipChangeLoading[order.id]) return;
    setIpChangeLoading((p) => ({ ...p, [order.id]: true }));
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) return;

      const ips = await fetchAvailableIps(order.serverId);

      if (!ips.length) {
        DarkSwal.fire({
          icon: "warning",
          title: "No IPs Available",
          text: "No free IP addresses available on this server",
        });
        return;
      }

      const ipOptions = {};
      ips.forEach((i) => {
        ipOptions[i.id] = i.ip;
      });

      const { value: newIpId } = await DarkSwal.fire({
        title: "Change IP Address",
        html: `
        <p class="text-sm text-gray-300 mb-2">
          Current IP: <strong>${order.ipAddress || "N/A"}</strong>
        </p>
      `,
        input: "select",
        inputOptions: ipOptions,
        inputPlaceholder: "Select new IP",
        showCancelButton: true,
        confirmButtonText: "Change IP",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#6366f1",
        background: "#1e2640",
        color: "#ffffff",

        didOpen: () => {
          const select = Swal.getInput();

          if (select) {
            select.style.backgroundColor = "#0e1525";
            select.style.color = "#ffffff";
            select.style.border = "1px solid rgba(255,255,255,0.15)";
            select.style.borderRadius = "8px";
            select.style.padding = "10px";
          }
        },

        inputValidator: (value) => {
          if (!value) return "Please select an IP";
        },
      });

      if (!newIpId) return;

      const res = await fetch(
        `${BASE_URL}/api/admin/vms/${order.internalVmid}/change-ip`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newIpId: Number(newIpId) }),
        },
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      // Optimistic cache update — mutate React Query cache directly
      queryClient.setQueryData(
        ["admin-orders", page, size, statusFilter, debouncedSearch],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            vms: old.vms.map((vm) =>
              vm.dbOrderId === order.id
                ? { ...vm, ipAddress: ips.find((ip) => ip.id === Number(newIpId))?.ip }
                : vm
            ),
          };
        },
      );

      toast.success(
        "IP address changed successfully! It will take 30 seconds to reflect.",
      );
    } catch (err) {
      DarkSwal.fire({
        icon: "error",
        title: "IP Change Failed",
        text: err.message || "Failed to change IP",
      });
    } finally {
      setIpChangeLoading((p) => ({ ...p, [order.id]: false }));
    }
  };

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      <style>{`
              .swal2-popup {
                border-radius: 16px;
                border: 1px solid rgba(99,102,241,0.25);
                box-shadow: 0 0 30px rgba(99,102,241,0.15);
              }
                  
              .swal2-input,
              .swal2-select,
              .swal2-textarea {
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.08);
                color: #e5e7eb;
              }
                  
              .swal2-input::placeholder {
                color: #9ca3af;
              }
                  
              .swal2-confirm {
                box-shadow: 0 0 12px rgba(99,102,241,0.6);
              }
                  
              .swal2-cancel {
                background: #374151 !important;
                color: white !important;
              }
                  
              .swal2-container {
                z-index: 9999;
              }
          `}</style>

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
        {ordersLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
              <p className="text-gray-400">Fetching orders and insights...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Insights - Responsive Grid - Updated with more columns */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 mt-1">
                          {ins.subtitle}
                        </p>
                        {ins.hasDropdown && (
                          <div className="relative">
                            <select
                              value={selectedRevenuePeriod}
                              onChange={(e) =>
                                setSelectedRevenuePeriod(e.target.value)
                              }
                              className="appearance-none bg-[#0e1525]/70 border border-indigo-900/50 rounded-lg px-2 py-1 text-xs text-white cursor-pointer hover:bg-[#0e1525]/90 transition-colors"
                            >
                              <option value="all">All Time</option>
                              <option value="one_year">Last Year</option>
                              <option value="this_year">This Year</option>
                              <option value="this_month">This Month</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                          </div>
                        )}
                      </div>
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
              <div className="p-4 sm:p-6 border-b border-indigo-900/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Order List
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Showing {totalItems === 0 ? 0 : page * size + 1}–
                    {Math.min((page + 1) * size, totalItems)} of {totalItems}{" "}
                    orders
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {(() => {
                    const searchOptions = [
                      { value: "", label: "All Fields" },
                      { value: "ip", label: "IP Address" },
                      { value: "email", label: "Email Address" },
                      { value: "user_name", label: "Full Name" },
                      { value: "order_id", label: "Order ID" },
                      { value: "vmid", label: "VM ID" },
                      { value: "vm_name", label: "VM Name" },
                    ];
                    const activeLabel = searchOptions.find(o => o.value === searchBy)?.label || "All Fields";

                    return (
                      <div className="flex-1 min-w-[300px] relative group" ref={filterDropdownRef}>
                        <div className="flex items-center bg-[#0e1525] border border-indigo-900/50 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all duration-300">
                          <div className="pl-4 text-gray-400">
                            <Search className="w-4 h-4" />
                          </div>

                          <input
                            type="text"
                            placeholder={`Search by ${activeLabel.toLowerCase()}...`}
                            value={searchQuery}
                            onChange={(e) => {
                              fetchIntentRef.current = true;
                              setSearchQuery(e.target.value);
                              setPage(0);
                            }}
                            className="bg-transparent border-none text-white focus:ring-0 px-4 py-2.5 flex-1 placeholder-gray-500 text-sm"
                          />

                          {searchQuery && (
                            <button 
                              onClick={() => {
                                fetchIntentRef.current = true;
                                setSearchQuery("");
                                setPage(0);
                              }}
                              className="p-1 hover:bg-gray-700/50 rounded-full transition-colors mr-2 text-gray-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <div className="relative border-l border-indigo-900/30">
                            <button
                              onClick={() => setIsFilterOpen(!isFilterOpen)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-300 hover:text-white hover:bg-indigo-600/10 transition-all"
                            >
                              <span className="opacity-60 font-normal">Filter:</span> {activeLabel}
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isFilterOpen && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-[#0e1525] border border-indigo-900/50 rounded-xl shadow-2xl z-[60] py-1.5 animate-in fade-in zoom-in duration-200">
                                <div className="px-3 pb-1.5 mb-1.5 border-b border-indigo-900/30 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                                  Search Field
                                </div>
                                {searchOptions.map((opt) => (
                                  <button
                                    key={opt.value}
                                    onClick={() => {
                                      fetchIntentRef.current = true;
                                      setSearchBy(opt.value);
                                      setPage(0);
                                      setIsFilterOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                      searchBy === opt.value
                                        ? "bg-indigo-600/20 text-indigo-300 font-medium"
                                        : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        fetchIntentRef.current = true;
                        handleStatusChange(e);
                      }}
                      className="bg-[#0e1525] border border-indigo-900/40 rounded-lg pl-10 pr-10 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-indigo-500/60 transition-colors min-w-[170px] appearance-none cursor-pointer"
                    >
                      <option className="bg-[#0f172a]" value="">All Statuses</option>
                      <option className="bg-[#0f172a]" value="ACTIVE">ACTIVE</option>
                  <option className="bg-[#0f172a]" value="SUSPENDED">SUSPENDED</option>
                      <option className="bg-[#0f172a]" value="PENDING_PAYMENT">PENDING PAYMENT</option>
                      <option className="bg-[#0f172a]" value="MAINTENANCE">MAINTENANCE</option>
                      <option className="bg-[#0f172a]" value="ERROR">ERROR</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="relative w-full overflow-x-auto">
                {/* Loader shown ONLY for explicit user actions (pagination/search/filter).
                     Background 10s polls never set fetchIntentRef, so this stays hidden. */}
                {showTableLoader && (
                  <div className="absolute inset-0 z-20 bg-[#0e1525]/40 flex items-center justify-center backdrop-blur-[1px] transition-opacity">
                    <div className="flex items-center gap-2 bg-[#151c2f]/90 px-4 py-2 rounded-lg border border-indigo-900/40">
                      <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                      <span className="text-xs text-gray-400">
                        Loading...
                      </span>
                    </div>
                  </div>
                )}

                <div className="hidden lg:block">
                  <table className="w-full min-w-[1200px] text-left">
                    <thead className="bg-[#1a2337] text-gray-300 uppercase text-xs sm:text-sm">
                      <tr>
                        <th
                          onClick={() => requestSort("dbOrderId")}
                          className="py-3 px-6 cursor-pointer select-none hover:text-indigo-400"
                        >
                          <div className="flex items-center">
                            Order ID
                            <SortIcon
                              columnKey="dbOrderId"
                              sortConfig={sortConfig}
                            />
                          </div>
                        </th>
                        <th className="py-3 px-4 sm:px-6">Customer</th>
                        <th className="py-3 px-4 sm:px-6">Server</th>
                        <th className="py-3 px-4 sm:px-6">OS</th>
                        <th className="py-3 px-4 sm:px-6">Lock Status</th>
                        <th className="py-3 px-4 sm:px-6">IP</th>
                        <th
                          onClick={() => requestSort("expiresAt")}
                          className="py-3 px-6 cursor-pointer select-none hover:text-indigo-400"
                        >
                          <div className="flex items-center">
                            EXPIRE ON
                            <SortIcon
                              columnKey="expiresAt"
                              sortConfig={sortConfig}
                            />
                          </div>
                        </th>
                        <th
                          onClick={() => requestSort("monthlyPrice")}
                          className="py-3 px-6 cursor-pointer select-none hover:text-indigo-400"
                        >
                          <div className="flex items-center">
                            Monthly Price
                            <SortIcon
                              columnKey="monthlyPrice"
                              sortConfig={sortConfig}
                            />
                          </div>
                        </th>
                        <th
                          onClick={() => requestSort("paidAmount")}
                          className="py-3 px-6 cursor-pointer select-none hover:text-indigo-400"
                        >
                          <div className="flex items-center">
                            Paid Amount
                            <SortIcon
                              columnKey="paidAmount"
                              sortConfig={sortConfig}
                            />
                          </div>
                        </th>

                        <th className="py-3 px-4 sm:px-6">Status</th>
                        <th className="py-3 px-4 sm:px-6">Live Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <React.Fragment key={order.dbOrderId}>
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
                                <span>
                                  #{String(order.dbOrderId).slice(0, 8)}...
                                </span>
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
                                <span className="text-sm">
                                  {order.planType}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 sm:px-6">
                              <div className="text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px]">
                                {order.isoName}
                              </div>
                            </td>
                            <td className="py-3 px-4 sm:px-6">
                              <div className="flex items-center gap-2">
                                <select
                                  value={order.isLocked ? "locked" : "unlocked"}
                                  onChange={(e) =>
                                    handleVmLockToggle(
                                      order.id,
                                      e.target.value === "locked",
                                    )
                                  }
                                  className={`px-2 py-1 rounded text-xs border appearance-none cursor-pointer
        ${
          order.isLocked
            ? "bg-red-950/30 border-red-800 text-red-200 focus:ring-red-600 focus:ring-1 focus:outline-none"
            : "bg-emerald-950/30 border-emerald-800 text-emerald-200 focus:ring-emerald-600 focus:ring-1 focus:outline-none"
        }
      `}
                                >
                                  <option
                                    value="locked"
                                    className="bg-gray-900 text-gray-100"
                                  >
                                    Lock
                                  </option>
                                  <option
                                    value="unlocked"
                                    className="bg-gray-900 text-gray-100"
                                  >
                                    Unlock
                                  </option>
                                </select>

                                {order.isProtected && (
                                  <div title="Termination Protection Enabled">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                  </div>
                                )}
                              </div>
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
                              {order.expiresAt?.split("T")[0]}
                            </td>
                            <td className="py-3 px-4 sm:px-6 text-indigo-300 font-semibold">
                              {formatCurrency(order.monthlyPrice || 0)}
                            </td>

                            <td className="py-3 px-4 sm:px-6 text-emerald-300 font-bold">
                              {formatCurrency(order.paidAmount)}
                            </td>

                            <td className="py-3 px-4 sm:px-6">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    order.status,
                                  )}`}
                                >
                                  {order.status}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4 sm:px-6">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getLiveStatusColor(
                                  normalizeLiveStatus(order.liveState),
                                )}`}
                              >
                                {normalizeLiveStatus(order.liveState)}
                              </span>
                            </td>
                          </tr>

                          {/* EXPANDED DROPDOWN ROW - Responsive */}
                          {expandedRow === order.id && (
                            <tr className="bg-[#0f172a] border-t border-indigo-900/30">
                              <td colSpan="12" className="p-0">
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

                                        {order.vmid !== null &&
                                          order.vmid !== undefined && (
                                            <div className="pt-3 border-t border-indigo-900/30">
                                              <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs sm:text-sm text-gray-400">
                                                  VM ID
                                                </span>

                                                <div className="flex items-center gap-2">
                                                  <code className="bg-indigo-900/30 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-mono">
                                                    {order.vmid}
                                                  </code>

                                                  <button
                                                    onClick={() =>
                                                      handleVmidEdit(
                                                        order.vmid,
                                                        order.internalVmid,
                                                      )
                                                    }
                                                    className="p-1 rounded-md bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white transition"
                                                    title="Edit VMID"
                                                  >
                                                    <Edit className="w-3 h-3" />
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          )}

                                        <div className="pt-4 border-t border-indigo-900/30">
                                          <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs sm:text-sm text-gray-400">
                                              IP Address
                                            </span>

                                            <div className="flex items-center gap-2">
                                              <code className="bg-indigo-900/30 px-3 py-1 rounded text-xs sm:text-sm font-mono">
                                                {order.ipAddress || "N/A"}
                                              </code>

                                              <button
                                                onClick={() =>
                                                  handleChangeIp(order)
                                                }
                                                disabled={
                                                  ipChangeLoading[order.id]
                                                }
                                                className={`px-2 py-1 rounded-md text-xs transition
        ${
          ipChangeLoading[order.id]
            ? "bg-gray-600/40 text-gray-400 cursor-not-allowed"
            : "bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white"
        }`}
                                              >
                                                {ipChangeLoading[order.id]
                                                  ? "Changing..."
                                                  : "Change"}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
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
                                        <div className="grid grid-c grid-cols-2 gap-3 sm:gap-4">
                                          {/* Created At */}
                                          <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                              <span>Created</span>
                                            </div>
                                            <p className="text-xs sm:text-sm font-medium text-white">
                                              {formatDate(order.createdAt)}
                                            </p>
                                          </div>

                                          {/* Expiry At */}
                                          <div className="bg-[#0e1525]/50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                              <span>Expiry</span>
                                            </div>
                                            <p className="text-xs sm:text-sm font-medium text-white">
                                              {order.expiresAt
                                                ? formatDate(order.expiresAt)
                                                : "N/A"}
                                            </p>

                                            {/* Update Expiry Button */}
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleUpdateExpiry(order)
                                              }
                                              className="mt-2 w-full px-2 py-1.5 text-xs
        border border-indigo-500/40
        hover:bg-indigo-500/10
        text-indigo-300 rounded-md transition"
                                            >
                                              Update Expiry
                                            </button>
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

                                        {/* Parent Server Details */}
                                        <div className="pt-3 border-t border-indigo-900/30 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs sm:text-sm text-gray-400">
                                              Parent Server Node
                                            </span>
                                            <code className="bg-indigo-900/30 px-2 py-1 rounded text-xs sm:text-sm font-mono">
                                              {order.originalData
                                                ?.parentServerNode || "N/A"}
                                            </code>
                                          </div>

                                          <div className="flex items-center justify-between">
                                            <span className="text-xs sm:text-sm text-gray-400">
                                              Parent Server IP
                                            </span>
                                            <code className="bg-indigo-900/30 px-2 py-1 rounded text-xs sm:text-sm font-mono">
                                              {order.originalData
                                                ?.parentServerIp || "N/A"}
                                            </code>
                                          </div>
                                        </div>

                                        <div className="pt-4 border-t border-indigo-900/30">
                                          <button
                                            onClick={() =>
                                              showOrderDetailsModal(order)
                                            }
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                                          >
                                            <Eye className="w-4 h-4" />
                                            View Full Order Details
                                          </button>
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
                                                {order.user.billingAddress.city}
                                                ,{" "}
                                                {
                                                  order.user.billingAddress
                                                    .state
                                                }
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
                                      onClick={() => {
                                        if (normalizeLiveStatus(order.liveState) === "START") {
                                          navigate(
                                            `/admin/vms/${order.internalVmid}/performance`,
                                            {
                                              state: {
                                                vmid: order.internalVmid,
                                                serverId: order.serverId,
                                                vmName: order.vmName,
                                              },
                                            },
                                          );
                                        }
                                      }}
                                      disabled={normalizeLiveStatus(order.liveState) !== "START"}
                                      className={`flex-1 sm:flex-none px-3 py-2 border disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition ${
                                        normalizeLiveStatus(order.liveState) === "START"
                                          ? "text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/20 hover:text-white"
                                          : "text-gray-500 border-gray-600 bg-gray-700/40"
                                      }`}
                                    >
                                      <Activity className="w-4 h-4" />
                                      Performance
                                    </button>

                                    <button
                                      onClick={() =>
                                        handlePowerAction(order.id, "start")
                                      }
                                      disabled={
                                        !canAction(order.liveState, "start") ||
                                        powerLoading[order.id]
                                      }
                                      className="flex-1 sm:flex-none px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 text-white rounded-lg font-medium text-sm"
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
                                      className="flex-1 sm:flex-none px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700 text-white rounded-lg font-medium text-sm"
                                    >
                                      Stop
                                    </button>

                                    <button
                                      onClick={() =>
                                        handlePowerAction(order.id, "hibernate")
                                      }
                                      disabled={
                                        !canAction(
                                          order.liveState,
                                          "hibernate",
                                        ) || powerLoading[order.id]
                                      }
                                      className="flex-1 sm:flex-none px-3 py-2 border border-indigo-500/30 hover:bg-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent text-indigo-300 rounded-lg font-medium text-sm"
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
                                      className="flex-1 sm:flex-none px-3 py-2 border border-indigo-500/30 hover:bg-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent text-indigo-300 rounded-lg font-medium text-sm"
                                    >
                                      Resume
                                    </button>

                                    <button
                                      onClick={() =>
                                        promptRebuildWithIso(order.id)
                                      }
                                      disabled={adminActionLoading[order.id]}
                                      className="flex-1 sm:flex-none px-3 py-2 border border-red-500/30 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent text-red-300 rounded-lg font-medium text-sm"
                                    >
                                      Rebuild
                                    </button>

                                    <button
                                      onClick={() =>
                                        handlePowerAction(order.id, "reboot")
                                      }
                                      disabled={
                                        !canAction(order.liveState, "reboot") ||
                                        powerLoading[order.id]
                                      }
                                      className="flex-1 sm:flex-none px-3 py-2 border border-red-500/30 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent text-red-300 rounded-lg font-medium text-sm"
                                    >
                                      Hard Reboot
                                    </button>

                                    <button
                                      onClick={() => handleEasyReboot(order.id)}
                                      disabled={adminActionLoading[order.id]}
                                      className="flex-1 sm:flex-none px-3 py-2 border border-yellow-500/30
      hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
      text-yellow-300 rounded-lg font-medium text-sm"
                                    >
                                      Easy Reboot
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleTerminationOverride(
                                          order.internalVmid,
                                          true,
                                        )
                                      }
                                      disabled={order.isProtected}
                                      className="flex-1 sm:flex-none px-3 py-2 border border-emerald-500/40
      hover:bg-emerald-500/10 text-emerald-300 rounded-lg font-medium text-sm
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    >
                                      Enable Protection
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleTerminationOverride(
                                          order.internalVmid,
                                          false,
                                        )
                                      }
                                      disabled={!order.isProtected}
                                      className="flex-1 sm:flex-none px-3 py-2 border border-orange-500/40
      hover:bg-orange-500/10 text-orange-300 rounded-lg font-medium text-sm
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    >
                                      Disable Protection
                                    </button>

                                    <button
                                      onClick={() => handleDestroy(order.id)}
                                      disabled={adminActionLoading[order.id]}
                                      className="flex-1 sm:flex-none px-3 py-2 border border-red-700/40
      hover:bg-red-700/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
      text-red-400 rounded-lg font-medium text-sm"
                                    >
                                      Destroy
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
                        key={order.dbOrderId}
                        className="bg-[#1a2337] border border-indigo-900/30 rounded-lg p-4"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-white">
                                #{String(order.dbOrderId).slice(0, 8)}...
                              </h3>
                              <p className="text-sm text-gray-400">
                                {order.user?.firstName} {order.user?.lastName}
                              </p>
                            </div>
                            <button
                              onClick={() => toggleRow(order.id)}
                              className="p-1 hover:bg-indigo-900/30 rounded"
                            >
                              {expandedRow === order.id ? (
                                <ChevronUp className="w-4 h-4 text-indigo-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-indigo-400" />
                              )}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Server:</span>
                              <p className="text-white">{order.planType}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">OS:</span>
                              <p className="text-white truncate">
                                {order.isoName}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">IP:</span>
                              <p className="text-white">
                                {order.ipAddress || "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">Monthly:</span>
                              <p className="text-indigo-300 font-semibold">
                                {formatCurrency(order.monthlyPrice)}
                              </p>
                            </div>

                            <div>
                              <span className="text-gray-400">Paid:</span>
                              <p className="text-emerald-300 font-bold">
                                {formatCurrency(order.totalAmount)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status,
                              )}`}
                            >
                              {order.status}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getLiveStatusColor(
                                normalizeLiveStatus(order.liveState),
                              )}`}
                            >
                              {normalizeLiveStatus(order.liveState)}
                            </span>
                          </div>

                          {/* Mobile Expanded View */}
                          {expandedRow === order.id && (
                            <div className="mt-4 pt-4 border-t border-indigo-900/30">
                              {/* Add mobile expanded content here */}
                              <div className="space-y-3">
                                <div>
                                  <span className="text-gray-400 text-sm">
                                    Customer Email:
                                  </span>
                                  <p className="text-white break-all">
                                    {order.user?.email}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-400 text-sm">
                                    Created:
                                  </span>
                                  <p className="text-white">
                                    {formatDate(order.createdAt)}
                                  </p>
                                </div>
                                {/* Add more mobile details as needed */}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pagination - Responsive */}
              <Pagination
                currentPage={page + 1} // UI is 1-based
                totalPages={totalPages}
                onPageChange={(p) => { fetchIntentRef.current = true; setPage(p - 1); }}
                showingFrom={page * size + 1}
                showingTo={Math.min((page + 1) * size, totalItems)}
                totalItems={totalItems}
              />
            </div>
            {/* Empty State */}
            {orders.length === 0 && !ordersLoading && (
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
