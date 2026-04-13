import { useQuery } from "@tanstack/react-query";
import { fetchVmData, fetchAuditLogs } from "../api/admin";

// ── localStorage cache with TTL, versioning, and corruption safety ──
const VM_CACHE_KEY = "admin_vm_data_cache";
const VM_CACHE_VERSION = 1; // Bump this on schema changes
const VM_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — NOT the staleTime, just the localStorage TTL

function readCachedVmData() {
  try {
    const raw = localStorage.getItem(VM_CACHE_KEY);
    if (!raw) return undefined;

    const envelope = JSON.parse(raw);

    // Version mismatch → discard
    if (envelope?.version !== VM_CACHE_VERSION) {
      localStorage.removeItem(VM_CACHE_KEY);
      return undefined;
    }

    // TTL expired → discard
    if (Date.now() - (envelope?.cachedAt ?? 0) > VM_CACHE_TTL_MS) {
      localStorage.removeItem(VM_CACHE_KEY);
      return undefined;
    }

    return envelope.data ?? undefined;
  } catch {
    // Corrupted JSON → nuke it
    localStorage.removeItem(VM_CACHE_KEY);
    return undefined;
  }
}

function writeCachedVmData(data) {
  try {
    localStorage.setItem(
      VM_CACHE_KEY,
      JSON.stringify({
        version: VM_CACHE_VERSION,
        cachedAt: Date.now(),
        data,
      }),
    );
  } catch {
    // localStorage quota exceeded or private browsing — silently ignore
  }
}

/** Call on logout / user-switch to prevent cross-user data leakage */
export function clearVmCache() {
  localStorage.removeItem(VM_CACHE_KEY);
}

export const useAdminDashboard = () => {
  // 1. VM Metrics Query — localStorage used ONLY as initialData seed
  const vmQuery = useQuery({
    queryKey: ["admin-vm-data"],
    queryFn: async () => {
      const data = await fetchVmData();
      // Sync fresh data to localStorage INSIDE queryFn (not useEffect)
      // so it's in sync with what React Query owns.
      writeCachedVmData(data);
      return data;
    },
    initialData: readCachedVmData,
    staleTime: 2 * 60 * 1000, // 2 minutes (reduced from 10 to prevent stale IPs)
    gcTime: 10 * 60 * 1000,   // 10 minutes
    refetchInterval: 30_000,   // Poll every 30s while page is open
    refetchIntervalInBackground: false,
  });

  // 2. Audit Logs Query (always fresh)
  const auditQuery = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: fetchAuditLogs,
    staleTime: 0,
    refetchInterval: 30_000,
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
    vmLoading: vmQuery.isLoading && !vmQuery.data,

    auditLogs: formattedAuditLogs,
    activityLoading: auditQuery.isLoading,
    auditError: auditQuery.error,
    
    refreshAll: () => {
      vmQuery.refetch();
      auditQuery.refetch();
    }
  };
};