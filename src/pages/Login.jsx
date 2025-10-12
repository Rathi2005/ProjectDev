import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate, Link } from "react-router-dom";
import OtpVerification from "../components/OtpVerification"; // OTP component

const LOGIN_API = import.meta.env.VITE_LOGIN;
const OTP_INITIATE_API = import.meta.env.VITE_LOGIN_OTP; // e.g., "https://somani-backend-b9c073c8ea97.herokuapp.com/api/login/otp/initiate"

const LogoIcon = () => (
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
);

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Added success state
  const [loading, setLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Step 1: Validate login credentials
      const response = await fetch(LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Step 2: Initiate OTP
        const otpRes = await fetch(OTP_INITIATE_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });

        const otpData = await otpRes.json();

        if (otpRes.ok) {
          setSuccess(otpData.message || "OTP has been sent to your email.");
          // Show OTP form after 1 second to let user see success
          setTimeout(() => setShowOtpForm(true), 1000);
        } else if (otpRes.status === 404) {
          setError(otpData.message || "No account found with this email address.");
        } else {
          setError("Failed to initiate OTP. Please try again.");
        }
      } else if (response.status === 401) {
        setError(data.message || "Incorrect email or password.");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0e1525] text-white px-4">
        {!showOtpForm ? (
          <div className="w-full max-w-md bg-[#121a2a] rounded-2xl shadow-lg p-8 m-10">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-indigo-600 p-3 rounded-lg mb-3">
                <LogoIcon />
              </div>
              <h1 className="text-2xl font-bold">Login to Your Account</h1>
              <p className="text-gray-400 text-center text-sm mt-1">
                Enter your credentials to access your dashboard
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded-md bg-[#1c2538] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded-md bg-[#1c2538] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-700/40 rounded-md">
                  <p className="text-red-400 text-center text-sm">{error}</p>
                </div>
              )}

              {/* SUCCESS MESSAGE */}
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
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center text-sm text-gray-400 mt-3">
                Don't have an account?{" "}
                <Link to="/register" className="text-indigo-400 hover:underline">
                  Sign Up
                </Link>
              </p>

              <p className="text-center text-xs text-gray-500 mt-2">
                By logging in, you agree to our{" "}
                <a href="#" className="underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline">
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </div>
        ) : (
          <OtpVerification
            email={formData.email}
            onVerified={() => navigate("/dashboard")}
            toggle={1} // 1 -> login otp
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
