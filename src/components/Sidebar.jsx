import { useState, useEffect } from "react";
import Header from "./Header";
import {
  Home,
  Server,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [openMenu, setOpenMenu] = useState(true);

  const links = [
    { name: "Dashboard", icon: <Home size={18} />, id: "dashboard" },
    { name: "Servers", icon: <Server size={18} />, id: "servers" },
    { name: "Security", icon: <Shield size={18} />, id: "security" },
    { name: "Settings", icon: <Settings size={18} />, id: "settings" },
  ];

  // 👇 Detect active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = links.map((l) => document.getElementById(l.id));
      const scrollY = window.scrollY + window.innerHeight / 3;

      for (let section of sections) {
        if (section && section.offsetTop <= scrollY && section.offsetTop + section.offsetHeight > scrollY) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <aside className="bg-[#121a2a] text-gray-300 w-64 h-screen flex flex-col border-r border-indigo-900/30 shadow-md fixed">
      {/* Title */}
      <div className="px-6 py-5 border-b border-indigo-900/30">
        <h1 className="text-indigo-400 font-semibold text-lg tracking-wide flex items-center gap-2">
          <span className="text-xl">✨</span> MyCloud
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1 text-sm">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => scrollToSection(link.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer ${
              activeSection === link.id
                ? "bg-indigo-600/30 text-white"
                : "hover:bg-[#1c2538] text-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {link.icon}
              <span>{link.name}</span>
            </div>
          </button>
        ))}

        {/* Collapsible section */}
        <div className="mt-2">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
              openMenu ? "bg-indigo-600/30 text-white" : "hover:bg-[#1c2538]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings size={18} />
              <span>More Options</span>
            </div>
            {openMenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {openMenu && (
            <div className="mt-1 ml-8 border-l border-indigo-700/40 pl-3 space-y-1">
              <SubItem label="System Logs" />
              <SubItem label="API Access" />
              <SubItem label="Storage" />
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-indigo-900/30 flex items-center gap-3 cursor-pointer hover:text-red-400 transition-colors">
        <LogOut size={18} />
        <span>Logout</span>
      </div>
    </aside>
  );
}

function SubItem({ label, active }) {
  return (
    <div
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
