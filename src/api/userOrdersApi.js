const BASE_URL = import.meta.env.VITE_BASE_URL;

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
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication required");

  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  if (search) params.append("search", search);
  if (month) params.append("month", month);
  if (year) params.append("year", year);

  const res = await fetch(
    `${BASE_URL}/api/users/orders/past-orders?${params.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Reseller-Domain": window.location.hostname,
      },
      signal,
    }
  );

  if (!res.ok) {
    if (res.status === 401) throw new Error("Session expired. Please login again.");
    throw new Error("Failed to fetch past orders");
  }

  return res.json();
};

/**
 * Download an invoice PDF for a given order or payment identifier.
 * Triggers a file download via a temporary anchor element (avoids popup blockers).
 *
 * @param {string|number} orderOrPaymentId - Order ID or payment ID accepted by the invoice endpoint.
 * @returns {Promise<void>}
 */
export const downloadUserInvoice = async (orderOrPaymentId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication required");

  const res = await fetch(
    `${BASE_URL}/api/users/orders/${orderOrPaymentId}/invoice`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reseller-Domain": window.location.hostname,
      },
    }
  );

  if (!res.ok) {
    if (res.status === 401) throw new Error("Session expired. Please login again.");
    if (res.status === 404) throw new Error("Invoice not found");
    throw new Error("Failed to download invoice");
  }

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
