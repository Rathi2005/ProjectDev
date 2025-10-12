import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
const BILLING = import.meta.env.VITE_BILLING;

const BillingAddress = ({ email }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    streetAddress: "",
    streetAddress2: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
    taxId: "",
    contactNumber: "", // added to match the form field
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required field check
    if (
      !formData.companyName ||
      !formData.streetAddress ||
      !formData.city ||
      !formData.state ||
      !formData.postcode ||
      !formData.country ||
      !formData.taxId ||
      !formData.contactNumber
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${BILLING}/${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          streetAddress: formData.streetAddress,
          streetAddress2: formData.streetAddress2,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          country: formData.country,
          taxId: formData.taxId,
          phoneNumber: formData.contactNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Billing address saved successfully!");
        // Wait 2 seconds before redirecting
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (response.status === 400) {
        const messages = Object.values(data).join(", ");
        setError(messages || "Validation error. Please check your input.");
      } else if (response.status === 404) {
        setError(data.message || "User not found.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center min-h-screen bg-[#0e1525] px-6 py-4">
        <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 m-10">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-[#4f46e5] rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6 text-white"
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
            <h2 className="text-2xl font-bold text-white">Billing Address</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* --- Form Fields (unchanged) --- */}
            {/* Company Name */}
            <div className="space-y-1">
              <label className="flex items-center text-gray-300 text-sm">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter company name"
              />
            </div>

            {/* Contact & Tax ID */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="flex items-center text-gray-300 text-sm">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.357 4.071a1 1 0 01-.272 1.034l-2.12 2.12a16.001 16.001 0 006.364 6.364l2.12-2.12a1 1 0 011.034-.272l4.071 1.357a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z"
                    />
                  </svg>
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter contact number"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center text-gray-300 text-sm">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Tax ID (GSTIN) *
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter tax ID"
                />
              </div>
            </div>
            {/* Address Row */}
            <div className="space-y-1">
              <label className="flex items-center text-gray-300 text-sm">
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
                className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter street address"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center text-gray-300 text-gray-400 text-sm">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Street Address 2
              </label>
              <input
                type="text"
                name="streetAddress2"
                value={formData.streetAddress2}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Apartment, suite, unit, etc. (optional)"
              />
            </div>

            {/* Location Row */}
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="flex items-center text-gray-300 text-sm">
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
                  className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="City"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center text-gray-300 text-sm">
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
                  className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="State"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center text-gray-300 text-sm">
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
                      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  Postcode *
                </label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Postcode"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center text-gray-300 text-sm">
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
                  className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Country"
                />
              </div>
            </div>

            {/* --- Rest of the form remains exactly the same --- */}

            {/* Error / Success Messages */}
            {error && (
              <div className="flex items-center p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <svg
                  className="w-5 h-5 text-red-400 mr-2"
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
              <div className="flex items-center p-3 bg-green-900/20 border border-green-700 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-400 mr-2"
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 focus:ring-2 focus:ring-blue-300 focus:outline-none flex items-center justify-center"
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
