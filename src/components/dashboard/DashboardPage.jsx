import ActivityList from "./ActivityList";
import LocationMap from "./LocationMap";
import ResourceGrid from "./ResourceGrid";
import img from "../../assets/map3.jpg"
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

const DashboardHeader = () => (
    <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <span className="bg-gray-700 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full">3 resources</span>
            <span className="bg-gray-700 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full">1 member</span>
        </div>
        <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg bg-[#2c3548] hover:bg-gray-700 transition-colors">
                <FaCog className="text-gray-300 h-5 w-5" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors">
                Create Resource
                <FaChevronDown />
            </button>
        </div>
    </header>
);

// --- MAIN DASHBOARD PAGE ---
const DashboardPage = () => {
    return (
        <div className="p-6 text-gray-200">
            <DashboardHeader />
            <main className="flex flex-col lg:flex-row gap-6">
                {/* Column 1: Map (Takes up ~50% width) */}
                <div className="w-full lg:w-6/12">
                    <LocationMap img={img}/>
                </div>

                {/* Column 2: Resources (Takes up ~25% width) */}
                <div className="w-full lg:w-3/12">
                    <ResourceGrid />
                </div>

                {/* Column 3: Activities (Takes up ~25% width) */}
                <div className="w-full lg:w-3/12">
                    <ActivityList />
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;