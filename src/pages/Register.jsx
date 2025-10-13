import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import OtpVerification from "../components/OtpVerification";
import BillingAddress from "../components/BillingAddress";
import { Link } from "react-router-dom";

const VALIDATE_EMAIL = import.meta.env.VITE_VALIDATE;
const INITIATE_VERIFICATION = import.meta.env.VITE_INITIATE_VERIFICATION;

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

export default function CreateAccount() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpForm, setShowOtp] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // basic client-side check
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      // 1) Validate email availability
      const valRes = await fetch(VALIDATE_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      // If validation endpoint returns non-JSON text, guard parse
      let valData = {};
      try {
        valData = await valRes.json();
      } catch (err) {
        valData = {};
      }

      // If endpoint responded with e.g. 4xx or returned isEmailTaken flag
      if (!valRes.ok) {
        // If server returns explicit message structure handle it
        const msg =
          valData?.message || "Email validation failed. Please try again.";
        setError(msg);
        setLoading(false);
        return;
      }

      // Expecting: {"isEmailTaken": boolean}
      if (valData.isEmailTaken) {
        setError("This email is already registered. Please use another one.");
        setLoading(false);
        return;
      }

      // 2) If email NOT taken -> call initiate-verification to send OTP
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const initRes = await fetch(INITIATE_VERIFICATION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let initData = {};
      try {
        initData = await initRes.json();
      } catch (err) {
        initData = {};
      }

      if (initRes.ok) {
        // Success -> OTP sent
        setSuccessMsg(
          initData.message ||
            "Verification OTP sent to your email. Please check."
        );
        // small delay so user sees success toast, then show OTP form
        setTimeout(() => setShowOtp(true), 700);
      } else if (initRes.status === 409) {
        // Email already exists (server-side race condition)
        setError(
          initData.message || "An account with this email already exists."
        );
      } else if (initRes.status === 400) {
        // validation errors (object with fields)
        // pick first error message to display
        const firstError =
          Object.values(initData)[0] || "Validation failed. Check your input.";
        setError(firstError);
      } else {
        setError("Could not initiate verification. Please try again.");
      }
    } catch (err) {
      console.error("Registration flow error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0e1525] text-white px-4">
        {!showOtpForm && !showBilling ? (
          <div className="w-full max-w-md bg-[#121a2a] rounded-2xl shadow-lg p-8 m-10">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-indigo-600 p-3 rounded-lg mb-3">
                <LogoIcon />
              </div>
              <h1 className="text-2xl font-bold">Create Your Account</h1>
              <p className="text-gray-400 text-center text-sm mt-1">
                Join our platform to access exclusive features and content
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <label className="text-sm font-medium">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-[#1c2538] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-[#1c2538] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

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

              <div className="flex space-x-3">
                <div className="flex-1">
                  <label className="text-sm font-medium">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-[#1c2538] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-[#1c2538] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-700/40 rounded-md">
                  <p className="text-red-400 text-center text-sm">{error}</p>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-green-900/20 border border-green-700/40 rounded-md">
                  <p className="text-green-400 text-center text-sm">
                    {successMsg}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-indigo-600 hover:bg-indigo-700 transition-colors py-2 rounded-md font-semibold mt-4 ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Processing..." : "Create Account"}
              </button>

              <p className="text-center text-sm text-gray-400 mt-3">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-400 hover:underline">
                  Sign In
                </Link>
              </p>

              <p className="text-center text-xs text-gray-500 mt-2">
                By creating an account, you agree to our{" "}
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
        ) : showOtpForm ? (
          <OtpVerification
            email={formData.email}
            firstName={formData.firstName}
            onVerified={() => {
              setShowOtp(false);
              setShowBilling(true);
            }}
            toggle={0}  // 0 -> registration otp
          />
        ) : (
          <BillingAddress email={formData.email} firstName={formData.firstName} />
        )} 
      </div>
      <Footer />
    </div>
  );
}
