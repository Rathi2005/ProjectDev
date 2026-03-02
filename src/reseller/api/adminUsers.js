export const upgradeUserApi = async ({ userId, payload }) => {
  const token = localStorage.getItem("adminToken");
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const res = await fetch(
    `${BASE_URL}/api/admin/resellers/${userId}/enable`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to upgrade user");
  }

  return data;
};