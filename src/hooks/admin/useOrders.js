import { useEffect, useState } from "react";

export function useOrders(BASE_URL) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${BASE_URL}/admin/vms`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        const normalized = data.map(order => ({
          id: order.dbOrderId,
          vmid: order.proxmoxVmid,
          vmName: order.vmName,
          isoName: order.os,
          planType: order.planType,
          cores: order.cores,
          ramMb: order.ramMb,
          diskGb: order.diskGb,
          ipAddress: order.ipAddress,
          status: order.status,
          liveState: order.liveState,
          createdAt: order.createdAt,
          expiresAt: order.expiresAt,
          totalAmount: order.totalAmount,
          user: {
            firstName: order.customerName || "—",
            email: order.customerEmail || "—",
            billingAddress: order.billingAddress,
          }
        }));

        setOrders(normalized);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [BASE_URL]);

  return { orders, loading };
}
