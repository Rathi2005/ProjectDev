import React, { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import AdminHeader from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { useParams } from "react-router-dom";

export default function PricingPage() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { type } = useParams();

  const [data, setData] = useState({
    cpu: [],
    ram: [],
    disk: [],
    bandwidth: [],
  });

  const [newEntries, setNewEntries] = useState({
    cpu: { label: "", price: "", cores: "" },
    ram: { label: "", price: "", ramMb: "" },
    disk: { label: "", price: "", diskGb: "" },
    bandwidth: { label: "", price: "", bandwidthGb: "" },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  // ✅ Fetch prices for all resources separately
  useEffect(() => {
    const fetchSection = async (section) => {
      const token = localStorage.getItem("adminToken");
      try {
        const res = await fetch(`${BASE_URL}/admin/pricing/${type}/${section}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          return data || [];
        } else {
          const errText = await res.text();
          console.error(`Failed to fetch ${section} pricing:`, errText);
          return [];
        }
      } catch (err) {
        console.error(err);
        return [];
      }
    };

    const loadAll = async () => {
      setLoading(true);
      const [cpu, ram, disk, bandwidth] = await Promise.all([
        fetchSection("cpu"),
        fetchSection("ram"),
        fetchSection("disk"),
        fetchSection("bandwidth"),
      ]);
      setData({ cpu, ram, disk, bandwidth });
      setLoading(false);
    };

    loadAll();
  }, [BASE_URL, type]);

  // ✅ Handle input changes
  const handleInputChange = (section, field, value) => {
    setNewEntries((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  // ✅ Save function (per section)
  const handleSave = async (section) => {
    try {
      setSaving((prev) => ({ ...prev, [section]: true }));

      const token = localStorage.getItem("adminToken");

      // Convert numeric fields to numbers before sending
      const convertedEntry = { ...newEntries[section] };
      Object.keys(convertedEntry).forEach((key) => {
        if (["price", "cores", "ramMb", "diskGb", "bandwidthGb"].includes(key)) {
          convertedEntry[key] = Number(convertedEntry[key]) || 0;
        }
      });

      const res = await fetch(`${BASE_URL}/admin/pricing/${type}/${section}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(convertedEntry),
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        alert(`✅ ${section.toUpperCase()} price saved successfully!`);
        // ✅ Update table in real time
        setData((prev) => ({
          ...prev,
          [section]: [...prev[section], result],
        }));
        // Clear the form after successful save
        setNewEntries((prev) => ({
          ...prev,
          [section]: Object.fromEntries(
            Object.keys(prev[section]).map((k) => [k, ""])
          ),
        }));
      } else {
        alert(
          `❌ Failed to update ${section} prices: ${
            result.message || res.statusText
          }`
        );
      }
    } catch (err) {
      console.error(err);
      alert(`❌ Error while saving ${section}: ${err.message}`);
    } finally {
      setSaving((prev) => ({ ...prev, [section]: false }));
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0e1420] text-white">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-400" />
      </div>
    );

  // ✅ Helper render function
  const renderSection = (title, section, fields) => (
    <div className="bg-[#1d2438] p-6 rounded-xl border border-gray-700 shadow-lg space-y-4">
      <h2 className="text-xl font-semibold text-indigo-400 mb-4">
        {title} Pricing
      </h2>

      {/* Existing Prices */}
      <div>
        <h3 className="text-gray-300 mb-2 font-medium">Existing Prices:</h3>
        {data[section].length === 0 ? (
          <p className="text-gray-500 italic">No existing prices</p>
        ) : (
          <table className="w-full text-sm border border-gray-700 rounded-md overflow-hidden mb-4">
            <thead className="bg-[#121a2a] text-gray-300">
              <tr>
                {Object.keys(data[section][0]).map((key) => (
                  <th key={key} className="px-4 py-2 text-left capitalize">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data[section].map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-700 hover:bg-[#252e47]"
                >
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="px-4 py-2 text-gray-300">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Input Section */}
      <div>
        <h3 className="text-gray-300 mb-3 font-medium">Add New Entry:</h3>
        <div className="grid grid-cols-3 gap-6 bg-[#0e1525] p-4 rounded-lg border border-gray-700">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col">
              <label className="text-gray-400 text-sm mb-1">{label}</label>
              <input
                type={key === "price" ? "number" : "text"}
                value={newEntries[section][key]}
                onChange={(e) =>
                  handleInputChange(section, key, e.target.value)
                }
                placeholder={placeholder}
                className="bg-[#121a2a] border border-gray-600 rounded-lg px-3 py-2 text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => handleSave(section)}
          disabled={saving[section]}
          className="mt-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-lg font-medium transition-all"
        >
          {saving[section] ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving[section] ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0e1420] text-white flex flex-col">
      <AdminHeader />

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            {type.charAt(0).toUpperCase() + type.slice(1)} Pricing Management
          </h1>
          <p className="text-gray-400">
            Manage resource-based pricing for {type} servers
          </p>
        </div>

        {renderSection("CPU", "cpu", [
          { key: "label", label: "Label", placeholder: "e.g., 2 Cores (Dedicated)" },
          { key: "price", label: "Price", placeholder: "e.g., 1.2" },
          { key: "cores", label: "Cores", placeholder: "e.g., 2" },
        ])}

        {renderSection("RAM", "ram", [
          { key: "label", label: "Label", placeholder: "e.g., 4 GB" },
          { key: "price", label: "Price", placeholder: "e.g., 0.3" },
          { key: "ramMb", label: "RAM (MB)", placeholder: "e.g., 4096" },
        ])}

        {renderSection("Primary Disk", "disk", [
          { key: "label", label: "Label", placeholder: "e.g., 80 GB NVMe SSD" },
          { key: "price", label: "Price", placeholder: "e.g., 1.0" },
          { key: "diskGb", label: "Disk (GB)", placeholder: "e.g., 80" },
        ])}

        {renderSection("Bandwidth", "bandwidth", [
          { key: "label", label: "Label", placeholder: "e.g., 5 TB" },
          { key: "price", label: "Price", placeholder: "e.g., 0.00" },
          { key: "bandwidthGb", label: "Bandwidth (GB)", placeholder: "e.g., 5000" },
        ])}
      </main>

      <Footer />
    </div>
  );
}
