/**
 * Centralized Auth Token Manager (B-2)
 *
 * SINGLE SOURCE OF TRUTH for all localStorage token operations.
 * 3 contexts exist in this app:
 *   - "user"     → `token`       (logged-in end-user)
 *   - "admin"    → `adminToken`  (admin panel)
 *   - "reseller" → `rToken`      (reseller panel)
 *
 * All API modules MUST use getAuthToken() instead of direct localStorage.
 * This prevents:
 *   - Token key typos
 *   - Fallback mixing (using admin token for user requests)
 *   - Privilege escalation via wrong token
 */

const TOKEN_KEYS = Object.freeze({
  user: "token",
  admin: "adminToken",
  reseller: "rToken",
});

/**
 * Get the auth token for the given context.
 * @param {"user" | "admin" | "reseller"} context
 * @returns {string | null}
 */
export function getAuthToken(context = "user") {
  const key = TOKEN_KEYS[context];
  if (!key) {
    console.error(`[Auth] Unknown context: "${context}". Valid: user, admin, reseller`);
    return null;
  }
  return localStorage.getItem(key);
}

/**
 * Require an auth token — throws if missing.
 * Use in API functions that MUST be authenticated.
 * @param {"user" | "admin" | "reseller"} context
 * @returns {string}
 */
export function requireAuthToken(context = "user") {
  const token = getAuthToken(context);
  if (!token) {
    const err = new Error("Session expired. Please login again.");
    err.status = 401;
    throw err;
  }
  return token;
}

/**
 * Clear auth token and associated data for a given context.
 * Call on logout, 401 responses, or session expiry.
 * @param {"user" | "admin" | "reseller"} context
 */
export function clearAuth(context = "user") {
  const key = TOKEN_KEYS[context];
  if (key) localStorage.removeItem(key);
}

/**
 * Clear ALL auth tokens (for full logout / user switch).
 */
export function clearAllAuth() {
  Object.values(TOKEN_KEYS).forEach((key) => localStorage.removeItem(key));
}
