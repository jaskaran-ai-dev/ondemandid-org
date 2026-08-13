# Admin Soft-Delete for Customers & Verification Requests

Date: 2026-08-13

## Overview

Add a delete option to the admin panel. Admins click a delete action, see a modal confirmation, and the record is **soft-deleted** (hidden from admin UI and status polling, but the row stays in the database). Applies to both Customers (`/admin/customers`) and Verification Requests (`/admin/requests`).

## Scope

- Soft-delete `customers` and `ondemandRequests` rows
- Delete action + confirmation modal on both admin tables
- Soft-deleted rows excluded from admin lists, stats, and status polling
- No restore UI (YAGNI — restoration is a manual DB operation)
- No bulk delete, no export

## Decisions (confirmed with user)

| Question | Decision |
| --- | --- |
| Delete placement (customers) | Trash icon per row in Actions column |
| Deleting a customer affects requests? | No — requests are independently deletable |
| Status polling for soft-deleted request | Returns `not_found` (404), terminating the flow |

## Schema Changes

Add nullable `deletedAt` to both tables in **both** schema files:

- `lib/db/schema.pg.ts`
  - `customers.deletedAt: timestamp('deleted_at')`
  - `ondemandRequests.deletedAt: timestamp('deleted_at')`
- `lib/db/schema.sqlite.ts`
  - `customers.deletedAt: text('deleted_at')`
  - `ondemandRequests.deletedAt: text('deleted_at')`

Migrations applied via `pnpm db:generate && pnpm db:push`.

**Known limitation:** `email` and `id_connection` keep their unique constraints, so a soft-deleted customer cannot be re-created with the same email/IDCONNECTION without a manual DB-level restore. Accepted.

## Backend

### ORPC procedures (`lib/orpc/router.ts`)

- `customers.delete` — input `{ id: string }`; soft-deletes the customer; returns `{ ok: true }`; `NOT_FOUND` if the customer doesn't exist. Demo mode: return `{ ok: true }`.
- `requests.delete` — input `{ id: string }`; same behavior for verification requests.

### Query layer

- `lib/db/queries/customers.ts`
  - `getCustomers`: exclude rows where `deletedAt` is not null (DB `where` + demo-mode in-memory filter).
  - New `deleteCustomer(id)`: sets `deletedAt`; throws `Customer not found` if no row updated (respecting the DB_TYPE timestamp convention used by `updateCustomer`).
  - Demo mode: module-level `Set` of deleted demo ids, filtered out of `getCustomers`; `deleteCustomer` adds to the set.
- `lib/db/queries/requests.ts`
  - `getRequests`: exclude soft-deleted rows (same dual approach).
  - New `deleteRequest(id)`.
- `lib/db/queries/stats.ts`
  - Add `isNull(deletedAt)` to all customer/request count queries and the `recentRequests` query.

### Status polling (`app/api/status/[id]/route.ts`)

- `handleProductionMode` lookup adds `isNull(deletedAt)` to the `where` clause so a soft-deleted request resolves to `not_found` (404), per decision above.

## Frontend

### New: `components/admin/delete-confirm-dialog.tsx`

Reusable confirmation dialog (reuses existing `Dialog` primitives):

- Props: `title`, `description`, `confirmLabel` (default "Delete"), `isPending`, `onConfirm`, `onClose`.
- Destructive-styled confirm button with `<Spinner>` while pending.
- Cancel + X-close both call `onClose`.

### Customers table (`components/admin/customers-table.tsx`)

- Trash icon (`Trash2` from lucide-react) ghost button in the Actions column, next to `Manage`.
- Clicking opens `DeleteConfirmDialog` with the customer's company name/email.
- Confirm calls new `useAdminDeleteCustomer` mutation; on success toast + invalidate `admin-customers` and `admin-stats` query keys.

### Requests table (`components/admin/requests-table.tsx`)

- New "Actions" `TableHead` + cell with trash icon per row.
- Clicking opens `DeleteConfirmDialog` with request identity (idConnection + mobile).
- Confirm calls new `useAdminDeleteRequest` mutation; on success toast + invalidate `admin-requests` and `admin-stats` query keys.

### Hooks

- `hooks/use-admin-customers.ts`: add `useAdminDeleteCustomer` (mirrors existing mutation pattern).
- `hooks/use-admin-requests.ts`: add `useAdminDeleteRequest` (introduce `useMutation` + `useQueryClient` + toast pattern here, consistent with the customers hook).

## Error Handling

- Router procedures follow existing pattern: wrap in try/catch, map missing rows to `NOT_FOUND`, anything else to `INTERNAL_SERVER_ERROR` with a console.error.
- Hooks toast success/error messages, mirroring `useAdminUpdateCustomer`.

## Verification

- `pnpm lint` passes.
- Manual: `pnpm dev` with demo mode — delete a customer and a request from admin UI; confirm modal shows, row disappears, stats update, lists repopulate on refresh.
- Production mode (SQLite/Neon): `pnpm db:push`, verify deleted rows excluded from lists/stats and that `/api/status/:id` returns 404 for a soft-deleted request.
