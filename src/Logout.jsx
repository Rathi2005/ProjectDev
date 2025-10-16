import { useNavigate } from "react-router-dom";

const LOGOUT_API = import.meta.env.VITE_LOGOUT;

export default function useLogout() {
  const navigate = useNavigate();

  const logout = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(LOGOUT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.text(); // 👈 read raw response text
      localStorage.removeItem("token");
      window.location.reload();


      // Optional: handle success/failure messages
        if (response.ok) {
          console.log("Logged out from server");
          window.location.href = "/login";

        } else {
        console.warn("Server logout failed, but clearing local data anyway.");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return logout;
}
