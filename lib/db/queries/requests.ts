import { db, schema } from '@/lib/db';
import { desc, sql } from 'drizzle-orm';

export interface VerificationRequest {
  id: string | number;
  idConnection: string;
  countryCode: string;
  mobile: string;
  status: string;
  ivaltStatusCode: number | null;
  requestFrom: string | null;
  createdAt: number;
  completedAt: number | null;
}

function toTimestamp(
  value: string | Date | number | null | undefined
): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return value * 1000;
  if (value instanceof Date) return value.getTime();
  return parseInt(value) * 1000;
}

interface DemoRequest {
  id: string;
  idConnection: string;
  countryCode: string;
  mobile: string;
  status: string;
  ivaltStatusCode: number | null;
  requestFrom: string | null;
  createdAt: number;
  completedAt: number | null;
}

const demoRequests: DemoRequest[] = [
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

export async function getRequests(
  status?: string | null
): Promise<VerificationRequest[]> {
  const isDemo = process.env.DEMO_MODE === 'true';

  if (isDemo) {
    let filtered = [...demoRequests];
    if (status && status !== 'all') {
      if (status === 'pending') {
        filtered = filtered.filter(
          r => r.status === 'pending' || r.status === 'initiated'
        );
      } else {
        filtered = filtered.filter(r => r.status === status);
      }
    }
    return filtered;
  }

  const allRequests = await db
    .select()
    .from(schema.ondemandRequests)
    .orderBy(desc(schema.ondemandRequests.createdAt));

  let filtered = allRequests;
  if (status && status !== 'all') {
    if (status === 'pending') {
      filtered = filtered.filter(
        (r: any) => r.status === 'pending' || r.status === 'initiated'
      );
    } else {
      filtered = filtered.filter((r: any) => r.status === status);
    }
  }

  return filtered.map(r => ({
    ...r,
    createdAt: toTimestamp((r as any).createdAt) ?? 0,
    completedAt: toTimestamp((r as any).completedAt),
  })) as VerificationRequest[];
}
