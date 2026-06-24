# Pitfalls Research

**Domain:** Identity Verification SaaS — Authentication, Admin, Audit, Webhooks
**Researched:** 2026-05-12
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Middleware-Only Authorization (CVE-2025-29927 Pattern)

**What goes wrong:**
Relying solely on Next.js middleware (`middleware.ts` / `proxy.ts`) for auth checks creates a single point of bypass. CVE-2025-29927 (CVSS 9.1) demonstrated that the `x-middleware-subrequest` HTTP header can bypass middleware entirely. In Next.js 16, the file is now `proxy.ts`, but the architectural risk remains: anything that depends on middleware running before a route handler is a bypass target.

**Why it happens:**
Middleware seems like the right layer for auth — it runs before every request, has low latency, and feels like a "gate." Developers naturally put all auth logic there. But Middleware is designed for redirects, rewrites, and header manipulation — not as a security boundary. It runs in the Edge Runtime with limited APIs and wasn't designed to be a security enforcement point.

**How to avoid:**

- Use a **Data Access Layer (DAL)** pattern with auth checks in every server action and API route handler — never trust that middleware already validated the request
- Centralize auth logic in a shared `lib/auth.ts` or `lib/dal.ts` using `react.cache()` for per-request deduplication
- Implement **defense in depth**: middleware (proxy) for UX redirects + route handler checks for data access + database-level RLS policies
- Keep middleware only for: public/private route redirects, header manipulation, geolocation checks — never as the sole auth enforcement

**Warning signs:**

- Routes that trust `request.headers` set by middleware without re-validating
- Server Components fetching data without explicit auth checks
- API routes that assume the caller is authenticated because "middleware already checked"
- No Data Access Layer — auth checks scattered across route handlers

**Phase to address:**
Phase 1 (Admin Access Control) — build the DAL/auth layer before the admin dashboard exists. Retrofitting auth is always harder than building it in.

---

### Pitfall 2: Admin Dashboard Without Proper Auth (Hard-coded "admin" role via env var)

**What goes wrong:**
The quickest path to an admin dashboard is a single hard-coded admin API key in an env var, or a magic URL. This creates a shared secret with no audit trail, no session management, and no way to revoke individual access. When the key inevitably leaks (stored in CI, pasted in Slack, committed to git), attackers have full admin access with zero accountability.

**Why it happens:**
Early-stage SaaS apps don't want to build a full identity system just for the admin. "It's just us using the dashboard" is the reasoning. But that reasoning ignores: employees leaving, laptops being stolen, CI/CD exposing env vars, and compliance requirements for access control.

**How to avoid:**

- Admin access must use proper authentication with **individual user accounts** — not shared API keys
- Implement **session-based auth** (HttpOnly cookies, server-side sessions) for the admin dashboard, not bearer tokens in localStorage
- Use **RBAC** with at minimum: `admin`, `viewer`, and `superadmin` roles — defined as a configuration, not hard-coded in route handlers
- Every admin action must be traceable to a specific user identity
- Use an auth library (NextAuth/Auth.js, Clerk, Lucia) rather than building custom auth for admin — the latter introduces more surface area than it saves

**Warning signs:**

- Admin routes protected by a single `ADMIN_SECRET` env var check
- No session management — every request re-authenticates from scratch
- Admin dashboard sharing the same authentication as the public app
- No way to add/remove admin users without deploying code

**Phase to address:**
Phase 1 (Admin Access Control) — must include proper admin authentication before any admin features are exposed.

---

### Pitfall 3: Audit Logs That Can't Pass an Audit

**What goes wrong:**
Audit logs are implemented as database rows that can be updated or deleted — or worse, as console.log statements. When an auditor asks "show me who accessed customer PII last Tuesday and whether any logs have been tampered with," the answer is "we don't know" or "we can't prove the logs haven't been altered."

**Why it happens:**
Audit logging is treated as an afterthought — just another database table. Developers don't consider immutability requirements because the same database also stores mutable business data. The mistake is conflating _application logging_ (debugging, error tracking) with _audit logging_ (compliance, non-repudiation, incident investigation).

**How to avoid:**

