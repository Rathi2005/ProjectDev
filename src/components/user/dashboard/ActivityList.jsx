import { useEffect, useState } from "react";
import {
  FaServer,
  FaMapMarkerAlt,
  FaPlay,
  FaStop,
  FaRedo,
  FaTrash,
  FaClock,
  FaExclamationCircle,
  FaCheckCircle,
  FaSpinner,
  FaUser,
  FaNetworkWired,
} from "react-icons/fa";
import { Loader2, RefreshCw } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

/* 🔁 Map action → icon and color */
const getIcon = (action) => {
  if (!action) return <FaServer className="text-gray-400" />;

  const a = action.toLowerCase();

  if (a.includes("start") || a.includes("power on"))
    return <FaPlay className="text-green-400" />;
  if (a.includes("stop") || a.includes("shutdown"))
    return <FaStop className="text-red-400" />;
  if (a.includes("reboot") || a.includes("restart"))
    return <FaRedo className="text-purple-400" />;
  if (a.includes("create") || a.includes("provision"))
    return <FaServer className="text-blue-400" />;
  if (a.includes("delete") || a.includes("destroy"))
    return <FaTrash className="text-red-500" />;
  if (a.includes("network") || a.includes("ip"))
    return <FaNetworkWired className="text-cyan-400" />;
  if (a.includes("update") || a.includes("modify"))
    return <FaUser className="text-yellow-400" />;

  return <FaServer className="text-gray-400" />;
};

/* Get status color based on action result */
const getStatusColor = (status) => {
  if (
    status?.toLowerCase() === "success" ||
    status?.toLowerCase() === "completed"
  )
    return "text-green-400 bg-green-400/10 border border-green-400/20";
  if (status?.toLowerCase() === "failed" || status?.toLowerCase() === "error")
    return "text-red-400 bg-red-400/10 border border-red-400/20";
  if (
    status?.toLowerCase() === "pending" ||
    status?.toLowerCase() === "in_progress"
  )
    return "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20";
  return "text-gray-400 bg-gray-400/10 border border-gray-400/20";
};

/* ⏱ time formatter with precise time */
const formatTimeAgo = (date) => {
  if (!date) return "Just now";

  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec} sec ago`;
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;

  // For older dates, show actual date
  return past.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* Format action text for better readability */
/* Format action text for better readability */
const formatActionText = (action) => {
  if (!action) return "Unknown Action";

  // Capitalize first letter of each word
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function ActivityList({
  vmId = null,
  onRefresh,
  autoRefresh = true,
}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      setError(null);

      const url = vmId
        ? `${BASE_URL}/api/users/audit-logs/vm/${vmId}?limit=10`
        : `${BASE_URL}/api/users/audit-logs?limit=10`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        throw new Error(`Failed to load logs: ${res.status}`);
      }

      const data = await res.json();
      // Ensure data is an array
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setError(err.message || "Failed to load activities");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Auto-refresh every 30 seconds if enabled
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(fetchLogs, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [vmId, autoRefresh]);

  const handleRefresh = () => {
    fetchLogs();
    if (onRefresh) onRefresh();
  };

  const handleViewAll = () => {
    if (vmId) {
      window.location.href = `/activities?vm=${vmId}`;
    } else {
      window.location.href = "/activities";
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1a2337] to-[#151c2f] rounded-xl border border-indigo-900/30 p-4 sm:p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-900/30 rounded-lg">
            <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white">
              Recent Activities
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              {vmId ? "VM-specific actions" : "All server activities"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh activities"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={handleViewAll}
            className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            View All
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading activities...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FaExclamationCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-red-400 text-sm mb-2">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FaClock className="w-10 h-10 text-gray-500 mb-3" />
          <p className="text-gray-500 text-sm">No activities found</p>
          <p className="text-gray-400 text-xs mt-1">
            Actions will appear here when performed
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {logs.slice(0, 8).map((log, index) => {
            // Ensure log object has required properties
            const safeLog = {
              id: log?.id || index,
              action: log?.action || "Unknown Action",
              status: log?.status || "unknown",
              resourceName:
                log?.resourceName ||
                log?.vmName ||
                `VM-${log?.vmId || "Unknown"}`,
              userName: log?.userName,
              createdAt: log?.createdAt,
              ipAddress: log?.ipAddress,
              message: log?.message,
            };

            return (
              <div
                key={safeLog.id}
                className="group bg-[#0e1525]/50 hover:bg-[#0e1525]/80 rounded-lg p-3 border border-gray-800/50 hover:border-indigo-900/50 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="p-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg group-hover:scale-105 transition-transform">
                    {getIcon(safeLog.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-medium text-white truncate">
                        {formatActionText(safeLog.action)}
                      </h3>
                      {safeLog.status && safeLog.status !== "unknown" && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            safeLog.status
                          )}`}
                        >
                          {safeLog.status}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mb-2 truncate">
                      {safeLog.resourceName}
                      {safeLog.userName && ` • by ${safeLog.userName}`}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-300 font-medium">
                        {formatTimeAgo(safeLog.createdAt)}
                      </span>
                      {safeLog.ipAddress && (
                        <span className="text-xs text-gray-500 font-mono bg-gray-900/30 px-2 py-1 rounded">
                          {safeLog.ipAddress}
                        </span>
                      )}
                    </div>

                    {safeLog.message && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {safeLog.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Stats */}
      {!loading && !error && logs.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-800/50">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center p-2 bg-green-900/20 rounded-lg">
              <div className="text-green-400 font-semibold">
                <div className="text-green-400 font-semibold">
                  {
                    logs.filter((l) => l?.status?.toLowerCase() === "success")
                      .length
                  }
                </div>
              </div>
              <div className="text-gray-400">Successful</div>
            </div>
            <div className="text-center p-2 bg-gray-800/20 rounded-lg">
              <div className="text-gray-300 font-semibold">{logs.length}</div>
              <div className="text-gray-400">Total Actions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
