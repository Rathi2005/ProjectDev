import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const APP_NAME = import.meta.env.VITE_APP_NAME;
  return (
    <footer className="bg-[#0e1525] border-t border-indigo-900/30 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left */}
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
            <Link to="#" className="hover:text-[#4f46e5] transition">
              About Us
            </Link>
            <Link to="#" className="hover:text-[#4f46e5] transition">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-[#4f46e5] transition">
              T&amp;C
            </Link>
            <Link to="#" className="hover:text-[#4f46e5] transition">
              Return Policy
            </Link>
            <Link to="#" className="hover:text-[#4f46e5] transition">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Mobile spacer (avoids bottom nav overlap) */}
        <div className="lg:hidden h-12" />
      </div>
    </footer>
  );
}
