/**
 * Retry Payment Service — refactored to use centralized apiClient.
 *
 * Fixes:
 * - `throw { ... }` → ApiError with stack trace
 * - Safe JSON parsing handled by apiClient
 * - Auth via centralized module
 * - D-4: Uses /api/user/ (singular) — matches backend contract
 */

import { apiClient } from "../lib/apiClient.js";

export const retryPayment = async (orderId, gateway, useWallet) => {
  const data = await apiClient(
    `/api/user/payments/${orderId}/retry?gateway=${encodeURIComponent(gateway)}&useWalletBalance=${useWallet}`,
    { method: "POST" },
    { auth: "user" }
  );

  return data;
};