import React from "react";
import { ArrowUp } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0e1525] text-gray-400 border-t border-gray-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between py-4 px-6 text-sm">
        {/* Left Section */}
        <p className="text-center md:text-left">
          Copyright © {new Date().getFullYear()}{" "}
          <span className="text-white font-medium">Cloud</span>. All Rights Reserved.
        </p>

        {/* Right Section */}
        <div className="flex items-center space-x-4 mt-3 md:mt-0">
          <a
            href="#"
            className="hover:text-[#4f46e5] transition font-medium"
          >
            *Terms & Conditions
          </a>
          <a
            href="#"
            className="hover:text-[#4f46e5] transition font-medium"
          >
            *Privacy Policy
          </a>  
        </div>
      </div>
    </footer>
  );
};

export default Footer;
