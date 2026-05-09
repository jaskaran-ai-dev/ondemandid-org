# iVALT OnDemand ID — Agent Context

## Project Overview

iVALT OnDemand ID is a Next.js 16 enterprise SaaS application for password-free identity verification. It lets organizations verify users through biometric authentication (face/fingerprint) delivered via secure push notifications to the iVALT mobile app.

**Key Features:**
- Customer signup with trial provisioning
- On-demand biometric identity verification
- Real-time status polling for verification flows
- Dual database support (PostgreSQL via Neon / SQLite)
- Email notifications via AWS SES or SMTP fallback
- Demo mode toggle for safe development

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 6 |
| Styling | Tailwind CSS 4 + tw-animate-css |
| UI Components | Radix UI primitives + custom shadcn-style components |
| State Management | React Query (TanStack Query) |
| Forms | React Hook Form + Zod validation |
| Database | Drizzle ORM with dual support (PostgreSQL / SQLite) |
| Email | AWS SES with Nodemailer SMTP fallback |
| Icons | Lucide React |
| Fonts | Inter (sans), Source Serif 4 (serif), Bespoke Stencil (accent) |

### Project Structure

```
ondemandid-org/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── signup/        # POST /api/signup - Customer registration
│   │   ├── verify/        # POST /api/verify - Initiate biometric check
│   │   └── status/[id]/   # GET /api/status/:id - Poll verification status
│   ├── globals.css        # Global styles, design tokens, animations
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   ├── signup/            # Signup page
│   └── ondemand-id/       # Verification page
├── components/
│   ├── ui/                # Reusable UI components (Button, Input, etc.)
│   ├── landing/           # Landing page sections (Hero, Features, etc.)
│   ├── signup/            # Signup form components
│   ├── verification/      # Verification form components
│   ├── site-header.tsx    # Navigation header with theme-aware logo
│   ├── site-footer.tsx    # Footer with theme-aware logo
│   ├── theme-provider-custom.tsx  # Custom theme context (replaces next-themes)
│   └── query-provider.tsx  # React Query provider
├── hooks/
│   ├── use-api.ts         # React Query hooks for API calls
│   ├── use-mobile.ts      # Mobile detection hook
│   ├── use-reveal.ts      # IntersectionObserver scroll reveal
│   └── use-toast.ts       # Toast notification helpers
├── lib/
│   ├── db/                # Drizzle ORM database layer
│   │   ├── index.ts       # Database client initialization
│   │   ├── schema.pg.ts   # PostgreSQL schema
│   │   └── schema.sqlite.ts # SQLite schema
│   ├── email/             # Email system
│   │   ├── transport.ts   # Email transport setup
│   │   ├── send.ts        # Email sending functions
│   │   └── templates/     # HTML email templates
│   ├── ivalt/             # iVALT API client
│   │   ├── client.ts      # API functions
│   │   ├── types.ts       # TypeScript interfaces
│   │   └── index.ts       # Barrel export
│   ├── country-codes.ts   # Country dialing codes data
│   ├── utils.ts           # cn() helper (clsx + tailwind-merge)
│   ├── validation.ts      # Zod schemas for forms
│   └── sim-store.ts       # In-memory store for demo mode
├── docs/
│   ├── PRD.md             # Technical PRD
│   └── PRD-CUSTOMER.md    # Customer-facing PRD
├── DESIGN.md              # Design system documentation
├── public/                # Static assets
│   ├── logo-light.png     # iVALT logo (light mode)
│   └── logo-dark.webp     # iVALT logo (dark mode)
├── .env.example           # Environment variable template
├── drizzle.config.ts      # Drizzle Kit configuration
└── next.config.mjs        # Next.js config (unoptimized images, ignore TS errors)
```

---

## Key Conventions

### Components

1. **UI Components** use `data-slot` attributes for styling hooks:
   ```tsx
   <input data-slot="input" className={cn(...)} />
   ```

2. **Client Components** must include `"use client"` directive when using:
   - React hooks (useState, useEffect, etc.)
   - Context consumers (useTheme)
   - Browser APIs (localStorage, matchMedia)

3. **Icon imports** use Lucide React:
   ```tsx
   import { ShieldCheck, ArrowRight } from "lucide-react"
   ```

### Styling

1. **Tailwind classes** are merged with `cn()` utility:
   ```tsx
   className={cn("base-classes", conditional && "conditional-classes", className)}
   ```

2. **Color tokens** use CSS variables mapped through `@theme inline`:
   - `bg-primary`, `text-primary-foreground`
   - `border-border`, `bg-background`
   - Never hardcode colors; always use tokens

3. **Dark mode** is class-based (`.dark` on `<html>`), managed by custom `CustomThemeProvider`

### Forms

1. **Validation** uses Zod schemas in `lib/validation.ts`
2. **Form handling** uses React Hook Form with ZodResolver
3. **Submission** uses React Query mutations from `hooks/use-api.ts`

### API Routes

