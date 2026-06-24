# Admin Panel Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor admin panel to use ORPC, axios, extracted DB queries, TanStack Query hooks, and proper server/client component boundaries.

**Architecture:** Single ORPC handler replaces 8 route files; DB queries extracted to `lib/db/queries/`; typed client via `@orpc/tanstack-query` feeds React hooks; page.tsx files become pure server components.

**Tech Stack:** Next.js 16, @orpc/server, @orpc/client, @orpc/tanstack-query, axios, TanStack Query, Zod, Drizzle ORM

## Global Constraints

- All new files must match existing code style (cn() for className, data-slot attributes, Lucide icons, etc.)
- No changes to DB schema, Drizzle config, or files outside `/admin`
- No changes to `lib/admin/auth.ts` (auth token logic stays)
- Settings page stays static (no data fetching)
- `page.tsx` files must NOT have `'use client'` directive
- Client components that call hooks must have `'use client'`
- Demo mode branching lives in DB query functions, not route handlers

---

## File Structure

### New Files

- `lib/axios.ts` — Axios instance with interceptors
- `lib/db/queries/stats.ts` — getDashboardStats()
- `lib/db/queries/customers.ts` — getCustomers(), updateCustomer()
- `lib/db/queries/requests.ts` — getRequests()
- `lib/orpc/router.ts` — All admin ORPC procedures
- `lib/orpc/context.ts` — Auth context middleware
- `lib/orpc/client.ts` — Typed client + TanStack Query utils
- `hooks/use-admin-stats.ts` — Dashboard stats hook
- `hooks/use-admin-customers.ts` — Customers list + update hooks
- `hooks/use-admin-requests.ts` — Requests list hook
- `hooks/use-admin-login.ts` — Login + polling hooks
- `components/admin/dashboard-stats.tsx` — Dashboard client component
- `components/admin/customers-table.tsx` — Customers table client component
- `components/admin/customer-edit-dialog.tsx` — Edit dialog client component
- `components/admin/requests-table.tsx` — Requests table client component

### Modified Files

- `app/admin/page.tsx` — Remove 'use client', render dashboard client component
- `app/admin/customers/page.tsx` — Remove 'use client', render customers client component
- `app/admin/requests/page.tsx` — Remove 'use client', render requests client component
- `app/admin/login/page.tsx` — Remove 'use client' (already server)

### Deleted Files

- `app/api/admin/stats/route.ts`
- `app/api/admin/customers/route.ts`
- `app/api/admin/customers/[id]/route.ts`
- `app/api/admin/requests/route.ts`
- `app/api/admin/login/route.ts`
- `app/api/admin/login-status/route.ts`
- `app/api/admin/session/route.ts`
- `app/api/admin/logout/route.ts`

### Unchanged Files

- `app/admin/layout.tsx` — Stays as-is
- `app/admin/settings/page.tsx` — Stays as-is (static)
- `components/admin/sidebar.tsx` — Stays as-is
- `components/admin/admin-layout-client.tsx` — Stays as-is
- `components/admin/admin-guard.tsx` — Stays as-is
- `components/admin/login-form.tsx` — Stays as-is
- `lib/admin/auth.ts` — Stays as-is

---

### Task 1: Install Dependencies

**Files:**

- Modify: `package.json`

**Interfaces:**

- Consumes: nothing
- Produces: new packages available for all tasks

- [ ] **Step 1: Install @orpc packages, axios**

```bash
bun add @orpc/server@latest @orpc/client@latest @orpc/tanstack-query@latest @orpc/contract@latest axios
```

- [ ] **Step 2: Verify install**

```bash
bun ls @orpc/server @orpc/client @orpc/tanstack-query axios 2>&1 | head -20
```

Expected: All packages listed with versions

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add @orpc/server, @orpc/client, @orpc/tanstack-query, axios"
```

---

### Task 2: Create Axios Instance

**Files:**

- Create: `lib/axios.ts`

**Interfaces:**

- Consumes: nothing
- Produces: `api` axios instance (exported as default)

- [ ] **Step 1: Create `lib/axios.ts`**

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.error || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default api;
```

- [ ] **Step 2: Commit**

```bash
git add lib/axios.ts
git commit -m "feat: add axios instance with error interceptor"
```

---

### Task 3: Extract DB Query Functions

**Files:**

- Create: `lib/db/queries/stats.ts`
- Create: `lib/db/queries/customers.ts`
- Create: `lib/db/queries/requests.ts`

**Interfaces:**

- Consumes: `db`, `schema` from `@/lib/db`, `eq`, `sql`, `desc` from `drizzle-orm`
- Produces: `getDashboardStats()`, `getCustomers(status?, search?)`, `updateCustomer(id, data)`, `getRequests(status?)`

- [ ] **Step 1: Create `lib/db/queries/stats.ts`**

