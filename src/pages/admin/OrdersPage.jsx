import React from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { ShoppingCart, Server, XCircle, Clock } from "lucide-react"; // icons

export default function OrdersPage() {
  // Dummy order data for server occupancy
  const orders = [
    { id: "#2001", server: "Server A", customer: "Wade Warren", date: "11 Feb, 2024", duration: "3 hrs", cpu: "70%", memory: "60%", status: "Active", payment: "Pending" },
    { id: "#2002", server: "Server B", customer: "Esther Howard", date: "13 Feb, 2024", duration: "5 hrs", cpu: "85%", memory: "78%", status: "Cancelled", payment: "Success" },
    { id: "#2003", server: "Server C", customer: "Jenny Wilson", date: "15 Feb, 2024", duration: "2 hrs", cpu: "55%", memory: "50%", status: "Active", payment: "Success" },
    { id: "#2004", server: "Server D", customer: "Guy Hawkins", date: "17 Feb, 2024", duration: "6 hrs", cpu: "92%", memory: "81%", status: "Cancelled", payment: "Success" },
    { id: "#2006", server: "Server F", customer: "Kristin Watson", date: "21 Feb, 2024", duration: "7 hrs", cpu: "88%", memory: "76%", status: "Cancelled", payment: "Success" },
  ];

  // Dynamic insights
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => o.status === "Active").length;
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;
  const pendingPayments = orders.filter((o) => o.payment === "Pending").length;

  const insights = [
    { title: "Total Orders", value: totalOrders, icon: <ShoppingCart className="w-6 h-6 text-indigo-400" /> },
    { title: "Active Servers", value: activeOrders, icon: <Server className="w-6 h-6 text-green-400" /> },
    { title: "Cancelled Servers", value: cancelledOrders, icon: <XCircle className="w-6 h-6 text-red-400" /> },
    { title: "Pending Payments", value: pendingPayments, icon: <Clock className="w-6 h-6 text-yellow-400" /> },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-yellow-400 bg-yellow-400/10";
      case "Cancelled":
        return "text-red-400 bg-red-400/10";
      case "Pending":
        return "text-orange-400 bg-orange-400/10";
      case "Success":
        return "text-green-400 bg-green-400/10";
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
      <main className="flex-1 mt-[72px] p-10 space-y-8">
        <h1 className="text-3xl font-bold mb-4 tracking-wide">Orders</h1>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-indigo-900/30 shadow-lg shadow-indigo-900/20 mt-6">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-[#151c2f] text-gray-300 uppercase text-sm tracking-wider">
              <tr>
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-6">Server</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Duration</th>
                <th className="py-3 px-6">CPU Usage</th>
                <th className="py-3 px-6">Memory Usage</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-indigo-900/30 hover:bg-indigo-900/20 hover:shadow-lg hover:shadow-indigo-700/20 transition-all duration-300"
                >
                  <td className="py-4 px-6 font-medium text-indigo-300">{order.id}</td>
                  <td className="py-4 px-6">{order.server}</td>
                  <td className="py-4 px-6">{order.customer}</td>
                  <td className="py-4 px-6">{order.date}</td>
                  <td className="py-4 px-6">{order.duration}</td>
                  <td className="py-4 px-6">{order.cpu}</td>
                  <td className="py-4 px-6">{order.memory}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.payment)}`}>
                      {order.payment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  );
}
  