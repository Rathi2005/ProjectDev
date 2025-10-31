import React, { useState, useRef, useEffect } from "react";

const VERIFY_REGISTER_OTP = import.meta.env.VITE_COMPLETE_REGISTRATION;
const VERIFY_LOGIN_OTP = import.meta.env.VITE_LOGIN_OTP_VERIFY;
const RESEND_OTP = import.meta.env.VITE_RESEND_OTP;

const OtpVerification = ({ email, onVerified, toggle }) => {
  // toggle -> 1 then verify login otp, else if(0) register otp
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const newOtp = pasted.split("").concat(Array(6 - pasted.length).fill(""));
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)].focus();
    }
  };

  // ✅ VERIFY OTP FUNCTION
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let response;
      if (toggle === 0) {
        response = await fetch(VERIFY_REGISTER_OTP, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: otp.join("") }),
        });
      } else if (toggle === 1) {
        response = await fetch(VERIFY_LOGIN_OTP, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: otp.join("") }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("token", JSON.stringify(data.token));
        }
        setSuccess("OTP verified successfully!");
        // Wait a moment to show success, then call onVerified
        setTimeout(() => {
          if (onVerified) onVerified();
        }, 800);
      } else {
        setError(data.message || "Invalid or expired OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ RESEND OTP FUNCTION
  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(RESEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "A new OTP has been sent to your email.");
      } else {
        setError(data.message || "Unable to resend OTP. Please try later.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full items-center justify-center bg-[#0e1525] text-white px-4">
      <div className="w-full max-w-lg bg-[#121a2a] rounded-2xl p-8 shadow-lg flex flex-col items-center text-center space-y-6">
        {/* ICON */}
        <div className="bg-indigo-600 p-3 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 12a4 4 0 01-8 0m8 0V8a4 4 0 00-8 0v4m8 0h1a2 2 0 012 2v4a2 2 0 01-2 2h-1M8 12H7a2 2 0 00-2 2v4a2 2 0 002 2h1"
            />
          </svg>
        </div>

        {/* HEADING */}
        <div>
          <h2 className="text-2xl font-bold mb-1">OTP Verification</h2>
          <p className="text-gray-400 text-sm">
            Enter the 6-digit code sent to <br />
            <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleVerify} className="w-full space-y-6">
          {/* OTP INPUTS */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-10 h-12 sm:w-12 sm:h-12 text-center text-xl font-semibold rounded-lg bg-[#1c2538] text-white border-2 
                  ${digit ? "border-indigo-500" : "border-gray-600"} 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            ))}
          </div>

          {/* ERROR / SUCCESS */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-md p-3">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-900/20 border border-green-700/40 rounded-md p-3">
              <p className="text-sm text-green-400 text-center">{success}</p>
            </div>
          )}

          {/* VERIFY BUTTON */}
          <button
            type="submit"
            disabled={loading || otp.includes("")}
            className={`w-full bg-indigo-600 hover:bg-indigo-700 transition-colors py-2.5 rounded-md font-semibold ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : "Verify OTP"}
          </button>
        </form>

        {/* RESEND */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Didn’t receive the code?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-indigo-400 hover:underline"
              disabled={loading}
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
