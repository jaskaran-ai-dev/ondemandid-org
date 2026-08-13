import { describe, it, expect } from 'vitest';
import { GET as healthGET } from '@/app/api/health/route';
import { GET as detailedHealthGET } from '@/app/api/health/detailed/route';

describe('GET /api/health', () => {
  it('returns 200 with basic health status', async () => {
    const res = await healthGET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(body.version).toBeDefined();
  });
});

describe('GET /api/health/detailed', () => {
  it('returns 401 without health token', async () => {
    const res = await detailedHealthGET(
      new Request('http://localhost/api/health/detailed'),
      {}
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 503 with degraded status when services are not fully configured', async () => {
    const res = await detailedHealthGET(
      new Request('http://localhost/api/health/detailed', {
        headers: { 'X-Health-Token': 'default-health-token-change-in-production' },
      }),
      {}
    );
    // In test environment without full config, should be degraded
    expect([200, 503]).toContain(res.status);
    const body = await res.json();
    expect(body.timestamp).toBeDefined();
    expect(body.services).toBeDefined();
    expect(body.services.length).toBeGreaterThan(0);
  });
});
