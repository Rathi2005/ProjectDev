import React, { useState } from "react";

const TypeSelector = ({ setSelectedType, selectedOS }) => {
  const [selectedType, setSelectedTypeState] = useState(null);

  const types = [
    {
      name: "Shared vCPU",
      description:
        "Best price/performance ratio. Applications must be able to handle varying levels of CPU assignment. Not suitable for sustained high CPU usage.",
      tags: [
        "Medium traffic websites & applications",
        "Low to medium CPU usage",
      ],
    },
    {
      name: "Dedicated vCPU",
      description:
        "Best choice for critical production as well as high CPU usage applications. Delivers predictable performance and response times.",
      tags: ["High traffic applications", "Sustained high CPU usage"],
    },
  ];

  // Handle type selection and auto-scroll to next section
  const handleTypeSelect = (typeName) => {
    // Prevent selection if no OS is selected
    if (!selectedOS) return;

    setSelectedTypeState(typeName);

    // Update parent component immediately
    setSelectedType(typeName);

    // 🧭 Smooth scroll to Resources section
    setTimeout(() => {
      const resourcesSection = document.getElementById("server-resources");
      if (resourcesSection) {
        resourcesSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div className="flex bg-[#0e1525] text-white w-full">
      {/* Left Section */}
      <div className="flex-1 px-8">
        {/* Back link */}
        <div
          className="text-sm text-gray-400 mb-4 cursor-pointer hover:underline"
          onClick={() => {
            const imageSection = document.getElementById("server-image");
            if (imageSection) {
              imageSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }}
        >
          ← Back to image
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">Choose Type</h1>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-6 max-w-3xl leading-relaxed">
          Select the CPU type for your server. Choose shared vCPUs for lighter
          workloads or dedicated vCPUs for consistent, high-performance
          requirements.
        </p>

        {/* Warning message if no OS selected */}
        {!selectedOS && (
          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
            <p className="text-yellow-400 text-sm font-medium">
              ⚠️ Please select a server image first before choosing a type.
            </p>
          </div>
        )}

        {/* Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {types.map((type) => (
            <div
              key={type.name}
              className={`p-6 rounded-xl border transition-all duration-200 ${
                !selectedOS
                  ? "cursor-not-allowed opacity-50 border-gray-800 bg-[#0d1421]"
                  : selectedType === type.name
                  ? "cursor-pointer border-red-500 bg-[#1a2238] shadow-lg"
                  : "cursor-pointer border-gray-700 hover:border-gray-600 bg-[#111827] hover:shadow-md"
              }`}
              onClick={() => handleTypeSelect(type.name)}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{type.name}</h2>
                {selectedType === type.name && (
                  <div className="text-green-400 text-sm font-medium">
                    ✓ Selected
                  </div>
                )}
              </div>

              <p className="text-gray-400 text-sm mb-4 leading-snug">
                {type.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {type.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Next Step Suggestion */}
        {selectedType && (
          <div className="mt-8 p-4 bg-[#1a2238] rounded-lg border border-gray-700">
            <p className="text-gray-300 text-sm">
              <span className="font-semibold text-green-400">
                ✓ Type Selected:
              </span>{" "}
              {selectedType}
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Continue to the next step to choose your server resources.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypeSelector;
