import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      {/* Header skeleton */}
      <div className="mx-auto max-w-3xl text-center space-y-4">
        <Skeleton className="mx-auto h-4 w-36" />
        <Skeleton className="mx-auto h-10 w-full md:h-14" />
        <Skeleton className="mx-auto h-5 w-full" />
        <Skeleton className="mx-auto h-5 w-4/5" />
      </div>

      {/* Form skeleton */}
      <div className="mx-auto mt-12 max-w-xl space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-28 w-full rounded-md" />
        </div>
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    </div>
  )
}
