import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders } from "../api/adminOrdersApi";

export const useAdminOrders = ({
  page,
  size,
  statusFilter,
  search,
  rawSearch = "",
}) => {
  // Pause polling as soon as user starts typing (raw), not after debounce
  const isSearching = Boolean(rawSearch);

  return useQuery({
    queryKey: ["admin-orders", page, size, statusFilter, search],
    queryFn: ({ signal }) =>
      fetchAdminOrders({ page, size, statusFilter, search, signal }),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    refetchInterval: isSearching ? false : 10_000,
  });
};