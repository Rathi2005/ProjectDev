import React, { useState } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";

export default function InvoicesPage() {
  // Dummy invoice data
  const invoices = [
    { id: "#INV-001", customer: "Rohit Sharma", date: "10 Feb, 2024", amount: "$120.00", status: "Paid", paymentMethod: "Credit Card", server: "Server A", dueDate: "15 Feb, 2024" },
    { id: "#INV-002", customer: "Neha Verma", date: "12 Feb, 2024", amount: "$89.00", status: "Pending", paymentMethod: "UPI", server: "Server B", dueDate: "17 Feb, 2024" },
    { id: "#INV-003", customer: "Aman Singh", date: "14 Feb, 2024", amount: "$250.00", status: "Overdue", paymentMethod: "Bank Transfer", server: "Server C", dueDate: "20 Feb, 2024" },
    { id: "#INV-004", customer: "Priya Mehta", date: "16 Feb, 2024", amount: "$175.00", status: "Paid", paymentMethod: "Debit Card", server: "Server D", dueDate: "22 Feb, 2024" },
    { id: "#INV-005", customer: "Anuj Kumar", date: "18 Feb, 2024", amount: "$300.00", status: "Cancelled", paymentMethod: "UPI", server: "Server E", dueDate: "25 Feb, 2024" },
    { id: "#INV-006", customer: "Riya Sen", date: "20 Feb, 2024", amount: "$210.00", status: "Pending", paymentMethod: "Credit Card", server: "Server F", dueDate: "27 Feb, 2024" },
    { id: "#INV-007", customer: "Arjun Patel", date: "22 Feb, 2024", amount: "$150.00", status: "Overdue", paymentMethod: "Debit Card", server: "Server G", dueDate: "01 Mar, 2024" },
  ];

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInvoices = invoices.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Insights
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === "Paid").length;
  const pendingInvoices = invoices.filter((i) => i.status === "Pending").length;
  const overdueInvoices = invoices.filter((i) => i.status === "Overdue").length;
  const cancelledInvoices = invoices.filter((i) => i.status === "Cancelled").length;

  const insights = [
    { title: "Total Invoices", value: totalInvoices, icon: <FileText className="w-6 h-6 text-indigo-400" /> },
    { title: "Paid Invoices", value: paidInvoices, icon: <CheckCircle className="w-6 h-6 text-green-400" /> },
    { title: "Pending Invoices", value: pendingInvoices, icon: <Clock className="w-6 h-6 text-yellow-400" /> },
    { title: "Overdue / Cancelled", value: overdueInvoices + cancelledInvoices, icon: <XCircle className="w-6 h-6 text-red-400" /> },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "text-green-400 bg-green-400/10";
      case "Pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "Overdue":
        return "text-orange-400 bg-orange-400/10";
      case "Cancelled":
        return "text-red-400 bg-red-400/10";
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
      <main className="flex-1 mt-[72px] p-6 sm:p-10 space-y-8">
        <h1 className="text-3xl font-bold mb-4 tracking-wide">Invoices</h1>

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

        {/* Invoice Table */}
        <div className="overflow-x-auto rounded-2xl border border-indigo-900/30 shadow-lg shadow-indigo-900/20 mt-6">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-[#151c2f] text-gray-300 uppercase text-sm tracking-wider">
              <tr>
                <th className="py-3 px-6">Invoice ID</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Server</th>
                <th className="py-3 px-6">Issue Date</th>
                <th className="py-3 px-6">Due Date</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Payment Method</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-t border-indigo-900/30 hover:bg-indigo-900/20 hover:shadow-lg hover:shadow-indigo-700/20 transition-all duration-300"
                >
                  <td className="py-4 px-6 font-medium text-indigo-300">{invoice.id}</td>
                  <td className="py-4 px-6">{invoice.customer}</td>
                  <td className="py-4 px-6">{invoice.server}</td>
                  <td className="py-4 px-6">{invoice.date}</td>
                  <td className="py-4 px-6">{invoice.dueDate}</td>
                  <td className="py-4 px-6">{invoice.amount}</td>
                  <td className="py-4 px-6">{invoice.paymentMethod}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
          <p className="text-sm text-gray-400">
            Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, invoices.length)} of {invoices.length} invoices
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
