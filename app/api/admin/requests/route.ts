import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { desc, eq, sql } from 'drizzle-orm';
import { isAdminAuthenticated } from '@/lib/admin/auth';

export async function GET(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const isDemoMode = process.env.DEMO_MODE === 'true';

  if (isDemoMode) {
    const demoRequests = [
      {
        id: 'req_demo_1',
        idConnection: 'ACME01',
        countryCode: '+1',
        mobile: '5550100123',
        status: 'authenticated',
        ivaltStatusCode: 200,
        requestFrom: 'Web portal',
        createdAt: Date.now() - 3600000,
        completedAt: Date.now() - 3500000,
      },
      {
        id: 'req_demo_2',
        idConnection: 'GLBX01',
        countryCode: '+44',
        mobile: '7700900123',
        status: 'failed',
        ivaltStatusCode: 403,
        requestFrom: 'Mobile app',
        createdAt: Date.now() - 7200000,
        completedAt: Date.now() - 7100000,
      },
      {
        id: 'req_demo_3',
        idConnection: 'STARK01',
        countryCode: '+1',
        mobile: '5550400111',
        status: 'pending',
        ivaltStatusCode: 422,
        requestFrom: 'Admin panel',
        createdAt: Date.now() - 1800000,
        completedAt: null,
      },
      {
        id: 'req_demo_4',
        idConnection: 'ACME01',
        countryCode: '+1',
        mobile: '5550100123',
        status: 'authenticated',
        ivaltStatusCode: 200,
        requestFrom: 'Web portal',
        createdAt: Date.now() - 10800000,
        completedAt: Date.now() - 10700000,
      },
      {
        id: 'req_demo_5',
        idConnection: 'GLBX01',
        countryCode: '+44',
        mobile: '7700900123',
        status: 'not_found',
        ivaltStatusCode: 404,
        requestFrom: 'API',
        createdAt: Date.now() - 14400000,
        completedAt: Date.now() - 14300000,
      },
      {
        id: 'req_demo_6',
        idConnection: 'STARK01',
        countryCode: '+1',
        mobile: '5550400111',
        status: 'authenticated',
        ivaltStatusCode: 200,
        requestFrom: 'Web portal',
        createdAt: Date.now() - 18000000,
        completedAt: Date.now() - 17900000,
      },
      {
        id: 'req_demo_7',
        idConnection: 'ACME01',
        countryCode: '+1',
        mobile: '5550100123',
        status: 'failed',
        ivaltStatusCode: 403,
        requestFrom: 'Mobile app',
        createdAt: Date.now() - 21600000,
        completedAt: Date.now() - 21500000,
      },
    ];

    let filtered = demoRequests;
    if (status && status !== 'all') {
      if (status === 'pending') {
        filtered = filtered.filter(
          r => r.status === 'pending' || r.status === 'initiated'
        );
      } else {
        filtered = filtered.filter(r => r.status === status);
      }
    }

    return NextResponse.json({ requests: filtered });
  }

  try {
    let query = db
      .select()
      .from(schema.ondemandRequests)
      .orderBy(desc(schema.ondemandRequests.createdAt));

    const allRequests = await query;

    let filtered: typeof allRequests = allRequests;
    if (status && status !== 'all') {
      if (status === 'pending') {
        filtered = filtered.filter(
          (r: any) => r.status === 'pending' || r.status === 'initiated'
        );
      } else {
        filtered = filtered.filter((r: any) => r.status === status);
      }
    }

    return NextResponse.json({
      requests: filtered.map((r: any) => ({
        ...r,
        createdAt:
          typeof r.createdAt === 'string'
            ? parseInt(r.createdAt) * 1000
            : new Date(r.createdAt as any).getTime(),
        completedAt:
          r.completedAt
            ? typeof r.completedAt === 'string'
              ? parseInt(r.completedAt) * 1000
              : new Date(r.completedAt as any).getTime()
            : null,
      })),
    });
  } catch (error) {
    console.error('Admin requests list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
