# Requirements: iVALT OnDemand ID

**Defined:** 2026-05-12
**Core Value:** Enterprises can verify anyone's identity in under 5 seconds without passwords, using only their phone and biometrics.

## v1 Requirements

Requirements for production-hardening and admin features. Each maps to roadmap phases.

### Testing Foundation

- [ ] **TEST-01**: Vitest configured and first suite of unit tests written for Zod schemas, utility functions, and API route handlers
- [ ] **TEST-02**: Playwright configured with at least one E2E test covering the signup flow
- [ ] **TEST-03**: Test coverage for verification flow (initiate → poll → result) with simulated responses
- [ ] **TEST-04**: All existing API routes have basic integration tests (success + failure cases)

### CI/CD Pipeline

- [ ] **CI-01**: GitHub Actions workflow runs lint → type-check → test → build on every push
- [ ] **CI-02**: Playwright E2E tests run in CI against preview deployments
- [ ] **CI-03**: Vercel auto-deploy configured from main branch with preview deployments for PRs

### Error Tracking & Monitoring

- [ ] **MON-01**: Sentry installed and configured for client, server, and edge runtimes
- [ ] **MON-02**: Source maps uploaded, error grouping configured, alerts for critical errors

### Security Hardening

- [ ] **SEC-01**: HTTP security headers configured in next.config.ts (CSP, HSTS, X-Frame-Options, etc.)
- [ ] **SEC-02**: Rate limiting implemented on all API routes via Upstash Redis
- [ ] **SEC-03**: In-memory state stores (rateLimitStore, simRequests) migrated to persistent/Redis-backed storage
- [ ] **SEC-04**: Admin authentication with JWT-based session management (httpOnly cookies, refresh tokens)

### Structured Logging

- [ ] **LOG-01**: console.log replaced with structured logging (Pino)
- [ ] **LOG-02**: JSON log output in production, pretty-print in development
- [ ] **LOG-03**: Request correlation IDs for tracing across API calls

### Compliance Infrastructure

- [ ] **COMP-01**: Append-only audit_logs table created in both Postgres and SQLite schemas
- [ ] **COMP-02**: Health check endpoint at /api/health
- [ ] **COMP-03**: Uptime monitoring configured (Better Stack or equivalent)
- [ ] **COMP-04**: SOC 2 readiness documentation — access control, data retention, incident response policies

### Admin Dashboard

- [ ] **ADMIN-01**: Admin login page with session-based authentication
- [ ] **ADMIN-02**: Customer list and search page
- [ ] **ADMIN-03**: Customer detail page showing verification history
- [ ] **ADMIN-04**: Verification request audit log viewer
- [ ] **ADMIN-05**: Basic usage metrics dashboard (verifications per day, success rate, active customers)

### Enterprise API Integration

- [ ] **API-01**: Versioned REST API at /api/v1/ for enterprise integration
- [ ] **API-02**: API key authentication (Bearer token with bcrypt-hashed keys)
- [ ] **API-03**: Webhook system for push-based verification result notifications (optional for v1)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Operations

- **OPS-01**: Real-time monitoring dashboard (verification request queue, live status)
- **OPS-02**: Usage analytics (trends, customer-level breakdown, exportable reports)
- **OPS-03**: Alert configuration (webhook URL + Slack/email for failed verifications)

### Enterprise

- **ENT-01**: API rate limit dashboard (per-customer usage, throttling events)
- **ENT-02**: Webhook delivery debugging UI (attempt logs, retry, replay)
- **ENT-03**: API usage billing metrics
- **ENT-04**: Multi-admin user system with role-based access control

### Platform

- **PLAT-01**: Structured data export (CSV/JSON of verification logs)
- **PLAT-02**: Email report scheduling (daily/weekly verification summaries)
- **PLAT-03**: Custom verification timeout configuration per customer

## Out of Scope

| Feature | Reason |
|---------|--------|
| Document KYC / ID document verification | iVALT uses push-notification biometrics, not document scanning — different product category |
| SSO / SAML / OIDC integration | Single admin + API key auth sufficient for v1; SSO is v2+ |
| Billing / subscription management | Not required until customer self-service provisioning |
| Multi-tenant self-service provisioning | Manual provisioning by iVALT admin is current operating model |
| Native mobile app development | Identity verification happens through existing iVALT mobile app |
| Real-time chat / support ticketing | Not core to identity verification product |
| Performance / load testing suite | Add during stress-testing milestone, not initial hardening |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEST-01 | Phase 1 | Pending |
| TEST-02 | Phase 1 | Pending |
| TEST-03 | Phase 1 | Pending |
| TEST-04 | Phase 1 | Pending |
| CI-01 | Phase 2 | Pending |
| CI-02 | Phase 2 | Pending |
| CI-03 | Phase 2 | Pending |
| MON-01 | Phase 3 | Pending |
| MON-02 | Phase 3 | Pending |
| SEC-01 | Phase 4 | Pending |
| SEC-02 | Phase 4 | Pending |
| SEC-03 | Phase 4 | Pending |
| LOG-01 | Phase 5 | Pending |
| LOG-02 | Phase 5 | Pending |
| LOG-03 | Phase 5 | Pending |
| COMP-01 | Phase 6 | Pending |
| COMP-02 | Phase 6 | Pending |
| COMP-03 | Phase 6 | Pending |
| COMP-04 | Phase 6 | Pending |
| ADMIN-01 | Phase 7 | Pending |
| ADMIN-02 | Phase 7 | Pending |
| ADMIN-03 | Phase 7 | Pending |
| ADMIN-04 | Phase 7 | Pending |
| ADMIN-05 | Phase 7 | Pending |
| SEC-04 | Phase 7 | Pending |
| API-01 | Phase 7 | Pending |
| API-02 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-12*
*Last updated: 2026-05-12 after initial definition*
