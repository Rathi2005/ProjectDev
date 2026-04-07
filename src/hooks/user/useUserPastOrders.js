import { useQuery } from "@tanstack/react-query";
import { fetchUserPastOrders } from "../../api/userOrdersApi";

/**
 * React Query hook for user past orders with pagination,
 * debounced search, month/year filters, and sorting.
 *
 * Passes AbortSignal from React Query for auto-cancellation
 * on rapid filter/page changes.
 */
export const useUserPastOrders = ({
  page = 0,
  size = 10,
  search = "",
  month = "",
  year = "",
  sortBy = "deletionTimestamp",
  sortDir = "desc",
}) => {
  return useQuery({
    queryKey: [
      "user-past-orders",
      page,
      size,
      search,
      month,
      year,
      sortBy,
      sortDir,
    ],
    queryFn: ({ signal }) =>
      fetchUserPastOrders({
        page,
        size,
        search,
        month,
        year,
        sortBy,
        sortDir,
        signal,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 min — past orders are historical, rarely change
  });
};