- Segregate audit logs into a **separate table** (or better, a **separate append-only store**) that application code cannot `UPDATE` or `DELETE`
- Each audit entry must include: `actor_id`, `action`, `resource_type`, `resource_id`, `old_value`, `new_value`, `timestamp` (UTC), `ip_address`, `user_agent`, `correlation_id`
- Add a **cryptographic hash chain** (each entry's hash includes the previous entry's hash) — or at minimum a deterministic UUID that proves no rows were deleted
- Set database permissions so audit tables are **INSERT-only** for application roles
- Never log full PII/bio metric data in audit logs — log that a biometric check happened, not the actual biometric data
- Implement **log rotation and retention policies** (SOC 2 requires minimum 1 year, typically 3-7 years)

**Warning signs:**

- Audit logs in the same table as mutable business data
- No `old_value` / `new_value` tracking — just "User updated customer record"
- Audit entries without actor identity
- Timestamps that aren't UTC
- No mechanism to detect log tampering

**Phase to address:**
Phase 2 (Audit Logging & Observability) — must be built before production launch, not after. Retrofitting immutable audit logs to existing data is extremely painful.

---

### Pitfall 4: Webhook Processing That Fails Silently

**What goes wrong:**
Webhook endpoints that process events synchronously, don't use idempotency keys, don't verify signatures, and don't have retry mechanisms. A single webhook failure (database timeout, network blip, validation error) can silently drop an event. In identity verification, this means a verification response is lost — user appears authenticated to the caller but the system state is inconsistent.

**Why it happens:**
Webhooks look like regular HTTP endpoints so they're treated as such. The critical difference: webhooks arrive asynchronously with at-least-once delivery guarantees, meaning the SAME webhook can arrive MULTIPLE TIMES. Without idempotency, every event is processed twice. Without async queue processing, a spike in webhooks blocks the endpoint and causes a cascading retry loop.

**How to avoid:**

- **Always verify webhook signatures** (HMAC-SHA256) — never process an unsigned webhook. Use a timestamp + signature scheme to prevent replay attacks
- **Idempotency first**: store processed webhook IDs in the database, return 200 for duplicates without re-processing
- **Queue all processing**: webhook endpoint responds 200 immediately (after validation), actual processing happens via a background job queue (Bull/BullMQ, Inngest, Trigger.dev)
- **Implement exponential backoff retries** with a maximum retry limit and a **dead letter queue** for permanently failed events
- **Log every webhook event** with raw payload, processing result, and timing — critical for debugging integration issues
- Webhook endpoint must respond within **5 seconds** (Vercel serverless timeout) — any longer = async processing required

**Warning signs:**

- Webhook endpoint does complex computation or DB writes before responding
- Same webhook ID processed multiple times (visible in logs as duplicates)
- No webhook signature verification
- No way to manually replay a webhook
- Webhook failures go to `console.error` with no alerting

**Phase to address:**
Phase 3 (Webhook & API Integration) — plan the webhook architecture before the iVALT API needs to push results back. The current polling model (GET /api/status/:id) avoids this, but any future event-driven integration will reintroduce these risks.

---

### Pitfall 5: In-Memory State That Disappears Across Serverless Instances

**What goes wrong:**
In-memory stores (Map objects, global variables) for rate limiting, session data, demo mode state, or request tracking work during local development but fail catastrophically in production. Each Vercel serverless function invocation can hit a different container, so in-memory state is per-instance and ephemeral. Rate limits reset spuriously, demo state is inconsistent, and polling requests lose their context.

**Current code has this exact risk:** `rateLimitStore` (Map), `simRequests` (Map) — both in-memory.

**Why it happens:**
Simple implementation wins during development. Maps are easy, don't need external dependencies, and work perfectly with one process. The mental model shift from "single server" to "stateless serverless" is easy to miss.

**How to avoid:**

- **Rate limiting**: Use Vercel KV (Upstash Redis) for production rate limiting. The in-memory Map is a development convenience, not a production solution
- **Demo mode**: For simulated verification flows, either use the database (with a `demo = true` flag column) or Redis with TTL — not an in-memory Map
- **Session data**: Must be stored in the database or Redis — never in process memory
- Add a self-test endpoint (`/api/health`) that verifies Redis/KV connectivity in production
- Document explicitly which dependencies change between development and production modes

