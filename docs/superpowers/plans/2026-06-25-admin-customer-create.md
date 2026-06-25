# Admin Customer Create Dialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an authenticated admin dialog on `/admin/customers` that creates a new customer record with the same fields as the public signup plus status and optional IDCONNECTION.

**Architecture:** A new ORPC `customers.create` procedure (backed by a `createCustomer` DB query) is consumed by a new TanStack Query mutation hook. The hook is used by a new `CustomerCreateDialog` client component, which is triggered from the filters row of the existing `CustomersTable`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, Tailwind CSS 4, Radix/shadcn UI, React Hook Form + Zod, TanStack Query, oRPC, Drizzle ORM, Bun test runner.

## Global Constraints

- Only authenticated admins can create customers (use `authedProcedure`).
- No signup emails are sent when an admin creates a customer.
- Demo mode must work by appending to the in-memory demo list.
- Follow existing code patterns in `components/admin/customers-table.tsx`, `lib/db/queries/customers.ts`, and `lib/validation.ts`.
- Use the project's UI components (`Button`, `Input`, `PhoneInput`, `Select`, `Textarea`, `Dialog`, `Label`, `Spinner`).
- Use Lucide React icons and HugeIcons where existing forms do.
- Every task ends with a test or verification step and a commit.

---

## Task 1: Add admin customer create validation schema

**Files:**
- Modify: `lib/validation.ts`
- Create: `tests/lib/validation.test.ts`

**Interfaces:**
- Produces: `adminCustomerCreateSchema` and `AdminCustomerCreateValues` used by the form, ORPC handler, and DB query.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, test, expect } from 'bun:test';
import { adminCustomerCreateSchema } from '@/lib/validation';

