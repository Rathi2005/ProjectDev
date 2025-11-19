import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

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
    Object.fromEntries(
      fields.map((f) => [f.name, f.type === "checkbox" ? false : ""])
    ),
  ]);

  const [existing, setExisting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const addRow = () =>
    setRows([
      ...rows,
      Object.fromEntries(
        fields.map((f) => [f.name, f.type === "checkbox" ? false : ""])
      ),
    ]);

  const handleChange = (i, field, value) => {
    const newRows = [...rows];
    newRows[i][field] = value;
    setRows(newRows);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("adminToken");
      try {
        const apiUrl =
          endpoint === "/ips"
            ? `${BASE_URL}/admin/zones/${id}/ips`
            : `${BASE_URL}/admin/servers/${id}${endpoint}`;

        const res = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const data = await res.json();
        setExisting(data);
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [BASE_URL, endpoint, id]);

  const reloadData = async () => {
    const token = localStorage.getItem("adminToken");

    try {
      const url =
        endpoint === "/ips"
          ? `${BASE_URL}/admin/zones/${id}/ips`
          : extraForm === "disks"
          ? `${BASE_URL}/admin/servers/${id}/disk-details`
          : `${BASE_URL}/admin/servers/${id}${endpoint}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const json = await res.json();
      setExisting(json);
    } catch (err) {
      console.error("Error in reloadData:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    setSaving(true);

    try {
      for (const row of rows) {
        let postUrl;
        let payload;

        if (endpoint === "/ips") {
          postUrl = `${BASE_URL}/admin/zones/${id}/ips`;
          payload = {
            ip: row.ip,
            mac: row.mac,
            inUse: row.inUse,
          };
        } else if (extraForm === "disks") {
          postUrl = `${BASE_URL}/admin/servers/${id}/storage`;
          payload = {
            diskName: row.diskName,
            maxVms: Number(row.maxVms),
            usableDiskPercentage: Number(row.usableDiskPercentage),
          };
        } else {
          postUrl = `${BASE_URL}/admin/servers/${id}${endpoint}`;
          payload = row;
        }

        const res = await fetch(postUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to add item");

        await res.json();
      }

      await reloadData();
      toast.success(`${title} added successfully!`);
    } catch (err) {
      toast.error("Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // 🚀 FINAL SWEETALERT VERSION FOR ALL EDIT PROMPTS
  // =========================================================
  const handleEdit = async (item) => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("No admin token found.");
      return;
    }

    try {
      // --------------------- IP EDIT ---------------------
      if (endpoint === "/ips") {
        // IP
        const { value: newIp } = await Swal.fire({
          title: "Edit IP Address",
          input: "text",
          inputValue: item.ip,
          confirmButtonText: "Next",
          showCancelButton: true,
          background: "#1e2640",
          color: "#fff",
        });
        if (!newIp) return;

        // MAC
        const { value: newMac } = await Swal.fire({
          title: "Edit MAC Address",
          input: "text",
          inputValue: item.mac,
          confirmButtonText: "Next",
          showCancelButton: true,
          background: "#1e2640",
          color: "#fff",
        });
        if (!newMac) return;

        // InUse
        const { isConfirmed: inUse } = await Swal.fire({
          title: "Mark as In Use?",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          background: "#1e2640",
          color: "#fff",
        });

        await fetch(`${BASE_URL}/admin/zones/${id}/ips/${item.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ip: newIp,
            mac: newMac,
            inUse,
          }),
        });

        await reloadData();
        toast.success("IP updated successfully!");
        return;
      }

      // --------------------- ISO EDIT ---------------------
      if (endpoint === "/isos") {
        const { value: newIso } = await Swal.fire({
          title: "Edit ISO Name",
          input: "text",
          inputValue: item.iso,
          confirmButtonText: "Next",
          showCancelButton: true,
          background: "#1e2640",
          color: "#fff",
        });
        if (!newIso) return;

        const { value: newVmid } = await Swal.fire({
          title: "Edit VMID",
          input: "text",
          inputValue: item.vmid,
          confirmButtonText: "Save",
          showCancelButton: true,
          background: "#1e2640",
          color: "#fff",
        });
        if (!newVmid) return;

        await fetch(`${BASE_URL}/admin/servers/${id}/isos/${item.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            iso: newIso,
            vmid: newVmid,
          }),
        });

        await reloadData();
        toast.success("ISO updated successfully!");
        return;
      }

      // --------------------- DISK EDIT ---------------------
      if (extraForm === "disks") {
        const diskId = item.id || item.ID || item.Id || item.storage_id;
        if (!diskId) {
          toast.error("Disk ID not found");
          return;
        }

        const { value: type } = await Swal.fire({
          title: "What do you want to edit?",
          input: "select",
          inputOptions: {
            vms: "Max VMs",
            percentage: "Usable Percentage",
          },
          inputPlaceholder: "Select field",
          confirmButtonText: "Next",
          showCancelButton: true,
          background: "#1e2640",
          color: "#fff",
        });

        if (!type) return;

        const { value: newVal } = await Swal.fire({
          title: "Enter new value",
          input: "number",
          confirmButtonText: "Save",
          showCancelButton: true,
          background: "#1e2640",
          color: "#fff",
        });

        if (newVal === null) return;

        let url = "";
        let body = {};

        if (type === "vms") {
          url = `${BASE_URL}/admin/servers/${id}/storage/${diskId}/max-vms`;
          body = { maxVms: Number(newVal) };
        } else {
          url = `${BASE_URL}/admin/servers/${id}/storage/${diskId}/percentage`;
          body = { usableDiskPercentage: Number(newVal) };
        }

        await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        await reloadData();
        toast.success("Disk updated successfully!");
        return;
      }
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  // ------------------ DELETE (UNCHANGED) ------------------
  const handleDelete = async (item) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return toast.error("No admin token");

    // 🔥 SweetAlert delete confirmation
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "#1e2640",
      color: "#fff",
      confirmButtonColor: "#e63946",
      cancelButtonColor: "#444",
    });

    if (!result.isConfirmed) return;

    try {
      let deleteUrl = "";

      if (endpoint === "/ips")
        deleteUrl = `${BASE_URL}/admin/zones/${id}/ips/${item.id}`;
      else if (endpoint === "/isos")
        deleteUrl = `${BASE_URL}/admin/servers/${id}/isos/${item.id}`; // fixed typo
      else if (extraForm === "disks")
        deleteUrl = `${BASE_URL}/admin/servers/${id}/storage/${item.id}`;

      await fetch(deleteUrl, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      await reloadData();
      toast.success("Item deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // UI Rendering (UNCHANGED)
  const totalPages = Math.ceil(existing.length / itemsPerPage);
  const displayed = existing.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      {/* Inject SweetAlert neon CSS (Option B: injected) */}
      <style>{`
        .swal2-confirm.swal2-confirm-glow {
          box-shadow: 0 0 12px rgba(76,139,255,0.8) !important;
        }
        /* Better input look for the swal2-input/select in premium theme */
        .swal2-input, .swal2-select {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          color: #e6e6e6;
          box-shadow: none;
        }
        .swal2-container {
          z-index: 9999;
        }
          .swal2-select {
          color: #000 !important;          /* text inside dropdown */
          background: #ffffff !important;  /* dropdown background */
        }
      `}</style>

      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      <main className="flex-1 mt-[72px] p-10 space-y-8">
        <h1 className="text-3xl font-bold tracking-wide mb-6">
          {title} for {endpoint === "/ips" ? "Zone" : "Server"} #{id}
        </h1>

        {/* ➕ Resource Add Form */}
        <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] rounded-2xl p-6 shadow-2xl border border-indigo-900/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 🌐 Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-indigo-900/40">
              <table className="min-w-[600px] w-full text-left border-collapse">
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
                      {fields.map((f, j) => (
                        <td
                          key={f.name}
                          className="px-6 py-3 border-b border-indigo-900/30 relative"
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

                          {/* 🗑 Small Delete Icon Button */}
                          {j === fields.length - 1 && i > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newRows = rows.filter(
                                  (_, idx) => idx !== i
                                );
                                setRows(
                                  newRows.length
                                    ? newRows
                                    : [
                                        Object.fromEntries(
                                          fields.map((f) => [
                                            f.name,
                                            f.type === "checkbox" ? false : "",
                                          ])
                                        ),
                                      ]
                                );
                              }}
                              title="Remove Row"
                              className="absolute right-1 top-6 text-red-500 hover:text-red-600 transition-all"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14"
                                />
                              </svg>
                            </button>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 📱 Mobile View (Stacked Form) */}
            <div className="block sm:hidden space-y-4">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="bg-[#141b2e] border border-indigo-900/40 rounded-xl p-4 space-y-3 relative"
                >
                  {fields.map((f) => (
                    <div key={f.name} className="flex flex-col">
                      <label className="text-gray-300 text-sm mb-1">
                        {f.label}
                      </label>
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
                          className="w-full bg-[#0e1525] border border-indigo-900/40 text-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      )}
                    </div>
                  ))}

                  {/* Delete Button for extra rows */}
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newRows = rows.filter((_, idx) => idx !== i);
                        setRows(
                          newRows.length
                            ? newRows
                            : [
                                Object.fromEntries(
                                  fields.map((f) => [
                                    f.name,
                                    f.type === "checkbox" ? false : "",
                                  ])
                                ),
                              ]
                        );
                      }}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-600 transition-all"
                      title="Remove Row"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
              <button
                type="button"
                onClick={addRow}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow-md transition-all duration-300 w-full sm:w-auto"
              >
                <PlusCircle className="w-5 h-5" />
                Add Row
              </button>

              <button
                type="submit"
                disabled={saving}
                className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-white shadow-md transition-all duration-300 w-full sm:w-auto ${
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
            </div>
          </form>
        </div>

        {/* Existing or Available Entries */}
        {(showExisting || extraForm === "disks") && (
          <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] rounded-2xl p-6 shadow-2xl border border-indigo-900/40">
            <h2
              className={`text-2xl font-semibold ${
                extraForm === "disks" ? "text-green-400" : "text-indigo-400"
              } mb-4`}
            >
              {extraForm === "disks" ? "Available Disks" : "Existing Entries"}
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              </div>
            ) : existing.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                No records found.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-indigo-900/40">
                  <table className="min-w-[600px] w-full text-left border-collapse">
                    <thead className="bg-[#151c2f] text-gray-300 uppercase text-xs sm:text-sm tracking-wider">
                      <tr>
                        {Object.keys(displayed[0]).map((key) => (
                          <th
                            key={key}
                            className="px-3 sm:px-6 py-3 border-b border-indigo-900/40"
                          >
                            {key}
                          </th>
                        ))}
                        <th className="px-3 sm:px-6 py-3 border-b border-indigo-900/40 text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {displayed.map((item, index) => (
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-[#141b2e]" : "bg-[#19223c]"
                          } hover:bg-[#1b2545]/60 transition-colors`}
                        >
                          {Object.entries(item).map(([key, val], j) => {
                            let displayValue = val;

                            // ✅ Only handle 'inUse' now
                            if (key === "inUse") {
                              displayValue = val ? "Yes" : "No";
                            }
                            // ✅ Convert GB → TB only for disks
                            if (
                              extraForm === "disks" &&
                              [
                                "TOTALDISKGB",
                                "USABLEDISKGB",
                                "LIVEUSEDGB",
                                "LIVEAVAILABLEGB",
                              ].includes(key.toUpperCase()) &&
                              !isNaN(val)
                            ) {
                              displayValue =
                                (Number(val) / 1024).toFixed(2) + " TB";
                            }

                            return (
                              <td
                                key={j}
                                className="px-3 sm:px-6 py-2 sm:py-3 border-b border-indigo-900/30 text-sm sm:text-base"
                              >
                                {displayValue}
                              </td>
                            );
                          })}

                          {/* 🎛️ Action Buttons */}
                          <td className="px-3 sm:px-6 py-2 sm:py-3 border-b border-indigo-900/30 text-center">
                            <div className="flex justify-center gap-3 sm:gap-5 flex-wrap sm:flex-nowrap">
                              {/* ✏️ Edit Icon */}
                              <button
                                onClick={() => handleEdit(item)}
                                className="transition-transform duration-300 hover:scale-110 group"
                                title="Edit"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 group-hover:drop-shadow-[0_0_6px_rgba(99,102,241,0.7)] transition-all duration-300"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.862 4.487a2.12 2.12 0 113.001 3.001L7.5 19.85l-4 1 1-4 12.362-12.363z"
                                  />
                                </svg>
                              </button>

                              {/* 🗑 Delete Icon */}
                              <button
                                onClick={() => handleDelete(item)}
                                className="transition-transform duration-300 hover:scale-110 group"
                                title="Delete"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-5 h-5 text-red-500 group-hover:text-red-400 group-hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] transition-all duration-300"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {showExisting && (
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
                )}
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
