# System Architecture & Services Documentation

This document provides detailed information about all services and infrastructure components in the iVALT OnDemand ID system.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│  │   Browser   │────>│  Next.js    │────>│   Mobile    │      │
│  │  (React)    │     │  App Router │     │  iVALT App  │      │
│  └─────────────┘     └─────────────┘     └─────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Services                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│  │   Database  │     │    Email    │     │  iVALT API  │      │
│  │ (SQLite/    │     │  (SES/SMTP) │     │ (biometric  │      │
│  │  PostgreSQL)│     └─────────────┘     │  auth)      │      │
│  └─────────────┘                         └─────────────┘      │
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│  │  Security   │     │   Logging   │     │ Monitoring  │      │
│  │(Rate limit) │     │   (Pino)    │     │   (Sentry)  │      │
│  └─────────────┘     └─────────────┘     └─────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Core Services

### 1. Database

**Purpose**: Persistent storage for customers, verification requests, and audit logs

**Current Setup**:

- **Development**: SQLite (`./local.db`)
- **Production**: PostgreSQL via Neon (`DATABASE_URL`)

**Connection Logic** (`lib/db/index.ts`):

```typescript
const dbType = process.env.DB_TYPE || 'sqlite';

if (dbType === 'neon' && DATABASE_URL) {
  // PostgreSQL connection
  const client = postgres(DATABASE_URL);
  db = drizzle(client, { schema: pgSchema });
} else {
  // SQLite connection
  const sqlite = new Database(dbPath);
  db = drizzleSqlite(sqlite, { schema: sqliteSchema });
}
```

**Schema Files**:

- `lib/db/schema.pg.ts` - PostgreSQL schema
- `lib/db/schema.sqlite.ts` - SQLite schema

**Tables**:

- `customers` - Company registration data
- `ondemandRequests` - Verification request tracking

**Configuration**:

```env
DB_TYPE=sqlite          # or 'neon' for PostgreSQL
SQLITE_DB_PATH=./local.db
DATABASE_URL=postgresql://...
```

---

### 2. Email Service

**Purpose**: Send notifications to customers and administrators

**Providers**:

1. **Primary**: AWS SES (Simple Email Service)
2. **Fallback**: SMTP (Gmail, custom SMTP servers)

**Implementation** (`lib/email/transport.ts`):

- Automatic fallback from SES to SMTP on failure
- Non-blocking email sending (Promise.all with .catch())
- Template-based HTML emails

**Email Templates** (`lib/email/templates/`):

- `customer-confirmation.html` - Welcome email to new customers
- `admin-signup-notification.html` - Alert for new signups
- `admin-verification-alert.html` - Alert for verification attempts

**Configuration**:

```env
EMAIL_PROVIDER=ses        # or 'smtp'
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# AWS SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx
```

---

### 3. iVALT API

**Purpose**: Trigger biometric verification push notifications to mobile app

**Integration Points**:

- `lib/ivalt/client.ts` - API client
- `lib/ivalt/types.ts` - TypeScript interfaces

**API Endpoints**:

1. `/biometric-auth-request` - Trigger verification
2. `/biometric-auth-result` - Poll for results
3. `/biometric-geo-fence-auth-results` - Geo-fence validation

**Status Code Mapping** (`mapIvaltStatus`):

- `200` → `authenticated`
- `404` → `not_found`
- `422` → `pending`
- `403` → `failed`

**Configuration**:

```env
IVALT_API_KEY=your_api_key_here
IVALT_API_BASE_URL=https://api.ivalt.com
```

**Demo Mode**:

- When `DEMO_MODE=true`, simulates responses
- Uses `lib/sim-store.ts` for in-memory request tracking
- Test codes: `ACME7421` (approved), `MISSING01` (not found), mobile ending `0000` (denied)

---

### 4. Security

**Components**:

1. **Rate Limiting** (`lib/security.ts`)
   - Current: In-memory Map (demo mode)
   - Production: Should use Redis (Upstash recommended)
   - Endpoint: `checkRateLimit(key, max, windowMs)`

