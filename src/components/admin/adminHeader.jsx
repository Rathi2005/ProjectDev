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
  ShoppingCart,
  Receipt,
  Map,
  Tags,
  Wallet,
} from "lucide-react";

import useLogout from "./logout";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("adminToken");
  const logout = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  // ✅ Fixed: Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

      setOpenDropdown(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/users-overview", icon: Users, label: "Users" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/admin/invoices", icon: Receipt, label: "Invoices" },
    // { href: "/admin/servers", icon: FileBarChart, label: "Servers" },
    { href: "/admin/zones", icon: Map, label: "Zones" },
    {
      label: "Pricing",
      icon: Tags,
      dropdown: [
        { href: "/admin/pricing/dedicated", label: "Dedicated" },
        { href: "/admin/pricing/shared", label: "Shared" },
      ],
    },
    {
      label: "Credits",
      icon: Wallet,
      dropdown: [
        { href: "/admin/credits/coupons", icon: Wallet, label: "Coupons" },
        { href: "/admin/credits/wallets", icon: Wallet, label: "Wallets" },
      ],
    },
  ];

  const handleDropdownClick = (label) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  const handleDropdownLinkClick = (href) => {
    navigate(href);
    setOpenDropdown(null);
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
            <div key={label} className="relative group">
              {dropdown ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownClick(label);
                    }}
                    className="flex items-center space-x-1 hover:text-[#22c55e] transition"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                    <ChevronDown
                      className={`w-4 h-4 ml-1 transition-transform ${
                        openDropdown === label ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* ✅ Dropdown menu */}
                  {openDropdown === label && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 mt-2 w-44 bg-[#121a2a] border border-gray-700 rounded-md shadow-lg py-1 z-50"
                    >
                      {dropdown.map((item) => (
                        <Link
                          to={item.href}
                          onClick={() => {
                            setOpenDropdown(null);
                            setIsMobileMenuOpen(false);
                          }}
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-[#22c55e] transition"
                        >
                          {item.label}
                        </Link>
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
        <div
          className="md:hidden bg-[#121a2a] border-t border-gray-700 py-4 px-6 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {navLinks.map(({ href, icon: Icon, label, dropdown }) => (
            <div key={label}>
              {dropdown ? (
                <>
                  <button
                    onClick={() => handleDropdownClick(label)}
                    className="flex items-center space-x-2 py-2 w-full text-left text-gray-300 hover:text-[#22c55e] transition"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                    <ChevronDown
                      className={`w-4 h-4 ml-auto transition-transform ${
                        openDropdown === label ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openDropdown === label && (
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
