import React, { useEffect, useState } from "react";

const ImageSelector = ({ serverId, setSelectedOS }) => {
  const [selectedOS, setSelectedOSState] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setSelectedError] = useState("");
  const [osOptions, setOsOptions] = useState([]);
  
  const IMAGES = import.meta.env.VITE_FETCH_IMAGES;

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
      } catch (err) {
        console.error("Error fetching ISOs:", err);
        setSelectedError("Failed to load images.");
        setOsOptions([]);
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

    // 🧭 Smooth scroll to Server Type section
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
        className="text-sm text-gray-400 mb-4 cursor-pointer hover:underline"
        onClick={() => {
          const locationSection = document.getElementById("create-server");
          if (locationSection) {
            locationSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
      >
        ← Back to location
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">Choose Image</h1>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-6 max-w-3xl leading-relaxed">
        Select an operating system for your server. You can choose from the
        latest stable versions of Ubuntu, Fedora, Debian, CentOS, Rocky Linux,
        and more. Each image is ready to use immediately after deployment.
      </p>

      {/* OS Selection Grid */}
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">✅ Operating System</h2>

          {!serverId ? (
            <p className="text-gray-500 italic">
              Select a server location to view available images.
            </p>
          ) : loading ? (
            <p className="text-gray-400 text-sm animate-pulse">
              Fetching images for this server...
            </p>
          ) : error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : osOptions.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No images found for this server.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {osOptions.map((os) => (
                <div
                  key={`${os.name}-${os.version}`}
                  className={`p-6 rounded-xl border transition-all cursor-pointer duration-200
                    ${
                      selectedOS === os.name
                        ? "border-red-500 bg-[#1a2238] shadow-lg"
                        : "border-gray-700 hover:border-gray-600 bg-[#111827] hover:shadow-md"
                    }`}
                  onClick={() => handleOSSelect(os.name, os.version, os.id)}
                >
                  <div className="text-lg font-semibold mb-2">{os.name}</div>
                  <div className="text-gray-400 text-sm">
                    Version: {os.version}
                  </div>
                  {selectedOS === os.name && (
                    <div className="mt-3 text-green-400 text-sm font-medium">
                      ✓ Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Step Suggestion */}
        {selectedOS && (
          <div className="mt-8 p-4 bg-[#1a2238] rounded-lg border border-gray-700">
            <p className="text-gray-300 text-sm">
              <span className="font-semibold text-green-400">✓ OS Selected:</span> {selectedOS} {selectedVersion}
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Continue to the next step to choose your server type.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSelector;