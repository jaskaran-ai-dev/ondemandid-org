import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { authedProcedure } from './context';
import { getDashboardStats } from '@/lib/db/queries/stats';
import { getCustomers, updateCustomer } from '@/lib/db/queries/customers';
import { getRequests } from '@/lib/db/queries/requests';

const customerUpdateSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'active', 'inactive']).optional(),
  idConnection: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
});

export const adminStats = authedProcedure.handler(async () => {
  try {
    return await getDashboardStats();
  } catch (error) {
    console.error('Admin stats error:', error);
    throw new ORPCError('INTERNAL_SERVER_ERROR', {
      message: 'Failed to fetch stats',
    });
  }
});

export const adminCustomersList = authedProcedure
  .input(
    z.object({
      status: z.string().optional(),
      search: z.string().optional(),
      page: z.number().optional().default(1),
      pageSize: z.number().optional().default(10),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await getCustomers(
        input.status,
        input.search,
        input.page,
        input.pageSize
      );
      return result;
    } catch (error) {
      console.error('Admin customers list error:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch customers',
      });
    }
  });

export const adminCustomerUpdate = authedProcedure
  .input(customerUpdateSchema)
  .handler(async ({ input }) => {
    try {
      await updateCustomer(input.id, {
        status: input.status,
        idConnection: input.idConnection,
        notes: input.notes,
      });
      return { ok: true };
    } catch (error) {
      if (error instanceof Error && error.message === 'Customer not found') {
        throw new ORPCError('NOT_FOUND', { message: 'Customer not found' });
      }
      console.error('Admin customer update error:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to update customer',
      });
    }
  });

export const adminRequestsList = authedProcedure
  .input(
    z.object({
      status: z.string().optional(),
      page: z.number().optional().default(1),
      pageSize: z.number().optional().default(10),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await getRequests(
        input.status,
        input.page,
        input.pageSize
      );
      return result;
    } catch (error) {
      console.error('Admin requests list error:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch requests',
      });
    }
  });

export const adminRouter = {
  stats: adminStats,
  customers: {
    list: adminCustomersList,
    update: adminCustomerUpdate,
  },
  requests: {
    list: adminRequestsList,
  },
};

export type AdminRouter = typeof adminRouter;
