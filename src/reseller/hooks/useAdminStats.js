import { useQuery } from "@tanstack/react-query";
import { fetchAdminStats } from "../api/adminStatsApi";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    staleTime: 5 * 60 * 1000,
  });
};