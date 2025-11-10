import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/user/Sidebar";
import Header from "../components/user/Header";
import DashboardPage from "../components/user/dashboard/DashboardPage";
import CreateServerPage from "../components/user/server/CreateServerPage";
import ImageSelector from "../components/user/server/ImageSelector";
import TypeSelector from "../components/user/server/TypeSelector";
import ResourcesSelector from "../components/user/server/ResourcesSelector";
import SummarySidebar from "../components/user/server/SummarySidebar";

export default function Dashboard() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [serverId, setServerId] = useState(null); // This should be set
  const [selectedOS, setSelectedOS] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedResources, setSelectedResources] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);

  const mainContentRef = useRef(null);

  useEffect(() => {
    console.log("🔄 Dashboard State Update:", {
      selectedLocation,
      serverId, // Check if serverId is being set
      selectedOS,
      selectedType,
      selectedResources,
    });
  }, [selectedLocation, serverId, selectedOS, selectedType, selectedResources]);

  // Show sidebar when we're in any server-related section
  useEffect(() => {
    const handleScroll = () => {
      const content = mainContentRef.current;
      if (!content) return;

      const serverSubsections = [
        "create-server",
        "server-image",
        "server-type",
        "server-resources",
      ];

      let isInServerSection = false;

      for (const subsectionId of serverSubsections) {
        const subsection = document.getElementById(subsectionId);
        if (subsection) {
          const rect = subsection.getBoundingClientRect();
          const containerRect = content.getBoundingClientRect();

          const visibleHeight =
            Math.min(rect.bottom, containerRect.bottom) -
            Math.max(rect.top, containerRect.top);
          const sectionHeight = rect.height;

          if (visibleHeight > sectionHeight * 0.5) {
            isInServerSection = true;
            break;
          }
        }
      }

      setShowSidebar(isInServerSection);
    };

    const content = mainContentRef.current;
    content?.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => content?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-[#0e1525] text-gray-100 flex min-h-screen">
      {/* 🧭 Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525] border-b border-indigo-900/30">
        <Header />
      </div>

      {/* 🧱 Left Sidebar */}
      <Sidebar />

      {/* 📄 Main Content + Right Sidebar */}
      <div className="flex-1 ml-64 flex flex-row">
        {/* 🧱 Scrollable Main Content - REMOVED padding here */}
        
        <div
          id="main-content"
          ref={mainContentRef}
          className={`flex-1 overflow-y-auto scroll-smooth transition-all duration-300 ${
            showSidebar ? "pr-[340px]" : ""
          }`}
          style={{
            height: "calc(100vh - 72px)",
          }}
        >
          {/* Dashboard Section - REDUCED padding and removed centering */}
          <div id="dashboard" className="min-h-screen px-8 py-20">
            <DashboardPage />
          </div>

          {/* Server Creation Sections */}
          <div id="servers">
            {/* Create Server - REDUCED padding and removed centering */}
            <div id="create-server" className="min-h-screen px-8 py-20">
              <CreateServerPage
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                setServerId={setServerId}
                serverId={serverId} // Pass serverId to CreateServerPage
              />
            </div>
            

            {/* Server Image - REDUCED padding and removed centering */}
            <div id="server-image" className="min-h-screen px-8 py-20">
              <ImageSelector
                serverId={serverId} // Pass serverId to ImageSelector
                setSelectedOS={setSelectedOS}
              />
            </div>

            {/* Server Type - REDUCED padding and removed centering */}
            <div id="server-type" className="min-h-screen px-8 py-20">
              <TypeSelector
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                selectedOS={selectedOS} // Pass selectedOS for validation
              />
            </div>

            {/* Server Resources - REDUCED padding and removed centering */}
            <div id="server-resources" className="min-h-screen px-8 py-20">
              <ResourcesSelector
                selectedType={selectedType}
                selectedResources={selectedResources}
                setSelectedResources={setSelectedResources}
              />
            </div>
          </div>

          {/* Security Section - REDUCED padding and removed centering */}
          <div id="security" className="min-h-screen px-8 py-20">
            <h1 className="text-3xl font-bold">Security</h1>
          </div>

          {/* Settings Section - REDUCED padding and removed centering */}
          <div id="settings" className="min-h-screen px-8 py-20">
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
        </div>

        {/* 📊 Fixed Summary Sidebar */}
        <aside
          className={`w-[320px] shrink-0 border-l border-gray-800 bg-[#121a2a]
          fixed right-0 top-[72px] h-[calc(100vh-72px)] overflow-y-auto
          transition-all duration-500 ease-in-out z-40
          ${
            showSidebar
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          <SummarySidebar
            selectedLocation={selectedLocation}
            selectedOS={selectedOS}
            selectedType={selectedType}
            selectedResources={selectedResources}
            serverId={serverId} // Make sure this is passed!
          />
        </aside>
      </div>
    </div>
  );
}