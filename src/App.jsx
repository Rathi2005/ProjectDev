// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminLoginPage from "./pages/admin/AdminLogin";
import AdminDashboard from "./components/admin/adminDashboard";
import OrdersPage from "./pages/admin/OrdersPage";
import InvoicesPage from "./pages/admin/InvoicesPage";
import ServersPage from "./pages/admin/ServersPage";
import IPsPage from "./pages/admin/IPs";
import IsosPage from "./pages/admin/ISOs";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminProtectedRoute>
              <OrdersPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/invoices"
          element={
            <AdminProtectedRoute>
              <InvoicesPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/servers"
          element={
            <AdminProtectedRoute>
              <ServersPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/servers/:id/ips"
          element={
            <AdminProtectedRoute>
              <IPsPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/servers/:id/isos"
          element={
            <AdminProtectedRoute>
              <IsosPage />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
