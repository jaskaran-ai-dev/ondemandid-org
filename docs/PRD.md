iVALT OnDemand ID — Features & Functionality
Overview
iVALT OnDemand ID is a proof-of-concept web application that enables enterprises to verify user identities on demand through biometric authentication via the iVALT mobile app. The platform eliminates password-based authentication by using face and fingerprint recognition, delivered through secure push notifications.
Core Features
1. Landing Page
The home page (/) serves as the primary entry point with:
Hero Section: Value proposition highlighting password-free identity verification
Trust Metrics: Key statistics display (99.9% accuracy, <2s verification time, zero passwords required)
Feature Grid: Six core capabilities presented in a card layout:
Biometric security (face & fingerprint recognition)
Instant verification via push notifications
Zero-password authentication
Enterprise API integration
Complete audit trail
Mobile-first (iOS & Android)
Implementation Guide: Three-step process visualization (Register company → Onboard users → Verify identities)
Security Architecture Section: End-to-end encryption, access control, and compliance tracking
Call-to-Action: Trial signup flow entry points
2. Customer Signup (/signup)
Companies register to receive an iVALT IDCONNECTION code.
Form Fields:
| Field | Validation | Description |
|-------|-----------|-------------|
| Company Name | 2–255 chars | Organization name |
| Contact Name | 2–255 chars | Primary contact person |
| Email | Valid email, max 320 | Contact email address |
| Phone | Country code + 6–14 digits | Contact mobile number with country code selector |
| Initial Users | 1–100 | Number of users for the POC |
| Notes | Optional | Additional information |
Process Flow:
Client validates form with React Hook Form + Zod
Phone number parsed into country code and mobile components
POST /api/signup creates database record
Admin notification email sent (SES/SMTP)
Customer confirmation email sent
Success screen displayed with registration confirmation
Database Outcome:
New customers row with status: 'pending'
id_connection remains null until manually provisioned by iVALT admin
3. OnDemand ID Verification (/ondemand-id)
Real-time identity verification through the iVALT mobile app.
Form Fields:
| Field | Validation | Description |
|-------|-----------|-------------|
| IDCONNECTION | 4–12 alphanumeric | Company identifier code (auto-uppercased) |
| Phone | Country code + 6–14 digits | User's mobile number |
Verification Flow:
Client validates IDCONNECTION and phone number
POST /api/verify validates the IDCONNECTION against active customers
Creates ondemand_requests record with status: 'initiated'
Calls iVALT API (POST /biometric-auth-request) to trigger push notification
User receives push notification on iVALT mobile app
User authenticates using face/fingerprint biometrics
Client polls /api/status/:id every 2 seconds for up to 5 minutes (150 attempts)
Final status: authenticated, failed, not_found, or error
Status Display States:
idle — Form ready for input
submitting — Sending verification request
pending — Waiting for user biometric response (with live polling UI)
authenticated — User verified successfully
failed — User rejected or verification failed
not_found — IDCONNECTION invalid or inactive
error — System or network error
4. Real-Time Status Polling (/api/status/:id)
Server-driven polling endpoint for live verification updates.
Logic:
If request is completed → returns authenticated immediately
If request is initiated or pending → queries iVALT API (POST /biometric-auth-result)
Updates database with latest iVALT response
Returns current status, completion timestamp, and HTTP status code
API Endpoints
Endpoint	Method	Description
/api/signup	POST	Creates customer record, sends notification emails
/api/verify	POST	Validates IDCONNECTION, triggers iVALT push notification
/api/status/:id	GET	Polls verification status, queries iVALT if pending
Backend Systems
Dual Database Support
Mode	Engine	Schema File	Use Case
neon (default)	PostgreSQL (Neon)	src/lib/db/schema.pg.ts	Production
sqlite	Better SQLite3	src/lib/db/schema.sqlite.ts	Local development
Tables:
customers — Company registrations
id (PK), company_name, contact_name, email
country_code, mobile, initial_users
id_connection (nullable until provisioned)
status (pending / active / inactive)
notes, created_at, updated_at
Indexes: email, id_connection
ondemand_requests — Verification audit log
id (PK), country_code, mobile, id_connection
request_from (source label), status
ivalt_status_code, ivalt_response (raw JSON)
ip_address, user_agent
created_at, completed_at
Indexes: mobile, id_connection, created_at
Email System
Providers: AWS SES (primary) with SMTP fallback
Email Types:
| Email | Recipient | Trigger |
|-------|-----------|---------|
| Admin Signup Notification | ADMIN_EMAIL | New company registration |
| Customer Confirmation | Customer email | Successful signup |
| Admin Verification Alert | ADMIN_EMAIL | Verification attempt |
Features:
HTML email templates with professional styling
Automatic fallback between SES and SMTP on failure
Graceful degradation (logs error, doesn't block user flow)
iVALT API Integration
Endpoints Used:
| Endpoint | Purpose |
|----------|---------|
| POST /biometric-auth-request | Triggers push notification to iVALT mobile app |
| POST /biometric-auth-result | Polls authentication result |
| POST /biometric-geo-fence-auth-results | Geo-fence + time window validation (available) |
Status Code Mapping:
| iVALT HTTP | Internal Status | Meaning |
|------------|-----------------|---------|
| 200 | authenticated | User verified successfully |
| 404 | not_found | User not registered in iVALT |
| 422 | pending | Awaiting user response (keep polling) |
| 403 | failed | Rejected, token missing, or 5-min timeout |
Technical Stack
Layer	Technology
Framework	Next.js 16.2.6 (App Router, Turbopack)
React	19.2.6
Language	TypeScript
Styling	Tailwind CSS v4
Forms	React Hook Form 7 + Zod 4
Database ORM	Drizzle ORM 0.45.2
Database	PostgreSQL (Neon) or SQLite
Email	AWS SES / Nodemailer (SMTP)
Icons	Lucide React
Fonts	Inter (body), Source Serif 4 (headlines)
Key Components
Component	Location	Purpose
SignupClient	components/signup/signup-client.tsx	Signup page state management
SignupForm	components/signup/signup-form.tsx	Company registration form
VerificationClient	components/verification/verification-client.tsx	Verification flow orchestration
VerificationForm	components/verification/verification-form.tsx	IDCONNECTION + phone input
VerificationStatus	components/verification/verification-status.tsx	Live status display with polling
PhoneInput	components/ui/phone-input.tsx	Country code selector + phone validation
Data Validation
Zod Schemas
Customer Signup:
companyName: 2–255 chars
contactName: 2–255 chars
email: Valid email, max 320, lowercased
countryCode: + followed by 1–4 digits
mobile: 6–14 digits, no spaces/dashes
initialUsers: Integer, 1–100
notes: Optional string
Verification Request:
idConnection: 4–12 alphanumeric (auto-uppercased)
countryCode: + followed by 1–4 digits
mobile: 6–14 digits
requestFrom: Optional, max 128 chars
Phone Parsing
Uses libphonenumber-js for intelligent parsing
Extracts country code and national number from input
Supports international format with + prefix
Environment Configuration
Variable	Required	Description
DB_TYPE	No	neon (default) or sqlite
DATABASE_URL	Yes*	PostgreSQL connection string
SQLITE_DB_PATH	No	SQLite file path (default: ./local.db)
IVALT_API_KEY	Yes	iVALT API authentication
IVALT_API_BASE_URL	No	iVALT API base (default: https://api.ivalt.com)
EMAIL_FROM	Yes	Sender email address
ADMIN_EMAIL	No	Admin notification recipient
EMAIL_PROVIDER	No	ses (default) or smtp
AWS_REGION	No	AWS region for SES
AWS_ACCESS_KEY_ID	No	AWS credentials
AWS_SECRET_ACCESS_KEY	No	AWS credentials
SMTP_HOST	No	SMTP server host
SMTP_PORT	No	SMTP server port
SMTP_USER	No	SMTP username
SMTP_PASS	No	SMTP password
SMTP_SECURE	No	Use TLS (default: true)
Development & Deployment
Scripts
Script	Command	Purpose
Dev	pnpm dev	Start Next.js dev server with Turbopack
Build	pnpm build	Production build
Lint	pnpm lint	ESLint check
Format	pnpm format	Prettier formatting
DB Push	pnpm db:push	Push schema to database
DB Studio	pnpm db:studio	Drizzle Studio GUI
Project Structure
code
Code
src/
├── app/
│   ├── api/signup/route.ts          # Customer registration API
│   ├── api/verify/route.ts          # Verification trigger API
│   ├── api/status/[id]/route.ts     # Status polling API
│   ├── signup/page.tsx              # Signup page (Server Component)
│   ├── ondemand-id/page.tsx         # Verification page (Server Component)
│   ├── layout.tsx                   # Root layout (header + footer)
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Tailwind + theme variables
├── components/
│   ├── signup/                      # Signup form components
│   ├── verification/                # Verification flow components
│   └── ui/                          # Reusable UI primitives
├── lib/
│   ├── db/                          # Database client + dual schemas
│   ├── email/                       # Email transport + templates
│   ├── ivalt/                       # iVALT API client + types
│   ├── countryCodes.ts              # Country dialing codes
│   ├── utils.ts                     # cn() helper (clsx + tailwind-merge)
│   └── validation.ts              # Zod schemas
└── types/                           # Shared TypeScript types
Security & Compliance Features
Input Validation: All inputs validated with Zod on both client and server
SQL Injection Prevention: Drizzle ORM parameterized queries
Audit Trail: Every verification attempt logged with IP, user agent, timestamps
Email Notifications: Admin alerted on all signup and verification events
IDCONNECTION Validation: Only active, provisioned customers can trigger verifications
Phone Number Sanitization: Digits-only extraction before API calls
Error Isolation: iVALT/email failures don't block core user flow