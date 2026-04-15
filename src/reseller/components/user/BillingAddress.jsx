import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import { apiFetch } from "../../utils/api";
// const BILLING = import.meta.env.VITE_BILLING;
const BILLING = `${BASE_URL}/api/reseller/auth/billing`;

const BillingAddress = ({ email }) => {
  const token = localStorage.getItem("token");

  let userEmail = "";

  if (token) {
    const decoded = jwtDecode(token);
    userEmail = decoded.email; // make sure backend sends email in token
  }

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: userEmail,
    companyName: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.streetAddress ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode ||
      !formData.country
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await apiFetch("/api/reseller/auth/billing", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setSuccess(data.message || "Billing address saved successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1525]">
      <div className="container mx-auto px-2 sm:px-4 py-7 sm:py-8">
        {/* Wider container on mobile, max-w-4xl on larger screens */}
        <div className="w-full mx-auto bg-gray-800 p-3 sm:p-5 md:p-8 rounded-xl shadow-lg border border-gray-700 my-1 sm:my-3 md:my-8">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#4f46e5] rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <svg
                className="w-4 h-4 md:w-6 md:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Billing Address
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <label className="flex items-center text-gray-300 text-sm font-medium">
                <svg
                  className="w-4 h-4 mr-2 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7h18M3 12h18M3 17h18"
                  />
                </svg>
                Company Name
              </label>

              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Company name (optional)"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center text-gray-300 text-sm font-medium">
                <svg
                  className="w-4 h-4 mr-2 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a2 2 0 011.94 1.515l.7 2.8a2 2 0 01-.45 1.91l-1.27 1.27a16 16 0 006.586 6.586l1.27-1.27a2 2 0 011.91-.45l2.8.7A2 2 0 0121 18.72V22a2 2 0 01-2 2h-1C9.163 24 0 14.837 0 3V2a2 2 0 012-2h1z"
                  />
                </svg>
                Phone Number
              </label>

              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+91XXXXXXXXXX"
              />
            </div>
            {/* Street Address - Full width */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-300 text-sm font-medium">
                <svg
                  className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Street Address *
              </label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
                placeholder="Enter street address"
              />
            </div>

            {/* Location Row - Optimized for mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-gray-300 text-sm font-medium">
                  <svg
                    className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-gray-300 text-sm font-medium">
                  <svg
                    className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
                  placeholder="State"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-gray-300 text-sm font-medium">
                  <svg
                    className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  ZipCode *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
                  placeholder="Postcode"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-gray-300 text-sm font-medium">
                  <svg
                    className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
                  placeholder="Country"
                />
              </div>
            </div>

            {/* Error / Success Messages */}
            {error && (
              <div className="flex items-start p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <svg
                  className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-4 px-4 rounded-lg font-semibold transition-all duration-300 focus:ring-2 focus:ring-blue-300 focus:outline-none flex items-center justify-center text-base"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {loading ? "Saving..." : "Save Billing Address"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-center text-gray-400 text-sm">
              Need help?{" "}
              <a
                href="#"
                className="text-indigo-500 hover:text-indigo-600 font-medium"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingAddress;
