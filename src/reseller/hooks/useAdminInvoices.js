import { useQuery } from "@tanstack/react-query";
import { fetchAdminInvoices } from "../api/adminInvoicesApi";

export const useAdminInvoices = ({
  page,
  size,
  searchTerm,
}) => {
  return useQuery({
    queryKey: ["admin-invoices", page, size, searchTerm],
    queryFn: () =>
      fetchAdminInvoices({ page, size, searchTerm }),
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });
};