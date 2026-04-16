/**
 * Admin Stats API — dashboard statistics.
 *
 * D-3 FIX: Each endpoint is individually validated via apiClient.
 * If one endpoint fails, it returns {} — others still load.
 * apiClient handles res.ok checks, safe JSON parsing, and logging.
 */

import { apiClient } from "../lib/apiClient.js";

async function safeFetch(url) {
  try {
    return await apiClient(url, {}, { auth: "admin" });
  } catch (err) {
    // Don't crash the entire dashboard if one stat endpoint fails.
    // The error is already logged by apiClient.
    console.error(`[Stats] Fallback triggered for ${url}:`, err.message);
    return {};
  }
}

export const fetchAdminStats = async () => {
  const [orders, deleted, users, failed] = await Promise.all([
    safeFetch("/api/admin/stats/orders"),
    safeFetch("/api/admin/stats/deleted-vms"),
    safeFetch("/api/admin/stats/users"),
    safeFetch("/api/admin/stats/failed-orders"),
  ]);

  return { orders, deleted, users, failed };
};