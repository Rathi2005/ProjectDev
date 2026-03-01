// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- EXISTING IMPORTS ---
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Credits from "./pages/Credits";
import Orders from "./pages/Orders";
import Profile from "./components/Profile";
import UserVMPerformancePage from "./pages/VmPerformancePage";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";

import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLoginPage from "./pages/admin/AdminLogin";
import AdminDashboard from "./components/admin/adminDashboard";
import OrdersPage from "./pages/admin/OrdersPage";
import InvoicesPage from "./pages/admin/InvoicesPage";
import ServersPage from "./pages/admin/ServersPage";
import ManageResourcesPage from "./pages/admin/ManageResources";
import VMsPage from "./pages/admin/VMs";
import PricingDetailPage from "./pages/admin/PricingDetailPage";
import Zones from "./pages/admin/Zones/Zones";
import ZonesIsosPage from "./pages/admin/Zones/ZoneIsosPage";
import SystemRecordsPage from "./pages/admin/SystemRecordsPage";
import PerformancePage from "./pages/admin/PerformancePage";
import VMPerformancePage from "./pages/admin/VMPerformancePage";
import ServerRamPage from "./pages/admin/ServerRamPage";
import OrderDetailsPage from "./components/admin/OrderDetailsPage";
import CreditPage from "./pages/admin/Credits/CouponsManagementPage";
import WalletsManagementPage from "./pages/admin/Credits/WalletsManagementPage";
import LogsPage from "./pages/admin/LogsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import GeneralSettings from "./components/admin/AllSettings/GeneralSettings";
import MailSettings from "./components/admin/AllSettings/MailSettings";
import GatewaySettings from "./components/admin/AllSettings/GatewaySettings";

// --- RESELLER IMPORT ---
import ResellerApp from "./reseller/AppReseller";

// ==========================================
// 1. ALL YOUR EXISTING MAIN ROUTES
// ==========================================
function MainRoutes() {
  return (
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
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile mode="user" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/vms/:vmid/performance"
        element={
          <ProtectedRoute>
            <UserVMPerformancePage />
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
        path="/admin/profile"
        element={
          <AdminProtectedRoute>
            <Profile mode="admin" />
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
        path="/admin/metrics"
        element={
          <AdminProtectedRoute>
            <PerformancePage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/vms/:vmid/performance"
        element={
          <AdminProtectedRoute>
            <VMPerformancePage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/zones/:zoneId/isos"
        element={
          <AdminProtectedRoute>
            <ZonesIsosPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/deleted-vms"
        element={
          <AdminProtectedRoute>
            <SystemRecordsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/garbage-records"
        element={
          <AdminProtectedRoute>
            <SystemRecordsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/users-overview"
        element={
          <AdminProtectedRoute>
            <SystemRecordsPage />
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
        path="/admin/orders/:orderId"
        element={
          <AdminProtectedRoute>
            <OrderDetailsPage />
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
        path="/admin/servers/:id/ram"
        element={
          <AdminProtectedRoute>
            <ServerRamPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/logs"
        element={
          <AdminProtectedRoute>
            <LogsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminProtectedRoute>
            <SettingsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/general"
        element={
          <AdminProtectedRoute>
            <GeneralSettings />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/mail"
        element={
          <AdminProtectedRoute>
            <MailSettings />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/payment-gateways"
        element={
          <AdminProtectedRoute>
            <GatewaySettings />
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
        path="/admin/settings/zones"
        element={
          <AdminProtectedRoute>
            <Zones />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/credits/coupons"
        element={
          <AdminProtectedRoute>
            <CreditPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/credits/wallets"
        element={
          <AdminProtectedRoute>
            <WalletsManagementPage />
          </AdminProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// ==========================================
// 2. THE TRAFFIC COP (DOMAIN ROUTER)
// ==========================================
export default function App() {
  const currentDomain = window.location.hostname;

  // List of domains that should show the MAIN application
  const mainDomains = [
    "console.devai.in",
    // "localhost",  
    "127.0.0.1",
    "10.0.0.49",
    "project-dev-three.vercel.app"
  ];

  const isMainDomain = mainDomains.includes(currentDomain);

  return <Router>{isMainDomain ? <MainRoutes /> : <ResellerApp />}</Router>;
} 
