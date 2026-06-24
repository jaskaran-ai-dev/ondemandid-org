import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, sql, desc } from 'drizzle-orm';
import { isAdminAuthenticated } from '@/lib/admin/auth';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isDemoMode = process.env.DEMO_MODE === 'true';

  if (isDemoMode) {
    return NextResponse.json({
      totalCustomers: 5,
      activeCustomers: 3,
      pendingCustomers: 1,
      inactiveCustomers: 1,
      totalRequests: 15,
      authenticatedRequests: 5,
      failedRequests: 5,
      pendingRequests: 5,
      recentRequests: [
        {
          id: 'req_demo_1',
          idConnection: 'ACME01',
          mobile: '5550100123',
          status: 'authenticated',
          createdAt: Date.now() - 3600000,
        },
        {
          id: 'req_demo_2',
          idConnection: 'GLBX01',
          mobile: '7700900123',
          status: 'failed',
          createdAt: Date.now() - 7200000,
        },
        {
          id: 'req_demo_3',
          idConnection: 'STARK01',
          mobile: '5550400111',
          status: 'pending',
          createdAt: Date.now() - 1800000,
        },
        {
          id: 'req_demo_4',
          idConnection: 'ACME01',
          mobile: '5550100123',
          status: 'authenticated',
          createdAt: Date.now() - 10800000,
        },
        {
          id: 'req_demo_5',
          idConnection: 'GLBX01',
          mobile: '7700900123',
          status: 'authenticated',
          createdAt: Date.now() - 14400000,
        },
      ],
    });
  }

  try {
    // Customer counts by status
    const [totalCustomers] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.customers);

    const [activeCustomers] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.customers)
      .where(eq(schema.customers.status, 'active'));

    const [pendingCustomers] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.customers)
      .where(eq(schema.customers.status, 'pending'));

    const [inactiveCustomers] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.customers)
      .where(eq(schema.customers.status, 'inactive'));

    // Request counts by status
    const [totalRequests] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.ondemandRequests);

    const [authenticatedRequests] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.ondemandRequests)
      .where(eq(schema.ondemandRequests.status, 'authenticated'));

    const [failedRequests] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.ondemandRequests)
      .where(eq(schema.ondemandRequests.status, 'failed'));

    const [pendingRequests] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.ondemandRequests)
      .where(
        sql`${schema.ondemandRequests.status} IN ('pending', 'initiated')`
      );

    // Recent requests
    const recentRequests = await db
      .select({
        id: schema.ondemandRequests.id,
        idConnection: schema.ondemandRequests.idConnection,
        mobile: schema.ondemandRequests.mobile,
        status: schema.ondemandRequests.status,
        createdAt: schema.ondemandRequests.createdAt,
      })
      .from(schema.ondemandRequests)
      .orderBy(desc(schema.ondemandRequests.createdAt))
      .limit(5);

    return NextResponse.json({
      totalCustomers: totalCustomers?.count ?? 0,
      activeCustomers: activeCustomers?.count ?? 0,
      pendingCustomers: pendingCustomers?.count ?? 0,
      inactiveCustomers: inactiveCustomers?.count ?? 0,
      totalRequests: totalRequests?.count ?? 0,
      authenticatedRequests: authenticatedRequests?.count ?? 0,
      failedRequests: failedRequests?.count ?? 0,
      pendingRequests: pendingRequests?.count ?? 0,
      recentRequests: recentRequests.map((r: any) => ({
        ...r,
        createdAt:
          typeof r.createdAt === 'string'
            ? parseInt(r.createdAt) * 1000
            : new Date(r.createdAt as any).getTime(),
      })),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
