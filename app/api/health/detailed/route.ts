// Detailed health check endpoint
// Requires X-Health-Token header for access

import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { sql } from 'drizzle-orm';

const HEALTH_TOKEN =
  process.env.HEALTH_TOKEN || 'default-health-token-change-in-production';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  details?: string;
}

async function checkDatabase(): Promise<ServiceStatus> {
  try {
    // Simple query to test connectivity
    await db
      .select({ count: sql`1` })
      .from(schema.customers)
      .limit(1);
    return { name: 'Database', status: 'operational' };
  } catch (error) {
    return {
      name: 'Database',
      status: 'down',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkEmail(): Promise<ServiceStatus> {
  try {
    const emailProvider = process.env.EMAIL_PROVIDER || 'ses';
    const hasCredentials =
      emailProvider === 'ses'
        ? !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
        : !!(
            process.env.SMTP_HOST &&
            process.env.SMTP_USER &&
            process.env.SMTP_PASS
          );

    if (hasCredentials) {
      return {
        name: 'Email',
        status: 'operational',
        details: `${emailProvider} configured`,
      };
    }
    return {
      name: 'Email',
      status: 'degraded',
      details: 'Not fully configured',
    };
  } catch (error) {
    return {
      name: 'Email',
      status: 'down',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkIvalt(): Promise<ServiceStatus> {
  try {
    const apiKey = process.env.IVALT_API_KEY;
    if (apiKey) {
      return {
        name: 'iVALT API',
        status: 'operational',
        details: 'API key configured',
      };
    }
    return {
      name: 'iVALT API',
      status: 'degraded',
      details: 'API key not configured',
    };
  } catch (error) {
    return {
      name: 'iVALT API',
      status: 'down',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkRateLimiting(): Promise<ServiceStatus> {
  // Rate limiting is in-memory in demo mode, Redis in production
  const redisConfigured = !!process.env.UPSTASH_REDIS_REST_URL;
  return {
    name: 'Rate Limiting',
    status: redisConfigured ? 'operational' : 'degraded',
    details: redisConfigured ? 'Redis backed' : 'In-memory (not persistent)',
  };
}

export async function GET(request: Request) {
  // Validate health token
  const authHeader = request.headers.get('X-Health-Token');
  if (authHeader !== HEALTH_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  // Check all services in parallel
  const [dbStatus, emailStatus, ivaltStatus, rateLimitStatus] =
    await Promise.all([
      checkDatabase(),
      checkEmail(),
      checkIvalt(),
      checkRateLimiting(),
    ]);

  const services: ServiceStatus[] = [
    dbStatus,
    emailStatus,
    ivaltStatus,
    rateLimitStatus,
  ];
  const isHealthy = services.every(s => s.status === 'operational');

  const response = {
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.1.0',
    database: dbStatus.status,
    services,
    checks: {
      database: dbStatus.status,
      email: emailStatus.status,
      ivalt: ivaltStatus.status,
      rateLimiting: rateLimitStatus.status,
    },
    responseTime: Date.now() - startTime,
  };

  return NextResponse.json(response, { status: isHealthy ? 200 : 503 });
}
