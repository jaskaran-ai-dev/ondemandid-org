import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const HEADER_KEYS = ['h-1', 'h-2', 'h-3', 'h-4', 'h-5', 'h-6', 'h-7'];
const ROW_KEYS = ['r-1', 'r-2', 'r-3', 'r-4', 'r-5', 'r-6', 'r-7', 'r-8'];

export default function AdminCustomersLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Customers
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage enterprise customers and their IDCONNECTION provisioning.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[160px]" />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b px-4 py-3">
            <div className="grid grid-cols-7 gap-4">
              {HEADER_KEYS.map(key => (
                <Skeleton key={key} className="h-4" />
              ))}
            </div>
          </div>
          <div className="divide-y">
            {ROW_KEYS.map(key => (
              <div key={key} className="grid grid-cols-7 gap-4 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t px-4 py-3">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}