**Warning signs:**

- Production code using `Map`, `new Set()`, or global `const store = {}` for cross-request state
- Rate limiting stops working under moderate load
- Demo/development features behave differently on Vercel than locally
- No Redis/KV dependency configured in production deployment

**Phase to address:**
Phase 4 (Production Hardening) — rate limiting, session persistence, and demo isolation must use production-grade storage. The current Maps are acceptable for MVP but flagged as tech debt.

---

### Pitfall 6: Sensitive Data in Logs and Error Responses

**What goes wrong:**
Verification requests include personally identifiable information (mobile numbers, potentially biometric data references). Logging these to console, Sentry, or returning them in error messages violates compliance requirements (GDPR, SOC 2, CCPA) and creates data breach exposure. A single server error that echoes back the request body can leak PII to monitoring tools and log aggregators.

**Current code risk:** The verify route catches and logs `String(error)` and may include PII in error messages.

**Why it happens:**
Developers use `console.error(error)` as a reflex. In development, this is fine. In production, log aggregation tools (DataDog, Sentry, logz.io) collect these logs and they become part of the data footprint. Most teams don't audit their error handling paths for PII exposure until a compliance audit flags it.

**How to avoid:**

- Create a **structured logging wrapper** that strips known PII fields (`mobile`, `email`, `ipAddress`) from log output
- Use **structured error codes** (`ERR_VERIFICATION_TIMEOUT`, `ERR_INVALID_IDCONNECTION`) instead of echoing user input in error responses
- Implement **error sanitization middleware** for API routes that strips request body from error reports
- Configure Sentry/DataDog with **PII stripping rules** — never send raw request body
- For compliance: maintain a separate **data access log** (who accessed what PII and why) vs. **application error log** (no PII)

**Warning signs:**

- Error messages that say "Invalid input: user@email.com is not a valid email"
- API error responses that echo back the full request body
- `console.error(error)` where `error` contains request data
- No log retention or anonymization policy for production logs

**Phase to address:**
Phase 2 (Audit Logging & Observability) — implement structured logging and PII stripping before any production monitoring setup.

---

### Pitfall 7: Database Connection Exhaustion in Serverless

**What goes wrong:**
Each Vercel serverless function invocation opens its own database connection pool. Under traffic spikes (or even moderate concurrency), the database runs out of connections. Queries start timing out, which triggers retries, which opens more connections — a classic death spiral. Postgres has a default max_connections of ~100, which a few concurrent serverless invocations can exhaust.

**Why it happens:**
ORM defaults (including Drizzle) often configure connection pools for traditional server environments (10-20 connections). In serverless, each function gets its own pool. With Neon (serverless Postgres), the connection pooling is handled differently — but the application code needs to be explicit about pooling modes and connection limits.

**How to avoid:**

- If using Neon: use **pooled connection strings** (`?pgbouncer=true` with transaction mode) — direct connections will exhaust limits
- Configure Drizzle with **minimum connections = 0** and **maximum connections = 1-2** per function instance
- Use Vercel's `@vercel/functions` `attachDatabasePool()` to properly manage connection lifecycle
- Implement **connection health checks** before using a pooled connection (stale connections from idle serverless instances cause cryptic errors)
- Monitor connection metrics: use Neon's connection tracking dashboard to spot exhaustion events

**Warning signs:**

- Production errors: "Too many connections", "remaining connection slots are reserved"
- Simple queries suddenly taking 10x longer
- Deployments or cold starts causing connection storms
- Error pattern: failures spike when traffic increases

**Phase to address:**
Phase 4 (Production Hardening) — connection pooling configuration must be verified against the chosen database provider (Neon) before production traffic.

---

### Pitfall 8: No API Key Scoping or Rotation for Enterprise Integrations

**What goes wrong:**
Enterprise customers receive a single API key that has access to ALL their resources. There's no way to scope keys (read-only vs. write, specific endpoints, time-limited), no key rotation mechanism, and no audit of which key was used for which operation. When an enterprise customer's engineer leaves, the API key must be reset — affecting ALL integrations.

