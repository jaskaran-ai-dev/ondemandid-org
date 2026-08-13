import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifySchema, signupSchema } from '@/lib/validation';

describe('verifySchema (IDCONNECTION verification form)', () => {
  const valid = {
    idConnection: 'ACME7421',
    countryCode: '+1',
    mobile: '5550100123',
  };

  it('accepts a valid payload', () => {
    expect(verifySchema.safeParse(valid).success).toBe(true);
  });

  it('normalizes idConnection to uppercase', () => {
    const parsed = verifySchema.safeParse({
      ...valid,
      idConnection: 'acme7421',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.idConnection).toBe('ACME7421');
  });

  it('rejects an idConnection shorter than 4 chars', () => {
    const result = verifySchema.safeParse({ ...valid, idConnection: 'AB' });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toContain('4–12');
  });

  it('rejects an idConnection longer than 12 chars', () => {
    const result = verifySchema.safeParse({
      ...valid,
      idConnection: 'ABCDEFGHIJKLMN',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an idConnection with special characters', () => {
    const result = verifySchema.safeParse({
      ...valid,
      idConnection: 'ACME-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a country code not starting with +', () => {
    const result = verifySchema.safeParse({ ...valid, countryCode: '1' });
    expect(result.success).toBe(false);
  });

  it('rejects a mobile number with spaces or dashes', () => {
    const result = verifySchema.safeParse({
      ...valid,
      mobile: '555 010 0123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a mobile number shorter than 6 digits', () => {
    const result = verifySchema.safeParse({ ...valid, mobile: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = verifySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('signupSchema (customer registration)', () => {
  const valid = {
    companyName: 'Acme Corporation',
    contactName: 'John Smith',
    email: 'john@acme.com',
    countryCode: '+1',
    mobile: '5550100123',
    initialUsers: 25,
  };

  it('accepts a valid payload', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it('normalizes email to lowercase and trims', () => {
    const parsed = signupSchema.safeParse({
      ...valid,
      email: '  John@Acme.COM ',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.email).toBe('john@acme.com');
  });

  it('rejects a duplicate-style invalid email', () => {
    const result = signupSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects initialUsers outside 1–100', () => {
    expect(signupSchema.safeParse({ ...valid, initialUsers: 0 }).success).toBe(
      false
    );
    expect(
      signupSchema.safeParse({ ...valid, initialUsers: 101 }).success
    ).toBe(false);
    expect(signupSchema.safeParse({ ...valid, initialUsers: 2.5 }).success).toBe(
      false
    );
  });

  it('accepts empty notes and captchaToken', () => {
    const result = signupSchema.safeParse({ ...valid, notes: '', captchaToken: '' });
    expect(result.success).toBe(true);
  });

  it('rejects a company name shorter than 2 chars', () => {
    const result = signupSchema.safeParse({ ...valid, companyName: 'A' });
    expect(result.success).toBe(false);
  });
});
