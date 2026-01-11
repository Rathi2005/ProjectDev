// import React from "react";
// import { ArrowUp } from "lucide-react";

// const Footer = () => {
//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   return (
//     <footer className="bg-[#0e1525] text-gray-400 border-t border-gray-700">
//       <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between py-4 px-6 text-sm">
//         {/* Left Section */}
//         <p className="text-center md:text-left">
//           Copyright © {new Date().getFullYear()}{" "}
//           <span className="text-white font-medium">Cloud</span>. All Rights Reserved.
//         </p>

//         {/* Right Section */}
//         <div className="flex items-center space-x-4 mt-3 md:mt-0">
//           <a
//             href="#"
//             className="hover:text-[#4f46e5] transition font-medium"
//           >
//             *Terms & Conditions
//           </a>
//           <a
//             href="#"
//             className="hover:text-[#4f46e5] transition font-medium"
//           >
//             *Privacy Policy
//           </a>  
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;


import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#0e1525] border-t border-indigo-900/30 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left */}
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ServerLink. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
            <Link to="https://www.getwebup.in/aboutus.php" className="hover:text-[#4f46e5] transition">
              About Us
            </Link>
            <Link to="https://www.getwebup.in/privacy.php" className="hover:text-[#4f46e5] transition">
              Privacy Policy
            </Link>
            <Link to="https://www.getwebup.in/tos.php" className="hover:text-[#4f46e5] transition">
              T&amp;C
            </Link>
            <Link to="https://www.getwebup.in/refund.php" className="hover:text-[#4f46e5] transition">
              Refund Policy
            </Link>
            <Link to="https://www.getwebup.in/disclaimer.php" className="hover:text-[#4f46e5] transition">
              Disclaimer
            </Link>
          </div>
        </div>

        {/* Mobile spacer (avoids bottom nav overlap) */}
        <div className="lg:hidden h-12" />
      </div>
    </footer>
  );
}
