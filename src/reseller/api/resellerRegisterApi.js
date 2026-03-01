const BASE_URL = import.meta.env.VITE_BASE_URL;

// Initiate Registration
export const initiateResellerRegistration = async (payload) => {
  const res = await fetch(
    `${BASE_URL}/api/reseller/auth/register/initiate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Backend identifies reseller via Origin automatically
        // DO NOT manually set Origin
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Registration initiation failed");
  }

  return data;
};

// Verify OTP
export const verifyResellerOtp = async (payload) => {
  const res = await fetch(
    `${BASE_URL}/api/reseller/auth/register/verify`,
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

// Resend OTP
export const resendResellerOtp = async (email) => {
  const res = await fetch(
    `${BASE_URL}/api/reseller/auth/register/resend-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to resend OTP");
  }

  return data;
};