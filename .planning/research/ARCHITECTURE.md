# Architecture Patterns — Production Hardening

**Domain:** Identity Verification SaaS (Next.js 16)
**Researched:** 2026-05-12

## Overview

The production-hardening layers are **additive** — they wrap around the existing architecture without requiring structural changes. Each layer occupies a specific boundary in the request lifecycle.

```
Browser Request
    │
    ▼
┌─────────────────────────────────────────────┐
│  Vercel Edge Network                         │
│  • CDN caching                               │
│  • Edge Config (feature flags)               │
│  • DDoS protection (Vercel WAF)             │
└─────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│  proxy.ts (was middleware.ts)               │
│  • Security headers (CSP nonce generation)   │  ← NEW
│  • Redirect rules                            │
│  • Bot detection (optional: Arcjet)         │  ← OPTIONAL
└─────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│  Next.js App Router                          │
│  • Server Components (default)               │
│  • Client Components (interactive parts)    │
└─────────────────────────────────────────────┘
    │
    ├──▶ Static Pages (landing, docs)
    │
    └──▶ Dynamic Routes
         │
         ├──▶ Server Components (async data fetch)
         │
         └──▶ API Route Handlers
              │
              ▼
         ┌─────────────────────────────────┐
         │  Rate Limiting Layer            │  ← NEW
         │  • @upstash/ratelimit           │
         │  • Per-endpoint limits          │
         │  • Per-IP + per-user            │
         └─────────────────────────────────┘
              │
              ▼
         ┌─────────────────────────────────┐
         │  Validation Layer               │
         │  • Zod schemas (already done)    │
         │  • Input sanitization            │
         └─────────────────────────────────┘
              │
              ▼
         ┌─────────────────────────────────┐
         │  Business Logic                  │
         │  • iVALT API integration         │
         │  • Database operations           │
         │  • Email sending                 │
         └─────────────────────────────────┘
              │
              ▼
         ┌─────────────────────────────────┐
         │  Audit Logging                  │  ← NEW
         │  • Append-only audit_logs table │
         │  • Every verification event     │
         └─────────────────────────────────┘
              │
              ▼
         ┌─────────────────────────────────┐
         │  Structured Logging             │  ← NEW
         │  • Pino (JSON output)           │
         │  • Sentry (error context)       │
         │  • Opentelemetry (traces)       │  ← PHASE 2
         └─────────────────────────────────┘
```

## Component Boundaries — Production Additions

| Component            | Responsibility                                               | Communicates With                    | New/Existing |
| -------------------- | ------------------------------------------------------------ | ------------------------------------ | ------------ |
| **Sentry (client)**  | Capture browser errors, session replays, performance metrics | Sentry SaaS via DSN                  | NEW          |
| **Sentry (server)**  | Capture server/edge errors, source maps, API performance     | Sentry SaaS via DSN                  | NEW          |
| **Rate Limiter**     | Enforce request quotas per IP/user per endpoint              | Upstash Redis (HTTP API)             | NEW          |
| **Security Headers** | Set CSP, HSTS, XFO in HTTP response headers                  | Browser via response                 | NEW (config) |
| **Pino Logger**      | Structured JSON logging from all server-side code            | stdout (collector) or OTel transport | NEW          |
| **Audit Logger**     | Immutable record of all verification events                  | `audit_logs` DB table                | NEW          |
| **Health Check**     | Expose app + DB liveness                                     | Monitoring service (Better Stack)    | NEW          |
| **CI Pipeline**      | Lint, type-check, test, build, deploy                        | GitHub Actions → Vercel              | NEW          |
| **Better Stack**     | External uptime monitoring, status page                      | `/api/health` endpoint               | NEW          |

## Data Flow — Verification Request (Hardened)

```
1. User submits verification form (mobile number)
2. proxy.ts applies security headers to response
3. API Route Handler (/api/verify) receives POST
4. Rate Limiter checks: "Has this IP made 20+ requests in the last hour?"
   │
   ├── DENIED → Return 429 Too Many Requests. Log to Pino. Send to Sentry.
   │
   └── ALLOWED → Continue
5. Zod schema validates request body
6. Business logic:
   a. Store request in `ondemand_requests` table (status: pending)
   b. Call iVALT API to trigger push notification
   c. Log to audit_logs: event='verification.requested', metadata={mobile, requestId}
   d. Return { requestId } to client
7. Pino logs: "Verification requested" with trace context
8. Client polls GET /api/status/:id (also rate limited: 60/min/IP)
9. On status change → authenticated/failed:
   a. Update `ondemand_requests` table
   b. Log to audit_logs: event='verification.completed', status={authenticated|failed}
   c. Sentry transaction completes with status and duration
```

