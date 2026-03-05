import React from "react";
import { NavLink } from "react-router-dom";
import { Package, User, LogOut } from "lucide-react";
import useLogout from "./Logout";

export default function Sidebar() {
  const logout = useLogout();
  const APP_NAME = import.meta.env.VITE_APP_NAME;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
      isActive
        ? "bg-indigo-600/30 text-white"
        : "text-gray-300 hover:bg-[#1c2538]"
    }`;

  return (
    <aside className="bg-[#121a2a] text-gray-300 h-full flex flex-col justify-between w-64 border-r border-indigo-900/30">
      
      {/* 🔥 Logo Section */}
      <div>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-700">
          <img
            src="/favicon.ico"
            alt="Logo"
            className="h-9 w-9 object-contain"
          />
          <h1 className="text-lg font-semibold text-white tracking-wide">
            {APP_NAME}
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 py-6 space-y-2 text-sm">
          <NavLink to="/dashboard/orders" className={linkClass}>
            <Package size={18} />
            <span>Orders</span>
          </NavLink>

          <NavLink to="/dashboard/profile" className={linkClass}>
            <User size={18} />
            <span>Profile</span>
          </NavLink>
        </nav>
      </div>

      {/* 🔥 Logout */}
      <div
        className="px-6 py-4 border-t border-indigo-900/30 flex items-center gap-3 cursor-pointer hover:text-red-400"
        onClick={logout}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </div>
    </aside>
  );
}