**Why it happens:**
Early SaaS apps issue one API key per customer because it's simple. The assumption is "the customer will keep their key safe." Enterprise security teams will reject this during procurement — they require scoped keys (separate read-only keys for monitoring, write keys for operations) and documented rotation procedures.

**How to avoid:**

- Design API keys with **prefix-scoped permissions** from the start: `api_key_production_read`, `api_key_production_write`, `api_key_admin`
- Store API keys as **hashed values** (bcrypt/sha256) — never store plaintext keys
- Implement **key rotation UI** in admin dashboard — generate new key, grace period overlap, deactivate old key
- Log **which API key** performed each operation in audit logs — not just "customer 123 did X"
- Support **IP whitelisting** per API key for enterprise customers
- Include API key in rate limiting namespace so one leaked key doesn't affect other customers

**Warning signs:**

- API keys stored in plaintext in the database
- No UI to generate or revoke API keys
- One API key per customer with access to everything
- No audit trail mapping API operations to specific keys

**Phase to address:**
Phase 3 (Enterprise API Integration) — API key architecture must be designed before the first enterprise integration goes live. Once customers rely on a key format, changing it is disruptive.

---

### Pitfall 9: Polling That Wastes Resources and Misses Deadlines

**What goes wrong:**
The current verification flow uses polling (`GET /api/status/:id` called repeatedly from the frontend). Under load, the iVALT API's `getAuthResult` is called for every poll request, multiplying API costs and database reads. The client polls indefinitely if the server response is ambiguous. This is both costly and unreliable.

**Why it happens:**
Polling is the simplest implementation pattern — setInterval + fetch. It works well for one user in development. The problems appear at scale: the iVALT API may rate-limit excess polling, database costs increase linearly with polling frequency, and the frontend can't distinguish between "still pending" and "server error."

**How to avoid:**

- Implement **exponential backoff on the client**: poll every 2s → 3s → 5s → 8s → max 10s, reset on activity
- Cache "pending" results on the server with a **TTL cache** (1-2s) — don't call iVALT API if another poll just checked
- Add a **max polling duration** (e.g., 60 seconds) on both client and server — time out gracefully with a "verification expired" message
- Consider **Server-Sent Events (SSE)** or **WebSockets** instead of polling for the production version
- Track polling metrics: requests per verification, average resolution time, timeout rate

**Warning signs:**

- Frontend polls indefinitely with no timeout
- Server calls external API (iVALT) on every poll request with no caching
- Monitoring shows high API call volume relative to completed verifications
- Users report "still checking..." for over a minute

**Phase to address:**
Phase 3 (Webhook & API Integration) — optimize polling before scaling, and consider event-driven alternatives as the verification volume grows.

---

### Pitfall 10: Demo Mode as an Attack Vector

**What goes wrong:**
The `DEMO_MODE=true` env var skips database operations and iVALT API calls entirely. If accidentally enabled in production (e.g., config mistake during deployment), the app silently becomes a simulator — accepting requests, returning fake responses, but never actually verifying identities. Worse: if demo and production share infrastructure, a demo request could affect production data.

**Why it happens:**
Demo modes are designed for developer convenience. The toggle is simple and effective for local dev. The risk is operational: a deployment config that flips the wrong env var, or a shared database between demo and production environments.

**How to avoid:**

- Demo mode must **not share database instances** with production — use a completely separate database and secrets
- Add a **health endpoint** that reports whether demo mode is active: `GET /api/health` returns `{ demo: true/false }` — monitor this in production
- Add a **visible banner** in all UI when demo mode is active: "⚠ DEMO MODE — No real verifications"
- Never allow demo mode to coexist with production environment variables — verify with a self-check on startup
- Consider separating demo into a **separate deployment** (preview branch) instead of a runtime toggle

**Warning signs:**

- Demo mode and production mode sharing the same database
- No visual indicator that demo mode is active
- Demo mode can be toggled without redeployment
- No monitoring alert when demo mode is active in production

**Phase to address:**
Phase 4 (Production Hardening) — review and isolate demo mode before production launch.

