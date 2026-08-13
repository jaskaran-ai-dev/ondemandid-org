import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  createSessionToken,
  verifySessionToken,
  setSessionCookie,
  clearSessionCookie,
  COOKIE_NAME,
} from '@/lib/admin/auth';

describe('createSessionToken', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates a valid session token', () => {
    const token = createSessionToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(2); // payload.signature
  });

  it('creates different tokens on subsequent calls', () => {
    const token1 = createSessionToken();
    const token2 = createSessionToken();
    expect(token1).not.toBe(token2);
  });
});

describe('verifySessionToken', () => {
  it('returns false for undefined token', () => {
    expect(verifySessionToken(undefined)).toBe(false);
  });

  it('returns false for malformed token', () => {
    expect(verifySessionToken('invalid')).toBe(false);
    expect(verifySessionToken('only-one-part')).toBe(false);
    expect(verifySessionToken('')).toBe(false);
  });

  it('returns false for token with wrong payload', () => {
    const token = createSessionToken();
    // Tamper with the payload
    const parts = token.split('.');
    const tamperedToken = `invalid.${parts[1]}`;
    expect(verifySessionToken(tamperedToken)).toBe(false);
  });

  it('returns false for expired token', async () => {
    const token = createSessionToken();
    
    // Mock Date.now to simulate expiration
    const originalNow = Date.now;
    vi.spyOn(Date, 'now').mockImplementation(() => {
      return originalNow() + (25 * 60 * 60 * 1000); // 25 hours later
    });

    const result = verifySessionToken(token);
    expect(result).toBe(false);

    vi.restoreAllMocks();
  });

  it('returns true for valid token', () => {
    const token = createSessionToken();
    const result = verifySessionToken(token);
    expect(result).toBe(true);
  });
});

describe('setSessionCookie', () => {
  it('sets cookie on response', () => {
    const response = new Response();
    setSessionCookie(response);
    
    const cookies = response.headers.get('set-cookie');
    expect(cookies).toBeDefined();
    expect(cookies).toContain(`${COOKIE_NAME}=`);
    expect(cookies).toContain('Path=/');
    expect(cookies).toContain('HttpOnly');
    expect(cookies).toContain('SameSite=Strict');
    expect(cookies).toContain('Max-Age=');
  });

  it('sets Secure flag in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const response = new Response();
    setSessionCookie(response);
    
    const cookies = response.headers.get('set-cookie');
    expect(cookies).toContain('Secure');
    
    if (originalEnv) process.env.NODE_ENV = originalEnv;
    else delete process.env.NODE_ENV;
  });

  it('does not set Secure flag in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const response = new Response();
    setSessionCookie(response);
    
    const cookies = response.headers.get('set-cookie');
    expect(cookies).not.toContain('Secure');
    
    if (originalEnv) process.env.NODE_ENV = originalEnv;
    else delete process.env.NODE_ENV;
  });
});

describe('clearSessionCookie', () => {
  it('clears cookie on response', () => {
    const response = new Response();
    clearSessionCookie(response);
    
    const cookies = response.headers.get('set-cookie');
    expect(cookies).toBeDefined();
    expect(cookies).toContain(`${COOKIE_NAME}=;`);
    expect(cookies).toContain('Max-Age=0');
  });
});