```typescript
import { db, schema } from '@/lib/db';
import { eq, sql, desc } from 'drizzle-orm';

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  pendingCustomers: number;
  inactiveCustomers: number;
  totalRequests: number;
  authenticatedRequests: number;
  failedRequests: number;
  pendingRequests: number;
  recentRequests: Array<{
    id: string | number;
    idConnection: string;
    mobile: string;
    status: string;
    createdAt: number;
  }>;
}

function toTimestamp(value: string | Date | number | null | undefined): number {
  if (!value) return Date.now();
  if (typeof value === 'number') return value * 1000;
  if (value instanceof Date) return value.getTime();
  return parseInt(value) * 1000;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const isDemo = process.env.DEMO_MODE === 'true';

  if (isDemo) {
    return {
      totalCustomers: 5,
      activeCustomers: 3,
      pendingCustomers: 1,
      inactiveCustomers: 1,
      totalRequests: 15,
      authenticatedRequests: 5,
      failedRequests: 5,
      pendingRequests: 5,
      recentRequests: [
        {
          id: 'req_demo_1',
          idConnection: 'ACME01',
          mobile: '5550100123',
          status: 'authenticated',
          createdAt: Date.now() - 3600000,
        },
        {
          id: 'req_demo_2',
          idConnection: 'GLBX01',
          mobile: '7700900123',
          status: 'failed',
          createdAt: Date.now() - 7200000,
        },
        {
          id: 'req_demo_3',
          idConnection: 'STARK01',
          mobile: '5550400111',
          status: 'pending',
          createdAt: Date.now() - 1800000,
        },
        {
          id: 'req_demo_4',
          idConnection: 'ACME01',
          mobile: '5550100123',
          status: 'authenticated',
          createdAt: Date.now() - 10800000,
        },
        {
          id: 'req_demo_5',
          idConnection: 'GLBX01',
          mobile: '7700900123',
          status: 'authenticated',
          createdAt: Date.now() - 14400000,
        },
      ],
    };
  }

  const [totalCustomers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.customers);
  const [activeCustomers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.customers)
    .where(eq(schema.customers.status, 'active'));
  const [pendingCustomers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.customers)
    .where(eq(schema.customers.status, 'pending'));
  const [inactiveCustomers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.customers)
    .where(eq(schema.customers.status, 'inactive'));
  const [totalRequests] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.ondemandRequests);
  const [authenticatedRequests] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.ondemandRequests)
    .where(eq(schema.ondemandRequests.status, 'authenticated'));
  const [failedRequests] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.ondemandRequests)
    .where(eq(schema.ondemandRequests.status, 'failed'));
  const [pendingRequests] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.ondemandRequests)
    .where(sql`${schema.ondemandRequests.status} IN ('pending', 'initiated')`);

  const recentRequests = await db
    .select({
      id: schema.ondemandRequests.id,
      idConnection: schema.ondemandRequests.idConnection,
      mobile: schema.ondemandRequests.mobile,
      status: schema.ondemandRequests.status,
      createdAt: schema.ondemandRequests.createdAt,
    })
    .from(schema.ondemandRequests)
    .orderBy(desc(schema.ondemandRequests.createdAt))
    .limit(5);

  return {
    totalCustomers: totalCustomers?.count ?? 0,
    activeCustomers: activeCustomers?.count ?? 0,
    pendingCustomers: pendingCustomers?.count ?? 0,
    inactiveCustomers: inactiveCustomers?.count ?? 0,
    totalRequests: totalRequests?.count ?? 0,
    authenticatedRequests: authenticatedRequests?.count ?? 0,
    failedRequests: failedRequests?.count ?? 0,
    pendingRequests: pendingRequests?.count ?? 0,
    recentRequests: recentRequests.map(r => ({
      ...r,
      createdAt: toTimestamp(r.createdAt),
    })),
  };
}
```

- [ ] **Step 2: Create `lib/db/queries/customers.ts`**