---

### Pitfall 11: No Rate Limiting on Admin Endpoints

**What goes wrong:**
Admin API endpoints that manage customers, view audit logs, or provision customers are exposed without rate limiting. An attacker who obtains admin credentials (or exploits a session vulnerability) can mass-extract customer data, create accounts, or DDoS the admin database. Admin endpoints are typically more powerful than public ones and need stricter protections.

**Why it happens:**
"Only admins can access these routes" is treated as sufficient protection. But rate limiting for admin endpoints serves a different purpose than public rate limiting: brute-force detection (password guessing), abuse prevention (data scraping) and resource protection (exporting thousands of records).

**How to avoid:**

- Apply **stricter rate limits** to admin endpoints: 30 requests/minute for list operations, 10/minute for mutations
- Use **sliding window rate limiting** (Redis-backed, not in-memory)
- Implement **IP-based + user-based** rate limit keying for admin routes (admins have sessions too)
- Add **concurrent session limits**: enforce max N active admin sessions (prevents shared credentials)
- Rate limit **failed login attempts** to admin with exponential backoff and account lockout (5 failures → 15min lockout)

**Warning signs:**

- Admin API routes that don't call any rate limit function
- Admin dashboard that makes unlimited failed requests
- No distinction between public API rate limits and admin API rate limits

**Phase to address:**
Phase 1 (Admin Access Control) — admin rate limiting must be built alongside the admin authentication system.

---

### Pitfall 12: Missing Webhook Signature Verification for iVALT Callbacks

**What goes wrong:**
If the application webhooks incoming iVALT verification results (instead of only polling), and those webhook endpoints don't verify a cryptographic signature, any attacker who discovers the webhook URL can forge verification results. They can send fake "authenticated" responses, bypassing biometric verification entirely.

**Why it happens:**
Webhook URLs look random but are easily discoverable via server logs, error messages, referrer headers, or brute force. Developers skip signature verification because "the URL is secret" — which is security by obscurity.

**How to avoid:**

- Every incoming webhook must include a **signature header** (typically HMAC-SHA256 of the payload with a shared secret)
- Verify the signature **before any processing** — reject unsigned or invalid signatures with 401 immediately
- Implement **replay protection**: include a timestamp in the signature payload and reject webhooks older than 5 minutes
- Use a **dedicated webhook secret** per integration — don't reuse API keys as webhook secrets
- Log every signature verification (success and failure) for security monitoring

**Warning signs:**

- Webhook endpoints that accept POST without checking headers
- Webhook secret stored in plaintext without rotation capability
- Same secret shared across multiple integrations or environments
- No monitoring for failed signature verifications (could indicate probing)

**Phase to address:**
Phase 3 (Webhook & API Integration) — webhook security is non-negotiable for any event-driven verification flow.

---

## Technical Debt Patterns

| Shortcut                                 | Immediate Benefit                              | Long-term Cost                                                       | When Acceptable                                                                  |
| ---------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| In-memory Map for rate limiting          | Zero dependencies, fast, simple                | Doesn't scale past single instance, resets on deploy, no persistence | MVP only — must upgrade before production launch                                 |
| Demo mode via env var toggle             | Quick to implement, no infra needed            | Risk of accidental production demo mode, no separation of concerns   | Local dev only — use separate deployment for production demo                     |
| Console.error for error logging          | Zero setup, works everywhere                   | No structured data, no searchability, PII leakage risk, no alerting  | Never acceptable for production — always add structured logging                  |
| Shared API key per customer (no scoping) | Simple integration for early customers         | Breaking change when enterprise needs scoped keys, no auditing       | Only for pilot customers with explicit agreement on key reset                    |
| Synchronous webhook processing           | Simple to implement, no queuing infrastructure | Blocks endpoint, causes retry storms, fails under load               | Only for local dev — production must use queue-based processing                  |
| Single admin role (no RBAC)              | Quick to implement, fits team of 1-2           | Can't delegate, can't provide read-only access, audit gaps           | Acceptable for MVP team-only dashboard, must add roles before external admin use |
| Polling instead of webhooks/SSE          | Simple, no infrastructure needed               | Wastes API calls, increases latency, poor UX at scale                | Acceptable for MVP with exponential backoff, add event-driven before scaling     |
| Ignoring TypeScript build errors         | Ship faster during development                 | Hides real type errors, causes runtime crashes in production         | Never acceptable for production — remove `ignoreBuildErrors: true`               |

