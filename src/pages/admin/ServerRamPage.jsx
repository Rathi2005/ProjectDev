import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MemoryStick,
  Loader2,
  Cpu,
  HardDrive,
  Network,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import Header from "../../components/admin/adminHeader";
import { toast } from "react-hot-toast";

export default function ServerRamPage() {
  const { id: serverId } = useParams();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [ram, setRam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowedPercentage, setAllowedPercentage] = useState(0);
  const [initialPercentage, setInitialPercentage] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const usagePercent = ram?.allowedRamLimitBytes
    ? Math.min(
        Math.round((ram.usedRamBytes / ram.allowedRamLimitBytes) * 100),
        100
      )
    : 0;

  const barColor =
    usagePercent >= 90
      ? "bg-red-500"
      : usagePercent >= 75
      ? "bg-yellow-500"
      : usagePercent >= 50
      ? "bg-blue-500"
      : "bg-green-500";

  // Calculate actual formatted allowed RAM
  const formattedAllowedRam = ram?.allowedRamLimitBytes
    ? `${(ram.allowedRamLimitBytes / 1024 / 1024 / 1024).toFixed(2)} GB`
    : "0 GB";

  // Fetch RAM stats
  const fetchRam = useCallback(async () => {
    const token = localStorage.getItem("adminToken");

    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/servers/${serverId}/ram-stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        toast.error("Unauthorized access");
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setRam(data);
      setAllowedPercentage(data.allowedPercentage || 0);
      setInitialPercentage(data.allowedPercentage || 0);
    } catch (err) {
      console.error("Fetch RAM error:", err);
      toast.error("Failed to load RAM stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [BASE_URL, serverId]);

  useEffect(() => {
    if (serverId) {
      fetchRam();
    }
  }, [serverId, fetchRam]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRam();
  };

  // Update allowed RAM %
  const updateRamLimit = async () => {
    const percentage = Number(allowedPercentage);

    // Input validation
    if (isNaN(percentage) || percentage < 1 || percentage > 100) {
      toast.error("Please enter a valid percentage between 1 and 100");
      return;
    }

    const token = localStorage.getItem("adminToken");
    setUpdating(true);

    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/servers/${serverId}/ram-percentage`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            percentage: percentage,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      toast.success("RAM limit updated successfully");

      // Update initial percentage after successful update
      setInitialPercentage(percentage);

      // Refresh data after update
      await fetchRam();
    } catch (err) {
      console.error("Update RAM error:", err);
      toast.error(err.message || "Failed to update RAM limit");
    } finally {
      setUpdating(false);
    }
  };

  // Check if percentage has changed
  const hasChanged = allowedPercentage !== initialPercentage;

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !updating && hasChanged) {
      updateRamLimit();
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0a0f1c] text-gray-100 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 mt-[72px] flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <MemoryStick className="w-10 h-10 text-indigo-400 absolute inset-0 m-auto" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Loading Server RAM</h3>
              <p className="text-gray-400">
                Fetching statistics for server {serverId}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0f1c] text-gray-100 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 md:p-8">
        {/* Header Section */}
        <div className="mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              {/* Add Back Button Here */}
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl">
                <MemoryStick className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {ram?.serverName || "Server"} RAM Management
                </h1>
                <p className="text-gray-400 mt-1">
                  Server ID:{" "}
                  <span className="text-indigo-300 font-mono">{serverId}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 
                         disabled:opacity-50 rounded-lg flex items-center gap-2 
                         transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <div className="text-xs text-indigo-300">Last Updated</div>
                <div className="text-sm font-medium">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Usage Stats */}
            <div className="lg:col-span-2 space-y-8 h-full">
              {/* Usage Overview Card */}
              <div
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 
                            rounded-2xl border border-gray-700/50 p-6 h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">RAM Usage Overview</h2>
                  <div className="px-3 py-1 bg-gray-800/50 rounded-full text-sm">
                    Real-time Monitoring
                  </div>
                </div>

                {/* Progress Visualization */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-3xl font-bold">{usagePercent}%</div>
                      <div className="text-gray-400 text-sm">Current Usage</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold">
                        {ram?.formattedUsedRam || "0 GB"}
                        <span className="text-gray-400 text-sm font-normal">
                          {" "}
                          of {formattedAllowedRam}
                        </span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {ram?.formattedTotalRam || "0 GB"} Total Available
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-4 bg-gray-800/50 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full ${barColor} transition-all duration-500`}
                      style={{ width: `${usagePercent}%` }}
                    />
                    <div className="absolute inset-0 flex items-center">
                      <div
                        className="h-6 w-0.5 bg-white/50 ml-2"
                        style={{ marginLeft: "50%" }}
                      />
                      <div
                        className="h-6 w-0.5 bg-white/30 ml-2"
                        style={{ marginLeft: "75%" }}
                      />
                      <div
                        className="h-6 w-0.5 bg-white/20 ml-2"
                        style={{ marginLeft: "90%" }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>90%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Usage Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Total RAM</div>
                    <div className="text-xl font-semibold">
                      {ram?.formattedTotalRam || "0 GB"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Physical Memory
                    </div>
                  </div>

                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Used RAM</div>
                    <div className="text-xl font-semibold">
                      {ram?.formattedUsedRam || "0 GB"}
                    </div>
                    <div className="text-xs text-green-500 mt-1">
                      Active Usage
                    </div>
                  </div>

                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">
                      Allowed RAM
                    </div>
                    <div className="text-xl font-semibold">
                      {formattedAllowedRam}
                    </div>
                    <div className="text-xs text-indigo-500 mt-1">
                      Current Limit
                    </div>
                  </div>

                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Remaining</div>
                    <div className="text-xl font-semibold">
                      {ram?.remainingAllowedRamBytes
                        ? `${(
                            ram.remainingAllowedRamBytes /
                            1024 /
                            1024 /
                            1024
                          ).toFixed(2)} GB`
                        : "0 GB"}
                    </div>
                    <div className="text-xs text-yellow-500 mt-1">
                      Available
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - RAM Configuration */}
            <div className="space-y-8 h-full">
              {/* Configuration Card */}
              <div
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 
                            rounded-2xl border border-gray-700/50 p-6 h-full" 
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <MemoryStick className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold">RAM Allocation</h2>
                </div>

                <div className="space-y-6">
                  {/* Current Allocation */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Allocation</span>
                      <span className="font-semibold">
                        {initialPercentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{ width: `${initialPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* New Allocation */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-300">
                        New Allocation
                        <span className="text-gray-500 text-xs ml-2">
                          (Drag to adjust)
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-indigo-300">
                          {allowedPercentage}%
                        </div>
                        <div className="text-sm text-gray-400">
                          of {ram?.formattedTotalRam || "0 GB"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={allowedPercentage}
                        onChange={(e) =>
                          setAllowedPercentage(Number(e.target.value))
                        }
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer 
                                 [&::-webkit-slider-thumb]:appearance-none
                                 [&::-webkit-slider-thumb]:h-5
                                 [&::-webkit-slider-thumb]:w-5
                                 [&::-webkit-slider-thumb]:rounded-full
                                 [&::-webkit-slider-thumb]:bg-indigo-500
                                 [&::-webkit-slider-thumb]:border-2
                                 [&::-webkit-slider-thumb]:border-indigo-300
                                 [&::-moz-range-thumb]:h-5
                                 [&::-moz-range-thumb]:w-5
                                 [&::-moz-range-thumb]:rounded-full
                                 [&::-moz-range-thumb]:bg-indigo-500
                                 [&::-moz-range-thumb]:border-2
                                 [&::-moz-range-thumb]:border-indigo-300"
                      />

                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>1%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Numeric Input */}
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={allowedPercentage}
                        onChange={(e) => {
                          const value = Math.min(
                            100,
                            Math.max(1, Number(e.target.value) || 1)
                          );
                          setAllowedPercentage(value);
                        }}
                        onKeyPress={handleKeyPress}
                        className="w-full bg-gray-900/50 border border-gray-700
                                 rounded-xl px-4 py-3 text-gray-200 text-center
                                 focus:border-indigo-500 focus:outline-none
                                 focus:ring-1 focus:ring-indigo-500/30"
                      />
                      <span className="absolute right-4 top-3 text-gray-400">
                        %
                      </span>
                    </div>

                    {/* Calculated Result */}
                    <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/50">
                      <div className="text-sm text-gray-400 mb-1">
                        Allocation Result
                      </div>
                      <div className="text-lg font-semibold">
                        {(
                          ((ram?.totalRamBytes || 0) *
                            (allowedPercentage / 100)) /
                          1024 /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        GB
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Will allocate {allowedPercentage}% of total RAM
                      </div>
                    </div>

                    {/* Update Button */}
                    <button
                      onClick={updateRamLimit}
                      disabled={updating || !hasChanged}
                      className={`w-full py-3 rounded-xl font-medium
                               transition-all duration-200 flex justify-center items-center gap-3
                               ${
                                 hasChanged
                                   ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                   : "bg-gray-800/50 cursor-not-allowed"
                               }`}
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Updating Allocation...
                        </>
                      ) : (
                        <>
                          <MemoryStick className="w-5 h-5" />
                          {hasChanged
                            ? `Update to ${allowedPercentage}%`
                            : "No Changes Made"}
                        </>
                      )}
                    </button>

                    {hasChanged && (
                      <div className="text-xs text-gray-500 text-center">
                        {allowedPercentage > initialPercentage ? (
                          <span className="text-green-400">
                            +{allowedPercentage - initialPercentage}% increase
                          </span>
                        ) : (
                          <span className="text-yellow-400">
                            -{initialPercentage - allowedPercentage}% decrease
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Changes take effect immediately. Server restart may be required
              for optimal performance.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
