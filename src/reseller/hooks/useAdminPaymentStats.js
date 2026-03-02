import { useQuery } from "@tanstack/react-query";
import { fetchAdminPaymentStats } from "../api/adminInvoicesApi";

export const useAdminPaymentStats = () => {
  return useQuery({
    queryKey: ["admin-payment-stats"],
    queryFn: fetchAdminPaymentStats,
    staleTime: 5 * 60 * 1000,
  });
};