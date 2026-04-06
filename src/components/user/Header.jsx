import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  Server,
  Ticket,
  Settings,
  User,
  Wallet,
  ShoppingBag,
  FileText,
} from "lucide-react";
import useLogout from "./Logout";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isReseller, setIsReseller] = useState(false);
  const dropdownRef = useRef(null);
  const APP_NAME = import.meta.env.VITE_APP_NAME;

  // ✅ Call your hook here — this gives you the logout function
  const logout = useLogout();

  // ✅ Check login state and decode token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoggedIn(false);
      setUser(null);
      setIsReseller(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
        setIsReseller(false);
      } else {
        setUser(decoded);
        setIsLoggedIn(true);

        // ✅ Detect reseller from token
        setIsReseller(decoded.isReseller === true);
        // OR if backend sends role instead:
        // setIsReseller(decoded.role === "ROLE_RESELLER_USER");
      }
    } catch {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUser(null);
      setIsReseller(false);
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
          <a
            href="/dashboard"
            className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition"
          >
            <img
              src="/favicon.ico"
              alt="Logo"
              className="h-9 w-9 object-contain"
            />
            <h1 className="text-lg font-semibold text-white tracking-wide">
              {APP_NAME}
            </h1>
          </a>
        </div>

        {/* Navigation */}
        {isLoggedIn && (
          <nav className="hidden md:flex items-center space-x-8 text-sm">
            <a
              href="/orders"
              className="flex items-center space-x-1 hover:text-[#4f46e5] transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </a>
            <a
              href="/past-orders"
              className="flex items-center space-x-1 hover:text-[#4f46e5] transition"
            >
              <FileText className="w-4 h-4" />
              <span>Past Orders</span>
            </a>
            {isReseller && (
              <a
                href="/sub-users"
                className="flex items-center space-x-1 hover:text-[#4f46e5] transition"
              >
                <User className="w-4 h-4" />
                <span>Users</span>
              </a>
            )} 
            {isReseller && (
              <a
                href="/settings"
                className="flex items-center space-x-1 hover:text-[#4f46e5] transition"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </a>
            )} 
          </nav>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-4 relative">
          {isLoggedIn && (
            <a
              href="/wallet"
              className="flex items-center gap-2 p-2 border border-gray-600 rounded-full hover:border-[#4f46e5] hover:text-[#4f46e5] transition"
              title="Wallet"
            >
              <Wallet className="w-5 h-5" />
            </a>
          )}

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
                      <span className="material-icons text-[18px]">
                        account_circle
                      </span>
                      <span>Profile</span>
                    </a>

                    <a
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-[#1e293b] hover:text-[#4f46e5] transition border-b border-gray-700"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="material-icons text-[18px]">
                        dashboard
                      </span>
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
                      <span className="material-icons text-[18px]">
                        person_add
                      </span>
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
