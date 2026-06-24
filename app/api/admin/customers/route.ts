import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { desc, eq } from 'drizzle-orm';
import { isAdminAuthenticated } from '@/lib/admin/auth';

export async function GET(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const isDemoMode = process.env.DEMO_MODE === 'true';

  if (isDemoMode) {
    const demoCustomers = [
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

    let filtered = demoCustomers;
    if (status && status !== 'all') {
      filtered = filtered.filter(c => c.status === status);
    }
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

    return NextResponse.json({ customers: filtered });
  }

  try {
    let query = db.select().from(schema.customers).orderBy(desc(schema.customers.createdAt));

    // Note: Drizzle doesn't easily support dynamic where chaining here,
    // so we fetch all and filter in memory for simplicity.
    // For large datasets, use proper query building.
    const allCustomers = await query;

    let filtered: typeof allCustomers = allCustomers;
    if (status && status !== 'all') {
      filtered = filtered.filter((c: any) => c.status === status);
    }
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

    return NextResponse.json({
      customers: filtered.map((c: any) => ({
        ...c,
        createdAt:
          typeof c.createdAt === 'string'
            ? parseInt(c.createdAt) * 1000
            : new Date(c.createdAt as any).getTime(),
      })),
    });
  } catch (error) {
    console.error('Admin customers list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
