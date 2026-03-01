import {
  initiateResellerRegistration,
  verifyResellerOtp,
  resendResellerOtp,
} from "../api/resellerRegisterApi";

export const useResellerRegister = () => {
  const initiate = async (formData) => {
    return await initiateResellerRegistration(formData);
  };

  const verify = async (email, otp) => {
    const data = await verifyResellerOtp({ email, otp });

    // Store JWT after successful verification
    if (data.token) {
      localStorage.setItem("rToken", data.token);
    }

    return data;
  };

  const resendOtp = async (email) => {
    return await resendResellerOtp(email);
  };

  return {
    initiate,
    verify,
    resendOtp,
  };
};