2. **CAPTCHA**
   - Cloudflare Turnstile (default)
   - Google reCAPTCHA v2 (alternative)
   - Configurable via `CAPTCHA_PROVIDER` env var

3. **Input Sanitization**
   - `stripHtml()` function for XSS prevention
   - Applied to `notes` field in signup

4. **Security Headers**
   - Already configured in `next.config.mjs`:
     - `X-Frame-Options: DENY`
     - `X-Content-Type-Options: nosniff`
     - `X-XSS-Protection: 1; mode=block`
     - `Strict-Transport-Security` (HSTS)
     - `Referrer-Policy`
     - `Permissions-Policy`

---

### 5. Background Jobs & Queues

**Current State**: None (all operations synchronous)

**Planned**:

- Email queue (BullMQ/Resque)
- Verification polling (background sync)
- Report generation

---

## 📡 API Endpoints

### Public Endpoints

| Method | Path                   | Purpose                  | Auth           |
| ------ | ---------------------- | ------------------------ | -------------- |
| POST   | `/api/signup`          | Customer registration    | None           |
| POST   | `/api/verify`          | Initiate verification    | None           |
| GET    | `/api/status/:id`      | Poll verification status | None           |
| GET    | `/api/health`          | Simple health check      | None           |
| GET    | `/api/health/detailed` | Detailed health check    | Token required |

### Health Endpoints

**Simple Health Check** (`GET /api/health`):

```bash
curl http://localhost:3000/api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-06-24T17:31:27+05:30",
  "version": "0.1.0"
}
```

**Detailed Health Check** (`GET /api/health/detailed`):

```bash
curl -H "X-Health-Token: your-secret-health-token-here" \
  http://localhost:3000/api/health/detailed
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-06-24T17:31:27+05:30",
  "uptime": 12345,
  "version": "0.1.0",
  "database": "operational",
  "services": [
    { "name": "Database", "status": "operational" },
    { "name": "Email", "status": "operational", "details": "ses configured" },
    {
      "name": "iVALT API",
      "status": "operational",
      "details": "API key configured"
    },
    { "name": "Rate Limiting", "status": "degraded", "details": "In-memory" }
  ]
}
```

---

## 🗃️ Data Flow

### Signup Flow

```
Browser → POST /api/signup → Validate → DB Insert → Send Emails → Response
                                                ↘           ↗
                                              Admin + Customer
```

### Verification Flow

```
Browser → POST /api/verify → Validate IDCONNECTION → Create DB Record
                                                   ↓
                                              iVALT API Call
                                                   ↓
                                           Poll GET /api/status/:id
                                                   ↓
                                              Real-time Updates
```

---

## 🔐 Security Considerations

### Currently Protected

- ✅ Environment variables (not committed)
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Rate limiting (in-memory, needs Redis for production)
- ✅ Input sanitization
- ✅ CAPTCHA on forms

### Needs Implementation

- [ ] Audit logging table
- [ ] API key authentication for admin endpoints
- [ ] Redis for persistent rate limiting
- [ ] Sentry error tracking
- [ ] Pino structured logging

---

## 🚀 Deployment Checklist

### Environment Variables Required

- [ ] `DATABASE_URL` (PostgreSQL)
- [ ] `IVALT_API_KEY`
- [ ] `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`
- [ ] `ADMIN_EMAIL`
- [ ] `HEALTH_TOKEN`
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`

### Production Readiness

- [ ] Switch from SQLite to PostgreSQL
- [ ] Enable DEMO_MODE=false
- [ ] Configure SES domain verification
- [ ] Set up Redis for rate limiting
- [ ] Enable Sentry monitoring
- [ ] Configure uptime monitoring (Better Stack)
- [ ] Create admin dashboard
- [ ] Add audit logging

---

## 📞 Support

For questions about:

- **Database**: Check `lib/db/`
- **Email**: Check `lib/email/`
- **iVALT API**: Check `lib/ivalt/`
- **Security**: Check `lib/security.ts`
