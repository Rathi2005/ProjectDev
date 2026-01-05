import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import LoginForm from "../../components/admin/LoginForm";
import AdminHeader from "../../components/admin/adminHeader";
import AdminOtpVerification from "../../components/admin/adminOtpVerification";
import { toast } from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const ADMIN_LOGIN_API = import.meta.env.VITE_ADMIN_LOGIN;
const ADMIN_OTP_VERIFY = import.meta.env.VITE_ADMIN_OTP_VERIFY;
const ADMIN_RESEND_OTP =
  import.meta.env.VITE_ADMIN_RESEND_OTP || `${BASE_URL}/admin/login/resend-otp`;

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({ email: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef(null);

  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");

  // Start countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      countdownRef.current = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    }
    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [resendCountdown]);

  // Token validation for auto-login
  if (adminToken) {
    try {
      const decoded = jwtDecode(adminToken);
      if (decoded.exp * 1000 > Date.now()) {
        return <Navigate to="/admin/dashboard" replace />;
      }
    } catch {
      localStorage.removeItem("adminToken");
    }
  }

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
      setSuccess("OTP has been sent!");
      setResendCountdown(60); // Set 60 seconds countdown
      toast.success("OTP sent to your email!");
    } catch (err) {
      setError(err.message || "Something went wrong!");
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP");
      }
      if (data?.token) {
        localStorage.setItem("adminToken", data.token);
        toast.success("LoggedIn Successfully!");
        setTimeout(() => navigate("/admin/dashboard"), 1200);
      } else {
        throw new Error("Token missing in response");
      }
    } catch (err) {
      setError(err.message || "Something went wrong!");
      toast.error(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resendLoading) return;

    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(ADMIN_RESEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!res.ok) throw new Error("Failed to resend OTP");

      setResendCountdown(60); // Reset countdown
      setSuccess("New OTP has been sent!");
      toast.success("New OTP sent to your email!");
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
      toast.error(err.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
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
              onResendOtp={handleResendOtp}
              resendLoading={resendLoading}
              resendCountdown={resendCountdown}
            />
          )}

          {otpSent ? (
            <button
              onClick={() => {
                setOtpSent(false);
                setError("");
                setSuccess("");
                setResendCountdown(0);
              }}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Login
            </button>
          ) : null}

          <p className="text-gray-400 text-sm mt-3 text-center">
            Only authorized admins can access this portal.
          </p>
        </div>
      </div>
    </div>
  );
}
