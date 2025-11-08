import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { PlusCircle, Loader2 } from "lucide-react";

export default function ManageResourcesPage({
  title,
  endpoint,
  fields,
  showExisting = true,
  extraForm = null,
}) {
  const { id } = useParams();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [rows, setRows] = useState([
    Object.fromEntries(fields.map((f) => [f.name, ""])),
  ]);
  const [existing, setExisting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [maxStorage, setMaxStorage] = useState("");
  const [maxVMs, setMaxVMs] = useState("");

  const addRow = () =>
    setRows([...rows, Object.fromEntries(fields.map((f) => [f.name, ""]))]);

  const handleChange = (i, field, value) => {
    const newRows = [...rows];
    newRows[i][field] = value;
    setRows(newRows);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("adminToken");
      try {
        const res = await fetch(`${BASE_URL}/admin/servers/${id}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch data");
        setExisting(await res.json());
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [BASE_URL, endpoint, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    setSaving(true);
    try {
      for (const row of rows) {
        const res = await fetch(`${BASE_URL}/admin/servers/${id}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...row, server_id: id }),
        });
        if (!res.ok) throw new Error("Failed to add item");
      }

      alert(`${title} added successfully!`);

      // ✅ Clear input fields after saving
      setRows([Object.fromEntries(fields.map((f) => [f.name, ""]))]);

      // Refresh existing data
      const res = await fetch(`${BASE_URL}/admin/servers/${id}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExisting(await res.json());
    } catch (err) {
      console.error("Error adding:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDiskConfigSave = async () => {
    const token = localStorage.getItem("adminToken");
    setConfigSaving(true);
    try {
      const res = await fetch(
        `${BASE_URL}/admin/servers/${id}/resource-limits`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            maxVms: Number(maxVMs),
            maxDiskSize: Number(maxStorage),
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to save disk config");

      alert("Disk configuration saved successfully!");

      // ✅ Clear the disk config input fields after saving
      setMaxStorage("");
      setMaxVMs("");
    } catch (err) {
      console.error("Error saving disk config:", err);
    } finally {
      setConfigSaving(false);
    }
  };

  const totalPages = Math.ceil(existing.length / itemsPerPage);
  const displayed = existing.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      <main className="flex-1 mt-[72px] p-10 space-y-8">
        <h1 className="text-3xl font-bold tracking-wide mb-6">
          {title} for Server #{id}
        </h1>

        {/* Disk Config Section */}
        {extraForm === "disks" && (
          <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] rounded-2xl p-6 shadow-2xl border border-indigo-900/40">
            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">
              Disk Configuration
            </h2>
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#151c2f] text-gray-300 uppercase text-sm tracking-wider">
                <tr>
                  <th className="px-6 py-3 border-b border-indigo-900/40">
                    Max Storage (GB)
                  </th>
                  <th className="px-6 py-3 border-b border-indigo-900/40">
                    Max VMs
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#141b2e]">
                  <td className="px-6 py-3 border-b border-indigo-900/30">
                    <input
                      type="number"
                      value={maxStorage}
                      onChange={(e) => setMaxStorage(e.target.value)}
                      placeholder="Enter Max Storage"
                      className="w-full bg-[#0e1525] border border-indigo-900/40 text-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-3 border-b border-indigo-900/30">
                    <input
                      type="number"
                      value={maxVMs}
                      onChange={(e) => setMaxVMs(e.target.value)}
                      placeholder="Enter Max VMs"
                      className="w-full bg-[#0e1525] border border-indigo-900/40 text-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleDiskConfigSave}
                disabled={configSaving}
                className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-white shadow-md transition-all duration-300 ${
                  configSaving
                    ? "bg-blue-700 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {configSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Disk Config"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Resource Add Form */}
        <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] rounded-2xl p-6 shadow-2xl border border-indigo-900/40">
          <form onSubmit={handleSubmit}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#151c2f] text-gray-300 uppercase text-sm tracking-wider">
                <tr>
                  {fields.map((f) => (
                    <th
                      key={f.name}
                      className="px-6 py-3 border-b border-indigo-900/40"
                    >
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-[#141b2e]" : "bg-[#19223c]"}
                  >
                    {fields.map((f) => (
                      <td
                        key={f.name}
                        className="px-6 py-3 border-b border-indigo-900/30"
                      >
                        {f.type === "checkbox" ? (
                          <input
                            type="checkbox"
                            checked={row[f.name]}
                            onChange={(e) =>
                              handleChange(i, f.name, e.target.checked)
                            }
                            className="w-5 h-5 accent-indigo-600"
                          />
                        ) : (
                          <input
                            type={f.type}
                            value={row[f.name]}
                            onChange={(e) =>
                              handleChange(i, f.name, e.target.value)
                            }
                            placeholder={`Enter ${f.label}`}
                            required
                            className="w-full bg-[#0e1525] border border-indigo-900/40 text-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-6">
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-white shadow-md transition-all duration-300 ${
                  saving
                    ? "bg-indigo-700 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
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

        {/* Existing Entries */}
        {showExisting && (
          <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] rounded-2xl p-6 shadow-2xl border border-indigo-900/40">
            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">
              Existing Entries
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                No records found.
              </div>
            ) : (
              <>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#151c2f] text-gray-300 uppercase text-sm tracking-wider">
                    <tr>
                      {Object.keys(displayed[0]).map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 border-b border-indigo-900/40"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((item, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? "bg-[#141b2e]" : "bg-[#19223c]"
                        }
                      >
                        {Object.values(item).map((val, j) => (
                          <td
                            key={j}
                            className="px-6 py-3 border-b border-indigo-900/30"
                          >
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end mt-6 space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-md border border-indigo-800 text-sm ${
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
        )}
      </main>

      <Footer />
    </div>
  );
}

