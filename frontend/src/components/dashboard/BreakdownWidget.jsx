import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatLabel,
  getBreakdownEntries,
  getBreakdownPercent,
  getBreakdownTotal,
} from "@/lib/dashboard";

function BreakdownSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BreakdownBar({ label, count, total }) {
  const percent = getBreakdownPercent(count, total);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate font-medium">{formatLabel(label)}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {count.toLocaleString()} ({percent}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function BreakdownWidget({
  title,
  description,
  data,
  isLoading,
  emptyMessage = "No data available yet.",
}) {
  if (isLoading) {
    return <BreakdownSkeleton />;
  }

  const entries = getBreakdownEntries(data);
  const total = getBreakdownTotal(entries);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <BreakdownBar
                key={entry.label}
                label={entry.label}
                count={entry.count}
                total={total}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