describe('adminCustomerCreateSchema', () => {
  test('accepts a valid payload with empty optional fields', () => {
    const result = adminCustomerCreateSchema.safeParse({
      companyName: 'Acme Corp',
      contactName: 'Jane Doe',
      email: 'jane@acme.com',
      countryCode: '+1',
      mobile: '5551234567',
      initialUsers: 10,
      status: 'pending',
      idConnection: '',
      notes: '',
    });
    expect(result.success).toBe(true);
  });

  test('defaults status to pending', () => {
    const result = adminCustomerCreateSchema.safeParse({
      companyName: 'Acme Corp',
      contactName: 'Jane Doe',
      email: 'jane@acme.com',
      countryCode: '+1',
      mobile: '5551234567',
      initialUsers: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('pending');
    }
  });

  test('rejects invalid email', () => {
    const result = adminCustomerCreateSchema.safeParse({
      companyName: 'Acme Corp',
      contactName: 'Jane Doe',
      email: 'not-an-email',
      countryCode: '+1',
      mobile: '5551234567',
      initialUsers: 10,
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `bun test tests/lib/validation.test.ts`
Expected: FAIL — `adminCustomerCreateSchema` is not exported from `lib/validation.ts`.

- [ ] **Step 3: Implement the schema**

Append to `lib/validation.ts` (after the `SignupValues` export):

```typescript
export const adminCustomerCreateSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(255, 'Company name must be at most 255 characters'),
  contactName: z
    .string()
    .trim()
    .min(2, 'Contact name must be at least 2 characters')
    .max(255, 'Contact name must be at most 255 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address')
    .max(320, 'Email is too long'),
  countryCode: z
    .string()
    .regex(/^\+\d{1,4}$/, 'Country code must look like +1 or +44'),
  mobile: z
    .string()
    .regex(
      /^\d{6,14}$/,
      'Mobile number must be 6–14 digits, no spaces or dashes'
    ),
  initialUsers: z
    .number({ invalid_type_error: 'Enter a number' })
    .int('Must be a whole number')
    .min(1, 'Must onboard at least 1 user')
    .max(100, 'Maximum 100 users for the trial'),
  status: z
    .enum(['pending', 'active', 'inactive'])
    .default('pending'),
  idConnection: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform(v => v || undefined),
  notes: z
    .string()
    .max(2000)
    .optional()
    .transform(v => v || undefined),
});

export type AdminCustomerCreateValues = z.infer<typeof adminCustomerCreateSchema>;
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `bun test tests/lib/validation.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/validation.ts tests/lib/validation.test.ts
git commit -m "$(cat <<'EOF'
feat: add admin customer create validation schema

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>
EOF
)"
```

---

## Task 2: Add `createCustomer` database query

**Files:**
- Modify: `lib/db/queries/customers.ts`
- Create: `tests/lib/db/queries/customers.test.ts`

**Interfaces:**
- Consumes: `AdminCustomerCreateValues` shape (via function parameter type).
- Produces: `createCustomer(data)` returning a `Customer` record.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, test, expect, beforeAll } from 'bun:test';
import { createCustomer } from '@/lib/db/queries/customers';

describe('createCustomer (demo mode)', () => {
  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
  });

  test('creates a demo customer and returns it', async () => {
    const customer = await createCustomer({
      companyName: 'Demo Co',
      contactName: 'Demo User',
      email: 'demo@example.com',
      countryCode: '+1',
      mobile: '5551234567',
      initialUsers: 5,
      status: 'active',
    });

    expect(customer.companyName).toBe('Demo Co');
    expect(customer.status).toBe('active');
    expect(customer.idConnection).toBeNull();
    expect(customer.notes).toBeNull();
    expect(typeof customer.id).toBe('string');
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `bun test tests/lib/db/queries/customers.test.ts`
Expected: FAIL — `createCustomer` is not exported from `lib/db/queries/customers.ts`.

- [ ] **Step 3: Implement the query**

Add to `lib/db/queries/customers.ts` after `updateCustomer`:

```typescript
export async function createCustomer(data: {
  companyName: string;
  contactName: string;
  email: string;
  countryCode: string;
  mobile: string;
  initialUsers: number;
  status: string;
  idConnection?: string;
  notes?: string;
}): Promise<Customer> {
  const isDemo = process.env.DEMO_MODE === 'true';

  if (isDemo) {
    const id = `cust_${Math.random().toString(36).slice(2, 10)}`;
    const customer: Customer = {
      id,
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      countryCode: data.countryCode,
      mobile: data.mobile,
      initialUsers: data.initialUsers,
      status: data.status,
      idConnection: data.idConnection || null,
      notes: data.notes || null,
      createdAt: Date.now(),
    };
    demoCustomers.push(customer);
    return customer;
  }

  const customer = await db
    .insert(schema.customers)
    .values({
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      countryCode: data.countryCode,
      mobile: data.mobile,
      initialUsers: data.initialUsers,
      status: data.status,
      idConnection: data.idConnection || null,
      notes: data.notes || null,
    })
    .returning();

  return {
    ...customer[0],
    createdAt: toTimestamp((customer[0] as any).createdAt),
  } as Customer;
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `bun test tests/lib/db/queries/customers.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/db/queries/customers.ts tests/lib/db/queries/customers.test.ts
git commit -m "$(cat <<'EOF'
feat: add createCustomer query with demo support

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>
EOF
)"
```

---

## Task 3: Add ORPC `customers.create` procedure

**Files:**
- Modify: `lib/orpc/router.ts`

**Interfaces:**
- Consumes: `createCustomer` from `lib/db/queries/customers.ts` and `adminCustomerCreateSchema` from `lib/validation.ts`.
- Produces: `adminRouter.customers.create` used by the TanStack Query hook.

- [ ] **Step 1: Add the import and procedure**

In `lib/orpc/router.ts`, add the import:

```typescript
import { createCustomer } from '@/lib/db/queries/customers';
```

Add the new procedure after `adminCustomerUpdate`:

```typescript
export const adminCustomerCreate = authedProcedure
  .input(adminCustomerCreateSchema)
  .handler(async ({ input }) => {
    try {
      const customer = await createCustomer({
        companyName: input.companyName,
        contactName: input.contactName,
        email: input.email,
        countryCode: input.countryCode,
        mobile: input.mobile,
        initialUsers: input.initialUsers,
        status: input.status,
        idConnection: input.idConnection,
        notes: input.notes,
      });
      return { ok: true, customer };
    } catch (error) {
      console.error('Admin customer create error:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create customer',
      });
    }
  });
```

- [ ] **Step 2: Wire the procedure into the router**

Update the `adminRouter` object:

```typescript
export const adminRouter = {
  stats: adminStats,
  customers: {
    list: adminCustomersList,
    update: adminCustomerUpdate,
    create: adminCustomerCreate,
  },
  requests: {
    list: adminRequestsList,
  },
};
```

- [ ] **Step 3: Verify the router type-checks**

Run: `bunx tsc --noEmit --pretty`
Expected: No errors related to `lib/orpc/router.ts`.

- [ ] **Step 4: Verify the endpoint rejects unauthenticated requests**

Start the dev server if not already running, then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/rpc/customers/create \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: `401`

- [ ] **Step 5: Commit**

```bash
git add lib/orpc/router.ts
git commit -m "$(cat <<'EOF'
feat: add ORPC customers.create procedure

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>
EOF
)"
```

---

## Task 4: Add `useAdminCreateCustomer` hook

**Files:**
- Modify: `hooks/use-admin-customers.ts`

**Interfaces:**
- Consumes: `orpc.customers.create` from `lib/orpc/client.ts`.
- Produces: `useAdminCreateCustomer()` mutation hook used by the dialog.

- [ ] **Step 1: Add the hook and update query invalidation**

Append to `hooks/use-admin-customers.ts` (after `useAdminUpdateCustomer`):

```typescript
export function useAdminCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    ...orpc.customers.create.mutationOptions(),
    onSuccess: () => {
      toast.success('Customer created successfully');
      queryClient.invalidateQueries({ queryKey: orpc.customers.key() });
      queryClient.invalidateQueries({ queryKey: orpc.stats.key() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create customer');
    },
  });
}
```

Also update the `onSuccess` of `useAdminUpdateCustomer` to use the same robust keys:

```typescript
onSuccess: () => {
  toast.success('Customer updated successfully');
  queryClient.invalidateQueries({ queryKey: orpc.customers.key() });
  queryClient.invalidateQueries({ queryKey: orpc.stats.key() });
},
```

- [ ] **Step 2: Type-check the hook file**

Run: `bunx tsc --noEmit --pretty`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/use-admin-customers.ts
git commit -m "$(cat <<'EOF'
feat: add useAdminCreateCustomer hook

Also fix query invalidation keys in useAdminUpdateCustomer.

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>
EOF
)"
```

---

## Task 5: Add `CustomerCreateDialog` component

**Files:**
- Create: `components/admin/customer-create-dialog.tsx`

**Interfaces:**
- Consumes: `adminCustomerCreateSchema`, `AdminCustomerCreateValues`, `useAdminCreateCustomer`, UI components.
- Produces: `<CustomerCreateDialog />` rendered by the customers table.

- [ ] **Step 1: Create the component**

```tsx
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BuildingIcon,
  UserIcon,
  Mail01Icon,
  PhoneCall,
  User02Icon,
} from '@hugeicons/core-free-icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/ui/phone-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  adminCustomerCreateSchema,
  type AdminCustomerCreateValues,
} from '@/lib/validation';
import { useAdminCreateCustomer } from '@/hooks/use-admin-customers';

export function CustomerCreateDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useAdminCreateCustomer();

  const form = useForm<AdminCustomerCreateValues>({
    resolver: zodResolver(adminCustomerCreateSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      email: '',
      countryCode: '+1',
      mobile: '',
      initialUsers: 10,
      status: 'pending',
      idConnection: '',
      notes: '',
    },
    mode: 'onTouched',
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    control,
    reset,
  } = form;

  const countryCode = watch('countryCode');
  const mobile = watch('mobile');

  const onSubmit = handleSubmit(async values => {
    createMutation.mutate(values, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 size-4" aria-hidden />
          Add customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create customer</DialogTitle>
          <DialogDescription>
            Add a new enterprise customer record to the system.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-5"
          noValidate
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                placeholder="Acme Corporation"
                leftIcon={<HugeiconsIcon icon={BuildingIcon} size={18} />}
                aria-invalid={!!errors.companyName}
                disabled={createMutation.isPending}
                {...register('companyName')}
              />
              {errors.companyName && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contactName">Primary contact</Label>
              <Input
                id="contactName"
                placeholder="Jane Doe"
                leftIcon={<HugeiconsIcon icon={UserIcon} size={18} />}
                aria-invalid={!!errors.contactName}
                disabled={createMutation.isPending}
                {...register('contactName')}
              />
              {errors.contactName && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.contactName.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@acme.com"
                leftIcon={<HugeiconsIcon icon={Mail01Icon} size={18} />}
                aria-invalid={!!errors.email}
                disabled={createMutation.isPending}
                {...register('email')}
              />
              {errors.email && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="mobile">Mobile number</Label>
              <PhoneInput
                id="mobile"
                countryCode={countryCode}
                mobile={mobile}
                onCountryCodeChange={code =>
                  setValue('countryCode', code, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                onMobileChange={m =>
                  setValue('mobile', m, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                disabled={createMutation.isPending}
                ariaInvalid={!!errors.mobile}
                leftIcon={<HugeiconsIcon icon={PhoneCall} size={18} />}
              />
              {errors.mobile ? (
                <p role="alert" className="text-xs text-destructive">
                  {errors.mobile.message}
                </p>
              ) : errors.countryCode ? (
                <p role="alert" className="text-xs text-destructive">
                  {errors.countryCode.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="initialUsers">Initial users</Label>
              <Input
                id="initialUsers"
                type="number"
                min={1}
                max={100}
                inputMode="numeric"
                leftIcon={<HugeiconsIcon icon={User02Icon} size={18} />}
                aria-invalid={!!errors.initialUsers}
                disabled={createMutation.isPending}
                {...register('initialUsers', { valueAsNumber: true })}
              />
              {errors.initialUsers && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.initialUsers.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={createMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="idConnection">IDCONNECTION</Label>
              <Input
                id="idConnection"
                placeholder="ACME01"
                className="font-mono uppercase"
                aria-invalid={!!errors.idConnection}
                disabled={createMutation.isPending}
                {...register('idConnection', {
                  onChange: e => {
                    e.target.value = e.target.value.toUpperCase();
                  },
                })}
              />
              {errors.idConnection ? (
                <p role="alert" className="text-xs text-destructive">
                  {errors.idConnection.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Optional. Leave blank if the customer is not yet provisioned.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Optional notes about the customer..."
                disabled={createMutation.isPending}
                {...register('notes')}
              />
              {errors.notes && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.notes.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="mr-1 size-4 animate-spin" aria-hidden />
              ) : null}
              Create customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Type-check the new component**

Run: `bunx tsc --noEmit --pretty`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/customer-create-dialog.tsx
git commit -m "$(cat <<'EOF'
feat: add CustomerCreateDialog component

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>
EOF
)"
```

---

## Task 6: Integrate the dialog into the customers table

**Files:**
- Modify: `components/admin/customers-table.tsx`

**Interfaces:**
- Consumes: `<CustomerCreateDialog />` from `components/admin/customer-create-dialog.tsx`.
- Produces: UI with an **Add customer** button in the filters row.

- [ ] **Step 1: Import the dialog and add the button**

Add the import near the top of `components/admin/customers-table.tsx`:

```tsx
import { CustomerCreateDialog } from './customer-create-dialog';
```

In the filters row (after the `Select` block), add the dialog component:

```tsx
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, contact, email, or IDCONNECTION..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={v => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
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
        <CustomerCreateDialog />
      </div>
```

- [ ] **Step 2: Type-check and run the dev server**

Run: `bunx tsc --noEmit --pretty`
Expected: No errors.

Run: `bun dev`
Expected: Dev server starts without errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/customers-table.tsx
git commit -m "$(cat <<'EOF'
feat: integrate Add customer dialog into customers table

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>
EOF
)"
```

---

## Task 7: End-to-end verification

**Files:**
- None (manual verification).

- [ ] **Step 1: Log in to the admin dashboard**

Open `http://localhost:3000/admin/login` in the browser, complete the iVALT biometric login (or use demo mode).

- [ ] **Step 2: Open the customers page**

Navigate to `http://localhost:3000/admin/customers`.

- [ ] **Step 3: Create a customer via the dialog**

Click **Add customer**, fill in the form, and submit. Verify:
- A success toast appears.
- The dialog closes.
- The new customer appears in the table.
- The dashboard stats update (total customer count changes).

- [ ] **Step 4: Verify demo mode persistence**

If running in `DEMO_MODE=true`, refresh the page and confirm the newly created customer is still in the list.

- [ ] **Step 5: Verify production path (if DB is available)**

If running against a real database, confirm the row is inserted in the `customers` table and the `status`/`id_connection` values match the form submission.

- [ ] **Step 6: Verify validation and error handling**

Try submitting with an invalid email or missing company name. Confirm field-level error messages appear and the dialog stays open.

- [ ] **Step 7: Final commit if any fixes are needed**

If any verification step reveals a bug, fix it, re-verify, and commit.

```bash
git add <changed-files>
git commit -m "$(cat <<'EOF'
fix: address customer create dialog verification issues

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>
EOF
)"
```

---

## Self-Review Checklist

- [ ] Spec coverage: every requirement in the design doc is implemented by a task above.
- [ ] No placeholders: every step has actual code or exact commands.
- [ ] Type consistency: `AdminCustomerCreateValues`, `createCustomer` parameter, and ORPC input all match the schema shape.
- [ ] Query invalidation: both the new hook and the existing `useAdminUpdateCustomer` use `orpc.customers.key()` and `orpc.stats.key()`.
- [ ] Demo mode: `createCustomer` appends to `demoCustomers` and returns a `Customer`.
- [ ] Auth: `customers.create` is wrapped in `authedProcedure`.
