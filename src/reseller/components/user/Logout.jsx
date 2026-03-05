import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const LOGOUT_API = `${BASE_URL}/api/logout`;

export default function useLogout() {
  const navigate = useNavigate();

  const logout = async () => {
    const token = localStorage.getItem("rToken");

    try {
      const response = await fetch(LOGOUT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Read server response
      await response.text();

      // Always clear local data
      localStorage.removeItem("rToken");

      if (response.ok) {
        toast.success("Logged out successfully");
      } else {
        toast.error("Server logout failed, but clearing local data anyway.");
      }

      // ✅ Redirect to login page using React Router
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Logout error:", error);
      // Even if there's an error, still redirect user
      localStorage.removeItem("rToken");
      navigate("/login", { replace: true });
    }
  };

  return logout;
}
