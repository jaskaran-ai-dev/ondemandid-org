# Technology Stack — Production Hardening

**Project:** iVALT OnDemand ID
**Researched:** 2026-05-12
**Mode:** Ecosystem — Production-hardening layers for Next.js 16 SaaS handling biometric identity verification

## Context

This document covers **what's MISSING** from the existing PoC codebase. The following are already present and locked per constraints:

| Layer            | Status     | Decision                           |
| ---------------- | ---------- | ---------------------------------- |
| Framework        | ✅ Locked  | Next.js 16 App Router              |
| Language         | ✅ Locked  | TypeScript 6                       |
| Styling          | ✅ Locked  | Tailwind CSS 4 + tw-animate-css    |
| UI Components    | ✅ Locked  | Radix UI primitives                |
| State Management | ✅ Locked  | TanStack React Query               |
| Forms            | ✅ Locked  | React Hook Form + Zod              |
| Database ORM     | ✅ Locked  | Drizzle ORM (dual Postgres/SQLite) |
| Database Hosting | ✅ Locked  | Neon (Postgres production)         |
| Database Dev     | ✅ Locked  | SQLite via better-sqlite3          |
| Email            | ✅ Locked  | AWS SES + Nodemailer fallback      |
| Analytics        | ✅ Present | @vercel/analytics                  |
| Icons            | ✅ Locked  | Lucide + HugeIcons                 |

## Recommended Additions (Production Hardening)

### 1. Testing Framework