---

## Integration Gotchas

| Integration                       | Common Mistake                                | Correct Approach                                                                             |
| --------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **iVALT API (outgoing)**          | Calling API on every poll request, no caching | Cache "pending" state for 1-2s, batch status checks, use connection pooling for HTTP client  |
| **iVALT API (incoming webhooks)** | No signature verification, no idempotency     | HMAC-SHA256 verification, idempotency key dedup, queue-based processing                      |
| **Neon (Postgres)**               | Using direct connection URLs in serverless    | Use pooled connection URL (`?pgbouncer=true`), transaction mode, min pool size = 0           |
| **AWS SES (Email)**               | Blocking the request on email sending         | Fire-and-forget with `.catch()`, queue emails in background, use SES rate limits             |
| **Vercel KV (Redis)**             | Using as primary data store                   | KV for caching and rate limiting only — DB is source of truth. Handle KV failures gracefully |
| **Turnstile (CAPTCHA)**           | Skipping verification in demo mode silently   | Verify Turnstile in ALL modes (demo creates a mock token) — don't bypass security controls   |
| **Sentry/Error Monitoring**       | Sending raw request body to error tracking    | Implement PII stripping middleware, add `requestId` instead of full request body             |

---

## Performance Traps

| Trap                                   | Symptoms                                                                 | Prevention                                                           | When It Breaks                                          |
| -------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------- |
| Polling every 2s from frontend         | iVALT API bill scales linearly, DB reads spike, client CPU usage         | Exponential backoff, server-side caching, SSE alternative            | >100 concurrent verifications                           |
| Synchronous email sending in API route | API response time increases with email latency, timeouts                 | Fire-and-forget with `.catch()`, queue-based email delivery          | >10 concurrent signups                                  |
| No database connection pooling         | `Too many connections` errors, intermittent timeouts, cascading failures | Pooled Neon URL, Drizzle pool config, `attachDatabasePool()`         | >50 concurrent serverless invocations                   |
| Unbounded in-memory rate limit Map     | Memory leak over time, rate limits reset on function cold start          | Redis-backed rate limiting with TTL                                  | When deployed to production with >1 serverless instance |
| Full-table scans on audit log queries  | Admin dashboard loading slowly, DB CPU spikes, query timeouts            | Index on `actor_id`, `action`, `timestamp` — partition by date range | >100K audit log entries                                 |
| No index on request polling queries    | Status endpoint slows down as `ondemandRequests` table grows             | Composite index on `(id, status)` and `(id_connection, created_at)`  | >10K verification requests                              |

---

## Security Mistakes

| Mistake                                                           | Risk                                                           | Prevention                                                             |
| ----------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Middleware as sole auth boundary                                  | Complete auth bypass (CVE-2025-29927 pattern)                  | DAL + route handler + RLS — defense in depth                           |
| Error messages that distinguish "user exists" vs "wrong password" | User enumeration attack on signup                              | Generic error messages: "Invalid credentials" or "Verification failed" |
| Storing mobile numbers in plaintext logs                          | GDPR/CCPA violation, data breach exposure                      | PII stripping middleware, structured logging without personal data     |
| No rate limiting on admin login                                   | Brute-force credential attack                                  | Exponential backoff, IP + user locking, concurrent session limits      |
| Webhook URL as sole security mechanism                            | Forgery of verification results                                | HMAC-SHA256 signature + timestamp replay protection                    |
| Shared demo/production database                                   | Demo actions affect production data                            | Separate databases per environment, separate env vars                  |
| API keys in the `?api_key=` query parameter                       | Key exposure in server logs, referrer headers, browser history | API keys in `Authorization: Bearer` header only                        |
| No CSP headers                                                    | XSS attacks can execute arbitrary scripts                      | `Content-Security-Policy` header restricting script sources            |

---

## UX Pitfalls

