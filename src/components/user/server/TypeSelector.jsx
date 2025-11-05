import React, { useState } from "react";
import SummarySidebar from "./SummarySidebar";

const TypeSelector = () => {
  const [selectedType, setSelectedType] = useState("Shared vCPU");
  const [selectedArch, setSelectedArch] = useState("x86 (Intel/AMD)");

  const types = [
    {
      name: "Shared vCPU",
      description:
        "Best price/performance ratio. Applications must be able to handle varying levels of CPU assignment. Not suitable for sustained high CPU usage.",
      tags: [
        "Medium traffic websites & applications",
        "Low to medium CPU usage",
      ],
      architectures: ["x86 (Intel/AMD)", "Arm64 (Ampere)"],
    },
    {
      name: "Dedicated vCPU",
      description:
        "Best choice for critical production as well as high CPU usage applications. Delivers predictable performance and response times.",
      tags: ["High traffic applications", "Sustained high CPU usage"],
      architectures: ["x86 (AMD)"],
    },
  ];

  return (
    <div className="flex bg-[#0e1525] text-white w-full -mt-2">
      {/* Left Section */}
      <div className="flex-1 p-8">
        {/* Back link */}
        <div className="text-sm text-gray-400 mb-4 cursor-pointer hover:underline">
          ← Back to servers
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-10">Choose Type</h1>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-8 max-w-3xl leading-relaxed">
          Select the CPU type and architecture for your server. Choose shared
          vCPUs for lighter workloads or dedicated vCPUs for consistent,
          high-performance requirements.
        </p>

        {/* Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {types.map((type) => (
            <div
              key={type.name}
              className={`p-5 rounded-xl border transition-all cursor-pointer duration-200 ${
                selectedType === type.name
                  ? "border-red-500 bg-[#1a2238]"
                  : "border-gray-700 hover:border-gray-600 bg-[#111827]"
              }`}
              onClick={() => {
                setSelectedType(type.name);
                setSelectedArch(type.architectures[0]);
              }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{type.name}</h2>
                <div className="text-gray-400 text-xs">
                  {selectedType === type.name && "✓"}
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4 leading-snug">
                {type.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {type.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Architecture Selection */}
              <div className="border-t border-gray-700 pt-4">
                <p className="text-xs text-gray-400 mb-2">ARCHITECTURE</p>
                <div className="flex gap-4">
                  {type.architectures.map((arch) => (
                    <label
                      key={arch}
                      className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={type.name}
                        value={arch}
                        checked={
                          selectedType === type.name &&
                          selectedArch === arch
                        }
                        onChange={() => setSelectedArch(arch)}
                        className="accent-red-500"
                      />
                      {arch}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Summary Sidebar */}
      <SummarySidebar />
    </div>
  );
};

export default TypeSelector;
