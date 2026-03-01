import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResellerRegister } from "../hooks/useResellerRegister";
import { toast } from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const { initiate, verify, resendOtp } = useResellerRegister();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Initiate Registration
  const handleInitiate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await initiate(formData);
      toast.success("OTP sent to your email!");
      setShowOtp(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerify = async () => {
    setLoading(true);

    try {
      await verify(formData.email, otp);
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e1525] text-white px-4">
      <div className="w-full max-w-md bg-[#121a2a] p-8 rounded-xl shadow-lg">

        {!showOtp ? (
          <form onSubmit={handleInitiate} className="space-y-4">
            <h2 className="text-xl font-bold text-center">
              Create Reseller Account
            </h2>

            <input
              name="firstName"
              placeholder="First Name"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="input"
            />

            <input
              name="lastName"
              placeholder="Last Name"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="input"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="input"
            />

            <button
              disabled={loading}
              className="w-full bg-indigo-600 py-2 rounded-md"
            >
              {loading ? "Sending OTP..." : "Register"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center">
              Verify OTP
            </h2>

            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input"
            />

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-indigo-600 py-2 rounded-md"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <button
              onClick={() => resendOtp(formData.email)}
              className="w-full text-sm text-indigo-400"
            >
              Resend OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}