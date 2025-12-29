import React, { useState, useEffect } from "react";
import {
  Home,
  Server,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import useLogout from "./Logout"; // Correct import for your custom hook

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeSubSection, setActiveSubSection] = useState(null);
  const [openServersMenu, setOpenServersMenu] = useState(false);
  const [openMoreOptions, setOpenMoreOptions] = useState(false);

  // ✅ Get logout function from hook
  const logout = useLogout();

  const links = [
    { name: "Dashboard", icon: <Home size={18} />, id: "dashboard" },
    { name: "Servers", icon: <Server size={18} />, id: "servers" },
    { name: "Security", icon: <Shield size={18} />, id: "security" },
    { name: "Settings", icon: <Settings size={18} />, id: "settings" },
  ];

  const serversSubItems = [
    { label: "Create a Server", id: "create-server" },
    { label: "Image", id: "server-image" },
    { label: "Type", id: "server-type" },
    { label: "Resources", id: "server-resources" },
  ];

  const moreOptionsSubItems = [
    { label: "System Logs" },
    { label: "API Access" },
    { label: "Storage" },
  ];

  const [isManualClick, setIsManualClick] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isManualClick) return; // 🚫 Skip if manually clicked

      const container = document.getElementById("main-content");
      const scrollPos = container.scrollTop + 100;

      const sectionIds = [
        "dashboard",
        "servers",
        "security",
        "settings",
        ...serversSubItems.map((item) => item.id),
      ];

      let foundSection = null;
      let foundSub = null;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          if (serversSubItems.some((item) => item.id === id)) {
            foundSub = id;
            foundSection = "servers";
          } else {
            foundSection = id;
          }
          break;
        }
      }

      if (foundSection && foundSection !== activeSection) {
        setActiveSection(foundSection);
      }
      if (foundSub !== activeSubSection) {
        setActiveSubSection(foundSub);
      }
    };

    const container = document.getElementById("main-content");
    container?.addEventListener("scroll", handleScroll, { passive: true });

    return () => container?.removeEventListener("scroll", handleScroll);
  }, [activeSection, activeSubSection, serversSubItems, isManualClick]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onClickSection = (id) => {
    setIsManualClick(true);
    setActiveSection(id);

    if (id === "servers") {
      setOpenServersMenu((prev) => !prev);
      if (!openServersMenu) {
        const target = activeSubSection || "create-server";
        setActiveSubSection(target);
        scrollTo(target);
      }
    } else {
      setOpenServersMenu(false);
      setActiveSubSection(null);
      scrollTo(id);
    }

    setTimeout(() => setIsManualClick(false), 500); // Allow scroll updates again
  };

  const onClickSubSection = (id) => {
    setIsManualClick(true);
    setActiveSection("servers");
    setActiveSubSection(id);
    scrollTo(id);
    setTimeout(() => setIsManualClick(false), 500);
  };

  // ✅ Call logout from your hook when clicked
  const handleLogout = async () => {
    await logout(); // This calls your API + clears token + navigates to /login
  };

  return (
    <aside className="bg-[#121a2a] text-gray-300 w-64 h-screen fixed border-r border-indigo-900/30">
      <nav className="py-20 px-4 space-y-1 text-sm overflow-y-auto">
        {links.map((link) => (
          <div key={link.id}>
            <button
              onClick={() => onClickSection(link.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                activeSection === link.id
                  ? "bg-indigo-600/30 text-white"
                  : "hover:bg-[#1c2538] text-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {link.icon}
                <span>{link.name}</span>
              </div>
              {link.id === "servers" &&
                (openServersMenu ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                ))}
            </button>

            {link.id === "servers" && openServersMenu && (
              <div className="mt-1 ml-8 border-l border-indigo-700/40 pl-3 space-y-1">
                {serversSubItems.map((sub) => (
                  <SubItem
                    key={sub.id}
                    label={sub.label}
                    active={activeSubSection === sub.id}
                    onClick={() => onClickSubSection(sub.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* ✅ Logout Button */}
      <div
        className="px-6 py-4 border-t border-indigo-900/30 flex items-center gap-3 cursor-pointer hover:text-red-400"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </div>
    </aside>
  );
}

function SubItem({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "text-gray-400 hover:text-indigo-400 hover:bg-[#1c2538]"
      }`}
    >
      {label}
    </div>
  );
}
