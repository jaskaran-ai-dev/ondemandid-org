'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc/client';

export function useAdminStats() {
  return useQuery(orpc.stats.queryOptions());
}