## Rate Limiting Architecture

Separate rate limiters per route, not a single global limiter:

```typescript
// Pattern for each API route
// app/api/verify/route.ts
import { verifyLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const { success, limit, reset, remaining } = await verifyLimiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // ... continue with handler logic
}
```

## Logging Architecture

```
                    ┌──────────────┐
                    │  Application │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Pino    │ │  Sentry │ │  Stdout  │
        │  (JSON)  │ │(Errors) │ │(Fallback)│
        └────┬─────┘ └──────────┘ └──────────┘
             │
             ▼
     ┌───────────────┐
     │ OTel Collector│  ← Phase 2
     │ (optional)    │
     └───────┬───────┘
             │
             ▼
     ┌───────────────┐
     │  Log Backend  │
     │ (Better Stack │
     │  / Datadog /  │
     │   SigNoz)     │
     └───────────────┘
```

**Log levels:**

```typescript
logger.info({ event: 'verification.requested', requestId, mobile }); // normal operations
logger.warn({ event: 'rate_limit.hit', ip, endpoint }); // potential abuse
logger.error({ err, event: 'ivalt_api.failed', requestId }); // service errors
```

## CI/CD Architecture

```
PR opened
    │
    ▼
GitHub Actions: ci.yml
    │
    ├── lint (ESLint) ──────────────► Fail if issues
    ├── type-check (tsc --noEmit) ──► Fail if TS errors
    ├── test (vitest run) ──────────► Fail if tests fail
    ├── build (next build) ─────────► Fail if build fails
    │
    ▼ (all green)
Vercel preview deployment (auto)
    │
    ▼
Playwright E2E tests against preview URL (separate job)
    │
    ├── signup flow ────────────────► Fail if UX broken
    ├── verification flow ──────────► Fail if verification broken
    ├── status polling ─────────────► Fail if status updates broken
    │
    ▼ (all green)
✅ Merge allowed
```

## Compliance Data Model

Append-only audit log table — the foundation for SOC 2 and GDPR:

```typescript
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  // Examples:
  //   'customer.signup.completed'
  //   'customer.signup.failed'
  //   'verification.requested'
  //   'verification.authenticated'
  //   'verification.failed'
  //   'verification.not_found'
  actorId: integer('actor_id'),
  actorType: varchar('actor_type', { length: 20 }).notNull(),
  //   'customer' — the end user
  //   'admin'    — platform admin
  //   'system'   — automated process
  resourceType: varchar('resource_type', { length: 50 }).notNull(),
  //   'customer'
  //   'ondemand_request'
  resourceId: integer('resource_id'),
  description: text('description'),
  metadata: jsonb('metadata').default({}),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Key constraint:** Never expose UPDATE or DELETE operations on this table in the application layer. The only operation is INSERT (via Drizzle's `db.insert()`). This ensures immutability.

## Scalability Considerations

| Concern               | At 100 users                               | At 10K users                       | At 1M users                        |
| --------------------- | ------------------------------------------ | ---------------------------------- | ---------------------------------- |
| **Rate Limiting**     | Upstash Redis free tier (10K requests/day) | Upstash Pro (~$10/mo)              | Dedicated multi-region Upstash     |
| **Error Tracking**    | Sentry free (5K events/mo)                 | Sentry Team ($26/mo)               | Sentry Business (custom pricing)   |
| **Logging**           | Pino → stdout → Vercel logs                | Pino → Better Stack (10GB/mo free) | Pino → OTel Collector → Datadog    |
| **Audit Logs**        | Stored in main DB (Postgres)               | Separate audit DB or archival      | Dedicated log service (e.g. Axiom) |
| **CI/CD**             | GH Actions free (2000 min/mo)              | GH Actions paid                    | Self-hosted runners                |
| **Uptime Monitoring** | Better Stack free (10 monitors)            | Better Stack Pro ($29/mo)          | Better Stack Enterprise            |

## Sources

- Upstash Ratelimit architecture: HTTP-based Redis for serverless
- Sentry Next.js multi-environment config (client/server/edge)
- Vercel platform architecture (edge network, serverless functions, fluid compute)
- Next.js 16 proxy.ts pattern (replaces middleware.ts for CSP nonces)
- Pino + OpenTelemetry transport architecture
