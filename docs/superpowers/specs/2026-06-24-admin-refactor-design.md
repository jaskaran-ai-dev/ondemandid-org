# Admin Panel Refactor — Design Spec

## Goal

Refactor the existing admin panel to use ORPC (`@orpc/server`) for typed RPC, axios for HTTP, TanStack Query for frontend state, extracted DB query functions, and proper server/client component boundaries.

## Architecture

### 1. ORPC Layer (`lib/orpc/`)

- `router.ts` — All admin procedures defined as typed ORPC procedures with Zod input validation
- `context.ts` — Auth context middleware (checks admin session cookie)
- `client.ts` — Typed client created via `createORPCClient` + `RPCLink`

The ORPC router is served by a single `app/api/rpc/route.ts` that handles all methods (GET, POST, PATCH, DELETE), replacing the 8 individual admin route files.

### 2. DB Query Functions (`lib/db/queries/`)

Each file exports pure async functions that take query params and return typed results:

- `customers.ts` — `getCustomers(status?, search?)`, `updateCustomer(id, data)`
- `requests.ts` — `getRequests(status?)`
- `stats.ts` — `getDashboardStats()`

Demo mode branching lives here instead of in route handlers.

### 3. Axios Instance (`lib/axios.ts`)

- Single axios instance with `baseURL: ''`
- Response interceptor for error normalization
- Request interceptor for CSRF if needed

### 4. Custom Hooks (`hooks/`)

Each hook uses `orpc.tanstackQueryUtils` from `@orpc/tanstack-query`:

- `use-admin-stats.ts` — `useQuery(orpc.admin.stats.queryOptions())`
- `use-admin-customers.ts` — `useQuery(orpc.admin.customers.list.queryOptions(...))`
- `use-admin-customers.ts` — `useMutation(orpc.admin.customers.update.mutationOptions())`
- `use-admin-requests.ts` — `useQuery(orpc.admin.requests.list.queryOptions(...))`
- `use-admin-login.ts` — `useMutation(orpc.admin.login.mutationOptions())`
- `use-admin-login.ts` — `useQuery` for polling login status

### 5. Pages (`app/admin/**/page.tsx`)

All become pure server components (no `'use client'`). They import and render client component shells.

- `app/admin/page.tsx` — Renders `<AdminDashboard />`
- `app/admin/customers/page.tsx` — Renders `<AdminCustomers />`
- `app/admin/requests/page.tsx` — Renders `<AdminRequests />`
- `app/admin/settings/page.tsx` — Stays server (static content)
- `app/admin/login/page.tsx` — Renders `<AdminLoginForm />`
- `app/admin/layout.tsx` — Wraps with `AdminLayoutClient` (unchanged)

### 6. Client Components (`components/admin/`)

Split into focused components:

- `dashboard-stats.tsx` — Stat cards grid + recent requests table (calls `useAdminStats()`)
- `customers-table.tsx` — Table with search/filter, inline loading/empty states
- `customer-edit-dialog.tsx` — Dialog form for editing customer status/IDCONNECTION
- `requests-table.tsx` — Table with status filter + summary cards
- `login-form.tsx` — Login form with polling (unchanged, but uses axios)

Kept as-is (already well-structured):

- `sidebar.tsx`
- `admin-layout-client.tsx`
- `admin-guard.tsx`

## New Dependencies

- `@orpc/server` — ORPC server framework
- `@orpc/client` — ORPC client
- `@orpc/tanstack-query` — TanStack Query integration
- `@orpc/contract` — Contract types (if needed)
- `axios` — HTTP client

## Deleted Files

- `app/api/admin/*/route.ts` — All 8 route files replaced by single ORPC handler
- `app/admin/page.tsx` — Rewritten as server component
- `app/admin/customers/page.tsx` — Rewritten as server component
- `app/admin/requests/page.tsx` — Rewritten as server component
- `app/admin/settings/page.tsx` — Rewritten as server component (minor change)

## Non-Goals

- No changes to login, session, or auth logic
- No changes to DB schema or Drizzle configuration
- No changes to existing components outside `/admin`
- No changes to `lib/admin/auth.ts` (auth token logic stays)
- Settings page stays static (no data fetching)
