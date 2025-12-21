import React, { useState, useMemo, useEffect } from "react";

const SummarySidebar = ({
  selectedLocation,
  selectedOS,
  selectedType,
  selectedResources,
  serverId,
}) => {
  const [serverCount, setServerCount] = useState(1);
  const [vmName, setVmName] = useState("my-shared-vm-test-3");
  const [isLoading, setIsLoading] = useState(false);

  // Function to check if token is valid
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        console.log("❌ Token expired");
        localStorage.removeItem("token");
      }
      return !isExpired;
    } catch (error) {
      console.error("❌ Invalid token format:", error);
      localStorage.removeItem("token");
      return false;
    }
  };

  // Check token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      console.warn("⚠️ No valid token found");
    }
  }, []);

  // Function to calculate pricing based on selected resources
  const calculatePricing = useMemo(() => {
    if (!selectedResources || !selectedResources.pricing) {
      return {
        serverPrice: 590,
        ipv4Price: 42,
      };
    }

    return {
      serverPrice: parseFloat(selectedResources.pricing.monthly) || 590,
      ipv4Price: 42,
    };
  }, [selectedResources]);

  // Prepare the complete server configuration object
  const serverConfig = useMemo(() => {
    const config = {
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
    };

    // console.log("🔄 Server Configuration:", config);
    return config;
  }, [vmName, serverId, selectedOS, selectedType, selectedResources]);

  // Total price calculation
  const total =
    (calculatePricing.serverPrice + calculatePricing.ipv4Price) * serverCount;

  // Functions to increment and decrement server count
  const increaseCount = () => setServerCount((prev) => prev + 1);
  const decreaseCount = () =>
    setServerCount((prev) => (prev > 1 ? prev - 1 : 1));

  // Handle VM name change
  const handleVmNameChange = (e) => {
    setVmName(e.target.value);
  };

  // Enhanced API request function with better error handling
  const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest", // Add this
        ...options.headers,
      },
    };

    // Log EXACTLY what we're sending
    console.log("🚀 Making API request:", {
      url,
      method: config.method,
      headers: config.headers,
      body: config.body ? JSON.parse(config.body) : undefined,
    });

    try {
      const response = await fetch(url, config);

      // Log ALL response headers
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      console.log("📨 Full API response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: responseHeaders,
        url: response.url,
      });

      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
          console.log("❌ Error response body:", errorText);
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

  // Test token validity before making the main request
  const testTokenValidity = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found");
    }

    if (!isTokenValid(token)) {
      throw new Error("Token is invalid or expired");
    }

    // Test with a simple profile request
    const testUrl = import.meta.env.VITE_API_BASE_URL
      ? `${import.meta.env.VITE_API_BASE_URL}/users/profile`
      : "https://vps.devai.in/api/users/profile";

    try {
      const testResponse = await apiRequest(testUrl, { method: "GET" });
      console.log("✅ Token validation successful");
      return true;
    } catch (error) {
      console.error("❌ Token validation failed:", error);
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
      // Step 1: Validate token first
      await testTokenValidity();

      // Step 2: Prepare the request
      const CREATE_SERVER_URL = import.meta.env.VITE_CREATE_SERVER;

      if (!CREATE_SERVER_URL) {
        throw new Error(
          "API endpoint not configured. Please check environment variables."
        );
      }

      // console.log("🎯 Creating server with final configuration:", serverConfig);

      // Step 3: Make the actual request
      const response = await apiRequest(CREATE_SERVER_URL, {
        method: "POST",
        body: JSON.stringify(serverConfig),
      });

      const data = await response.json();
      // console.log("✅ Server created successfully:", data);
      alert("🎉 Server Created Successfully!");
    } catch (error) {
      // console.error("🔥 Error creating server:", error);

      let errorMessage = error.message || "Unknown error occurred";

      // Provide user-friendly error messages
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
      selectedResources?.bandwidthPriceId;

    // if (!complete) {
    //   console.log("⚠️ Configuration incomplete. Missing:", {
    //     serverId: !serverId,
    //     selectedOS: !selectedOS?.id,
    //     selectedType: !selectedType,
    //     cpuPriceId: !selectedResources?.cpuPriceId,
    //     ramPriceId: !selectedResources?.ramPriceId,
    //     diskPriceId: !selectedResources?.diskPriceId,
    //     bandwidthPriceId: !selectedResources?.bandwidthPriceId,
    //   });
    // }

    return complete;
  };

  // Check token status
  const hasValidToken = useMemo(() => {
    const token = localStorage.getItem("token");
    return isTokenValid(token);
  }, []);

  return (
    <aside className="w-[300px] bg-[#121a2a] mt-10 p-6 border-l border-gray-800 flex flex-col justify-start">
      <div className="space-y-4 mb-12">
        {/* VM Name Input */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">VM Name</label>
          <input
            type="text"
            value={vmName}
            onChange={handleVmNameChange}
            className="w-full bg-[#0e1525] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            placeholder="Enter VM name"
          />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <span className={`${serverId ? "text-green-500" : "text-gray-500"}`}>
            ✔
          </span>
          <span>
            {selectedLocation
              ? `${selectedLocation} - Location (ID: ${serverId})`
              : "No location selected"}
          </span>
        </div>

        {/* Operating System */}
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`${selectedOS?.id ? "text-green-500" : "text-gray-500"}`}
          >
            ✔
          </span>
          <span>
            {selectedOS
              ? `${selectedOS.name} ${selectedOS.version} - Image (ID: ${selectedOS.id})`
              : "No OS selected"}
          </span>
        </div>

        {/* Server Type */}
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`${selectedType ? "text-green-500" : "text-gray-500"}`}
          >
            ✔
          </span>
          <span>
            {selectedType
              ? `${selectedType} - Type (${serverConfig.planType})`
              : "No type selected"}
          </span>
        </div>

        {/* Resources */}
        {selectedResources && Object.keys(selectedResources).length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`${
                selectedResources.cpuPriceId &&
                selectedResources.ramPriceId &&
                selectedResources.diskPriceId &&
                selectedResources.bandwidthPriceId
                  ? "text-green-500"
                  : "text-yellow-500"
              }`}
            >
              {selectedResources.cpuPriceId &&
              selectedResources.ramPriceId &&
              selectedResources.diskPriceId &&
              selectedResources.bandwidthPriceId
                ? "✔"
                : "⚠"}
            </span>
            <span>
              {selectedResources.vCPU &&
                `${selectedResources.vCPU} (ID: ${selectedResources.cpuPriceId}), `}
              {selectedResources.ram &&
                `${selectedResources.ram} (ID: ${selectedResources.ramPriceId}), `}
              {selectedResources.disk &&
                `${selectedResources.disk} (ID: ${selectedResources.diskPriceId})`}{" "}
              - Resources
              {selectedResources.bandwidthPriceId &&
                `, Bandwidth (ID: ${selectedResources.bandwidthPriceId})`}
            </span>
          </div>
        )}
      </div>

      {/* Purchase Section */}
      <div className="pt-3 border-t border-gray-800 space-y-4">
        {/* Authentication Status */}
        <div className="text-xs mb-2">
          <div className="flex justify-between items-center">
            <span>Authentication:</span>
            <span
              className={`px-2 py-1 rounded ${
                hasValidToken
                  ? "bg-green-900/30 text-green-400"
                  : "bg-red-900/30 text-red-400"
              }`}
            >
              {hasValidToken ? "Authenticated" : "Not Authenticated"}
            </span>
          </div>
        </div>

        {/* Server count control */}
        <div className="flex items-center justify-between">
          <button
            onClick={decreaseCount}
            className="px-2 py-1 border border-gray-700 rounded hover:bg-gray-700/30"
          >
            -
          </button>
          <span>
            {serverCount} Server{serverCount > 1 ? "s" : ""}
          </span>
          <button
            onClick={increaseCount}
            className="px-2 py-1 border border-gray-700 rounded hover:bg-gray-700/30"
          >
            +
          </button>
        </div>

        {/* Pricing breakdown */}
        <div className="text-sm space-y-3">
          <div className="flex justify-between text-gray-400">
            <span>
              {serverCount} SERVER{serverCount > 1 ? "S" : ""}
            </span>
            <span className="text-white">
              ₹{(calculatePricing.serverPrice * serverCount).toFixed(0)}/mo
            </span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>{serverCount} IPv4</span>
            <span className="text-white">
              ₹{(calculatePricing.ipv4Price * serverCount).toFixed(0)}/mo
            </span>
          </div>
          <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
            <span>Total</span>
            <span>₹{total.toFixed(0)}/mo</span>
          </div>
        </div>

        {/* Create Server Button */}
        <button
          onClick={handleCreateServer}
          disabled={!isConfigurationComplete() || !hasValidToken || isLoading}
          className={`w-full py-2 mt-3 rounded font-semibold transition-all ${
            isConfigurationComplete() && hasValidToken && !isLoading
              ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          } ${isLoading ? "opacity-70" : ""}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Server...
            </span>
          ) : !hasValidToken ? (
            "Please Log In"
          ) : !isConfigurationComplete() ? (
            "Complete Configuration"
          ) : (
            "Create & Buy now"
          )}
        </button>

        <p className="text-xs text-gray-500 mt-2">
          All prices incl. 0% VAT. Our{" "}
          <span className="underline text-gray-400 hover:text-white cursor-pointer">
            terms and conditions
          </span>{" "}
          apply.
        </p>

        {/* Hourly Pricing */}
        {selectedResources?.pricing?.hourly && (
          <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
            <div className="flex justify-between">
              <span>Hourly rate:</span>
              <span>
                ₹
                {(
                  parseFloat(selectedResources.pricing.hourly) * serverCount
                ).toFixed(2)}
                /hour
              </span>
            </div>
          </div>
        )}

        {/* Configuration Status */}
        <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
          <div className="flex justify-between items-center">
            <span>Configuration:</span>
            <span
              className={`px-2 py-1 rounded ${
                isConfigurationComplete()
                  ? "bg-green-900/30 text-green-400"
                  : "bg-yellow-900/30 text-yellow-400"
              }`}
            >
              {isConfigurationComplete() ? "Complete" : "Incomplete"}
            </span>
          </div>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-gray-600 border-t border-gray-700 pt-2 space-y-1">
          <div className="flex justify-between">
            <span>Server ID:</span>
            <span>{serverId || "Not set"}</span>
          </div>
          <div className="flex justify-between">
            <span>Token Status:</span>
            <span>{hasValidToken ? "Valid" : "Invalid/Missing"}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SummarySidebar;
