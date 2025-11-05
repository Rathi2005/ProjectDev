import React, { useState } from "react";
import SummarySidebar from "./SummarySidebar";

const osOptions = [
  { name: "Ubuntu", versions: ["24.04", "22.04"] },
  { name: "Fedora", versions: ["42"] },
  { name: "Debian", versions: ["13"] },
  { name: "CentOS", versions: ["Stream 10"] },
  { name: "Rocky Linux", versions: ["10"] },
  { name: "AlmaLinux", versions: ["10"] },
];

const ImageSelector = () => {
  const [selectedOS, setSelectedOS] = useState("Ubuntu");
  const [selectedVersion, setSelectedVersion] = useState("24.04");

  return (
    <div className="flex bg-[#0e1525] text-white w-full">
      {/* Left: Main content */}
      <div className="flex-1 p-8">
        {/* Back link */}
        <div className="text-sm text-gray-400 mb-4 cursor-pointer hover:underline">
          ← Back to servers
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-10">Choose Image</h1>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-8 max-w-3xl leading-relaxed">
          Select an operating system for your server. You can choose from the
          latest stable versions of Ubuntu, Fedora, Debian, CentOS, Rocky Linux,
          and more. Each image is ready to use immediately after deployment.
        </p>

        {/* OS Selection Grid */}
        <div className="space-y-12">
          <div>
            <h2 className="text-xl font-semibold mb-2">✅ Operating System</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {osOptions.map((os) => (
                <div
                  key={os.name}
                  className={`p-5 rounded-xl border transition-all cursor-pointer duration-200
                    ${
                      selectedOS === os.name
                        ? "border-red-500 bg-[#1a2238]"
                        : "border-gray-700 hover:border-gray-600 bg-[#111827]"
                    }`}
                  onClick={() => {
                    setSelectedOS(os.name);
                    setSelectedVersion(os.versions[0]);
                  }}
                >
                  <div className="text-lg font-semibold mb-3">{os.name}</div>

                  {/* Version Dropdown */}
                  <select
                    className="bg-[#0e1525] border border-gray-700 rounded-md p-2 w-full text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={
                      selectedOS === os.name ? selectedVersion : os.versions[0]
                    }
                    onChange={(e) => {
                      if (selectedOS === os.name)
                        setSelectedVersion(e.target.value);
                    }}
                  >
                    {os.versions.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Summary Sidebar */}
      <SummarySidebar />
    </div>
  );
};

export default ImageSelector;
