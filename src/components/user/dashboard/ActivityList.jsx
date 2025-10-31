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

const activities = [
    { action: "Server started", resource: "ubuntu-8gb-nbg1-1", time: "4 minutes ago", icon: <FaServer className="text-gray-400" /> },
    { action: "Server created", resource: "ubuntu-8gb-nbg1-1", time: "4 minutes ago", icon: <FaServer className="text-gray-400" /> },
    { action: "Primary IP created", resource: "primary_ip-10376...", time: "4 minutes ago", icon: <FaMapMarkerAlt className="text-green-500" /> },
    { action: "Primary IP created", resource: "primary_ip-10376...", time: "4 minutes ago", icon: <FaMapMarkerAlt className="text-green-500" /> },
    { action: "Server is being created", resource: "ubuntu-8gb-nbg1-1", time: "4 minutes ago", icon: <FaServer className="text-gray-400" /> },
];


const ActivityList = () => (
    <div className="bg-[#1e293b] rounded-md shadow-lg p-4 h-full">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-400 tracking-wider">ACTIVITIES</h2>
            <a href="#" className="text-sm text-red-500 hover:underline">View all </a>
        </div>
        <ul className="space-y-4">
            {activities.map((activity, index) => (
                <li key={index} className="flex items-center gap-3">
                    <div className="p-2 bg-[#2c3548] rounded-full">{activity.icon}</div>
                    <div>
                        <p className="text-sm text-white">{activity.action}</p>
                        <p className="text-xs text-gray-400">{activity.resource} · {activity.time}</p>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

export default ActivityList;
