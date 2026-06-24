'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc/client';

export function useAdminRequests(status?: string, page: number = 1) {
  return useQuery(orpc.requests.list.queryOptions({ input: { status, page } }));
}
