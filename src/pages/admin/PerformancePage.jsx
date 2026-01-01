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
} from "lucide-react";

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

  // Server data
  const [servers, setServers] = useState([
    {
      id: 1,
      name: "web-server-01",
      status: "healthy",
      cpu: 42,
      memory: 38,
      disk: 48,
      network: 85,
      uptime: "45d 12h",
      region: "US East",
      alerts: 0,
      ip: "192.168.1.101",
      type: "Dedicated vCPU",
      cpuCores: 8,
      memoryGB: 32,
    },
    {
      id: 2,
      name: "db-server-01",
      status: "warning",
      cpu: 78,
      memory: 82,
      disk: 65,
      network: 42,
      uptime: "128d 6h",
      region: "EU West",
      alerts: 2,
      ip: "192.168.1.102",
      type: "Shared vCPU",
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 3,
      name: "cache-server-01",
      status: "healthy",
      cpu: 31,
      memory: 25,
      disk: 22,
      network: 91,
      uptime: "92d 18h",
      region: "Asia Pacific",
      alerts: 0,
      ip: "192.168.1.103",
      type: "Dedicated vCPU",
      cpuCores: 4,
      memoryGB: 8,
    },
    {
      id: 4,
      name: "app-server-01",
      status: "critical",
      cpu: 95,
      memory: 88,
      disk: 91,
      network: 12,
      uptime: "12d 3h",
      region: "US West",
      alerts: 5,
      ip: "192.168.1.104",
      type: "Dedicated vCPU",
      cpuCores: 16,
      memoryGB: 64,
    },
  ]);

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
        const res = await fetch(
          `${BASE_URL}/admin/servers/${selectedServer.id}/metrics`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error("Metrics fetch failed:", err);
      }
    };

    fetchMetrics();

    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(fetchMetrics, 3000);
    }

    return () => clearInterval(refreshIntervalRef.current);
  }, [selectedServer, token, autoRefresh]);

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
          `${BASE_URL}/admin/servers/${selectedServer.id}/metrics`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error("Metrics fetch failed:", err);
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
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "critical":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Server className="w-4 h-4 text-gray-400" />;
    }
  };

  const metricTypes = [
    { id: "all", label: "All Metrics", icon: <Activity className="w-4 h-4" /> },
    { id: "cpu", label: "CPU", icon: <Cpu className="w-4 h-4" /> },
    {
      id: "memory",
      label: "Memory",
      icon: <MemoryStick className="w-4 h-4" />,
    },
    { id: "disk", label: "Disk", icon: <HardDrive className="w-4 h-4" /> },
    { id: "network", label: "Network", icon: <Network className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0e1420] via-[#121a2a] to-[#0e1420] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e1420] via-[#121a2a] to-[#0e1420] text-white flex flex-col">
      <div>
        <AdminHeader />
      </div>
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Performance Dashboard
              </h1>
              <p className="text-gray-400">
                Real-time monitoring and metrics for all servers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Server Selector */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="relative server-dropdown">
              <button
                onClick={() => setShowServerDropdown(!showServerDropdown)}
                className="flex items-center justify-between w-full md:w-80 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {selectedServer && getStatusIcon(selectedServer.status)}
                  <div className="text-left">
                    <div className="font-medium">
                      {selectedServer?.name || "Select a server"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {selectedServer ? selectedServer.ip : "Choose from list"}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    showServerDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showServerDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
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
                            ? "bg-indigo-500/20"
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

            <div className="flex-1 flex flex-wrap gap-2">
              {metricTypes.map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedMetric === metric.id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                  }`}
                >
                  {metric.icon}
                  {metric.label}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-refresh toggle */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-700 border-gray-600"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-400">
              Auto-refresh (3s)
            </label>
            {selectedServer && (
              <span className="ml-4 text-sm text-gray-500">
                Currently viewing:{" "}
                <span className="text-indigo-400">{selectedServer.name}</span> •{" "}
                {selectedServer.region} • {selectedServer.type}
              </span>
            )}
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="col-span-2 bg-gradient-to-br from-[#1d2438] to-[#1a2237] p-4 rounded-xl border border-gray-800/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Server className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-400">
                {systemMetrics.healthyServers} Healthy
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {systemMetrics.totalServers}
            </h3>
            <p className="text-gray-400 text-sm">Total Servers</p>
          </div>

          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] p-4 rounded-xl border border-gray-800/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Cpu className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{systemMetrics.avgCpu}%</h3>
            <p className="text-gray-400 text-sm">Avg CPU</p>
          </div>

          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] p-4 rounded-xl border border-gray-800/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <MemoryStick className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {systemMetrics.avgMemory}%
            </h3>
            <p className="text-gray-400 text-sm">Avg Memory</p>
          </div>

          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] p-4 rounded-xl border border-gray-800/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <HardDrive className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {systemMetrics.avgDisk}%
            </h3>
            <p className="text-gray-400 text-sm">Avg Disk</p>
          </div>
        </div>

        {/* Real-time Metrics Charts */}
        {selectedServer ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold">Real-time Metrics</h3>
                <p className="text-gray-400">
                  Monitoring: {selectedServer.name} ({selectedServer.ip}) •{" "}
                  {selectedServer.region}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-gray-400">Live</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">Auto-refresh</span>
                </div>
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
                  extract={(h) => Math.round((h.rootused / h.roottotal) * 100)}
                  color="#f59e0b"
                />
              )}

              {/* Network In/Out Chart */}
              {(selectedMetric === "all" || selectedMetric === "network") && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm text-gray-300 mb-2">
                    Network Traffic
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        ) : (
          <div className="mb-8 p-8 bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 text-center">
            <Server className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Server Selected</h3>
            <p className="text-gray-400 mb-4">
              Please select a server from the dropdown above to view its
              performance metrics
            </p>
            <button
              onClick={() => setShowServerDropdown(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-2"
            >
              <Server className="w-4 h-4" />
              Select a Server
            </button>
          </div>
        )}

        {/* Server Grid for Quick Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Quick Server Selection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {servers.map((server) => (
              <div
                key={server.id}
                onClick={() => setSelectedServer(server)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  selectedServer?.id === server.id
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-gray-800/50 bg-gradient-to-br from-[#1d2438] to-[#1a2237] hover:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(server.status)}
                    <h4 className="font-semibold">{server.name}</h4>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      server.status
                    )}`}
                  >
                    {server.status}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">CPU:</span>
                    <span className="font-medium">{server.cpu}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Memory:</span>
                    <span className="font-medium">{server.memory}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Region:</span>
                    <span className="font-medium">{server.region}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <div>
        <Footer/>
      </div>
    </div>
  );
}
