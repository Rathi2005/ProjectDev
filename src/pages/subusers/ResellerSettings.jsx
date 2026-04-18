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
  Trash2,
  Eye,
  EyeOff,
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
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [activeTab, setActiveTab] = useState("branding");
  const [unsavedChanges, setUnsavedChanges] = useState({
    company: false,
    smtp: false,
  });

  const [company, setCompany] = useState({
    companyName: "",
    logoUrl: "",
    supportEmail: "",
    supportPhone: "",
    addressLine1: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    taxId: "",
  });

  const [isCompanyCreated, setIsCompanyCreated] = useState(false);
  const [isSmtpCreated, setIsSmtpCreated] = useState(false);

  const [initialCompany, setInitialCompany] = useState({});

  const [smtp, setSmtp] = useState({
    smtpHost: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
    smtpSenderEmail: "",
    smtpSenderName: "",
    smtpAuth: true,
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
          
          if (Object.keys(c).length > 0 && c.companyName) {
            setIsCompanyCreated(true);
          }
          
          const mapped = {
            companyName: c.companyName || "",
            logoUrl: c.logoUrl || "",
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
          setIsSmtpCreated(true);
          const mapped = {
            smtpHost: s.smtpHost || "",
            smtpPort: s.smtpPort || "",
            smtpUsername: s.smtpUsername || "",
            smtpPassword: s.smtpPassword || "",
            smtpSenderEmail: s.smtpSenderEmail || "",
            smtpSenderName: s.smtpSenderName || "",
            smtpAuth: s.smtpAuth ?? true,
          };
          setSmtp(mapped);
          setInitialSmtp(mapped);
        } else if (smtpRes.status === 404) {
          setIsSmtpCreated(false);
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
    // Validate logoUrl
    if (company.logoUrl && company.logoUrl.trim() !== "") {
      if (!company.logoUrl.startsWith("http://") && !company.logoUrl.startsWith("https://")) {
        toast.error("Logo URL must start with http:// or https://");
        return;
      }
    }

    try {
      setSavingCompany(true);
      
      const payload = { ...company };
      if (payload.logoUrl === "") {
        payload.logoUrl = null; // or send empty string, API says null/"" is fine
      }

      const res = await fetch(COMPANY_API, {
        method: isCompanyCreated ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
        if (!data.message && text) {
           if (typeof data === 'object' && Object.keys(data).length > 0) {
             data.message = Object.values(data).join(", ");
           } else {
             data.message = text; // map raw text
           }
        }
      } catch (e) {
        // Ignored
      }

      if (res.ok) {
        setInitialCompany({ ...company });
        setUnsavedChanges((prev) => ({ ...prev, company: false }));
        setIsCompanyCreated(true);
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

  const handleDeleteSmtp = async () => {
    if (!window.confirm("Are you sure you want to delete SMTP settings? Emails will fall back to Admin defaults.")) return;
    try {
      setSavingSmtp(true);
      const res = await fetch(SMTP_API, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIsSmtpCreated(false);
        const blank = {
          smtpHost: "", smtpPort: "", smtpUsername: "", smtpPassword: "",
          smtpSenderEmail: "", smtpSenderName: "", smtpAuth: true
        };
        setSmtp(blank);
        setInitialSmtp(blank);
        toast.success("SMTP settings have been removed.");
      } else {
        let data = {};
        try {
          const text = await res.text();
          data = text ? JSON.parse(text) : {};
          if (!data.message && text) {
             if (typeof data === 'object' && Object.keys(data).length > 0) {
               data.message = Object.values(data).join(", ");
             } else {
               data.message = text;
             }
          }
        } catch (e) {}
        toast.error(data.message || "Failed to delete SMTP settings");
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleSmtpSubmit = async () => {
    if (!isSmtpCreated && (!smtp.smtpPassword || smtp.smtpPassword.trim() === "")) {
      toast.error("SMTP Password is required when creating settings.");
      return;
    }

    try {
      setSavingSmtp(true);

      const payload = {
        smtpHost: smtp.smtpHost,
        smtpPort: Number(smtp.smtpPort),
        smtpUsername: smtp.smtpUsername,
        smtpSenderEmail: smtp.smtpSenderEmail,
        smtpSenderName: smtp.smtpSenderName,
        smtpAuth: smtp.smtpAuth,
        domainUrl: "https://placeholder-domain.com", // Temporary bypass for backend validation
        brandName: "N/A"                             // Temporary bypass for backend validation
      };

      if (smtp.smtpPassword && smtp.smtpPassword.trim() !== "") {
        payload.smtpPassword = smtp.smtpPassword;
      } else {
        payload.smtpPassword = "";
      }

      let res = await fetch(SMTP_API, {
        method: isSmtpCreated ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        const text = await res.text();
        try {
          data = JSON.parse(text);
          if (!data.message && typeof data === 'object' && Object.keys(data).length > 0) {
            data.message = Object.values(data).join(", ");
          }
        } catch(e) {
          data = { message: text };
        }
      } catch (e) {}

      // If SMTP already exists → Update it
      if (!res.ok && data.message && data.message.includes("already exist")) {
        res = await fetch(SMTP_API, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        try {
          const text = await res.text();
          try {
            data = JSON.parse(text);
            if (!data.message && typeof data === 'object' && Object.keys(data).length > 0) {
              data.message = Object.values(data).join(", ");
            }
          } catch(e) {
            data = { message: text };
          }
        } catch (e) {}
      }

      if (res.ok) {
        const resetData = { ...smtp, smtpPassword: "" };
        setInitialSmtp(resetData);
        setSmtp(resetData);
        setUnsavedChanges((prev) => ({ ...prev, smtp: false }));
        setIsSmtpCreated(true);
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

  const triggerTestModal = () => {
    if (!smtp.smtpHost || !smtp.smtpPort || !smtp.smtpUsername || !smtp.smtpPassword) {
      toast.error("Please fill all required SMTP fields first");
      return;
    }
    setTestRecipient(smtp.smtpSenderEmail || smtp.smtpUsername || "");
    setShowTestModal(true);
  };

  const handleTestSmtp = async () => {
    if (!testRecipient) {
      toast.error("Recipient email is required for the test");
      return;
    }

    setTestingSmtp(true);
    try {
      const payload = {
        host: smtp.smtpHost,
        port: Number(smtp.smtpPort),
        user: smtp.smtpUsername,
        pass: smtp.smtpPassword,
        from: smtp.smtpSenderEmail || smtp.smtpUsername,
        to: testRecipient,
      };

      const res = await fetch("https://getwebup.com/server/smtp/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status === "success" || data.success) {
        toast.success("Test email sent successfully!");
        setShowTestModal(false);
      } else {
        toast.error(data.message || "Failed to send test email");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while testing SMTP");
    } finally {
      setTestingSmtp(false);
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
                        label="Logo URL"
                        value={company.logoUrl}
                        onChange={(v) =>
                          setCompany({ ...company, logoUrl: v })
                        }
                        icon={Globe}
                        placeholder="https://example.com/logo.png"
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
                        required={!isSmtpCreated}
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

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-indigo-900/40">
                    <div>
                      {isSmtpCreated && (
                        <button
                          onClick={handleDeleteSmtp}
                          type="button"
                          className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-all border border-red-900/40 hover:scale-[1.02]"
                        >
                          <Trash2 className="w-4 h-4 mb-[1px]" />
                          Remove Configuration
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {unsavedChanges.smtp && (
                        <button
                          onClick={handleDiscardSmtp}
                          className="px-6 py-3 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={triggerTestModal}
                        disabled={testingSmtp || unsavedChanges.smtp}
                        className={`flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-3 rounded-xl text-white font-medium shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100`}
                      >
                        <Mail className="w-4 h-4" />
                        Test SMTP
                      </button>
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
              </div>
            )}
          </div>
        )}
      </main>

      {/* Test SMTP Modal Overlay */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
          <div className="bg-[#0f1425] border border-indigo-900/40 rounded-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6 border-b border-indigo-900/40 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  Send Test Email
                </h3>
                <p className="text-sm text-gray-400 mt-1">Specify where to dispatch the connection test.</p>
              </div>
            </div>
            <div className="p-6">
              <Input
                label="Recipient Email Address"
                value={testRecipient}
                onChange={setTestRecipient}
                icon={Mail}
                placeholder="target@example.com"
                required
              />
            </div>
            <div className="p-6 bg-[#0a0d1a] border-t border-indigo-900/40 flex items-center justify-end gap-4">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors outline-none"
                disabled={testingSmtp}
              >
                Cancel
              </button>
              <button
                onClick={handleTestSmtp}
                disabled={testingSmtp || !testRecipient}
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl transition-all font-medium disabled:opacity-50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
              >
                {testingSmtp ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mb-[1px]" />
                    Dispatch Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
  const [showPassword, setShowPassword] = useState(false);

  const finalType = type === "password" ? (showPassword ? "text" : "password") : type;

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
          type={finalType}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => !disabled && setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          min={min}
          max={max}
          required={required}
          disabled={disabled}
          className={`w-full bg-[#1a2335] border rounded-xl pl-4 py-3 ${type === "password" || suffix ? "pr-12" : "pr-4"} text-gray-200 outline-none transition-all ${
            disabled
              ? "opacity-50 cursor-not-allowed border-gray-700"
              : focused
                ? "border-indigo-500 ring-2 ring-indigo-500/20"
                : "border-indigo-900/40 hover:border-indigo-500/50"
          }`}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors outline-none"
          >
            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        )}
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default ResellerSettings;