import React, { useState, useEffect, useRef } from "react";
import { Globe, Server, Ticket, Settings, User, Wallet, ShoppingBag } from "lucide-react";
import useLogout from "./Logout";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

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
        toast.error("Invalid token:", error);
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
          <a
            href="/dashboard"
            className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition"
          >
            <img
              src="/favicon.ico"
              alt="Logo"
              className="h-9 w-9 object-contain"
            />
          </a>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm">
          <a
            href="/orders"
            className="flex items-center space-x-1 hover:text-[#4f46e5] transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders</span>
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
