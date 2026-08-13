import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

process.env.DEMO_MODE = 'false';
process.env.DB_TYPE = 'sqlite';
process.env.SQLITE_DB_PATH = ':memory:';

vi.mock('@/lib/ivalt', async importOriginal => {
  const mod = await importOriginal<typeof import('@/lib/ivalt')>();
  return { ...mod, triggerAuthRequest: vi.fn(), getAuthResult: vi.fn() };
});

vi.mock('@/lib/email', () => ({
  sendAdminVerificationAlert: vi.fn().mockResolvedValue(undefined),
}));

import { sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { POST } from '@/app/api/verify/route';
import { triggerAuthRequest } from '@/lib/ivalt';
import { sendAdminVerificationAlert } from '@/lib/email';

const DDL = [
  `CREATE TABLE IF NOT EXISTS customers (
    id text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    company_name text NOT NULL,
    contact_name text NOT NULL,
    email text NOT NULL UNIQUE,
    country_code text NOT NULL,
    mobile text NOT NULL,
    initial_users integer NOT NULL,
    id_connection text UNIQUE,
    status text NOT NULL DEFAULT 'pending',
    notes text,
    created_at text NOT NULL DEFAULT (strftime('%s','now')),
    updated_at text NOT NULL DEFAULT (strftime('%s','now')),
    deleted_at text
  )`,
  `CREATE TABLE IF NOT EXISTS ondemand_requests (
    id text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    country_code text NOT NULL,
    mobile text NOT NULL,
    id_connection text NOT NULL,
    request_from text,
    status text NOT NULL DEFAULT 'initiated',
    ivalt_status_code integer,
    ivalt_response text,
    ip_address text,
    user_agent text,
    created_at text NOT NULL DEFAULT (strftime('%s','now')),
    completed_at text,
    deleted_at text
  )`,
];

const mockTrigger = vi.mocked(triggerAuthRequest);

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

describe('POST /api/verify (production mode)', () => {
  beforeAll(async () => {
    for (const ddl of DDL) {
      await db.run(sql.raw(ddl));
    }
    await db.insert(schema.customers).values([
      {
        companyName: 'Acme Corporation',
        contactName: 'John Smith',
        email: 'john@acme.com',
        countryCode: '+1',
        mobile: '5550100123',
        initialUsers: 25,
        idConnection: 'ACME01',
        status: 'active',
      },
      {
        companyName: 'Inactive Inc',
        contactName: 'Jane Doe',
        email: 'jane@inactive.com',
        countryCode: '+1',
        mobile: '5550200123',
        initialUsers: 10,
        idConnection: 'INAC01',
        status: 'inactive',
      },
    ]);
  });

  beforeEach(() => {
    mockTrigger.mockReset();
  });

  it('returns 404 for an unknown IDCONNECTION', async () => {
    mockTrigger.mockResolvedValue({ status: 'initiated' } as never);
    const res = await post({
      idConnection: 'NOPE01',
      countryCode: '+1',
      mobile: '5550100123',
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe('not_found');
    expect(mockTrigger).not.toHaveBeenCalled();
  });

  it('returns 404 for an inactive IDCONNECTION', async () => {
    const res = await post({
      idConnection: 'INAC01',
      countryCode: '+1',
      mobile: '5550200123',
    });
    expect(res.status).toBe(404);
  });

  it('returns 202, creates an initiated request, and calls iVALT', async () => {
    mockTrigger.mockResolvedValue({ status: 'initiated' } as never);

    const res = await post({
      idConnection: 'ACME01',
      countryCode: '+1',
      mobile: '5550100123',
    });
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.status).toBe('initiated');
    expect(body.ivaltStatusCode).toBe(202);

    expect(mockTrigger).toHaveBeenCalledWith({
      idConnection: 'ACME01',
      countryCode: '+1',
      mobile: '5550100123',
    });

    const rows = await db
      .select()
      .from(schema.ondemandRequests)
      .where(sql`${schema.ondemandRequests.id} = ${body.id}`);
    expect(rows.length).toBe(1);
    expect(rows[0].status).toBe('initiated');
    expect(rows[0].idConnection).toBe('ACME01');
    expect(rows[0].ivaltStatusCode).toBe(202);
  });

  it('records the iVALT status code when the push fails', async () => {
    mockTrigger.mockRejectedValue(new Error('iVALT API error (500): boom'));

    const res = await post({
      idConnection: 'ACME01',
      countryCode: '+1',
      mobile: '5550100123',
    });
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.ivaltStatusCode).toBe(500);
    expect(body.ok).toBe(true);

    const rows = await db
      .select()
      .from(schema.ondemandRequests)
      .where(sql`${schema.ondemandRequests.id} = ${body.id}`);
    expect(rows[0].ivaltStatusCode).toBe(500);
    expect(rows[0].ivaltResponse).toContain('boom');
  });

  it('sends the admin verification alert email', async () => {
    mockTrigger.mockResolvedValue({ status: 'initiated' } as never);
    await post({
      idConnection: 'ACME01',
      countryCode: '+1',
      mobile: '5550100123',
    });
    await vi.waitFor(() => {
      expect(sendAdminVerificationAlert).toHaveBeenCalled();
    });
    const call = vi.mocked(sendAdminVerificationAlert).mock.calls.at(-1)?.[0];
    expect(call?.idConnection).toBe('ACME01');
    expect(call?.status).toBe('initiated');
  });
});