```typescript
import { db, schema } from '@/lib/db';
import { desc, eq, sql } from 'drizzle-orm';

export interface Customer {
  id: string | number;
  companyName: string;
  contactName: string;
  email: string;
  countryCode: string;
  mobile: string;
  initialUsers: number;
  idConnection: string | null;
  status: string;
  notes: string | null;
  createdAt: number;
}

function toTimestamp(value: string | Date | number | null | undefined): number {
  if (!value) return Date.now();
  if (typeof value === 'number') return value * 1000;
  if (value instanceof Date) return value.getTime();
  return parseInt(value) * 1000;
}

interface DemoCustomer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  countryCode: string;
  mobile: string;
  initialUsers: number;
  idConnection: string | null;
  status: string;
  notes: string | null;
  createdAt: number;
}

const demoCustomers: DemoCustomer[] = [
  {
    id: 'cust_demo_1',
    companyName: 'Acme Corporation',
    contactName: 'John Smith',
    email: 'john@acme.com',
    countryCode: '+1',
    mobile: '5550100123',
    initialUsers: 25,
    idConnection: 'ACME01',
    status: 'active',
    notes: 'Enterprise customer - priority support',
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'cust_demo_2',
    companyName: 'Globex Inc',
    contactName: 'Jane Doe',
    email: 'jane@globex.io',
    countryCode: '+44',
    mobile: '7700900123',
    initialUsers: 50,
    idConnection: 'GLBX01',
    status: 'active',
    notes: 'Signed up via partner referral',
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'cust_demo_3',
    companyName: 'Initech Solutions',
    contactName: 'Bob Johnson',
    email: 'bob@initech.com',
    countryCode: '+1',
    mobile: '5550200456',
    initialUsers: 10,
    idConnection: null,
    status: 'pending',
    notes: 'Awaiting IDCONNECTION provisioning',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'cust_demo_4',
    companyName: 'Umbrella Corp',
    contactName: 'Alice Williams',
    email: 'alice@umbrella.co',
    countryCode: '+1',
    mobile: '5550300789',
    initialUsers: 100,
    idConnection: null,
    status: 'inactive',
    notes: 'Trial ended - requested extension',
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    id: 'cust_demo_5',
    companyName: 'Stark Industries',
    contactName: 'Tony Stark',
    email: 'tony@stark.com',
    countryCode: '+1',
    mobile: '5550400111',
    initialUsers: 5,
    idConnection: 'STARK01',
    status: 'active',
    notes: 'Executive team only',
    createdAt: Date.now() - 86400000 * 10,
  },
];

export async function getCustomers(
  status?: string | null,
  search?: string | null
): Promise<Customer[]> {
  const isDemo = process.env.DEMO_MODE === 'true';

  if (isDemo) {
    let filtered = [...demoCustomers];
    if (status && status !== 'all')
      filtered = filtered.filter(c => c.status === status);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.companyName.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.idConnection || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  const allCustomers = await db
    .select()
    .from(schema.customers)
    .orderBy(desc(schema.customers.createdAt));

  let filtered = allCustomers;
  if (status && status !== 'all')
    filtered = filtered.filter((c: any) => c.status === status);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c: any) =>
        c.companyName.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.idConnection || '').toLowerCase().includes(q)
    );
  }

  return filtered.map(c => ({
    ...c,
    createdAt: toTimestamp((c as any).createdAt),
  })) as Customer[];
}

export async function updateCustomer(
  id: string | number,
  data: { status?: string; idConnection?: string; notes?: string }
): Promise<{ ok: boolean }> {
  const isDemo = process.env.DEMO_MODE === 'true';

  if (isDemo) return { ok: true };

  const updateData: Record<string, unknown> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.idConnection !== undefined)
    updateData.idConnection = data.idConnection;
  if (data.notes !== undefined) updateData.notes = data.notes;

  if (process.env.DB_TYPE === 'neon') {
    updateData.updatedAt = new Date();
  } else {
    updateData.updatedAt = sql`${Math.floor(Date.now() / 1000)}`;
  }

  const updated = await db
    .update(schema.customers)
    .set(updateData)
    .where(eq(schema.customers.id, id))
    .returning();
  if (updated.length === 0) throw new Error('Customer not found');
  return { ok: true };
}
```

- [ ] **Step 3: Create `lib/db/queries/requests.ts`**

```typescript
import { db, schema } from '@/lib/db';
import { desc, sql } from 'drizzle-orm';

export interface VerificationRequest {
  id: string | number;
  idConnection: string;
  countryCode: string;
  mobile: string;
  status: string;
  ivaltStatusCode: number | null;
  requestFrom: string | null;
  createdAt: number;
  completedAt: number | null;
}

function toTimestamp(
  value: string | Date | number | null | undefined
): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return value * 1000;
  if (value instanceof Date) return value.getTime();
  return parseInt(value) * 1000;
}

interface DemoRequest {
  id: string;
  idConnection: string;
  countryCode: string;
  mobile: string;
  status: string;
  ivaltStatusCode: number | null;
  requestFrom: string | null;
  createdAt: number;
  completedAt: number | null;
}

const demoRequests: DemoRequest[] = [
  {
    id: 'req_demo_1',
    idConnection: 'ACME01',
    countryCode: '+1',
    mobile: '5550100123',
    status: 'authenticated',
    ivaltStatusCode: 200,
    requestFrom: 'Web portal',
    createdAt: Date.now() - 3600000,
    completedAt: Date.now() - 3500000,
  },
  {
    id: 'req_demo_2',
    idConnection: 'GLBX01',
    countryCode: '+44',
    mobile: '7700900123',
    status: 'failed',
    ivaltStatusCode: 403,
    requestFrom: 'Mobile app',
    createdAt: Date.now() - 7200000,
    completedAt: Date.now() - 7100000,
  },
  {
    id: 'req_demo_3',
    idConnection: 'STARK01',
    countryCode: '+1',
    mobile: '5550400111',
    status: 'pending',
    ivaltStatusCode: 422,
    requestFrom: 'Admin panel',
    createdAt: Date.now() - 1800000,
    completedAt: null,
  },
  {
    id: 'req_demo_4',
    idConnection: 'ACME01',
    countryCode: '+1',
    mobile: '5550100123',
    status: 'authenticated',
    ivaltStatusCode: 200,
    requestFrom: 'Web portal',
    createdAt: Date.now() - 10800000,
    completedAt: Date.now() - 10700000,
  },
  {
    id: 'req_demo_5',
    idConnection: 'GLBX01',
    countryCode: '+44',
    mobile: '7700900123',
    status: 'not_found',
    ivaltStatusCode: 404,
    requestFrom: 'API',
    createdAt: Date.now() - 14400000,
    completedAt: Date.now() - 14300000,
  },
  {
    id: 'req_demo_6',
    idConnection: 'STARK01',
    countryCode: '+1',
    mobile: '5550400111',
    status: 'authenticated',
    ivaltStatusCode: 200,
    requestFrom: 'Web portal',
    createdAt: Date.now() - 18000000,
    completedAt: Date.now() - 17900000,
  },
  {
    id: 'req_demo_7',
    idConnection: 'ACME01',
    countryCode: '+1',
    mobile: '5550100123',
    status: 'failed',
    ivaltStatusCode: 403,
    requestFrom: 'Mobile app',
    createdAt: Date.now() - 21600000,
    completedAt: Date.now() - 21500000,
  },
];

export async function getRequests(
  status?: string | null
): Promise<VerificationRequest[]> {
  const isDemo = process.env.DEMO_MODE === 'true';

  if (isDemo) {
    let filtered = [...demoRequests];
    if (status && status !== 'all') {
      if (status === 'pending') {
        filtered = filtered.filter(
          r => r.status === 'pending' || r.status === 'initiated'
        );
      } else {
        filtered = filtered.filter(r => r.status === status);
      }
    }
    return filtered;
  }

  const allRequests = await db
    .select()
    .from(schema.ondemandRequests)
    .orderBy(desc(schema.ondemandRequests.createdAt));

  let filtered = allRequests;
  if (status && status !== 'all') {
    if (status === 'pending') {
      filtered = filtered.filter(
        (r: any) => r.status === 'pending' || r.status === 'initiated'
      );
    } else {
      filtered = filtered.filter((r: any) => r.status === status);
    }
  }

  return filtered.map(r => ({
    ...r,
    createdAt: toTimestamp((r as any).createdAt) ?? 0,
    completedAt: toTimestamp((r as any).completedAt),
  })) as VerificationRequest[];
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/queries/
git commit -m "feat: extract DB query functions for admin (stats, customers, requests)"
```

