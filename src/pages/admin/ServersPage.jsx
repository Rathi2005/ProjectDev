import React from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { Server, Cpu, HardDrive, Activity } from "lucide-react";

export default function ServersPage() {
  const servers = [
    { id: "SRV-001", name: "Alpha", status: "Active", cpu: "72%", memory: "64%", storage: "120GB / 250GB" },
    { id: "SRV-002", name: "Beta", status: "Inactive", cpu: "0%", memory: "0%", storage: "50GB / 200GB" },
    { id: "SRV-003", name: "Gamma", status: "Maintenance", cpu: "-", memory: "-", storage: "180GB / 300GB" },
    { id: "SRV-004", name: "Delta", status: "Active", cpu: "53%", memory: "47%", storage: "90GB / 150GB" },
  ];

  const totalServers = servers.length;
  const activeServers = servers.filter((s) => s.status === "Active").length;
  const inactiveServers = servers.filter((s) => s.status === "Inactive").length;
  const maintenanceServers = servers.filter((s) => s.status === "Maintenance").length;

  const insights = [
    { title: "Total Servers", value: totalServers, icon: <Server className="w-6 h-6 text-indigo-400" /> },
    { title: "Active Servers", value: activeServers, icon: <Activity className="w-6 h-6 text-green-400" /> },
    { title: "Inactive Servers", value: inactiveServers, icon: <Cpu className="w-6 h-6 text-red-400" /> },
    { title: "Under Maintenance", value: maintenanceServers, icon: <HardDrive className="w-6 h-6 text-yellow-400" /> },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-400 bg-green-400/10";
      case "Inactive":
        return "text-red-400 bg-red-400/10";
      case "Maintenance":
        return "text-yellow-400 bg-yellow-400/10";
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

      {/* Main */}
      <main className="flex-1 mt-[72px] p-10 space-y-8">
        <h1 className="text-3xl font-bold mb-4 tracking-wide">Servers</h1>

        {/* Insights Section */}
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

        {/* Server Table */}
        <div className="overflow-x-auto rounded-2xl border border-indigo-900/30 shadow-lg shadow-indigo-900/20 mt-6">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-[#151c2f] text-gray-300 uppercase text-sm tracking-wider">
              <tr>
                <th className="py-3 px-6">Server ID</th>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">CPU Usage</th>
                <th className="py-3 px-6">Memory Usage</th>
                <th className="py-3 px-6">Storage</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server) => (
                <tr
                  key={server.id}
                  className="border-t border-indigo-900/30 hover:bg-indigo-900/20 hover:shadow-lg hover:shadow-indigo-700/20 transition-all duration-300"
                >
                  <td className="py-4 px-6 font-medium text-indigo-300">{server.id}</td>
                  <td className="py-4 px-6">{server.name}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(server.status)}`}>
                      {server.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">{server.cpu}</td>
                  <td className="py-4 px-6">{server.memory}</td>
                  <td className="py-4 px-6">{server.storage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
