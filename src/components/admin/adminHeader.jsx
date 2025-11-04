import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
// import useLogout from "../hooks/useLogout";
const token = localStorage.getItem("adminToken");

const logout=()=>{
  localStorage.removeItem("adminToken");
  window.location.href = "/admin/login";
}

const AdminHeader = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  // const logout = useLogout();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/orders", icon: Users, label: "Orders" },
    { href: "/admin/invoices", icon: FileBarChart, label: "Invoices" },
    { href: "/admin/servers", icon: FileBarChart, label: "Servers" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <header className="bg-[#0e1525] text-gray-200 shadow-md border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-[#22c55e] p-2 rounded-lg">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-white tracking-wide">
            ADMIN <span className="text-[#22c55e]">PANEL</span>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              className="flex items-center space-x-1 hover:text-[#22c55e] transition"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4 relative">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 border border-gray-600 rounded-lg hover:border-[#22c55e] transition"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-300" />
            )}
          </button>

          {/* Profile Dropdown */}
          {(!token)? null : 
            <div className="relative" ref={dropdownRef}>
              <button
                className="p-2 border border-gray-600 rounded-full hover:border-[#22c55e] transition"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <User className="w-5 h-5 text-gray-300 hover:text-[#22c55e]" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#121a2a] border border-gray-700 rounded-xl shadow-lg py-1 z-50">
                  <a
                    href="/admin/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-[#22c55e] transition border-b border-slate-600"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Profile</span>
                  </a>

                  <button
                    onClick={() => logout()} // replace with logout()
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-[#22c55e] transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button> 
                </div>
              )}
            </div>
          }
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#121a2a] border-t border-gray-700 py-4 px-6 animate-fadeIn">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              className="flex items-center space-x-2 py-2 text-gray-300 hover:text-[#22c55e] transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

export default AdminHeader;
