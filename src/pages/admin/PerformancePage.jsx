import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MetricChart from "../../components/admin/liveGraphs/MetricChart";
import AdminHeader from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import {
  Activity,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  BarChart3,
  Eye,
  Settings,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Zap,
  Thermometer,
  Database,
  Wifi,
  Gauge,
  HardDriveIcon,
  ActivitySquare,
  Cpu as CpuIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export default function PerformancePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [selectedServer, setSelectedServer] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const refreshIntervalRef = useRef(null);
  const token = localStorage.getItem("adminToken");
  const [metrics, setMetrics] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Server data
  const [servers, setServers] = useState([]);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // System-wide metrics
  const [systemMetrics, setSystemMetrics] = useState({
    totalServers: servers.length,
    healthyServers: servers.filter((s) => s.status === "healthy").length,
    warningServers: servers.filter((s) => s.status === "warning").length,
    criticalServers: servers.filter((s) => s.status === "critical").length,
    avgCpu: 0,
    avgMemory: 0,
    avgDisk: 0,
    totalAlerts: 7,
    responseTime: 42,
    uptime: "99.92%",
  });

  // Fetch metrics for selected server
  useEffect(() => {
    if (!selectedServer || !token) return;
    const fetchMetrics = async () => {
      try {
        setIsRefreshing(true);
        const res = await fetch(
          `${BASE_URL}/api/admin/servers/${selectedServer.id}/metrics`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        toast.error("Metrics fetch failed");
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchMetrics();

    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(fetchMetrics, 3000);
    }

    return () => clearInterval(refreshIntervalRef.current);
  }, [selectedServer, token, autoRefresh]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) return;

        const res = await fetch(`${BASE_URL}/api/admin/servers/overview`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch servers");

        const data = await res.json();

        // Normalize API response → UI format
        const normalized = data.map((s) => ({
          id: s.id,
          name: s.name,
          ip: s.ip || "N/A",
          node: s.node,
          region: s.location,
          zoneId: s.zoneId,
          zoneName: s.zoneName,
          status: s.status === "ACTIVE" ? "healthy" : "critical",
        }));

        setServers(normalized);

        // Auto-select first ACTIVE server
        if (!selectedServer) {
          const activeServer = normalized.find((s) => s.status === "healthy");
          setSelectedServer(activeServer || normalized[0]);
        }
      } catch (err) {
        toast.error("Server fetch failed");
      }
    };

    fetchServers();
  }, [BASE_URL]);

  // Calculate average metrics
  useEffect(() => {
    if (!metrics?.history || metrics.history.length === 0) return;

    const history = metrics.history;

    const avg = (fn) =>
      Math.round(history.reduce((sum, h) => sum + fn(h), 0) / history.length);

    setSystemMetrics((prev) => ({
      ...prev,
      avgCpu: avg((h) => h.cpu * 100),
      avgMemory: avg((h) => (h.memused / h.memtotal) * 100),
      avgDisk: avg((h) => (h.rootused / h.roottotal) * 100),
    }));
  }, [metrics]);

  // Initial setup
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    } else {
      setIsLoading(false);
      // Set first server as selected by default
      if (servers.length > 0 && !selectedServer) {
        setSelectedServer(servers[0]);
      }
    }
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showServerDropdown && !event.target.closest(".server-dropdown")) {
        setShowServerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showServerDropdown]);

  const handleRefresh = () => {
    if (!selectedServer || !token) return;

    const fetchMetrics = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/admin/servers/${selectedServer.id}/metrics`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        toast.error("Metrics fetch failed");
      }
    };

    fetchMetrics();
  };

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      selectedServer,
      systemMetrics,
      metrics,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-metrics-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "text-green-400 bg-green-400/10";
      case "warning":
        return "text-yellow-400 bg-yellow-400/10";
      case "critical":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "critical":
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Server className="w-5 h-5 text-gray-400" />;
    }
  };

  const getUsageColor = (percent) => {
    if (percent >= 90) return "text-red-400";
    if (percent >= 70) return "text-yellow-400";
    return "text-green-400";
  };

  const getBarColor = (percent) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const metricTypes = [
    {
      id: "all",
      label: "All Metrics",
      icon: <Activity className="w-4 h-4" />,
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "cpu",
      label: "CPU",
      icon: <Cpu className="w-4 h-4" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "memory",
      label: "Memory",
      icon: <MemoryStick className="w-4 h-4" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "disk",
      label: "Disk",
      icon: <HardDrive className="w-4 h-4" />,
      color: "from-amber-500 to-orange-500",
    },
    {
      id: "network",
      label: "Network",
      icon: <Network className="w-4 h-4" />,
      color: "from-purple-500 to-pink-500",
    },
  ];

  useEffect(() => {
    if (!metrics?.current || !metrics?.history?.length) return;
  }, [metrics]);

  if (isLoading || !metrics?.current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0e1420] via-[#121a2a] to-[#0e1420] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  const c = metrics.current;

  // Calculate metrics
  const cpuPercent = Math.round(c.cpu * 100);
  const memPercent = Math.round((c.memory.used / c.memory.total) * 100);
  const diskPercent = Math.round((c.rootfs.used / c.rootfs.total) * 100);
  const swapPercent = Math.round((c.swap.used / c.swap.total) * 100);
  const ioDelayPercent = Math.round(c.wait * 100);

  // Format values
  const memUsedGB = (c.memory.used / 1024 ** 3).toFixed(1);
  const memTotalGB = (c.memory.total / 1024 ** 3).toFixed(1);
  const diskUsedGB = (c.rootfs.used / 1024 ** 3).toFixed(1);
  const diskTotalGB = (c.rootfs.total / 1024 ** 3).toFixed(1);
  const swapUsedGB = (c.swap.used / 1024 ** 3).toFixed(1);
  const swapTotalGB = (c.swap.total / 1024 ** 3).toFixed(1);

  // Format uptime
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e1420] via-[#121a2a] to-[#0e1420] text-white">
      <AdminHeader />

      <main className="p-4 md:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Performance Dashboard
              </h1>
              <p className="text-gray-400">
                Real-time monitoring and metrics for all servers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg flex items-center gap-2 transition-colors group"
              >
                <RefreshCw
                  className={`w-4 h-4 text-gray-400 group-hover:text-white ${
                    autoRefresh ? "animate-spin" : ""
                  }`}
                />
                <span className="text-sm">Refresh</span>
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>

          {/* Server Selector and Controls */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 p-5 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <div className="flex-1">
                <div className="relative server-dropdown">
                  <button
                    onClick={() => setShowServerDropdown(!showServerDropdown)}
                    className="flex items-center justify-between w-full px-4 py-3.5 bg-gray-800/30 border border-gray-700 rounded-lg hover:bg-gray-700/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {selectedServer && getStatusIcon(selectedServer.status)}
                      <div className="text-left">
                        <div className="font-semibold text-lg group-hover:text-indigo-300 transition-colors">
                          {selectedServer?.name || "Select a server"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {selectedServer
                            ? `${selectedServer.ip} • ${selectedServer.region}`
                            : "Choose from list"}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        showServerDropdown ? "rotate-180 text-indigo-400" : ""
                      }`}
                    />
                  </button>

                  {showServerDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        {servers.map((server) => (
                          <div
                            key={server.id}
                            onClick={() => {
                              setSelectedServer(server);
                              setShowServerDropdown(false);
                            }}
                            className={`flex items-center gap-3 p-3 hover:bg-gray-800/70 cursor-pointer transition-colors border-b border-gray-800/50 last:border-b-0 ${
                              selectedServer?.id === server.id
                                ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20"
                                : ""
                            }`}
                          >
                            {getStatusIcon(server.status)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold truncate">
                                  {server.name}
                                </h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    server.status
                                  )}`}
                                >
                                  {server.status}
                                </span>
                              </div>
                              <div className="text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                  <span>{server.region}</span>
                                  <span className="mx-1">•</span>
                                  <span>{server.cpuCores} vCPU</span>
                                  <span className="mx-1">•</span>
                                  <span>{server.memoryGB}GB RAM</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-800/30 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        autoRefresh
                          ? "bg-green-500 animate-pulse"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <span className="text-xs text-gray-400">Auto-refresh</span>
                  </div>
                  <input
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-gray-700 border-gray-600 checked:bg-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Metric Filters */}
            <div className="mt-4 pt-4 border-t border-gray-800/50">
              <div className="flex flex-wrap gap-2">
                {metricTypes.map((metric) => (
                  <button
                    key={metric.id}
                    onClick={() => setSelectedMetric(metric.id)}
                    className={`group flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                      selectedMetric === metric.id
                        ? `bg-gradient-to-r ${metric.color} text-white shadow-lg`
                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
                    }`}
                  >
                    <div
                      className={`${
                        selectedMetric === metric.id
                          ? "text-white"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    >
                      {metric.icon}
                    </div>
                    <span className="text-sm font-medium">{metric.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Charts */}
          {selectedServer && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Historical Trends</h3>
                  <p className="text-gray-400">
                    Performance trends over time for {selectedServer.name}
                  </p>
                </div>
              </div>

              <div
                className={`grid gap-6 ${
                  selectedMetric === "all"
                    ? "grid-cols-1 lg:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {/* CPU Usage Chart */}
                {(selectedMetric === "all" || selectedMetric === "cpu") && (
                  <MetricChart
                    title="CPU Usage (%)"
                    data={metrics}
                    extract={(h) => Math.round(h.cpu * 100)}
                    color="#8b5cf6"
                  />
                )}

                {/* Memory Usage Chart */}
                {(selectedMetric === "all" || selectedMetric === "memory") && (
                  <MetricChart
                    title="Memory Usage (%)"
                    data={metrics}
                    extract={(h) => Math.round((h.memused / h.memtotal) * 100)}
                    color="#10b981"
                  />
                )}

                {/* Disk Usage Chart */}
                {(selectedMetric === "all" || selectedMetric === "disk") && (
                  <MetricChart
                    title="Disk Usage (%)"
                    data={metrics}
                    extract={(h) =>
                      Math.round((h.rootused / h.roottotal) * 100)
                    }
                    color="#f59e0b"
                  />
                )}

                {/* Network In/Out Chart */}
                {(selectedMetric === "all" || selectedMetric === "network") && (
                  <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] p-6 rounded-xl border border-gray-800/50">
                    <h3 className="text-lg font-semibold mb-4">
                      Network Traffic
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <MetricChart
                        title="Network In (MB/s)"
                        data={metrics}
                        extract={(h) =>
                          Number((h.netin / 1024 / 1024).toFixed(2))
                        }
                        color="#3b82f6"
                      />
                      <MetricChart
                        title="Network Out (MB/s)"
                        data={metrics}
                        extract={(h) =>
                          Number((h.netout / 1024 / 1024).toFixed(2))
                        }
                        color="#ef4444"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Server Metrics Dashboard */}
          {selectedServer && metrics?.current && (
            <div className="mb-6 h-50">
              <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 p-4 md:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Live Server Metrics
                    </h3>
                    <p className="text-gray-400 text-xs">
                      Real-time monitoring of {selectedServer.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-gray-400">Live</span>
                    </div>
                    <span className="text-gray-600">•</span>
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400">
                      {formatUptime(c.uptime)}
                    </span>
                  </div>
                </div>

                {/* Compact Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* CPU Metrics */}
                  <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <CpuIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-sm font-medium">CPU</span>
                      </div>
                      <span
                        className={`text-sm font-bold ${getUsageColor(
                          cpuPercent
                        )}`}
                      >
                        {cpuPercent}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full transition-all duration-300 ${getBarColor(
                          cpuPercent
                        )}`}
                        style={{ width: `${cpuPercent}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 flex justify-between">
                      <span>Load: {Number(c.loadavg[0]).toFixed(1)}</span>
                      <span>{c.cpuinfo.cpus} cores</span>
                    </div>
                  </div>

                  {/* Memory Metrics */}
                  <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <MemoryStick className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-sm font-medium">Memory</span>
                      </div>
                      <span
                        className={`text-sm font-bold ${getUsageColor(
                          memPercent
                        )}`}
                      >
                        {memPercent}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full transition-all duration-300 ${getBarColor(
                          memPercent
                        )}`}
                        style={{ width: `${memPercent}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {memUsedGB}GB / {memTotalGB}GB
                    </div>
                  </div>

                  {/* Disk Metrics */}
                  <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <HardDriveIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-sm font-medium">Disk</span>
                      </div>
                      <span
                        className={`text-sm font-bold ${getUsageColor(
                          diskPercent
                        )}`}
                      >
                        {diskPercent}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full transition-all duration-300 ${getBarColor(
                          diskPercent
                        )}`}
                        style={{ width: `${diskPercent}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {diskUsedGB}GB / {diskTotalGB}GB
                    </div>
                  </div>

                  {/* System Info */}
                  <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Gauge className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-sm font-medium">System</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Swap</div>
                        <div
                          className={`text-xs font-semibold ${getUsageColor(
                            swapPercent
                          )}`}
                        >
                          {swapPercent}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">
                          IO Delay
                        </div>
                        <div
                          className={`text-xs font-semibold ${getUsageColor(
                            ioDelayPercent
                          )}`}
                        >
                          {ioDelayPercent}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
