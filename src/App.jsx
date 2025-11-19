// src/App.jsx
import React from "react";
import { Toaster } from "react-hot-toast";
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
import ManageResourcesPage from "./pages/admin/ManageResources";
import VMsPage from "./pages/admin/VMs";
import PricingDetailPage from "./pages/admin/PricingDetailPage";
import Zones from "./pages/admin/Zones";

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
          path="/admin/:id/servers"
          element={
            <AdminProtectedRoute>
              <ServersPage />
            </AdminProtectedRoute>
          }
        />
        
        <Route
          path="/admin/zones/:id/ips"
          element={
            <AdminProtectedRoute>
              <ManageResourcesPage
                title="Manage IPs"
                endpoint="/ips"
                fields={[
                  { name: "ip", label: "IP Address", type: "text" },
                  { name: "mac", label: "MAC Address", type: "text" },
                  { name: "inUse", label: "In Use", type: "checkbox" },
                ]}
              />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/servers/:id/isos"
          element={
            <AdminProtectedRoute>
              <ManageResourcesPage
                title="Manage ISOs"
                endpoint="/isos"
                fields={[
                  { name: "iso", label: "ISO Name", type: "text" },
                  { name: "vmid", label: "VM ID", type: "text" },
                ]}
              />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/servers/:id/disks"
          element={
            <AdminProtectedRoute>
              <ManageResourcesPage
                title="Manage Disks"
                endpoint="/disk-details"
                showExisting={false}
                extraForm="disks"
                fields={[
                  { name: "diskName", label: "Disk Name", type: "text" },
                  { name: "maxVms", label: "Maximum VMs", type: "number" },
                  {
                    name: "usableDiskPercentage",
                    label: "Usable Disk Percentage",
                    type: "number",
                  },
                ]}
              />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/servers/:id/vms"
          element={
            <AdminProtectedRoute>
              <VMsPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/pricing/:type"
          element={
            <AdminProtectedRoute>
              <PricingDetailPage />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/zones"
          element={
            <AdminProtectedRoute>
              <Zones />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
