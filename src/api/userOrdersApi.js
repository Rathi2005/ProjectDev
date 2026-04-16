/**
 * User Past Orders & Invoice API — refactored to use centralized apiClient.
 */

import { apiClient } from "../lib/apiClient.js";

/**
 * Fetch paginated past orders (deleted VMs) for the logged-in user.
 *
 * @param {Object} params
 * @param {number}  params.page      - 0-based page index
 * @param {number}  params.size      - Page size
 * @param {string}  params.search    - Debounced search term (VM name or IP)
 * @param {string}  params.month     - Month filter (1-12 or "")
 * @param {string}  params.year      - Year filter (e.g. "2025" or "")
 * @param {string}  params.sortBy    - Sort field (default: "deletionTimestamp")
 * @param {string}  params.sortDir   - Sort direction ("asc" | "desc")
 * @param {AbortSignal} params.signal - AbortSignal for request cancellation
 */
export const fetchUserPastOrders = async ({
  page = 0,
  size = 10,
  search = "",
  month = "",
  year = "",
  sortBy = "deletionTimestamp",
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
  if (month) params.append("month", month);
  if (year) params.append("year", year);

  return apiClient(
    `/api/users/orders/past-orders?${params.toString()}`,
    { signal },
    { auth: "user" }
  );
};

/**
 * Download an invoice PDF for a given order or payment identifier.
 * Uses `raw: true` mode to get the Response for blob handling.
 *
 * @param {string|number} orderOrPaymentId
 * @returns {Promise<void>}
 */
export const downloadUserInvoice = async (orderOrPaymentId) => {
  const res = await apiClient(
    `/api/users/orders/${orderOrPaymentId}/invoice`,
    {},
    { auth: "user", raw: true }
  );

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  // Use a temporary anchor element to trigger download (avoids popup blockers)
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${orderOrPaymentId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};
