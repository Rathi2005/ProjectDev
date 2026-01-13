import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./adminHeader";
import Footer from "../user/Footer";
import MetricChart from "./liveGraphs/MetricChart";

import {
  Users,
  Server,
  BarChart3,
  CreditCard,
  Activity,
  Shield,
  AlertCircle,
  Clock,
  TrendingUp,
  Database,
  Network,
  Settings,
  Eye,
  Download,
  MoreVertical,
  Search,
  Filter,
  X,
  User,
  Package,
  HardDrive,
  Calendar,
  Mail,
  Phone,
  Globe,
  Cpu,
  MemoryStick,
  Wifi,
  LineChart,
  Cpu as CpuIcon,
  HardDrive as DiskIcon,
  Zap,
  Cloud,
  Power,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVMs: 0,
    runningVMs: 0,
    stoppedVMs: 0,
    totalServers: 0,
    onlineServers: 0,
    offlineServers: 0,
    totalRevenue: 45280,
    monthlyGrowth: 12.5,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const token = localStorage.getItem("adminToken");

  // State for VM data
  const [vmData, setVmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverLocations, setServerLocations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Fetch VM counts from API
  useEffect(() => {
    const fetchVmData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) return;

        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/admin/vms/direct-proxmox-count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch VM data");

        const data = await res.json();
        setVmData(data);

        // Calculate total stats
        const totalVMs = data.totalVmsAcrossCloud || 0;
        const runningVMs = data.totalRunning || 0;
        const stoppedVMs = data.totalStopped || 0;

        // Process server breakdown
        const serverBreakdown = data.serverBreakdown || {};
        const servers = Object.keys(serverBreakdown);
        const totalServers = servers.length;
        const onlineServers = servers.filter(
          (server) => serverBreakdown[server]?.status === "ONLINE"
        ).length;
        const offlineServers = totalServers - onlineServers;

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalVMs,
          runningVMs,
          stoppedVMs,
          totalServers,
          onlineServers,
          offlineServers,
        }));

        // Format server locations for display
        const locations = servers.map((server) => {
          const serverData = serverBreakdown[server];
          // Extract location from server name (e.g., "node6-noida" -> "Noida")
          const locationName = server.split("-").pop() || server;
          return {
            name: server,
            region:
              locationName.charAt(0).toUpperCase() + locationName.slice(1),
            servers: serverData.total || 0,
            running: serverData.running || 0,
            status:
              serverData.status === "ONLINE"
                ? "healthy"
                : serverData.status === "OFFLINE"
                ? "critical"
                : "warning",
            utilization:
              serverData.total > 0
                ? Math.round((serverData.running / serverData.total) * 100)
                : 0,
          };
        });

        setServerLocations(locations);
      } catch (err) {
        console.error("Error fetching VM data:", err);
        // Fallback to mock data if API fails
        setServerLocations([
          {
            region: "US East",
            servers: 45,
            status: "healthy",
            utilization: 82,
          },
          {
            region: "EU West",
            servers: 38,
            status: "healthy",
            utilization: 76,
          },
          {
            region: "Asia Pacific",
            servers: 29,
            status: "warning",
            utilization: 91,
          },
          {
            region: "US West",
            servers: 42,
            status: "healthy",
            utilization: 68,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVmData();
  }, []);

  // Fetch audit logs
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) return;

        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/admin/audit-logs/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch audit logs");

        const data = await res.json();

        // Normalize for UI
        const normalized = data.map((log) => ({
          id: log.id,
          user: log.userEmail,
          action: `${log.operation} on ${log.vmName}`,
          time: new Date(log.timestamp).toLocaleString(),
          type:
            log.status === "SUCCESS"
              ? "success"
              : log.status === "FAILED"
              ? "error"
              : "info",
          node: log.parentNodeName,
        }));

        setRecentActivity(normalized);
      } catch (err) {
        console.error("Audit log fetch failed:", err);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  // Mock data for search (you can replace with actual API calls)
  const [allData, setAllData] = useState({
    users: [],
    servers: [],
    orders: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    let results = [];

    if (searchCategory === "all" || searchCategory === "users") {
      results = [
        ...results,
        ...allData.users
          .filter(
            (user) =>
              user.name.toLowerCase().includes(query) ||
              user.email.toLowerCase().includes(query) ||
              user.plan.toLowerCase().includes(query)
          )
          .map((user) => ({ ...user, type: "user" })),
      ];
    }

    if (searchCategory === "all" || searchCategory === "servers") {
      results = [
        ...results,
        ...allData.servers
          .filter(
            (server) =>
              server.name.toLowerCase().includes(query) ||
              server.ip.includes(query) ||
              server.region.toLowerCase().includes(query) ||
              server.type.toLowerCase().includes(query)
          )
          .map((server) => ({ ...server, type: "server" })),
      ];
    }

    if (searchCategory === "all" || searchCategory === "orders") {
      results = [
        ...results,
        ...allData.orders
          .filter(
            (order) =>
              order.user.toLowerCase().includes(query) ||
              order.type.toLowerCase().includes(query) ||
              order.status.toLowerCase().includes(query) ||
              order.id.toString().includes(query)
          )
          .map((order) => ({ ...order, type: "order" })),
      ];
    }

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  }, [searchQuery, searchCategory, allData]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setIsSearchActive(true);
  };

  const handleSearchCategoryChange = (category) => {
    setSearchCategory(category);
    if (searchQuery) {
      setShowSearchResults(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
    setIsSearchActive(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
      case "active":
      case "running":
      case "completed":
      case "ONLINE":
      case "SUCCESS":
        return "text-green-400 bg-green-400/10";
      case "warning":
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "success":
        return "text-green-400 bg-green-400/10";
      case "error":
        return "text-red-400 bg-red-400/10";
      case "warning":
        return "text-yellow-400 bg-yellow-400/10";
      case "info":
        return "text-blue-400 bg-blue-400/10";
      case "critical":
      case "failed":
      case "inactive":
      case "OFFLINE":
      case "FAILED":
      case "stopped":
        return "text-red-400 bg-red-400/10";
      case "maintenance":
        return "text-gray-400 bg-gray-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy":
      case "ONLINE":
      case "running":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "warning":
      case "pending":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "critical":
      case "OFFLINE":
      case "stopped":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Server className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return (
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-xs">i</span>
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center">
            <span className="text-xs">?</span>
          </div>
        );
    }
  };

  const handleResultClick = (result) => {
    switch (result.type) {
      case "user":
        navigate(`/admin/users/${result.id}`);
        break;
      case "server":
        navigate(`/admin/servers/${result.id}`);
        break;
      case "order":
        navigate(`/admin/orders/${result.id}`);
        break;
    }
    clearSearch();
  };

  const searchCategories = [
    { id: "all", label: "All", icon: <Search className="w-4 h-4" /> },
    { id: "users", label: "Users", icon: <User className="w-4 h-4" /> },
    { id: "servers", label: "Servers", icon: <Server className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <CreditCard className="w-4 h-4" /> },
  ];

  // Calculate VM health percentage
  const vmHealthPercentage =
    stats.totalVMs > 0
      ? Math.round((stats.runningVMs / stats.totalVMs) * 100)
      : 0;

  // Calculate server health percentage
  const serverHealthPercentage =
    stats.totalServers > 0
      ? Math.round((stats.onlineServers / stats.totalServers) * 100)
      : 0;

  // Export audit logs function
  const exportAuditLogs = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/admin/audit-logs/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to export audit logs");
      }

      // Get the blob for CSV/Excel file
      const blob = await res.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Audit logs exported successfully!");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export audit logs");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e1420] via-[#121a2a] to-[#0e1420] text-white flex flex-col">
      {/* Header with Search */}
      <AdminHeader title="Admin Dashboard" onLogout={handleLogout} />

      {/* Global Search Bar */}
      <div className="px-4 md:px-6 lg:px-8 mt-4 relative z-40">
        <div className="max-w-4xl mx-auto">
          <div
            className={`relative transition-all duration-300 ${
              isSearchActive ? "scale-105" : ""
            }`}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => setIsSearchActive(true)}
                onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
                placeholder="Search across users, servers, orders..."
                className="w-full pl-12 pr-12 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search Category Filters */}
            <div className="flex items-center gap-2 mt-3">
              {searchCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleSearchCategoryChange(category.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    searchCategory === category.id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                  }`}
                >
                  {category.icon}
                  {category.label}
                </button>
              ))}
              <div className="ml-auto text-xs text-gray-500">
                {searchResults.length} results
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className={`p-4 hover:bg-gray-800/70 cursor-pointer transition-colors border-b border-gray-800/50 last:border-b-0 ${
                        index === 0 ? "border-t-0" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            result.type === "user"
                              ? "bg-blue-500/20"
                              : result.type === "server"
                              ? "bg-green-500/20"
                              : "bg-purple-500/20"
                          }`}
                        >
                          {getStatusIcon(result.type, result.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold truncate">
                              {result.type === "user" && result.name}
                              {result.type === "server" && result.name}
                              {result.type === "order" && `Order #${result.id}`}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                result.status
                              )}`}
                            >
                              {result.status}
                            </span>
                          </div>

                          <div className="text-sm text-gray-400 mb-2">
                            {result.type === "user" && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                <span>{result.email}</span>
                                <span className="mx-1">•</span>
                                <span>{result.plan}</span>
                              </div>
                            )}

                            {result.type === "server" && (
                              <div className="flex items-center flex-wrap gap-3">
                                <div className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  <span>{result.region}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Cpu className="w-3 h-3" />
                                  <span>{result.cpu} vCPU</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MemoryStick className="w-3 h-3" />
                                  <span>{result.ram}GB RAM</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Wifi className="w-3 h-3" />
                                  <span>{result.ip}</span>
                                </div>
                              </div>
                            )}

                            {result.type === "order" && (
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>{result.user}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{result.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CreditCard className="w-3 h-3" />
                                  <span>₹{result.amount}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-gray-500 flex items-center justify-between">
                            <span className="capitalize">{result.type}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Click to view details
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-gray-800/50 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      Press{" "}
                      <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">
                        Enter
                      </kbd>{" "}
                      to view all results
                    </span>
                    <button
                      onClick={() => {
                        navigate(
                          `/admin/search?q=${encodeURIComponent(
                            searchQuery
                          )}&category=${searchCategory}`
                        );
                        clearSearch();
                      }}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      View all results
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* No Results */}
            {showSearchResults && searchResults.length === 0 && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 p-6 bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl z-50 text-center">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-1">No results found</h4>
                <p className="text-gray-400 text-sm">
                  No matches for "
                  <span className="text-white">{searchQuery}</span>" in{" "}
                  {searchCategory}
                </p>
                <button
                  onClick={clearSearch}
                  className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 mt-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Total VMs */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] p-5 md:p-6 rounded-xl border border-gray-800/50 shadow-lg hover:shadow-indigo-500/10 transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-lg">
                <CpuIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  vmHealthPercentage >= 80
                    ? "bg-green-900/30 text-green-400"
                    : vmHealthPercentage >= 50
                    ? "bg-yellow-900/30 text-yellow-400"
                    : "bg-red-900/30 text-red-400"
                }`}
              >
                {vmHealthPercentage}% healthy
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">
              {loading ? "..." : stats.totalVMs.toLocaleString()}
            </h3>
            <p className="text-gray-400 text-sm mb-2">Total Virtual Machines</p>
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  vmHealthPercentage >= 80
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : vmHealthPercentage >= 50
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                    : "bg-gradient-to-r from-red-500 to-pink-500"
                }`}
                style={{ width: `${vmHealthPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{stats.runningVMs} running</span>
              <span>{stats.stoppedVMs} stopped</span>
            </div>
          </div>

          {/* Running VMs */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] p-5 md:p-6 rounded-xl border border-gray-800/50 shadow-lg hover:shadow-green-500/10 transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-400">
                Active
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">
              {loading ? "..." : stats.runningVMs}
            </h3>
            <p className="text-gray-400 text-sm mb-2">Running VMs</p>
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                style={{
                  width:
                    stats.totalVMs > 0
                      ? `${(stats.runningVMs / stats.totalVMs) * 100}%`
                      : "0%",
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {stats.totalVMs > 0
                ? `${Math.round(
                    (stats.runningVMs / stats.totalVMs) * 100
                  )}% of total`
                : "No VMs"}
            </div>
          </div>

          {/* Total Servers */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] p-5 md:p-6 rounded-xl border border-gray-800/50 shadow-lg hover:shadow-emerald-500/10 transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <Server className="w-5 h-5 text-emerald-400" />
              </div>
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  serverHealthPercentage >= 80
                    ? "bg-green-900/30 text-green-400"
                    : serverHealthPercentage >= 50
                    ? "bg-yellow-900/30 text-yellow-400"
                    : "bg-red-900/30 text-red-400"
                }`}
              >
                {serverHealthPercentage}% online
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">
              {loading ? "..." : stats.totalServers}
            </h3>
            <p className="text-gray-400 text-sm mb-2">Proxmox Servers</p>
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  serverHealthPercentage >= 80
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : serverHealthPercentage >= 50
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                    : "bg-gradient-to-r from-red-500 to-orange-500"
                }`}
                style={{ width: `${serverHealthPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{stats.onlineServers} online</span>
              <span>{stats.offlineServers} offline</span>
            </div>
          </div>

          {/* Issues/Alerts */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] p-5 md:p-6 rounded-xl border border-gray-800/50 shadow-lg hover:shadow-red-500/10 transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-red-900/30 text-red-400">
                {stats.offlineServers > 0 ? "Critical" : "All clear"}
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">
              {loading ? "..." : stats.stoppedVMs + stats.offlineServers}
            </h3>
            <p className="text-gray-400 text-sm mb-2">Issues & Alerts</p>
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                style={{
                  width:
                    stats.totalServers + stats.totalVMs > 0
                      ? `${
                          ((stats.stoppedVMs + stats.offlineServers) /
                            (stats.totalServers + stats.totalVMs)) *
                          100
                        }%`
                      : "0%",
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{stats.stoppedVMs} stopped VMs</span>
              <span>{stats.offlineServers} offline servers</span>
            </div>
          </div>
        </div>

        {/* Charts & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Server Locations Overview */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1">
                  Server Locations
                </h3>
                <p className="text-gray-400 text-sm">
                  Proxmox nodes and their VM distribution
                </p>
              </div>
              <button className="p-2 hover:bg-gray-800/50 rounded-lg">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading server data...</p>
              </div>
            ) : serverLocations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No server data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {serverLocations.map((location, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          location.status === "healthy"
                            ? "bg-green-500/20"
                            : location.status === "warning"
                            ? "bg-yellow-500/20"
                            : "bg-red-500/20"
                        }`}
                      >
                        <Cloud
                          className={`w-5 h-5 ${
                            location.status === "healthy"
                              ? "text-green-400"
                              : location.status === "warning"
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <p className="text-xs text-gray-400">
                          {location.region}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-lg font-semibold">
                          {location.servers}
                        </p>
                        <p className="text-xs text-gray-400">Total VMs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">
                          {location.running}
                        </p>
                        <p className="text-xs text-gray-400">Running</p>
                      </div>
                      <div className="w-32">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Utilization</span>
                          <span>{location.utilization}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              location.utilization >= 80
                                ? "bg-red-500"
                                : location.utilization >= 60
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${location.utilization}%` }}
                          ></div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          location.status
                        )}`}
                      >
                        {location.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Performance Chart */}
            <div className="mt-6">
              <MetricChart
                title="Overall VM Health"
                serverId="1"
                token={token}
                color="#6366f1"
                extract={(h) => vmHealthPercentage}
              />
            </div>
          </div>

          {/* Recent Activity */}
          {/* Recent Activity */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1">
                  Recent Activity
                </h3>
                <p className="text-gray-400 text-sm">Latest VM operations</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportAuditLogs}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-colors"
                  title="Export to CSV"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {activityLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
                  <p className="text-gray-400 text-sm">Loading activity...</p>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">
                    No recent activity found
                  </p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-800/30 rounded-lg transition-colors"
                  >
                    <div className="pt-1">{getActivityIcon(activity.type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {activity.user || "System"}
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            activity.type
                          )}`}
                        >
                          {activity.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {activity.action}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Server className="w-3 h-3" />
                          {activity.node || "Unknown Node"}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Load More indicator (if you want pagination) */}
              {recentActivity.length >= 5 && (
                <div className="text-center pt-4 border-t border-gray-800/50">
                  <p className="text-xs text-gray-500">
                    Scroll to view more activities
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & VM Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* VM Breakdown by Server */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1">
                  VM Distribution
                </h3>
                <p className="text-gray-400 text-sm">
                  Virtual machines across Proxmox nodes
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading VM distribution...</p>
              </div>
            ) : !vmData?.serverBreakdown ? (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  No VM distribution data available
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(vmData.serverBreakdown).map(
                  ([serverName, serverData]) => (
                    <div
                      key={serverName}
                      className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            serverData.status === "ONLINE"
                              ? "bg-green-500/20"
                              : serverData.status === "OFFLINE"
                              ? "bg-red-500/20"
                              : "bg-yellow-500/20"
                          }`}
                        >
                          <Server
                            className={`w-5 h-5 ${
                              serverData.status === "ONLINE"
                                ? "text-green-400"
                                : serverData.status === "OFFLINE"
                                ? "text-red-400"
                                : "text-yellow-400"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{serverName}</p>
                          <p className="text-xs text-gray-400 capitalize">
                            Status:{" "}
                            {serverData.status?.toLowerCase() || "unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-lg font-semibold">
                            {serverData.total || 0}
                          </p>
                          <p className="text-xs text-gray-400">Total VMs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-green-400">
                            {serverData.running || 0}
                          </p>
                          <p className="text-xs text-gray-400">Running</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-red-400">
                            {serverData.stopped || 0}
                          </p>
                          <p className="text-xs text-gray-400">Stopped</p>
                        </div>
                        <div className="w-24">
                          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                serverData.total > 0 &&
                                serverData.running / serverData.total >= 0.8
                                  ? "bg-green-500"
                                  : serverData.total > 0 &&
                                    serverData.running / serverData.total >= 0.5
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width:
                                  serverData.total > 0
                                    ? `${
                                        (serverData.running /
                                          serverData.total) *
                                        100
                                      }%`
                                    : "0%",
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400 text-center mt-1">
                            {serverData.total > 0
                              ? `${Math.round(
                                  (serverData.running / serverData.total) * 100
                                )}% running`
                              : "No VMs"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 p-5 md:p-6">
            <div className="mb-6">
              <h3 className="text-lg md:text-xl font-semibold mb-1">
                Quick Actions
              </h3>
              <p className="text-gray-400 text-sm">
                Frequently used admin tasks
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/admin/metrics")}
                className="w-full flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-blue-500/20 border border-gray-700 hover:border-blue-500 rounded-lg transition-all group"
              >
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30">
                  <LineChart className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Performance Metrics</p>
                  <p className="text-xs text-gray-400">
                    View detailed server metrics
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/admin/invoices")}
                className="w-full flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-green-500/20 border border-gray-700 hover:border-green-500 rounded-lg transition-all group"
              >
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30">
                  <Server className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Manage Invoices</p>
                  <p className="text-xs text-gray-400">
                    Manage & view all invoices
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/admin/orders")}
                className="w-full flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-purple-500/20 border border-gray-700 hover:border-purple-500 rounded-lg transition-all group"
              >
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30">
                  <CpuIcon className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Manage VMs</p>
                  <p className="text-xs text-gray-400">
                    View and manage all virtual machines
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-800/50">
              <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">System Status</p>
                  <p className="text-xs text-gray-400">
                    {stats.onlineServers === stats.totalServers &&
                    stats.totalServers > 0
                      ? "All systems operational"
                      : stats.offlineServers > 0
                      ? `${stats.offlineServers} server(s) offline`
                      : "Loading status..."}
                  </p>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    stats.onlineServers === stats.totalServers &&
                    stats.totalServers > 0
                      ? "bg-green-500 animate-pulse"
                      : "bg-red-500 animate-pulse"
                  }`}
                ></div>
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
