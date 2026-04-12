import { useQuery } from "@tanstack/react-query";
import { fetchVmData, fetchAuditLogs } from "../api/admin";
import { useEffect } from "react";

const VM_CACHE_KEY = "admin_vm_data_cache";

export const useAdminDashboard = () => {
  // 1. VM Metrics Query (Cached persistently)
  const vmQuery = useQuery({
    queryKey: ["admin-vm-data"],
    queryFn: fetchVmData,
    // Instant load from localStorage
    initialData: () => {
      const cached = localStorage.getItem(VM_CACHE_KEY);
      return cached ? JSON.parse(cached) : undefined;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
  });

  // Sync fresh VM data to localStorage
  useEffect(() => {
    if (vmQuery.data) {
      localStorage.setItem(VM_CACHE_KEY, JSON.stringify(vmQuery.data));
    }
  }, [vmQuery.data]);

  // 2. Audit Logs Query (Always fresh, as requested)
  const auditQuery = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: fetchAuditLogs,
    staleTime: 0, // Always consider stale to force fresh fetch on reload
    refetchInterval: 30000, // Still update every 30s while page is open
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
    vmLoading: vmQuery.isLoading && !vmQuery.data, // Only show loading if no cache

    auditLogs: formattedAuditLogs,
    activityLoading: auditQuery.isLoading,
    auditError: auditQuery.error,
    
    // Helper to manually refresh everything
    refreshAll: () => {
      vmQuery.refetch();
      auditQuery.refetch();
    }
  };
};