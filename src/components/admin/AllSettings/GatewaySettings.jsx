import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../adminHeader";
import Footer from "../../user/Footer";
import {
  ArrowLeft,
  Save,
  Loader2,
  CreditCard,
  Shield,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Settings,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

const GATEWAYS = ["CASHFREE", "PAYTM", "RAZORPAY", "STRIPE"];

export default function AdminPaymentGatewaySettings() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  const [activeGateway, setActiveGateway] = useState("CASHFREE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [form, setForm] = useState({
    clientId: "",
    clientSecret: "******",
    apiVersion: "",
    mode: "SANDBOX",
    active: false,
  });

  const [initialForm, setInitialForm] = useState({});

  // Track changes
  useEffect(() => {
    if (Object.keys(initialForm).length > 0) {
      const changed = Object.keys(form).some(
        (key) => form[key] !== initialForm[key],
      );
      setUnsavedChanges(changed);
    }
  }, [form, initialForm]);

  // Fetch gateway data
  useEffect(() => {
    fetchGateway();
  }, [activeGateway]);

  const fetchGateway = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/admin/settings/gateway/${activeGateway}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch gateway");

      const data = await res.json();

      setForm({
        name: data.name,
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        apiVersion: data.apiVersion,
        mode: data.mode,
        active: data.active,
      });

      setInitialForm({
        name: data.name || "",
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        apiVersion: data.apiVersion,
        mode: data.mode,
        active: data.active,
      });
    } catch (err) {
      toast.error("Unable to load gateway settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        name: form.name,
        clientId:
          form.clientId === "" || form.clientId.includes("*")
            ? form.clientId
            : form.clientId,
        clientSecret:
          form.clientSecret === "" || form.clientSecret === "******"
            ? "******"
            : form.clientSecret,
        apiVersion: form.apiVersion,
        mode: form.mode,
        active: form.active,
      };

      const res = await fetch(
        `${BASE_URL}/api/admin/settings/gateway/${activeGateway}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setForm(updated);
      setInitialForm(updated);
      setUnsavedChanges(false);

      toast.success("Gateway updated successfully.");
    } catch (err) {
      toast.error("Failed to update gateway");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm(initialForm);
    setUnsavedChanges(false);
  };

  return (
    <div className="bg-[#0a0f1e] text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-indigo-900/30">
        <Header />
      </div>

      <main className="flex-1 mt-[72px] px-8 py-8 w-full">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/settings")}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-indigo-600/10 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-indigo-400" />
          </button>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
            <CreditCard className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Payment Gateway Settings
            </h1>
            <p className="text-sm text-gray-400">
              Manage API credentials and gateway configuration
            </p>
          </div>
        </div>

        {/* Gateway Tabs */}
        <div className="flex gap-2 mb-6">
          {GATEWAYS.map((gw) => (
            <button
              key={gw}
              onClick={() => setActiveGateway(gw)}
              className={`px-4 py-2 rounded-xl text-sm transition ${
                activeGateway === gw
                  ? "bg-purple-600/20 text-purple-400"
                  : "text-gray-400 hover:bg-purple-900/20"
              }`}
            >
              {gw}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="bg-[#0f1425] border border-indigo-900/40 rounded-2xl p-8 space-y-8">
            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Display Name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />

              <Input
                label={
                  activeGateway === "PAYTM" ? "Merchant ID (MID)" : "Client ID"
                }
                value={form.clientId}
                onChange={(v) => setForm({ ...form, clientId: v })}
                icon={Key}
              />

              {/* Secret */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {activeGateway === "PAYTM" ? "UPI ID" : "Client Secret"}
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={form.clientSecret}
                    onChange={(e) =>
                      setForm({ ...form, clientSecret: e.target.value })
                    }
                    className="w-full bg-[#1a2335] border border-indigo-900/40 rounded-xl px-4 py-3 text-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {activeGateway !== "PAYTM" && (
                <Input
                  label="API Version"
                  value={form.apiVersion}
                  onChange={(v) => setForm({ ...form, apiVersion: v })}
                  icon={Settings}
                />
              )}
            </div>

            {/* Mode + Active */}
            <div className="flex gap-6 items-center">
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                className="bg-[#1a2335] border border-indigo-900/40 rounded-xl px-4 py-3 text-gray-200"
              >
                <option value="SANDBOX">SANDBOX</option>
                <option value="PRODUCTION">PRODUCTION</option>
              </select>

              <button
                onClick={() => setForm({ ...form, active: !form.active })}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                  form.active
                    ? "bg-green-600/20 text-green-400"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                {form.active ? <ToggleRight /> : <ToggleLeft />}
                {form.active ? "Active" : "Inactive"}
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-indigo-900/40">
              {unsavedChanges && (
                <button
                  onClick={handleDiscard}
                  className="px-6 py-3 text-gray-400"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!unsavedChanges || saving}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Input({ label, value, onChange, icon: Icon }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1a2335] border border-indigo-900/40 rounded-xl px-4 py-3 text-gray-200"
      />
    </div>
  );
}