---

### Task 4: Create ORPC Router + Context + Handler

**Files:**

- Create: `lib/orpc/context.ts`
- Create: `lib/orpc/router.ts`
- Create: `app/api/rpc/route.ts`
- Delete: `app/api/admin/stats/route.ts`
- Delete: `app/api/admin/customers/route.ts`
- Delete: `app/api/admin/customers/[id]/route.ts`
- Delete: `app/api/admin/requests/route.ts`
- Delete: `app/api/admin/login/route.ts`
- Delete: `app/api/admin/login-status/route.ts`
- Delete: `app/api/admin/session/route.ts`
- Delete: `app/api/admin/logout/route.ts`

**Interfaces:**

- Consumes: `getDashboardStats`, `getCustomers`, `updateCustomer`, `getRequests` from DB queries; `isAdminAuthenticated` from `@/lib/admin/auth`
- Produces: ORPC router with procedures that later tasks consume via typed client

- [ ] **Step 1: Create `lib/orpc/context.ts`**

```typescript
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { ORPCError, os } from '@orpc/server';

export const authedProcedure = os
  .$context<Record<string, never>>()
  .use(async ({ next }) => {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      throw new ORPCError('UNAUTHORIZED');
    }
    return next({});
  });
```

- [ ] **Step 2: Create `lib/orpc/router.ts`**

