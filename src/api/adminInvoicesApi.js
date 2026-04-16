/**
 * Admin Invoices API — refactored to use centralized apiClient.
 */

import { apiClient } from "../lib/apiClient.js";

export const fetchAdminInvoices = async ({
  page,
  size,
  searchTerm,
}) => {
  const searchParam = searchTerm
    ? `&search=${encodeURIComponent(searchTerm)}`
    : "";

  return apiClient(
    `/api/admin/payments/overview?page=${page}&size=${size}${searchParam}&sortBy=timestamp&sortDir=desc`,
    {},
    { auth: "admin" }
  );
};

export const fetchAdminPaymentStats = async () => {
  return apiClient("/api/admin/stats/payments", {}, { auth: "admin" });
};