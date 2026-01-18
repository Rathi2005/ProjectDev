import ActivityList from "./ActivityList";
import LocationMap from "./LocationMap";
import ResourceGrid from "./ResourceGrid";
import img from "../../../assets/map3.jpg";
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
import { useState, useEffect } from "react";

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
          <p className="text-gray-400 text-sm">
            Welcome back! Here's what's happening.
          </p>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <button
        onClick={() => {
          const el = document.getElementById("create-server");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25"
      >
        <FaPlus />
        Create Resource
      </button>
    </div>
  </header>
);

const BASE_URL = import.meta.env.VITE_BASE_URL;

// --- MAIN DASHBOARD PAGE ---
const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token"); // or sessionStorage

      const response = await fetch(`${BASE_URL}/api/user/dashboard/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const data = await response.json();
      setStatsData(data);
    } catch (err) {
      setError(err.message);

      // Fallback mock data for demonstration
      setStatsData({
        totalVmsCount: 6,
        vmNames: ["my-shared-vm-test-3", "nhijkl", "testing"],
        totalIpsCount: 6,
        ipAddresses: ["165.101.250.45", "165.101.250.41", "192.168.1.10"],
        totalDiskSizeGb: 540,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 text-gray-200 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 text-gray-200 min-h-screen">
      <DashboardHeader />

      <main className="flex flex-col lg:flex-row gap-6">
        {/* Column 2: Resources (Updated) */}
        <div className="w-full lg:w-6/12">
          <ResourceGrid statsData={statsData} />
        </div>

        {/* Column 3: Activities */}
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
