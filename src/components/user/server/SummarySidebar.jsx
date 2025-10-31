const SummarySidebar = () => {
  return (
    <aside className="w-[300px] bg-[#121a2a] mt-10 p-6 border-l border-gray-800 flex flex-col justify-start">
      <div className="space-y-4">
        {/* Selection summary */}
        {[
          "Helsinki - Location",
          "Ubuntu 24.04 - Image",
          "CPX 21 - Type",
          "IPv4, IPv6 - Networking",
          "1 key - SSH keys",
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <span className="text-red-500">✔</span>
            <span>{item}</span>
          </div>
        ))}

        {/* Placeholder for disabled options */}
        <div className="text-gray-500 text-sm pt-4 mb-1 space-y-1">
          <p className="opacity-50">○ Volumes</p>
          <p className="opacity-50">○ Firewalls</p>
        </div>
      </div>

      {/* Purchase section */}
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

        <div className="text-sm space-y-1">
          <div className="flex justify-between text-gray-400">
            <span>1 SERVER</span>
            <span className="text-white">€7.05/mo</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>1 IPv4</span>
            <span className="text-white">€0.50/mo</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
            <span>Total</span>
            <span>€7.55/mo</span>
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
      </div>
    </aside>
  );
};

export default SummarySidebar;
