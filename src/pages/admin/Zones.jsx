import React, { useState, useEffect } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { PlusCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "" });

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // ✅ Fetch all zones
  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${BASE_URL}/options/zones`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch zones:", res.statusText);
          return;
        }

        const data = await res.json();
        setZones(data || []);
      } catch (err) {
        console.error("Error fetching zones:", err);
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
      const res = await fetch(`${BASE_URL}/admin/zones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: formData.name }),
      });

      if (!res.ok) {
        const err = await res.text();
        alert(`Failed to add zone: ${res.status} ${err}`);
        return;
      }

      const newZone = await res.json();
      setZones((prev) => [...prev, newZone]);
      alert("✅ Zone added successfully!");
      setShowModal(false);
      setFormData({ name: "" });
    } catch (err) {
      console.error("Error adding zone:", err);
      alert("Error adding zone!");
    } finally {
      setSubmitting(false);
    }
  };

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
            Zones
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-indigo-600/30 transition-all duration-300 text-sm sm:text-base"
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
              No zones found.
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
                      <td className="px-4 py-3 sm:px-6 text-gray-200 text-center">
                        {zone.name || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 text-center">
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <button
                            onClick={() =>
                              navigate(`/admin/zones/${zone.id}/ips`)
                            }
                            className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-4 py-1 rounded-md transition-all duration-300 shadow-sm hover:shadow-green-600/30"
                          >
                            Add IPs
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/${zone.id}/servers`)
                              // navigate(`/admin/zones/${zone.id}/servers`)
                            }
                            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm px-4 py-1 rounded-md transition-all duration-300 shadow-sm hover:shadow-indigo-600/30"
                          >
                            Servers
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

      <Footer />
    </div>
  );
}
