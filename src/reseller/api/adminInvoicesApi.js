const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchAdminInvoices = async ({
  page,
  size,
  searchTerm,
}) => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Authentication required");

  const searchParam = searchTerm
    ? `&search=${encodeURIComponent(searchTerm)}`
    : "";

  const res = await fetch(
    `${BASE_URL}/api/admin/payments/overview?page=${page}&size=${size}${searchParam}&sortBy=timestamp&sortDir=desc`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch invoices");

  return res.json();
};

export const fetchAdminPaymentStats = async () => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Authentication required");

  const res = await fetch(
    `${BASE_URL}/api/admin/stats/payments`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch payment stats");

  return res.json();
};