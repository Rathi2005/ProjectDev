import React, { useState, useMemo } from "react";

const SummarySidebar = ({ 
  selectedLocation, 
  selectedOS, 
  selectedType, 
  selectedResources 
}) => {
  const [serverCount, setServerCount] = useState(1);

  // Function to calculate pricing based on selected resources
  const calculatePricing = useMemo(() => {
    if (!selectedResources || !selectedResources.pricing) {
      return {
        serverPrice: 590, // Default price per server (₹)
        ipv4Price: 42,    // Default price per IPv4 (₹)
      };
    }

    return {
      serverPrice: parseFloat(selectedResources.pricing.monthly) || 590,
      ipv4Price: 42, // Fixed price per server for IPv4
    };
  }, [selectedResources]);

  // Total price = (per-server total) × number of servers
  const total = (calculatePricing.serverPrice + calculatePricing.ipv4Price) * serverCount;

  // Functions to increment and decrement server count
  const increaseCount = () => setServerCount((prev) => prev + 1);
  const decreaseCount = () => setServerCount((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <aside className="w-[300px] bg-[#121a2a] mt-10 p-6 border-l border-gray-800 flex flex-col justify-start">
      <div className="space-y-4 mb-12">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-red-500">✔</span>
          <span>
            {selectedLocation
              ? `${selectedLocation} - Location`
              : "No location selected"}
          </span>
        </div>

        {/* Operating System */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-red-500">✔</span>
          <span>
            {selectedOS
              ? `${selectedOS.name} ${selectedOS.version} - Image`
              : "No OS selected"}
          </span>
        </div>

        {/* Server Type */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-red-500">✔</span>
          <span>
            {selectedType ? `${selectedType} - Type` : "No type selected"}
          </span>
        </div>

        {/* Resources */}
        {selectedResources && Object.keys(selectedResources).length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-500">✔</span>
            <span>
              {selectedResources.vCPU && `${selectedResources.vCPU}, `}
              {selectedResources.ram && `${selectedResources.ram}, `}
              {selectedResources.disk && `${selectedResources.disk}`} - Resources
            </span>
          </div>
        )}
      </div>

      {/* Purchase Section */}
      <div className="pt-3 border-t border-gray-800 space-y-4">
        {/* Server count control */}
        <div className="flex items-center justify-between">
          <button
            onClick={decreaseCount}
            className="px-2 py-1 border border-gray-700 rounded hover:bg-gray-700/30"
          >
            -
          </button>
          <span>{serverCount} Server{serverCount > 1 ? "s" : ""}</span>
          <button
            onClick={increaseCount}
            className="px-2 py-1 border border-gray-700 rounded hover:bg-gray-700/30"
          >
            +
          </button>
        </div>

        {/* Pricing breakdown */}
        <div className="text-sm space-y-3">
          <div className="flex justify-between text-gray-400">
            <span>{serverCount} SERVER{serverCount > 1 ? "S" : ""}</span>
            <span className="text-white">
              ₹{(calculatePricing.serverPrice * serverCount).toFixed(0)}/mo
            </span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>{serverCount} IPv4</span>
            <span className="text-white">
              ₹{(calculatePricing.ipv4Price * serverCount).toFixed(0)}/mo
            </span>
          </div>
          <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
            <span>Total</span>
            <span>₹{total.toFixed(0)}/mo</span>
          </div>
        </div>

        {/* Buy Now Button */}
        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 mt-3 rounded font-semibold">
          Create & Buy now
        </button>

        <p className="text-xs text-gray-500 mt-2">
          All prices incl. 0% VAT. Our{" "}
          <span className="underline text-gray-400 hover:text-white cursor-pointer">
            terms and conditions
          </span>{" "}
          apply.
        </p>

        {/* Hourly Pricing */}
        {selectedResources?.pricing?.hourly && (
          <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
            <div className="flex justify-between">
              <span>Hourly rate:</span>
              <span>
                ₹
                {(parseFloat(selectedResources.pricing.hourly) * serverCount).toFixed(2)}
                /hour
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SummarySidebar;
