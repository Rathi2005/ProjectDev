import React, { useState, useRef, useEffect } from "react";

const AdminOtpVerification = ({ 
  email, 
  onVerify, 
  loading, 
  error, 
  success,
  onResendOtp,
  resendLoading,
  resendCountdown 
}) => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  // Handle input typing
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const newOtp = pasted.split("").concat(Array(6 - pasted.length).fill(""));
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)].focus();
    }
  };

  // Trigger verify callback
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onVerify) onVerify(otp.join(""));
  };

  // Handle resend OTP
  const handleResend = () => {
    if (resendCountdown > 0 || resendLoading) return;
    if (onResendOtp) onResendOtp();
  };

  return (
    <div className="w-full max-w-md text-center space-y-6">
      <h2 className="text-2xl font-semibold mb-1">OTP Verification</h2>
      <p className="text-gray-400 text-sm">
        Enter the 6-digit code sent to <br />
        <span className="text-white font-medium">{email}</span>
      </p>

      {/* OTP INPUT FIELDS */}
      <form onSubmit={handleSubmit} className="space-y-5">
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
                ${digit ? "border-red-500" : "border-gray-600"} 
                focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors`}
            />
          ))}
        </div>

        {/* RESEND OTP SECTION */}
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">
            {resendCountdown > 0 ? (
              <>
                Resend OTP in{" "}
                <span className="text-yellow-400 font-bold">
                  {resendCountdown}s
                </span>
              </>
            ) : (
              "Didn't receive the code?"
            )}
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || resendCountdown > 0}
            className={`text-sm px-4 py-2 rounded-lg transition-all ${
              resendCountdown > 0 || resendLoading
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-red-900/30 text-red-400 hover:bg-red-900/50 hover:text-red-300 border border-red-800/50"
            }`}
          >
            {resendLoading ? (
              <>
                <svg className="inline w-3 h-3 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : resendCountdown > 0 ? (
              `Resend (${resendCountdown}s)`
            ) : (
              "Resend OTP"
            )}
          </button>
        </div>

        {/* VERIFY BUTTON */}
        <button
          type="submit"
          disabled={loading || otp.includes("")}
          className={`w-full bg-red-600 hover:bg-red-700 transition-colors py-2.5 rounded-md font-semibold ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <svg className="inline w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminOtpVerification;