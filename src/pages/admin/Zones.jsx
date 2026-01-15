import React, { useState, useEffect } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { PlusCircle, Loader2, Trash2, Edit, Server, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [editingZone, setEditingZone] = useState(null);
  const [renameModal, setRenameModal] = useState(false);
  const [renameName, setRenameName] = useState("");

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // ✅ Configure SweetAlert2 dark theme
  const swalDarkTheme = {
    customClass: {
      popup: "dark-swal-popup",
      title: "dark-swal-title",
      htmlContainer: "dark-swal-content",
      confirmButton: "dark-swal-confirm",
      cancelButton: "dark-swal-cancel",
      input: "dark-swal-input",
    },
    background: "#0f172a",
    color: "#e2e8f0",
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#ef4444",
  };

  // ✅ Fetch all zones
  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${BASE_URL}/api/options/zones`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          toast.error("Failed to fetch zones");
          return;
        }

        const data = await res.json();
        setZones(data || []);
      } catch (err) {
        toast.error("Error fetching zones");
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, [BASE_URL]);

  // ✅ Add Zone
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${BASE_URL}/api/admin/zones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: formData.name }),
      });

      if (!res.ok) {
        const errMsg = await res.text();
        toast.error(`Failed to add zone: ${errMsg}`);
        return;
      }

      const newZone = await res.json();
      setZones((prev) => [...prev, newZone]);

      toast.success("Zone added successfully!");
      setShowModal(false);
      setFormData({ name: "" });
    } catch (err) {
      toast.error("Error adding zone");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Delete Zone with confirmation
  const handleDeleteZone = async (zoneId, zoneName) => {
    const result = await Swal.fire({
      ...swalDarkTheme,
      title: "Delete Zone",
      html: `
    <div class="text-left space-y-4">
      <p class="text-red-300">
        Are you sure you want to delete the zone "<strong>${zoneName}</strong>"?
      </p>
      <p class="text-gray-400 text-sm">
        This action cannot be undone. All associated IPs and servers will be affected.
      </p>
      <p class="text-gray-400 text-sm">
        Type <strong>delete</strong> below to confirm:
      </p>
    </div>
  `,
      input: "text",
      inputPlaceholder: 'Type "delete" to confirm',
      showCancelButton: true,
      confirmButtonText: "Delete Zone",
      cancelButtonText: "Cancel",
      preConfirm: (input) => {
        if (input?.toLowerCase() !== "delete") {
          Swal.showValidationMessage('You must type "delete" to confirm');
          return false;
        }
        return true;
      },
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${BASE_URL}/api/admin/zones/${zoneId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Remove zone from state
        setZones(zones.filter((zone) => zone.id !== zoneId));

        await Swal.fire({
          ...swalDarkTheme,
          icon: "success",
          title: "Deleted!",
          text: `Zone "${zoneName}" has been deleted successfully.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          ...swalDarkTheme,
          icon: "error",
          title: "Error",
          text: "Failed to delete zone. Please try again.",
        });
      }
    }
  };

  // ✅ Rename Zone
  const handleRenameZone = async () => {
    if (!renameName.trim() || !editingZone) {
      toast.error("Please enter a valid zone name");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${BASE_URL}/api/admin/zones/${
          editingZone.id
        }/rename?name=${encodeURIComponent(renameName)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Update zone in state
      setZones(
        zones.map((zone) =>
          zone.id === editingZone.id ? { ...zone, name: renameName } : zone
        )
      );

      setRenameModal(false);
      setEditingZone(null);
      setRenameName("");

      toast.success(`Zone renamed to "${renameName}" successfully!`);
    } catch (err) {
      toast.error("Failed to rename zone");
    }
  };

  // ✅ Open rename modal
  const openRenameModal = (zone) => {
    setEditingZone(zone);
    setRenameName(zone.name);
    setRenameModal(true);
  };

  // ✅ Style for SweetAlert
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .dark-swal-popup {
        background: #0f172a !important;
        border: 1px solid #334155 !important;
        border-radius: 0.75rem !important;
      }
      .dark-swal-title {
        color: #e2e8f0 !important;
        font-size: 1.5rem !important;
        font-weight: 600 !important;
      }
      .dark-swal-content {
        color: #cbd5e1 !important;
        font-size: 1rem !important;
      }
      .dark-swal-confirm {
        background-color: #3b82f6 !important;
        border: none !important;
        border-radius: 0.5rem !important;
        padding: 0.625rem 1.5rem !important;
        font-weight: 500 !important;
        transition: all 0.2s !important;
      }
      .dark-swal-confirm:hover {
        background-color: #2563eb !important;
        transform: translateY(-1px) !important;
      }
      .dark-swal-cancel {
        background-color: #4b5563 !important;
        border: none !important;
        border-radius: 0.5rem !important;
        padding: 0.625rem 1.5rem !important;
        font-weight: 500 !important;
        transition: all 0.2s !important;
      }
      .dark-swal-cancel:hover {
        background-color: #374151 !important;
        transform: translateY(-1px) !important;
      }
      .dark-swal-input {
        background-color: #1e293b !important;
        border: 1px solid #475569 !important;
        color: #e2e8f0 !important;
        border-radius: 0.5rem !important;
        padding: 0.75rem !important;
      }
      .dark-swal-input:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30 shadow-md shadow-indigo-900/20">
        <Header />
      </div>

      {/* Main Content */}
      <main className="flex-1 mt-[72px] p-4 sm:p-10 space-y-8">
        {/* Page Title + Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-wide text-indigo-300">
            <Globe className="inline-block w-8 h-8 mr-3 mb-1" />
            Zones
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-indigo-600/30 transition-all duration-300 text-sm sm:text-base"
          >
            <PlusCircle className="w-5 h-5" />
            Add Zone
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-indigo-900/40 shadow-lg shadow-indigo-900/20 w-full">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : zones.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-lg">
              No zones found. Create your first zone!
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full text-center border-collapse text-sm sm:text-base">
                <thead className="bg-[#151c2f] text-indigo-200 uppercase tracking-wider text-xs sm:text-sm border-b border-indigo-800/50">
                  <tr>
                    <th className="px-4 py-3 sm:px-6 text-center">Zone ID</th>
                    <th className="px-4 py-3 sm:px-6 text-center">Zone Name</th>
                    <th className="px-4 py-3 sm:px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone, index) => (
                    <tr
                      key={zone.id || index}
                      className={`${
                        index % 2 === 0 ? "bg-[#141b2e]" : "bg-[#19223c]"
                      } hover:bg-indigo-900/30 transition-all duration-300`}
                    >
                      <td className="px-4 py-3 sm:px-6 text-indigo-300 font-semibold text-center">
                        {zone.id || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 text-gray-200 text-center font-medium">
                        {zone.name || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 text-center">
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button
                            onClick={() =>
                              navigate(`/admin/zones/${zone.id}/ips`)
                            }
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm px-3 py-1.5 rounded-md transition-all duration-300 shadow-sm hover:shadow-indigo-600/30"
                          >
                            <Globe className="w-3 h-3" />
                            IPs
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/${zone.id}/servers`)
                            }
                            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm px-3 py-1.5 rounded-md transition-all duration-300 shadow-sm hover:shadow-amber-600/30"
                          >
                            <Server className="w-3 h-3" />
                            Servers
                          </button>
                          <button
                            onClick={() => openRenameModal(zone)}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 py-1.5 rounded-md transition-all duration-300 shadow-sm hover:shadow-blue-600/30"
                          >
                            <Edit className="w-3 h-3" />
                            Rename
                          </button>
                          <button
                            onClick={() => handleDeleteZone(zone.id, zone.name)}
                            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm px-3 py-1.5 rounded-md transition-all duration-300 shadow-sm hover:shadow-red-600/30"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
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

      {/* ✅ Add Zone Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn overflow-y-auto flex justify-center">
          <div className="relative bg-[#111827] border border-indigo-800/40 rounded-2xl shadow-2xl w-[90%] max-w-md my-10 p-8 sm:p-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-indigo-300 flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-indigo-400" />
                Add New Zone
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-400 transition-colors text-xl"
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. India, Singapore, US-East-1"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
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
                      <PlusCircle className="w-4 h-4" /> Add Zone
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Rename Zone Modal */}
      {renameModal && editingZone && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn overflow-y-auto flex justify-center">
          <div className="relative bg-[#111827] border border-indigo-800/40 rounded-2xl shadow-2xl w-[90%] max-w-md my-10 p-8 sm:p-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-indigo-300 flex items-center gap-2">
                <Edit className="w-6 h-6 text-blue-400" />
                Rename Zone
              </h2>
              <button
                onClick={() => {
                  setRenameModal(false);
                  setEditingZone(null);
                  setRenameName("");
                }}
                className="text-gray-400 hover:text-red-400 transition-colors text-xl"
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Current Zone Info */}
            <div className="mb-6 p-4 bg-indigo-900/20 rounded-lg border border-indigo-700/30">
              <p className="text-sm text-gray-400">Current Zone ID:</p>
              <p className="text-lg font-semibold text-indigo-300">
                {editingZone.id}
              </p>
              <p className="text-sm text-gray-400 mt-2">Current Name:</p>
              <p className="text-lg font-medium text-gray-200">
                {editingZone.name}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  New Zone Name
                </label>
                <input
                  type="text"
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  placeholder="Enter new zone name"
                  required
                  className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-4 py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-indigo-900/40 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setRenameModal(false);
                    setEditingZone(null);
                    setRenameName("");
                  }}
                  className="px-5 py-2.5 rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRenameZone}
                  disabled={!renameName.trim()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 disabled:opacity-50"
                >
                  <Edit className="w-4 h-4" /> Rename Zone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
