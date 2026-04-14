import { useState, useEffect } from "react";
import Header from "../components/user/Header";
import Footer from "../components/user/Footer";
import { useNavigate, Link } from "react-router-dom";
import OtpVerification from "../components/user/OtpVerification";
import ResetPassword from "../components/user/ResetPassword";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { apiFetch } from "../utils/api";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const LOGIN_API = `${BASE_URL}/api/reseller/auth/login/password`;
const OTP_INITIATE_API = `${BASE_URL}/api/reseller/auth/login/otp/initiate`;
const FORGET_PASSWORD_API = `${BASE_URL}/api/reseller/auth/password/forgot/initiate`;

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
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [loginWithOtp, setLoginWithOtp] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1=OTP input, 2=Password input

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("rToken");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (!isExpired) {
        navigate("/dashboard");
      } else {
        localStorage.removeItem("rToken");
      }
    } catch {
      localStorage.removeItem("rToken");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 👉 OTP FLOW
      if (loginWithOtp) {
        const data = await apiFetch("/api/reseller/auth/login/otp/initiate", {
          method: "POST",
          body: JSON.stringify({ email: formData.email }),
        });

        toast.success(data.message || "OTP sent!");

        setShowOtpForm(true); 
        return;
      }

      // 👉 PASSWORD FLOW (existing)
      const data = await apiFetch("/api/reseller/auth/login/password", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast.success(data.message || "Login successful!");
      localStorage.setItem("rToken", data.token);

      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email first.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch(
        "/api/reseller/auth/password/forgot/initiate",
        {
          method: "POST",
          body: JSON.stringify({ email: formData.email }),
        },
      );

      toast.success(data.message || "OTP has been sent!");

      setResetPasswordMode(true);
      setResetStep(1);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center bg-[#0e1525] text-white px-4">
        {!resetPasswordMode && !showOtpForm ? (
          <div className="w-full max-w-md bg-[#121a2a] rounded-2xl shadow-lg p-8 m-8">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-indigo-600 p-3 rounded-lg mb-3">
                <LogoIcon />
              </div>
              <h1 className="text-2xl font-bold">
                {loginWithOtp ? "Login with OTP" : "Login to Your Account"}
              </h1>
              <p className="text-gray-400 text-center text-sm mt-1">
                {loginWithOtp
                  ? "Enter your email to receive an OTP"
                  : "Enter your credentials to access your dashboard"}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleLoginSubmit}>
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

              {!loginWithOtp && (
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
                  <p
                    onClick={handleForgotPassword}
                    className="text-sm text-indigo-400 hover:underline mt-2 cursor-pointer"
                  >
                    Forgot password?
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-700/40 rounded-md">
                  <p className="text-red-400 text-center text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-900/20 border border-green-700/40 rounded-md">
                  <p className="text-green-400 text-center text-sm">
                    {success}
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
                {loading
                  ? loginWithOtp
                    ? "Sending OTP..."
                    : "Logging in..."
                  : loginWithOtp
                    ? "Send OTP"
                    : "Login"}
              </button>

              <p
                onClick={() => setLoginWithOtp(!loginWithOtp)}
                className="text-center text-sm text-indigo-400 hover:underline mt-3 cursor-pointer"
              >
                {loginWithOtp
                  ? "Login with password instead"
                  : "Login with OTP instead"}
              </p>

              <p className="text-center text-sm text-gray-400 mt-3">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-400 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        ) : resetPasswordMode ? (
          <ResetPassword
            email={formData.email}
            onSuccess={() => {
              setResetPasswordMode(false);
              setFormData({ email: "", password: "" });
            }}
          />
        ) : (
          <OtpVerification
            email={formData.email}
            onVerified={() => navigate("/dashboard")}
            toggle={1}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
