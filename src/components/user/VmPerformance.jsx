import React, { useEffect, useState } from "react";
import {
  Activity,
  CpuIcon,
  MemoryStick,
  HardDriveIcon,
  Gauge,
} from "lucide-react";
import MetricChart from "../admin/liveGraphs/MetricChart";
import toast from "react-hot-toast";

export default function VMPerformance({
  apiUrl,
  tokenKey,
  vmid,
  vmName,
  serverId,
  onClose,
}) {
  const [metrics, setMetrics] = useState({ history: [], current: null });
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    let mounted = true;
    let interval;

    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem(tokenKey);

        const res = await fetch(`${BASE_URL}${apiUrl}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!mounted) return;

        // ✅ HISTORY for charts
        const history = (json.graphs ?? []).filter((p) => p.cpu !== undefined);

        // ✅ CURRENT for live cards
        const current = json.current?.data ?? null;

        setMetrics({
          history,
          current,
        });

        setLoading(false);
      } catch (err) {
        toast.error("Failed to fetch VM metrics");
        setLoading(false);
      }
    };

    fetchMetrics();
    interval = setInterval(fetchMetrics, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [apiUrl, tokenKey]);

  const latest =
    metrics.current ||
    (metrics.history.length > 0
      ? metrics.history[metrics.history.length - 1]
      : null);

  // CPU
  const cpuPercent = latest ? Math.round(latest.cpu * 100) : 0;
  const cpuCores = latest?.maxcpu ?? latest?.cpus ?? 0;

  // Memory
  const memUsedGB = latest ? (latest.mem / 1024 ** 3).toFixed(2) : "0.00";
  const memTotalGB = latest ? (latest.maxmem / 1024 ** 3).toFixed(0) : "0";
  const memPercent = latest
    ? Math.round((latest.mem / latest.maxmem) * 100)
    : 0;

  // Disk
  const diskUsedGB = latest ? (latest.disk / 1024 ** 3).toFixed(2) : "0.00";
  const diskTotalGB = latest ? (latest.maxdisk / 1024 ** 3).toFixed(0) : "0";
  const diskPercent = latest
    ? Math.round((latest.disk / latest.maxdisk) * 100)
    : 0;

  const getColor = (p) =>
    p >= 85 ? "text-red-400" : p >= 65 ? "text-yellow-400" : "text-green-400";

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">Loading VM metrics…</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1525] text-gray-100 p-6 space-y-6">
      {/* Header */}
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

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20
                       text-red-400 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric
          label="CPU"
          value={cpuPercent}
          footer={`${cpuCores} cores`}
          color={getColor(cpuPercent)}
        />

        <Metric
          label="Memory"
          value={memPercent}
          footer={`${memUsedGB}GB / ${memTotalGB}GB`}
          color={getColor(memPercent)}
        />

        <Metric
          label="Disk"
          value={diskPercent}
          footer={`${diskUsedGB}GB / ${diskTotalGB}GB`}
          color={getColor(diskPercent)}
        />

        <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
          <Gauge className="w-4 h-4 text-purple-400 mb-1" />
          <div className="text-xs text-gray-400">
            ⬇ {latest?.netin?.toFixed(1)} KB/s
            <br />⬆ {latest?.netout?.toFixed(1)} KB/s
          </div>
        </div>
      </div>

      {/* Charts */}
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
    </div>
  );
}

function Metric({ label, value, footer, color }) {
  return (
    <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className={`font-bold ${color}`}>{value}%</span>
      </div>
      <div className="h-1 bg-gray-700 rounded">
        <div className="h-full bg-indigo-500" style={{ width: `${value}%` }} />
      </div>
      {footer && <div className="text-xs text-gray-400 mt-1">{footer}</div>}
    </div>
  );
}
