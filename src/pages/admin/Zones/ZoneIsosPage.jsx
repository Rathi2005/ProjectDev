import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../../components/admin/adminHeader";
import Footer from "../../../components/user/Footer";
import {
  PlusCircle,
  Loader2,
  Trash2,
  Edit,
  Search,
  Download,
  Upload,
  FileCode,
  Server,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

const OS_TYPES = [
  "WINDOWS",
  "UBUNTU",
  "UBUNTU_LEGACY",
  "DEBIAN",
  "RHEL_NM",
  "OPENSUSE",
];

export default function ZoneIsosPage() {
  const { zoneId } = useParams();
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("adminToken");

  const [isos, setIsos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    iso: "",
    vmid: "",
    osType: "",
  });

  // FETCH ISOs FOR ZONE
  const fetchIsos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/zones/${zoneId}/isos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      setIsos(await res.json());
    } catch {
      toast.error("Failed to load Zone ISOs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIsos();
  }, [zoneId]);

  // ADD MASTER ISO (PROPAGATES)
  const handleAddIso = async (e) => {
    e.preventDefault();
    if (!form.iso.trim() || !form.vmid.trim() || !form.osType) {
      toast.error("Please fill all fields");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${BASE_URL}/api/admin/zones/isos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          zoneId: Number(zoneId),
          iso: form.iso.trim(),
          vmid: form.vmid.trim(),
          osType: form.osType,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("ISO added successfully");
      setForm({ iso: "", vmid: "", osType: "" });
      fetchIsos();
    } catch {
      toast.error("Failed to add ISO");
    } finally {
      setSaving(false);
    }
  };

  // UPDATE ISO
  const handleEdit = async (iso) => {
    const { value: values } = await Swal.fire({
      title: "Update ISO",
      html: `
      <input id="swal-iso" class="swal2-input" placeholder="ISO Name" value="${iso.isoName}">
      <input id="swal-vmid" class="swal2-input" placeholder="VMID" value="${iso.vmid}">
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update",
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#4b5563",
      customClass: {
        popup: "!bg-[#151c2f] !border !border-indigo-500/20 !rounded-xl",
        title: "!text-indigo-300 !text-lg !font-semibold",
        input:
          "!bg-[#0a0f1c] !border !border-gray-700 !text-white !focus:border-indigo-500",
        confirmButton:
          "!bg-indigo-600 !hover:bg-indigo-700 !px-4 !py-2 !rounded-lg",
        cancelButton: "!bg-gray-700 !hover:bg-gray-600 !px-4 !py-2 !rounded-lg",
      },
      preConfirm: () => ({
        iso: document.getElementById("swal-iso").value,
        vmid: document.getElementById("swal-vmid").value,
      }),
    });

    if (!values) return;

    try {
      const res = await fetch(`${BASE_URL}/api/admin/zones/isos/${iso.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          iso: values.iso,
          vmid: values.vmid,
          osType: iso.osType,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("ISO updated successfully");
      fetchIsos();
    } catch {
      toast.error("Update failed");
    }
  };

  // DELETE ISO
  const handleDelete = async (iso) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `Delete "${iso.isoName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#4b5563",
      background: "#0e1525",
      color: "#fff",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${BASE_URL}/api/admin/zones/isos/${iso.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Delete failed");
      }

      await Swal.fire({
        title: "Deleted!",
        text: "ISO deleted successfully",
        icon: "success",
        confirmButtonColor: "#6366f1",
        background: "#0e1525",
        color: "#fff",
      });

      fetchIsos();
    } catch (err) {
      await Swal.fire({
        title: "Action Failed",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#ef4444",
        background: "#0e1525",
        color: "#fff",
        customClass: {
          popup: "bg-[#0e1525] border border-red-500/20 rounded-xl",
          title: "text-red-400",
        },
      });
    }
  };

  const filteredIsos = isos.filter(
    (iso) =>
      iso.isoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iso.vmid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iso.osType.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-gradient-to-br from-[#0e1525] to-[#0a0f1c] min-h-screen text-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 mt-[24px] p-6 space-y-8 max-w-full mx-auto w-[97%]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Zone ISOs Management
            </h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <Server className="w-4 h-4" />
              Managing ISO files for Zone #{zoneId}
            </p>
          </div>
        </div>

        {/* Add ISO Card */}
        <div className="bg-gradient-to-br from-[#151c2f] to-[#0f1525] border border-indigo-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <Upload className="w-6 h-6 text-indigo-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-100">Add New ISO</h2>
          </div>

          <form onSubmit={handleAddIso} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  ISO Name
                </label>
                <input
                  placeholder="e.g., ubuntu-22.04.iso"
                  value={form.iso}
                  onChange={(e) => setForm({ ...form, iso: e.target.value })}
                  className="w-full bg-[#0a0f1c] border border-gray-700 hover:border-indigo-500/50 focus:border-indigo-500 rounded-xl px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  VMID
                </label>
                <input
                  placeholder="e.g., 1000"
                  value={form.vmid}
                  onChange={(e) => setForm({ ...form, vmid: e.target.value })}
                  className="w-full bg-[#0a0f1c] border border-gray-700 hover:border-indigo-500/50 focus:border-indigo-500 rounded-xl px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  OS Type
                </label>
                <select
                  value={form.osType}
                  onChange={(e) => setForm({ ...form, osType: e.target.value })}
                  className="w-full bg-[#0a0f1c] border border-gray-700 hover:border-indigo-500/50 focus:border-indigo-500 rounded-xl px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="" className="bg-[#0a0f1c]">
                    Select OS Type
                  </option>
                  {OS_TYPES.map((os) => (
                    <option key={os} value={os} className="bg-[#0a0f1c]">
                      {os}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-800">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    Add ISO
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ISO Table Section */}
        <div className="bg-gradient-to-br from-[#151c2f] to-[#0f1525] border border-indigo-500/20 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-3">
                  <FileCode className="w-5 h-5 text-indigo-300" />
                  Existing ISO Entries
                  <span className="text-sm font-normal px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full">
                    {filteredIsos.length}{" "}
                    {filteredIsos.length === 1 ? "entry" : "entries"}
                  </span>
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  All ISO files available for this zone
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  placeholder="Search ISOs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#0a0f1c] border border-gray-700 hover:border-indigo-500/50 focus:border-indigo-500 pl-10 pr-4 py-2 rounded-xl w-64 transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileCode className="w-6 h-6 text-indigo-300 animate-pulse" />
                  </div>
                </div>
                <p className="mt-4 text-gray-400">Loading ISO entries...</p>
              </div>
            ) : filteredIsos.length === 0 ? (
              <div className="text-center py-12">
                <FileCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  {searchTerm
                    ? "No matching ISO entries found"
                    : "No ISO entries available"}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#19223c] to-[#151c2f]">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-300 border-b border-gray-800">
                      ISO Name
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-300 border-b border-gray-800">
                      VMID
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-300 border-b border-gray-800">
                      OS Type
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-300 border-b border-gray-800 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredIsos.map((iso) => (
                    <tr
                      key={iso.id}
                      className="hover:bg-gray-800/30 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 group-hover:from-indigo-900/20 group-hover:to-purple-900/20">
                            <FileCode className="w-4 h-4 text-gray-400 group-hover:text-indigo-300" />
                          </div>
                          <span className="font-medium text-gray-100">
                            {iso.isoName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="px-3 py-1 bg-gray-800/50 rounded-lg text-indigo-300 font-mono">
                          {iso.vmid}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                            iso.osType.includes("UBUNTU")
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : iso.osType.includes("WINDOWS")
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : iso.osType.includes("DEBIAN")
                                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                  : "bg-green-500/20 text-green-300 border border-green-500/30"
                          }`}
                        >
                          {iso.osType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(iso)}
                            className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 hover:from-indigo-500/20 hover:to-indigo-600/20 text-indigo-300 hover:text-indigo-200 transition-all duration-200 transform hover:scale-105"
                            title="Edit ISO"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(iso)}
                            className="p-2 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 text-red-300 hover:text-red-200 transition-all duration-200 transform hover:scale-105"
                            title="Delete ISO"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filteredIsos.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-800 flex justify-between items-center text-sm text-gray-400">
              <div>
                Showing{" "}
                <span className="font-medium text-gray-300">
                  {filteredIsos.length}
                </span>{" "}
                entries
              </div>
              <div className="flex items-center gap-4">
                <button className="hover:text-gray-300 transition-colors">
                  ← Previous
                </button>
                <span className="text-gray-300">Page 1 of 1</span>
                <button className="hover:text-gray-300 transition-colors">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
