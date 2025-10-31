import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import Footer from "../user/Footer";

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0e1420] text-white flex flex-col">
      {/* Header */}
      <AdminHeader title="Admin Dashboard" onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#1d2438] p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-2">👥 Manage Users</h2>
          <p className="text-gray-400 text-sm">View and manage registered users.</p>
        </div>

        <div className="bg-[#1d2438] p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-2">📦 Product Listings</h2>
          <p className="text-gray-400 text-sm">Monitor all items and listings.</p>
        </div>

        <div className="bg-[#1d2438] p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-2">📊 Reports</h2>
          <p className="text-gray-400 text-sm">Generate usage or sales reports.</p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
