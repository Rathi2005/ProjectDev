// src/api/admin.js

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No token found");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const fetchVmData = async () => {
  const res = await fetch(
    `${BASE_URL}/api/admin/vms/direct-proxmox-count`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) throw new Error("Failed to fetch VM data");

  return res.json();
};

export const fetchAuditLogs = async () => {
  const res = await fetch(
    `${BASE_URL}/api/admin/audit-logs/all`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) throw new Error("Failed to fetch audit logs");

  return res.json();
};

export const exportAuditLogs = async () => {
  const res = await fetch(
    `${BASE_URL}/api/admin/audit-logs/export`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) throw new Error("Failed to export logs");

  return res.blob();
};

export const fetchAvailableIps = async (serverId) => {
  const res = await fetch(
    `${BASE_URL}/api/admin/vms/${serverId}/available-ips`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Failed to fetch available IPs");
  }

  return res.json();
};

export const changeVmIp = async (internalVmid, newIpId) => {
  const res = await fetch(
    `${BASE_URL}/api/admin/vms/${internalVmid}/change-ip`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newIpId: Number(newIpId) }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "IP change failed");
  }

  return res.json();
};