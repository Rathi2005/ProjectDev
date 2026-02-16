import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../adminHeader";
import Footer from "../../user/Footer";
import {
  Save,
  Loader2,
  Building2,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Globe,
  Clock,
  Shield,
  Edit3,
  ChevronDown,
  Info,
  X,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminGeneralSettings() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("adminToken");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    defaultPhone: "",
    warningDays: 7,
    gracePeriodDays: 3,
    expiryAction: "SUSPEND",
  });

  const [initialForm, setInitialForm] = useState({});

  // Track unsaved changes
  useEffect(() => {
    if (Object.keys(initialForm).length > 0) {
      const changed = Object.keys(form).some(
        (key) => form[key] !== initialForm[key],
      );
      setUnsavedChanges(changed);
    }
  }, [form, initialForm]);

  // 🔥 Fetch General Settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/admin/settings/general`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch settings");

      const data = await res.json();
      setForm(data);
      setInitialForm(data);
    } catch (err) {
      toast.error("Unable to load settings");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Update Settings
  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await fetch(`${BASE_URL}/api/admin/settings/general`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setForm(updated);
      setInitialForm(updated);
      setUnsavedChanges(false);

      toast.success("Settings updated successfully 🚀");
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm(initialForm);
    setUnsavedChanges(false);
    toast.success("Changes discarded");
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const calculateCompletionPercentage = () => {
    const requiredFields = [
      "companyName",
      "companyAddress",
      "companyPhone",
      "defaultPhone",
    ];
    const filled = requiredFields.filter(
      (field) => form[field] && form[field].trim() !== "",
    ).length;
    return Math.round((filled / requiredFields.length) * 100);
  };

  // Tabs configuration
  const tabs = [
    { id: "general", label: "Company Details", icon: Building2 },
    { id: "lifecycle", label: "Lifecycle Rules", icon: Clock },
  ];

  return (
    <div className="bg-[#0a0f1e] text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-indigo-900/30">
        <Header />
      </div>

      <main className="flex-1 mt-[72px] px-6 lg:px-10 py-8 w-full">
           
        {/* Page Header with Progress */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
                 <button
              onClick={() => navigate("/admin/settings")}
              className="group flex items-center justify-center w-10 h-10 rounded-xl  hover:bg-indigo-600/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            </button>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  General Settings
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Manage company details and lifecycle configuration
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#0f1425] p-1 rounded-xl border border-indigo-900/40 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-gray-400 hover:text-gray-300 hover:bg-indigo-900/20"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-400 mb-4" />
            <p className="text-gray-400">Loading settings...</p>
          </div>
        ) : (
          <div className="bg-[#0f1425] border border-indigo-900/40 rounded-2xl p-8 shadow-lg space-y-8">
            {/* Tab Content */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    Company Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Company Name"
                      value={form.companyName}
                      onChange={(v) => handleInputChange("companyName", v)}
                      icon={Building2}
                      placeholder="Enter company name"
                      required
                    />

                    <Input
                      label="Company Address"
                      value={form.companyAddress}
                      onChange={(v) => handleInputChange("companyAddress", v)}
                      icon={Globe}
                      placeholder="Enter company address"
                      required
                    />

                    <Input
                      label="Company Phone"
                      value={form.companyPhone}
                      onChange={(v) => handleInputChange("companyPhone", v)}
                      icon={Phone}
                      placeholder="+91 9999999999"
                      type="tel"
                      required
                    />

                    <Input
                      label="Default Phone"
                      value={form.defaultPhone}
                      onChange={(v) => handleInputChange("defaultPhone", v)}
                      icon={Phone}
                      placeholder="+91 9999999999"
                      type="tel"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "lifecycle" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    Lifecycle Rules
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative">
                      <Input
                        type="number"
                        label="Warning Days"
                        value={form.warningDays}
                        onChange={(v) =>
                          handleInputChange("warningDays", Number(v))
                        }
                        icon={AlertTriangle}
                        min={1}
                        max={30}
                        suffix="days"
                        help="Days before expiry to send warning"
                      />
                    </div>

                    <div className="relative">
                      <Input
                        type="number"
                        label="Grace Period"
                        value={form.gracePeriodDays}
                        onChange={(v) =>
                          handleInputChange("gracePeriodDays", Number(v))
                        }
                        icon={Clock}
                        min={0}
                        max={15}
                        suffix="days"
                        help="Days after expiry before action"
                      />
                    </div>

                    {/* Expiry Action */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Expiry Action
                        <div className="group relative">
                          <Info className="w-3 h-3 text-gray-500 cursor-help" />
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-2 bg-[#1a2335] text-xs text-gray-300 rounded-lg border border-indigo-900/40">
                            Action to take when service expires
                          </div>
                        </div>
                      </label>
                      <div className="relative">
                        <select
                          value={form.expiryAction}
                          onChange={(e) =>
                            handleInputChange("expiryAction", e.target.value)
                          }
                          className="w-full bg-[#1a2335] border border-indigo-900/40 rounded-xl px-4 py-3 text-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer"
                        >
                          <option value="SUSPEND">
                            SUSPEND - Temporarily disable
                          </option>
                          <option value="TERMINATE">
                            TERMINATE - Permanently remove
                          </option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-indigo-900/40">
              {unsavedChanges && (
                <button
                  onClick={handleDiscard}
                  className="px-6 py-3 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !unsavedChanges}
                className={`flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 rounded-xl text-white font-medium shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 ${
                  unsavedChanges ? "animate-pulse" : ""
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving
                  ? "Saving..."
                  : unsavedChanges
                    ? "Save Changes"
                    : "Saved"}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* Enhanced Input Component */
function Input({
  label,
  value,
  onChange,
  type = "text",
  icon: Icon,
  placeholder,
  required,
  min,
  max,
  suffix,
  help,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-red-400">*</span>}
        {help && (
          <div className="group relative">
            <Info className="w-3 h-3 text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-2 bg-[#1a2335] text-xs text-gray-300 rounded-lg border border-indigo-900/40 z-10">
              {help}
            </div>
          </div>
        )}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          min={min}
          max={max}
          required={required}
          className={`w-full bg-[#1a2335] border rounded-xl px-4 py-3 text-gray-200 outline-none transition-all ${
            focused
              ? "border-indigo-500 ring-2 ring-indigo-500/20"
              : "border-indigo-900/40 hover:border-indigo-500/50"
          }`}
        />
        {suffix && (
          <span className="absolute right-3 top-3 text-sm text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
