const SummarySidebar = ({ 
  selectedLocation, 
  selectedOS, 
  selectedType, 
  selectedResources 
}) => {
  // Calculate dynamic pricing based on selected resources
  const calculatePricing = () => {
    if (!selectedResources || !selectedResources.pricing) {
      return {
        serverPrice: 590, // Default price in ₹
        ipv4Price: 42,    // Default price in ₹
        total: 632        // Default total in ₹
      };
    }

    const serverPrice = parseFloat(selectedResources.pricing.monthly) || 590;
    const ipv4Price = 42; // Fixed price for IPv4 in ₹
    const total = serverPrice + ipv4Price;

    return {
      serverPrice: serverPrice.toFixed(0),
      ipv4Price: ipv4Price.toFixed(0),
      total: total.toFixed(0)
    };
  };

  const pricing = calculatePricing();

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

        {/* Operating System - Now dynamic */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-red-500">✔</span>
          <span>
            {selectedOS
              ? `${selectedOS.name} ${selectedOS.version} - Image`
              : "No OS selected"}
          </span>
        </div>

        {/* Server Type - Now dynamic */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-red-500">✔</span>
          <span>
            {selectedType
              ? `${selectedType} - Type`
              : "No type selected"}
          </span>
        </div>

        {/* Resources - Now dynamic */}
        {selectedResources && Object.keys(selectedResources).length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-500">✔</span>
            <span>
              {selectedResources.vCPU && `${selectedResources.vCPU}, `}
              {selectedResources.ram && `${selectedResources.ram}, `}
              {selectedResources.disk && `${selectedResources.disk}`}
              - Resources
            </span>
          </div>
        )}
      </div>

      {/* Purchase section - Now with dynamic pricing in ₹ */}
      <div className="pt-3 border-t border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <button className="px-2 py-1 border border-gray-700 rounded hover:bg-gray-700/30">
            -
          </button>
          <span>1 Server</span>
          <button className="px-2 py-1 border border-gray-700 rounded hover:bg-gray-700/30">
            +
          </button>
        </div>

        <div className="text-sm space-y-3">
          <div className="flex justify-between text-gray-400">
            <span>1 SERVER</span>
            <span className="text-white">₹{pricing.serverPrice}/mo</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>1 IPv4</span>
            <span className="text-white">₹{pricing.ipv4Price}/mo</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
            <span>Total</span>
            <span>₹{pricing.total}/mo</span>
          </div>
        </div>

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

        {/* Show hourly pricing if available */}
        {selectedResources?.pricing?.hourly && (
          <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
            <div className="flex justify-between">
              <span>Hourly rate:</span>
              <span>₹{selectedResources.pricing.hourly}/hour</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SummarySidebar;