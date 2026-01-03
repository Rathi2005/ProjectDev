import React, { useState, useEffect, useRef } from "react";
import { Globe, Server, Ticket, Settings, User } from "lucide-react";
import useLogout from "./Logout";
import { jwtDecode } from "jwt-decode";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  // ✅ Call your hook here — this gives you the logout function
  const logout = useLogout();

  // ✅ Check login state and decode token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Call logout function returned by hook
  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout(); // <-- correct usage
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <header className="bg-[#0e1525] text-gray-200 shadow-md border-b border-gray-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-[#4f46e5] p-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
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
          <h1 className="text-lg font-semibold text-white tracking-wide">
            CLOUD
          </h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm">
          <a
            href="/orders"
            className="flex items-center space-x-1 hover:text-[#4f46e5] transition"
          >
            <Globe className="w-4 h-4" />
            <span>Orders</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-1 hover:text-[#4f46e5] transition"
          >
            <Server className="w-4 h-4" />
            <span>Pricing</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-1 hover:text-[#4f46e5] transition"
          >
            <Ticket className="w-4 h-4" />
            <span>About Us</span>
          </a>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4 relative">
          <button className="p-2 hover:bg-[#1e293b] rounded-full transition">
            <Settings className="w-5 h-5 text-gray-300 hover:text-[#4f46e5]" />
          </button>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {/* User Avatar Button - This should be OUTSIDE the dropdown menu */}
            <button
              className="flex items-center gap-2 p-2 border border-gray-600 rounded-full hover:border-[#4f46e5] transition"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              {isLoggedIn && user && user.name ? (
                <div className="w-8 h-8 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="w-5 h-5 text-gray-300 hover:text-[#4f46e5]" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#121a2a] border border-gray-700 rounded-xl shadow-lg py-2 z-50">
                {isLoggedIn ? (
                  <>
                    {/* Menu Items */}
                    <a
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-[#4f46e5] transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="material-icons text-[18px]">account_circle</span>
                      <span>Profile</span>
                    </a>
                    
                    <a
                      href="/live-chart"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-[#4f46e5] transition border-b border-gray-700"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="material-icons text-[18px]">dashboard</span>
                      <span>Dashboard</span>
                    </a>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-red-400 transition"
                    >
                      <span className="material-icons text-[18px]">logout</span>
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/login"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-[#4f46e5] transition border-b border-gray-700"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="material-icons text-[18px]">login</span>
                      <span>Login</span>
                    </a>
                    <a
                      href="/register"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-[#4f46e5] transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="material-icons text-[18px]">person_add</span>
                      <span>Sign Up</span>
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;