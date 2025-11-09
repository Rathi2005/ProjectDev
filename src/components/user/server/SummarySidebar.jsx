import React, { useState, useMemo } from "react";

const SummarySidebar = ({
  selectedLocation,
  selectedOS,
  selectedType,
  selectedResources,
  serverId, // This comes from CreateServerPage via parent
}) => {
  const [serverCount, setServerCount] = useState(1);
  const [vmName, setVmName] = useState("my-shared-vm-test-3");

  // Function to calculate pricing based on selected resources
  const calculatePricing = useMemo(() => {
    if (!selectedResources || !selectedResources.pricing) {
      return {
        serverPrice: 590, // Default price per server (₹)
        ipv4Price: 42, // Default price per IPv4 (₹)
      };
    }

    return {
      serverPrice: parseFloat(selectedResources.pricing.monthly) || 590,
      ipv4Price: 42, // Fixed price per server for IPv4
    };
  }, [selectedResources]);

  // Prepare the complete server configuration object
  const serverConfig = useMemo(() => {
    const config = {
      vmName: vmName,
      serverId: serverId || null,
      isoId: selectedOS?.id || null,
      planType: selectedType
        ? selectedType.toUpperCase().replace(/\s+/g, "_")
        : null,
      cpuPriceId: selectedResources?.cpuPriceId || null,
      ramPriceId: selectedResources?.ramPriceId || null,
      diskPriceId: selectedResources?.diskPriceId || null,
      bandwidthPriceId: selectedResources?.bandwidthPriceId || null,
    };

    // Log the configuration for debugging
    console.log("🔄 Server Configuration:", config);
    return config;
  }, [vmName, serverId, selectedOS, selectedType, selectedResources]);

  // Total price = (per-server total) × number of servers
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

  // Handle server creation
  const handleCreateServer = async () => {
    // if (!isConfigurationComplete()) {
    //   alert(
    //     "⚠️ Please complete all server configuration steps before creating the server."
    //   );
    //   return;
    // }

    // const token =
    //   localStorage.getItem("userToken") || localStorage.getItem("adminToken"); // whichever is used
    // const CREATE_SERVER_URL = import.meta.env.VITE_CREATE_SERVER;

    // try {
    //   console.log("🚀 Creating server with configuration:", serverConfig);

    //   const response = await fetch(CREATE_SERVER_URL, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${token}`,
    //     },
    //     body: JSON.stringify(serverConfig),
    //   });

    //   if (!response.ok) {
    //     const errorText = await response.text();
    //     console.error("❌ Server creation failed:", response.status, errorText);
    //     alert(`Server creation failed: ${response.status} - ${errorText}`);
    //     return;
    //   }

    //   const data = await response.json();
    //   console.log("✅ Server created successfully:", data);
    //   alert("🎉 Server Created Successfully!");
    // } catch (err) {
    //   console.error("🔥 Error while creating server:", err);
    //   alert("Error creating server. Please check the console for details.");
    // }
    alert("🛠️ Server creation logic is currently disabled for testing.");
  };

  // Check if all required configuration is complete
  const isConfigurationComplete = () => {
    return (
      serverId &&
      selectedOS?.id &&
      selectedType &&
      selectedResources?.cpuPriceId &&
      selectedResources?.ramPriceId &&
      selectedResources?.diskPriceId &&
      selectedResources?.bandwidthPriceId
    );
  };

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

        {/* Buy Now Button */}
        <button
          onClick={handleCreateServer}
          className={`w-full py-2 mt-3 rounded font-semibold ${
            isConfigurationComplete()
              ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
          disabled={!isConfigurationComplete()}
        >
          {isConfigurationComplete()
            ? "Create & Buy now"
            : "Complete Configuration"}
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

        {/* Debug Info (remove in production) */}
        <div className="text-xs text-gray-600 border-t border-gray-700 pt-2">
          <div className="flex justify-between">
            <span>Server ID:</span>
            <span>{serverId || "Not set"}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SummarySidebar;
