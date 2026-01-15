import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

import useLogout from "./logout"; 


const AdminHeader = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openPricingMenu, setOpenPricingMenu] = useState(false);
  const dropdownRef = useRef(null);
  const pricingDropdownRef = useRef(null); // Separate ref for pricing dropdown

  const token = localStorage.getItem("adminToken");
  const logout = useLogout();
  
  const handleLogout = async () => {
    await logout(); 
  };

  // ✅ Fixed: Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside profile dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      
      // Check if click is outside pricing dropdown
      if (pricingDropdownRef.current && !pricingDropdownRef.current.contains(event.target)) {
        // Only close if the click is not on the pricing button itself
        const pricingButton = event.target.closest('button');
        if (!pricingButton || !pricingButton.textContent.includes('Pricing')) {
          setOpenPricingMenu(false);
        }
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/orders", icon: Users, label: "Orders" },
    { href: "/admin/invoices", icon: FileBarChart, label: "Invoices" },
    // { href: "/admin/servers", icon: FileBarChart, label: "Servers" },
    { href: "/admin/zones", icon: FileBarChart, label: "Zones" },
    {
      label: "Pricing",
      icon: FileBarChart,
      dropdown: [
        { href: "/admin/pricing/dedicated", label: "Dedicated" },
        { href: "/admin/pricing/shared", label: "Shared" },
      ],
    },
    // { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const handleDropdownClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setOpenPricingMenu((prev) => !prev);
  };

  const handleDropdownLinkClick = (href) => {
    navigate(href);
    setOpenPricingMenu(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#0e1525] text-gray-200 shadow-md border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
          <div className="bg-[#22c55e] p-2 rounded-lg">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-white tracking-wide">
            ADMIN <span className="text-[#22c55e]">PANEL</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm">
          {navLinks.map(({ href, icon: Icon, label, dropdown }) => (
            <div key={label} className="relative group" ref={dropdown ? pricingDropdownRef : null}>
              {dropdown ? (
                <>
                  <button
                    onClick={handleDropdownClick}
                    className="flex items-center space-x-1 hover:text-[#22c55e] transition"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                    <ChevronDown
                      className={`w-4 h-4 ml-1 transition-transform ${
                        openPricingMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* ✅ Dropdown menu */}
                  {openPricingMenu && (
                    <div 
                      className="absolute left-0 mt-2 w-44 bg-[#121a2a] border border-gray-700 rounded-md shadow-lg py-1 z-50"
                    >
                      {dropdown.map((item) => (
                        <button
                          key={item.href}
                          onClick={() => handleDropdownLinkClick(item.href)}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-[#22c55e] transition"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={href}
                  className="flex items-center space-x-1 hover:text-[#22c55e] transition"
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
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
          {token && (
            <div className="relative">
              <button
                className="p-2 border border-gray-600 rounded-full hover:border-[#22c55e] transition"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <User className="w-5 h-5 text-gray-300 hover:text-[#22c55e]" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#121a2a] border border-gray-700 rounded-xl shadow-lg py-1 z-50">
                  <Link
                    to="/admin/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-[#22c55e] transition border-b border-slate-600"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-[#22c55e] transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#121a2a] border-t border-gray-700 py-4 px-6 animate-fadeIn">
          {navLinks.map(({ href, icon: Icon, label, dropdown }) => (
            <div key={label}>
              {dropdown ? (
                <>
                  <button
                    onClick={() => setOpenPricingMenu((prev) => !prev)}
                    className="flex items-center space-x-2 py-2 w-full text-left text-gray-300 hover:text-[#22c55e] transition"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                    <ChevronDown
                      className={`w-4 h-4 ml-auto transition-transform ${
                        openPricingMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openPricingMenu && (
                    <div className="ml-6 mt-1 border-l border-gray-700 pl-3">
                      {dropdown.map((item) => (
                        <button
                          key={item.href}
                          onClick={() => handleDropdownLinkClick(item.href)}
                          className="block w-full text-left py-1 text-gray-400 hover:text-[#22c55e]"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={href}
                  className="flex items-center space-x-2 py-2 text-gray-300 hover:text-[#22c55e] transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default AdminHeader;