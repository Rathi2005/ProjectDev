import { useNavigate } from "react-router-dom";

const LOGOUT_API = import.meta.env.VITE_LOGOUT;

export default function useLogout() {
  const navigate = useNavigate();

  const logout = async () => {
    const token = localStorage.getItem("adminToken");

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
      localStorage.removeItem("adminToken");

      if (response.ok) {
        console.log("Logged out successfully from server");
      } else {
        console.warn("Server logout failed, but clearing local data anyway.");
      }

      // ✅ Redirect to login page using React Router
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, still redirect user
      localStorage.removeItem("adminToken");
      navigate("/admin", { replace: true });
    }
  };

  return logout;
}