1. **Always validate** with Zod before processing
2. **Demo mode** check: `if (process.env.DEMO_MODE === "true")` uses simulated responses
3. **Error responses** follow pattern: `{ error: string, status?: string }`
4. **Success responses** follow pattern: `{ ok: true, ...data }`

---

## Database Schema

### Tables (both PostgreSQL and SQLite)

**customers**
- `id`: auto-increment primary key
- `companyName`: string, required
- `contactName`: string, required
- `email`: string, unique, required
- `countryCode`: string (e.g., "+1")
- `mobile`: string
- `initialUsers`: integer
- `notes`: text, optional
- `createdAt`: timestamp

**ondemandRequests**
- `id`: auto-increment primary key
- `requestId`: string, unique (external iVALT request ID)
- `customerId`: foreign key to customers
- `idConnection`: string (customer's iVALT connection ID)
- `countryCode`: string
- `mobile`: string
- `status`: enum (pending, authenticated, failed, not_found)
- `ivaltStatusCode`: integer
- `createdAt`: timestamp
- `updatedAt`: timestamp

---

## Environment Variables

Required variables (see `.env.example` for full list):

| Variable | Purpose |
|----------|---------|
| `DB_TYPE` | `postgres` or `sqlite` |
| `DATABASE_URL` | PostgreSQL connection string |
| `SQLITE_DB_PATH` | SQLite file path |
| `DEMO_MODE` | `true` to enable simulation mode |
| `IVALT_API_KEY` | iVALT API authentication |
| `IVALT_API_BASE_URL` | iVALT API endpoint |
| `EMAIL_PROVIDER` | `ses` or `smtp` |
| `ADMIN_EMAIL` | Admin notification recipient |
| `EMAIL_FROM` | Sender address |

---

## Critical Implementation Notes

### Theme System

We use a **custom theme provider** (`components/theme-provider-custom.tsx`) instead of `next-themes` to avoid script tag injection errors in Next.js 16:

- Custom `CustomThemeProvider` with localStorage persistence
- `useTheme()` hook exported from same file
- System preference detection via `matchMedia('(prefers-color-scheme: dark)')`
- Storage key: `ivalt-theme`
- Components using theme must be client components (`"use client"`)

### iVALT Integration

The iVALT API client (`lib/ivalt/`) handles:
- Triggering push notifications for biometric verification
- Polling for authentication results
- Status code mapping (200 success, 403 denied, 404 not found, 422 pending)

### Demo Mode

When `DEMO_MODE=true`:
- API routes skip database operations and iVALT calls
- Simulated responses mimic real API behavior
- In-memory `simRequests` store tracks fake request state
- Perfect for frontend development without backend dependencies

### Email System

- Primary: AWS SES via `@aws-sdk/client-ses`
- Fallback: SMTP via Nodemailer if SES fails/unconfigured
- Templates: HTML files in `lib/email/templates/`
- Sent on: signup completion, verification attempts

### Database

- **PostgreSQL**: For production (Neon recommended)
- **SQLite**: For local development
- Switch via `DB_TYPE` env var
- Drizzle Kit commands: `db:push`, `db:studio`, `db:generate`

---

## Development Workflow

### Available Commands

```bash
pnpm dev          # Start development server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint check
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
pnpm db:generate  # Generate migration files
```

### Adding New UI Components

1. Create file in `components/ui/`
2. Use `cn()` for className merging
3. Add `data-slot` attribute for styling hooks
4. Export from barrel if needed
5. Follow existing patterns for variants (use `cva` for complex variants)

### Adding New API Routes

1. Create route in `app/api/[route]/route.ts`
2. Validate input with Zod schemas from `lib/validation.ts`
3. Check `DEMO_MODE` for simulated responses
4. Return consistent error/success response shapes
5. Add React Query hook in `hooks/use-api.ts`

---

## Files to Never Modify

- `next-env.d.ts` — Auto-generated by Next.js
- `tsconfig.tsbuildinfo` — Build cache
- `.next/` — Build output directory
- `pnpm-lock.yaml` — Only modify via `pnpm add/remove`

---

## Common Pitfalls

1. **Server vs Client**: Components using `useTheme()` must be client components. Add `"use client"` directive.
2. **Image Optimization**: `images.unoptimized: true` in next.config.mjs means Next.js Image doesn't optimize — fine for dev, review for production.
3. **TypeScript Build Errors**: Configured to ignore during build (`ignoreBuildErrors: true`) — still fix lint errors for code quality.
4. **CSS @import Order**: External font imports must precede Tailwind imports in `globals.css`.
5. **Database Schema Changes**: Update BOTH `schema.pg.ts` and `schema.sqlite.ts` when modifying tables.

---

## External Resources

- **iVALT API Docs**: Refer to iVALT developer documentation for endpoint details
- **Drizzle ORM**: https://orm.drizzle.team/
- **Tailwind CSS**: https://tailwindcss.com/docs/
- **Radix UI**: https://www.radix-ui.com/
- **React Query**: https://tanstack.com/query/latest/