| Pitfall                                          | User Impact                                         | Better Approach                                                                          |
| ------------------------------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| No visible polling timeout                       | Browser spinner spins forever, user confused        | Show "Connecting to mobile app..." → timeout with retry option after 60s                 |
| IDCONNECTION code is case-sensitive with no hint | Enterprise admins fail on first attempt             | Normalize to uppercase automatically. Show format example: "ABCD1234"                    |
| Verification status is cryptic                   | Mobile user sees "Status: 422"                      | Map to human-readable: "Sending request..." → "Waiting for response..." → "Verified!"    |
| Admin dashboard has no loading state             | Admin clicks "Export" and nothing appears to happen | Optimistic UI updates, loading skeletons, progress indicators for data exports           |
| Audit log search is missing date range           | Admin can't find "what happened last Tuesday"       | Date range picker, filter by actor, filter by action type — don't show "search all" only |
| No confirmation before admin actions             | Admin accidentally deletes customer                 | Confirmation dialog for destructive actions, soft-delete with recovery period            |

---

## "Looks Done But Isn't" Checklist

- [ ] **Admin Auth:** Often missing proper session management — verify sessions expire, can be revoked, and support MFA
- [ ] **Audit Logs:** Often missing immutability guarantees — verify application code cannot `UPDATE` or `DELETE` audit entries
- [ ] **Rate Limiting:** Often missing Redis-backed persistence — verify the in-memory Map was replaced before production
- [ ] **Webhook Verification:** Often missing signature validation — verify HMAC check exists and can't be bypassed
- [ ] **Error Responses:** Often missing PII sanitization — verify no `user.email`, user mobile, or request body appears in error output
- [ ] **Admin Roles:** Often missing granular permissions — verify at minimum: admin, viewer, superadmin exist and are enforced
- [ ] **Database Pooling:** Often missing Neon pooled connection config — verify `?pgbouncer=true` is in production connection string
- [ ] **CI/CD Security:** Often running tests/checks with production-like secrets — verify secrets are never in CI logs
- [ ] **API Key Management:** Often missing key rotation — verify admin dashboard has "generate new key" and "revoke key" UI
- [ ] **CSP Headers:** Often missing — verify `Content-Security-Policy` header is configured and tested
- [ ] **Health Check Endpoint:** Often missing — verify `GET /api/health` checks DB connectivity, Redis KV, iVALT API reachability
- [ ] **Demo Mode Isolation:** Often sharing production database — verify demo mode uses completely separate data store

---

## Recovery Strategies

| Pitfall                                      | Recovery Cost | Recovery Steps                                                                                                                                                          |
| -------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database connection exhaustion               | HIGH          | 1. Drop idle connections via Neon dashboard. 2. Deploy fix with pooled URL. 3. Restart serverless functions. 4. Monitor connection count                                |
| Webhook missed/dropped event                 | HIGH          | 1. Check dead letter queue. 2. Manually replay event. 3. Verify idempotency prevents duplicate. 4. Add alerting for DLQ > 0                                             |
| Rate limit store reset (in-memory)           | MEDIUM        | 1. Deploy Redis-backed rate limiting. 2. Accept that rate limits briefly reset during deploy. 3. Monitor for abuse spike                                                |
| Admin credential compromised                 | HIGH          | 1. Immediately revoke all sessions. 2. Rotate admin secrets. 3. Review audit logs for unauthorized actions. 4. Notify affected customers                                |
| API key leaked in git history                | HIGH          | 1. Generate new key immediately. 2. Rotate old key (set to expire in 24h). 3. Remove from git history (BFG Repo-Cleaner). 4. Audit for unauthorized usage               |
| Demo mode accidentally enabled in production | CRITICAL      | 1. Immediate deploy with `DEMO_MODE=false`. 2. Verify no fake verifications were accepted. 3. Add deployment guard: `if (DEMO_MODE && NODE_ENV === 'production') throw` |
| PII leaked in error logs                     | HIGH          | 1. Scrub logs in log aggregator. 2. Deploy PII stripping middleware. 3. Assess regulatory notification requirements (GDPR 72h). 4. Add automated log scanning           |

---

