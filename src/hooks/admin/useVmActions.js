import { useState } from 'react';

export function useVmActions(BASE_URL) {
  const [loading, setLoading] = useState({});

  async function power(orderId, action) {
    const token = localStorage.getItem("adminToken");
    setLoading(p => ({ ...p, [orderId]: action }));

    const res = await fetch(
      `${BASE_URL}/api/admin/vms/order/${orderId}/power?action=${action}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );

    setLoading(p => ({ ...p, [orderId]: null }));
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`${res.status}: ${errorData.error || 'Request failed'}`);
    }
  }

  async function destroy(orderId) {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(
      `${BASE_URL}/api/admin/vms/order/${orderId}/remove`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`${res.status}: ${errorData.error || 'Request failed'}`);
    }
  }

  async function changeMac(vmId, isManual, macAddress) {
    const token = localStorage.getItem("adminToken");
    setLoading(p => ({ ...p, [vmId]: "mac_change" }));

    // Prepare body only if manual is true
    const body = isManual && macAddress ? JSON.stringify({ mac: macAddress }) : null;
    
    const res = await fetch(
      `${BASE_URL}/api/admin/vms/${vmId}/mac/change?manual=${!!isManual}`,
      { 
        method: "POST", 
        headers: { 
          "Authorization": `Bearer ${token}`,
          ...(body && { "Content-Type": "application/json" })
        },
        ...(body && { body })
      }
    );

    setLoading(p => ({ ...p, [vmId]: null }));
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`${res.status}: ${errorData.error || "Failed to change MAC address"}`);
    }
    
    return await res.json().catch(() => ({}));
  }

  async function regenerateUserMac(orderId) {
    let token = localStorage.getItem("token");
    if (!token) token = localStorage.getItem("adminToken");

    setLoading(p => ({ ...p, [orderId]: "mac_regen" }));

    const res = await fetch(
      `${BASE_URL}/api/users/vms/${orderId}/mac/regenerate`,
      { 
        method: "POST", 
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setLoading(p => ({ ...p, [orderId]: null }));
    if (!res.ok) {
      let errorData = {};
      try { errorData = await res.json(); } catch (_) {}
      throw new Error(`${res.status}: ${errorData.error || "Operation Denied: This VM is protected."}`);
    }
    
    let data = {};
    try { data = await res.json(); } catch (_) {}
    return data;
  }

  return { power, destroy, changeMac, regenerateUserMac, loading };
}
