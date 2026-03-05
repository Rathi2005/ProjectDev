import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/user/Header";
import Sidebar from "../components/user/Sidebar";

export default function Dashboard() {
  return (
    <div className="bg-[#0e1525] text-gray-100 h-screen flex flex-col">
      {/* Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-64 bg-[#121a2a] border-r border-indigo-900/30 flex flex-col">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
}