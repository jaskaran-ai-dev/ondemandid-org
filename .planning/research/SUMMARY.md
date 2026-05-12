# Research Summary: iVALT OnDemand ID — Production Hardening

**Domain:** Identity Verification SaaS (Next.js 16)
**Researched:** 2026-05-12
**Overall confidence:** HIGH

## Executive Summary

The existing iVALT OnDemand ID codebase is a functional proof-of-concept with a complete landing page, signup flow, and verification flow. What's missing is the **production-hardening layer** — testing, CI/CD, error tracking, monitoring, rate limiting, security, and compliance infrastructure. This is normal for a PoC built to validate core UX; these layers are what take the project from "works locally" to "safe to deploy to production."

The standard production stack for a Next.js 16 SaaS in 2026 is clear: **Vitest + Playwright** for testing (Jest is legacy), **GitHub Actions + Vercel** for CI/CD (tightest integration), **Sentry** for error tracking (de facto standard for Next.js), **Upstash Redis** for rate limiting (serverless-native, works in Edge Runtime), and **Pino** for structured logging. Security headers are configured directly in `next.config.ts` — no extra dependency needed. Post-Vercel KV is deprecated — the ecosystem has standardized on **Neon + Upstash Redis** via the Vercel Marketplace.

This project is well-positioned for production hardening. The architecture choices (Next.js 16 App Router, Drizzle ORM with dual Postgres/SQLite, React Query, Zod validation) are all aligned with current best practices. The main work is additive — adding layers around the existing code rather than rewriting it.

## Key Findings

**Stack:** Vitest + Playwright for testing, GitHub Actions for CI, Vercel for CD, Sentry for error tracking, Upstash Redis for rate limiting, Pino for logging, `next.config.ts` headers for security, custom audit log table for compliance.

**Architecture:** All production-hardening layers are additive — they wrap existing route handlers, add CI pipeline stages around the build, and instrument the existing runtime. No architectural rewrite needed.

**Critical pitfall:** The biggest risk is the **Dual schema maintenance** (Postgres + SQLite). Testing, CI, audit logs, and any schema changes require updating both `schema.pg.ts` and `schema.sqlite.ts`. This is already documented as a constraint but will become more painful as the project adds tables (audit logs, rate limiting state store). Mitigate with a generated unified schema approach or dedicated CI check that verifies both schemas are in sync.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Phase 1: Testing Foundation** — Vitest setup + first unit tests for Zod schemas, utility functions, API route handlers. Playwright setup + signup flow E2E test.
   - Avoids: Deploying untested code that handles biometric identity data
   - Unlocks: CI pipeline (can't have CI without tests)

2. **Phase 2: CI/CD Pipeline** — GitHub Actions workflow (lint → type-check → test → build → Playwright E2E against preview). Configure Vercel auto-deploy from `main`.
   - Avoids: Broken builds reaching production
   - Addresses: HARD-03

3. **Phase 3: Error Tracking** — Sentry installation via wizard. Covers client, server, and edge runtimes. Configure source maps, sampling rates, session replay on error.
   - Avoids: Blind production — undetected errors in biometric verification flow
   - Addresses: HARD-01 (observability)

4. **Phase 4: Security Hardening** — HTTP security headers in `next.config.ts`. `Content-Security-Policy` with nonce generation in proxy layer. Rate limiting on all API routes via Upstash Redis.
   - Avoids: XSS, clickjacking, API abuse, cost overruns
   - Addresses: HARD-05

5. **Phase 5: Structured Logging** — Replace `console.log` with Pino. JSON output in production, pretty-print in dev.
   - Avoids: Inability to search/query production logs
   - Addresses: HARD-01 (logging)

6. **Phase 6: Compliance Infrastructure** — Audit log table, health check endpoint, uptime monitoring via Better Stack. Document SOC 2 readiness.
   - Addresses: HARD-05 (compliance documentation), HARD-06

7. **Phase 7: Admin Dashboard** — Customer management, audit log viewer, request history. Requires Phase 6 audit logs.
   - Addresses: HARD-07

**Phase ordering rationale:**
- Testing first because it unlocks CI, which unlocks confidence to add the other layers
- Error tracking before logging because Sentry provides immediate production visibility with minimal code changes
- Security before compliance because a security breach invalidates compliance
- Admin dashboard last because it depends on audit log infrastructure from Phase 6

**Research flags for phases:**
- Phase 5 (Pino + OpenTelemetry): The `pino-opentelemetry-transport` is still actively developed. If you don't need trace correlation yet, skip OpenTelemetry and just use Pino directly. Add OpenTelemetry later when you need distributed tracing across iVALT API → DB → email.
- Phase 6 (Audit logs): No off-the-shelf package for Next.js audit logging. Must be custom. The schema design needs care — audit logs must be append-only with no update/delete operations.
- Phase 4 (CSP with nonces): Requires dynamic rendering (Server Components or proxy layer) to generate per-request nonces. May conflict with any static generation strategy. Worth the tradeoff for biometric identity verification.
- Phase 6 (SOC 2): This is a process, not a tool purchase. Annual penetration testing, documented security policies, access reviews. Don't buy compliance automation tools (Drata, Vanta) until you're actively going through a SOC 2 audit.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Testing Stack | HIGH | Vitest + Playwright is the community standard per official Next.js docs, multiple 2026 sources |
| CI/CD | HIGH | GitHub Actions + Vercel is the de facto standard for Next.js projects on GitHub |
| Error Tracking | HIGH | Sentry is the market leader, has official Next.js 16 support wizard |
| Structured Logging | MEDIUM | Pino is the fastest logger, but OpenTelemetry integration is still maturing |
| Rate Limiting | HIGH | Upstash Ratelimit is purpose-built for serverless, Vercel docs recommend it |
| Security Headers | HIGH | No dependency needed — configured in `next.config.ts`. Next.js CSP docs are authoritative. |
| Compliance | MEDIUM | Audit log is custom (no off-the-shelf). SOC 2 prep depends on business context, not tech. |
| Uptime Monitoring | MEDIUM | Better Stack is solid but there are many alternatives. The health endpoint is the key artifact. |

## Gaps to Address

- **Dual schema maintenance** becomes more painful with audit log tables. Research a unified schema generator or CI check that validates both schemas produce equivalent DDL.
- **Playwright needs a deployment target.** Running against `next dev` is unreliable. The standard pattern is to run E2E against Vercel preview deployments. Requires GH Actions + Vercel preview URL plumbing.
- **No iVALT API testing strategy.** The iVALT API is external and may have rate limits or cost per call. Consider contract testing or recording/replaying API responses in Playwright tests.
- **Demo mode testing.** If running Playwright tests in CI with `DEMO_MODE=true`, ensure the simulated responses match real API shapes. This could mask integration bugs.
- **Long-term DB choice.** The dual Postgres/SQLite approach works for dev but will need a decision at scale. SQLite won't handle concurrent production traffic. The strategy should be "SQLite for dev, Postgres for prod" — and at some point the SQLite schema becomes a maintenance burden.
