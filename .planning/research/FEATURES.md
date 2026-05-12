# Feature Landscape — Production Hardening

**Domain:** Identity Verification SaaS (Next.js 16)
**Researched:** 2026-05-12

## Context

This document covers production-hardening features that are MISSING from the existing PoC. Core product features (signup, verification, polling, email) are already implemented.

## Table Stakes

Missing these = product shouldn't be in production. These are the "no-brainer" additions.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **HTTP Security Headers** | Every production web app must set CSP, HSTS, XFO, etc. Without them, the app is vulnerable to XSS, clickjacking, MIME sniffing. | Low | Configure in `next.config.ts` `async headers()`. 30-minute task. |
| **API Rate Limiting** | Without it, one runaway client can exhaust API budget (iVALT API costs, serverless function execution). Required for any public API. | Medium | Upstash Redis handles this serverless-natively. Need per-IP limiting on signup (5/hr), verify (20/hr), status (60/min). |
| **Error Tracking** | Can't run a production SaaS without knowing when errors occur. console.log in serverless functions is invisible. | Low | Sentry wizard is a 5-minute setup. Covers client + server + edge. |
| **Health Check Endpoint** | Required for uptime monitoring, load balancers, and incident response. Proves the app + DB are alive. | Low | Add `GET /api/health` that returns `{ status: "ok" }` after a DB ping. |
| **Uptime Monitoring** | Must know when the site is down. External monitoring from multiple geographic regions. | Low | Better Stack free tier (10 monitors) covers this. |
| **CI Pipeline** | Any code change to a SaaS handling identity data must be tested before reaching production. | Medium | GitHub Actions: lint → type-check → test → build. |
| **Type Checking in CI** | TypeScript errors caught by local dev don't protect against `// @ts-ignore` or `as any` creeping in. | Low | Add `tsc --noEmit` to CI. Already have TypeScript configured. |
| **Audit Trail** | Required for SOC 2, GDPR data subject access requests, and incident investigation. Each verification attempt must be logged immutably. | Medium | Custom `audit_logs` table. Append-only. Log every signup + verification event. |

## Differentiators

Not strictly required, but valuable for quality-of-life and production confidence.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Session Replay** | See exactly what the user experienced before an error. Invaluable for debugging verification flow issues. | Low | Included in Sentry. Enable `replaysOnErrorSampleRate: 1.0`. |
| **Structured Logging** | JSON logs with consistent fields are searchable via log aggregation tools. Console.log strings are not. | Medium | Pino. Replace console.log across the codebase (~2hr work). |
| **Distributed Tracing** | Trace a single verification request from browser → Next.js API → iVALT API → DB → email. Pinpoint which step is slow. | High | OpenTelemetry + Pino instrumentation. Phase 3 addition. |
| **Security Headers Score (A+)** | An `A+` on securityheaders.com builds trust with enterprise customers evaluating the platform. | Low | Already covered in table stakes. CSP nonce support is the extra step for A+. |
| **Preview Deployments** | Every PR gets its own URL. Stakeholders can review verification flow changes before merge. | Low | Built into Vercel. Zero-config. |
| **Automated Dependency Updates** | Dependabot/Renovate keeps dependencies patched. Critical for security (see Next.js 16.2.6 security release with 13 CVEs). | Low | Enable Dependabot in GitHub repo settings. |
| **Performance Monitoring** | Track slow API routes, slow database queries, long-running verification polls. | Medium | Sentry performance monitoring with `tracesSampleRate: 0.1`. |

## Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Jest** | Legacy ecosystem. Slower cold starts. ESM issues with Next.js 16. | Use Vitest — same API, 3x faster, actively maintained by Vite team. |
| **Winston** | Heavier than Pino, slower, no native OpenTelemetry transport. | Use Pino — fastest Node.js logger, JSON-native, OTel integration available. |
| **Helmet.js** | Extra dependency for what Next.js `headers()` does natively. | Configure security headers directly in `next.config.ts`. |
| **Vercel KV** | Deprecated. Migrated to Upstash Redis via Marketplace. | Use `@upstash/redis` directly. |
| **Vercel Postgres** | Deprecated. Migrated to Neon via Marketplace. | Continue using Neon directly (already in project config). |
| **express-rate-limit** | Requires Node.js `net` module. Won't work in Edge Runtime. Not designed for serverless. | Use `@upstash/ratelimit` — HTTP-based, works in Edge + Node. |
| **SST / Ion** | Alternative deployment framework. Adds complexity. The Vercel integration for Next.js 16 is the most mature. | Stay on Vercel. SST is compelling for multi-cloud but overkill here. |
| **Buying SOC 2 compliance software** | Drata, Vanta, and similar are premature at this stage. They automate evidence collection but don't build security. | Build audit logs, document policies, run pen tests. Buy compliance tools when actively pursuing audit. |

## Feature Dependencies

```
Audit Log Table (Phase 6)
  └── Schema change (both pg + sqlite)
  └── Admin Dashboard (Phase 7) ← depends on audit logs existing

CI Pipeline (Phase 2)
  └── Tests (Phase 1) ← CI without tests is useless
  └── Playwright E2E against preview deployment
       └── Vercel preview URL retrieval in GH Actions

Structured Logging (Phase 5)
  └── Pino setup
  └── OpenTelemetry (Phase 5b) ← depends on Pino being in place

Rate Limiting (Phase 4)
  └── Upstash Redis setup
  └── Middleware pattern for each route handler

Security Headers (Phase 4)
  └── Independent (config-only change)
  └── CSP nonces ← depends on rendering strategy choice
```

## MVP Recommendation (Minimum Production Viable)

The "ship with confidence" bar for a biometric identity verification SaaS:

**Must have before public launch:**
1. HTTP security headers (`next.config.ts`)
2. Sentry error tracking (client + server)
3. Rate limiting on `/api/signup`, `/api/verify`, `/api/status/:id`
4. Health check endpoint
5. CI pipeline (lint → type-check → test → build)
6. Test suite covering the verification flow (critical path)

**Nice to have before public launch:**
7. Uptime monitoring (Better Stack)
8. Audit log table (minimal schema — can be enhanced later)

**Safe to defer:**
9. OpenTelemetry distributed tracing
10. Session replay (Sentry enables it by default — just configure)
11. Admin dashboard
12. SOC 2 formal process

## Sources

- Next.js 16.2.6 security release notes (13 CVEs, May 7 2026)
- Sentry Next.js SDK documentation
- Upstash Ratelimit GitHub + docs
- Vercel Storage deprecation announcements
- Next.js Content Security Policy guide
- Multiple production Next.js deployment guides (2026)