| Technology                      | Version | Purpose                                | Why                                                                                                                                                            | Confidence |
| ------------------------------- | ------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **Vitest**                      | ^3.x    | Unit & integration tests (non-browser) | Community standard for Next.js. 3-5x faster cold starts than Jest. Native ESM support, same API as Jest. Official Next.js testing guide uses Vitest, not Jest. | HIGH       |
| **@testing-library/react**      | ^16.x   | React component rendering tests        | Standard companion to Vitest for React component testing. Tests behavior, not implementation.                                                                  | HIGH       |
| **@testing-library/jest-dom**   | ^6.x    | DOM matchers for Vitest                | Adds `toBeInTheDocument()`, `toHaveClass()` etc. Essential for readable assertions.                                                                            | HIGH       |
| **@testing-library/user-event** | ^14.x   | Simulated user interactions            | `userEvent.setup()` models real browser interactions better than `fireEvent`.                                                                                  | HIGH       |
| **Playwright**                  | ^1.52+  | End-to-end testing                     | Only reliable way to test async Server Components (Vitest can't render them). Tests against real browser. Run against Vercel preview deployments in CI.        | HIGH       |
| **@vitejs/plugin-react**        | ^4.x    | React transform for Vitest             | Required for JSX transform in Vitest tests.                                                                                                                    | HIGH       |
| **jsdom**                       | ^26.x   | DOM environment for Vitest             | Lightweight browser environment for unit tests.                                                                                                                | HIGH       |
| **vite-tsconfig-paths**         | ^5.x    | Path alias resolution for Vitest       | Makes `@/` imports work in tests without duplication.                                                                                                          | HIGH       |

**NOT using:** Jest (legacy — slower, more config, ESM issues); Cypress (Playwright is simpler, faster, better DX for Next.js E2E); Testing Library alone (needs a runner — Vitest is that runner)

**Installation:**

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom vite-tsconfig-paths
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D @playwright/test
pnpm add -D @types/node
```

**Testing strategy:**

- **Vitest** → utility functions, Zod schemas, React hooks, client components, synchronous server components
- **Playwright** → async Server Components, auth flows, signup flow, verification flow, form submissions against real endpoints
- **Key constraint:** Vitest cannot render async Server Components (documented limitation in official Next.js guide). Don't fight it — push those tests to Playwright.

---

### 2. CI/CD Pipeline

| Technology         | Version | Purpose      | Why                                                                                                            | Confidence |
| ------------------ | ------- | ------------ | -------------------------------------------------------------------------------------------------------------- | ---------- |
| **GitHub Actions** | N/A     | CI pipeline  | Zero-config for GitHub-hosted repos. Run lint, typecheck, Vitest, build on every PR.                           | HIGH       |
| **Vercel**         | N/A     | CD + hosting | Built by Next.js team. Zero-config Next.js deployment. Auto-scaling. Preview deployments per PR. Edge network. | HIGH       |

**Pipeline structure:**

```
PR opened → GitHub Actions:
  1. pnpm install
  2. pnpm lint (ESLint)
  3. pnpm type-check (tsc --noEmit)
  4. pnpm test (Vitest)
  5. pnpm build (vercel build)
  →
  Vercel preview deployment (auto)
  →
  Playwright E2E tests against preview URL
  →
  Merge allowed only if all gates pass
```

**NOT using:** Jenkins (overkill), CircleCI (Vercel + GH Actions covers everything), Self-hosted runners (not needed for this scale)

**GitHub Secrets needed:**

- `VERCEL_TOKEN` — Vercel API token
- `VERCEL_ORG_ID` — from `.vercel/project.json`
- `VERCEL_PROJECT_ID` — from `.vercel/project.json`
- `SENTRY_AUTH_TOKEN` — if using Sentry source maps

**Recommended scripts to add to `package.json`:**

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

### 3. Error Tracking & Performance Monitoring

| Technology                 | Version | Purpose                                 | Why                                                                                                                                                                                                               | Confidence |
| -------------------------- | ------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **@sentry/nextjs**         | ^9.x    | Error tracking + performance monitoring | Industry standard for Next.js production error monitoring. Covers client, server, AND edge runtimes. Native Next.js 16 instrumentation via `instrumentation-client.ts`. Session replay, source maps, breadcrumbs. | HIGH       |
| **@vercel/speed-insights** | ^1.x    | Core Web Vitals (RUM)                   | Real user monitoring for LCP, CLS, INP. Already have `@vercel/analytics` — add speed insights.                                                                                                                    | HIGH       |

**Why Sentry over alternatives:**

- **vs Datadog/New Relic:** Overkill for this stage. Sentry covers errors + performance + session replay at $0-$26/month.
- **vs Highlight.io:** Sentry has deeper Next.js integration and larger community. Highlight is strong for session replay but weaker for APM.
- **vs Rollbar:** Sentry has better Next.js App Router support, tracing, and session replay.

**Setup:**

```bash
pnpm add @sentry/nextjs
pnpx @sentry/wizard@latest -i nextjs
```

The wizard automatically creates:

- `sentry.client.config.ts` (or `instrumentation-client.ts`) — browser error tracking
- `sentry.server.config.ts` — Node.js server error tracking
- `sentry.edge.config.ts` — Edge runtime error tracking
- Wraps `next.config.mjs` with `withSentryConfig`
- Adds `SENTRY_AUTH_TOKEN` for source map upload

**Configuration essentials:**

- `tracesSampleRate: 0.1` in production (sample 10% of transactions)
- `replaysSessionSampleRate: 0.1` (session replay for 10% of sessions)
- `replaysOnErrorSampleRate: 1.0` (always capture replay on error)
- Ignore noise: `ResizeObserver loop limit exceeded`, `Non-Error exception captured`

---

### 4. Structured Logging & Observability

| Technology                       | Version | Purpose                     | Why                                                                                                                            | Confidence |
| -------------------------------- | ------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| **pino**                         | ^9.x    | Structured JSON logging     | Fastest Node.js logger. JSON output is machine-parseable. Works in serverless. Default logger for Fastify.                     | HIGH       |
| **pino-opentelemetry-transport** | ^3.x    | Logs → OpenTelemetry export | Ships logs via OTLP to any OpenTelemetry-compatible backend. Correlates logs with traces via trace_id/span_id.                 | MEDIUM     |
| **pino-pretty**                  | ^13.x   | Human-readable log output   | Dev-mode prettifier. Install as dev dependency only.                                                                           | HIGH       |
| **pino-http**                    | ^10.x   | HTTP request logging        | Auto-logs all HTTP requests with method, URL, status, duration. Drop-in for route handlers.                                    | MEDIUM     |
| **OpenTelemetry JS**             | ^0.200+ | Distributed tracing         | Traces across Next.js server components, API routes, iVALT API calls, database queries. Future-proof observability foundation. | MEDIUM     |

**Strategy for a SaaS at this stage:**

1. **Phase 1 (immediate):** Replace all `console.log` statements with `pino`. Structured JSON output in production, pretty-print in dev.
2. **Phase 2:** Add Sentry error tracking (covers the most critical observability gap with zero extra infrastructure).
3. **Phase 3 (scale):** Add OpenTelemetry instrumentation when you need trace correlation across iVALT API calls → DB queries → email sends.

**NOT using:** Winston (heavier, slower than Pino); Morgan (less flexible, no JSON output by default); Datadog/New Relic (premature)

**Installation:**

```bash
pnpm add pino pino-http
pnpm add -D pino-pretty
# Phase 3 additions:
pnpm add pino-opentelemetry-transport @opentelemetry/sdk-node @opentelemetry/instrumentation-pino
```

---

### 5. Rate Limiting & Abuse Prevention

| Technology             | Version | Purpose                         | Why                                                                                                                                                   | Confidence |
| ---------------------- | ------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **@upstash/ratelimit** | ^2.x    | Serverless-native rate limiting | HTTP-based Redis access works in Edge Runtime and serverless. Sliding window, token bucket algorithms. No cold start issues. Sub-millisecond latency. | HIGH       |
| **@upstash/redis**     | ^1.x    | Redis client for rate limiting  | Vercel KV is deprecated — Upstash Redis is the migration path. Free tier available. No TCP required (HTTP-based).                                     | HIGH       |

**Alternative considered — Arcjet:**
Arcjet bundles rate limiting + bot detection + email validation + PII redaction in one SDK. Good for teams wanting a single security vendor. However, Upstash is more focused, more battle-tested, and cheaper for rate limiting alone. Re-evaluate Arcjet when you need bot protection.

**Rate limiting strategy:**

```
/api/signup:
  - 5 requests/IP per hour (prevent signup spam)
  - Identifier: request.ip
  - Algorithm: slidingWindow(5, "1 h")

/api/verify:
  - 20 requests/IP per hour (prevent verification abuse)
  - 10 requests/mobile per hour (per phone number)
  - Identifier: request.ip + body.mobile
  - Algorithm: slidingWindow(10, "1 h")

/api/status/[id]:
  - 60 requests/IP per minute (polls — generous since polling is expected)
  - Identifier: request.ip
  - Algorithm: slidingWindow(60, "1 m")

Landing page:
  - 100 requests/IP per minute (generous — public pages)
```

**Implementation pattern:**

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const signupLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  analytics: true,
  prefix: 'ratelimit:signup',
});

export const verifyLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  analytics: true,
  prefix: 'ratelimit:verify',
});
```

**Installation:**

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

**NOT using:** express-rate-limit (requires Node.js `http` module — won't work in Edge Runtime or serverless); Vercel KV (deprecated); In-memory Map (doesn't scale across serverless instances)

---

### 6. Security Hardening

| Technology                | Version | Purpose                       | Why                                                                                                      | Confidence |
| ------------------------- | ------- | ----------------------------- | -------------------------------------------------------------------------------------------------------- | ---------- |
| **HTTP Security Headers** | N/A     | CSP, HSTS, XFO, etc.          | Configured via `next.config.ts` `async headers()`. Zero runtime cost. Blocks full attack categories.     | HIGH       |
| **Arcjet** (optional)     | ^1.x    | Bot detection + PII redaction | If you need more than rate limiting. Detects automated clients, scrapers, crawlers. Redacts PII in logs. | MEDIUM     |

**Security headers to configure in `next.config.ts`:**

```typescript
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "Content-Security-Policy", value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "font-src 'self'",
            "connect-src 'self' https://*.sentry.io",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
        },
      ],
    },
  ]
}
```

**Security checklist for this project:**

1. ✅ Zod validation on all API inputs (already done)
2. ✅ httpOnly cookies for any future sessions (use `next/headers` cookies API)
3. ⬜ Security headers in `next.config.ts`
4. ⬜ Rate limiting on ALL API routes
5. ⬜ CSP with nonce support for inline scripts
6. ⬜ Dependency audit (`pnpm audit`) in CI
7. ⬜ Keep Next.js updated (16.2.6+ has 13 security patches including RCE CVE-2025-66478)
8. ⬜ Review client/server boundaries — no server-only env vars exposed to client bundle
9. ⬜ Sanitize iVALT API responses before sending to client (never leak auth tokens)

**NOT using:** `helmet` (NPM package — adds unnecessary abstraction when Next.js `headers()` config covers everything directly); `cors` (Next.js route handlers handle CORS natively)

---

### 7. Compliance & Audit Infrastructure

| Technology            | Version | Purpose               | Why                                                                                                                                                        | Confidence |
| --------------------- | ------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **Custom Audit Log**  | N/A     | Immutable audit trail | Required for SOC 2 readiness. Log every signup, verification request, status change, and admin action. Store in separate `audit_logs` table (append-only). | HIGH       |
| **SOC 2 Preparation** | N/A     | Compliance framework  | Not a tool — a process. Requires: pen testing (annual), vulnerability management, access controls, incident response plan, change management.              | MEDIUM     |

**Audit log schema (add to both `schema.pg.ts` and `schema.sqlite.ts`):**

```typescript
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  // 'signup.completed', 'verification.requested', 'verification.authenticated',
  // 'verification.failed', 'admin.login', 'customer.viewed'
  actorId: integer('actor_id'), // customer ID or admin user ID
  actorType: varchar('actor_type', { length: 20 }).notNull(),
  // 'customer', 'admin', 'system'
  resourceType: varchar('resource_type', { length: 50 }).notNull(),
  // 'customer', 'ondemand_request'
  resourceId: integer('resource_id'),
  description: text('description'),
  metadata: jsonb('metadata').default({}), // request details, IP, user agent
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Immutable log policy:**

- No UPDATE or DELETE operations on `audit_logs` table (enforce at application level via Drizzle — never expose an update endpoint)
- Use database-level triggers or RLS for extra protection in Postgres
- Ship audit logs to a separate log stream (Sentry + Pino) for redundancy

**Compliance roadmap:**

1. ✅ Already using AWS SES (SES logs are auditable via CloudTrail)
2. ⬜ Add audit log table + record all verification events
3. ⬜ Export path for audit logs (admin dashboard or CSV export)
4. ⬜ Implement data retention policy (auto-delete logs > N months if needed)
5. ⬜ Document: encryption at rest (Neon provides), encryption in transit (TLS), access controls
6. ⬜ Annual penetration testing (start with automated tools like Burp Suite or OWASP ZAP)

**NOT using:** Dedicated "compliance SaaS" tools (Axiom, Drata) — too premature. Build the audit trail now; the compliance automation comes later.

---

### 8. Uptime Monitoring

| Technology          | Version | Purpose                       | Why                                                                                                           | Confidence |
| ------------------- | ------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------- |
| **Better Stack**    | N/A     | External uptime monitoring    | Combines uptime checks, log management, and incident response. Generous free tier (10 monitors). Quick setup. | HIGH       |
| **OR: Uptime Kuma** | N/A     | Self-hosted uptime monitoring | Open-source alternative. Free forever. Runs anywhere (Railway, Fly.io, a $5 VPS). More control.               | MEDIUM     |

**Recommendation:** Start with Better Stack free tier (10 monitors at 3-minute intervals, free forever). It's a 10-minute setup. Add a `/api/health` endpoint that returns `{ status: "ok" }` and monitor it.

**Health check endpoint to add:**

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    await db.execute('SELECT 1');
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Database connection failed' },
      { status: 503 }
    );
  }
}
```

---

### 9. Scripts & Configuration Additions

**Additional `package.json` scripts:**

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "audit": "pnpm audit",
    "sentry:sourcemaps": "sentry-cli sourcemaps inject --org $SENTRY_ORG --project $SENTRY_PROJECT ./ && sentry-cli sourcemaps upload --org $SENTRY_ORG --project $SENTRY_PROJECT ./"
  }
}
```

## Alternatives Considered

| Category           | Recommended       | Alternative                | Why Not                                                                           |
| ------------------ | ----------------- | -------------------------- | --------------------------------------------------------------------------------- |
| Testing runner     | Vitest            | Jest (next/jest)           | Jest is slower, has ESM issues, Vitest is official Next.js recommendation in 2026 |
| E2E testing        | Playwright        | Cypress                    | Playwright: simpler config, cross-browser, better CI DX, faster                   |
| Error tracking     | Sentry            | Highlight.io, Datadog      | Sentry: best Next.js App Router support, larger community, predictable pricing    |
| Logging            | Pino              | Winston, Morgan            | Pino: 2-5x faster, JSON-native, OpenTelemetry transport available                 |
| Rate limiting      | Upstash Ratelimit | Arcjet, express-rate-limit | Upstash: serverless-native, works in Edge + Node runtimes, free tier              |
| Security (bundled) | Upstash + headers | Arcjet                     | Arcjet is newer, fewer community patterns. Re-evaluate later.                     |
| Uptime monitoring  | Better Stack      | Uptime Kuma, Pingdom       | Better Stack: easiest setup, bundled logs + incidents, generous free tier         |
| CI/CD              | GitHub Actions    | CircleCI, Jenkins          | Already on GitHub. Zero additional cost. Tight Vercel integration.                |

## Environment Variables to Add

Add these to `.env.example` and configure in Vercel:

```bash
# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ORG=iVALT
SENTRY_PROJECT=ondemand-id
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Better Stack (Uptime Monitoring)
BETTER_STACK_SOURCE_TOKEN=xxxxx

