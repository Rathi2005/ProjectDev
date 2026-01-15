import React, { useEffect, useState } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { Server, PlayCircle, PauseCircle } from "lucide-react";
import { useParams } from "react-router-dom";

export default function VMsPage() {
  const { id } = useParams();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [vmData, setVmData] = useState([]);
  const [insights, setInsights] = useState({
    total: 0,
    running: 0,
    stopped: 0,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Fetch VM insights and list
  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch insights
        const insightsRes = await fetch(
          `${BASE_URL}/api/admin/servers/${id}/vms/counts`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const insightsJson = await insightsRes.json();
        setInsights({
          total: insightsJson.total || 0,
          running: insightsJson.running || 0,
          stopped: insightsJson.stopped || 0,
        });

        // Fetch VMs list
        const vmRes = await fetch(`${BASE_URL}/api/admin/servers/${id}/vms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const vmJson = await vmRes.json();
        setVmData(vmJson || []);
      } catch (error) {
        toast.error("Error fetching VMs");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [BASE_URL, id]);

  // Pagination logic
  const totalPages = Math.ceil(vmData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVMs = vmData.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "running":
        return "text-green-400 bg-green-400/10";
      case "stopped":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-700/10";
    }
  };

  const insightCards = [
    {
      title: "Total VMs",
      value: insights.total,
      icon: <Server className="w-6 h-6 text-indigo-400" />,
    },
    {
      title: "Running VMs",
      value: insights.running,
      icon: <PlayCircle className="w-6 h-6 text-green-400" />,
    },
    {
      title: "Stopped VMs",
      value: insights.stopped,
      icon: <PauseCircle className="w-6 h-6 text-red-400" />,
    },
  ];

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      {/* Main */}
      <main className="flex-1 mt-[72px] p-4 sm:p-10 space-y-8">
        <h1 className="text-3xl font-bold mb-4 tracking-wide">Virtual Machines for Server #{id}</h1>

        {/* Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {insightCards.map((insight, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] border border-indigo-900/30 
              rounded-2xl p-5 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 
              transition-all duration-300"
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
          {loading ? (
            <div className="text-center text-gray-400 py-10 text-lg">Loading VMs...</div>
          ) : currentVMs.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-lg">No VMs found.</div>
          ) : (
            <div className="min-w-[800px]">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="bg-[#151c2f] text-gray-300 uppercase tracking-wider text-xs sm:text-sm">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">VM ID</th>
                    <th className="py-3 px-4 sm:px-6">Name</th>
                    <th className="py-3 px-4 sm:px-6">Node</th>
                    <th className="py-3 px-4 sm:px-6">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentVMs.map((vm, i) => (
                    <tr
                      key={i}
                      className="border-t border-indigo-900/30 hover:bg-indigo-900/20 hover:shadow-lg 
                      hover:shadow-indigo-700/20 transition-all duration-300 text-xs sm:text-sm"
                    >
                      <td className="py-3 px-4 sm:px-6 text-indigo-300 font-medium whitespace-nowrap">
                        {vm.vmid || "—"}
                      </td>
                      <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                        {vm.name || "—"}
                      </td>
                      <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                        {vm.node || "—"}
                      </td>
                      <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            vm.status
                          )}`}
                        >
                          {vm.status || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && vmData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
            <p className="text-sm text-gray-400">
              Showing {startIndex + 1} -{" "}
              {Math.min(startIndex + itemsPerPage, vmData.length)} of{" "}
              {vmData.length} VMs
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
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
