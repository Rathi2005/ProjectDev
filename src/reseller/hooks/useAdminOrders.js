import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders } from "../api/adminOrdersApi";

export const useAdminOrders = ({
  page,
  size,
  statusFilter,
  search,
}) => {
  const isSearching = Boolean(search);

  return useQuery({
    queryKey: ["admin-orders", page, size, statusFilter, search],
    queryFn: ({ signal }) =>
      fetchAdminOrders({ page, size, statusFilter, search, signal }),
    keepPreviousData: true,
    staleTime: 60 * 1000,
    refetchInterval: isSearching ? false : 10_000,
  });
};