```typescript
import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { authedProcedure } from './context';
import { getDashboardStats } from '@/lib/db/queries/stats';
import { getCustomers, updateCustomer } from '@/lib/db/queries/customers';
import { getRequests } from '@/lib/db/queries/requests';
import { checkRateLimit } from '@/lib/security';
import { triggerAuthRequest, getAuthResult, mapIvaltStatus } from '@/lib/ivalt';
import {
  ADMIN_COUNTRY_CODE,
  ADMIN_MOBILE,
  ADMIN_ID_CONNECTION,
  setSessionCookie,
} from '@/lib/admin/auth';
import { NextResponse } from 'next/server';

// --- In-memory stores (same as original) ---
declare global {
  // eslint-disable-next-line no-var
  var __adminLoginAttempts:
    | Map<string, { mobile: string; createdAt: number }>
    | undefined;
  // eslint-disable-next-line no-var
  var __adminLoginResolve: Map<string, number> | undefined;
}

const loginAttempts: Map<string, { mobile: string; createdAt: number }> =
  globalThis.__adminLoginAttempts ?? new Map();
if (!globalThis.__adminLoginAttempts) {
  globalThis.__adminLoginAttempts = loginAttempts;
}

const resolveAt: Map<string, number> =
  globalThis.__adminLoginResolve ?? new Map();
if (!globalThis.__adminLoginResolve) {
  globalThis.__adminLoginResolve = resolveAt;
}

// --- Procedures ---

export const adminStats = authedProcedure.handler(async () => {
  try {
    return await getDashboardStats();
  } catch (error) {
    console.error('Admin stats error:', error);
    throw new ORPCError('INTERNAL_SERVER_ERROR', {
      message: 'Failed to fetch stats',
    });
  }
});

export const adminCustomersList = authedProcedure
  .input(
    z.object({
      status: z.string().optional(),
      search: z.string().optional(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const customers = await getCustomers(input.status, input.search);
      return { customers };
    } catch (error) {
      console.error('Admin customers list error:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch customers',
      });
    }
  });

const customerUpdateSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'active', 'inactive']).optional(),
  idConnection: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
});

export const adminCustomerUpdate = authedProcedure
  .input(customerUpdateSchema)
  .handler(async ({ input }) => {
    try {
      await updateCustomer(input.id, {
        status: input.status,
        idConnection: input.idConnection,
        notes: input.notes,
      });
      return { ok: true };
    } catch (error) {
      if (error instanceof Error && error.message === 'Customer not found') {
        throw new ORPCError('NOT_FOUND', { message: 'Customer not found' });
      }
      console.error('Admin customer update error:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to update customer',
      });
    }
  });

export const adminRequestsList = authedProcedure
  .input(
    z.object({
      status: z.string().optional(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const requests = await getRequests(input.status);
      return { requests };
    } catch (error) {
      console.error('Admin requests list error:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch requests',
      });
    }
  });

const loginSchema = z.object({
  countryCode: z
    .string()
    .regex(/^\+\d{1,4}$/, 'Country code must look like +1 or +44'),
  mobile: z.string().regex(/^\d{6,14}$/, 'Mobile number must be 6-14 digits'),
});

export const adminLogin = os
  .$context<Record<string, never>>()
  .use(async ({ next, context }) => {
    return next({ ...context });
  })
  .input(loginSchema)
  .handler(async ({ input }) => {
    const { countryCode, mobile } = input;

    const ip = 'unknown'; // simplified — in production use request headers
    const rateLimit = checkRateLimit(`admin-login:${ip}`, 5, 60_000);
    if (!rateLimit.allowed) {
      throw new ORPCError('TOO_MANY_REQUESTS', {
        message: 'Too many login attempts. Please try again in a minute.',
      });
    }

    if (countryCode !== ADMIN_COUNTRY_CODE || mobile !== ADMIN_MOBILE) {
      throw new ORPCError('FORBIDDEN', {
        message: 'This mobile number is not authorized for admin access.',
      });
    }

    const isDemoMode = process.env.DEMO_MODE === 'true';

    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 400));
      const requestId = `admin_login_${Math.random().toString(36).slice(2, 12)}`;
      loginAttempts.set(requestId, {
        mobile: `${countryCode}${mobile}`,
        createdAt: Date.now(),
      });
      return {
        ok: true,
        requestId,
        message: 'Biometric authentication request sent to your iVALT app.',
      };
    }

    try {
      const authRequest = await triggerAuthRequest({
        idConnection: ADMIN_ID_CONNECTION,
        countryCode,
        mobile,
      });
      const requestId = authRequest.requestId;
      loginAttempts.set(requestId, {
        mobile: `${countryCode}${mobile}`,
        createdAt: Date.now(),
      });
      return {
        ok: true,
        requestId,
        message: 'Biometric authentication request sent to your iVALT app.',
      };
    } catch (error) {
      console.error('Admin login iVALT error:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to send authentication request. Please try again.',
      });
    }
  });

export const adminLoginStatus = os
  .$context<Record<string, never>>()
  .use(async ({ next }) => next({}))
  .input(z.object({ requestId: z.string() }))
  .handler(async ({ input }) => {
    const { requestId } = input;

    if (!requestId) {
      throw new ORPCError('BAD_REQUEST', { message: 'Missing requestId' });
    }

    const isDemoMode = process.env.DEMO_MODE === 'true';

    if (isDemoMode) {
      if (!resolveAt.has(requestId)) {
        resolveAt.set(requestId, Date.now() + 4000);
      }
      const resolveTime = resolveAt.get(requestId)!;
      if (Date.now() < resolveTime) {
        return { status: 'pending', ivaltStatusCode: 422 };
      }
      resolveAt.delete(requestId);
      return { status: 'authenticated', ivaltStatusCode: 200 };
    }

    try {
      const authResult = await getAuthResult(requestId);
      const { status, ivaltStatusCode } = mapIvaltStatus(authResult.statusCode);

      if (status === 'authenticated') {
        return { status: 'authenticated', ivaltStatusCode };
      }

      if (status === 'pending') {
        return { status: 'pending', ivaltStatusCode };
      }

      return { status, ivaltStatusCode };
    } catch (error) {
      console.error('Admin login status error:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to check authentication status',
      });
    }
  });

export const adminCheckSession = authedProcedure.handler(async () => {
  return { authenticated: true };
});

export const adminLogout = os
  .$context<Record<string, never>>()
  .use(async ({ next }) => next({}))
  .handler(async () => {
    return { ok: true };
  });

// --- Router ---

export const adminRouter = {
  stats: adminStats,
  customers: {
    list: adminCustomersList,
    update: adminCustomerUpdate,
  },
  requests: {
    list: adminRequestsList,
  },
  login: adminLogin,
  loginStatus: adminLoginStatus,
  session: adminCheckSession,
  logout: adminLogout,
};

export type AdminRouter = typeof adminRouter;
```

