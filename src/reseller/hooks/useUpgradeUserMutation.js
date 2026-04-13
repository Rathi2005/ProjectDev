import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upgradeUserApi } from "../api/adminUsers";
import toast from "react-hot-toast";

export const useUpgradeUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upgradeUserApi,

    onSuccess: (data) => {
      toast.success(data.message || "User upgraded successfully!");
      queryClient.invalidateQueries({ queryKey: ["users-overview"] });  // v5 syntax
    },

    onError: (error) => {
      toast.error(error.message || "Upgrade failed");
    },
  });
};