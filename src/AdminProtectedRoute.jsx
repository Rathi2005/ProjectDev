import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const decoded = jwtDecode(adminToken);

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("adminToken");
      return <Navigate to="/admin/login" replace />;
    }
  } catch (err) {
    localStorage.removeItem("adminToken");
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
