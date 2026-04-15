import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./adminHeader";
import Footer from "../user/Footer";
import MetricChart from "./liveGraphs/MetricChart";
import toast from "react-hot-toast";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

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

  const { vmData, vmLoading, auditLogs, activityLoading } = useAdminDashboard();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
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

  const stats = useMemo(() => {
    if (!vmData) {
      return {
        totalVMs: 0,
        runningVMs: 0,
        stoppedVMs: 0,
        totalServers: 0,
        onlineServers: 0,
        offlineServers: 0,
      };
    }

    const totalVMs = vmData.totalVmsAcrossCloud || 0;
    const runningVMs = vmData.totalRunning || 0;
    const stoppedVMs = vmData.totalStopped || 0;

    const serverBreakdown = vmData.serverBreakdown || {};
    const servers = Object.keys(serverBreakdown);

    const totalServers = servers.length;
    const onlineServers = servers.filter(
      (server) => serverBreakdown[server]?.status === "ONLINE",
    ).length;

    return {
      totalVMs,
      runningVMs,
      stoppedVMs,
      totalServers,
      onlineServers,
      offlineServers: totalServers - onlineServers,
    };
  }, [vmData]);

  const serverLocations = useMemo(() => {
    if (!vmData?.serverBreakdown) return [];

    return Object.entries(vmData.serverBreakdown).map(
      ([server, serverData]) => {
        const locationName = server.split("-").pop() || server;

        return {
          name: server,
          region: locationName.charAt(0).toUpperCase() + locationName.slice(1),
          servers: serverData.total || 0,
          running: serverData.running || 0,
          stopped: serverData.stopped || 0,
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
      },
    );
  }, [vmData]);

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
        },
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
              {vmLoading ? "..." : stats.totalVMs}{" "}
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
              {vmLoading ? "..." : stats.runningVMs}
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
                    (stats.runningVMs / stats.totalVMs) * 100,
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
              {vmLoading ? "..." : stats.totalServers}
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
              {vmLoading ? "..." : stats.stoppedVMs + stats.offlineServers}
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
          {/* Server Node Overview */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1">
                  Server Status Overview
                </h3>
                <p className="text-gray-400 text-sm">
                  Proxmox nodes and their VM distribution
                </p>
              </div>
              <button className="p-2 hover:bg-gray-800/50 rounded-lg">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {vmLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading server data...</p>
              </div>
            ) : serverLocations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No server data available</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {serverLocations.map((location, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors gap-4"
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
                        <p className="font-medium truncate max-w-[120px] sm:max-w-[200px]">{location.name}</p>
                        <p className="text-xs text-gray-400">
                          {location.region}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-1 items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-center">
                          <p className="text-base sm:text-lg font-semibold">
                            {location.servers}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-base sm:text-lg font-semibold text-green-400">
                            {location.running}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Run</p>
                        </div>
                        <div className="text-center">
                          <p className="text-base sm:text-lg font-semibold text-red-400">
                            {location.stopped}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Stop</p>
                        </div>
                      </div>

                      <div className="hidden xl:block w-32">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Usage</span>
                          <span>{location.utilization}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
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
                        className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${getStatusColor(
                          location.status,
                        )}`}
                      >
                        {location.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 p-5 md:p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg md:text-xl font-semibold mb-1">
                Quick Actions
              </h3>
              <p className="text-gray-400 text-sm">
                Frequently used tasks
              </p>
            </div>

            <div className="space-y-3 flex-1">
              <button
                onClick={() => navigate("/admin/metrics")}
                className="w-full flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-blue-500/20 border border-gray-700 hover:border-blue-500 rounded-lg transition-all group"
              >
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30">
                  <LineChart className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Metrics</p>
                  <p className="text-[10px] text-gray-400">
                    Live performance
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/admin/invoices")}
                className="w-full flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-green-500/20 border border-gray-700 hover:border-green-500 rounded-lg transition-all group"
              >
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30">
                  <CreditCard className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Invoices</p>
                  <p className="text-[10px] text-gray-400">
                    Billing management
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
                  <p className="font-medium text-sm">Manage VMs</p>
                  <p className="text-[10px] text-gray-400">
                    All virtual machines
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-800/50">
              <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">System Status</p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {stats.onlineServers === stats.totalServers && stats.totalServers > 0
                      ? "All systems operational"
                      : `${stats.offlineServers} server(s) offline`}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${stats.onlineServers === stats.totalServers ? "bg-green-500" : "bg-red-500"} animate-pulse shrink-0`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Activity */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1">
                  Recent Activity
                </h3>
                <p className="text-gray-400 text-sm">Latest VM operations across cloud</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportAuditLogs}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {activityLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
                  <p className="text-gray-400 text-sm">Loading activity...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">
                    No recent activity found
                  </p>
                </div>
              ) : (
                auditLogs.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 bg-gray-800/20 border border-gray-700/30 rounded-xl hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-indigo-500/10 transition-colors">
                      {getActivityIcon(activity.type)}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="col-span-1 md:col-span-1">
                        <p className="text-sm font-bold text-gray-200 truncate uppercase tracking-tight">
                          {activity.user || "System"}
                        </p>
                        <p className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>

                      <div className="col-span-1 md:col-span-1">
                        <p className="text-xs font-semibold text-gray-300">
                          {activity.action}
                        </p>
                      </div>

                      <div className="col-span-1 md:col-span-1 flex items-center gap-2">
                        <div className="px-2 py-1 bg-gray-800/50 rounded border border-gray-700 text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Server className="w-3 h-3" />
                          {activity.node || "Global"}
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-1 flex justify-end">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(
                            activity.type,
                          ).replace("bg-", "border-").replace("/10", "/30")}`}
                        >
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
