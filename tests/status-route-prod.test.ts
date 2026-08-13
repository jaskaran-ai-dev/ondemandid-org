import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

process.env.DEMO_MODE = 'false';
process.env.DB_TYPE = 'sqlite';
process.env.SQLITE_DB_PATH = ':memory:';

vi.mock('@/lib/ivalt', async importOriginal => {
  const mod = await importOriginal<typeof import('@/lib/ivalt')>();
  return { ...mod, triggerAuthRequest: vi.fn(), getAuthResult: vi.fn() };
});

import { sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { GET } from '@/app/api/status/[id]/route';
import { getAuthResult } from '@/lib/ivalt';

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

const mockGetAuthResult = vi.mocked(getAuthResult);

function buildRequest(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    countryCode: '+1',
    mobile: '5550100123',
    idConnection: 'ACME01',
    status: 'initiated',
    ivaltStatusCode: null,
    ivaltResponse: null,
    requestFrom: null,
    ...overrides,
  };
}

function get(id: string) {
  return GET(new Request(`http://localhost/api/status/${id}`), {
    params: Promise.resolve({ id }),
  });
}

describe('GET /api/status/:id (production mode)', () => {
  beforeAll(async () => {
    for (const ddl of DDL) {
      await db.run(sql.raw(ddl));
    }
  });

  beforeEach(() => {
    mockGetAuthResult.mockReset();
  });

  it('returns 404 for an unknown request id', async () => {
    const res = await get('nonexistent');
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe('not_found');
    expect(body.ivaltStatusCode).toBe(404);
  });

  it('returns 404 for a soft-deleted request', async () => {
    await db.insert(schema.ondemandRequests).values(
      buildRequest('req_deleted_1', {
        status: 'authenticated',
        ivaltStatusCode: 200,
        deletedAt: new Date().toISOString(),
      })
    );
    const res = await get('req_deleted_1');
    expect(res.status).toBe(404);
    expect(mockGetAuthResult).not.toHaveBeenCalled();
  });

  it('returns a terminal request as-is with completedAt', async () => {
    await db.insert(schema.ondemandRequests).values(
      buildRequest('req_terminal_1', {
        status: 'authenticated',
        ivaltStatusCode: 200,
        completedAt: '2026-01-01T00:00:00.000Z',
      })
    );
    const res = await get('req_terminal_1');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('authenticated');
    expect(body.completedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(mockGetAuthResult).not.toHaveBeenCalled();
  });

  it('polls iVALT and resolves a pending request to authenticated (200)', async () => {
    await db.insert(schema.ondemandRequests).values(
      buildRequest('req_auth_1', { status: 'pending', ivaltStatusCode: 422 })
    );
    mockGetAuthResult.mockResolvedValue({
      data: { status: true, details: { name: 'John Smith' } },
      error: null,
    } as never);

    const res = await get('req_auth_1');
    const body = await res.json();
    expect(body.status).toBe('authenticated');
    expect(body.ivaltStatusCode).toBe(200);
    expect(body.details).toEqual({ name: 'John Smith' });

    const [row] = await db
      .select()
      .from(schema.ondemandRequests)
      .where(sql`${schema.ondemandRequests.id} = 'req_auth_1'`);
    expect(row.status).toBe('authenticated');
    expect(row.completedAt).toBeTruthy();
  });

  it('polls iVALT and resolves a pending request to failed (403)', async () => {
    await db.insert(schema.ondemandRequests).values(
      buildRequest('req_failed_1', { status: 'pending', ivaltStatusCode: 422 })
    );
    mockGetAuthResult.mockResolvedValue({ statusCode: 403 } as never);

    const res = await get('req_failed_1');
    const body = await res.json();
    expect(body.status).toBe('failed');
    expect(body.ivaltStatusCode).toBe(403);

    const [row] = await db
      .select()
      .from(schema.ondemandRequests)
      .where(sql`${schema.ondemandRequests.id} = 'req_failed_1'`);
    expect(row.status).toBe('failed');
    expect(row.completedAt).toBeTruthy();
  });

  it('stays pending (422) while iVALT reports 422', async () => {
    await db.insert(schema.ondemandRequests).values(
      buildRequest('req_pending_1', { status: 'pending', ivaltStatusCode: 422 })
    );
    mockGetAuthResult.mockResolvedValue({ statusCode: 422 } as never);

    const res = await get('req_pending_1');
    const body = await res.json();
    expect(body.status).toBe('pending');
    expect(body.ivaltStatusCode).toBe(422);
    expect(body.completedAt).toBeUndefined();
  });

  it('falls back to pending when the iVALT poll throws', async () => {
    await db.insert(schema.ondemandRequests).values(
      buildRequest('req_error_1', { status: 'pending', ivaltStatusCode: 422 })
    );
    mockGetAuthResult.mockRejectedValue(new Error('network down'));

    const res = await get('req_error_1');
    const body = await res.json();
    expect(body.status).toBe('pending');
    expect(body.ivaltStatusCode).toBe(422);
  });

  it('resolves to not_found when iVALT maps a 404', async () => {
    await db.insert(schema.ondemandRequests).values(
      buildRequest('req_404_1', { status: 'pending', ivaltStatusCode: 422 })
    );
    mockGetAuthResult.mockResolvedValue({ statusCode: 404 } as never);

    const res = await get('req_404_1');
    const body = await res.json();
    expect(body.status).toBe('not_found');
    expect(body.ivaltStatusCode).toBe(404);
  });
});