import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders } from "../api/adminOrdersApi";

export const useAdminOrders = ({
  page,
  size,
  statusFilter,
  search,
  searchBy,
  sortBy = "createdAt",
  sortDir = "desc",
  rawSearch = "",
}) => {
  // Pause polling as soon as user starts typing a real search term, not after debounce
  const isSearching = Boolean(rawSearch.trim());

  return useQuery({
    queryKey: ["admin-orders", page, size, statusFilter, search, searchBy, sortBy, sortDir],
    queryFn: ({ signal }) =>
      fetchAdminOrders({ page, size, statusFilter, search, searchBy, sortBy, sortDir, signal }),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    refetchInterval: isSearching ? false : 10_000,
    refetchIntervalInBackground: false,
  });
};