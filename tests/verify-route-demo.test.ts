import { describe, it, expect, vi, beforeEach } from 'vitest';

process.env.DEMO_MODE = 'true';
process.env.DB_TYPE = 'sqlite';
process.env.SQLITE_DB_PATH = ':memory:';

import { POST } from '@/app/api/verify/route';
import { simRequests } from '@/lib/sim-store';

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

describe('POST /api/verify (demo mode)', () => {
  beforeEach(() => {
    simRequests.clear();
  });

  it('returns 400 for an invalid payload', async () => {
    const res = await post({ idConnection: 'X', mobile: '123' });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid verification payload');
    expect(body.details).toBeDefined();
  });

  it('accepts MISSING01 and marks it for a not_found resolution', async () => {
    const res = await post({
      idConnection: 'MISSING01',
      countryCode: '+1',
      mobile: '5550100123',
    });
    // Demo verify always returns 202; the not_found surfaces via status polling.
    expect(res.status).toBe(202);
    const body = await res.json();
    const entry = simRequests.get(body.id);
    expect(entry?.finalStatus).toBe('not_found');
    expect(entry?.finalCode).toBe(404);
  });

  it('returns 202 initiated with a request id for a valid code', async () => {
    const res = await post({
      idConnection: 'ACME7421',
      countryCode: '+1',
      mobile: '5550100123',
    });
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.status).toBe('initiated');
    expect(body.ivaltStatusCode).toBe(422);
    expect(body.id).toMatch(/^req_/);
    expect(simRequests.has(body.id)).toBe(true);
  });

  it('registers a failed outcome when mobile ends in 0000', async () => {
    const res = await post({
      idConnection: 'ACME7421',
      countryCode: '+1',
      mobile: '5550100000',
    });
    const body = await res.json();
    const entry = simRequests.get(body.id);
    expect(entry?.finalStatus).toBe('failed');
    expect(entry?.finalCode).toBe(403);
  });
});
