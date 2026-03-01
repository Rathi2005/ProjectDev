import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ResellerProtectedRoute = ({ children }) => {
  const rToken = localStorage.getItem("rToken");

  // If no reseller token → redirect to login
  if (!rToken) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(rToken);

    // Check token expiry
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("rToken");
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    localStorage.removeItem("rToken");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ResellerProtectedRoute;