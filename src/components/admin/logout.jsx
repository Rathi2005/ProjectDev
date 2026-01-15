import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";  

// const LOGOUT_API = import.meta.env.VITE_LOGOUT;
const LOGOUT_API = `${import.meta.env.VITE_BASE_URL}/api/logout`;

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

      // Remove token
      localStorage.removeItem("adminToken");

      if (response.ok) {
        toast.success("Logged out successfully!");  
      } else {
        toast.error("Server logout failed — logged out locally."); 
      }

      navigate("/admin", { replace: true });
    } catch (error) {
      toast.error("Logout error:", error);

      toast.error("Logout error — logged out locally."); 

      localStorage.removeItem("adminToken");
      navigate("/admin", { replace: true });
    }
  };

  return logout;
}
