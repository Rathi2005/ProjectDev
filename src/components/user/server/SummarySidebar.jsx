import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  Server,
  Cpu,
  Globe,
  Calendar,
  Loader2,
  CreditCard,
  Package,
  ChevronDown,
  ChevronUp,
  Database,
  HardDrive,
  Wifi,
} from "lucide-react";

const SummarySidebar = ({
  selectedLocation,
  selectedOS,
  selectedType,
  selectedResources,
  serverId,
  onPaymentStart,
}) => {
  const [vmName, setVmName] = useState("my-shared-vm-test-3");
  const [isLoading, setIsLoading] = useState(false);
  const [months, setMonths] = useState("1");
  const [configExpanded, setConfigExpanded] = useState(true);

  // Function to extract display name without price
  const extractDisplayName = (str) => {
    if (!str) return "";
    // Remove price part like " - Rs 40/hr"
    return str.split(" - Rs")[0].trim();
  };

  // Calculate pricing based on selected resources
  const calculatePricing = useMemo(() => {
    if (!selectedResources?.pricing) {
      return {
        hourlyTotal: 0,
        monthlyTotal: 0,
        ipv4Price: 0,
      };
    }

    return {
      hourlyTotal: Number(selectedResources.pricing.hourly),
      monthlyTotal: Number(selectedResources.pricing.monthly),
      ipv4Price: 0,
    };
  }, [selectedResources]);

  // Calculate total monthly price (including IPv4)
  const monthlyTotal = useMemo(() => {
    return calculatePricing.monthlyTotal + calculatePricing.ipv4Price;
  }, [calculatePricing]);

  // Calculate total payable amount (monthlyTotal * months)
  const totalPayable = useMemo(() => {
    const monthsNum = Number(months) || 1;
    return monthlyTotal * monthsNum;
  }, [monthlyTotal, months]);

  // Prepare the complete server configuration object
  const serverConfig = useMemo(() => {
    return {
      vmName: vmName,
      serverId: serverId || null,
      isoId: selectedOS?.id || null,
      planType: selectedType
        ? selectedType.toUpperCase().replace(/\s+/g, "_").replace("_VCPU", "")
        : null,
      cpuPriceId: selectedResources?.cpuPriceId || null,
      ramPriceId: selectedResources?.ramPriceId || null,
      diskPriceId: selectedResources?.diskPriceId || null,
      bandwidthPriceId: selectedResources?.bandwidthPriceId || null,
      months: Number(months),
    };
  }, [vmName, serverId, selectedOS, selectedType, selectedResources, months]);

  // Handle VM name change
  const handleVmNameChange = (e) => {
    setVmName(e.target.value);
  };

  // Function to check if token is valid
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem("token");
      }
      return !isExpired;
    } catch (error) {
      localStorage.removeItem("token");
      return false;
    }
  };

  // Enhanced API request function
  const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch {
          errorText = "No error message";
        }

        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`
        );
      }

      return response;
    } catch (error) {
      console.error("🔥 API request failed:", error);
      throw error;
    }
  };

  // Test token validity
  const testTokenValidity = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found");
    }

    if (!isTokenValid(token)) {
      throw new Error("Token is invalid or expired");
    }

    const testUrl = import.meta.env.VITE_BASE_URL
      ? `${import.meta.env.VITE_BASE_URL}/api/users/profile`
      : "https://vps.devai.in/api/users/profile";

    try {
      const testResponse = await apiRequest(testUrl, { method: "GET" });
      return true;
    } catch (error) {
      throw new Error(`Token validation failed: ${error.message}`);
    }
  };

  // Handle server creation
  const handleCreateServer = async () => {
    if (!isConfigurationComplete()) {
      alert(
        "⚠️ Please complete all server configuration steps before creating the server."
      );
      return;
    }

    setIsLoading(true);

    try {
      await testTokenValidity();

      const CREATE_SERVER_URL = `${import.meta.env.VITE_BASE_URL}/api/users/vms/create`;

      if (!CREATE_SERVER_URL) {
        throw new Error(
          "API endpoint not configured. Please check environment variables."
        );
      }

      const response = await apiRequest(CREATE_SERVER_URL, {
        method: "POST",
        body: JSON.stringify(serverConfig),
      });

      const data = await response.json();
      if (data?.paymentSessionId && data?.paymentId) {
        onPaymentStart?.(data.paymentSessionId, data.paymentId);
      } else {
        alert("Payment session not received");
      }
    } catch (error) {
      let errorMessage = error.message || "Unknown error occurred";

      if (errorMessage.includes("403")) {
        errorMessage =
          "Access forbidden. Your account may not have permission to create servers, or your token is invalid.";
      } else if (errorMessage.includes("401")) {
        errorMessage = "Authentication failed. Please log in again.";
        localStorage.removeItem("token");
      } else if (
        errorMessage.includes("Network Error") ||
        errorMessage.includes("Failed to fetch")
      ) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (errorMessage.includes("No authentication token")) {
        errorMessage = "Please log in to create a server.";
      }

      alert(`❌ Server creation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if all required configuration is complete
  const isConfigurationComplete = () => {
    const complete =
      serverId &&
      selectedOS?.id &&
      selectedType &&
      selectedResources?.cpuPriceId &&
      selectedResources?.ramPriceId &&
      selectedResources?.diskPriceId &&
      selectedResources?.bandwidthPriceId &&
      months &&
      vmName.trim().length > 0 &&
      Number(months) > 0;

    return complete;
  };

  // Check token status
  const hasValidToken = useMemo(() => {
    const token = localStorage.getItem("token");
    return isTokenValid(token);
  }, []);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const steps = [
      serverId,
      selectedOS?.id,
      selectedType,
      selectedResources?.cpuPriceId,
      months,
    ];
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  }, [serverId, selectedOS, selectedType, selectedResources, months]);

  // Format resource display string
  const formatResourceDisplay = () => {
    if (!selectedResources || !selectedResources.vCPU) return "Not configured";

    return `${extractDisplayName(
      selectedResources.vCPU
    )} • ${extractDisplayName(selectedResources.ram)} • ${extractDisplayName(
      selectedResources.disk
    )} • ${extractDisplayName(selectedResources.bandwidth)}`;
  };

  return (
    <aside className="w-full bg-[#121a2a] border-l border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-900/30 rounded-lg">
              <Package className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Server Summary</h2>
              <p className="text-sm text-gray-400">Review your configuration</p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConfigurationComplete()
                ? "bg-green-900/30 text-green-400"
                : "bg-yellow-900/30 text-yellow-400"
            }`}
          >
            {completionPercentage}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Essential Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Server className="inline w-4 h-4 mr-2" />
              Server Name
            </label>
            <input
              type="text"
              value={vmName}
              onChange={handleVmNameChange}
              className="w-full bg-[#0a0f1c] border border-gray-700 rounded-lg px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter server name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="inline w-4 h-4 mr-2" />
              Duration (Months)
            </label>
            <input
              type="number"
              min="1"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              className="w-full bg-[#0a0f1c] border border-gray-700 rounded-lg px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="1"
            />
          </div>
        </div>

        {/* Configuration Details */}
        <div className="bg-gray-900/30 rounded-xl border border-gray-700/50">
          <button
            onClick={() => setConfigExpanded(!configExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/30 transition-colors rounded-t-xl"
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-300">
                Configuration Details
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isConfigurationComplete()
                    ? "bg-green-900/30 text-green-400"
                    : "bg-yellow-900/30 text-yellow-400"
                }`}
              >
                {isConfigurationComplete()
                  ? "Complete"
                  : `${completionPercentage}%`}
              </span>
            </div>
            {configExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {configExpanded && (
            <div className="px-4 pb-4 space-y-3">
              {/* Location */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      serverId ? "bg-green-900/20" : "bg-gray-800"
                    }`}
                  >
                    <Globe
                      className={`w-4 h-4 ${
                        serverId ? "text-green-400" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Location</p>
                    <p className="text-sm text-gray-400">
                      {selectedLocation || "Not selected"}
                    </p>
                  </div>
                </div>
              </div>

              {/* OS */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedOS?.id ? "bg-blue-900/20" : "bg-gray-800"
                    }`}
                  >
                    <Server
                      className={`w-4 h-4 ${
                        selectedOS?.id ? "text-blue-400" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Operating System</p>
                    <p className="text-sm text-gray-400">
                      {selectedOS
                        ? `${selectedOS.name} ${selectedOS.version}`
                        : "Not selected"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Server Type */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedType ? "bg-purple-900/20" : "bg-gray-800"
                    }`}
                  >
                    <Package
                      className={`w-4 h-4 ${
                        selectedType ? "text-purple-400" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Server Type</p>
                    <p className="text-sm text-gray-400">
                      {selectedType || "Not selected"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedResources?.cpuPriceId
                        ? "bg-amber-900/20"
                        : "bg-gray-800"
                    }`}
                  >
                    <Cpu
                      className={`w-4 h-4 ${
                        selectedResources?.cpuPriceId
                          ? "text-amber-400"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Resources</p>
                    <p className="text-sm text-gray-400">
                      {formatResourceDisplay()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl p-4 border border-gray-700/50 shadow-lg">
          <h3 className="text-base font-semibold text-white mb-3">
            Pricing Summary
          </h3>

          <div className="space-y-3">
            {/* Resource Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Server Resources</span>
                <span className="text-sm font-medium text-white">
                  ₹{calculatePricing.hourlyTotal.toFixed(4)}
                  <span className="text-xs text-gray-400 ml-1">/hr</span>
                </span>
              </div>

              <div className="text-xs text-gray-400">
                Includes CPU, RAM, Disk & Bandwidth
              </div>

              <div className="pt-2 border-t border-gray-700/30 flex justify-between items-center">
                <span className="text-sm text-gray-300">Server Resources</span>
                <span className="text-sm font-medium text-white">
                  ₹{calculatePricing.monthlyTotal.toFixed(2)}
                  <span className="text-xs text-gray-400 ml-1">/month</span>
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-gray-300">IPv4 Address</span>
                <span className="text-sm font-medium text-white">
                  ₹{calculatePricing.ipv4Price.toFixed(2)}
                  <span className="text-xs text-gray-400 ml-1">/month</span>
                </span>
              </div>

              <div className="pt-2 border-t border-gray-700/50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">
                  Monthly Total
                </span>
                <span className="text-sm font-bold text-white">
                  ₹{monthlyTotal.toFixed(2)}
                  <span className="text-xs text-gray-400 ml-1">/month</span>
                </span>
              </div>
            </div>

            {/* Total Payable */}
            <div className="pt-3 mt-2 border-t border-gray-700 bg-gray-900/30 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <span className="font-bold text-white">Total Payable</span>
                  <div className="text-xs text-gray-400">
                    {Number(months) > 1
                      ? `For ${months} months`
                      : "For 1 month"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    ₹{totalPayable.toFixed(2)}
                  </div>
                  {Number(months) > 1 && (
                    <div className="text-xs text-gray-400">
                      (₹{monthlyTotal.toFixed(2)} × {months} months)
                    </div>
                  )}
                </div>
              </div>

              {Number(months) > 1 && (
                <div className="flex justify-between items-center text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700/30">
                  <span>Equivalent to:</span>
                  <span>
                    ₹{(totalPayable / Number(months)).toFixed(2)}/month
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-gray-800 space-y-4 bg-[#0e1525]/50">
        {/* Status Indicators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded ${
                hasValidToken
                  ? "bg-green-900/30 text-green-400"
                  : "bg-red-900/30 text-red-400"
              }`}
            >
              {hasValidToken ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              <span className="text-sm">
                {hasValidToken ? "Authenticated" : "Login Required"}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            Est. setup: <span className="text-white">~2 minutes</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleCreateServer}
          disabled={!isConfigurationComplete() || !hasValidToken || isLoading}
          className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-base
            ${
              isConfigurationComplete() && hasValidToken && !isLoading
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                : "bg-gray-800 text-gray-400 cursor-not-allowed"
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Server...
            </>
          ) : !hasValidToken ? (
            <>
              <AlertCircle className="w-5 h-5" />
              Please Log In to Deploy
            </>
          ) : !isConfigurationComplete() ? (
            <>
              <AlertCircle className="w-5 h-5" />
              Complete Configuration ({completionPercentage}%)
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ₹{totalPayable.toFixed(2)} & Deploy
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default SummarySidebar;