# Vercel (CI/CD)
VERCEL_TOKEN=xxxxx
VERCEL_ORG_ID=xxxxx
VERCEL_PROJECT_ID=xxxxx
```

## Implementation Order (for Roadmap)

This is the recommended order of implementation, balancing dependency chains and risk:

| Phase  | What                      | Depends On                       | Risk if Deferred                    |
| ------ | ------------------------- | -------------------------------- | ----------------------------------- |
| **1**  | Vitest + first test suite | Nothing                          | You ship without any test coverage  |
| **2**  | Playwright + E2E tests    | Nothing (separate from Vitest)   | Async Server Components untestable  |
| **3**  | GitHub Actions CI         | Vitest + Playwright setup        | Manual testing only                 |
| **4**  | Sentry error tracking     | Nothing (adds to existing code)  | Production errors invisible         |
| **5**  | Security headers          | Nothing (config-only change)     | XSS/clickjacking vulnerabilities    |
| **6**  | Upstash rate limiting     | Nothing (adds to route handlers) | API abuse, cost overruns            |
| **7**  | Pino structured logging   | Nothing (replaces console.log)   | Debugging production issues harder  |
| **8**  | Audit log table           | Database schema access           | Non-compliant, can't trace issues   |
| **9**  | Better Stack uptime       | Health endpoint                  | No external availability visibility |
| **10** | OpenTelemetry             | Pino setup                       | Only needed at scale                |

## Sources

- [Next.js Official Testing Guide](https://nextjs.org/docs/app/guides/testing) — HIGH confidence
- [Sentry Next.js SDK Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/) — HIGH confidence
- [Upstash Ratelimit Docs](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) — HIGH confidence
- [Pino + OpenTelemetry Transport](https://github.com/pinojs/pino-opentelemetry-transport) — MEDIUM confidence (active development)
- [Next.js Content Security Policy Guide](https://nextjs.org/docs/pages/guides/content-security-policy) — HIGH confidence
- [Vercel Storage (KV deprecated → Upstash migration)](https://github.com/vercel/storage) — HIGH confidence
- [Better Stack Uptime Monitoring](https://betterstack.com/) — MEDIUM confidence (service terms may change)
- [Production-grade CI/CD with Next.js/Vercel](https://coffey.codes/articles/production-grade-ci-cd-with-nextjs-vercel-and-github-actions) — MEDIUM confidence (single source)
- [Vitest Next.js Testing Guide 2026](https://medium.com/@securestartkit/next-js-testing-in-2026-vitest-playwright-0caf6dd1f829) — MEDIUM confidence (community article, verified against official docs)
- [Arcjet Next.js SDK](https://docs.arcjet.com/reference/nextjs) — LOW confidence for inclusion (compelling product, newer ecosystem)
