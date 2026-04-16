/**
 * Payment Service — VM creation, payment verification, wallet operations.
 *
 * Refactored to use centralized apiClient.
 *
 * Fixes:
 * - D-1: verifyPayment now validates response body explicitly — NEVER returns false success
 * - D-2: getGateways validates response body
 * - Error Standardization: All throw ApiError (not plain objects)
 * - B-2: Auth via centralized module
 * - H-3: All calls logged by apiClient
 * - F-1: Cache-Control: no-store via apiClient
 */

import { apiClient, ApiError } from "../lib/apiClient.js";

/**
 * Create a VM order. May return a payment URL, QR flow, or COMPLETED status.
 */
export const createVM = async (body, gateway) => {
  const data = await apiClient(
    `/api/users/vms/create?gateway=${encodeURIComponent(gateway)}`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    { auth: "user" }
  );

  return data;
};

/**
 * D-1 CRITICAL FIX: Payment verification with explicit success validation.
 *
 * Rules:
 * 1. HTTP error → throws ApiError (polling stops, error toast shown)
 * 2. Non-JSON response → throws ApiError (never parses null as "success")
 * 3. Missing `status` field → throws ApiError (never assumes success)
 * 4. ONLY `status !== "PENDING"` is treated as success by callers
 *
 * The caller (usePayment / Orders.jsx polling) checks `res.status !== "PENDING"`.
 * We guarantee that `res.status` is ALWAYS a valid string from the server.
 */
export const verifyPayment = async (paymentId, gateway) => {
  const data = await apiClient(
    `/api/payments/${paymentId}/verify?gateway=${encodeURIComponent(gateway)}`,
    {},
    { auth: "user" }
  );

  // CRITICAL: Validate the response has the expected shape.
  // If the API returns {} or { randomField: true }, we must NOT treat it as success.
  if (!data || typeof data.status !== "string") {
    throw new ApiError(
      "Payment verification returned unexpected data",
      502,
      data,
      `/api/payments/${paymentId}/verify`
    );
  }

  return data;
};

/**
 * D-2 FIX: Fetch available payment gateways with validation.
 */
export const getGateways = async () => {
  const data = await apiClient(
    "/api/user/payments/gateways",
    {},
    { auth: "user" }
  );

  // Validate: expect an array or object with gateway list
  if (!data) {
    throw new ApiError(
      "No gateway data received",
      502,
      null,
      "/api/user/payments/gateways"
    );
  }

  return data;
};

/**
 * Top up wallet balance.
 */
export const walletTopUp = async (amount, gateway) => {
  const data = await apiClient(
    `/api/wallet/top-up?gateway=${encodeURIComponent(gateway)}`,
    {
      method: "POST",
      body: JSON.stringify({ amount: Number(amount) }),
    },
    { auth: "user" }
  );

  return data;
};