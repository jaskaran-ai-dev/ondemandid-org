import { describe, it, expect, vi, beforeEach } from 'vitest';

process.env.DEMO_MODE = 'true';
process.env.DB_TYPE = 'sqlite';
process.env.SQLITE_DB_PATH = ':memory:';

import { GET } from '@/app/api/status/[id]/route';
import { simRequests, type SimulatedRequest } from '@/lib/sim-store';

function buildRequest(id: string, overrides: Partial<SimulatedRequest> = {}) {
  const now = Date.now();
  const entry: SimulatedRequest = {
    id,
    idConnection: 'ACME7421',
    countryCode: '+1',
    mobile: '5550100123',
    status: 'pending',
    ivaltStatusCode: 422,
    createdAt: now,
    resolveAt: now + 5000,
    finalStatus: 'authenticated',
    finalCode: 200,
    ...overrides,
  };
  simRequests.set(id, entry);
  return entry;
}

describe('GET /api/status/:id (demo mode)', () => {
  beforeEach(() => {
    simRequests.clear();
  });

  it('returns 404 for an unknown request id', async () => {
    const res = await GET(new Request('http://localhost/api/status/unknown'), {
      params: Promise.resolve({ id: 'unknown' }),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe('not_found');
    expect(body.ivaltStatusCode).toBe(404);
  });

  it('returns pending (422) before resolveAt', async () => {
    buildRequest('req_pending_1', { resolveAt: Date.now() + 60000 });
    const res = await GET(
      new Request('http://localhost/api/status/req_pending_1'),
      { params: Promise.resolve({ id: 'req_pending_1' }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('pending');
    expect(body.ivaltStatusCode).toBe(422);
  });

  it('resolves to authenticated after resolveAt', async () => {
    buildRequest('req_done_1', { resolveAt: Date.now() - 1 });
    const res = await GET(
      new Request('http://localhost/api/status/req_done_1'),
      { params: Promise.resolve({ id: 'req_done_1' }) }
    );
    const body = await res.json();
    expect(body.status).toBe('authenticated');
    expect(body.ivaltStatusCode).toBe(200);
    expect(body.completedAt).toBeDefined();
  });

  it('returns terminal status as-is without re-resolution', async () => {
    const entry = buildRequest('req_terminal_1', {
      status: 'failed',
      ivaltStatusCode: 403,
      finalStatus: 'failed',
      finalCode: 403,
      resolveAt: Date.now() + 60000,
      completedAt: Date.now(),
    });
    const res = await GET(
      new Request('http://localhost/api/status/req_terminal_1'),
      { params: Promise.resolve({ id: 'req_terminal_1' }) }
    );
    expect(entry.status).toBe('failed');
    const body = await res.json();
    expect(body.status).toBe('failed');
    expect(body.ivaltStatusCode).toBe(403);
  });

  it('returns not_found for MISSING01 flows (404)', async () => {
    buildRequest('req_missing_1', {
      idConnection: 'MISSING01',
      finalStatus: 'not_found',
      finalCode: 404,
      resolveAt: Date.now() - 1,
    });
    const res = await GET(
      new Request('http://localhost/api/status/req_missing_1'),
      { params: Promise.resolve({ id: 'req_missing_1' }) }
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe('not_found');
  });

  it('returns failed for a denied flow (mobile ending 0000)', async () => {
    buildRequest('req_denied_1', {
      finalStatus: 'failed',
      finalCode: 403,
      resolveAt: Date.now() - 1,
    });
    const res = await GET(
      new Request('http://localhost/api/status/req_denied_1'),
      { params: Promise.resolve({ id: 'req_denied_1' }) }
    );
    const body = await res.json();
    expect(body.status).toBe('failed');
    expect(body.ivaltStatusCode).toBe(403);
  });
});