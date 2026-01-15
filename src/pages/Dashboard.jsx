import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/user/Sidebar";
import Header from "../components/user/Header";
import DashboardPage from "../components/user/dashboard/DashboardPage";
import CreateServerPage from "../components/user/server/CreateServerPage";
import ImageSelector from "../components/user/server/ImageSelector";
import TypeSelector from "../components/user/server/TypeSelector";
import ResourcesSelector from "../components/user/server/ResourcesSelector";
import SummarySidebar from "../components/user/server/SummarySidebar";
import Footer from "../components/user/Footer";
import { Menu, X, ListChecks, User, Settings } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [serverId, setServerId] = useState(null);
  const [selectedOS, setSelectedOS] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedResources, setSelectedResources] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);
  const [isInServerSection, setIsInServerSection] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const mainContentRef = useRef(null);

  useEffect(() => {
    if (selectedResources && Object.keys(selectedResources).length > 0) {
      // Check for important keys
      const importantKeys = [
        "vCPU",
        "cpu",
        "cpuPriceId",
        "ram",
        "ramPriceId",
        "disk",
        "diskPriceId",
        "bandwidth",
        "bandwidthPriceId",
      ];
    }
  }, [selectedResources]);

  // Track when we're in server sections
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

      let isCurrentlyInServerSection = false;

      for (const subsectionId of serverSubsections) {
        const subsection = document.getElementById(subsectionId);
        if (subsection) {
          const rect = subsection.getBoundingClientRect();
          const containerRect = content.getBoundingClientRect();

          // Check if ANY part of the element is visible (not 50%)
          const isVisible =
            rect.top <= containerRect.bottom &&
            rect.bottom >= containerRect.top;

          if (isVisible) {
            isCurrentlyInServerSection = true;
            break;
          }
        }
      }

      // Update states
      const isDesktop = window.innerWidth >= 1024;
      setIsInServerSection(isCurrentlyInServerSection);

      // Only auto-show sidebar on desktop
      if (isDesktop) {
        setShowSidebar(isCurrentlyInServerSection);
      } else {
        setShowSidebar(false);
      }
    };

    const content = mainContentRef.current;
    content?.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => content?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!serverId) return;

    // Reset dependent selections when server changes
    setSelectedOS(null);
    setSelectedType(null);
    setSelectedResources({});
  }, [serverId]);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
        setIsMobileSummaryOpen(false);
        setIsMobileUserMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMobileSummary = () => {
    setIsMobileSummaryOpen(!isMobileSummaryOpen);
  };

  const toggleMobileUserMenu = () => {
    setIsMobileUserMenuOpen(!isMobileUserMenuOpen);
  };

  // Check if all server creation steps are completed
  const isServerCreationComplete = () => {
    return (
      selectedLocation &&
      selectedOS &&
      selectedType &&
      Object.keys(selectedResources).length > 0
    );
  };

  const cashfreeRef = useRef(null);

  useEffect(() => {
    cashfreeRef.current = Cashfree({ mode: "sandbox" });
  }, []);
  
  const token = localStorage.getItem("token");

  const handlePayment = async (sessionId) => {
    if (!cashfreeRef.current) {
      alert("Payment system not ready");
      return;
    }

    const checkoutOptions = {
      paymentSessionId: sessionId,
      redirectTarget: "_self",

      onSuccess: () => {
        setTimeout(() => {
          setShouldRedirect(true);
        }, 0);
      },

      onFailure: () => {
        alert("❌ Payment failed");
      },

      onClose: () => {
        setTimeout(() => {
          setShouldRedirect(true);
        }, 0);
      },
    };
    cashfreeRef.current.checkout(checkoutOptions);
  };

  useEffect(() => {
    if (shouldRedirect) {
      navigate("/orders");
    }
  }, [shouldRedirect, navigate]);

  return (
    <div className="bg-[#0e1525] text-gray-100 h-screen flex flex-col overflow-hidden">
      {/* 🧭 Dashboard Header Wrapper */}
      <div className="flex-shrink-0 bg-[#0e1525] border-b border-indigo-900/30">
        {/* Mobile controls container - COMPACT VERSION */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-3">
            {/* Left: Mobile menu button */}
            <div className="flex-shrink-0">
              <button
                className="p-2 rounded-lg bg-indigo-900/30 hover:bg-indigo-800/50 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Center: Logo only (more compact) */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center space-x-2">
                <div className="bg-[#4f46e5] p-1.5 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 7l9-4 9 4-9 4-9-4zm0 10l9 4 9-4m-9-4l9 4-9 4-9-4 9-4z"
                    />
                  </svg>
                </div>
                <h1 className="text-base font-semibold text-white tracking-tight">
                  CLOUD
                </h1>
              </div>
            </div>

            {/* Right: User menu and Summary button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Settings Icon */}
              <button className="p-2 hover:bg-[#1e293b] rounded-full transition">
                <Settings className="w-4 h-4 text-gray-300 hover:text-[#4f46e5]" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  className="p-2 border border-gray-600 rounded-full hover:border-[#4f46e5] transition"
                  onClick={toggleMobileUserMenu}
                >
                  <User className="w-4 h-4 text-gray-300 hover:text-[#4f46e5]" />
                </button>

                {isMobileUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-[#121a2a] border border-gray-700 rounded-xl shadow-lg py-1 z-50">
                    <a
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-[#4f46e5] transition border-b border-slate-600"
                    >
                      <span className="material-icons text-[16px]">
                        account_circle
                      </span>
                      <span>Profile</span>
                    </a>
                    <a
                      href="/login"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-[#4f46e5] transition"
                    >
                      <span className="material-icons text-[16px]">logout</span>
                      <span>Logout</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Show Summary button (only in server sections) */}
              {isInServerSection && (
                <button
                  className="flex items-center gap-1 px-2 py-1.5
                   rounded-lg bg-indigo-900/30 hover:bg-indigo-800/50 transition-colors"
                  onClick={toggleMobileSummary}
                >
                  <ListChecks size={14} />
                  <span className="text-xs font-medium">
                    {isMobileSummaryOpen ? "Hide" : "Summary"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Header - hidden on mobile */}
        <div className="hidden lg:block">
          <Header />
        </div>
      </div>

      {/* Mobile Navigation Bar (Bottom) - For main navigation links */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121a2a] border-t border-gray-800 h-12">
        <div className="flex items-center justify-around h-full">
          <a
            href="#"
            className="flex flex-col items-center p-2 text-gray-400 hover:text-[#4f46e5] transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs mt-0.5">VPS</span>
          </a>
          <a
            href="#"
            className="flex flex-col items-center p-2 text-gray-400 hover:text-[#4f46e5] transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs mt-0.5">Pricing</span>
          </a>
          <a
            href="#"
            className="flex flex-col items-center p-2 text-gray-400 hover:text-[#4f46e5] transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <span className="text-xs mt-0.5">About</span>
          </a>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 🧱 Left Sidebar - Mobile Drawer */}
        <div
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#121a2a] border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:w-64 flex-shrink-0 h-full`}
          style={{ top: "64px", height: "calc(100vh - 64px)" }}
        >
          <Sidebar />
        </div>

        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* 📄 Main Content Area */}
        <div className="flex-1 flex">
          {/* 🧱 Scrollable Main Content */}
          <div
            id="main-content"
            ref={mainContentRef}
            className={`flex-1 overflow-y-auto scroll-smooth transition-all duration-300 no-scrollbar ${
              showSidebar ? "lg:pr-[340px]" : ""
            }`}
          >
            {/* Dashboard Section */}
            <div id="dashboard" className="min-h-screen">
              <DashboardPage />
            </div>

            {/* Server Creation Sections */}
            <div id=" servers">
              {/* Create Server */}
              <div
                id="create-server"
                className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 lg:py-16"
              >
                <CreateServerPage
                  selectedLocation={selectedLocation}
                  setSelectedLocation={setSelectedLocation}
                  setServerId={setServerId}
                  serverId={serverId}
                />
              </div>

              {/* Server Image */}
              <div
                id="server-image"
                className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 lg:py-16"
              >
                <ImageSelector
                  key={serverId}
                  serverId={serverId}
                  setSelectedOS={setSelectedOS}
                />
              </div>

              {/* Server Type */}
              <div
                id="server-type"
                className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 lg:py-16"
              >
                <TypeSelector
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedOS={selectedOS}
                />
              </div>

              {/* Server Resources */}
              <div
                id="server-resources"
                className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 lg:py-16"
              >
                <ResourcesSelector
                  selectedType={selectedType}
                  selectedResources={selectedResources}
                  setSelectedResources={setSelectedResources}
                  onVerifyAndCreate={() => setIsMobileSummaryOpen(true)}
                  isServerCreationComplete={isServerCreationComplete()}
                />
              </div>
            </div>

            {/* Other Sections */}
            <div
              id="security"
              className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 lg:py-16"
            >
              <h1 className="text-2xl sm:text-3xl font-bold">Security</h1>
            </div>

            <div
              id="settings"
              className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 lg:py-16"
            >
              <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
            </div>

            {/* Footer - Placed inside the scrollable content at the bottom */}
            <Footer />
          </div>

          {/* 📊 Summary Sidebar - Responsive Implementation */}

          {/* Desktop Version (LG and above) - Only shows when showSidebar is true */}
          {showSidebar && (
            <aside
              className={`hidden lg:block w-[320px] shrink-0 border-l border-gray-800 bg-[#121a2a]
              fixed right-0 h-[calc(100vh-72px)] overflow-y-auto
              transition-all duration-500 ease-in-out z-40
              ${
                showSidebar
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0 pointer-events-none"
              }`}
              style={{ top: "72px" }}
            >
              <SummarySidebar
                selectedLocation={selectedLocation}
                selectedOS={selectedOS}
                selectedType={selectedType}
                selectedResources={selectedResources}
                serverId={serverId}
                onMobileCreate={() => {
                  alert("Server creation would proceed here!");
                }}
                onPaymentStart={handlePayment}
                isMobile={false}
              />
            </aside>
          )}

          {/* Mobile Version (Below LG) - FULL WIDTH SIDEBAR */}
          <div
            className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
              isMobileSummaryOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Backdrop */}
            <div
              className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                isMobileSummaryOpen ? "opacity-50" : "opacity-0"
              }`}
              onClick={() => setIsMobileSummaryOpen(false)}
            />

            {/* Mobile Summary Sidebar - FULL WIDTH */}
            <aside
              className={`absolute right-0 top-0 w-full h-full bg-[#121a2a]
              transform transition-transform duration-300 ease-in-out
              ${isMobileSummaryOpen ? "translate-x-0" : "translate-x-full"}`}
              style={{ paddingTop: "64px" }}
            >
              <div className="h-full flex flex-col">
                {/* Header - Fixed at top */}
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                  <h2 className="text-xl font-bold">Server Summary</h2>
                  <button
                    onClick={() => setIsMobileSummaryOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content - Takes full available space with proper padding */}
                <div className="flex-1 overflow-y-auto px-4">
                  <div className="py-4">
                    <SummarySidebar
                      selectedLocation={selectedLocation}
                      selectedOS={selectedOS}
                      selectedType={selectedType}
                      selectedResources={selectedResources}
                      serverId={serverId}
                      isMobile={true}
                      onPaymentStart={handlePayment}
                    />
                  </div>
                </div>

                {/* Action Buttons - Fixed at bottom */}
                <div className="p-4 border-t border-gray-800">
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setIsMobileSummaryOpen(false)}
                      className="px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors font-medium"
                    >
                      Back to Edit
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
