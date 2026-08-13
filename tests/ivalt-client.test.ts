import { describe, it, expect, vi, afterEach } from 'vitest';
import { mapIvaltStatus, triggerAuthRequest } from '@/lib/ivalt';

describe('mapIvaltStatus', () => {
  it('maps 200 → authenticated', () => {
    expect(mapIvaltStatus(200)).toEqual({
      status: 'authenticated',
      ivaltStatusCode: 200,
    });
  });

  it('maps 403 → failed', () => {
    expect(mapIvaltStatus(403)).toEqual({
      status: 'failed',
      ivaltStatusCode: 403,
    });
  });

  it('maps 404 → not_found', () => {
    expect(mapIvaltStatus(404)).toEqual({
      status: 'not_found',
      ivaltStatusCode: 404,
    });
  });

  it('maps 422 and 400 → pending (422)', () => {
    expect(mapIvaltStatus(422).status).toBe('pending');
    expect(mapIvaltStatus(400).status).toBe('pending');
    expect(mapIvaltStatus(422).ivaltStatusCode).toBe(422);
  });

  it('maps unknown codes → failed with original code', () => {
    const result = mapIvaltStatus(500);
    expect(result.status).toBe('failed');
    expect(result.ivaltStatusCode).toBe(500);
  });
});

describe('triggerAuthRequest', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts id_connection and full mobile to /biometric-auth-request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      json: async () => ({ status: 'initiated' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await triggerAuthRequest({
      idConnection: 'ACME7421',
      countryCode: '+1',
      mobile: '5550100123',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.ivalt.com/biometric-auth-request',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-api-key': expect.any(String),
        }),
        body: JSON.stringify({
          id_connection: 'ACME7421',
          mobile: '+15550100123',
        }),
      })
    );
    expect(result).toEqual({ status: 'initiated' });
  });

  it('throws with status code embedded when iVALT responds with an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({ message: 'still pending' }),
      })
    );

    await expect(
      triggerAuthRequest({
        idConnection: 'ACME7421',
        countryCode: '+1',
        mobile: '5550100123',
      })
    ).rejects.toThrow(/iVALT API error \(422\)/);
  });

  it('throws when IVALT_API_KEY is missing', async () => {
    const original = process.env.IVALT_API_KEY;
    delete process.env.IVALT_API_KEY;
    vi.resetModules();

    try {
      const fresh = await import('@/lib/ivalt/client');
      await expect(
        fresh.triggerAuthRequest({
          idConnection: 'ACME7421',
          countryCode: '+1',
          mobile: '5550100123',
        })
      ).rejects.toThrow(/IVALT_API_KEY is not set/);
    } finally {
      if (original !== undefined) process.env.IVALT_API_KEY = original;
      vi.resetModules();
    }
  });
});