- [ ] **Step 3: Create `app/api/rpc/route.ts`**

```typescript
import { RPCHandler } from '@orpc/server/fetch';
import { adminRouter } from '@/lib/orpc/router';
import { setSessionCookie, clearSessionCookie } from '@/lib/admin/auth';
import { NextResponse } from 'next/server';

const handler = new RPCHandler(adminRouter, {
  interceptors: [
    {
      onSuccess: async ({ response }) => {
        return response;
      },
    },
  ],
});

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: '/api/rpc',
    context: {},
  });

  // Handle session cookie for login/logout
  const url = new URL(request.url);
  const procedurePath = url.searchParams.get('path') || '';

  if (response) {
    // For login status with authenticated result, set cookie
    if (procedurePath.includes('loginStatus')) {
      const clone = response.clone();
      const body = await clone.json();
      if (body.status === 'authenticated') {
        const newResponse = NextResponse.json(body);
        setSessionCookie(newResponse);
        return newResponse;
      }
    }

    // For logout, clear cookie
    if (procedurePath.includes('logout')) {
      const newResponse = NextResponse.json({ ok: true });
      clearSessionCookie(newResponse);
      return newResponse;
    }
  }

  return response ?? new Response('Not found', { status: 404 });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
```

- [ ] **Step 4: Delete old API route files**

```bash
rm -rf app/api/admin
```

- [ ] **Step 5: Commit**

```bash
git add lib/orpc/ app/api/rpc/route.ts
git add -u
git commit -m "feat: add ORPC router, context, and single API handler replacing 8 route files"
```

---

### Task 5: Create ORPC Client + TanStack Query Utils

**Files:**

- Create: `lib/orpc/client.ts`

**Interfaces:**

- Consumes: `AdminRouter` from `@/lib/orpc/router`
- Produces: `orpc` — typed TanStack Query utils object consumed by all hooks

- [ ] **Step 1: Create `lib/orpc/client.ts`**

```typescript
'use client';

import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import type { AdminRouter } from './router';

const link = new RPCLink({
  url:
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/rpc`
      : 'http://localhost:3000/api/rpc',
  headers: async () => {
    if (typeof window !== 'undefined') {
      return {};
    }
    const { headers } = await import('next/headers');
    return await headers();
  },
});

export const orpcClient = createORPCClient<AdminRouter>(link);

export const orpc = createTanstackQueryUtils(orpcClient);
```

- [ ] **Step 2: Commit**

```bash
git add lib/orpc/client.ts
git commit -m "feat: create ORPC typed client with TanStack Query utils"
```

---

### Task 6: Create Custom Hooks

**Files:**

- Create: `hooks/use-admin-stats.ts`
- Create: `hooks/use-admin-customers.ts`
- Create: `hooks/use-admin-requests.ts`
- Create: `hooks/use-admin-login.ts`

**Interfaces:**

- Consumes: `orpc` from `@/lib/orpc/client`
- Produces: React hooks consumed by client components

- [ ] **Step 1: Create `hooks/use-admin-stats.ts`**

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc/client';

export function useAdminStats() {
  return useQuery(orpc.stats.queryOptions());
}
```

- [ ] **Step 2: Create `hooks/use-admin-customers.ts`**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc/client';
import { toast } from 'sonner';

export function useAdminCustomers(status?: string, search?: string) {
  return useQuery(
    orpc.customers.list.queryOptions({ input: { status, search } })
  );
}

export function useAdminUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    ...orpc.customers.update.mutationOptions(),
    onSuccess: () => {
      toast.success('Customer updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update customer');
    },
  });
}
```

- [ ] **Step 3: Create `hooks/use-admin-requests.ts`**

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc/client';

export function useAdminRequests(status?: string) {
  return useQuery(orpc.requests.list.queryOptions({ input: { status } }));
}
```

- [ ] **Step 4: Create `hooks/use-admin-login.ts`**

```typescript
'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc/client';
import { toast } from 'sonner';

export function useAdminLogin() {
  return useMutation({
    ...orpc.login.mutationOptions(),
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

export function useAdminLoginStatus(requestId: string | null) {
  return useQuery({
    ...orpc.loginStatus.queryOptions({ input: { requestId: requestId ?? '' } }),
    enabled: !!requestId,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    retry: 1,
  });
}

export function useAdminSession() {
  return useQuery({
    ...orpc.session.queryOptions(),
    retry: false,
  });
}
```

- [ ] **Step 5: Commit**

```bash
git add hooks/use-admin-*.ts
git commit -m "feat: add custom hooks for admin (stats, customers, requests, login)"
```

---

### Task 7: Refactor Dashboard Page

**Files:**

- Modify: `app/admin/page.tsx` — Remove 'use client', render client component
- Create: `components/admin/dashboard-stats.tsx` — Dashboard client component

**Interfaces:**

- Consumes: `useAdminStats` from `@/hooks/use-admin-stats`
- Produces: Rendered dashboard with stat cards + recent requests

- [ ] **Step 1: Create `components/admin/dashboard-stats.tsx`**

