import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const ImageSelector = ({ serverId, setSelectedOS }) => {
  const [selectedOS, setSelectedOSState] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setSelectedError] = useState("");
  const [osOptions, setOsOptions] = useState([]);
  
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const IMAGES = `${BASE_URL}/api/options/servers`;

  useEffect(() => {
    if (!serverId) return;
    if (osOptions.length > 0) return;

    const fetchISOs = async () => {
      setLoading(true);
      setSelectedError("");

      try {
        let token = localStorage.getItem("token");
        try {
          token = JSON.parse(token);
        } catch {}

        const res = await fetch(`${IMAGES}/${serverId}/isos/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch ISOs");

        const data = await res.json();
        const formatted = data.map((iso) => ({
          name: iso.iso,
          version: iso.version || "Latest",
          id: iso.id, // Add ID from API response
        }));

        setOsOptions(formatted);
        
        // Show success notification
        Swal.fire({
          icon: 'success',
          title: 'Images Loaded',
          text: `Found ${formatted.length} available operating systems`,
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
        setSelectedError("Failed to load images.");
        setOsOptions([]);
        
        // Show error notification
        Swal.fire({
          icon: 'error',
          title: 'Failed to Load Images',
          text: 'Please try again or check your connection',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#0e1525',
          color: '#ffffff',
          iconColor: '#ef4444'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchISOs();
  }, [serverId]);

  // Handle OS selection and auto-scroll to next section
  const handleOSSelect = (osName, osVersion, osId) => {
    setSelectedOSState(osName);
    setSelectedVersion(osVersion);
    
    // Update parent component immediately with proper structure
    setSelectedOS({
      name: osName,
      version: osVersion,
      id: osId, // Add ISO ID
    });

    // Show selection notification
    Swal.fire({
      icon: 'success',
      title: 'OS Selected',
      text: `${osName} ${osVersion}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: '#0e1525',
      color: '#ffffff',
      iconColor: '#10b981'
    });

    // Smooth scroll to Server Type section
    setTimeout(() => {
      const typeSection = document.getElementById("server-type");
      if (typeSection) {
        typeSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div className="flex-1 px-8">
      {/* Back link with icon */}
      <div 
        className="flex items-center text-sm text-gray-400 mb-4 cursor-pointer hover:text-gray-300 transition-colors group"
        onClick={() => {
          const locationSection = document.getElementById("create-server");
          if (locationSection) {
            locationSection.scrollIntoView({ behavior: "smooth", block: "start" });
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

      {/* Title with info button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Choose Image</h1>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-6 max-w-3xl leading-relaxed">
        Select an operating system for your server. You can choose from the
        latest stable versions of Ubuntu, Fedora, Debian, CentOS, Rocky Linux,
        and more. Each image is ready to use immediately after deployment.
      </p>

      {/* OS Selection Grid */}
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
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
            <h2 className="text-xl font-semibold">Operating System</h2>
          </div>

          {!serverId ? (
            <div className="p-6 bg-[#1a2238] rounded-lg border border-gray-700">
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
                  <p className="text-gray-300">
                    Select a server location to view available images.
                  </p>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center gap-3 p-6 bg-[#1a2238] rounded-lg border border-gray-700">
              <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                <svg 
                  className="animate-spin h-4 w-4 text-blue-400" 
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
              <p className="text-gray-300">Fetching images for this server...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-900/10 border border-red-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-red-400" 
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
                  <p className="text-red-400 font-medium">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm text-gray-300 hover:text-white underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : osOptions.length === 0 ? (
            <div className="p-6 bg-[#1a2238] rounded-lg border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-gray-400" 
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
                <p className="text-gray-300">No images found for this server.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {osOptions.map((os) => (
                <div
                  key={`${os.name}-${os.version}`}
                  className={`p-6 rounded-xl border transition-all cursor-pointer duration-200
                    ${
                      selectedOS === os.name
                        ? "border-indigo-500 bg-[#1a2238] shadow-lg"
                        : "border-gray-700 hover:border-gray-600 bg-[#111827] hover:shadow-md"
                    }`}
                  onClick={() => handleOSSelect(os.name, os.version, os.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-semibold">{os.name}</div>
                    {selectedOS === os.name && (
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
                  <div className="text-gray-400 text-sm">
                    Version: {os.version}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSelector;