/**
 * Admin Orders API — refactored to use centralized apiClient.
 */

import { apiClient } from "../lib/apiClient.js";

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
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  if (search) {
    params.append("search", search);
    if (searchBy) params.append("searchBy", searchBy);
  }
  if (statusFilter) params.append("status", statusFilter);

  return apiClient(
    `/api/admin/vms?${params.toString()}`,
    { signal },
    { auth: "admin" }
  );
};