import React, { useState, useEffect } from "react";
import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";
import {
  Save,
  Loader2,
  Building2,
  Mail,
  Server,
  MapPin,
  Phone,
  Globe,
  Lock,
  User,
  Info,
  ArrowLeft,
  Briefcase,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const COMPANY_API = `${BASE_URL}/api/reseller/company`;
const SMTP_API = `${BASE_URL}/api/reseller/domain`;

const ResellerSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [activeTab, setActiveTab] = useState("branding");
  const [unsavedChanges, setUnsavedChanges] = useState({
    company: false,
    smtp: false,
  });

  const [company, setCompany] = useState({
    companyName: "",
    supportEmail: "",
    supportPhone: "",
    addressLine1: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    taxId: "",
  });

  const [initialCompany, setInitialCompany] = useState({});

  const [smtp, setSmtp] = useState({
    smtpHost: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
    smtpSenderEmail: "",
    smtpSenderName: "",
    smtpAuth: true,
    domainUrl: "",
    brandName: "",
  });

  const [initialSmtp, setInitialSmtp] = useState({});

  const token = localStorage.getItem("token");
  const [smtpTestLoading, setSmtpTestLoading] = useState(false);
  const [smtpLogs, setSmtpLogs] = useState([]);
  const [smtpTestStatus, setSmtpTestStatus] = useState(null);

  // ✅ GET APIs — prefill both forms on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);

        const [companyRes, smtpRes] = await Promise.all([
          fetch(COMPANY_API, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(SMTP_API, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Prefill company form
        if (companyRes.ok) {
          const json = await companyRes.json();
          const c = json.data || json;
          const mapped = {
            companyName: c.companyName || "",
            supportEmail: c.supportEmail || "",
            supportPhone: c.supportPhone || "",
            addressLine1: c.addressLine1 || "",
            city: c.city || "",
            state: c.state || "",
            country: c.country || "",
            zipCode: c.zipCode || "",
            taxId: c.taxId || "",
          };
          setCompany(mapped);
          setInitialCompany(mapped);
        }

        // Prefill SMTP form
        if (smtpRes.ok) {
          const json = await smtpRes.json();
          const s = json.data || json;
          const mapped = {
            smtpHost: s.smtpHost || "",
            smtpPort: s.smtpPort || "",
            smtpUsername: s.smtpUsername || "",
            smtpPassword: s.smtpPassword || "",
            smtpSenderEmail: s.smtpSenderEmail || "",
            smtpSenderName: s.smtpSenderName || "",
            smtpAuth: s.smtpAuth ?? true,
            domainUrl: s.domainUrl || "",
            brandName: s.brandName || "",
          };
          setSmtp(mapped);
          setInitialSmtp(mapped);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const changed = Object.keys(company).some(
      (key) => company[key] !== initialCompany[key],
    );
    setUnsavedChanges((prev) => ({ ...prev, company: changed }));
  }, [company, initialCompany]);

  useEffect(() => {
    const changed = Object.keys(smtp).some(
      (key) => smtp[key] !== initialSmtp[key],
    );
    setUnsavedChanges((prev) => ({ ...prev, smtp: changed }));
  }, [smtp, initialSmtp]);

  const handleCompanySubmit = async () => {
    try {
      setSavingCompany(true);
      const res = await fetch(COMPANY_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(company),
      });

      const data = await res.json();

      if (res.ok) {
        setInitialCompany({ ...company });
        setUnsavedChanges((prev) => ({ ...prev, company: false }));
        toast.success("Company branding saved successfully");
      } else {
        toast.error(data.message || "Failed to save company branding");
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setSavingCompany(false);
    }
  };

  const handleSmtpSubmit = async () => {
    try {
      setSavingSmtp(true);

      const payload = {
        smtpHost: smtp.smtpHost,
        smtpPort: Number(smtp.smtpPort),
        smtpUsername: smtp.smtpUsername,
        smtpPassword: smtp.smtpPassword,
        smtpSenderEmail: smtp.smtpSenderEmail,
        smtpSenderName: smtp.smtpSenderName,
        smtpAuth: smtp.smtpAuth,
        domainUrl: smtp.domainUrl,
        brandName: smtp.brandName,
      };

      let res = await fetch(SMTP_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data = await res.json();

      // If SMTP already exists → Update it
      if (!res.ok && data.message?.includes("already exist")) {
        res = await fetch(SMTP_API, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        data = await res.json();
      }

      if (res.ok) {
        setInitialSmtp({ ...smtp });
        setUnsavedChanges((prev) => ({ ...prev, smtp: false }));
        toast.success("SMTP settings saved successfully");
      } else {
        toast.error(data.message || "Failed to configure SMTP");
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleSmtpTest = async () => {
    // ✅ Validate before sending
    if (
      !smtp.smtpHost ||
      !smtp.smtpPort ||
      !smtp.smtpUsername ||
      !smtp.smtpPassword ||
      !smtp.smtpSenderEmail
    ) {
      toast.error("Please fill in all SMTP fields before testing");
      return;
    }

    try {
      setSmtpTestLoading(true);
      setSmtpLogs([]);
      setSmtpTestStatus(null);

      const payload = {
        host: smtp.smtpHost,
        port: Number(smtp.smtpPort),
        from: smtp.smtpSenderEmail,
        to: smtp.smtpSenderEmail,
        user: smtp.smtpUsername,
        pass: smtp.smtpPassword,
      };

      const res = await fetch("https://getwebup.com/server/smtp/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "success") {
        setSmtpLogs(data.data.logs || []);
        setSmtpTestStatus("success");
        toast.success("SMTP test successful");
      } else {
        setSmtpLogs(data.data.logs || []);
        setSmtpTestStatus(data.message || "SMTP test failed"); // ✅ IMPORTANT
        toast.error(data.message || "SMTP test failed");
      }
    } catch (error) {
      setSmtpTestStatus(data.message || "SMTP test failed");
      toast.error("SMTP test failed");
    } finally {
      setSmtpTestLoading(false);
    }
  };

  const handleDiscardCompany = () => {
    setCompany(initialCompany);
    toast.success("Company changes discarded");
  };

  const handleDiscardSmtp = () => {
    setSmtp(initialSmtp);
    toast.success("SMTP changes discarded");
  };

  const tabs = [
    { id: "branding", label: "Company Branding", icon: Building2 },
    { id: "email", label: "Email Configuration", icon: Mail },
  ];

  const calculateCompanyCompletion = () => {
    const requiredFields = ["companyName", "supportEmail", "supportPhone"];
    const filled = requiredFields.filter(
      (field) => company[field] && company[field].trim() !== "",
    ).length;
    return Math.round((filled / requiredFields.length) * 100);
  };

  return (
    <div className="bg-[#0a0f1e] text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-indigo-900/30">
        <Header />
      </div>

      <main className="flex-1 mt-[72px] px-6 lg:px-10 py-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-indigo-600/10 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
              </button>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Reseller Configuration
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Configure branding and email services for your white-label
                  platform
                </p>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-3 bg-[#0f1425] px-4 py-2 rounded-xl border border-indigo-900/40">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-gray-300">Setup Progress:</span>
            </div>
            <div className="w-24 h-2 bg-[#1a2335] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${calculateCompanyCompletion()}%` }}
              />
            </div>
            <span className="text-sm font-medium text-indigo-400">
              {calculateCompanyCompletion()}%
            </span>
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
          <div className="space-y-6">
            {/* ── Branding Tab ── */}
            {activeTab === "branding" && (
              <div className="bg-[#0f1425] border border-indigo-900/40 rounded-2xl p-8 shadow-lg">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-400" />
                      Company Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Company Name"
                        value={company.companyName}
                        onChange={(v) =>
                          setCompany({ ...company, companyName: v })
                        }
                        icon={Building2}
                        placeholder="Enter company name"
                        required
                      />
                      <Input
                        label="Support Email"
                        value={company.supportEmail}
                        onChange={(v) =>
                          setCompany({ ...company, supportEmail: v })
                        }
                        icon={Mail}
                        placeholder="support@company.com"
                        type="email"
                        required
                      />
                      <Input
                        label="Support Phone"
                        value={company.supportPhone}
                        onChange={(v) =>
                          setCompany({ ...company, supportPhone: v })
                        }
                        icon={Phone}
                        placeholder="+1 234 567 8900"
                        type="tel"
                        required
                      />
                      <Input
                        label="Tax ID / GSTIN"
                        value={company.taxId}
                        onChange={(v) => setCompany({ ...company, taxId: v })}
                        icon={CreditCard}
                        placeholder="Enter tax ID"
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-indigo-400" />
                      Address Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Address Line"
                        value={company.addressLine1}
                        onChange={(v) =>
                          setCompany({ ...company, addressLine1: v })
                        }
                        icon={MapPin}
                        placeholder="Street address"
                      />
                      <Input
                        label="City"
                        value={company.city}
                        onChange={(v) => setCompany({ ...company, city: v })}
                        icon={Globe}
                        placeholder="City"
                      />
                      <Input
                        label="State"
                        value={company.state}
                        onChange={(v) => setCompany({ ...company, state: v })}
                        icon={Globe}
                        placeholder="State"
                      />
                      <Input
                        label="Country"
                        value={company.country}
                        onChange={(v) => setCompany({ ...company, country: v })}
                        icon={Globe}
                        placeholder="Country"
                      />
                      <Input
                        label="Zip Code"
                        value={company.zipCode}
                        onChange={(v) => setCompany({ ...company, zipCode: v })}
                        icon={MapPin}
                        placeholder="Zip/Postal code"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-indigo-900/40">
                    {unsavedChanges.company && (
                      <button
                        onClick={handleDiscardCompany}
                        className="px-6 py-3 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleCompanySubmit}
                      disabled={savingCompany || !unsavedChanges.company}
                      className={`flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 rounded-xl text-white font-medium shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100`}
                    >
                      {savingCompany ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {savingCompany
                        ? "Saving..."
                        : unsavedChanges.company
                          ? "Save Changes"
                          : "Saved"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Email Configuration Tab ── */}
            {activeTab === "email" && (
              <div className="bg-[#0f1425] border border-indigo-900/40 rounded-2xl p-8 shadow-lg">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                      <Server className="w-5 h-5 text-indigo-400" />
                      SMTP Server Settings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="SMTP Host"
                        value={smtp.smtpHost}
                        onChange={(v) => setSmtp({ ...smtp, smtpHost: v })}
                        icon={Server}
                        placeholder="smtp.gmail.com"
                        required
                      />
                      <Input
                        label="SMTP Port"
                        value={smtp.smtpPort}
                        onChange={(v) =>
                          setSmtp({ ...smtp, smtpPort: parseInt(v) || "" })
                        }
                        icon={Server}
                        placeholder="587"
                        type="number"
                        required
                      />
                      <Input
                        label="SMTP Username"
                        value={smtp.smtpUsername}
                        onChange={(v) => setSmtp({ ...smtp, smtpUsername: v })}
                        icon={User}
                        placeholder="user@example.com"
                        required
                      />
                      <Input
                        label="SMTP Password"
                        value={smtp.smtpPassword}
                        onChange={(v) => setSmtp({ ...smtp, smtpPassword: v })}
                        icon={Lock}
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-indigo-400" />
                      Email Settings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Sender Email"
                        value={smtp.smtpSenderEmail}
                        onChange={(v) =>
                          setSmtp({ ...smtp, smtpSenderEmail: v })
                        }
                        icon={Mail}
                        placeholder="noreply@company.com"
                        type="email"
                        required
                      />
                      <Input
                        label="Sender Name"
                        value={smtp.smtpSenderName}
                        onChange={(v) =>
                          setSmtp({ ...smtp, smtpSenderName: v })
                        }
                        icon={User}
                        placeholder="Your Company"
                        required
                      />
                      <Input
                        label="Domain URL"
                        value={smtp.domainUrl}
                        onChange={(v) => setSmtp({ ...smtp, domainUrl: v })}
                        icon={Globe}
                        placeholder="getwebup.com"
                        required
                      />
                      <Input
                        label="Brand Name"
                        value={smtp.brandName}
                        onChange={(v) => setSmtp({ ...smtp, brandName: v })}
                        icon={Building2}
                        placeholder="Your Brand"
                      />
                      <div className="flex items-center gap-3 mt-2">
                        <input
                          type="checkbox"
                          id="smtpAuth"
                          checked={smtp.smtpAuth}
                          onChange={(e) =>
                            setSmtp({ ...smtp, smtpAuth: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-indigo-900/40 bg-[#1a2335] text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor="smtpAuth"
                          className="text-sm text-gray-300"
                        >
                          SMTP Authentication Required
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Test SMTP — only inside email tab, with validation */}
                  <div className="flex flex-col gap-3 pt-2">
                    <div>
                      <button
                        onClick={handleSmtpTest}
                        disabled={smtpTestLoading}
                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-2 rounded-lg text-white font-medium shadow hover:scale-105 transition disabled:opacity-50"
                      >
                        {smtpTestLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Test SMTP"
                        )}
                      </button>
                    </div>

                    {smtpTestStatus && (
                      <div
                        className={`text-sm font-medium ${
                          smtpTestStatus === "success"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {smtpTestStatus === "success"
                          ? "✅ SMTP connection successful"
                          : `❌ ${smtpTestStatus}`}
                      </div>
                    )}

                    {smtpLogs.length > 0 && (
                      <div className="bg-black/40 border border-indigo-900/40 rounded-xl p-4 max-h-80 overflow-y-auto">
                        <h3 className="text-sm text-gray-300 mb-3">
                          SMTP Logs
                        </h3>
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
                            <span className="opacity-60 mr-2">
                              [{log.time}]
                            </span>
                            {log.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-indigo-900/40">
                    {unsavedChanges.smtp && (
                      <button
                        onClick={handleDiscardSmtp}
                        className="px-6 py-3 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleSmtpSubmit}
                      disabled={savingSmtp || !unsavedChanges.smtp}
                      className={`flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 rounded-xl text-white font-medium shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100`}
                    >
                      {savingSmtp ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {savingSmtp
                        ? "Saving..."
                        : unsavedChanges.smtp
                          ? "Save Changes"
                          : "Saved"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

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
  disabled = false,
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
          onFocus={() => !disabled && setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          min={min}
          max={max}
          required={required}
          disabled={disabled}
          className={`w-full bg-[#1a2335] border rounded-xl px-4 py-3 text-gray-200 outline-none transition-all ${
            disabled
              ? "opacity-50 cursor-not-allowed border-gray-700"
              : focused
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

export default ResellerSettings;