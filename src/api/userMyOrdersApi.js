/**
 * User Active Orders API — refactored to use centralized apiClient.
 *
 * Used by `useUserOrders` React Query hook — SINGLE SOURCE OF TRUTH.
 */

import { apiClient } from "../lib/apiClient.js";

export const fetchUserMyOrders = async ({
  page = 0,
  size = 5,
  search = "",
  sortBy = "createdAt",
  sortDir = "desc",
  signal,
}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });
  if (search) params.append("search", search);

  return apiClient(
    `/api/users/orders/overview?${params}`,
    { signal },
    { auth: "user" }
  );
};

export const fetchUserOrderDetails = async (vmId) => {
  return apiClient(
    `/api/users/orders/${vmId}/details`,
    {},
    { auth: "user" }
  );
};
