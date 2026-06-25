import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

const CARD_KEYS = ['card-1', 'card-2', 'card-3', 'card-4'];
const ROW_KEYS = ['row-1', 'row-2', 'row-3', 'row-4'];
const LAST_CARD_KEY = CARD_KEYS[CARD_KEYS.length - 1];

export default function AdminSettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Settings cards */}
      {CARD_KEYS.map(cardKey => (
        <Card key={cardKey}>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-3">
            {ROW_KEYS.map(rowKey => (
              <div
                key={`${cardKey}-${rowKey}`}
                className="flex items-center justify-between py-2"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </CardContent>
          {cardKey === LAST_CARD_KEY && (
            <CardFooter>
              <Skeleton className="h-3 w-full max-w-md" />
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
