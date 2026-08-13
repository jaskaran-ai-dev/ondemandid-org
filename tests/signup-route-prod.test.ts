import { describe, it, expect, vi, beforeAll } from 'vitest';

process.env.DEMO_MODE = 'false';
process.env.DB_TYPE = 'sqlite';
process.env.SQLITE_DB_PATH = ':memory:';

vi.mock('@/lib/email', () => ({
  sendAdminSignupNotification: vi.fn().mockResolvedValue(undefined),
  sendCustomerConfirmation: vi.fn().mockResolvedValue(undefined),
}));

import { sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { POST } from '@/app/api/signup/route';

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

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

const validSignup = {
  companyName: 'Acme Corporation',
  contactName: 'John Smith',
  email: 'john@acme.com',
  countryCode: '+1',
  mobile: '5550100123',
  initialUsers: 25,
};

describe('POST /api/signup (production mode)', () => {
  beforeAll(async () => {
    for (const ddl of DDL) {
      await db.run(sql.raw(ddl));
    }
  });

  it('returns 201 for a new customer', async () => {
    const res = await post(validSignup);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.status).toBe('pending');
  });

  it('returns 409 with a friendly message when the email is already registered', async () => {
    const res = await post(validSignup);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain('already registered');
    expect(body.error).not.toContain('duplicate key');
    expect(body.error).not.toContain('PostgresError');
  });

  it('still accepts a different email', async () => {
    const res = await post({ ...validSignup, email: 'other@acme.com' });
    expect(res.status).toBe(201);
  });

  it('returns 400 for an invalid payload', async () => {
    const res = await post({ companyName: 'A', email: 'nope' });
    expect(res.status).toBe(400);
  });
});