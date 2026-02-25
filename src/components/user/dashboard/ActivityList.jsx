import { useEffect, useState, useMemo } from "react";
import {
  FaServer,
  FaPlay,
  FaStop,
  FaRedo,
  FaTrash,
  FaClock,
  FaExclamationCircle,
  FaCheckCircle,
  FaUser,
  FaNetworkWired,
  FaPlus,
  FaEdit,
  FaKey,
  FaSync,
  FaPowerOff,
  FaPause,
  FaPlug,
  FaCog,
  FaBolt,
  FaExclamationTriangle,
  FaQuestionCircle,
} from "react-icons/fa";
import {
  Loader2,
  RefreshCw,
  AlertCircle,
  Zap,
  Power,
  Wifi,
  Terminal,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

/* 🔁 Map operation → icon */
const getOperationIcon = (operation) => {
  if (!operation) return <FaQuestionCircle className="text-gray-400" />;

  const op = operation.toLowerCase();

  if (op.includes("power")) {
    if (op.includes("start") || op.includes("on"))
      return <FaPlay className="text-green-400" />;
    if (op.includes("stop") || op.includes("off"))
      return <FaStop className="text-red-400" />;
    if (op.includes("reboot") || op.includes("restart"))
      return <FaRedo className="text-purple-400" />;
    if (op.includes("reset"))
      return <Zap className="w-4 h-4 text-yellow-400" />;
    return <Power className="w-4 h-4 text-blue-400" />;
  }

  if (
    op.includes("create") ||
    op.includes("provision") ||
    op.includes("deploy")
  )
    return <FaPlus className="text-blue-400" />;
  if (
    op.includes("delete") ||
    op.includes("destroy") ||
    op.includes("terminate")
  )
    return <FaTrash className="text-red-500" />;
  if (op.includes("network") || op.includes("ip") || op.includes("address"))
    return <Wifi className="w-4 h-4 text-cyan-400" />;
  if (op.includes("update") || op.includes("modify") || op.includes("edit"))
    return <FaEdit className="text-yellow-400" />;
  if (
    op.includes("password") ||
    op.includes("credentials") ||
    op.includes("auth")
  )
    return <FaKey className="text-orange-400" />;
  if (
    op.includes("rebuild") ||
    op.includes("reinstall") ||
    op.includes("reimage")
  )
    return <FaSync className="text-pink-400" />;
  if (op.includes("resize") || op.includes("scale") || op.includes("upgrade"))
    return <FaPlus className="text-indigo-400" />;
  if (op.includes("config") || op.includes("settings"))
    return <FaCog className="text-gray-400" />;
  if (op.includes("monitor") || op.includes("status"))
    return <Terminal className="w-4 h-4 text-emerald-400" />;
  if (op.includes("migrate") || op.includes("move"))
    return <FaNetworkWired className="text-teal-400" />;

  return <FaServer className="text-gray-400" />;
};

/* Get operation text for display */
const getOperationText = (operation) => {
  if (!operation) return "Unknown Operation";

  // Convert from snake_case/UPPER_CASE to readable text
  return operation
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/* Get source badge */
const getSourceBadge = (source) => {
  if (!source) return null;

  const s = source.toLowerCase();
  if (s.includes("user"))
    return (
      <span className="px-2 py-0.5 text-xs bg-blue-900/30 text-blue-400 rounded-full border border-blue-800/50">
        User
      </span>
    );
  if (s.includes("system") || s.includes("auto"))
    return (
      <span className="px-2 py-0.5 text-xs bg-gray-900/30 text-gray-400 rounded-full border border-gray-700/50">
        System
      </span>
    );
  if (s.includes("api"))
    return (
      <span className="px-2 py-0.5 text-xs bg-green-900/30 text-green-400 rounded-full border border-green-800/50">
        API
      </span>
    );
  if (s.includes("cron") || s.includes("scheduled"))
    return (
      <span className="px-2 py-0.5 text-xs bg-purple-900/30 text-purple-400 rounded-full border border-purple-800/50">
        Scheduled
      </span>
    );

  return (
    <span className="px-2 py-0.5 text-xs bg-gray-900/30 text-gray-400 rounded-full border border-gray-700/50">
      {source}
    </span>
  );
};

/* Get status styling */
const getStatusStyle = (status) => {
  if (!status) return "bg-gray-900/20 text-gray-400";

  const s = status.toLowerCase();
  if (s === "success")
    return "bg-green-900/20 text-green-400 border border-green-800/30";
  if (s === "failed" || s === "error")
    return "bg-red-900/20 text-red-400 border border-red-800/30";
  if (s === "pending" || s === "in_progress" || s === "processing")
    return "bg-yellow-900/20 text-yellow-400 border border-yellow-800/30";
  if (s === "cancelled" || s === "aborted")
    return "bg-orange-900/20 text-orange-400 border border-orange-800/30";

  return "bg-gray-900/20 text-gray-400 border border-gray-700/30";
};

/* Get status icon */
const getStatusIcon = (status) => {
  if (!status) return null;

  const s = status.toLowerCase();
  if (s === "success") return <FaCheckCircle className="w-3 h-3" />;
  if (s === "failed" || s === "error")
    return <FaExclamationCircle className="w-3 h-3" />;
  if (s === "pending" || s === "in_progress")
    return <Loader2 className="w-3 h-3 animate-spin" />;

  return null;
};

/* Format timestamp */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Just now";

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid date";

    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    // Show full date for older entries
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (err) {
    return "Invalid date";
  }
};

/* Format email (shorten for display) */
const formatEmail = (email) => {
  if (!email) return "Unknown user";
  if (email.length > 20) return `${email.substring(0, 18)}...`;
  return email;
};

export default function ActivityList({ vmId = null, maxItems = 6 }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);

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
        ? `${BASE_URL}/api/users/audit-logs/vm/${vmId}?limit=${maxItems + 2}`
        : `${BASE_URL}/api/users/audit-logs?limit=${maxItems + 2}`;

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
        throw new Error(`Failed to load activity logs`);
      }

      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setError("Failed to load activities");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const last7DaysLogs = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return logs.filter(
      (log) => log.timestamp && new Date(log.timestamp) >= sevenDaysAgo,
    );
  }, [logs]);

  useEffect(() => {
    if (showAllModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showAllModal]);

  useEffect(() => {
    fetchLogs();
  }, [vmId, maxItems]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg">
            <FaClock className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Recent Activities
            </h3>
            <p className="text-xs text-gray-400">System & user actions</p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={refreshing}
          className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh activities"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-2">
            <AlertCircle className="w-5 h-5 text-red-400 mb-1" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-2">
            <FaClock className="w-5 h-5 text-gray-500 mb-1" />
            <p className="text-gray-500 text-xs">No activities yet</p>
          </div>
        ) : (
          logs.slice(0, maxItems).map((log) => (
            <div
              key={log.id}
              className="bg-gray-900/30 hover:bg-gray-800/40 rounded-lg p-3 border border-gray-800/30 transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="p-1.5 bg-gray-800/50 rounded-lg flex-shrink-0">
                  {getOperationIcon(log.operation)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* First row: Operation & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {getOperationText(log.operation)}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {log.vmName || `VM-${log.vmId || "Unknown"}`}
                      </p>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${getStatusStyle(log.status)}`}
                    >
                      {getStatusIcon(log.status)}
                      <span className="capitalize">
                        {log.status?.toLowerCase() || "unknown"}
                      </span>
                    </div>
                  </div>

                  {/* Second row: Source & User */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSourceBadge(log.actionSource)}
                      {log.userEmail && (
                        <span
                          className="text-[10px] text-gray-400"
                          title={log.userEmail}
                        >
                          by {formatEmail(log.userEmail)}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-indigo-300 font-medium">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>

                  {/* Error message (if any) */}
                  {log.errorMessage && (
                    <div className="mt-2 pt-2 border-t border-gray-800/30">
                      <p className="text-[10px] text-red-400 flex items-center gap-1">
                        <FaExclamationTriangle className="w-2.5 h-2.5" />
                        {log.errorMessage}
                      </p>
                    </div>
                  )}

                  {/* Additional info */}
                  <div className="mt-2 pt-2 border-t border-gray-800/30 flex items-center justify-between text-[10px] text-gray-500">
                    <span>VM ID: {log.vmId || "N/A"}</span>
                    {log.parentNodeName && log.parentNodeName !== "N/A" && (
                      <span>Node: {log.parentNodeName}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {!loading && !error && logs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800/50">
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-400">
              {last7DaysLogs.filter((l) => l.status === "SUCCESS").length} of{" "}
              {last7DaysLogs.length} successful (Last 7 days)
            </div>
            <button
              onClick={() => setShowAllModal(true)}
              className="text-indigo-400 hover:text-indigo-300 text-xs hover:underline"
            >
              View all activities →
            </button>
          </div>
        </div>
      )}
      {showAllModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1525] w-full max-w-3xl rounded-xl border border-indigo-900/50 max-h-[80vh] flex flex-col overflow-hidden">
            {/* Header - fixed */}
            <div className="p-4 border-b border-indigo-900/40 flex justify-between items-center flex-shrink-0 bg-[#0e1525] z-10">
              <h2 className="text-lg font-semibold text-white">
                All Activities ({last7DaysLogs.length})
              </h2>
              <button
                onClick={() => setShowAllModal(false)}
                className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content - optimized for performance */}
            {/* Content */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-2"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="space-y-2">
                {last7DaysLogs.map((log, index) => (
                  <div
                    key={log.id}
                    className="bg-gray-900/30 hover:bg-gray-800/40 rounded-lg p-3 border border-gray-800/30 transition-all"
                    
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="p-1.5 bg-gray-800/50 rounded-lg flex-shrink-0">
                        {getOperationIcon(log.operation)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* First row: Operation & Status */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-white truncate">
                              {getOperationText(log.operation)}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                              {log.vmName || `VM-${log.vmId || "Unknown"}`}
                            </p>
                          </div>

                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium flex-shrink-0 ${getStatusStyle(log.status)}`}
                          >
                            {getStatusIcon(log.status)}
                            <span className="capitalize">
                              {log.status?.toLowerCase() || "unknown"}
                            </span>
                          </div>
                        </div>

                        {/* Second row: Source & User */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSourceBadge(log.actionSource)}
                            {log.userEmail && (
                              <span
                                className="text-[10px] text-gray-400"
                                title={log.userEmail}
                              >
                                by {formatEmail(log.userEmail)}
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] text-indigo-300 font-medium flex-shrink-0">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>

                        {/* Error message (if any) */}
                        {log.errorMessage && (
                          <div className="mt-2 pt-2 border-t border-gray-800/30">
                            <p className="text-[10px] text-red-400 flex items-center gap-1">
                              <FaExclamationTriangle className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="break-words">
                                {log.errorMessage}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Additional info */}
                        <div className="mt-2 pt-2 border-t border-gray-800/30 flex items-center justify-between text-[10px] text-gray-500">
                          <span>VM ID: {log.vmId || "N/A"}</span>
                          {log.parentNodeName &&
                            log.parentNodeName !== "N/A" && (
                              <span>Node: {log.parentNodeName}</span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
