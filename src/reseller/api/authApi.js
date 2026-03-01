// reseller-app/api/authApi.js
import api from "./axiosInstance";
const BASE_URL = import.meta.env.VITE_RESELLER_BASE_URL;

// 🔐 Password Login
export const loginWithPassword = async (payload) => {
  const res = await fetch(
    `${BASE_URL}/api/reseller/auth/login/password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

// 📩 OTP Initiate
export const initiateOtpLogin = async (payload) => {
  const res = await fetch(
    `${BASE_URL}/api/reseller/auth/login/otp/initiate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "OTP initiation failed");
  }

  return data;
};

// ✅ OTP Verify
export const verifyOtpLogin = async (payload) => {
  const res = await fetch(
    `${BASE_URL}/api/reseller/auth/login/otp/verify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "OTP verification failed");
  }

  return data;
};