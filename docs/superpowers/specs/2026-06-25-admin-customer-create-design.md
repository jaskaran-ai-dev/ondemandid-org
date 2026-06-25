# Admin Customer Create Dialog — Design

**Date:** 2026-06-25  
**Goal:** Allow admins to create a new customer directly from `/admin/customers` using a form similar to the public signup form.

## Background

The public signup flow at `/signup` collects company name, contact name, email, mobile, initial users, and notes. Admins need the same capability from the admin dashboard without leaving the page, plus the ability to set status and IDCONNECTION immediately.

## Proposed Changes

### 1. Validation Schema

Add a new `adminCustomerCreateSchema` in `lib/validation.ts`.

- `companyName` — required, 2–255 chars
- `contactName` — required, 2–255 chars
- `email` — required, valid email, max 320
- `countryCode` — required, e.g. `+1`
- `mobile` — required, 6–14 digits, no spaces/dashes
- `initialUsers` — required, integer, 1–100
- `status` — enum `pending | active | inactive`, default `pending`
- `idConnection` — optional, 1–50 chars; blank → `null`
- `notes` — optional, max 2000 chars

No CAPTCHA field for admin creation (admin is authenticated).

### 2. Database Query

Add `createCustomer` in `lib/db/queries/customers.ts`.

- **Demo mode:** append a new fake customer to the in-memory `demoCustomers` list with a generated id, status, and current timestamp.
- **Production:** insert a row into the `customers` table with `status` and `idConnection` from the input.
- Return the created customer record so the UI can confirm the row.

### 3. ORPC Router

Add `customers.create` in `lib/orpc/router.ts`.

- Use `authedProcedure` (only authenticated admins can create).
- Input: `adminCustomerCreateSchema`.
- Handler: call `createCustomer(input)`.
- On error: throw `ORPCError('INTERNAL_SERVER_ERROR')` with a clear message.

### 4. TanStack Query Hook

Add `useAdminCreateCustomer` in `hooks/use-admin-customers.ts`.

- Wraps `orpc.customers.create.mutationOptions()`.
- On success:
  - `toast.success('Customer created')`
  - invalidate `['admin-customers']` and `['admin-stats']` query keys
- On error: `toast.error(error.message || 'Failed to create customer')`

### 5. UI Component

Create `components/admin/customer-create-dialog.tsx`.

- Client component with React Hook Form + Zod resolver.
- Use `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from the project’s dialog component.
- Form fields:
  - Company name (Input)
  - Contact name (Input)
  - Work email (Input, type email)
  - Mobile (PhoneInput, country code + mobile)
  - Initial users (Input, type number)
  - Status (Select: pending / active / inactive)
  - IDCONNECTION (Input, optional)
  - Notes (Textarea)
- Submit button shows loading state and is disabled while submitting.
- Dialog closes on success.

### 6. Page Integration

Update `components/admin/customers-table.tsx`.

- Add an **Add customer** button in the filters row, right of the status select.
- Use the `<Plus>` icon from `lucide-react`.
- Clicking opens the `CustomerCreateDialog`.
- After creation, the table list and stats automatically refresh via query invalidation.

## Demo Mode Behavior

The new customer appears immediately in the demo customers list and is visible in the table without a database write.

## Error Handling

- Form-level validation via Zod + React Hook Form.
- ORPC handler catches DB errors and returns a 500 with a readable message.
- Hook shows toast errors.
- The dialog stays open on error so the admin can retry.

## Testing Approach

- Manually create a customer in both demo and production modes.
- Verify the new row appears in the table and stats update.
- Verify status and IDCONNECTION are persisted correctly.
- Verify unauthenticated requests to `customers.create` return 401.

## Files to Modify

| File | Change |
|------|--------|
| `lib/validation.ts` | Add `adminCustomerCreateSchema` |
| `lib/db/queries/customers.ts` | Add `createCustomer` function |
| `lib/orpc/router.ts` | Add `customers.create` procedure |
| `hooks/use-admin-customers.ts` | Add `useAdminCreateCustomer` mutation hook |
| `components/admin/customer-create-dialog.tsx` | New dialog/form component |
| `components/admin/customers-table.tsx` | Add Add customer button + dialog |

## Non-Goals

- No email notifications triggered on admin creation.
- No customer self-service onboarding flow changes.
- No import/bulk-create support.
