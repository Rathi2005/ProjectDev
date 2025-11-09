import React, { useState } from "react";
import LocationSelector from "./LocationSelector";

const CreateServerPage = ({ selectedLocation, setSelectedLocation, setServerId, serverId }) => {
  // Scrolls only when selecting a location
  const handleLocationSelect = (locationName, serverIdValue) => {
    setSelectedLocation(locationName);
    setServerId(serverIdValue);

    // 🧭 Smooth scroll to Image section
    const imageSection = document.getElementById("server-image");
    if (imageSection) {
      // Small delay to ensure state updates before scrolling
      setTimeout(() => {
        imageSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  return (
    <div className="flex bg-[#0e1525] text-white min-h-screen">
      {/* 🌍 Left Main Content (no internal scroll) */}
      <div className="flex-1 px-8">

        <h1 className="text-3xl font-bold mb-6">Create a Server</h1>

        <div className="space-y-8">
          {/* 🧭 Location Section */}
          <section id="location">
            <h2 className="text-xl font-semibold mb-4">✅ Location</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-3xl">
              Choose a location for your server. Some features like Private Networks
              and Load Balancers depend on the same network zone.
            </p>

            <LocationSelector
              selected={selectedLocation}
              onSelect={handleLocationSelect}
            />
          </section>

          {/* Selected Location Confirmation */}
          {selectedLocation && (
            <div className="mt-8 p-4 bg-[#1a2238] rounded-lg border border-gray-700">
              <p className="text-gray-300 text-sm">
                <span className="font-semibold text-green-400">✓ Location Selected:</span> {selectedLocation}
              </p>
              <p className="text-gray-300 text-sm mt-1">
                <span className="font-semibold text-blue-400">Server ID:</span> {serverId}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Continue to the next step to choose your operating system.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateServerPage;