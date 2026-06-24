import { isAdminAuthenticated } from '@/lib/admin/auth';
import { ORPCError, os } from '@orpc/server';

export const authedProcedure = os
  .$context<Record<string, never>>()
  .use(async ({ next }) => {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      throw new ORPCError('UNAUTHORIZED');
    }
    return next({});
  });
