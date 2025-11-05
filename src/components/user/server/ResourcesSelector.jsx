import React, { useState, useMemo } from "react";
import SummarySidebar from "./SummarySidebar";

const ResourcesSelector = () => {
  const [vCPU, setVCPU] = useState("1 Core");
  const [ram, setRam] = useState("2 GB");
  const [disk, setDisk] = useState("40 GB NVMe SSD");
  const [bandwidth, setBandwidth] = useState("5 TB (included)");

  // vCPU options and their base hourly prices
  const vcpuOptions = [
    { label: "1 Core", price: 0.3440 },
    { label: "2 Cores", price: 0.6880 },
    { label: "4 Cores", price: 1.3760 },
    { label: "6 Cores", price: 2.0640 },
    { label: "8 Cores", price: 2.7520 },
    { label: "10 Cores", price: 3.4400 },
    { label: "12 Cores", price: 4.1280 },
  ];

  // RAM options and multipliers
  const ramOptions = [
    { label: "2 GB", multiplier: 1 },
    { label: "4 GB", multiplier: 1.2 },
    { label: "8 GB", multiplier: 1.4 },
    { label: "16 GB", multiplier: 1.8 },
  ];

  // Disk options and price add-ons
  const diskOptions = [
    { label: "40 GB NVMe SSD", addon: 0 },
    { label: "80 GB NVMe SSD", addon: 0.2 },
    { label: "160 GB NVMe SSD", addon: 0.4 },
  ];

  // Bandwidth options and price add-ons
  const bandwidthOptions = [
    { label: "5 TB (included)", addon: 0 },
    { label: "10 TB (+₹100/month)", addon: 100 / 720 },
    { label: "20 TB (+₹200/month)", addon: 200 / 720 },
  ];

  // Compute pricing dynamically
  const pricing = useMemo(() => {
    const cpuPrice = vcpuOptions.find((c) => c.label === vCPU)?.price || 0;
    const ramMultiplier = ramOptions.find((r) => r.label === ram)?.multiplier || 1;
    const diskAddon = diskOptions.find((d) => d.label === disk)?.addon || 0;
    const bandwidthAddon = bandwidthOptions.find((b) => b.label === bandwidth)?.addon || 0;

    const hourly = (cpuPrice * ramMultiplier + diskAddon + bandwidthAddon).toFixed(4);
    const monthly = (hourly * 720).toFixed(2);

    return { hourly, monthly };
  }, [vCPU, ram, disk, bandwidth]);

  return (
    <div className="flex bg-[#0e1525] text-white w-full -mt-2">
      {/* Left Section */}
      <div className="flex-1 p-8">
        {/* Back link */}
        <div className="text-sm text-gray-400 mb-4 cursor-pointer hover:underline">
          ← Back to servers
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-10">Resources</h1>

        {/* Resource selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          {/* vCPUs */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">vCPUs</label>
            <select
              value={vCPU}
              onChange={(e) => setVCPU(e.target.value)}
              className="bg-[#111827] border border-gray-700 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {vcpuOptions.map((opt) => (
                <option key={opt.label} value={opt.label}>
                  {opt.label} - ₹{opt.price.toFixed(4)}/hr
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
              className="bg-[#111827] border border-gray-700 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {ramOptions.map((opt) => (
                <option key={opt.label} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Disk */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Primary Disk</label>
            <select
              value={disk}
              onChange={(e) => setDisk(e.target.value)}
              className="bg-[#111827] border border-gray-700 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {diskOptions.map((opt) => (
                <option key={opt.label} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bandwidth */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Bandwidth</label>
            <select
              value={bandwidth}
              onChange={(e) => setBandwidth(e.target.value)}
              className="bg-[#111827] border border-gray-700 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {bandwidthOptions.map((opt) => (
                <option key={opt.label} value={opt.label}>
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
        <div className="mt-10 border-t border-gray-700 pt-6">
          <h2 className="text-lg font-semibold mb-3">Pricing Summary</h2>
          <div className="flex items-center justify-between text-gray-300 mb-1">
            <span>
              {vCPU}, {ram}, {disk}
            </span>
            <span className="font-bold text-indigo-400">
              ₹{pricing.hourly} / hour
            </span>
          </div>
          <div className="text-sm text-gray-400">
            ≈ ₹{pricing.monthly} / month
          </div>
        </div>
      </div>

      {/* Right: Summary Sidebar */}
      <SummarySidebar />
    </div>
  );
};

export default ResourcesSelector;
