import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  CpuIcon,
  MemoryStick,
  HardDriveIcon,
  Gauge,
} from "lucide-react";
import MetricChart from "../../components/admin/liveGraphs/MetricChart";
import toast from "react-hot-toast";

export default function VMPerformancePage() {
  const { vmid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { serverId, vmName } = location.state || {};

  const [metrics, setMetrics] = useState({ history: [], current: null });
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  /* ===================== FETCH METRICS (POLLING) ===================== */
  useEffect(() => {
    let intervalId;
    let mounted = true;
    let firstLoad = true;

    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const res = await fetch(`${BASE_URL}/api/admin/${vmid}/metrics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!mounted) return;

        setMetrics({
          history: json.history?.data ?? [],
          current: json.current?.data ?? null,
        });

        if (firstLoad) {
          setLoading(false);
          firstLoad = false;
        }
      } catch (err) {
        toast.error("Failed to fetch metrics", err);
        if (firstLoad) setLoading(false);
      }
    };

    fetchMetrics();
    intervalId = setInterval(fetchMetrics, 3000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [vmid, BASE_URL]);

  const latest =
    metrics.history.length > 0
      ? metrics.history[metrics.history.length - 1]
      : null;

  /* ===================== DERIVED VALUES ===================== */
  const cpuPercent = latest ? Math.round((latest.cpu ?? 0) * 100) : 0;

  const memUsedGB = latest ? (latest.mem / 1024 ** 3).toFixed(2) : "0.00";
  const memTotalGB = latest ? (latest.maxmem / 1024 ** 3).toFixed(0) : "0";
  const memPercent = latest
    ? Math.round((latest.mem / latest.maxmem) * 100)
    : 0;

  const diskUsedGB = latest ? (latest.disk / 1024 ** 3).toFixed(2) : "0.00";
  const diskTotalGB = latest ? (latest.maxdisk / 1024 ** 3).toFixed(0) : "0";
  const diskPercent = latest
    ? Math.round((latest.disk / latest.maxdisk) * 100)
    : 0;

  const getUsageColor = (p) =>
    p >= 85 ? "text-red-400" : p >= 65 ? "text-yellow-400" : "text-green-400";

  const getBarColor = (p) =>
    p >= 85 ? "bg-red-500" : p >= 65 ? "bg-yellow-500" : "bg-green-500";

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-[#0e1525] text-gray-100 p-6 space-y-6">
      {/* ===================== HEADER ===================== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold">VM Performance</h1>
            <p className="text-sm text-gray-400">
              {vmName || "VM"} • VMID {vmid} • Server {serverId}
            </p>
          </div>
        </div>

        {/* Close / Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20
                     text-red-400 hover:text-red-300 transition"
          title="Close"
        >
          ✕
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Loading VM metrics…
        </div>
      ) : (
        <>
          {/* ===================== COMPACT METRICS GRID ===================== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricBox
              icon={<CpuIcon className="w-4 h-4 text-blue-400" />}
              label="CPU"
              percent={cpuPercent}
              footer={`${latest?.maxcpu ?? 0} cores`}
              getUsageColor={getUsageColor}
              getBarColor={getBarColor}
            />

            <MetricBox
              icon={<MemoryStick className="w-4 h-4 text-green-400" />}
              label="Memory"
              percent={memPercent}
              footer={`${memUsedGB}GB / ${memTotalGB}GB`}
              getUsageColor={getUsageColor}
              getBarColor={getBarColor}
            />

            <MetricBox
              icon={<HardDriveIcon className="w-4 h-4 text-amber-400" />}
              label="Disk"
              percent={diskPercent}
              footer={`${diskUsedGB}GB / ${diskTotalGB}GB`}
              getUsageColor={getUsageColor}
              getBarColor={getBarColor}
            />

            <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Gauge className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium">Network</span>
              </div>
              <div className="text-xs text-gray-400">
                ⬇ {latest?.netin?.toFixed(1) ?? 0} KB/s
                <br />⬆ {latest?.netout?.toFixed(1) ?? 0} KB/s
              </div>
            </div>
          </div>

          {/* ===================== CHARTS ===================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricChart
              title="CPU Usage (%)"
              data={metrics}
              extract={(h) => Math.max(h.cpu * 100, 0.1)}
            />

            <MetricChart
              title="Memory Usage (GB)"
              data={metrics}
              extract={(h) => Math.max(h.mem / 1024 ** 3, 0.01)}
            />

            <MetricChart
              title="Disk Write (KB/s)"
              data={metrics}
              extract={(h) => Math.max(h.diskwrite ?? 0, 0.1)}
            />

            <MetricChart
              title="Network In (KB/s)"
              data={metrics}
              extract={(h) => Math.max(h.netin ?? 0, 0.1)}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ===================== REUSABLE METRIC BOX ===================== */
function MetricBox({
  icon,
  label,
  percent,
  footer,
  getUsageColor,
  getBarColor,
}) {
  return (
    <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={`text-sm font-bold ${getUsageColor(percent)}`}>
          {percent}%
        </span>
      </div>

      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full transition-all duration-300 ${getBarColor(
            percent
          )}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="text-xs text-gray-400">{footer}</div>
    </div>
  );
}
