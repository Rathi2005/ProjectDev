/**
 * Admin API — VM data, audit logs, IP management.
 * 
 * Refactored: centralized apiClient, auth module, no raw fetch().
 * 
 * D-4: All paths use /api/admin/ — confirmed against backend contract.
 */

import { apiClient } from "../lib/apiClient.js";

export const fetchVmData = async () => {
  return apiClient("/api/admin/vms/direct-proxmox-count", {}, { auth: "admin" });
};

export const fetchAuditLogs = async () => {
  return apiClient("/api/admin/audit-logs/all", {}, { auth: "admin" });
};

export const exportAuditLogs = async () => {
  const res = await apiClient(
    "/api/admin/audit-logs/export",
    {},
    { auth: "admin", raw: true }
  );
  return res.blob();
};

export const fetchAvailableIps = async (serverId) => {
  if (serverId === undefined || serverId === null || serverId === "") {
    throw new Error("Missing server ID for available IP lookup.");
  }

  return apiClient(
    `/api/admin/vms/${serverId}/available-ips`,
    {
      headers: {
        "X-Reseller-Domain": window.location.hostname,
      },
    },
    { auth: "admin" }
  );
};

export const changeVmIp = async (internalVmid, newIpId) => {
  return apiClient(
    `/api/admin/vms/${internalVmid}/change-ip`,
    {
      method: "POST",
      body: JSON.stringify({ newIpId: Number(newIpId) }),
      headers: {
        "X-Reseller-Domain": window.location.hostname,
      },
    },
    { auth: "admin" }
  );
};