## Pitfall-to-Phase Mapping

| Pitfall                                      | Prevention Phase                    | Verification                                                                       |
| -------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| Middleware-only auth (P1)                    | Phase 1: Admin Access Control       | DAL auth checks in every route handler, no route trusts middleware alone           |
| Admin dashboard without proper auth (P2)     | Phase 1: Admin Access Control       | Admin login requires individual credentials, session management works              |
| Audit logs not auditable (P3)                | Phase 2: Audit Logging              | Audit entries are INSERT-only, include cryptographic chain, separate from app data |
| Webhook processing failures (P4)             | Phase 3: Webhook & API Integration  | Idempotency key dedup tested, signature verification mandatory, DLQ in place       |
| In-memory state across serverless (P5)       | Phase 4: Production Hardening       | All cross-request state uses Redis/KV or database; no Maps in production paths     |
| PII in logs & errors (P6)                    | Phase 2: Audit Logging              | Structured logging strips PII, error responses use codes not values                |
| Database connection exhaustion (P7)          | Phase 4: Production Hardening       | Pooled Neon URL configured, connection metrics showing steady utilization          |
| No API key scoping (P8)                      | Phase 3: Enterprise API Integration | Keys have scoped permissions, rotation UI works, audit logs track key usage        |
| Polling waste (P9)                           | Phase 3: Webhook & API Integration  | Exponential backoff implemented, server-side caching for pending state             |
| Demo mode as attack vector (P10)             | Phase 4: Production Hardening       | Demo mode uses separate database, health endpoint reports mode, UI shows banner    |
| No admin rate limiting (P11)                 | Phase 1: Admin Access Control       | Admin endpoints have stricter rate limits than public, login has lockout           |
| Missing webhook signature verification (P12) | Phase 3: Webhook & API Integration  | All incoming webhooks verify HMAC-SHA256 before processing                         |

---

## Sources

- [Next.js CVE-2025-29927: Middleware Authorization Bypass](https://nextjs.org/blog/cve-2025-29927) — HIGH confidence (official advisory)
- [Next.js Security Best Practices (2026) — Authgear](https://www.authgear.com/post/nextjs-security-best-practices) — HIGH confidence (verifiable against official Next.js docs)
- [Webhook Reliability: Retry, Idempotency, DLQs — Hook0](https://documentation.hook0.com/how-to-guides/monitor-webhook-performance) — HIGH confidence (production docs)
- [Webhook Best Practices: Retry Logic & Idempotency — DEV](https://dev.to/henry_hang/webhook-best-practices-retry-logic-idempotency-and-error-handling-27i3) — MEDIUM confidence (community, verified against Stripe docs)
- [Building Audit Logs That Won't Fail Your SOC 2 Audit — Medium](https://medium.com/@sohail_saifii/building-audit-logs-that-wont-fail-your-soc-2-audit-251013d687c7) — MEDIUM confidence (practitioner, verifiable against SOC 2 requirements)
- [Vercel Serverless Database Connection Problem Solved](https://vercel.com/blog/the-real-serverless-compute-to-database-connection-problem-solved) — HIGH confidence (Vercel official)
- [12 API Security Mistakes Developers Still Make — Security Boulevard](https://securityboulevard.com/2026/04/12-authentication-api-security-mistakes-developers-still-make-in-2026) — MEDIUM confidence (aggregator, patterns verified against OWASP)
- [SaaS Identity and Access Management — Valence Security](https://www.valencesecurity.com/saas-security-terms/what-is-saas-identity-management) — MEDIUM confidence (vendor, general patterns are industry standard)
- [Six Compliance Pitfalls in ID Verification Workflows — Aristotle](https://integrity.aristotle.com/2025/06/six-compliance-pitfalls-to-avoid-in-id-verification-workflows) — HIGH confidence (identity verification domain expert)
- iVALT codebase audit (`lib/security.ts`, `app/api/*/route.ts`, `lib/db/schema.*.ts`, `next.config.mjs`) — HIGH confidence (direct code review of the project)

---

_Pitfalls research for: iVALT OnDemand ID — Identity Verification SaaS_
_Researched: 2026-05-12_
