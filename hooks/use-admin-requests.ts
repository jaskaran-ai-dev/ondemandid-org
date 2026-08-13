'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc/client';
import { toast } from 'sonner';

export function useAdminRequests(
  status?: string,
  page: number = 1,
  pageSize?: number
) {
  return useQuery(
    orpc.requests.list.queryOptions({ input: { status, page, pageSize } })
  );
}

export function useAdminDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    ...orpc.requests.delete.mutationOptions(),
    onSuccess: () => {
      toast.success('Request deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete request');
    },
  });
}