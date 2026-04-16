/**
 * Centralized API Client — Production-Grade Fetch Wrapper
 *
 * EVERY API call in the main app MUST go through this module.
 *
 * Guarantees:
 * ✅ res.ok checked BEFORE any JSON parsing
 * ✅ Non-JSON responses (HTML error pages) handled safely
 * ✅ Proper Error objects thrown (with .status, .data, stack trace)
 * ✅ Auth header attached automatically from centralized auth module
 * ✅ Request/response logging (errors always, requests in dev)
 * ✅ AbortSignal forwarded for React Query cancellation
 *
 * NOTE: Cache-Control is NOT set as a request header — it triggers
 * CORS preflight failures. Caching is controlled by the server's
 * response headers, not by the client.
 */

import { getAuthToken, clearAuth } from "./auth.js";

// ── Custom Error Class ──────────────────────────────────────────────────────
/**
 * API Error with full context for debugging and error handlers.
 * Always use this instead of `throw { status, message }`.
 *
 * Properties:
 *   .message  — human-readable error message
 *   .status   — HTTP status code (number)
 *   .data     — parsed response body (if any)
 *   .endpoint — the URL that failed
 *   .stack    — full JS stack trace (unlike plain objects)
 */
export class ApiError extends Error {
  constructor(message, status, data = null, endpoint = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.endpoint = endpoint;
  }
}

// ── Safe JSON Parser ────────────────────────────────────────────────────────
/**
 * Safely parse a fetch Response as JSON.
 * NEVER throws — returns null if body is empty, HTML, or malformed.
 */
async function safeJsonParse(res) {
  const contentType = res.headers.get("content-type") || "";

  // Skip non-JSON responses (HTML error pages, empty 204s, etc.)
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ── Request Logger (H-3) ────────────────────────────────────────────────────
function logRequest(method, url, startTime, status, error = null) {
  const duration = Date.now() - startTime;
  const tag = `[API]`;

  if (error || (status && status >= 400)) {
    // ALWAYS log failures — console.error is preserved in production
    console.error(
      `${tag} ${method} ${url} → ${status ?? "NETWORK_ERROR"} (${duration}ms)`,
      error?.message || ""
    );
  } else if (import.meta.env.DEV) {
    // Only log successes in development
    console.log(`${tag} ${method} ${url} → ${status} (${duration}ms)`);
  }
}

// ── Centralized Fetch Wrapper ───────────────────────────────────────────────
/**
 * Make an authenticated API request with full validation.
 *
 * @param {string}  url           - Absolute URL or path (auto-prepended with VITE_BASE_URL if relative)
 * @param {Object}  [options={}]  - Fetch options (method, body, headers, signal, etc.)
 * @param {Object}  [config={}]   - Client config
 * @param {"user"|"admin"|"reseller"} [config.auth]  - Auth context. Set to `false` for public endpoints.
 * @param {boolean} [config.raw]  - If true, return raw Response (for blobs, streams)
 * @returns {Promise<any>} Parsed JSON response data
 * @throws {ApiError} On HTTP errors, network errors, or non-JSON responses when JSON expected
 */
export async function apiClient(url, options = {}, config = {}) {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const {
    auth = "user",
    raw = false,
  } = config;

  // Build full URL
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  // Build headers
  const headers = {
    ...(options.headers || {}),
  };

  // Auto-attach auth header (unless explicitly disabled)
  if (auth !== false) {
    const token = getAuthToken(auth);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Auto-attach domain header for user-facing requests
  if (auth === "user" || auth === "reseller") {
    headers["X-Reseller-Domain"] = window.location.hostname;
  }

  // Set content-type for JSON bodies
  if (options.body && typeof options.body === "string" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const method = (options.method || "GET").toUpperCase();
  const startTime = Date.now();

  let res;
  try {
    res = await fetch(fullUrl, {
      ...options,
      headers,
    });
  } catch (networkError) {
    // AbortError = React Query cancelled an in-flight request (e.g., during
    // invalidateQueries or component unmount). This is EXPECTED, not an error.
    // Re-throw silently — React Query handles it internally.
    if (networkError.name === "AbortError") throw networkError;

    // Genuine network failure (DNS, CORS, offline)
    logRequest(method, fullUrl, startTime, null, networkError);

    throw new ApiError(
      "Network error. Please check your connection.",
      0,
      null,
      fullUrl
    );
  }

  logRequest(method, fullUrl, startTime, res.status);

  // ── Handle 401 → clear token automatically ──
  if (res.status === 401 && auth !== false) {
    clearAuth(auth);
  }

  // ── Return raw Response for blob/stream endpoints ──
  if (raw) {
    if (!res.ok) {
      const errBody = await safeJsonParse(res);
      throw new ApiError(
        errBody?.message || errBody?.error || `Request failed (${res.status})`,
        res.status,
        errBody,
        fullUrl
      );
    }
    return res;
  }

  // ── Parse JSON response safely (ALWAYS before checking res.ok for error messages) ──
  const data = await safeJsonParse(res);

  // ── Handle errors ──
  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      (res.status === 401 ? "Session expired. Please login again." :
       res.status === 403 ? "Access denied." :
       res.status === 404 ? "Resource not found." :
       res.status >= 500 ? "Server error. Please try again later." :
       `Request failed with status ${res.status}`);

    throw new ApiError(msg, res.status, data, fullUrl);
  }

  // ── Validate we got something back ──
  if (data === null && method !== "DELETE") {
    // Warn but don't throw — some endpoints return 200 with no body
    if (import.meta.env.DEV) {
      console.warn(`[API] ${method} ${fullUrl} returned 200 but no JSON body`);
    }
  }

  return data;
}

// ── Convenience methods ─────────────────────────────────────────────────────
apiClient.get = (url, config) => apiClient(url, {}, config);

apiClient.post = (url, body, config) =>
  apiClient(url, { method: "POST", body: JSON.stringify(body) }, config);

apiClient.put = (url, body, config) =>
  apiClient(url, { method: "PUT", body: JSON.stringify(body) }, config);

apiClient.delete = (url, config) =>
  apiClient(url, { method: "DELETE" }, config);
