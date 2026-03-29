import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders } from "../api/adminOrdersApi";

export const useAdminOrders = ({
  page,
  size,
  statusFilter,
  search,
}) => {
  return useQuery({
    queryKey: ["admin-orders", page, size, statusFilter, search],
    queryFn: () =>
      fetchAdminOrders({ page, size, statusFilter, search }),
    keepPreviousData: true,
    staleTime: 60 * 1000,
    refetchInterval: 10000,
  });
};