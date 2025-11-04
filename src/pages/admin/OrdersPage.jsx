import React, { useState } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { Package, CheckCircle, Clock, XCircle } from "lucide-react";

export default function OrdersPage() {
  // Dummy Orders Data
  const orders = [
    { id: "#ORD-001", customer: "Rohit Sharma", date: "10 Feb, 2024", serverType: "Shared vCPU", os: "Ubuntu 24.04", status: "Active", price: "$15/mo", region: "Helsinki", duration: "1 Month", plan: "Basic", ip: "192.168.1.10" },
    { id: "#ORD-002", customer: "Neha Verma", date: "12 Feb, 2024", serverType: "Dedicated vCPU", os: "Debian 13", status: "Pending", price: "$25/mo", region: "Singapore", duration: "3 Months", plan: "Pro", ip: "192.168.1.12" },
    { id: "#ORD-003", customer: "Aman Singh", date: "14 Feb, 2024", serverType: "Shared vCPU", os: "Rocky Linux 10", status: "Cancelled", price: "$12/mo", region: "Ashburn, VA", duration: "1 Month", plan: "Basic", ip: "192.168.1.14" },
    { id: "#ORD-004", customer: "Priya Mehta", date: "16 Feb, 2024", serverType: "Dedicated vCPU", os: "CentOS Stream 10", status: "Active", price: "$35/mo", region: "Falkenstein", duration: "6 Months", plan: "Enterprise", ip: "192.168.1.16" },
    { id: "#ORD-005", customer: "Anuj Kumar", date: "18 Feb, 2024", serverType: "Shared vCPU", os: "Fedora 42", status: "Expired", price: "$10/mo", region: "Nuremberg", duration: "1 Month", plan: "Starter", ip: "192.168.1.18" },
    { id: "#ORD-006", customer: "Riya Sen", date: "20 Feb, 2024", serverType: "Shared vCPU", os: "Ubuntu 24.04", status: "Pending", price: "$12/mo", region: "Mumbai", duration: "3 Months", plan: "Basic", ip: "192.168.1.20" },
    { id: "#ORD-007", customer: "Arjun Patel", date: "22 Feb, 2024", serverType: "Dedicated vCPU", os: "Fedora 42", status: "Active", price: "$40/mo", region: "New York", duration: "6 Months", plan: "Pro", ip: "192.168.1.22" },
  ];

  // Pagination Setup
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Insights
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => o.status === "Active").length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled" || o.status === "Expired").length;

  const insights = [
    { title: "Total Orders", value: totalOrders, icon: <Package className="w-6 h-6 text-indigo-400" /> },
    { title: "Active Orders", value: activeOrders, icon: <CheckCircle className="w-6 h-6 text-green-400" /> },
    { title: "Pending Orders", value: pendingOrders, icon: <Clock className="w-6 h-6 text-yellow-400" /> },
    { title: "Cancelled / Expired", value: cancelledOrders, icon: <XCircle className="w-6 h-6 text-red-400" /> },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-400 bg-green-400/10";
      case "Pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "Cancelled":
        return "text-red-400 bg-red-400/10";
      case "Expired":
        return "text-orange-400 bg-orange-400/10";
      default:
        return "text-gray-400 bg-gray-700/10";
    }
  };

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      {/* Main Content */}
      <main className="flex-1 mt-[72px] p-4 sm:p-10 space-y-8">
        <h1 className="text-3xl font-bold mb-4 tracking-wide">Orders</h1>

        {/* Insights Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] border border-indigo-900/30 rounded-2xl p-5 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-400 text-sm">{insight.title}</h3>
                  <p className="text-3xl font-semibold mt-2 text-indigo-400 drop-shadow-sm">
                    {insight.value}
                  </p>
                </div>
                <div className="p-3 bg-[#0e1525] rounded-xl border border-indigo-900/40 shadow-inner">
                  {insight.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Responsive Scroll Table */}
        <div className="overflow-x-auto rounded-2xl border border-indigo-900/30 shadow-lg shadow-indigo-900/20 mt-6">
          <div className="min-w-[1000px]">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-[#151c2f] text-gray-300 uppercase tracking-wider text-xs sm:text-sm">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Order ID</th>
                  <th className="py-3 px-4 sm:px-6">Customer</th>
                  <th className="py-3 px-4 sm:px-6">Server Type</th>
                  <th className="py-3 px-4 sm:px-6">Operating System</th>
                  <th className="py-3 px-4 sm:px-6">Region</th>
                  <th className="py-3 px-4 sm:px-6">Plan</th>
                  <th className="py-3 px-4 sm:px-6">IP Address</th>
                  <th className="py-3 px-4 sm:px-6">Start Date</th>
                  <th className="py-3 px-4 sm:px-6">Duration</th>
                  <th className="py-3 px-4 sm:px-6">Price</th>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-indigo-900/30 hover:bg-indigo-900/20 hover:shadow-lg hover:shadow-indigo-700/20 transition-all duration-300 text-xs sm:text-sm"
                  >
                    <td className="py-3 px-4 sm:px-6 font-medium text-indigo-300 whitespace-nowrap">{order.id}</td>
                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">{order.customer}</td>
                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">{order.serverType}</td>
                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">{order.os}</td>
                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">{order.region}</td>
                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">{order.plan}</td>
                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">{order.ip}</td>
                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">{order.date}</td>
                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">{order.duration}</td>
                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">{order.price}</td>
                    <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
          <p className="text-sm text-gray-400">
            Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, orders.length)} of {orders.length} orders
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg border border-indigo-800 text-sm transition-all duration-200 ${
                currentPage === 1
                  ? "text-gray-500 border-gray-700 cursor-not-allowed"
                  : "text-indigo-400 hover:bg-indigo-800/20"
              }`}
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === i + 1
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-indigo-900/50 text-gray-400 hover:bg-indigo-900/20"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg border border-indigo-800 text-sm transition-all duration-200 ${
                currentPage === totalPages
                  ? "text-gray-500 border-gray-700 cursor-not-allowed"
                  : "text-indigo-400 hover:bg-indigo-800/20"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
