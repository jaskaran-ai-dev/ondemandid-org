'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc/client';
import { toast } from 'sonner';

export function useAdminCustomers(
  status?: string,
  search?: string,
  page: number = 1
) {
  return useQuery(
    orpc.customers.list.queryOptions({ input: { status, search, page } })
  );
}

export function useAdminUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    ...orpc.customers.update.mutationOptions(),
    onSuccess: () => {
      toast.success('Customer updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update customer');
    },
  });
}
