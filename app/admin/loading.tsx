import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const STAT_CARD_KEYS = ['stat-total', 'stat-active', 'stat-pending', 'stat-recent'];
const SUMMARY_CARD_KEYS = ['summary-1', 'summary-2', 'summary-3'];
const REQUEST_ROW_KEYS = ['req-1', 'req-2', 'req-3', 'req-4'];

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARD_KEYS.map(key => (
          <Card key={key}>
            <CardContent className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="size-12 rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {SUMMARY_CARD_KEYS.map(key => (
          <Card key={key}>
            <CardContent className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent requests card */}
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-3">
          {REQUEST_ROW_KEYS.map(key => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
