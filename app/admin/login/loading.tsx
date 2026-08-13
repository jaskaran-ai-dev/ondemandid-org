import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

export default function AdminLoginLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 py-12 sm:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Skeleton className="size-14 rounded-2xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>

        <Card className="w-full py-6 shadow-lg">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-28" />
              <div className="flex gap-3">
                <Skeleton className="h-9 w-20 rounded-md" />
                <Skeleton className="h-9 flex-1 rounded-md" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-1">
            <Skeleton className="h-10 w-full rounded-md" />
          </CardFooter>
        </Card>

        <p className="mt-8 px-2 text-center text-xs leading-relaxed">
          <Skeleton className="mx-auto h-3 w-64" />
        </p>
      </div>
    </div>
  );
}