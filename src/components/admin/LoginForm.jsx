// src/components/LoginForm.jsx
import { useState } from "react";

export default function LoginForm({
  formData,
  setFormData,
  loading,
  error,
  success,
  handleLoginSubmit,
}) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="w-full max-w-md bg-[#121a2a] rounded-2xl shadow-lg p-8 m-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-indigo-600 p-3 rounded-lg mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-indigo-400"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="text-gray-400 text-center text-sm mt-1">
          Enter your registered admin email to receive an OTP
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleLoginSubmit}>
        <div>
          <label className="text-sm font-medium">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your admin email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 rounded-md bg-[#1c2538] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700/40 rounded-md">
            <p className="text-red-400 text-center text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-900/20 border border-green-700/40 rounded-md">
            <p className="text-green-400 text-center text-sm">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-indigo-600 hover:bg-indigo-700 transition-colors py-2 rounded-md font-semibold mt-4 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
}
