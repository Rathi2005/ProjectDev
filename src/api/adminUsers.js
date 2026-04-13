/**
 * Admin Users API — refactored to use centralized apiClient.
 * 
 * Fixes:
 * - CRITICAL: Old code called `res.json()` BEFORE `res.ok` check.
 *   If response was non-JSON (HTML 502), this would crash with an
 *   unhandled SyntaxError instead of showing the user an error.
 *   Now handled safely by apiClient's safeJsonParse.
 */

import { apiClient } from "../lib/apiClient.js";

export const upgradeUserApi = async ({ userId, payload }) => {
  return apiClient(
    `/api/admin/resellers/${userId}/enable`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    { auth: "admin" }
  );
};