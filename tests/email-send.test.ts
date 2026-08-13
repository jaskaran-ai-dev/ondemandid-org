import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendEmail } from '@/lib/email/transport';
import {
  sendAdminSignupNotification,
  sendCustomerConfirmation,
  sendAdminVerificationAlert,
} from '@/lib/email/send';

// Mock the transport module so no real email is ever sent
vi.mock('@/lib/email/transport', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

// Configure fake SMTP env vars so isEmailConfigured() returns true by default.
// Individual tests that want to test the "not configured" branch delete these.
const FAKE_EMAIL_ENV = {
  SMTP_HOST: 'smtp.example.com',
  SMTP_USER: 'test@example.com',
  SMTP_PASS: 'password',
  ADMIN_EMAIL: 'admin@example.com',
};

describe('sendAdminSignupNotification', () => {
  beforeEach(() => {
    Object.assign(process.env, FAKE_EMAIL_ENV);
    vi.clearAllMocks();
  });

  afterEach(() => {
    for (const key of Object.keys(FAKE_EMAIL_ENV)) {
      delete process.env[key];
    }
  });

  it('sends email to admin with correct data', async () => {
    await sendAdminSignupNotification({
      companyName: 'Acme Corp',
      contactName: 'John Smith',
      email: 'john@acme.com',
      countryCode: '+1',
      mobile: '5550100123',
      initialUsers: 25,
      notes: 'Test notes',
      customerId: 'cust_123',
    });

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(String),
        subject: 'New Customer Signup: Acme Corp',
        html: expect.stringContaining('Acme Corp'),
        text: expect.stringContaining('Acme Corp'),
      })
    );
  });

  it('skips sending when email is not configured', async () => {
    // Remove all email config for this specific test
    delete process.env.EMAIL_PROVIDER;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    await sendAdminSignupNotification({
      companyName: 'Test',
      contactName: 'Test',
      email: 'test@test.com',
      countryCode: '+1',
      mobile: '5550100123',
      initialUsers: 1,
      notes: '',
      customerId: 'cust_1',
    });

    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe('sendCustomerConfirmation', () => {
  beforeEach(() => {
    Object.assign(process.env, FAKE_EMAIL_ENV);
    vi.clearAllMocks();
  });

  afterEach(() => {
    for (const key of Object.keys(FAKE_EMAIL_ENV)) {
      delete process.env[key];
    }
  });

  it('sends confirmation email to customer', async () => {
    await sendCustomerConfirmation({
      email: 'john@acme.com',
      companyName: 'Acme Corp',
      customerId: 'cust_123',
    });

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'john@acme.com',
        subject: 'Registration Received - iVALT OnDemand ID',
        html: expect.stringContaining('Acme Corp'),
      })
    );
  });
});

describe('sendAdminVerificationAlert', () => {
  beforeEach(() => {
    Object.assign(process.env, FAKE_EMAIL_ENV);
    vi.clearAllMocks();
  });

  afterEach(() => {
    for (const key of Object.keys(FAKE_EMAIL_ENV)) {
      delete process.env[key];
    }
  });

  it('sends verification alert to admin', async () => {
    await sendAdminVerificationAlert({
      idConnection: 'ACME01',
      countryCode: '+1',
      mobile: '5550100123',
      status: 'authenticated',
      ivaltStatusCode: 200,
      requestId: 'req_123',
    });

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Verification Attempt: ACME01',
        html: expect.stringContaining('ACME01'),
        text: expect.stringContaining('ACME01'),
      })
    );
  });
});
