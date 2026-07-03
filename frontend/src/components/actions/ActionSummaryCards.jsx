import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SUMMARY_ITEMS = [
  {
    key: "total",
    label: "Total Actions",
    description: "All bot actions executed",
    icon: Zap,
    getValue: (stats) => stats?.total ?? 0,
  },
  {
    key: "successful",
    label: "Successful Actions",
    description: "Actions completed successfully",
    icon: CheckCircle,
    getValue: (stats) => stats?.byStatus?.SUCCESS ?? 0,
  },
  {
    key: "failed",
    label: "Failed Actions",
    description: "Actions that did not complete",
    icon: AlertTriangle,
    getValue: (stats) => stats?.byStatus?.FAILED ?? 0,
  },
  {
    key: "pending",
    label: "Pending Actions",
    description: "Actions awaiting completion",
    icon: Clock,
    getValue: (stats) => stats?.byStatus?.PENDING ?? 0,
  },
];

function SummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-36" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

function SummaryCard({ item, stats }) {
  const Icon = item.icon;
  const value = item.getValue(stats);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {value.toLocaleString()}
            </CardTitle>
          </div>
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">
            <Icon className="size-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </CardContent>
    </Card>
  );
}

export function ActionSummaryCards({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_ITEMS.map((item) => (
          <SummaryCardSkeleton key={item.key} />
        ))}
      </div>
    );
  }

  const hasNoData = (stats?.total ?? 0) === 0;

  return (
    <div className="space-y-3">
      {hasNoData ? (
        <p className="text-sm text-muted-foreground">
          No actions recorded yet. Actions will appear here as the bot processes events.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_ITEMS.map((item) => (
          <SummaryCard key={item.key} item={item} stats={stats} />
        ))}
      </div>
    </div>
  );
}
