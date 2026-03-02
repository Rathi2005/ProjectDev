export const fetchAdminStats = async () => {
  const adminToken = localStorage.getItem("adminToken");

  const headers = {
    Authorization: `Bearer ${adminToken}`,
  };

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [ordersRes, deletedVmsRes, usersRes, failedOrdersRes] =
    await Promise.all([
      fetch(`${BASE_URL}/api/admin/stats/orders`, { headers }),
      fetch(`${BASE_URL}/api/admin/stats/deleted-vms`, { headers }),
      fetch(`${BASE_URL}/api/admin/stats/users`, { headers }),
      fetch(`${BASE_URL}/api/admin/stats/failed-orders`, { headers }),
    ]);

  return {
    orders: await ordersRes.json(),
    deleted: await deletedVmsRes.json(),
    users: await usersRes.json(),
    failed: await failedOrdersRes.json(),
  };
};