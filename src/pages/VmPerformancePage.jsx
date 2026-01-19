import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import VMPerformance from "../components/user/VmPerformance.jsx";

export default function UserVMPerformancePage() {
  const { vmid } = useParams(); // vmId from URL
  const location = useLocation();
  const navigate = useNavigate();

  // Passed from Orders page / Server list
  const { serverId, vmName, userId } = location.state || {};

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#0e1525] text-gray-300 flex items-center justify-center">
        Missing user information
      </div>
    );
  }

  return (
    <VMPerformance
      apiUrl={`/api/users/${userId}/vms/${vmid}/metrics`}
      tokenKey="token"             
      vmid={vmid}
      vmName={vmName}
      serverId={serverId}
      onClose={() => navigate(-1)}
    />
  );
}
