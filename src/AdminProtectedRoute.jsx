import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");

  // No token = redirect to admin login
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const decoded = jwtDecode(adminToken);

    // Check token expiry (exp is in seconds)
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("adminToken");
      alert("Session expired. Please log in again.");
      return <Navigate to="/admin/login" replace />;
    }
  } catch (err) {
    // Invalid token case
    localStorage.removeItem("adminToken");
    return <Navigate to="/admin/login" replace />;
  }

  // If valid, render child routes
  return children;
};

export default AdminProtectedRoute;
