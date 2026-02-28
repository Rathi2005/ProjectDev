import { useQuery } from "@tanstack/react-query";
import { fetchVmData, fetchAuditLogs } from "../api/admin";

export const useAdminDashboard = () => {
  const vmQuery = useQuery({
    queryKey: ["admin-vm-data"],
    queryFn: fetchVmData,
    staleTime: 5 * 60 * 1000,
  });

  const auditQuery = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: fetchAuditLogs,
    staleTime: 2 * 60 * 1000,
  });

  const formattedAuditLogs =
    auditQuery.data?.map((log) => ({
      id: log.id,
      type: log.status?.toLowerCase(),   
      user: log.userEmail,
      action: log.operation,
      node: log.parentNodeName,
      time: log.timestamp,
    })) ?? [];

  return {
    vmData: vmQuery.data ?? null,
    vmLoading: vmQuery.isLoading,

    auditLogs: formattedAuditLogs,
    activityLoading: auditQuery.isLoading,
    auditError: auditQuery.error,
  };
};