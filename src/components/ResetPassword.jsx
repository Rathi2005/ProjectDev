import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RESET_PASSWORD_API = import.meta.env.VITE_RESET_PASSWORD; // endpoint /api/password/reset

const ResetPassword = ({ email }) => {
  const [resetStep, setResetStep] = useState(1); // 1=OTP, 2=Password
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtpArr = [...otp];
    newOtpArr[index] = value;
    setOtp(newOtpArr);
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
      const newOtpArr = pasted.split("").concat(Array(6 - pasted.length).fill(""));
      setOtp(newOtpArr);
      inputRefs.current[Math.min(pasted.length, 5)].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (resetStep === 1) {
        if (otp.includes("")) {
          setError("Please enter the complete OTP.");
          setLoading(false);
          return;
        }
        setResetStep(2); // show password fields
      } else {
        if (!newPassword || !confirmPassword) {
          setError("Please fill both password fields.");
          setLoading(false);
          return;
        }

        const res = await fetch(RESET_PASSWORD_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp: otp.join(""),
            newPassword,
            confirmPassword,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setSuccess(data.message || "Password reset successfully!");
          setTimeout(() => navigate("/login"), 2000);
        } else if (res.status === 400) {
          if (data.field === "otp") setError(data.message);
          else if (data.field === "confirmPassword") setError(data.message);
          else if (data.newPassword) setError(data.newPassword);
          else setError("Something went wrong. Please try again.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-0 bg-[#0e1525] text-white px-4">
      <div className="w-full max-w-lg bg-[#121a2a] rounded-2xl p-8 shadow-lg flex flex-col items-center text-center space-y-6">

        <h2 className="text-2xl font-bold mb-1">Reset Password</h2>
        {resetStep === 1 ? (
          <p className="text-gray-400 text-sm">
            Enter the 6-digit OTP sent to <br />
            <span className="text-white font-medium">{email}</span>
          </p>
        ) : null }

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {resetStep === 1 ? (
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
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-10 h-12 sm:w-12 sm:h-12 text-center text-xl font-semibold rounded-lg bg-[#1c2538] text-white border-2 
                    ${digit ? "border-indigo-500" : "border-gray-600"} 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <div>
                <label className="text-sm font-medium">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full mt-1 px-3 py-2 rounded-md bg-[#1c2538] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full mt-1 px-3 py-2 rounded-md bg-[#1c2538] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading || (resetStep === 1 && otp.includes(""))}
            className={`w-full bg-indigo-600 hover:bg-indigo-700 transition-colors py-2.5 rounded-md font-semibold ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading
              ? "Processing..."
              : resetStep === 1
              ? "Verify OTP"
              : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
