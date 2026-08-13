import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const SUMMARY_CARD_KEYS = ['summary-1', 'summary-2', 'summary-3'];
const HEADER_KEYS = ['h-1', 'h-2', 'h-3', 'h-4', 'h-5', 'h-6', 'h-7', 'h-8'];
const ROW_KEYS = ['r-1', 'r-2', 'r-3', 'r-4', 'r-5', 'r-6', 'r-7', 'r-8'];

export default function AdminRequestsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Verification Requests
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor all biometric verification requests across customers.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {SUMMARY_CARD_KEYS.map(key => (
          <Card key={key}>
            <CardContent className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-[180px]" />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b px-4 py-3">
            <div className="grid grid-cols-8 gap-4">
              {HEADER_KEYS.map(key => (
                <Skeleton key={key} className="h-4" />
              ))}
            </div>
          </div>
          <div className="divide-y">
            {ROW_KEYS.map(key => (
              <div key={key} className="grid grid-cols-8 gap-4 px-4 py-3">
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}
