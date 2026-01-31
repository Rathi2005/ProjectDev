import React, { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
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
  Wallet,
  Tag,
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
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletPaying, setWalletPaying] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletFetched, setWalletFetched] = useState(false);

  // Coupon Code
  const [useCoupon, setUseCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponValidated, setCouponValidated] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponData, setCouponData] = useState(null);

  const canApplyDiscounts = useMemo(() => {
    return (
      selectedResources?.cpuPriceId &&
      selectedResources?.ramPriceId &&
      selectedResources?.diskPriceId &&
      selectedResources?.bandwidthPriceId &&
      Number(months) > 0
    );
  }, [selectedResources, months]);

  const isCouponBlockingPayment = useMemo(() => {
    return useCoupon && !couponValidated;
  }, [useCoupon, couponValidated]);

  const disablePayForCoupon = useMemo(() => {
    return useCoupon && !couponValidated;
  }, [useCoupon, couponValidated]);

  // Function to extract display name without price
  const extractDisplayName = (str) => {
    if (!str) return "";
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

  const discountAmount = useMemo(() => {
    if (!couponValidated || !couponData) return 0;

    if (couponData.discountType === "percentage") {
      return (totalPayable * couponData.discountValue) / 100;
    }

    return couponData.discountAmount || 0;
  }, [couponValidated, couponData, totalPayable]);

  const finalPayable = useMemo(() => {
    return Math.max(totalPayable - discountAmount, 0);
  }, [totalPayable, discountAmount]);

  // Prepare the complete server configuration object
  const serverConfig = useMemo(() => {
    return {
      vmName: vmName,
      serverId: serverId || null,
      isoId: selectedOS?.id || null,
      planType: selectedType?.toLowerCase().includes("dedicated")
        ? "DEDICATED"
        : "SHARED",
      cpuPriceId: selectedResources?.cpuPriceId || null,
      ramPriceId: selectedResources?.ramPriceId || null,
      diskPriceId: selectedResources?.diskPriceId || null,
      bandwidthPriceId: selectedResources?.bandwidthPriceId || null,
      months: Number(months),
      useWalletBalance,
      couponCode: useCoupon && couponCode.trim() ? couponCode.trim() : null,
      clientReferenceId: `vm-${Date.now()}`,
      payableAmount: finalPayable,
    };
  }, [
    vmName,
    serverId,
    selectedOS,
    selectedType,
    selectedResources,
    months,
    useWalletBalance,
    useCoupon,
    couponCode,
  ]);

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
          `HTTP ${response.status}: ${errorText || response.statusText}`,
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

  const fetchWalletBalance = async () => {
    if (walletFetched || walletLoading) return;

    setWalletLoading(true);
    try {
      const res = await apiRequest(
        `${import.meta.env.VITE_BASE_URL}/api/wallet`,
        { method: "GET" },
      );
      const data = await res.json();
      setWalletBalance(Number(data.balance || 0));
      setWalletFetched(true);
    } catch (e) {
      console.error("Failed to fetch wallet balance");
    } finally {
      setWalletLoading(false);
    }
  };

  // Handle server creation
  const handleCreateServer = async () => {
    if (!isConfigurationComplete()) {
      alert(
        "⚠️ Please complete all server configuration steps before creating the server.",
      );
      return;
    }

    setIsLoading(true);

    if (useWalletBalance) {
      setWalletPaying(true);
    }

    try {
      await testTokenValidity();

      const CREATE_SERVER_URL = `${import.meta.env.VITE_BASE_URL}/api/users/vms/create`;

      if (!CREATE_SERVER_URL) {
        throw new Error(
          "API endpoint not configured. Please check environment variables.",
        );
      }

      const response = await apiRequest(CREATE_SERVER_URL, {
        method: "POST",
        body: JSON.stringify(serverConfig),
      });

      const data = await response.json();
      // Scenario B: Instant success (Wallet / Coupon)
      if (data?.status === "COMPLETED") {
        Swal.fire({
          icon: "success",
          title: "Payment Successful",
          text: data.message || "VM provisioning has started.",
          background: "#0e1525",
          color: "#e5e7eb",
          confirmButtonColor: "#6366f1",
        }).then(() => {
          window.location.reload();
        });

        return;
      }

      // Scenario A: Gateway payment required
      if (data?.paymentSessionId) {
        if (data.walletDeducted > 0) {
          Swal.fire({
            icon: "info",
            title: "Wallet Applied",
            html: `
        <div class="text-sm">
          Wallet Used: <b>₹${data.walletDeducted}</b><br/>
          Remaining to Pay: <b>₹${data.remainingToPay}</b>
        </div>
      `,
            background: "#0e1525",
            color: "#e5e7eb",
            confirmButtonColor: "#6366f1",
          });
        }
        onPaymentStart?.(data.paymentSessionId, data.paymentId);

        return;
      }

      throw new Error("Unexpected payment response");
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

      alert(`Server creation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setWalletPaying(false);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (!canApplyDiscounts) {
      setCouponError("Please select VM resources first");
      return;
    }

    setCouponValidating(true);
    setCouponError("");
    setCouponValidated(false);

    try {
      const res = await apiRequest(
        `${import.meta.env.VITE_BASE_URL}/api/coupons/validate`,
        {
          method: "POST",
          body: JSON.stringify({
            code: couponCode.trim(),
            orderAmount: totalPayable,
          }),
        },
      );

      const data = await res.json();

      if (data.valid) {
        setCouponValidated(true);
        setCouponData(data);
        Swal.fire({
          icon: "success",
          title: "Coupon Applied",
          text: data.message,
          background: "#0e1525",
          color: "#e5e7eb",
          confirmButtonColor: "#6366f1",
        });
      } else {
        setCouponValidated(false);
        setCouponData(null);
        setCouponError(data.error || "Invalid coupon");
      }
    } catch (e) {
      setCouponError("Failed to validate coupon. Please try again.");
    } finally {
      setCouponValidating(false);
    }
  };

  useEffect(() => {
    // Reset wallet & coupon when pricing changes
    setUseWalletBalance(false);
    setUseCoupon(false);
    setCouponCode("");
    setCouponValidated(false);
    setCouponData(null);
    setCouponError("");
  }, [
    selectedResources?.cpuPriceId,
    selectedResources?.ramPriceId,
    selectedResources?.diskPriceId,
    selectedResources?.bandwidthPriceId,
    months,
  ]);

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
      selectedResources.vCPU,
    )} • ${extractDisplayName(selectedResources.ram)} • ${extractDisplayName(
      selectedResources.disk,
    )} • ${extractDisplayName(selectedResources.bandwidth)}`;
  };

  const isCreateButtonDisabled = useMemo(() => {
    return (
      !isConfigurationComplete() ||
      !hasValidToken ||
      isLoading ||
      (useCoupon && !couponValidated) ||
      walletPaying
    );
  }, [
    isConfigurationComplete,
    hasValidToken,
    isLoading,
    useCoupon,
    couponValidated,
    walletPaying,
  ]);

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
              className="w-full bg-[#0a0f1c] border border-gray-700 rounded-lg px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter server name"
              disabled={isLoading}
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
              className="w-full bg-[#0a0f1c] border border-gray-700 rounded-lg px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="1"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Configuration Details */}
        <div className="bg-gray-900/30 rounded-xl border border-gray-700/50">
          <button
            onClick={() => setConfigExpanded(!configExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/30 transition-colors rounded-t-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
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
                    ₹{finalPayable.toFixed(2)}
                  </div>

                  {couponValidated && discountAmount > 0 && (
                    <div className="text-xs text-green-400 mt-1">
                      Coupon Discount: −₹{discountAmount.toFixed(2)}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Option */}
        <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useWalletBalance}
              disabled={!canApplyDiscounts || isLoading || walletPaying}
              onChange={(e) => {
                const checked = e.target.checked;
                setUseWalletBalance(checked);

                if (checked) {
                  fetchWalletBalance();
                }
              }}
              className="w-4 h-4 accent-indigo-600 disabled:opacity-50"
            />
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-sm font-medium text-white">
                  Use Wallet Balance
                </p>
                <p className="text-xs text-gray-400">
                  {!canApplyDiscounts
                    ? "Select VM resources to enable wallet"
                    : walletLoading
                      ? "Fetching wallet balance..."
                      : `Available: ₹${walletBalance.toFixed(2)}`}
                </p>
              </div>
            </div>
          </label>
        </div>

        {/* Coupon Option */}
        <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-3">
          <label className="flex items-center gap-3 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={useCoupon}
              disabled={!canApplyDiscounts || isLoading || walletPaying}
              onChange={(e) => {
                const checked = e.target.checked;
                setUseCoupon(checked);
                if (!checked) {
                  setCouponCode("");
                  setCouponValidated(false);
                  setCouponData(null);
                  setCouponError("");
                }
              }}
              className="w-4 h-4 accent-indigo-600 disabled:opacity-50"
            />
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-sm font-medium text-white">Use Coupon</p>
                <p className="text-xs text-gray-400">
                  Apply promo code for discount
                </p>
              </div>
            </div>
          </label>

          {useCoupon && (
            <div className="mt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  disabled={
                    !canApplyDiscounts ||
                    isLoading ||
                    couponValidated ||
                    walletPaying
                  }
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponValidated(false);
                    setCouponError("");
                  }}
                  placeholder="Enter coupon code"
                  className="flex-1 w-8 bg-[#0a0f1c] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={validateCoupon}
                  disabled={
                    !canApplyDiscounts ||
                    couponValidating ||
                    !couponCode.trim() ||
                    isLoading ||
                    walletPaying
                  }
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {couponValidating ? (
                    <>
                      <Loader2 className="inline w-3 h-3 mr-1 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-400 mt-2">{couponError}</p>
              )}
              {couponValidated && couponData && (
                <div className="text-xs text-green-400 mt-2 bg-green-900/20 p-2 rounded">
                  ✓ Discount Applied: ₹{couponData.discountAmount.toFixed(2)} (
                  {couponData.discountType === "percentage"
                    ? `${couponData.discountValue}%`
                    : "Fixed amount"}
                  )
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-gray-800 space-y-4 bg-[#0e1525]/50">
        {/* Status Indicators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                hasValidToken
                  ? "bg-green-900/30 text-green-400 border border-green-800/50"
                  : "bg-red-900/30 text-red-400 border border-red-800/50"
              }`}
            >
              {hasValidToken ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
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
          disabled={isCreateButtonDisabled}
          className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-base relative
            ${
              !isCreateButtonDisabled
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                : "bg-gray-800 text-gray-400 cursor-not-allowed"
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Server...
            </>
          ) : walletPaying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Wallet Payment...
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
          ) : useCoupon && !couponValidated ? (
            <>
              <Tag className="w-5 h-5" />
              Apply Valid Coupon First
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ₹{finalPayable.toFixed(2)} & Deploy
            </>
          )}
        </button>
      </div>

      {/* Wallet Payment Overlay */}
      {walletPaying && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 bg-[#121a2a] p-8 rounded-2xl border border-gray-700 shadow-2xl">
            <div className="relative">
              <div className="absolute inset-0 animate-ping bg-indigo-400/20 rounded-full"></div>
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            </div>
            <p className="text-gray-200 text-lg font-medium">
              Processing wallet payment...
            </p>
            <p className="text-gray-400 text-sm">
              Please do not close this window
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default SummarySidebar;
