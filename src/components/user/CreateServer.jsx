import { useState } from "react";

export default function CreateServer() {
  const [selectedRegion, setSelectedRegion] = useState("Helsinki");

  const locations = [
    { name: "Nuremberg", region: "eu-central", flag: "🇩🇪" },
    { name: "Falkenstein", region: "eu-central", flag: "🇩🇪" },
    { name: "Helsinki", region: "eu-central", flag: "🇫🇮" },
    { name: "Singapore", region: "ap-southeast", flag: "🇸🇬" },
    { name: "Hillsboro, OR", region: "us-west", flag: "🇺🇸" },
    { name: "Ashburn, VA", region: "us-east", flag: "🇺🇸" },
  ];

  return (
    <main className="flex-1 p-8 bg-[#0e1525]" style={{ height: "calc(100vh - 72px)" }}>
      <div className="p-6 h-full flex flex-col">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white mb-4">Create a Server</h1>
          <p className="text-gray-400 mb-6">
            Choose a location for your server.
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {locations.map((loc) => (
              <button
                key={loc.name}
                onClick={() => setSelectedRegion(loc.name)}
                className={`p-5 rounded-xl border transition-all text-left ${
                  selectedRegion === loc.name
                    ? "border-indigo-500 bg-indigo-600/20"
                    : "border-gray-700 hover:border-indigo-500/60 hover:bg-[#1c2538]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{loc.flag}</span>
                  <span
                    className={`text-sm ${
                      selectedRegion === loc.name
                        ? "text-indigo-400"
                        : "text-gray-400"
                    }`}
                  >
                    {loc.region}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold text-lg">{loc.name}</h3>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-md font-semibold text-white transition-colors">
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}