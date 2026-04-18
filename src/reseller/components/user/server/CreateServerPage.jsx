import React from "react";
import LocationSelector from "./LocationSelector";
import Swal from "sweetalert2";

const CreateServerPage = ({
  selectedLocation,
  setSelectedLocation,
  setServerId,
  serverId,
}) => {
  // Scrolls only when selecting a location
  const handleLocationSelect = (locationName, serverIdValue) => {
    if (typeof setSelectedLocation === 'function') setSelectedLocation(locationName);
    if (typeof setServerId === 'function') setServerId(serverIdValue);

    // Show success notification
    Swal.fire({
      icon: 'success',
      title: 'Location Selected',
      text: `You've selected ${locationName}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: '#0e1525',
      color: '#ffffff',
      iconColor: '#4f46e5'
    });

    // Smooth scroll to Image section
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
      {/* Left Main Content (no internal scroll) */}
      <div className="flex-1 px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Create a Server</h1>
        </div>

        <div className="space-y-8">
          {/* Location Section */}
          <section id="location">
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
              <h2 className="text-xl font-semibold">Location</h2>
            </div>
            
            <p className="text-gray-400 text-sm mb-6 max-w-3xl">
              Choose a location for your server. Some features like Private
              Networks and Load Balancers depend on the same network zone.
            </p>

            <LocationSelector
              selected={selectedLocation}
              onSelect={handleLocationSelect}
            />
          </section>

        </div>
      </div>
    </div>
  );
};

export default CreateServerPage;