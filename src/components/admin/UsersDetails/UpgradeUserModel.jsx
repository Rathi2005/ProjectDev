import React, { useState } from "react";
import { useUpgradeUserMutation } from "../../../hooks/useUpgradeUserMutation";
import {
  Globe,
  Mail,
  Building2,
  X,
  Crown,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function UpgradeUserModal({ user, onClose }) {
  const { mutate, isLoading } = useUpgradeUserMutation();

  const [form, setForm] = useState({
    domainUrl: "",
    supportEmail: "",
    brandName: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!form.domainUrl) {
      newErrors.domainUrl = "Domain URL is required";
    } else if (
      !/^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(
        form.domainUrl,
      )
    ) {
      newErrors.domainUrl = "Please enter a valid domain (e.g., example.com)";
    }

    if (!form.supportEmail) {
      newErrors.supportEmail = "Support email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.supportEmail)) {
      newErrors.supportEmail = "Please enter a valid email address";
    }

    if (!form.brandName) {
      newErrors.brandName = "Brand name is required";
    } else if (form.brandName.length < 2) {
      newErrors.brandName = "Brand name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    mutate(
      {
        userId: user.id, 
        payload: form, 
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop with blur effect */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-[#1a1f35] to-[#0d1225] rounded-2xl w-full max-w-md shadow-2xl border border-indigo-500/30 animate-fadeIn">
        {/* Header with gradient */}
        <div className="relative p-6 border-b border-indigo-500/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">
                  Upgrade User
                </h2>
                <p className="text-sm text-indigo-300/80 mt-1">
                  {user.firstName} {user.lastName} • {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <X className="w-5 h-5 text-indigo-300 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative p-6 space-y-5">
          {/* Domain URL Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-indigo-200">
              <Globe className="w-4 h-4" />
              Domain URL
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="example.com"
                value={form.domainUrl}
                onChange={(e) => {
                  setForm({ ...form, domainUrl: e.target.value });
                  if (errors.domainUrl) setErrors({ ...errors, domainUrl: "" });
                }}
                className={`w-full pl-10 pr-4 py-3 bg-[#0e1525]/50 border ${
                  errors.domainUrl
                    ? "border-red-400"
                    : "border-indigo-500/50 focus:border-indigo-400"
                } rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              />
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            </div>
            {errors.domainUrl && (
              <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.domainUrl}
              </p>
            )}
          </div>

          {/* Support Email Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-indigo-200">
              <Mail className="w-4 h-4" />
              Support Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="support@example.com"
                value={form.supportEmail}
                onChange={(e) => {
                  setForm({ ...form, supportEmail: e.target.value });
                  if (errors.supportEmail)
                    setErrors({ ...errors, supportEmail: "" });
                }}
                className={`w-full pl-10 pr-4 py-3 bg-[#0e1525]/50 border ${
                  errors.supportEmail
                    ? "border-red-400"
                    : "border-indigo-500/50 focus:border-indigo-400"
                } rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            </div>
            {errors.supportEmail && (
              <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.supportEmail}
              </p>
            )}
          </div>

          {/* Brand Name Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-indigo-200">
              <Building2 className="w-4 h-4" />
              Brand Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Your Brand Name"
                value={form.brandName}
                onChange={(e) => {
                  setForm({ ...form, brandName: e.target.value });
                  if (errors.brandName) setErrors({ ...errors, brandName: "" });
                }}
                className={`w-full pl-10 pr-4 py-3 bg-[#0e1525]/50 border ${
                  errors.brandName
                    ? "border-red-400"
                    : "border-indigo-500/50 focus:border-indigo-400"
                } rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              />
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            </div>
            {errors.brandName && (
              <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.brandName}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-indigo-500/30 rounded-xl text-indigo-200 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white font-medium shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Upgrading...</span>
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Upgrade Now</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer note */}
        <div className="relative px-6 pb-4 text-center">
          <p className="text-xs text-indigo-300/50">
            Upgrade will activate premium features for this user
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
