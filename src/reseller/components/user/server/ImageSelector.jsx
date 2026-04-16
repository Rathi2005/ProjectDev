import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const ImageSelector = ({ zoneId, setSelectedOS }) => {
  const [selectedOS, setSelectedOSState] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setSelectedError] = useState("");
  const [osOptions, setOsOptions] = useState([]);
  const [expandedOS, setExpandedOS] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const IMAGES = `${BASE_URL}/api/users/zones`;

  const OS_IMAGES = {
    WINDOWS: "/Images/os/windows.svg",
    "WINDOWS-2025": "/Images/os/windows.svg",
    UBUNTU: "/Images/os/Ubuntu.svg",
    DEBIAN: "/Images/os/Debian.svg",
    CENTOS: "/Images/os/CentOS.svg",
  };

  const DEFAULT_OS_IMAGE = "/Images/os/windows.svg";

  useEffect(() => {
    if (!zoneId) return;
    if (osOptions.length > 0) return;

    const fetchISOs = async () => {
      setLoading(true);
      setSelectedError("");

      try {
        let token = localStorage.getItem("token");
        try {
          token = JSON.parse(token);
        } catch {}

        const res = await fetch(`${IMAGES}/${zoneId}/isos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Selected zone is inactive or invalid.");
          }
          throw new Error("Failed to fetch images.");
        }

        const data = await res.json();
        const grouped = data.reduce((acc, iso) => {
          // Normalize OS Type
          let normalizedType = iso.osType;

          // Merge Windows variants
          if (iso.osType.startsWith("WINDOWS")) {
            normalizedType = "WINDOWS";
          }

          if (!acc[normalizedType]) {
            acc[normalizedType] = [];
          }

          acc[normalizedType].push({
            id: iso.id,
            version: iso.name,
          });

          return acc;
        }, {});

        setOsOptions(grouped);

        Swal.fire({
          icon: "success",
          title: "Images Loaded",
          text: `Found ${data.length} available images across ${Object.keys(grouped).length} OS types`,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#0e1525",
          color: "#ffffff",
          iconColor: "#4f46e5",
        });
      } catch (err) {
        setSelectedError(err.message);
        setOsOptions([]);

        Swal.fire({
          icon: "error",
          title: "Failed to Load Images",
          text: "Please try again or check your connection",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: "#0e1525",
          color: "#ffffff",
          iconColor: "#ef4444",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchISOs();
  }, [zoneId]);

  // Handle OS selection
  const handleOSSelect = (osName, osVersion, osId) => {
    // If already selected → deselect
    if (selectedOS === osName && selectedVersion === osVersion) {
      setSelectedOSState("");
      setSelectedVersion("");
      setExpandedOS(null);

      setSelectedOS(null);

      Swal.fire({
        icon: "info",
        title: "OS Deselected",
        text: `${osName} ${osVersion} removed`,
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

    // Otherwise select normally
    setSelectedOSState(osName);
    setSelectedVersion(osVersion);
    setExpandedOS(null);

    setSelectedOS({
      name: osName,
      version: osVersion,
      id: osId,
    });

    Swal.fire({
      icon: "success",
      title: "OS Selected",
      text: `${osName} ${osVersion}`,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      background: "#0e1525",
      color: "#ffffff",
      iconColor: "#10b981",
    });

    setTimeout(() => {
      const typeSection = document.getElementById("server-type");
      if (typeSection) {
        typeSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div className="flex-1 px-8">
      {/* Back link */}
      <div
        className="flex items-center text-sm text-gray-400 mb-4 cursor-pointer hover:text-gray-300 transition-colors group w-fit"
        onClick={() => {
          const locationSection = document.getElementById("create-server");
          if (locationSection) {
            locationSection.scrollIntoView({
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
        Back to location
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Choose Operating System
        </h1>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-8 max-w-3xl leading-relaxed">
        Select an operating system for your server. Each image is optimized,
        secure, and ready to use immediately after deployment.
      </p>

      {/* OS Selection Grid */}
      <div className="space-y-8">
        <div>
          {!zoneId ? (
            <div className="p-8 bg-gradient-to-br from-[#1a1f2e] to-[#0f1422] rounded-xl border border-indigo-500/20 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-yellow-400"
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
                  <p className="text-gray-300 text-lg">Select a zone first</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Choose a location to view available operating systems
                  </p>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="p-8 bg-gradient-to-br from-[#1a1f2e] to-[#0f1422] rounded-xl border border-indigo-500/20 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <svg
                    className="animate-spin h-6 w-6 text-indigo-400"
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
                </div>
                <div>
                  <p className="text-gray-300 text-lg">Loading images...</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Fetching available operating systems for this zone
                  </p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 bg-gradient-to-br from-red-950/30 to-red-900/20 rounded-xl border border-red-500/30 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-red-400 text-lg font-medium">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm text-gray-400 hover:text-white underline underline-offset-4 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : Object.keys(osOptions).length === 0 ? (
            <div className="p-8 bg-gradient-to-br from-[#1a1f2e] to-[#0f1422] rounded-xl border border-gray-700/50 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-700/50 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-300 text-lg">No images found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    This zone doesn't have any available operating systems
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.keys(osOptions).map((osType) => {
                // Generate a consistent gradient based on OS name
                const gradients = [
                  "from-indigo-500/20 to-purple-500/20",
                  "from-blue-500/20 to-cyan-500/20",
                  "from-emerald-500/20 to-teal-500/20",
                  "from-orange-500/20 to-red-500/20",
                  "from-pink-500/20 to-rose-500/20",
                  "from-violet-500/20 to-fuchsia-500/20",
                ];
                const gradientIndex =
                  osType
                    .split("")
                    .reduce((acc, char) => acc + char.charCodeAt(0), 0) %
                  gradients.length;
                const gradient = gradients[gradientIndex];

                return (
                  <div
                    key={osType}
                    className="group relative bg-gradient-to-br from-[#1a1f2e] to-[#0f1422] rounded-xl border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10"
                  >
                    {/* OS Card Header */}
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() =>
                        setExpandedOS(expandedOS === osType ? null : osType)
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg  flex items-center justify-center`}
                          >
                            <img
                              src={OS_IMAGES[osType] || DEFAULT_OS_IMAGE}
                              alt={osType}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {osType}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {osOptions[osType].length}{" "}
                              {osOptions[osType].length === 1
                                ? "version"
                                : "versions"}{" "}
                              available
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedOS === osType && (
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          )}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                              expandedOS === osType ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Selected version indicator */}
                      {selectedOS === osType && selectedVersion && (
                        <div className="mt-3 flex items-center gap-2 text-xs">
                          <span className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 border border-green-500/30">
                            Selected: {selectedVersion}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dropdown - Proper dropdown design */}
                    {expandedOS === osType && (
                      <div className="absolute z-10 left-0 right-0 mt-1 mx-5 bg-[#1e2436] rounded-lg border border-gray-700 shadow-2xl overflow-hidden animate-fadeIn">
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                          {osOptions[osType].map((version, index) => (
                            <button
                              key={version.id}
                              onClick={() =>
                                handleOSSelect(
                                  osType,
                                  version.version,
                                  version.id,
                                )
                              }
                              className={`w-full text-left px-4 py-3 transition-all duration-200 flex items-center justify-between group/item
                                ${index !== 0 ? "border-t border-gray-700/50" : ""}
                                ${
                                  selectedVersion === version.version &&
                                  selectedOS === osType
                                    ? "bg-indigo-500/20 text-indigo-400"
                                    : "text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-400"
                                }`}
                            >
                              <span className="text-sm font-medium">
                                {version.version}
                              </span>
                              {selectedVersion === version.version &&
                                selectedOS === osType && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-indigo-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1f2e;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ImageSelector;
