import React from "react";
import { Globe, Server, Ticket, Settings, User } from "lucide-react";

const Header = () => {
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
            href="#"
            className="flex items-center space-x-1 hover:text-[#4f46e5] transition"   // bg-[#595773] p-3 px-5 rounded-full
          >
            <Globe className="w-4 h-4" />
            <span>Cloud VPS</span>
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
            <span>About us</span>
          </a>
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-[#1e293b] rounded-full transition">
            <Settings className="w-5 h-5 text-gray-300 hover:text-[#4f46e5]" />
          </button>
          <button className="p-2 border border-gray-600 rounded-full hover:border-[#4f46e5] transition">
            <User className="w-5 h-5 text-gray-300 hover:text-[#4f46e5]" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
