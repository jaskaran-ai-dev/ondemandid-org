import { Skeleton } from "@/components/ui/skeleton"

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 bg-card p-6">
      <Skeleton className="size-10 rounded-lg" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

function SkeletonStep() {
  return (
    <div className="flex flex-col gap-4 border border-border border-dashed rounded-none bg-card p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="size-10 rounded-md" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

export default function Loading() {
  return (
    <div className="flex flex-col">
      {/* Hero skeleton */}
      <section className="border-b border-border/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-2xl space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full md:h-16" />
            <Skeleton className="h-12 w-5/6 md:h-16" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-10 w-32 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust metrics skeleton */}
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </section>

      {/* Features skeleton */}
      <section className="border-b border-border/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-2xl space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full md:h-11" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-none border border-none bg-border md:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </section>

      {/* How it works skeleton */}
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-9 w-full md:h-11" />
            </div>
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <SkeletonStep />
            <SkeletonStep />
            <SkeletonStep />
          </div>
        </div>
      </section>

      {/* Security skeleton */}
      <section className="border-b border-border/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-2xl space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-full md:h-11" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </section>

      {/* CTA skeleton */}
      <section className="bg-primary/5">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <Skeleton className="mx-auto h-9 w-3/4 md:h-11" />
            <Skeleton className="mx-auto h-5 w-full" />
            <Skeleton className="mx-auto h-5 w-4/5" />
            <div className="flex justify-center gap-3 pt-4">
              <Skeleton className="h-10 w-36 rounded-md" />
              <Skeleton className="h-10 w-36 rounded-md" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
