# iVALT OnDemand ID

Password-free identity verification for the enterprise. Verify users in seconds through biometric authentication (face and fingerprint) delivered as secure push notifications to the iVALT mobile app.

![iVALT OnDemand ID](public/logo-light.png)

## Features

- **On-Demand Verification** — Trigger biometric checks instantly via secure push notifications
- **Dual Biometric Support** — Face recognition and fingerprint authentication
- **Enterprise Dashboard** — Monitor verification status in real-time
- **Trial Provisioning** — Self-service signup with up to 100 trial users
- **Multi-Database** — PostgreSQL for production, SQLite for local development
- **Email Notifications** — AWS SES with SMTP fallback for reliability
- **Demo Mode** — Safe development without real API dependencies
- **Dark Mode** — Full light/dark theme support with system preference detection

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 6 |
| Styling | Tailwind CSS 4 |
| UI | Radix UI primitives |
| State | React Query (TanStack Query) |
| Forms | React Hook Form + Zod |
| Database | Drizzle ORM (PostgreSQL / SQLite) |
| Email | AWS SES + Nodemailer |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended)
- PostgreSQL database (for production) or SQLite (for local dev)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ondemandid-org

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_TYPE` | Yes | `postgres` or `sqlite` |
| `DATABASE_URL` | If postgres | PostgreSQL connection string |
| `SQLITE_DB_PATH` | If sqlite | SQLite file path (e.g., `./local.db`) |
| `DEMO_MODE` | No | `true` to enable simulation mode |
| `IVALT_API_KEY` | No* | iVALT API authentication |
| `IVALT_API_BASE_URL` | No* | iVALT API endpoint |
| `EMAIL_PROVIDER` | No | `ses` or `smtp` |
| `ADMIN_EMAIL` | No | Admin notification recipient |
| `EMAIL_FROM` | No | Sender email address |

\* Required for production biometric verification

### Available Scripts

```bash
pnpm dev          # Start development server (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
pnpm db:generate  # Generate migration files
```

## Project Structure

```
ondemandid-org/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (signup, verify, status)
│   ├── globals.css        # Global styles & design tokens
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   ├── signup/            # Signup page
│   └── ondemand-id/       # Verification page
├── components/
│   ├── ui/                # Reusable UI components
│   ├── landing/           # Landing page sections
│   ├── signup/            # Signup form components
│   ├── verification/      # Verification form components
│   ├── site-header.tsx    # Navigation header
│   ├── site-footer.tsx    # Footer
│   └── theme-provider-custom.tsx  # Theme context
├── hooks/                 # Custom React hooks
├── lib/
│   ├── db/                # Drizzle ORM database layer
│   ├── email/             # Email system
│   ├── ivalt/             # iVALT API client
│   ├── utils.ts           # cn() helper
│   └── validation.ts      # Zod schemas
├── docs/                  # Documentation
│   ├── PRD.md             # Technical PRD
│   ├── PRD-CUSTOMER.md    # Customer-facing PRD
│   └── DESIGN.md          # Design system
├── public/                # Static assets (logos)
└── next.config.mjs        # Next.js configuration
```

## Database Schema

### customers

| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PK, auto-increment |
| companyName | string | required |
| contactName | string | required |
| email | string | unique, required |
| countryCode | string | e.g., "+1" |
| mobile | string | required |
| initialUsers | integer | required |
| notes | text | optional |
| createdAt | timestamp | auto |

### ondemandRequests

| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PK, auto-increment |
| requestId | string | unique |
| customerId | integer | FK → customers |
| idConnection | string | required |
| countryCode | string | required |
| mobile | string | required |
| status | enum | pending / authenticated / failed / not_found |
| ivaltStatusCode | integer | |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signup` | Customer registration |
| POST | `/api/verify` | Initiate biometric check |
| GET | `/api/status/[id]` | Poll verification status |

## Demo Mode

Enable `DEMO_MODE=true` in your `.env.local` to run without:
- Real database connections
- iVALT API calls
- Email service dependencies

Simulated responses mimic real API behavior for safe frontend development.

## Design System

See [DESIGN.md](DESIGN.md) for comprehensive design system documentation including:
- Color tokens and semantic palette
- Typography scale (Inter, Source Serif 4, Bespoke Stencil)
- Spacing, border radius, and layout conventions
- Component patterns and animation system
- Accessibility guidelines

## Contributing

1. Follow existing component patterns and conventions
2. Use `cn()` for Tailwind class merging
3. Add `"use client"` for components using React hooks
4. Validate all API inputs with Zod schemas
5. Update both PostgreSQL and SQLite schemas when changing database structure

## License

© iVALT, Inc. All rights reserved.

---

Built with Next.js 16, Tailwind CSS, and Drizzle ORM.
