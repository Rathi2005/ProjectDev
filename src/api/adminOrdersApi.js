const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchAdminOrders = async ({
  page,
  size,
  statusFilter,
  search,
  searchBy,
  signal,
  sortBy = "createdAt",
  sortDir = "desc",
}) => {
  const adminToken = localStorage.getItem("adminToken");

  const params = new URLSearchParams({
    page,
    size,
    sortBy,
    sortDir,
  });

  if (search) {
    params.append("search", search);
    if (searchBy) params.append("searchBy", searchBy);
  }
  if (statusFilter) params.append("status", statusFilter);

  const res = await fetch(
    `${BASE_URL}/api/admin/vms?${params.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      signal,
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
};