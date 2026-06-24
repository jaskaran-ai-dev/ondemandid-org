import { db, schema } from '@/lib/db';
import { desc, eq, sql } from 'drizzle-orm';

export interface Customer {
  id: string | number;
  companyName: string;
  contactName: string;
  email: string;
  countryCode: string;
  mobile: string;
  initialUsers: number;
  idConnection: string | null;
  status: string;
  notes: string | null;
  createdAt: number;
}

function toTimestamp(value: string | Date | number | null | undefined): number {
  if (!value) return Date.now();
  if (typeof value === 'number') return value * 1000;
  if (value instanceof Date) return value.getTime();
  return parseInt(value) * 1000;
}

interface DemoCustomer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  countryCode: string;
  mobile: string;
  initialUsers: number;
  idConnection: string | null;
  status: string;
  notes: string | null;
  createdAt: number;
}

const demoCustomers: DemoCustomer[] = [
  {
    id: 'cust_demo_1',
    companyName: 'Acme Corporation',
    contactName: 'John Smith',
    email: 'john@acme.com',
    countryCode: '+1',
    mobile: '5550100123',
    initialUsers: 25,
    idConnection: 'ACME01',
    status: 'active',
    notes: 'Enterprise customer - priority support',
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'cust_demo_2',
    companyName: 'Globex Inc',
    contactName: 'Jane Doe',
    email: 'jane@globex.io',
    countryCode: '+44',
    mobile: '7700900123',
    initialUsers: 50,
    idConnection: 'GLBX01',
    status: 'active',
    notes: 'Signed up via partner referral',
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'cust_demo_3',
    companyName: 'Initech Solutions',
    contactName: 'Bob Johnson',
    email: 'bob@initech.com',
    countryCode: '+1',
    mobile: '5550200456',
    initialUsers: 10,
    idConnection: null,
    status: 'pending',
    notes: 'Awaiting IDCONNECTION provisioning',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'cust_demo_4',
    companyName: 'Umbrella Corp',
    contactName: 'Alice Williams',
    email: 'alice@umbrella.co',
    countryCode: '+1',
    mobile: '5550300789',
    initialUsers: 100,
    idConnection: null,
    status: 'inactive',
    notes: 'Trial ended - requested extension',
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    id: 'cust_demo_5',
    companyName: 'Stark Industries',
    contactName: 'Tony Stark',
    email: 'tony@stark.com',
    countryCode: '+1',
    mobile: '5550400111',
    initialUsers: 5,
    idConnection: 'STARK01',
    status: 'active',
    notes: 'Executive team only',
    createdAt: Date.now() - 86400000 * 10,
  },
];

export async function getCustomers(
  status?: string | null,
  search?: string | null
): Promise<Customer[]> {
  const isDemo = process.env.DEMO_MODE === 'true';

  if (isDemo) {
    let filtered = [...demoCustomers];
    if (status && status !== 'all')
      filtered = filtered.filter(c => c.status === status);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.companyName.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.idConnection || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  const allCustomers = await db
    .select()
    .from(schema.customers)
    .orderBy(desc(schema.customers.createdAt));

  let filtered = allCustomers;
  if (status && status !== 'all')
    filtered = filtered.filter((c: any) => c.status === status);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c: any) =>
        c.companyName.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.idConnection || '').toLowerCase().includes(q)
    );
  }

  return filtered.map(c => ({
    ...c,
    createdAt: toTimestamp((c as any).createdAt),
  })) as Customer[];
}

export async function updateCustomer(
  id: string | number,
  data: { status?: string; idConnection?: string; notes?: string }
): Promise<{ ok: boolean }> {
  const isDemo = process.env.DEMO_MODE === 'true';

  if (isDemo) return { ok: true };

  const updateData: Record<string, unknown> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.idConnection !== undefined)
    updateData.idConnection = data.idConnection;
  if (data.notes !== undefined) updateData.notes = data.notes;

  if (process.env.DB_TYPE === 'neon') {
    updateData.updatedAt = new Date();
  } else {
    updateData.updatedAt = sql`${Math.floor(Date.now() / 1000)}`;
  }

  const updated = await db
    .update(schema.customers)
    .set(updateData)
    .where(eq(schema.customers.id, id))
    .returning();
  if (updated.length === 0) throw new Error('Customer not found');
  return { ok: true };
}