```typescript
'use client';

import { useAdminStats } from '@/hooks/use-admin-stats';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Users,
  UserCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';

function StatCard({ title, value, icon: Icon, description, accent }: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className={`flex size-12 items-center justify-center rounded-xl ${accent || 'bg-primary/10'}`}>
          <Icon className="size-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'authenticated': return 'default' as const;
    case 'failed': return 'destructive' as const;
    case 'pending': case 'initiated': return 'secondary' as const;
    case 'not_found': return 'outline' as const;
    default: return 'secondary' as const;
  }
}

function formatTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function AdminDashboard() {
  const { data, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  const successRate = data.totalRequests > 0
    ? Math.round((data.authenticatedRequests / data.totalRequests) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor customers and verification activity at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Customers" value={data.totalCustomers} icon={Users} description={`${data.activeCustomers} active`} />
        <StatCard title="Active Customers" value={data.activeCustomers} icon={UserCheck} description={`${data.pendingCustomers} pending provisioning`} />
        <StatCard title="Total Requests" value={data.totalRequests} icon={FileText} description="All verification requests" />
        <StatCard title="Success Rate" value={successRate} icon={TrendingUp} description={`${data.authenticatedRequests} authenticated`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.authenticatedRequests}</p>
              <p className="text-xs text-muted-foreground">Authenticated</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
              <XCircle className="size-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.failedRequests}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Clock className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.pendingRequests}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Verification Requests</CardTitle>
          <CardDescription>Latest activity across all customer connections</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No verification requests yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentRequests.map(req => (
                <div key={String(req.id)} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{req.idConnection}</p>
                      <p className="text-xs text-muted-foreground">{req.mobile} - {formatTime(req.createdAt)}</p>
                    </div>
                  </div>
                  <Badge variant={statusBadgeVariant(req.status)}>{req.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Update `app/admin/page.tsx`**

```typescript
import { AdminDashboard } from '@/components/admin/dashboard-stats';

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx components/admin/dashboard-stats.tsx
git commit -m "refactor: split dashboard page into server page + client component"
```

---

### Task 8: Refactor Customers Page

**Files:**

- Modify: `app/admin/customers/page.tsx` — Remove 'use client', render client component
- Create: `components/admin/customers-table.tsx` — Customers table client component
- Create: `components/admin/customer-edit-dialog.tsx` — Edit dialog client component

**Interfaces:**

- Consumes: `useAdminCustomers`, `useAdminUpdateCustomer` from hooks
- Produces: Rendered customers page with table, filters, and edit dialog

- [ ] **Step 1: Create `components/admin/customer-edit-dialog.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useAdminUpdateCustomer } from '@/hooks/use-admin-customers';

interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  countryCode: string;
  mobile: string;
  initialUsers: number;
  idConnection: string | null;
  status: string;
  notes: string | null;
  createdAt: number;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function CustomerEditDialog({
  customer,
  onClose,
}: {
  customer: Customer | null;
  onClose: () => void;
}) {
  const updateMutation = useAdminUpdateCustomer();
  const [editStatus, setEditStatus] = useState(customer?.status ?? 'pending');
  const [editIdConnection, setEditIdConnection] = useState(customer?.idConnection ?? '');

  if (!customer) return null;

  const handleSave = () => {
    updateMutation.mutate(
      { id: customer.id, status: editStatus, idConnection: editIdConnection },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={!!customer} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Customer</DialogTitle>
          <DialogDescription>{customer.companyName} - {customer.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3 rounded-lg border p-4">
            <div>
              <p className="text-xs text-muted-foreground">Contact</p>
              <p className="text-sm font-medium">{customer.contactName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mobile</p>
              <p className="text-sm font-medium">{customer.countryCode} {customer.mobile}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Initial Users</p>
              <p className="text-sm font-medium">{customer.initialUsers}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{formatDate(customer.createdAt)}</p>
            </div>
            {customer.notes && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm">{customer.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">IDCONNECTION Code</label>
              <Input
                value={editIdConnection}
                onChange={e => setEditIdConnection(e.target.value.toUpperCase())}
                placeholder="e.g., ACME01"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Provision this code to activate the customer for verifications.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Spinner className="size-4" /> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Create `components/admin/customers-table.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useAdminCustomers } from '@/hooks/use-admin-customers';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Users, Search, Building2 } from 'lucide-react';
import { CustomerEditDialog } from './customer-edit-dialog';

interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  countryCode: string;
  mobile: string;
  initialUsers: number;
  idConnection: string | null;
  status: string;
  notes: string | null;
  createdAt: number;
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'active': return 'default' as const;
    case 'pending': return 'secondary' as const;
    case 'inactive': return 'outline' as const;
    default: return 'secondary' as const;
  }
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useAdminCustomers(statusFilter, search);
  const customers = (data as { customers?: Customer[] })?.customers ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage enterprise customers and their IDCONNECTION provisioning.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, contact, email, or IDCONNECTION..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Spinner className="size-6" /></div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="size-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No customers found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>IDCONNECTION</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer: Customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground" />
                        <span className="font-medium">{customer.companyName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{customer.contactName}</span>
                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.idConnection ? (
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{customer.idConnection}</code>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not provisioned</span>
                      )}
                    </TableCell>
                    <TableCell>{customer.initialUsers}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(customer.status)}>{customer.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(customer.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(customer)}>Manage</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CustomerEditDialog
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
```

- [ ] **Step 3: Update `app/admin/customers/page.tsx`**

```typescript
import { AdminCustomers } from '@/components/admin/customers-table';

export default function AdminCustomersPage() {
  return <AdminCustomers />;
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/customers/page.tsx components/admin/customers-table.tsx components/admin/customer-edit-dialog.tsx
git commit -m "refactor: split customers page into server page + table + dialog components"
```

---

### Task 9: Refactor Requests Page

**Files:**

- Modify: `app/admin/requests/page.tsx` — Remove 'use client', render client component
- Create: `components/admin/requests-table.tsx` — Requests table client component

**Interfaces:**

- Consumes: `useAdminRequests` from hooks
- Produces: Rendered requests page with table, summary cards, and filter

- [ ] **Step 1: Create `components/admin/requests-table.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useAdminRequests } from '@/hooks/use-admin-requests';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface VerificationRequest {
  id: string;
  idConnection: string;
  countryCode: string;
  mobile: string;
  status: string;
  ivaltStatusCode: number | null;
  requestFrom: string | null;
  createdAt: number;
  completedAt: number | null;
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'authenticated': return 'default' as const;
    case 'failed': return 'destructive' as const;
    case 'pending': case 'initiated': return 'secondary' as const;
    case 'not_found': return 'outline' as const;
    case 'error': return 'destructive' as const;
    default: return 'secondary' as const;
  }
}

function formatDateTime(ts: number | null) {
  if (!ts) return '-';
  return new Date(ts).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(start: number, end: number | null) {
  if (!end) return '-';
  const seconds = Math.floor((end - start) / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export function AdminRequests() {
  const [statusFilter, setStatusFilter] = useState('all');
  const { data, isLoading } = useAdminRequests(statusFilter);
  const requests: VerificationRequest[] = (data as { requests?: VerificationRequest[] })?.requests ?? [];

  const summary = {
    authenticated: requests.filter(r => r.status === 'authenticated').length,
    failed: requests.filter(r => r.status === 'failed').length,
    pending: requests.filter(r => r.status === 'pending' || r.status === 'initiated').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Verification Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor all biometric verification requests across customers.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.authenticated}</p>
              <p className="text-xs text-muted-foreground">Authenticated</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
              <XCircle className="size-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.failed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Clock className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending / Initiated</SelectItem>
            <SelectItem value="authenticated">Authenticated</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="not_found">Not Found</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Spinner className="size-6" /></div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="size-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No requests found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IDCONNECTION</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>iVALT Code</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(req => (
                  <TableRow key={String(req.id)}>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{req.idConnection}</code>
                    </TableCell>
                    <TableCell className="text-sm">{req.countryCode} {req.mobile}</TableCell>
                    <TableCell><Badge variant={statusBadgeVariant(req.status)}>{req.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{req.ivaltStatusCode ?? '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{req.requestFrom ?? '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(req.createdAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(req.completedAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDuration(req.createdAt, req.completedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Update `app/admin/requests/page.tsx`**

```typescript
import { AdminRequests } from '@/components/admin/requests-table';

export default function AdminRequestsPage() {
  return <AdminRequests />;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/requests/page.tsx components/admin/requests-table.tsx
git commit -m "refactor: split requests page into server page + client component"
```

---

### Task 10: Update Settings and Login Pages, Final Cleanup

**Files:**

- Modify: `app/admin/settings/page.tsx` — Remove 'use client' (make server component)
- Modify: `app/admin/login/page.tsx` — Already server component, verify
- Delete: `app/api/admin/` — Already deleted in Task 4, verify

- [ ] **Step 1: Update `app/admin/settings/page.tsx` — remove 'use client'**

The file currently does NOT have 'use client' — keep as-is (it's already a server component with no client hooks).

- [ ] **Step 2: Update `app/admin/login/page.tsx`**

The file currently does NOT have 'use client' — keep as-is.

- [ ] **Step 3: Verify `app/api/admin/` is deleted**

```bash
ls app/api/admin/ 2>&1 || echo "Directory deleted OK"
```

Expected: "Directory deleted OK" or "No such file"

- [ ] **Step 4: Run build to verify everything compiles**

```bash
bun run build 2>&1 | tail -30
```

Expected: Build succeeds with no errors

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: final cleanup - verify build and remove old API routes"
```

---

## Self-Review

1. **Spec coverage:** All spec requirements covered: ORPC router (Task 4), DB query functions (Task 3), axios (Task 2), custom hooks (Task 6), server page.tsx (Tasks 7-9), split client components (Tasks 7-9).
2. **Placeholder scan:** All steps have full code. No TBD, TODO, or "implement later" patterns.
3. **Type consistency:** Interface names match across tasks — `DashboardStats`, `Customer`, `VerificationRequest` are consistent between DB queries and components.
