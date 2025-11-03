import React, { useState, useEffect } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { PlusCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ServersPage() {
  const [showModal, setShowModal] = useState(false);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    ip: "",
    location: "",
    node: "",
    token_id: "",
    token_secret: "",
  });
  const navigate = useNavigate();

  const FETCH_SERVERS = import.meta.env.VITE_ALL_SERVERS;

  // Fetch servers from backend
  useEffect(() => {
    const fetchServers = async () => {
      const token = localStorage.getItem("adminToken");
      setLoading(true);

      try {
        const res = await fetch(FETCH_SERVERS, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch servers:", res.status, res.statusText);
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log("Fetched servers:", data);
        setServers(data);
      } catch (err) {
        console.error("Error fetching servers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, [FETCH_SERVERS]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "Inactive":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      case "Maintenance":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      default:
        return "text-gray-400 bg-gray-700/10 border-gray-700/30";
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Server Data:", formData);
    setShowModal(false);
    setFormData({
      ip: "",
      location: "",
      node: "",
      token_id: "",
      token_secret: "",
    });
  };

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      {/* Main */}
      <main className="flex-1 mt-[72px] p-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-wide">Servers</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-indigo-600/30 transition-all duration-300"
          >
            <PlusCircle className="w-5 h-5" />
            Add Server
          </button>
        </div>

        {/* Server Table */}
        <div className="overflow-x-auto rounded-2xl border border-indigo-900/40 shadow-lg">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : servers.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-lg">
              No servers found.
            </div>
          ) : (
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-[#151c2f] text-gray-300 uppercase text-sm tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold text-sm border-b border-indigo-900/40">Server ID</th>
                  <th className="px-6 py-4 font-semibold text-sm border-b border-indigo-900/40">Name</th>
                  <th className="px-6 py-4 font-semibold text-sm border-b border-indigo-900/40">IP Address</th>
                  <th className="px-6 py-4 font-semibold text-sm border-b border-indigo-900/40">Location</th>
                  <th className="px-6 py-4 font-semibold text-sm border-b border-indigo-900/40">Node</th>
                  <th className="px-6 py-4 font-semibold text-sm border-b border-indigo-900/40">Token ID</th>
                  <th className="px-6 py-4 font-semibold text-sm border-b border-indigo-900/40">Status</th>
                  <th className="px-6 py-4 font-semibold text-sm border-b border-indigo-900/40 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {servers.map((server, index) => (
                  <tr
                    key={server.id}
                    className={`transition-all duration-300 ${
                      index % 2 === 0 ? "bg-[#141b2e]" : "bg-[#19223c]"
                    } hover:bg-indigo-900/20 hover:shadow-md hover:shadow-indigo-800/20`}
                  >
                    <td className="px-6 py-4 border-b border-indigo-900/30 text-indigo-300 font-semibold">{server.id || "—"}</td>
                    <td className="px-6 py-4 border-b border-indigo-900/30">{server.name || "—"}</td>
                    <td className="px-6 py-4 border-b border-indigo-900/30">{server.ip || "—"}</td>
                    <td className="px-6 py-4 border-b border-indigo-900/30">{server.location || "—"}</td>
                    <td className="px-6 py-4 border-b border-indigo-900/30">{server.node || "—"}</td>
                    <td className="px-6 py-4 border-b border-indigo-900/30">{server.tokenId || "—"}</td>
                    <td className="px-6 py-4 border-b border-indigo-900/30">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          server.status || "Inactive"
                        )}`}
                      >
                        {server.status || "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-indigo-900/30 text-center space-x-3">
                      <button
                        onClick={() => navigate(`/admin/servers/${server.id}/ips`)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-1 rounded-md transition-all duration-300 shadow-md"
                      >
                        Add IPs
                      </button>
                      <button
                        onClick={() => navigate(`/admin/servers/${server.id}/isos`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-1 rounded-md transition-all duration-300 shadow-md"
                      >
                        Add ISOs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Add Server Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] p-8 rounded-2xl w-[400px] shadow-2xl border border-indigo-900/40 relative">
            <form onSubmit={handleSubmit} className="space-y-4">
              {["ip", "location", "node", "token_id", "token_secret"].map(
                (field) => (
                  <div key={field}>
                    <label className="block text-sm text-gray-400 mb-1 capitalize">
                      {field.replace("_", " ")}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#0e1525] border border-indigo-900/40 text-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                )
              )}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-medium transition-all duration-300 mt-3"
              >
                Save Server
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
