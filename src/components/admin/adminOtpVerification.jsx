import React, { useState, useRef, useEffect } from "react";

const AdminOtpVerification = ({ email, onVerify, loading, error, success }) => {
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
                focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
          ))}
        </div>

        {/* ERROR / SUCCESS */}
        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-700/40 rounded-md py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-400 bg-green-900/20 border border-green-700/40 rounded-md py-2">
            {success}
          </p>
        )}

        {/* VERIFY BUTTON */}
        <button
          type="submit"
          disabled={loading || otp.includes("")}
          className={`w-full bg-red-600 hover:bg-red-700 transition-colors py-2.5 rounded-md font-semibold ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default AdminOtpVerification;
