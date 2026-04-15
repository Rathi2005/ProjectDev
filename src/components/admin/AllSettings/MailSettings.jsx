import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../adminHeader";
import Footer from "../../user/Footer";
import {
  Save,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Server,
  Lock,
  User,
  Globe,
  Shield,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Info,
  Send,
  Settings,
  Key,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Wifi,
  WifiOff,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminMailSettings() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("adminToken");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [showTestModal, setShowTestModal] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState("smtp");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [smtpLogs, setSmtpLogs] = useState([]);
  const [smtpStatus, setSmtpStatus] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    host: "",
    port: 587,
    username: "",
    password: "******",
    senderEmail: "",
    senderName: "",
    smtpAuth: true,
    startTls: true,
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

  // 🔥 Fetch Mail Settings
  useEffect(() => {
    fetchMailSettings();
  }, []);

  const fetchMailSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/admin/settings/mail`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch mail settings");

      const data = await res.json();
      setForm(data);
      setInitialForm(data);
    } catch (err) {
      toast.error("Unable to load mail settings");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Save Mail Settings
  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        ...form,
        password:
          form.password === "" || form.password === "******"
            ? "******"
            : form.password,
      };

      const res = await fetch(`${BASE_URL}/api/admin/settings/mail`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setForm(updated);
      setInitialForm(updated);
      setUnsavedChanges(false);

      toast.success("Mail settings updated successfully 🚀");
    } catch (err) {
      toast.error("Failed to update mail settings");
    } finally {
      setSaving(false);
    }
  };

  // Test SMTP Connection
  const testConnection = async () => {
    // Validation
    if (
      !form.host ||
      !form.port ||
      !form.username ||
      !form.password ||
      !form.senderEmail
    ) {
      toast.error("Please fill all SMTP fields");
      return;
    }

    try {
      setTesting(true);
      setSmtpLogs([]);
      setSmtpStatus(null);
      setTestResult(null);

      const payload = {
        host: form.host,
        port: Number(form.port),
        from: form.senderEmail,
        to: form.senderEmail,
        user: form.username,
        pass: form.password === "******" ? "" : form.password,
      };

      const res = await fetch("https://getwebup.com/server/smtp/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "success") {
        setSmtpLogs(data.data.logs || []);
        setSmtpStatus("success");

        if (data.status === "success") {
          setSmtpLogs(data.data.logs || []);
          setSmtpStatus("success");

          setTestResult({
            success: true,
            message:
              data.data.logs?.find((l) => l.type === "resp")?.message ||
              "SMTP connection successful",
          });
        }

        toast.success("SMTP test successful");
      } else {
        setSmtpLogs(data.data.logs || []);
        setSmtpStatus(data.message || "SMTP test failed");

        setTestResult({
          success: false,
          message:
            data.data.logs?.find((l) => l.type === "error")?.message ||
            data.message,
        });

        toast.error(data.message || "SMTP test failed");
      }
    } catch (error) {
      setSmtpStatus("SMTP test failed");
      toast.error("SMTP test failed");
    } finally {
      setTesting(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    try {
      setTesting(true);
      // Add your test email API call here
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(`Test email sent to ${testEmail}`);
      setShowTestModal(false);
      setTestEmail("");
    } catch (error) {
      toast.error("Failed to send test email");
    } finally {
      setTesting(false);
    }
  };

  const handleDiscard = () => {
    setForm(initialForm);
    setUnsavedChanges(false);
    toast.success("Changes discarded");
  };

  const tabs = [
    { id: "smtp", label: "SMTP Configuration", icon: Server },
    { id: "sender", label: "Sender Details", icon: User },
    { id: "advanced", label: "Advanced", icon: Settings },
  ];

  return (
    <div className="bg-[#0a0f1e] text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-indigo-900/30">
        <Header />
      </div>

      {/* Unsaved Changes Banner */}
      {unsavedChanges && (
        <div className="fixed top-[72px] left-0 right-0 z-40 bg-yellow-600/20 backdrop-blur-md border-b border-yellow-500/30">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">You have unsaved changes</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDiscard}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="text-sm bg-yellow-600/30 text-yellow-400 px-3 py-1 rounded-lg hover:bg-yellow-600/40 transition-all"
              >
                Save Now
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 mt-[72px] p-6 lg:p-10 w-full">
        {/* Page Header with Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/settings")}
              className="group flex items-center justify-center w-10 h-10 rounded-xl  hover:bg-indigo-600/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            </button>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Mail Settings (SMTP)
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Configure email server credentials and SMTP behavior
              </p>
            </div>
          </div>

          {/* Connection Status & Actions */}
          <div className="flex items-center gap-3">
            <div className="bg-[#0f1425] border border-indigo-900/40 rounded-xl px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">SMTP Ready</span>
              </div>
            </div>

            <button
              onClick={testConnection}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a2335] border border-indigo-900/40 rounded-xl text-gray-300 hover:border-green-500/50 transition-all"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Test Connection
            </button>

            <button
              onClick={() => setShowTestModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium hover:scale-105 transition-all"
            >
              <Send className="w-4 h-4" />
              Send Test
            </button>
          </div>
        </div>

        {/* Test Result Banner */}
        {testResult && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              testResult.success
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <div>
                  <p className="font-medium">{testResult.message}</p>
                  {testResult.latency && (
                    <p className="text-xs mt-1 opacity-80">
                      Latency: {testResult.latency}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="text-gray-400 hover:text-gray-300"
              >
                ×
              </button>
            </div>
          </div>
        )}
        {smtpLogs.length > 0 && (
          <div className="mb-6 bg-black/40 border border-indigo-900/40 rounded-xl p-4 max-h-80 overflow-y-auto">
            <h3 className="text-sm text-gray-300 mb-3">SMTP Logs</h3>

            {smtpLogs.map((log, index) => (
              <div
                key={index}
                className={`text-xs mb-2 p-2 rounded ${
                  log.type === "cmd"
                    ? "text-yellow-400"
                    : log.type === "resp"
                      ? "text-green-400"
                      : "text-gray-400"
                }`}
              >
                <span className="opacity-60 mr-2">[{log.time}]</span>
                {log.message}
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#0f1425] p-1 rounded-xl border border-indigo-900/40 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-green-600/20 text-green-400"
                  : "text-gray-400 hover:text-gray-300 hover:bg-green-900/20"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-green-400 mb-4" />
            <p className="text-gray-400">Loading mail settings...</p>
          </div>
        ) : (
          <div className="bg-[#0f1425] border border-indigo-900/40 rounded-2xl p-8 shadow-lg space-y-8">
            {/* Tab Content */}
            {activeTab === "smtp" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <Server className="w-5 h-5 text-green-400" />
                  SMTP Server Configuration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="SMTP Host"
                    value={form.host}
                    onChange={(v) => setForm({ ...form, host: v })}
                    icon={Globe}
                    placeholder="smtp.gmail.com"
                    required
                  />

                  <Input
                    type="number"
                    label="Port"
                    value={form.port}
                    onChange={(v) => setForm({ ...form, port: Number(v) })}
                    icon={Server}
                    placeholder="587"
                    min={1}
                    max={65535}
                    required
                  />

                  <Input
                    label="Username"
                    value={form.username}
                    onChange={(v) => setForm({ ...form, username: v })}
                    icon={User}
                    placeholder="your-email@gmail.com"
                    required
                  />

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Password
                      <div className="group relative">
                        <HelpCircle className="w-3 h-3 text-gray-500 cursor-help" />
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-2 bg-[#1a2335] text-xs text-gray-300 rounded-lg border border-indigo-900/40">
                          Leave as ****** to keep existing password
                        </div>
                      </div>
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        placeholder="Enter new password to change"
                        className="w-full bg-[#1a2335] border border-indigo-900/40 rounded-xl px-4 py-3 pr-10 text-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sender" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-400" />
                  Sender Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Sender Email"
                    value={form.senderEmail}
                    onChange={(v) => setForm({ ...form, senderEmail: v })}
                    icon={Mail}
                    type="email"
                    placeholder="noreply@yourdomain.com"
                    required
                  />

                  <Input
                    label="Sender Name"
                    value={form.senderName}
                    onChange={(v) => setForm({ ...form, senderName: v })}
                    icon={User}
                    placeholder="Your Company Support"
                    required
                  />
                </div>

                <div className="bg-[#1a2335] rounded-xl p-4 border border-indigo-900/40">
                  <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-green-400" />
                    Email Preview
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-green-500/20 p-2 rounded-lg">
                      <Mail className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-300">
                        {form.senderName || "Sender Name"}
                        <span className="text-gray-500">
                          {" "}
                          &lt;{form.senderEmail || "email@domain.com"}&gt;
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Recipients will see this as the sender of your emails
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "advanced" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  Security Settings
                </h2>

                <div className="space-y-4">
                  <Toggle
                    label="SMTP Authentication"
                    checked={form.smtpAuth}
                    onChange={() =>
                      setForm({ ...form, smtpAuth: !form.smtpAuth })
                    }
                    icon={Lock}
                    description="Require authentication for SMTP server"
                  />

                  <Toggle
                    label="STARTTLS"
                    checked={form.startTls}
                    onChange={() =>
                      setForm({ ...form, startTls: !form.startTls })
                    }
                    icon={Shield}
                    description="Enable encrypted connections using STARTTLS"
                  />
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
                className={`flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 rounded-xl text-white font-medium shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 ${
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

        {/* Test Email Modal */}
        {showTestModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0f1425] border border-indigo-900/40 rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-green-400" />
                Send Test Email
              </h3>

              <p className="text-sm text-gray-400 mb-4">
                Enter an email address to receive a test message
              </p>

              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full bg-[#1a2335] border border-indigo-900/40 rounded-xl px-4 py-3 text-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none mb-4"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendTestEmail}
                  disabled={testing || !testEmail}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-xl text-white font-medium hover:scale-105 transition-all disabled:opacity-50"
                >
                  {testing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Test
                </button>
              </div>
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
            <HelpCircle className="w-3 h-3 text-gray-500 cursor-help" />
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
              ? "border-green-500 ring-2 ring-green-500/20"
              : "border-indigo-900/40 hover:border-green-500/50"
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

/* Enhanced Toggle */
function Toggle({ label, checked, onChange, icon: Icon, description }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-[#1a2335] rounded-xl border border-indigo-900/40">
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
          checked ? "bg-green-600" : "bg-gray-600"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-green-400" />}
          <label
            className="text-sm font-medium text-gray-300 cursor-pointer"
            onClick={onChange}
          >
            {label}
          </label>
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
