import { Skeleton } from "@/components/ui/skeleton"

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
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
        {/* Form / main panel skeleton */}
        <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* Sidebar skeleton */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-secondary/40 p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Skeleton className="size-6 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="size-6 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="size-6 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="size-6 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="size-6 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
