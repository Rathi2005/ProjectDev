import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle } from "lucide-react";
import Swal from "sweetalert2";

const ResourcesSelector = ({
  selectedType,
  setSelectedResources,
  onVerifyAndCreate,
  isServerCreationComplete,
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
      return;
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

        // Show success notification
        Swal.fire({
          icon: 'success',
          title: 'Resources Loaded',
          text: `${vcpuData.length} vCPU options available`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: '#0e1525',
          color: '#ffffff',
          iconColor: '#4f46e5'
        });
      } catch (err) {
        setError("Failed to load resource prices.");
        setDefaultOptions(selectedType);
        
        // Show error notification
        Swal.fire({
          icon: 'error',
          title: 'Using Default Prices',
          text: 'Could not fetch live prices, using default values',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#0e1525',
          color: '#ffffff',
          iconColor: '#f59e0b'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [selectedType]);

  // Fallback default options if API fails
  const setDefaultOptions = (type = "Shared vCPU") => {
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

    if (defaultVcpuOptions.length > 0) {
      setVCPU(defaultVcpuOptions[0].label);
    }
    if (defaultRamOptions.length > 0) setRam(defaultRamOptions[0].label);
    if (defaultDiskOptions.length > 0) setDisk(defaultDiskOptions[0].label);
    if (defaultBandwidthOptions.length > 0)
      setBandwidth(defaultBandwidthOptions[0].label);
  };

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
  }, [vCPU,ram,disk,bandwidth,vcpuOptions,ramOptions,diskOptions,bandwidthOptions]);

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
        individualPrices: {
          cpuHourly: pricing.cpuPrice || 0,
          ramHourly: pricing.ramPrice || 0,
          diskHourly: pricing.diskPrice || 0,
          bandwidthHourly: pricing.bandwidthPrice || 0,
        },
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
      <div className="flex-1 px-4 sm:px-8">
        {/* Back link with icon */}
        <div
          className="flex items-center text-sm text-gray-400 mb-4 cursor-pointer hover:text-gray-300 transition-colors group"
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
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Back to type
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Resources</h1>

        {/* Enhanced Loading Indicator */}
        <div className="space-y-6">
          {/* Server Type Info with Loading */}
          <div className="p-4 bg-[#1a2238] rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
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
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mx-auto mb-3"></div>
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

  // Handle verify and create with confirmation
  const handleVerifyAndCreate = () => {
    if (!isServerCreationComplete) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Configuration',
        text: 'Please complete all server creation steps first',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#0e1525',
        color: '#ffffff',
        iconColor: '#f59e0b'
      });
      return;
    }

    if (onVerifyAndCreate) {
      onVerifyAndCreate();
    }
  };

  return (
    <div className="flex bg-[#0e1525] text-white w-full">
      {/* Left Section - Not 100vh */}
      <div className="flex-1 px-4 sm:px-8">
        {/* Back link with icon */}
        <div
          className="flex items-center text-sm text-gray-400 mb-4 cursor-pointer hover:text-gray-300 transition-colors group"
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
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Back to type
        </div>

        {/* Title with info button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Resources</h1>
        </div>

        {/* Server Type Info */}
        <div className="mb-6 p-4 bg-[#1a2238] rounded-lg border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-green-400" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-300">
                <span className="font-semibold text-green-400">Configuring:</span>{" "}
                {selectedType}
              </p>
              <p className="text-gray-400 text-xs mt-1">Adjust resources based on your needs</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-900/30 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 text-yellow-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.226 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <div>
                <p className="text-yellow-400">{error}</p>
                <p className="text-yellow-400 text-xs mt-1">Using default pricing</p>
              </div>
            </div>
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
              className="bg-[#111827] border border-gray-700 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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
              className="bg-[#111827] border border-gray-700 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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
              className="bg-[#111827] border border-gray-700 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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
              className="bg-[#111827] border border-gray-700 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            >
              {bandwidthOptions.map((opt) => (
                <option key={opt.id} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-gray-500 text-xs mt-2">
              Additional usage: ₹0.293/GB
            </p>
          </div>
        </div>

        {/* Pricing Summary */}
        {pricing.hourly !== "0.0000" && (
          <div className="mt-8 border-t border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Pricing Summary</h2>
              <div className="text-sm text-gray-400">
                {selectedType}
              </div>
            </div>
            <div className="flex items-center justify-between text-gray-300 mb-1">
              <span className="text-sm">
                {vCPU}, {ram}, {disk}, {bandwidth}
              </span>
              <span className="font-bold text-indigo-400">
                ₹{pricing.hourly} / hour
              </span>
            </div>
            <div className="text-sm text-gray-400">
              ≈ ₹{pricing.monthly} / month (720 hours)
            </div>
          </div>
        )}

        {/* Mobile-only Verify and Create Button */}
        <div className="lg:hidden mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={handleVerifyAndCreate}
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