import React, { useState, useEffect } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { PlusCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ServersPage() {
  const [showModal, setShowModal] = useState(false);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // ✅ separate submit state

  const [formData, setFormData] = useState({
    name: "",
    ip: "",
    location: "",
    node: "",
    port: 8006,
    networkBridge: "vmbr0",
    tokenId: "",
    tokenSecret: "",
  });

  const navigate = useNavigate();
  const FETCH_SERVERS = import.meta.env.VITE_SERVERS;
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Fetch servers (GET)
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
          return;
        }

        const data = await res.json();
        const serversWithCounts = data.map((srv) => ({
          ...srv,
          vmCount: null,
        }));
        setServers(serversWithCounts);

        serversWithCounts.forEach((srv) => {
          if (srv.id) fetchVmCount(srv.id, token);
        });
      } catch (err) {
        console.error("Error fetching servers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, [FETCH_SERVERS]);

  // Fetch VM count per server
  const fetchVmCount = async (serverId, token) => {
    try {
      const res = await fetch(
        `${BASE_URL}/admin/servers/${serverId}/vms/counts`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        setServers((prev) =>
          prev.map((srv) =>
            srv.id === serverId ? { ...srv, vmCount: 0 } : srv
          )
        );
        return;
      }

      const data = await res.json();
      const count = data?.total ?? data?.count ?? 0;

      setServers((prev) =>
        prev.map((srv) =>
          srv.id === serverId ? { ...srv, vmCount: count } : srv
        )
      );
    } catch (err) {
      console.error(`Error fetching VM count for server ${serverId}:`, err);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    setSubmitting(true);

    try {
      const res = await fetch(FETCH_SERVERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          ip: formData.ip,
          location: formData.location,
          node: formData.node,
          port: Number(formData.port) || 8006,
          networkBridge: formData.networkBridge || "vmbr0",
          tokenId: formData.tokenId,
          tokenSecret: formData.tokenSecret,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert(`❌ Failed to add server: ${res.status} ${errorText}`);
        console.error("Failed to add server:", res.status, errorText);
        return;
      }

      const newServer = await res.json();
      setServers((prev) => [...prev, { ...newServer, vmCount: 0 }]);
      setShowModal(false);
      alert("✅ Server added successfully!");

      // reset with defaults
      setFormData({
        name: "",
        ip: "",
        location: "",
        node: "",
        port: 8006,
        networkBridge: "vmbr0",
        tokenId: "",
        tokenSecret: "",
      });
    } catch (err) {
      alert("Error adding server!");
      console.error("Error adding server:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      {/* Main */}
      <main className="flex-1 mt-[72px] p-4 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-wide">Servers</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-indigo-600/30 transition-all duration-300 text-sm sm:text-base"
          >
            <PlusCircle className="w-5 h-5" />
            Add Server
          </button>
        </div>

        {/* Table */}
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
            <div className="w-full min-w-[900px]">
              <table className="w-full text-left border-collapse text-sm sm:text-base">
                <thead className="bg-[#151c2f] text-gray-300 uppercase tracking-wider text-xs sm:text-sm">
                  <tr>
                    <th className="px-4 py-3 sm:px-6">Server ID</th>
                    <th className="px-4 py-3 sm:px-6">Name</th>
                    <th className="px-4 py-3 sm:px-6">IP</th>
                    <th className="px-4 py-3 sm:px-6">Location</th>
                    <th className="px-4 py-3 sm:px-6">Node</th>
                    <th className="px-4 py-3 sm:px-6">Token ID</th>
                    <th className="px-4 py-3 sm:px-6 text-center">VMs</th>
                    <th className="px-4 py-3 sm:px-6">Status</th>
                    <th className="px-4 py-3 sm:px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {servers.map((server, index) => (
                    <tr
                      key={server.id || index}
                      className={`${
                        index % 2 === 0 ? "bg-[#141b2e]" : "bg-[#19223c]"
                      } hover:bg-indigo-900/20 transition-all duration-300`}
                    >
                      <td className="px-4 py-3 sm:px-6 text-indigo-300 font-semibold whitespace-nowrap">
                        {server.id || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                        {server.name || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                        {server.ip || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                        {server.location || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                        {server.node || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                        {server.tokenId || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 text-center whitespace-nowrap">
                        {server.vmCount === null ? (
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-400 inline" />
                        ) : (
                          <button
                            onClick={() =>
                              navigate(`/admin/servers/${server.id}/vms`)
                            }
                            className="flex items-center justify-center gap-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white font-semibold px-3 py-1 rounded-full transition-all duration-300 text-xs shadow-sm hover:shadow-indigo-700/30"
                          >
                            <span>{server.vmCount ?? "—"}</span>
                            <span className="text-[10px] opacity-80">VMs</span>
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            server.status || "Inactive"
                          )}`}
                        >
                          {server.status || "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-6 text-center whitespace-nowrap">
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <button
                            onClick={() =>
                              navigate(`/admin/servers/${server.id}/ips`)
                            }
                            className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-4 py-1 rounded-md transition-all duration-300"
                          >
                            Add IPs
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/servers/${server.id}/isos`)
                            }
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm px-4 py-1 rounded-md transition-all duration-300"
                          >
                            Add ISOs
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/servers/${server.id}/disks`)
                            }
                            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm px-4 py-1 rounded-md transition-all duration-300"
                          >
                            Add Disk
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ✅ Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <div className="relative bg-[#111827] border border-indigo-800/40 rounded-2xl shadow-2xl w-[92%] max-w-2xl p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-indigo-300 mb-6 flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-indigo-400" />
              Add New Server
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Server Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Server Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Production Server"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* IP + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    name="ip"
                    placeholder="e.g. 192.168.0.10"
                    value={formData.ip}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Singapore Data Center"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Node + Port */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Node
                  </label>
                  <input
                    type="text"
                    name="node"
                    placeholder="e.g. Node-01"
                    value={formData.node}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    name="port"
                    placeholder="8006"
                    value={formData.port}
                    onChange={handleChange}
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Network Bridge + Token Secret (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Network Bridge
                  </label>
                  <input
                    type="text"
                    name="networkBridge"
                    placeholder="vmbr0"
                    value={formData.networkBridge}
                    onChange={handleChange}
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Token Secret
                  </label>
                  <input
                    type="password"
                    name="tokenSecret"
                    placeholder="Enter Token Secret"
                    value={formData.tokenSecret}
                    onChange={handleChange}
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Token ID (below) */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Token ID
                </label>
                <input
                  type="text"
                  name="tokenId"
                  placeholder="Enter API Token ID"
                  value={formData.tokenId}
                  onChange={handleChange}
                  className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-indigo-900/40 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" /> Add Server
                    </>
                  )}
                </button>
              </div>
            </form>

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-6 text-gray-400 hover:text-red-400 transition-colors text-xl"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
