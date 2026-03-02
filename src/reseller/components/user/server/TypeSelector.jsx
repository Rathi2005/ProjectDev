import React, { useState } from "react";
import Swal from "sweetalert2";

const TypeSelector = ({ setSelectedType, selectedOS }) => {
  const [selectedType, setSelectedTypeState] = useState(null);

  const types = [
    {
      label: "High performance VPS",
      value: "Shared CPU",
      description:
        "Best price/performance ratio. Applications must be able to handle varying levels of CPU assignment. Not suitable for sustained high CPU usage.",
      tags: [
        "Medium traffic websites & applications",
        "Low to medium CPU usage",
      ],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Virtual Dedicated",
      value: "Dedicated CPU",
      description:
        "Best choice for critical production as well as high CPU usage applications. Delivers predictable performance and response times.",
      tags: ["High traffic applications", "Sustained high CPU usage"],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
  ];

  // Handle type selection and auto-scroll to next section
  const handleTypeSelect = (typeName) => {
    // Prevent selection if no OS is selected
    if (!selectedOS) {
      Swal.fire({
        icon: "warning",
        title: "Select OS First",
        text: "Please select an operating system before choosing a server type",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        background: "#0e1525",
        color: "#ffffff",
        iconColor: "#f59e0b",
      });
      return;
    }

    // 🔥 TOGGLE LOGIC
    if (selectedType === typeName) {
      setSelectedTypeState(null);
      setSelectedType(null);

      Swal.fire({
        icon: "info",
        title: "Type Deselected",
        text: `${typeName} removed`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        background: "#0e1525",
        color: "#ffffff",
        iconColor: "#f59e0b",
      });

      return;
    }

    // Normal selection
    setSelectedTypeState(typeName);
    setSelectedType(typeName);

    Swal.fire({
      icon: "success",
      title: "Type Selected",
      text: `You've selected ${typeName}`,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      background: "#0e1525",
      color: "#ffffff",
      iconColor: "#10b981",
    });

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
        {/* Back link with icon */}
        <div
          className="flex items-center text-sm text-gray-400 mb-4 cursor-pointer hover:text-gray-300 transition-colors group"
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
          Back to image
        </div>

        {/* Title with info button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Choose Type
          </h1>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-6 max-w-3xl leading-relaxed">
          Select the CPU type for your server. Choose shared CPUs for lighter
          workloads or dedicated CPUs for consistent, high-performance
          requirements.
        </p>

        {/* Warning message if no OS selected */}
        {!selectedOS && (
          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
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
                <p className="text-yellow-400 font-medium">
                  Please select a server image first before choosing a type.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {types.map((type) => (
            <div
              key={type.value}
              className={`p-6 rounded-xl border transition-all duration-200 ${
                !selectedOS
                  ? "cursor-not-allowed opacity-50 border-gray-800 bg-[#0d1421]"
                  : selectedType === type.value
                    ? "cursor-pointer border-indigo-500 bg-[#1a2238] shadow-lg"
                    : "cursor-pointer border-gray-700 hover:border-gray-600 bg-[#111827] hover:shadow-md"
              }`}
              onClick={() => handleTypeSelect(type.value)}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedType === type.value
                        ? "bg-indigo-900/30"
                        : "bg-gray-800"
                    }`}
                  >
                    {type.icon}
                  </div>
                  <h2 className="text-lg font-semibold">{type.label}</h2>
                </div>
                {selectedType === type.value && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
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
                    className={`text-xs px-3 py-1 rounded-md ${
                      selectedType === type.value
                        ? "bg-indigo-900/50 text-indigo-200"
                        : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypeSelector;
