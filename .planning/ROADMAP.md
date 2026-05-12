# Roadmap: iVALT OnDemand ID — Production Hardening

## Overview

Production-harden the existing iVALT OnDemand ID proof-of-concept and deliver an operator-facing admin dashboard. Starting with a testing foundation and CI/CD pipeline to establish code quality gates, then layering on error tracking, security hardening, structured logging, and compliance infrastructure. The final phases deliver an admin dashboard for customer management and a versioned enterprise API. Each phase is additive — wrapping existing code rather than rewriting it — and follows the research-validated stack (Vitest, Playwright, GitHub Actions, Sentry, Upstash Redis, Pino).

## Phases

- [ ] **Phase 1: Testing Foundation** — Vitest + Playwright test suite covering unit, integration, and E2E flows
- [ ] **Phase 2: CI/CD Pipeline** — GitHub Actions + Vercel automated build, test, and deploy pipeline
- [ ] **Phase 3: Error Tracking** — Sentry integration for client, server, and edge runtime error monitoring
- [ ] **Phase 4: Security Hardening** — HTTP security headers, Upstash Redis rate limiting, persistent state storage
- [ ] **Phase 5: Structured Logging** — Pino-based structured logging with correlation IDs and JSON output
- [ ] **Phase 6: Compliance Infrastructure** — Append-only audit logs, health endpoint, uptime monitoring, SOC 2 readiness docs
- [ ] **Phase 7: Admin Dashboard** — Operator-facing admin UI with JWT auth, customer management, audit log viewer, usage metrics
- [ ] **Phase 8: Enterprise API** — Versioned REST API at /api/v1/ with API key authentication

## Phase Details

### Phase 1: Testing Foundation
**Goal**: Automated tests validate correctness of all existing code paths — Zod schemas, utility functions, API route handlers, and critical E2E flows
**Depends on**: Nothing (first phase)
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. Developer can run `pnpm test` and see Vitest results for unit and integration tests with clear pass/fail output
  2. Developer can run `pnpm test:e2e` and see Playwright E2E tests complete successfully
  3. Signup flow E2E test completes from form fill to confirmation against demo mode backend
  4. Verification flow (initiate → poll → result) is tested end-to-end with simulated iVALT API responses
  5. All existing API routes (signup, verify, status) have passing tests covering both success and failure cases
**Plans**: TBD
**UI hint**: no

### Phase 2: CI/CD Pipeline
**Goal**: Every code change is automatically linted, type-checked, tested, built, and deployed with preview environments
**Depends on**: Phase 1
**Requirements**: CI-01, CI-02, CI-03
**Success Criteria** (what must be TRUE):
  1. Every push to any branch triggers a GitHub Actions workflow running lint → type-check → test → build
  2. Every pull request creates a Vercel preview deployment with Playwright E2E tests running against it
  3. Merges to main auto-deploy to production via Vercel without manual intervention
  4. Pipeline fails fast on any error (lint, type, test, build) with clear notification
**Plans**: TBD
**UI hint**: no

### Phase 3: Error Tracking
**Goal**: Production errors in client, server, and edge runtimes are captured, source-mapped, grouped, and alerted in real-time
**Depends on**: Phase 2
**Requirements**: MON-01, MON-02
**Success Criteria** (what must be TRUE):
  1. Unhandled exceptions in client-side, server-side, and edge runtimes appear in Sentry dashboard
  2. Stack traces in Sentry are mapped to original TypeScript source via uploaded source maps
  3. Errors are grouped by route handler and error type for efficient triage
  4. Critical errors (verification failures, API failures) trigger configured email/notification alerts
**Plans**: TBD
**UI hint**: no

### Phase 4: Security Hardening
**Goal**: Application is hardened against XSS, clickjacking, API abuse, and in-memory state loss across restarts
**Depends on**: Phase 3
**Requirements**: SEC-01, SEC-02, SEC-03
**Success Criteria** (what must be TRUE):
  1. All HTTP responses include security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
  2. API routes return HTTP 429 with `Retry-After` header when rate limits are exceeded
  3. In-memory `rateLimitStore` and demo mode `simRequests` are backed by Upstash Redis persistence
  4. Content Security Policy prevents XSS without breaking existing application functionality (fonts, scripts, styles)
**Plans**: TBD
**UI hint**: no

### Phase 5: Structured Logging
**Goal**: All application output is structured, searchable, and traceable across requests using Pino
**Depends on**: Phase 4
**Requirements**: LOG-01, LOG-02, LOG-03
**Success Criteria** (what must be TRUE):
  1. All application log output uses structured Pino logging — no `console.log` remains in production code paths
  2. Logs output as newline-delimited JSON in production for log aggregation tool ingestion
  3. Logs output as pretty-print with colorized output in development for developer readability
  4. Every API request has a unique correlation ID that traces across all associated log entries in a request lifecycle
  5. Operator can filter logs by correlation ID, log level, and route path
**Plans**: TBD
**UI hint**: no

### Phase 6: Compliance Infrastructure
**Goal**: Audit trail, health monitoring, and compliance documentation are in place for SOC 2 readiness
**Depends on**: Phase 5
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04
**Success Criteria** (what must be TRUE):
  1. All state-changing operations (signup, verification requests, admin actions) are recorded in an append-only `audit_logs` table
  2. Both PostgreSQL and SQLite schemas have `audit_logs` table with matching column definitions (dual schema maintained in sync)
  3. `GET /api/health` returns HTTP 200 with database connectivity status and application version
  4. Uptime monitoring via Better Stack (or equivalent) is configured, reporting status, and alerting on downtime
  5. SOC 2 readiness documents exist covering access control policy, data retention policy, and incident response procedures
**Plans**: TBD
**UI hint**: no

### Phase 7: Admin Dashboard
**Goal**: iVALT operators can log in, manage customers, view verification history, audit logs, and monitor usage metrics
**Depends on**: Phase 6
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, SEC-04
**Success Criteria** (what must be TRUE):
  1. Admin can log in via a dedicated `/admin/login` page with JWT-based session management (httpOnly cookies, refresh tokens)
  2. Admin can browse, search, and paginate all registered customers from a customer list page
  3. Admin can view a customer detail page showing full verification request history with status and timestamps
  4. Admin can view and filter the verification request audit log from a dedicated audit log viewer
  5. Admin dashboard displays usage metrics: verifications per day (chart), success rate percentage, and active customer count
**Plans**: TBD
**UI hint**: yes

### Phase 8: Enterprise API
**Goal**: Enterprise customers can integrate programmatically via a versioned REST API secured by API key authentication
**Depends on**: Phase 7
**Requirements**: API-01, API-02
**Success Criteria** (what must be TRUE):
  1. Versioned REST API is available at `/api/v1/` for enterprise integration (distinct from internal `/api/` routes)
  2. Enterprise customers can authenticate requests via Bearer token using issued API keys
  3. API keys are stored securely (bcrypt-hashed) and validated on every authenticated API request
  4. API returns consistent JSON response envelopes with standard HTTP status codes and descriptive error messages
**Plans**: TBD
**UI hint**: no

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Testing Foundation | 0/0 | Not started | - |
| 2. CI/CD Pipeline | 0/0 | Not started | - |
| 3. Error Tracking | 0/0 | Not started | - |
| 4. Security Hardening | 0/0 | Not started | - |
| 5. Structured Logging | 0/0 | Not started | - |
| 6. Compliance Infrastructure | 0/0 | Not started | - |
| 7. Admin Dashboard | 0/0 | Not started | - |
| 8. Enterprise API | 0/0 | Not started | - |
