import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ResellerProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Check expiry
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    // 🔒 Check reseller role
    if (decoded.roles !== "ROLE_RESELLER_USER") {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
}