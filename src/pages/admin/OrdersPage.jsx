import React, { useState } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { PlusCircle, X } from "lucide-react";

export default function ServersPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ip: "",
    location: "",
    node: "",
    token_id: "",
    token_secret: "",
  });

  const servers = [
    { id: "SRV-001", name: "Alpha", status: "Active", ip: "192.168.0.1", location: "Delhi", node: "Node-1", token_id: "ABC123" },
    { id: "SRV-002", name: "Beta", status: "Inactive", ip: "192.168.0.5", location: "Mumbai", node: "Node-2", token_id: "XYZ789" },
    { id: "SRV-003", name: "Gamma", status: "Maintenance", ip: "192.168.0.10", location: "Chennai", node: "Node-3", token_id: "LMN456" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-400 bg-green-400/10 border border-green-400/20";
      case "Inactive":
        return "text-red-400 bg-red-400/10 border border-red-400/20";
      case "Maintenance":
        return "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20";
      default:
        return "text-gray-400 bg-gray-700/10 border border-gray-700/30";
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Server Data:", formData);
    setShowModal(false);
    setFormData({ ip: "", location: "", node: "", token_id: "", token_secret: "" });
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
        <div className="overflow-x-auto rounded-2xl border border-indigo-900/30 shadow-lg shadow-indigo-900/20 mt-6">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-[#151c2f] text-gray-300 uppercase text-sm tracking-wider">
              <tr>
                <th className="py-3 px-6">Server ID</th>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">IP Address</th>
                <th className="py-3 px-6">Location</th>
                <th className="py-3 px-6">Node</th>
                <th className="py-3 px-6">Token ID</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server, index) => (
                <tr
                  key={server.id}
                  className={`border-t border-indigo-900/30 hover:bg-indigo-900/20 hover:shadow-lg hover:shadow-indigo-700/20 transition-all duration-300 ${
                    index % 2 === 0 ? "bg-[#141b2e]" : "bg-[#19223c]"
                  }`}
                >
                  <td className="py-4 px-6 font-medium text-indigo-300">{server.id}</td>
                  <td className="py-4 px-6 text-gray-200 font-semibold">{server.name}</td>
                  <td className="py-4 px-6 text-gray-300">{server.ip}</td>
                  <td className="py-4 px-6 text-gray-300">{server.location}</td>
                  <td className="py-4 px-6 text-gray-300">{server.node}</td>
                  <td className="py-4 px-6 text-gray-300">{server.token_id}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(server.status)}`}>
                      {server.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center space-x-3">
                    <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-green-500/30">
                      Add IPs
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-indigo-500/30">
                      Add ISOs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] p-8 rounded-2xl w-[400px] shadow-2xl border border-indigo-900/40 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-indigo-400">Add Server</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {["ip", "location", "node", "token_id", "token_secret"].map((field) => (
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
              ))}

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
