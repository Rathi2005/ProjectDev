import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ResellerProtectedRoute from "./ResellerProtectedRoute";
// import ResellerLayout from "./layout/ResellerLayout";

// Pages
import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";

export default function AppReseller() {
  return (
    <Routes>
      {/* ========================= */}
      {/* PUBLIC ROUTES */}
      {/* ========================= */}

      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* ========================= */}
      {/* PROTECTED ROUTES */}
      {/* ========================= */}

      {/* <Route
        path="/dashboard"
        element={
          <ResellerProtectedRoute>
            <ResellerLayout>
              <Dashboard />
            </ResellerLayout>
          </ResellerProtectedRoute>
        }
      /> */}
      
      {/* ========================= */}
      {/* 404 FALLBACK */}
      {/* ========================= */}

      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-[#0e1525] text-white">
            <h1 className="text-2xl">Reseller Page Not Found</h1>
          </div>
        }
      />
    </Routes>
  );
}