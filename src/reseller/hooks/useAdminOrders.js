import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders } from "../api/adminOrdersApi";

export const useAdminOrders = ({
  page,
  size,
  statusFilter,
  search,
  rawSearch = "",
}) => {
  const isSearching = Boolean(rawSearch.trim());

  return useQuery({
    queryKey: ["admin-orders", page, size, statusFilter, search],
    queryFn: ({ signal }) =>
      fetchAdminOrders({ page, size, statusFilter, search, signal }),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    refetchInterval: isSearching ? false : 10_000,
  });
};