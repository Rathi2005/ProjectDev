import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom"; // Add this import
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import Swal from "sweetalert2";
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
  Trash2,
  Database,
  TrendingUp,
  BarChart3,
  Users, // Add this import
  ExternalLink, // Add this import
  Eye, // Add this import
  Edit,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [selectedRevenuePeriod, setSelectedRevenuePeriod] = useState("all");
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const DarkSwal = Swal.mixin({
    background: "#1e2640",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#4b5563",
    buttonsStyling: true,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State for additional insights
  const [revenueStats, setRevenueStats] = useState({
    all: 0,
    one_year: 0,
    this_year: 0,
    this_month: 0,
  });
  const [deletedVmsCount, setDeletedVmsCount] = useState(0);
  const [garbageRecordsCount, setGarbageRecordsCount] = useState(0);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

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
        DarkSwal.fire({
          icon: "error",
          title: "Unauthorized",
          text: "Please login again",
          timer: 3000,
          showConfirmButton: false,
        });
        return;
      }

      const data = await res.json();

      const transformedOrders = Array.isArray(data)
        ? data.map((order) => ({
            // UI identity
            id: order.dbOrderId, // used everywhere in UI
            dbOrderId: order.dbOrderId,

            // VM / infra identifiers
            serverId: order.serverId,
            vmid: order.proxmoxVmid,

            internalVmid: order.internalVmId,

            // Display info
            vmName: order.vmName,
            isoName: order.os, // ✅ os → isoName
            planType: order.planType,

            // Resources
            cores: order.cores,
            ramMb: order.ramMb,
            diskGb: order.diskGb,

            // Network
            ipAddress: order.ipAddress || "",

            // Dates
            createdAt: order.createdAt,
            expiresAt: order.expiresAt,

            // Billing
            priceTotal: order.totalAmount, // ✅ totalAmount → priceTotal
            totalAmount: order.totalAmount,

            // Status
            status: order.status,
            liveState: order.liveState,

            // Customer (normalize to user object)
            user: {
              firstName: order.customerName || "—",
              lastName: "",
              email: order.customerEmail || "—",
              billingAddress: order.billingAddress || null,
            },

            // Keep original for API calls
            originalData: order,
          }))
        : [];

      setOrders(transformedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      DarkSwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch orders",
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  }

  // Fetch Orders from API
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch additional insights
  // Fetch additional insights
  // Update the fetchInsights function in your OrdersPage.jsx
  // Fetch additional insights
  useEffect(() => {
    async function fetchInsights() {
      try {
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) return;

        setLoadingInsights(true);

        // Fetch revenue stats
        const revenueActions = ["all", "one_year", "this_year", "this_month"];
        const revenuePromises = revenueActions.map(async (action) => {
          try {
            const res = await fetch(
              `${BASE_URL}/admin/revenue/stats?action=${action}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${adminToken}`,
                },
              }
            );

            if (res.ok) {
              const data = await res.json();
              return {
                action,
                revenue: data.revenue || data.totalRevenue || 0,
              };
            }
            return { action, revenue: 0 };
          } catch (error) {
            console.error(`Error fetching ${action} revenue:`, error);
            return { action, revenue: 0 };
          }
        });

        // Fetch deleted VMs count
        const deletedVmsPromise = fetch(
          `${BASE_URL}/admin/records/deleted-vms`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
          }
        )
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              // Handle both array and object responses
              if (Array.isArray(data)) {
                return data.length;
              } else if (data && typeof data === "object") {
                // If it's an object with a count property
                return data.count || data.length || 0;
              }
              return 0;
            }
            return 0;
          })
          .catch(() => 0);

        // Fetch garbage records count
        const garbageRecordsPromise = fetch(
          `${BASE_URL}/admin/garbage/records`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
          }
        )
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              // Handle both array and object responses
              if (Array.isArray(data)) {
                return data.length;
              } else if (data && typeof data === "object") {
                return data.count || data.length || 0;
              }
              return 0;
            }
            return 0;
          })
          .catch(() => 0);

        // Fetch user count - Updated to handle the new API response format
        const userCountPromise = fetch(`${BASE_URL}/admin/users/overview`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              // Handle different response formats
              if (Array.isArray(data)) {
                // Count unique users from the array
                const uniqueUsers = new Set(
                  data.map((user) => user.userId || user.id)
                );
                return uniqueUsers.size;
              } else if (data && typeof data === "object") {
                // If it's an object with users array
                if (Array.isArray(data.users)) {
                  return data.users.length;
                }
                // If it's an object with count
                return data.count || 0;
              }
              return 0;
            }
            return 0;
          })
          .catch(() => 0);

        // Wait for all promises
        const [revenueResults, deletedCount, garbageCount, userCount] =
          await Promise.all([
            Promise.all(revenuePromises),
            deletedVmsPromise,
            garbageRecordsPromise,
            userCountPromise,
          ]);

        // Process revenue results
        const revenueStatsObj = {};
        revenueResults.forEach(({ action, revenue }) => {
          revenueStatsObj[action] = revenue;
        });

        setRevenueStats(revenueStatsObj);
        setDeletedVmsCount(deletedCount);
        setGarbageRecordsCount(garbageCount);
        setUserCount(userCount);
      } catch (err) {
        console.error("Error fetching insights:", err);
      } finally {
        setLoadingInsights(false);
      }
    }

    fetchInsights();
  }, []);

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

      await fetchOrders();

      DarkSwal.close();
      DarkSwal.fire({
        icon: "success",
        title: "Success",
        text: `VM ${action.toUpperCase()} command sent successfully`,
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
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
        `${BASE_URL}/admin/vms/order/${orderId}/reboot-easy`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
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
    } catch (err) {
      console.error(err);
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
      `${BASE_URL}/admin/servers/${serverId}/isos/details`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      }
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
          `${BASE_URL}/admin/vms/order/${orderId}/rebuild?isoId=${isoId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          }
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
      } catch (err) {
        console.error(err);
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
      console.error(err);
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

      const res = await fetch(`${BASE_URL}/admin/vms/order/${orderId}/remove`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!res.ok) throw new Error(await res.text());

      DarkSwal.close();
      DarkSwal.fire({
        icon: "success",
        title: "Success",
        text: "VM removal initiated",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
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
      inputLabel: `Current VMID: ${currentVmid}`,
      inputPlaceholder: "Enter new VMID (e.g., 105)",
      inputValue: currentVmid,
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
        `${BASE_URL}/admin/vms/${currentVmid}/manual-vmid-sync?newVmid=${newVmid}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ newProxmoxVmid: Number(newVmid) }),
        }
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

      // Refresh orders
      fetchOrders();
    } catch (err) {
      console.error(err);
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

    // Calculate active revenue from local orders
    const activeRevenue = orders
      .filter((order) => order.status === "ACTIVE" || order.status === "Active")
      .reduce((sum, order) => sum + (order.priceTotal || 0), 0);

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
      }).format(amount || 0);
    };

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
        title: "Total Users",
        value: userCount,
        icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />,
        subtitle: "Registered users",
        color: "text-blue-400",
        hasLink: true,
        linkTo: "/admin/users-overview",
        linkText: "View All Users",
      },
      {
        title: "Active Revenue",
        value: formatCurrency(activeRevenue),
        icon: (
          <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
        ),
        subtitle: "From active orders",
        color: "text-emerald-400",
      },
      {
        title: "Total Revenue",
        value: formatCurrency(revenueStats[selectedRevenuePeriod]),
        icon: <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />,
        subtitle: getRevenueSubtitle(selectedRevenuePeriod),
        color: "text-purple-400",
        hasDropdown: true,
      },
      {
        title: "Deleted VMs",
        value: deletedVmsCount,
        icon: <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />,
        subtitle: "Permanently removed",
        color: "text-red-400",
        hasLink: true,
        linkTo: "/admin/deleted-vms",
        linkText: "View Details",
      },
      {
        title: "Garbage Records",
        value: garbageRecordsCount,
        icon: <Database className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />,
        subtitle: "Cleanup needed",
        color: "text-orange-400",
        hasLink: true,
        linkTo: "/admin/garbage-records",
        linkText: "View Details",
      },
    ];
  }, [
    orders,
    revenueStats,
    deletedVmsCount,
    garbageRecordsCount,
    userCount, // Add this dependency
    selectedRevenuePeriod,
  ]);

  const showOrderDetailsModal = (order) => {
    Swal.fire({
      title: "Order Full Details",
      html: `
      <div class="text-left">
        <pre class="text-xs bg-[#0b1220] p-4 rounded-lg overflow-auto max-h-[500px] text-gray-200">
${JSON.stringify(order.originalData ?? order, null, 2)}
        </pre>
      </div>
    `,
      width: "900px",
      confirmButtonText: "Close",
      background: "#1e2640",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
    });
  };

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
    if (s === "hibernated/paused") return "HIBERNATE";
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
        {loading || loadingInsights ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
              <p className="text-gray-400">Fetching orders and insights...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Insights - Responsive Grid - Updated with more columns */}
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

                      {/* Add link button if hasLink is true */}
                      {ins.hasLink && (
                        <div className="mt-3 pt-3 border-t border-indigo-900/30">
                          <Link
                            to={ins.linkTo}
                            className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 transition-colors hover:underline"
                          >
                            <Eye className="w-3 h-3" />
                            {ins.linkText}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
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
              {/* Responsive Table */}
              <div className="relative w-full overflow-x-auto">
                <div className="hidden lg:block">
                  <table className="w-full min-w-[1200px] text-left">
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
                      </tr>
                    </thead>

                    <tbody>
                      {currentOrders.map((order) => (
                        <React.Fragment key={order.dbOrderId}>
                          {/* CLICKABLE MAIN ROW */}
                          <tr
                            className={`border-t border-indigo-900/20 hover:bg-indigo-900/10 transition-all ${
                              expandedRow === order.dbOrderId
                                ? "bg-indigo-900/10"
                                : ""
                            }`}
                          >
                            <td className="py-3 px-4 sm:px-6">
                              <button
                                onClick={() => toggleRow(order.dbOrderId)}
                                className="text-left w-full flex items-center gap-2 text-indigo-300 font-medium hover:text-indigo-200 transition-colors"
                              >
                                {expandedRow === order.dbOrderId ? (
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
                              {formatCurrency(order.totalAmount)}
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
                          </tr>
                          {console.log(order)}

                          {/* EXPANDED DROPDOWN ROW - Responsive */}
                          {expandedRow === order.id && (
                            <tr className="bg-[#0f172a] border-t border-indigo-900/30">
                              <td colSpan="11" className="p-0">
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
                                                      order.internalVmid
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

                                    <button
                                      onClick={() =>
                                        promptRebuildWithIso(order.id)
                                      }
                                      disabled={adminActionLoading[order.id]}
                                      className="flex-1 sm:flex-none px-3 py-2 border border-red-500/30 hover:bg-red-500/10 disabled:opacity-50 text-red-300 rounded-lg font-medium text-sm"
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
                                      className="flex-1 sm:flex-none px-3 py-2 border border-red-500/30 hover:bg-red-500/10 disabled:opacity-50 text-red-300 rounded-lg font-medium text-sm"
                                    >
                                      Hard Reboot
                                    </button>

                                    <button
                                      onClick={() => handleEasyReboot(order.id)}
                                      disabled={adminActionLoading[order.id]}
                                      className="flex-1 sm:flex-none px-3 py-2 border border-yellow-500/30
             hover:bg-yellow-500/10 disabled:opacity-50
             text-yellow-300 rounded-lg font-medium text-sm"
                                    >
                                      Easy Reboot
                                    </button>

                                    <button
                                      onClick={() => handleDestroy(order.id)}
                                      disabled={adminActionLoading[order.id]}
                                      className="flex-1 sm:flex-none px-3 py-2 border border-red-700/40
             hover:bg-red-700/20 disabled:opacity-50
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
                    {currentOrders.map((order) => (
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
                              <span className="text-gray-400">Price:</span>
                              <p className="text-green-300 font-semibold">
                                {formatCurrency(order.totalAmount)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getLiveStatusColor(
                                normalizeLiveStatus(order.liveState)
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
