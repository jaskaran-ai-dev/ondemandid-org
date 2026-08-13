import { describe, it, expect, vi } from 'vitest';

// Mock next/headers so cookies() works outside a Next.js request scope.
// The mock returns an empty cookie store (no session cookie), so
// isAdminAuthenticated() will return false.
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));

import { GET } from '@/app/api/admin/session/route';

describe('GET /api/admin/session', () => {
  it('returns authenticated false when no session cookie exists', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authenticated).toBe(false);
  });
});
