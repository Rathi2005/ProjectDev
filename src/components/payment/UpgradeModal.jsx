import React, { memo, useState, useCallback } from "react";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Calendar,
  Zap,
  X,
  IndianRupee,
  Shield,
} from "lucide-react";

const UpgradeModal = memo(function UpgradeModal({
  open,
  onClose,
  pricingOptions,
  selectedCpu,
  setSelectedCpu,
  selectedRam,
  setSelectedRam,
  selectedDisk,
  setSelectedDisk,
  selectedBandwidth,
  setSelectedBandwidth,
  addMonths,
  setAddMonths,
  onContinue,
  priceLoading,
}) {
  if (!open) return null;

  // Memoize handlers to prevent recreation on each render
  const handleCpuChange = useCallback((e) => {
    setSelectedCpu(Number(e.target.value));
  }, [setSelectedCpu]);

  const handleRamChange = useCallback((e) => {
    setSelectedRam(Number(e.target.value));
  }, [setSelectedRam]);

  const handleDiskChange = useCallback((e) => {
    setSelectedDisk(Number(e.target.value));
  }, [setSelectedDisk]);

  const handleBandwidthChange = useCallback((e) => {
    setSelectedBandwidth(Number(e.target.value));
  }, [setSelectedBandwidth]);

  const handleMonthsChange = useCallback((e) => {
    setAddMonths(Number(e.target.value));
  }, [setAddMonths]);

  // Memoize quick duration buttons to prevent re-renders
  const renderQuickDurationButtons = useCallback(() => {
    const durations = [0, 1, 3, 6, 12];
    return durations.map((months) => (
      <button
        key={months}
        type="button"
        onClick={() => setAddMonths(months)}
        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
          addMonths === months
            ? "border-indigo-500 bg-indigo-900/30 text-white"
            : "border-indigo-900/40 text-gray-400 hover:bg-indigo-900/20"
        }`}
      >
        {`${months} mo`}
      </button>
    ));
  }, [addMonths, setAddMonths]);

  // Memoize resource options to prevent unnecessary re-renders of select elements
  const renderResourceOptions = useCallback(() => {
    if (!pricingOptions) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* CPU */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Cpu className="w-4 h-4" />
            CPU Cores
          </label>
          <select
            className="w-full bg-[#151c2f] border border-indigo-900/50 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
            value={selectedCpu}
            onChange={handleCpuChange}
          >
            {pricingOptions.cpuOptions.map((c) => (
              <option
                key={c.tier.id}
                value={c.tier.id}
                className="bg-[#151c2f] text-white"
              >
                {c.tier.label}
              </option>
            ))}
          </select>
        </div>

        {/* RAM */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <MemoryStick className="w-4 h-4" />
            RAM
          </label>
          <select
            className="w-full bg-[#151c2f] border border-indigo-900/50 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
            value={selectedRam}
            onChange={handleRamChange}
          >
            {pricingOptions.ramOptions.map((r) => (
              <option
                key={r.tier.id}
                value={r.tier.id}
                className="bg-[#151c2f] text-white"
              >
                {r.tier.label}
              </option>
            ))}
          </select>
        </div>

        {/* Disk */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <HardDrive className="w-4 h-4" />
            Storage
          </label>
          <select
            className="w-full bg-[#151c2f] border border-indigo-900/50 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
            value={selectedDisk}
            onChange={handleDiskChange}
          >
            {pricingOptions.diskOptions.map((d) => (
              <option
                key={d.tier.id}
                value={d.tier.id}
                className="bg-[#151c2f] text-white"
              >
                {d.tier.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bandwidth */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Wifi className="w-4 h-4" />
            Bandwidth
          </label>
          <select
            className="w-full bg-[#151c2f] border border-indigo-900/50 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
            value={selectedBandwidth}
            onChange={handleBandwidthChange}
          >
            {pricingOptions.bandwidthOptions.map((b) => (
              <option
                key={b.tier.id}
                value={b.tier.id}
                className="bg-[#151c2f] text-white"
              >
                {b.tier.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }, [
    pricingOptions,
    selectedCpu,
    selectedRam,
    selectedDisk,
    selectedBandwidth,
    handleCpuChange,
    handleRamChange,
    handleDiskChange,
    handleBandwidthChange
  ]);

  // Memoize duration indicator to prevent re-renders
  const renderDurationIndicator = useCallback(() => {
    return (
      <div
        className={`p-3 rounded-lg border text-sm min-w-[200px] ${
          addMonths === 0
            ? "border-indigo-900/40 bg-indigo-900/10 text-indigo-300"
            : "border-green-900/40 bg-green-900/10 text-green-300"
        }`}
      >
        {addMonths === 0 ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <span>
              <span className="font-semibold">Upgrade Only</span> - No
              plan extension
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>
              <span className="font-semibold">
                {addMonths} month
                {addMonths !== 1 ? "s" : ""} extension
              </span>
            </span>
          </div>
        )}
      </div>
    );
  }, [addMonths]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-[#0e1525] to-[#151c2f] w-full max-w-2xl rounded-xl border border-indigo-900/50 shadow-2xl shadow-indigo-900/20 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-indigo-900/40 flex-shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-900/30 rounded-lg">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Upgrade / Extend Plan
              </h2>
              <p className="text-sm text-gray-400">
                Customize your server resources
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content - Compact layout */}
        <div className="p-6">
          {/* Resource Selection Grid - 2 columns */}
          {renderResourceOptions()}

          {/* Duration Input - Compact */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Plan Duration</span>
              </div>
            </label>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={addMonths}
                    onChange={handleMonthsChange}
                    className="w-full bg-[#151c2f] border border-indigo-900/50 rounded-lg p-3 pl-10 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                    placeholder="Months"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>

                {/* Quick duration buttons */}
                <div className="flex gap-2 mt-2">
                  {renderQuickDurationButtons()}
                </div>
              </div>

              {/* Duration status indicator */}
              {renderDurationIndicator()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-600 hover:bg-gray-800/30 text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={onContinue}
              disabled={priceLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600
             hover:from-indigo-700 hover:to-purple-700
             disabled:opacity-50 disabled:cursor-not-allowed
             text-white rounded-lg font-semibold transition-all
             flex items-center justify-center gap-2"
            >
              {priceLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Calculating price…
                </>
              ) : (
                <>
                  <IndianRupee className="w-4 h-4" />
                  Continue to Payment
                </>
              )}
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-4 pt-4 border-t border-indigo-900/30">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <p className="text-xs text-gray-400">
                <span className="text-green-400 font-medium">
                  Secure payment
                </span>{" "}
                powered by Cashfree
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default UpgradeModal;