// reseller-app/hooks/useResellerAuth.js

import {
  loginWithPassword,
  initiateOtpLogin,
  verifyOtpLogin,
} from "../api/authApi";

export const useResellerAuth = () => {
  const loginPassword = async (credentials) => {
    const data = await loginWithPassword(credentials);
    localStorage.setItem("rToken", data.token);
    return data;
  };

  const initiateOtp = async (email) => {
    return await initiateOtpLogin({ email });
  };

  const verifyOtp = async (email, otp) => {
    const data = await verifyOtpLogin({ email, otp });
    localStorage.setItem("rToken", data.token);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("rToken");
  };

  return {
    loginPassword,
    initiateOtp,
    verifyOtp,
    logout,
  };
};