import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage"; // make sure this exists
import DashboardPage from "./pages/DashboardPage"; // placeholder dashboard

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Register page */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard page (after login/OTP verification) */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Fallback for 404 */}
        <Route path="*" element={<h2 className="text-center mt-10">Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}
