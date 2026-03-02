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