import React, { useState, useEffect } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { PlusCircle, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ServersPage() {
  const [showModal, setShowModal] = useState(false);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    ip: "",
    location: "",
    node: "",
    token_id: "",
    token_secret: "",
  });
  const navigate = useNavigate();

  const FETCH_SERVERS = import.meta.env.VITE_SERVERS;

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

  // POST request when form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");

    try {
      const res = await fetch(FETCH_SERVERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        console.error("Failed to add server:", res.status, res.statusText);
        return;
      }

      const newServer = await res.json();
      setServers((prev) => [...prev, newServer]); // Add new server to list
      setShowModal(false);
      setFormData({
        name: "",
        ip: "",
        location: "",
        node: "",
        tokenId: "",
        tokenSecret: "",
      });
    } catch (err) {
      console.error("Error adding server:", err);
    }
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
                  <th className="px-6 py-4 border-b border-indigo-900/40">
                    Server ID
                  </th>
                  <th className="px-6 py-4 border-b border-indigo-900/40">
                    Name
                  </th>
                  <th className="px-6 py-4 border-b border-indigo-900/40">
                    IP
                  </th>
                  <th className="px-6 py-4 border-b border-indigo-900/40">
                    Location
                  </th>
                  <th className="px-6 py-4 border-b border-indigo-900/40">
                    Node
                  </th>
                  <th className="px-6 py-4 border-b border-indigo-900/40">
                    Token ID
                  </th>
                  <th className="px-6 py-4 border-b border-indigo-900/40">
                    Status
                  </th>
                  <th className="px-6 py-4 border-b border-indigo-900/40 text-center">
                    Actions
                  </th>
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
                    <td className="px-6 py-4 border-b border-indigo-900/30 text-indigo-300 font-semibold">
                      {server.id || "—"}
                    </td>
                    <td className="px-6 py-4 border-b border-indigo-900/30">
                      {server.name || "—"}
                    </td>
                    <td className="px-6 py-4 border-b border-indigo-900/30">
                      {server.ip || "—"}
                    </td>
                    <td className="px-6 py-4 border-b border-indigo-900/30">
                      {server.location || "—"}
                    </td>
                    <td className="px-6 py-4 border-b border-indigo-900/30">
                      {server.node || "—"}
                    </td>
                    <td className="px-6 py-4 border-b border-indigo-900/30">
                      {server.tokenId || "—"}
                    </td>
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
                        onClick={() =>
                          navigate(`/admin/servers/${server.id}/ips`)
                        }
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-1 rounded-md"
                      >
                        Add IPs
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/servers/${server.id}/isos`)
                        }
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-1 rounded-md"
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
          <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] p-4 rounded-2xl w-[500px] shadow-2xl border border-indigo-900/40 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <form
              onSubmit={handleSubmit}
              className="mt-4 bg-[#0e1525]/60 p-6 rounded-2xl border border-indigo-900/40 shadow-[0_0_25px_-8px_rgba(99,102,241,0.5)] backdrop-blur-md space-y-5 max-w-5xl mx-auto"
            >
              <h2 className="text-center text-2xl font-semibold text-indigo-400 mb-2">
                Add New Server
              </h2>

              {/* Server Name - full width */}
              <div>
                <label className="block text-sm text-gray-400 font-medium mb-1">
                  Server Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter Server Name"
                  className="w-full bg-[#141b2e] border border-indigo-900/40 text-gray-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 placeholder-gray-500"
                />
              </div>

              {/* Location + IP side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 font-medium mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Enter Location"
                    className="w-full bg-[#141b2e] border border-indigo-900/40 text-gray-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 font-medium mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    name="ip"
                    value={formData.ip}
                    onChange={handleChange}
                    required
                    placeholder="Enter IP Address"
                    className="w-full bg-[#141b2e] border border-indigo-900/40 text-gray-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Remaining full-width fields */}
              {[
                { name: "node", label: "Node" },
                { name: "tokenId", label: "Token ID" },
                { name: "tokenSecret", label: "Token Secret" },
              ].map((field, i) => (
                <div key={i}>
                  <label className="block text-sm text-gray-400 font-medium mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                    placeholder={`Enter ${field.label}`}
                    className="w-full bg-[#141b2e] border border-indigo-900/40 text-gray-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 placeholder-gray-500"
                  />
                </div>
              ))}

              {/* Buttons */}
              <div className="flex gap-3 mt-6 justify-center">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.8)]"
                >
                  Save Server
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-700 hover:bg-gray-800 text-gray-300 py-2.5 px-6 rounded-xl font-semibold transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
