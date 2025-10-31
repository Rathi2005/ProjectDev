import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/admin/LoginForm";
import AdminHeader from "../components/admin/adminHeader";
import AdminOtpVerification from "../components/admin/adminOtpVerification";

const ADMIN_LOGIN_API = import.meta.env.VITE_ADMIN_LOGIN;
const ADMIN_OTP_VERIFY = import.meta.env.VITE_ADMIN_OTP_VERIFY;

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({ email: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(ADMIN_LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!res.ok) throw new Error("Failed to send OTP");
      setOtpSent(true);
      setSuccess("OTP has been sent to your registered email!");
    } catch (err) {
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and store token
  const handleVerifyOtp = async (otpValue) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(ADMIN_OTP_VERIFY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: otpValue,
        }),
      });

      if (!res.ok) throw new Error("Invalid OTP");

      const data = await res.json();
      if (data?.token) {
        localStorage.setItem("adminToken", data.token); // ✅ save token
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => navigate("/admin/dashboard"), 1500);
      } else {
        throw new Error("Token missing in response");
      }
    } catch (err) {
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1420] text-white flex flex-col">
      <AdminHeader title="Admin Login Portal" />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="flex flex-col items-center bg-[#151b2b] p-8 rounded-2xl shadow-lg w-full max-w-md">
          {!otpSent ? (
            <LoginForm
              formData={formData}
              setFormData={setFormData}
              loading={loading}
              error={error}
              success={success}
              handleLoginSubmit={handleSendOtp}
            />
          ) : (
            <AdminOtpVerification
              email={formData.email}
              loading={loading}
              error={error}
              success={success}
              onVerify={handleVerifyOtp}
            />
          )}

          {otpSent ? (
            <button
              onClick={() => {
                setOtpSent(false);
                setError("");
                setSuccess("");
              }}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300"
            >
              ← Back to Login
            </button>
          ) : null}

          <p className="text-gray-400 text-sm mt-3">
            Only authorized admins can access this portal.
          </p>
        </div>
      </div>
    </div>
  );
}
