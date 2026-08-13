import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/admin/logout/route';

describe('POST /api/admin/logout', () => {
  it('returns 200 and clears session cookie', async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    
    const cookies = res.headers.get('set-cookie');
    expect(cookies).toBeDefined();
    expect(cookies).toContain('ivalt-admin-session=');
    expect(cookies).toContain('Max-Age=0');
  });
});
