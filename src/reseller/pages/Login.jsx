import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useResellerAuth } from "../hooks/useResellerAuth";
import { toast } from "react-hot-toast";

const LogoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-indigo-400"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
    <path d="M2 17l10 5 10-5"></path>
    <path d="M2 12l10 5 10-5"></path>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const { loginPassword, initiateOtp, verifyOtp } = useResellerAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginWithOtp, setLoginWithOtp] = useState(false);

  // 🔐 PASSWORD LOGIN
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginPassword({ email, password });
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 📩 OTP INITIATE
  const handleOtpInitiate = async () => {
    setLoading(true);
    try {
      await initiateOtp(email);
      toast.success("OTP sent to your email!");
      setShowOtpInput(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ OTP VERIFY
  const handleOtpVerify = async () => {
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0e1525] text-white px-4">
      <div className="w-full max-w-md bg-[#121a2a] rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-lg mb-3">
            <LogoIcon />
          </div>
          <h1 className="text-2xl font-bold">
            {showOtpInput
              ? "Verify OTP"
              : loginWithOtp
              ? "Login with OTP"
              : "Reseller Login"}
          </h1>
          <p className="text-gray-400 text-center text-sm mt-1">
            Access your reseller dashboard
          </p>
        </div>

        {!showOtpInput ? (
          <form
            className="space-y-4"
            onSubmit={!loginWithOtp ? handlePasswordLogin : (e) => e.preventDefault()}
          >
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full mt-1 px-3 py-2 rounded-md bg-[#1c2538] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {!loginWithOtp && (
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full mt-1 px-3 py-2 rounded-md bg-[#1c2538] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {!loginWithOtp ? (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors py-2 rounded-md font-semibold mt-4"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOtpInitiate}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors py-2 rounded-md font-semibold mt-4"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            )}

            <p
              onClick={() => setLoginWithOtp(!loginWithOtp)}
              className="text-center text-sm text-indigo-400 hover:underline mt-3 cursor-pointer"
            >
              {loginWithOtp
                ? "Login with password instead"
                : "Login with OTP instead"}
            </p>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full mt-1 px-3 py-2 rounded-md bg-[#1c2538] text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleOtpVerify}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors py-2 rounded-md font-semibold"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <p
              onClick={() => setShowOtpInput(false)}
              className="text-center text-sm text-indigo-400 hover:underline mt-3 cursor-pointer"
            >
              Back to Login
            </p>
          </div>
        )}
      </div>
    </div>
  );
}