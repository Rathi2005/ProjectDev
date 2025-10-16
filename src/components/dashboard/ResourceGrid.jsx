import {
  FaServer,
  FaMapMarkerAlt,
  FaHdd,
  FaShieldAlt,
  FaBoxOpen,
  FaNetworkWired,
  FaGlobe,
  FaWater,
  FaCube,
  FaCloud,
  FaMap,
  FaCog,
  FaChevronDown,
} from "react-icons/fa";

const resources = [
  { name: "Servers", count: 1, icon: <FaServer /> },
  { name: "Load Balancers", count: 0, icon: <FaNetworkWired /> },
  { name: "Primary IPs", count: 2, icon: <FaMapMarkerAlt /> },
  { name: "Floating IPs", count: 0, icon: <FaWater /> },
  { name: "Volumes", count: 0, icon: <FaHdd /> },
  { name: "Networks", count: 0, icon: <FaGlobe /> },
  { name: "Firewalls", count: 0, icon: <FaShieldAlt /> },
  { name: "Buckets", count: 0, icon: <FaCube /> },
  { name: "Storage Boxes", count: 0, icon: <FaBoxOpen /> },
  { name: "DNS Zones", count: 0, icon: <FaCloud /> },
];

const ResourceGrid = () => (
    <div className="bg-[#1e293b] rounded-md shadow-lg p-4 h-full">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-400 tracking-wider">ALL LOCATIONS</h2>
            <FaMap className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {resources.map((res) => (
                <div key={res.name} className="flex items-center gap-3">
                    <div className="text-red-500 text-xl">{res.icon}</div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold">{res.count}</span>
                        <span className="text-gray-400 text-xs">{res.name}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default ResourceGrid;
