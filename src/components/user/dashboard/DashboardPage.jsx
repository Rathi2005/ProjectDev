import ActivityList from "./ActivityList";
import LocationMap from "./LocationMap";
import ResourceGrid from "./ResourceGrid";
import img from "../../../assets/map3.jpg"
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
  FaPlus,
  FaChartLine,
  FaBell,
  FaSearch,
} from "react-icons/fa";
import { useState } from "react";

const DashboardHeader = () => (
  <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl">
          <FaChartLine className="text-white h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 text-sm">Welcome back! Here's what's happening.</p>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <button className="p-2.5 rounded-lg bg-[#2c3548] hover:bg-gray-700 transition-all hover:scale-105">
        <FaCog className="text-gray-300 h-5 w-5" />
      </button>
      <button 
      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25"
      >
      
        <FaPlus />
        Create Resource
      </button>
    </div>
  </header>
);

// Stats Cards Component
const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-gradient-to-br from-[#1c2538] to-[#121a2a] p-4 rounded-xl border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
        {trend && (
          <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

// --- MAIN DASHBOARD PAGE ---
const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    { title: "Active Servers", value: "12", icon: FaServer, color: "bg-indigo-900/30 text-indigo-400", trend: "+2 this month" },
    { title: "Storage Used", value: "85%", icon: FaHdd, color: "bg-purple-900/30 text-purple-400", trend: "+5%" },
    { title: "Network Uptime", value: "99.9%", icon: FaNetworkWired, color: "bg-green-900/30 text-green-400", trend: "+0.1%" },
    { title: "Security Score", value: "A+", icon: FaShieldAlt, color: "bg-yellow-900/30 text-yellow-400", trend: "Stable" },
  ];

  return (
    <div className="p-4 sm:p-6 text-gray-200 min-h-screen">
      <DashboardHeader />
      
      <main className="flex flex-col lg:flex-row gap-6">
      
        {/* Column 2: Resources (Takes up ~25% width) */}
        <div className="w-full lg:w-6/12">
          <div className="bg-gradient-to-br from-[#1c2538] to-[#121a2a] rounded-xl border border-gray-800 p-4 h-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaBoxOpen className="text-purple-400" />
                  Resources
                </h2>
                <p className="text-gray-400 text-sm">Active server resources</p>
              </div>
              <span className="text-xs bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded">
                3 Active
              </span>
            </div>
            <div className="h-[300px] overflow-y-auto">
              <ResourceGrid />
            </div>
          </div>
        </div>

        {/* Column 3: Activities (Takes up ~25% width) */}
        <div className="w-full lg:w-6/12">
          <div className="bg-gradient-to-br from-[#1c2538] to-[#121a2a] rounded-xl border border-gray-800 p-4 h-full">
            <div className="h-[400px] overflow-y-auto">
              <ActivityList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;