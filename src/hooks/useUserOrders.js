import { useQuery } from "@tanstack/react-query";
import { fetchUserMyOrders } from "../api/userMyOrdersApi";

/**
 * React Query hook for user's active orders.
 *
 * THIS IS THE SINGLE SOURCE OF TRUTH for user order data.
 * All components must read from the returned `data` — no local useState copies.
 *
 * Polling: 8s while tab is focused (fast enough to catch IP changes).
 * Paused: while user is typing a search (rawSearch is pre-debounce).
 *
 * After any mutation (power action, MAC regen, payment success),
 * call `queryClient.invalidateQueries({ queryKey: ["user-orders"] })`
 * to trigger an immediate refetch.
 *
 * RESILIENCE: refetchOnWindowFocus is "always" — React Query will silently
 * refetch in the background when the tab regains focus. If the refetch fails
 * (e.g., intermittent CORS), the PREVIOUS DATA IS PRESERVED — the UI will
 * NOT blank out. This is critical for the "orders disappearing" bug.
 */
export const USER_ORDERS_QUERY_KEY = "user-orders";

export const useUserOrders = ({
  page = 0,
  size = 5,
  search = "",
  sortBy = "createdAt",
  sortDir = "desc",
  rawSearch = "",
  enabled = true,
}) => {
  const isSearching = Boolean(rawSearch.trim());

  return useQuery({
    queryKey: [USER_ORDERS_QUERY_KEY, page, size, search, sortBy, sortDir],
    queryFn: ({ signal }) =>
      fetchUserMyOrders({ page, size, search, sortBy, sortDir, signal }),
    enabled,
    placeholderData: (prev) => prev,    // keep previous data during pagination/key changes
    staleTime: 5_000,                   // 5s — orders are near-real-time data
    refetchInterval: isSearching ? false : 8_000,  // 8s polling, paused during search
    refetchIntervalInBackground: false,
    // CRITICAL: Do NOT retry network/CORS errors on background refetch.
    // The global retry in main.jsx already skips status=0, but this ensures
    // the hook-level behavior is explicit too.
    retry: (failureCount, error) => {
      if (error?.status === 0) return false; // CORS / offline — don't retry
      return failureCount < 1;               // max 1 retry for 5xx
    },
    select: (data) => ({
      totalPages: data?.totalPages ?? 1,
      totalItems: data?.totalItems ?? 0,
      orders: (data?.orders ?? []).map(transformOrder),
    }),
  });
};

/** Transform raw API order into the shape the UI expects */
function transformOrder(item) {
  return {
    id: item.vmId,
    orderId: item.orderId,
    vmName: item.vmName || `Server-${item.vmId}`,
    status: item.dbStatus,
    liveState: item.liveState,
    ipAddress: item.ipAddress,
    createdAt: item.createdAt, // Note: overview might not have createdAt, but details will
    planType: item.serverPlan,
    priceTotal: item.monthlyPrice,
    cores: item.cores, // lightweight has 0 cores initially, details will populate
    ramMb: item.ramMb,
    diskGb: item.diskGb,
    osType: item.os,
    expiresAt: item.expiresAt,
    isProtected: item.isProtected,
    isLocked: item.isLocked,
    originalData: item,
    // Note: macAddress and isoName are only in details now
  };
}
