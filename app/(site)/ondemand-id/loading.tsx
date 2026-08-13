import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      {/* Header skeleton */}
      <div className="mx-auto max-w-3xl text-center space-y-4">
        <Skeleton className="mx-auto h-4 w-32" />
        <Skeleton className="mx-auto h-10 w-full md:h-14" />
        <Skeleton className="mx-auto h-5 w-full" />
        <Skeleton className="mx-auto h-5 w-4/5" />
      </div>

      {/* Content skeleton */}
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-stretch lg:gap-10">
        {/* Form / main panel skeleton */}
        <div className="overflow-hidden rounded-xl border border-border bg-card lg:row-start-1">
          <div className="space-y-2 border-b border-border/70 px-6 pb-4 pt-6 md:px-8">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex flex-col gap-6 px-6 py-6 md:px-8">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <div className="border-t border-border/70 px-6 py-3.5 md:px-8">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="overflow-hidden rounded-xl border border-border bg-card lg:row-start-1">
            <div className="space-y-2 border-b border-border/70 px-6 pb-4 pt-6">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex flex-col gap-4 px-6 py-5">
              <div className="flex gap-3">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="w-full space-y-2 pt-0.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <div className="flex gap-3">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="w-full space-y-2 pt-0.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <div className="flex gap-3">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="w-full space-y-2 pt-0.5">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <div className="flex gap-3">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="w-full space-y-2 pt-0.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
            <div className="flex justify-between border-t border-border/70 px-6 py-3.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
      </div>
    </div>
  );
}
