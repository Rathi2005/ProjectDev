const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchAdminOrders = async ({
  page,
  size,
  statusFilter,
  search,
}) => {
  const adminToken = localStorage.getItem("adminToken");

  const params = new URLSearchParams({
    page,
    size,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  if (search) params.append("search", search);
  if (statusFilter) params.append("status", statusFilter);

  const res = await fetch(
    `${BASE_URL}/api/admin/vms?${params.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
};