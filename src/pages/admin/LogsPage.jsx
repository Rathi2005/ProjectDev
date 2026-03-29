// AdminLogsPage.jsx
import React, { useState, useEffect } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  AlertCircle,
  Clock,
  Server,
  Activity,
  Globe,
  Hash,
  Download,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Info,
  MoreVertical,
  Calendar,
  User,
  Cpu,
  Network,
  HardDrive,
  FileText,
  Plus,
  Trash,
  Pause,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { useDebounce } from "../../hooks/useDebounce";

export default function AdminLogsPage() {
  const [activeTab, setActiveTab] = useState("operations");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [sortConfig, setSortConfig] = useState({
    field: "timestamp",
    direction: "desc",
  });
  const [error, setError] = useState(null);
  const [expandedStackTrace, setExpandedStackTrace] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // ✅ Configure SweetAlert2 dark theme
  const swalDarkTheme = {
    customClass: {
      popup: "dark-swal-popup",
      title: "dark-swal-title",
      htmlContainer: "dark-swal-content",
      confirmButton: "dark-swal-confirm",
      cancelButton: "dark-swal-cancel",
      input: "dark-swal-input",
    },
    background: "#0f172a",
    color: "#e2e8f0",
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#ef4444",
  };

  // ✅ Add SweetAlert2 styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .dark-swal-popup {
        background: #0f172a !important;
        border: 1px solid #334155 !important;
        border-radius: 0.75rem !important;
      }
      .dark-swal-title {
        color: #e2e8f0 !important;
        font-size: 1.5rem !important;
        font-weight: 600 !important;
      }
      .dark-swal-content {
        color: #cbd5e1 !important;
        font-size: 1rem !important;
      }
      .dark-swal-content pre {
        background: #1e293b !important;
        color: #e2e8f0 !important;
        padding: 1rem !important;
        border-radius: 0.5rem !important;
        overflow-x: auto !important;
        margin-top: 1rem !important;
      }
      .dark-swal-confirm {
        background-color: #3b82f6 !important;
        border: none !important;
        border-radius: 0.5rem !important;
        padding: 0.625rem 1.5rem !important;
        font-weight: 500 !important;
        transition: all 0.2s !important;
      }
      .dark-swal-confirm:hover {
        background-color: #2563eb !important;
        transform: translateY(-1px) !important;
      }
      .dark-swal-cancel {
        background-color: #4b5563 !important;
        border: none !important;
        border-radius: 0.5rem !important;
        padding: 0.625rem 1.5rem !important;
        font-weight: 500 !important;
        transition: all 0.2s !important;
      }
      .dark-swal-cancel:hover {
        background-color: #374151 !important;
        transform: translateY(-1px) !important;
      }
      .dark-swal-input {
        background-color: #1e293b !important;
        border: 1px solid #475569 !important;
        color: #e2e8f0 !important;
        border-radius: 0.5rem !important;
        padding: 0.75rem !important;
      }
      .dark-swal-input:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Tabs configuration with theme colors
  const tabs = [
    {
      id: "operations",
      label: "Operations",
      icon: Activity,
      color: "blue",
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      id: "expiry",
      label: "Expiry",
      icon: Clock,
      color: "yellow",
      gradient: "from-yellow-600 to-orange-600",
    },
    {
      id: "errors",
      label: "Errors",
      icon: AlertCircle,
      color: "red",
      gradient: "from-red-600 to-pink-600",
    },
    {
      id: "ip-changes",
      label: "IP Changes",
      icon: Globe,
      color: "green",
      gradient: "from-green-600 to-teal-600",
    },
    {
      id: "vmid-changes",
      label: "VMID Changes",
      icon: Hash,
      color: "purple",
      gradient: "from-purple-600 to-pink-600",
    },
  ];

  // Fetch logs
  useEffect(() => {
    fetchLogs();
  }, [
    activeTab,
    pagination.page,
    pagination.size,
    debouncedSearch,
    sortConfig,
  ]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("adminToken");
      const getDefaultSortField = () => {
        switch (activeTab) {
          case "expiry":
            return "createdAt";
          case "errors":
            return "failureTimestamp";
          case "ip-changes":
          case "vmid-changes":
            return "changedAt";
          default:
            return "timestamp";
        }
      };

      const sortField =
        sortConfig.field === "timestamp"
          ? getDefaultSortField()
          : sortConfig.field;

      const params = new URLSearchParams({
        page: pagination.page,
        size: pagination.size,
        ...(debouncedSearch && { search: debouncedSearch }), // remove empty search
        sort: `${sortField},${sortConfig.direction}`,
      });

      const response = await fetch(
        `${BASE_URL}/api/admin/logs/${activeTab}?${params}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 403) {
          toast.error("Unauthorized access");
          navigate("/admin/login");
          return;
        }
        throw new Error("Failed to fetch logs");
      }

      const data = await response.json();
      setLogs(data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
      }));
    } catch (err) {
      setError(err.message);
      toast.error("Error loading logs");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (event) => {
    setPagination((prev) => ({
      ...prev,
      size: parseInt(event.target.value),
      page: 0,
    }));
  };

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleRefresh = () => {
    fetchLogs();
    toast.success("Logs refreshed");
  };

  const handleExport = async () => {
    try {
      const result = await Swal.fire({
        ...swalDarkTheme,
        title: "Export Logs",
        html: `
          <div class="text-left space-y-4">
            <p class="text-gray-300">
              Export current view of <strong>${activeTab}</strong> logs to CSV?
            </p>
            <p class="text-gray-400 text-sm">
              This will export ${pagination.totalElements} records from page ${pagination.page + 1}.
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Export CSV",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        const csv = convertToCSV(logs);
        downloadCSV(
          csv,
          `${activeTab}-logs-${new Date().toISOString().split("T")[0]}.csv`,
        );
        toast.success("Export completed");
      }
    } catch (err) {
      toast.error("Export failed");
    }
  };

  const clearSearch = () => {
    setSearch("");
  };

  const handleViewDetails = (log) => {
    const formattedFields = Object.entries(log)
      .map(([key, value]) => {
        const displayValue =
          value === null || value === undefined || value === ""
            ? "—"
            : typeof value === "object"
              ? JSON.stringify(value, null, 2)
              : value;

        return `
        <div style="margin-bottom:10px;">
          <strong style="color:#93c5fd;">${key}</strong>
          <span style="color:#e2e8f0;">${displayValue}</span>
        </div>
      `;
      })
      .join("");

    Swal.fire({
      ...swalDarkTheme,
      title: "Log Details",
      html: `
      <div style="text-align:left; max-height:400px; overflow-y:auto;">
        ${formattedFields}
      </div>
    `,
      width: "700px",
      confirmButtonText: "Close",
    });
  };

  // Helper functions
  const getStatusColor = (status) => {
    const statusUpper = (status || "").toUpperCase();
    switch (statusUpper) {
      case "SUCCESS":
      case "COMPLETED":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "ERROR":
      case "FAILED":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      case "WARNING":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case "PENDING":
        return "text-blue-400 bg-blue-400/10 border-blue-400/30";
      default:
        return "text-gray-400 bg-gray-700/10 border-gray-700/30";
    }
  };

  const getStatusIcon = (status) => {
    const statusUpper = (status || "").toUpperCase();
    switch (statusUpper) {
      case "SUCCESS":
      case "COMPLETED":
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case "ERROR":
      case "FAILED":
        return <AlertCircle className="w-3 h-3 mr-1" />;
      case "WARNING":
        return <AlertTriangle className="w-3 h-3 mr-1" />;
      default:
        return <Info className="w-3 h-3 mr-1" />;
    }
  };

  const getActionIcon = (action) => {
    if (!action) return <Zap className="w-3 h-3" />;
    const actionLower = action.toLowerCase();
    if (actionLower.includes("start"))
      return <Zap className="w-3 h-3 text-green-400" />;
    if (actionLower.includes("stop"))
      return <Zap className="w-3 h-3 text-red-400" />;
    if (actionLower.includes("create"))
      return <Plus className="w-3 h-3 text-green-400" />;
    if (actionLower.includes("delete"))
      return <Trash className="w-3 h-3 text-red-400" />;
    if (actionLower.includes("suspend"))
      return <Pause className="w-3 h-3 text-yellow-400" />;
    if (actionLower.includes("ip"))
      return <Globe className="w-3 h-3 text-blue-400" />;
    if (actionLower.includes("vmid"))
      return <Hash className="w-3 h-3 text-purple-400" />;
    return <Activity className="w-3 h-3 text-gray-400" />;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // CSV export helpers
  const convertToCSV = (logs) => {
    if (logs.length === 0) return "";

    const headers = Object.keys(logs[0]).join(",");
    const rows = logs.map((log) =>
      Object.values(log)
        .map((value) =>
          typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value,
        )
        .join(","),
    );

    return [headers, ...rows].join("\n");
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Render log row based on active tab
  const renderLogRow = (log, index) => {
    const baseClasses = `${
      index % 2 === 0 ? "bg-[#141b2e]" : "bg-[#19223c]"
    } hover:bg-indigo-900/20 transition-all duration-300`;

    switch (activeTab) {
      case "ip-changes":
      case "vmid-changes":
        return (
          <tr key={log.id || index} className={baseClasses}>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <span className="text-sm text-gray-300">
                {formatTimestamp(log.timestamp)}
              </span>
            </td>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <div className="flex items-center">
                {getActionIcon(log.action)}
                <span className="text-sm text-gray-300 ml-1">
                  {log.userEmail || "—"}
                </span>
              </div>
            </td>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <span className="text-sm text-indigo-300 font-mono">
                {log.vmId || "—"}
              </span>
            </td>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <span className="text-sm line-through text-red-400 font-mono">
                  {log.oldValue ?? "—"}
                </span>

                <span className="text-gray-500">→</span>
                <span className="text-sm text-green-400 font-medium font-mono">
                  {log.newValue ?? "—"}
                </span>
              </div>
            </td>
            <td className="px-4 py-3 max-w-xs">
              <div
                className="text-sm text-gray-400 truncate"
                title={log.details}
              >
                {log.details || "—"}
              </div>
            </td>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(log);
                }}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs transition-all duration-300"
              >
                View Details
              </button>
            </td>
          </tr>
        );

      case "errors":
        return (
          <tr
            key={log.id || index}
            className={`${baseClasses} cursor-pointer`}
            onClick={() => handleViewDetails(log)}
          >
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <span className="text-sm text-gray-300">
                {formatTimestamp(log.timestamp)}
              </span>
            </td>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-400/10 text-red-400 border border-red-400/30">
                {log.action || "ERROR"}
              </span>
            </td>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <span className="text-sm text-gray-300">
                {log.userEmail || "—"}
              </span>
            </td>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <span className="text-sm text-indigo-300 font-mono">
                {log.vmId || "—"}
              </span>
            </td>
            <td className="px-4 py-3 max-w-xs">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                <span
                  className="text-sm text-gray-400 truncate"
                  title={log.details}
                >
                  {log.details || "—"}
                </span>
              </div>
            </td>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(log);
                }}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs transition-all duration-300"
              >
                View Details
              </button>
            </td>
          </tr>
        );

      default: // operations and expiry
        return (
          <tr key={log.id || index} className={baseClasses}>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <span className="text-sm text-gray-300">
                {formatTimestamp(log.timestamp)}
              </span>
            </td>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <div className="flex items-center">
                {getActionIcon(log.action)}
                <span className="text-sm font-medium text-gray-200 ml-1">
                  {log.action || "—"}
                </span>
              </div>
            </td>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center ${getStatusColor(log.status)}`}
              >
                {getStatusIcon(log.status)}
                {log.status || "—"}
              </span>
            </td>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <span className="text-sm text-gray-300">
                {log.userEmail || "—"}
              </span>
            </td>
            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <div className="flex items-center">
                <Server className="w-3 h-3 text-indigo-400 mr-1" />
                <span className="text-sm text-gray-300">
                  {log.vmName || "—"}
                </span>
                {log.vmId && (
                  <span className="text-xs text-gray-500 ml-1 font-mono">
                    (ID: {log.vmId})
                  </span>
                )}
              </div>
            </td>
            <td className="px-4 py-3 w-[28%]">
              <div
                className="text-sm text-gray-400 break-words whitespace-pre-wrap line-clamp-2"
                title={log.details}
              >
                {log.details || "—"}
              </div>
            </td>

            <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(log);
                }}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs transition-all duration-300"
              >
                View Details
              </button>
            </td>
          </tr>
        );
    }
  };

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      {/* Main Content */}
      <main className="flex-1 mt-[72px] p-4 sm:p-10 space-y-8">
        {/* Header Section */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/admin/settings")}
              className="group flex items-center justify-center w-10 h-10 rounded-xl  hover:bg-indigo-600/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                System Logs
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                View and monitor all system activities, errors, and changes
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white px-4 py-2 rounded-xl border border-indigo-500/30 transition-all duration-300 text-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white px-4 py-2 rounded-xl border border-purple-500/30 transition-all duration-300 text-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-indigo-900/40">
          <nav className="flex flex-wrap -mb-px gap-2">
            {tabs.map(({ id, label, icon: Icon, gradient }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setPagination((prev) => ({ ...prev, page: 0 }));
                }}
                className={`
                  px-4 py-2 sm:px-6 sm:py-3 font-medium text-sm rounded-t-lg flex items-center gap-2
                  transition-all duration-300 relative
                  ${
                    activeTab === id
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                      : "text-gray-400 hover:text-gray-200 hover:bg-indigo-900/20"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.slice(0, 4)}</span>
                {activeTab === id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by email, VM name, IP, action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#151c2f] border border-indigo-900/40 rounded-xl pl-10 pr-10 py-3 text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-[#151c2f] border border-indigo-900/40 rounded-xl text-gray-400 hover:text-gray-200 flex items-center gap-2 transition-all duration-300"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          <select
            value={pagination.size}
            onChange={handlePageSizeChange}
            className="px-4 py-3 bg-[#151c2f] border border-indigo-900/40 rounded-xl text-gray-200 focus:border-indigo-500 outline-none"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-[#151c2f] border border-indigo-900/40 rounded-xl p-4 animate-fadeIn">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-400" />
              Advanced Filters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Date Range
                </label>
                <select className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300">
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Custom range</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Status
                </label>
                <select className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300">
                  <option>All</option>
                  <option>Success</option>
                  <option>Error</option>
                  <option>Warning</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">User</label>
                <input
                  type="text"
                  placeholder="Filter by user"
                  className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </p>
          </div>
        )}

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-2xl border border-indigo-900/40 shadow-lg">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-lg">No logs found</p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="w-full min-w-[1200px]">
              <table className="w-full text-left table-fixed border-collapse text-sm">
                <thead className="bg-[#151c2f] text-gray-300 uppercase tracking-wider text-xs">
                  <tr>
                    <th
                      className="px-4 py-3 sm:px-6 cursor-pointer hover:text-indigo-400 transition-colors"
                      onClick={() => handleSort("timestamp")}
                    >
                      <div className="flex items-center gap-1">
                        Timestamp
                        {sortConfig.field === "timestamp" && (
                          <span>
                            {sortConfig.direction === "desc" ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </th>

                    {activeTab === "ip-changes" ||
                    activeTab === "vmid-changes" ? (
                      <>
                        <th className="px-4 py-3 sm:px-6">User</th>
                        <th className="px-4 py-3 sm:px-6">VM ID</th>
                        <th className="px-4 py-3 sm:px-6">Change</th>
                        <th className="px-4 py-3 sm:px-6">Details</th>
                        <th className="px-4 py-3 sm:px-6">Actions</th>
                      </>
                    ) : activeTab === "errors" ? (
                      <>
                        <th className="px-4 py-3 sm:px-6">Action</th>
                        <th className="px-4 py-3 sm:px-6">User</th>
                        <th className="px-4 py-3 sm:px-6">VM ID</th>
                        <th className="px-4 py-3 sm:px-6">Details</th>
                        <th className="px-4 py-3 sm:px-6">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 sm:px-6">Action</th>
                        <th className="px-4 py-3 sm:px-6">Status</th>
                        <th className="px-4 py-3 sm:px-6">User</th>
                        <th className="px-4 py-3 sm:px-6">VM</th>
                        <th className="px-4 py-3 sm:px-6">Details</th>
                        <th className="px-4 py-3 sm:px-6">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => renderLogRow(log, index))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && logs.length > 0 && (
            <div className="bg-[#151c2f] px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between border-t border-indigo-900/40">
              <div className="text-sm text-gray-400 mb-3 sm:mb-0">
                Showing{" "}
                <span className="font-medium text-gray-200">
                  {pagination.page * pagination.size + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-200">
                  {Math.min(
                    (pagination.page + 1) * pagination.size,
                    pagination.totalElements,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-200">
                  {pagination.totalElements}
                </span>{" "}
                results
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={pagination.page === 0}
                  className="p-2 bg-[#1e293b] border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="p-2 bg-[#1e293b] border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-4 py-2 text-sm text-gray-400">
                  Page {pagination.page + 1} of {pagination.totalPages || 1}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="p-2 bg-[#1e293b] border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages - 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="p-2 bg-[#1e293b] border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-800/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-400 uppercase tracking-wider">
                  Total Logs
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {pagination.totalElements}
                </p>
              </div>
              <div className="p-3 bg-indigo-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-800/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-400 uppercase tracking-wider">
                  Current Page
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {pagination.page + 1}
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-800/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-400 uppercase tracking-wider">
                  Page Size
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {pagination.size}
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Filter className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-800/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-400 uppercase tracking-wider">
                  Total Pages
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {pagination.totalPages}
                </p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
