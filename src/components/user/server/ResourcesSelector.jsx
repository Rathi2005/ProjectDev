import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle } from "lucide-react";

const ResourcesSelector = ({
  selectedType,
  setSelectedResources,
  onVerifyAndCreate, // Add this prop
  isServerCreationComplete, // Add this prop
}) => {
  const [vCPU, setVCPU] = useState("");
  const [ram, setRam] = useState("");
  const [disk, setDisk] = useState("");
  const [bandwidth, setBandwidth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State for API data
  const [vcpuOptions, setVcpuOptions] = useState([]);
  const [ramOptions, setRamOptions] = useState([]);
  const [diskOptions, setDiskOptions] = useState([]);
  const [bandwidthOptions, setBandwidthOptions] = useState([]);

  // API endpoints based on your structure
  const API_BASE = import.meta.env.VITE_BASE_URL;

  // Determine API endpoints based on selected type
  const getApiEndpoints = (type) => {
    const basePath = type === "Dedicated vCPU" ? "dedicated" : "shared";
    const endpoints = {
      vcpu: `${API_BASE}/pricing/${basePath}/cpu`,
      ram: `${API_BASE}/pricing/${basePath}/ram`,
      disk: `${API_BASE}/pricing/${basePath}/disk`,
      bandwidth: `${API_BASE}/pricing/${basePath}/bandwidth`,
    };
    return endpoints;
  };

  // Fetch prices based on selected type
  useEffect(() => {
    if (!selectedType) {
      return; // Don't fetch yet
    }

    const fetchPrices = async () => {
      setLoading(true);
      setError("");

      try {
        let token = localStorage.getItem("token");
        try {
          token = JSON.parse(token);
        } catch {}

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const endpoints = getApiEndpoints(selectedType);

        const [vcpuRes, ramRes, diskRes, bandwidthRes] = await Promise.all([
          fetch(endpoints.vcpu, { headers }),
          fetch(endpoints.ram, { headers }),
          fetch(endpoints.disk, { headers }),
          fetch(endpoints.bandwidth, { headers }),
        ]);

        const [vcpuData, ramData, diskData, bandwidthData] = await Promise.all([
          vcpuRes.json(),
          ramRes.json(),
          diskRes.json(),
          bandwidthRes.json(),
        ]);

        setVcpuOptions(vcpuData);
        setRamOptions(ramData);
        setDiskOptions(diskData);
        setBandwidthOptions(bandwidthData);

        if (vcpuData.length > 0) {
          setVCPU(vcpuData[0].label);
        }
        if (ramData.length > 0) setRam(ramData[0].label);
        if (diskData.length > 0) setDisk(diskData[0].label);
        if (bandwidthData.length > 0) setBandwidth(bandwidthData[0].label);
      } catch (err) {
        setError("Failed to load resource prices.");
        setDefaultOptions(selectedType);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [selectedType]);

  // Fallback default options if API fails
  const setDefaultOptions = (type = "Shared vCPU") => {
    // Default options based on server type
    const isDedicated = type === "Dedicated vCPU";

    const defaultVcpuOptions = isDedicated
      ? [
          { id: 5, label: "2 Cores (Dedicated)", price: 1.2 },
          { id: 6, label: "4 Cores (Dedicated)", price: 2.4 },
          { id: 7, label: "8 Cores (Dedicated)", price: 4.8 },
        ]
      : [
          { id: 1, label: "1 Core (Shared)", price: 0.344 },
          { id: 2, label: "2 Cores (Shared)", price: 0.688 },
          { id: 3, label: "4 Cores (Shared)", price: 1.376 },
        ];

    const defaultRamOptions = [
      { id: 3, label: "4 GB RAM", multiplier: 1 },
      { id: 4, label: "8 GB RAM", multiplier: 1.2 },
      { id: 5, label: "16 GB RAM", multiplier: 1.4 },
    ];

    const defaultDiskOptions = [
      { id: 1, label: "40 GB NVMe SSD", addon: 0 },
      { id: 2, label: "80 GB NVMe SSD", addon: 0.2 },
      { id: 3, label: "160 GB NVMe SSD", addon: 0.4 },
    ];

    const defaultBandwidthOptions = [
      { id: 1, label: "5 TB Bandwidth (included)", addon: 0 },
      { id: 2, label: "10 TB Bandwidth", addon: 100 / 720 },
      { id: 3, label: "20 TB Bandwidth", addon: 200 / 720 },
    ];

    setVcpuOptions(defaultVcpuOptions);
    setRamOptions(defaultRamOptions);
    setDiskOptions(defaultDiskOptions);
    setBandwidthOptions(defaultBandwidthOptions);

    // Set default values
    if (defaultVcpuOptions.length > 0) {
      setVCPU(defaultVcpuOptions[0].label);
    }
    if (defaultRamOptions.length > 0) setRam(defaultRamOptions[0].label);
    if (defaultDiskOptions.length > 0) setDisk(defaultDiskOptions[0].label);
    if (defaultBandwidthOptions.length > 0)
      setBandwidth(defaultBandwidthOptions[0].label);
  };

  // Rest of the component remains exactly the same...
  // Compute pricing dynamically
  const pricing = useMemo(() => {
    const cpuOption = vcpuOptions.find((c) => c.label === vCPU);
    const ramOption = ramOptions.find((r) => r.label === ram);
    const diskOption = diskOptions.find((d) => d.label === disk);
    const bandwidthOption = bandwidthOptions.find((b) => b.label === bandwidth);

    const cpuPrice = cpuOption?.price || 0;
    const ramPrice = ramOption?.price || 0;
    const diskPrice = diskOption?.price || 0;
    const bandwidthPrice = bandwidthOption?.price || 0;

    const hourly = (
      cpuPrice +
      ramPrice +
      diskPrice +
      bandwidthPrice
    ).toFixed(4);

    const monthly = (parseFloat(hourly) * 720).toFixed(2);

    return { hourly, monthly, cpuPrice, ramPrice, diskPrice, bandwidthPrice };
  }, [vCPU,ram,disk,bandwidth,vcpuOptions,ramOptions,diskOptions,bandwidthOptions]
  );

  // Update parent component when resources change
  useEffect(() => {
    if (vcpuOptions.length > 0 && ramOptions.length > 0 && vCPU && ram) {
      const cpuOption = vcpuOptions.find((c) => c.label === vCPU);
      const ramOption = ramOptions.find((r) => r.label === ram);
      const diskOption = diskOptions.find((d) => d.label === disk);
      const bandwidthOption = bandwidthOptions.find(
        (b) => b.label === bandwidth
      );

      setSelectedResources({
        vCPU,
        ram,
        disk,
        bandwidth,
        cpuPriceId: cpuOption?.id || null,
        ramPriceId: ramOption?.id || null,
        diskPriceId: diskOption?.id || null,
        bandwidthPriceId: bandwidthOption?.id || null,
        // Store individual prices
        individualPrices: {
          cpuHourly: pricing.cpuPrice || 0,
          ramHourly: pricing.ramPrice || 0,
          diskHourly: pricing.diskPrice || 0,
          bandwidthHourly: pricing.bandwidthPrice || 0,
        },
        // Keep total pricing
        pricing: {
          hourly: pricing.hourly,
          monthly: pricing.monthly,
        },
      });
    }
  }, [
    vCPU,
    ram,
    disk,
    bandwidth,
    pricing,
    vcpuOptions,
    ramOptions,
    diskOptions,
    bandwidthOptions,
    setSelectedResources,
  ]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex-1 px-8">
        {/* Back link */}
        <div
          className="text-sm text-gray-400 mb-4 cursor-pointer hover:underline"
          onClick={() => {
            const typeSection = document.getElementById("server-type");
            if (typeSection) {
              typeSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }}
        >
          ← Back to type
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">Resources</h1>

        {/* Enhanced Loading Indicator */}
        <div className="space-y-6">
          {/* Server Type Info with Loading */}
          <div className="p-4 bg-[#1a2238] rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
              <div>
                <p className="text-gray-300 text-sm">
                  <span className="font-semibold text-green-400">
                    Configuring:
                  </span>{" "}
                  {selectedType}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Loading resource options...
                </p>
              </div>
            </div>
          </div>

          {/* Loading Skeleton for Resource Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="space-y-3">
                <div className="h-4 bg-gray-700 rounded w-1/3 animate-pulse"></div>
                <div className="h-10 bg-gray-800 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Loading Message */}
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">
              Fetching{" "}
              {selectedType === "Dedicated vCPU" ? "dedicated" : "shared"}{" "}
              resource prices...
            </p>
            <p className="text-gray-500 text-xs mt-1">
              This may take a few seconds
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#0e1525] text-white w-full">
      {/* Left Section */}
      <div className="flex-1 px-4 sm:px-8">
        {/* Back link */}
        <div
          className="text-sm text-gray-400 mb-4 cursor-pointer hover:underline"
          onClick={() => {
            const typeSection = document.getElementById("server-type");
            if (typeSection) {
              typeSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }}
        >
          ← Back to type
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Resources</h1>

        {/* Server Type Info */}
        <div className="mb-6 p-4 bg-[#1a2238] rounded-lg border border-gray-700">
          <p className="text-gray-300 text-sm">
            <span className="font-semibold text-green-400">Configuring:</span>{" "}
            {selectedType}
          </p>
          <p className="text-gray-400 text-xs mt-1">Current vCPU: {vCPU}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
            <p className="text-red-400 text-xs mt-1">Using default pricing</p>
          </div>
        )}

        {/* API Success Indicator */}
        {!loading && !error && vcpuOptions.length > 0 && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-green-400 text-sm">
                APIs connected successfully
              </p>
            </div>
            <p className="text-green-400 text-xs mt-1">
              Loaded: {vcpuOptions.length} vCPU options, {ramOptions.length} RAM
              options,
              {diskOptions.length} Disk options, {bandwidthOptions.length}{" "}
              Bandwidth options
            </p>
          </div>
        )}

        {/* Resource selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-10">
          {/* vCPUs */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">vCPUs</label>
            <select
              value={vCPU}
              onChange={(e) => setVCPU(e.target.value)}
              className="bg-[#111827] border border-gray-700 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {vcpuOptions.map((opt) => (
                <option key={opt.id} value={opt.label}>
                  {opt.label} - ₹{opt.price?.toFixed(4) || "0.0000"}/hr
                </option>
              ))}
            </select>
          </div>

          {/* RAM */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">RAM</label>
            <select
              value={ram}
              onChange={(e) => setRam(e.target.value)}
              className="bg-[#111827] border border-gray-700 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {ramOptions.map((opt) => (
                <option key={opt.id} value={opt.label}>
                  {opt.label} {opt.multiplier && `(${opt.multiplier}x)`}
                </option>
              ))}
            </select>
          </div>

          {/* Disk */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Primary Disk
            </label>
            <select
              value={disk}
              onChange={(e) => setDisk(e.target.value)}
              className="bg-[#111827] border border-gray-700 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {diskOptions.map((opt) => (
                <option key={opt.id} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bandwidth */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Bandwidth
            </label>
            <select
              value={bandwidth}
              onChange={(e) => setBandwidth(e.target.value)}
              className="bg-[#111827] border border-gray-700 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {bandwidthOptions.map((opt) => (
                <option key={opt.id} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-gray-500 text-xs mt-1">
              Additional usage: ₹0.293/GB
            </p>
          </div>
        </div>

        {/* Pricing Summary */}
        {pricing.hourly !== "0.0000" && (
          <div className="mt-8 border-t border-gray-700 pt-6">
            <h2 className="text-lg font-semibold mb-3">Pricing Summary</h2>
            <div className="flex items-center justify-between text-gray-300 mb-1">
              <span className="text-sm">
                {vCPU}, {ram}, {disk}, {bandwidth}
              </span>
              <span className="font-bold text-red-400">
                ₹{pricing.hourly} / hour
              </span>
            </div>
            <div className="text-sm text-gray-400">
              ≈ ₹{pricing.monthly} / month
            </div>
          </div>
        )}

        {/* Mobile-only Verify and Create Button */}
        <div className="lg:hidden mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={() => onVerifyAndCreate && onVerifyAndCreate()}
            disabled={!isServerCreationComplete}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
              isServerCreationComplete
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            <CheckCircle size={20} />
            <span>Verify and Create Server</span>
          </button>
          <p className="text-center text-gray-400 text-sm mt-2">
            Review your server configuration before creating
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResourcesSelector;
