const LOCATIONS = [
  { name: "Nuremberg", code: "eu-central", flag: "🇩🇪" },
  { name: "Falkenstein", code: "eu-central", flag: "🇩🇪" },
  { name: "Helsinki", code: "eu-central", flag: "🇫🇮" },
  { name: "Singapore", code: "ap-southeast", flag: "🇸🇬" },
  { name: "Hillsboro, OR", code: "us-west", flag: "🇺🇸" },
  { name: "Ashburn, VA", code: "us-east", flag: "🇺🇸" },
];

const LocationSelector = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {LOCATIONS.map((loc, idx) => (
        <button
          key={idx}
          className={`flex flex-col items-start p-4 rounded-lg border-2 ${
            loc.name === "Helsinki" ? "border-red-500 bg-[#1a1f2e]" : "border-gray-600 bg-[#1c2538]"
          } hover:border-red-400 transition-all`}
        >
          <div className="text-2xl">{loc.flag}</div>
          <div className="text-lg font-semibold">{loc.name}</div>
          <div className="text-xs text-gray-400">{loc.code}</div>
        </button>
      ))}
    </div>
  );
};

export default LocationSelector;
