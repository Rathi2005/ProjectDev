import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { PlusCircle, Loader2 } from "lucide-react";

export default function AddIPsPage() {
  const { id } = useParams();
  const [rows, setRows] = useState([{ ip: "", mac: "", is_in_use: false }]);
  const [existingIPs, setExistingIPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const addRow = () =>
    setRows([...rows, { ip: "", mac: "", is_in_use: false }]);

  const handleChange = (i, field, value) => {
    const newRows = [...rows];
    newRows[i][field] = value;
    setRows(newRows);
  };

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // ✅ Fetch all IPs for this server
  useEffect(() => {
    const fetchIPs = async () => {
      const token = localStorage.getItem("adminToken");
      try {
        const res = await fetch(`${BASE_URL}/admin/servers/${id}/ips`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch IPs");
        const data = await res.json();
        setExistingIPs(data || []);
      } catch (err) {
        console.error("Error fetching IPs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIPs();
  }, [BASE_URL, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");

    try {
      for (const row of rows) {
        const res = await fetch(`${BASE_URL}/admin/servers/${id}/ips`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ip: row.ip,
            mac: row.mac,
          }),
        });

        if (!res.ok) throw new Error("Failed to add IP");
      }

      alert("IPs added successfully!");
    } catch (err) {
      console.error("Error adding IPs:", err);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(existingIPs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedIPs = existingIPs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      <main className="flex-1 mt-[72px] p-10 space-y-8">
        <h1 className="text-3xl font-bold tracking-wide mb-6">
          Manage IPs for Server #{id}
        </h1>

        {/* Add IPs Form */}
        <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] rounded-2xl p-6 shadow-2xl border border-indigo-900/40">
          <form onSubmit={handleSubmit}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#151c2f] text-gray-300 uppercase text-sm tracking-wider">
                <tr>
                  <th className="px-6 py-3 border-b border-indigo-900/40">
                    IP Address
                  </th>
                  <th className="px-6 py-3 border-b border-indigo-900/40">
                    MAC Address
                  </th>
                  <th className="px-6 py-3 border-b border-indigo-900/40">
                    In Use
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className={`transition-all duration-300 ${
                      i % 2 === 0 ? "bg-[#141b2e]" : "bg-[#19223c]"
                    } hover:bg-indigo-900/20`}
                  >
                    <td className="px-6 py-3 border-b border-indigo-900/30">
                      <input
                        type="text"
                        value={row.ip}
                        onChange={(e) => handleChange(i, "ip", e.target.value)}
                        placeholder="Enter IP"
                        required
                        className="w-full bg-[#0e1525] border border-indigo-900/40 text-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-3 border-b border-indigo-900/30">
                      <input
                        type="text"
                        value={row.mac}
                        onChange={(e) => handleChange(i, "mac", e.target.value)}
                        placeholder="Enter MAC"
                        required
                        className="w-full bg-[#0e1525] border border-indigo-900/40 text-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-3 border-b border-indigo-900/30 text-center">
                      <input
                        type="checkbox"
                        checked={row.is_in_use}
                        onChange={(e) =>
                          handleChange(i, "is_in_use", e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Buttons */}
            <div className="flex justify-between items-center mt-6">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl shadow-md hover:shadow-indigo-600/30 transition-all duration-300"
              >
                Save IPs
              </button>
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-md transition-all duration-300"
              >
                <PlusCircle className="w-5 h-5" />
                Add Row
              </button>
            </div>
          </form>
        </div>

        {/* Existing IPs */}
        <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] rounded-2xl p-6 shadow-2xl border border-indigo-900/40">
          <h2 className="text-2xl font-semibold text-indigo-400 mb-4">
            Existing IPs
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : existingIPs.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              No IPs found for this server.
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#151c2f] text-gray-300 uppercase text-sm tracking-wider">
                  <tr>
                    <th className="px-6 py-3 border-b border-indigo-900/40">
                      ID
                    </th>
                    <th className="px-6 py-3 border-b border-indigo-900/40">
                      IP
                    </th>
                    <th className="px-6 py-3 border-b border-indigo-900/40">
                      MAC
                    </th>
                    <th className="px-6 py-3 border-b border-indigo-900/40 text-center">
                      In Use
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedIPs.map((ip, index) => (
                    <tr
                      key={ip.id}
                      className={`transition-all duration-300 ${
                        index % 2 === 0 ? "bg-[#141b2e]" : "bg-[#19223c]"
                      } hover:bg-indigo-900/20`}
                    >
                      <td className="px-6 py-3 border-b border-indigo-900/30 text-indigo-300 font-semibold">
                        {ip.id}
                      </td>
                      <td className="px-6 py-3 border-b border-indigo-900/30">
                        {ip.ip}
                      </td>
                      <td className="px-6 py-3 border-b border-indigo-900/30">
                        {ip.mac}
                      </td>
                      <td className="px-6 py-3 border-b border-indigo-900/30 text-center">
                        {ip.is_in_use ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-end mt-6 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-md border border-indigo-800 text-sm transition-all duration-300 ${
                      currentPage === i + 1
                        ? "bg-indigo-600 text-white"
                        : "bg-[#1a2035] text-gray-300 hover:bg-indigo-700/40"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
