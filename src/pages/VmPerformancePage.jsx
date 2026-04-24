import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import VMPerformance from "../components/user/VmPerformance.jsx";
import { apiClient } from "../lib/apiClient.js";

export default function UserVMPerformancePage() {
  const { vmid } = useParams(); // vmId from URL
  const location = useLocation();
  const navigate = useNavigate();

  // Passed from Orders page / Server list
  const { serverId, vmName, userId: passedUserId } = location.state || {};

  const [userId, setUserId] = useState(passedUserId || null);
  const [loading, setLoading] = useState(!passedUserId);

  // If userId wasn't passed via navigation state, fetch it from account status
  useEffect(() => {
    if (passedUserId) return;
    (async () => {
      try {
        const data = await apiClient("/api/user/status", {}, { auth: "user" });
        setUserId(data.id || data.userId);
      } catch (err) {
        console.error("Failed to fetch user status for performance page", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [passedUserId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1525] text-gray-300 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <VMPerformance
      apiUrl={`/api/users/vms/${vmid}/metrics`}
      tokenKey="token"             
      vmid={vmid}
      vmName={vmName}
      serverId={serverId}
      onClose={() => navigate(-1)}
    />
  );
}
