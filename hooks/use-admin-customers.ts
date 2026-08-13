'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc/client';
import { toast } from 'sonner';

export function useAdminCustomers(
  status?: string,
  search?: string,
  page: number = 1,
  pageSize?: number
) {
  return useQuery(
    orpc.customers.list.queryOptions({ input: { status, search, page, pageSize } })
  );
}

export function useAdminUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    ...orpc.customers.update.mutationOptions(),
    onSuccess: () => {
      toast.success('Customer updated successfully');
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update customer');
    },
  });
}

export function useAdminCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    ...orpc.customers.create.mutationOptions(),
    onSuccess: () => {
      toast.success('Customer created successfully');
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create customer');
    },
  });
}

interface CustomersListData {
  customers: Array<{ id: string | number }>;
  total: number;
}

export function useAdminDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    ...orpc.customers.delete.mutationOptions(),
    onMutate: async variables => {
      await queryClient.cancelQueries({ queryKey: ['customers', 'list'] });

      const previous = queryClient.getQueriesData<CustomersListData>({
        queryKey: ['customers', 'list'],
      });

      queryClient.setQueriesData<CustomersListData>(
        { queryKey: ['customers', 'list'] },
        old =>
          old
            ? {
                ...old,
                customers: old.customers.filter(
                  c => String(c.id) !== String(variables.id)
                ),
                total: Math.max(0, old.total - 1),
              }
            : old
      );

      return { previous };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error(error.message || 'Failed to delete customer');
    },
    onSuccess: () => {
      toast.success('Customer deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
