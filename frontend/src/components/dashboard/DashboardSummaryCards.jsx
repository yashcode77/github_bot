import {
  Activity,
  AlertTriangle,
  GitBranch,
  ListChecks,
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
    key: "repositories",
    label: "Connected Repositories",
    description: "Active repositories linked to automation",
    icon: GitBranch,
    getValue: (overview) => overview?.repositories?.active ?? 0,
  },
  {
    key: "rules",
    label: "Active Rules",
    description: "Enabled automation rules",
    icon: ListChecks,
    getValue: (overview) => overview?.rules?.enabled ?? 0,
  },
  {
    key: "events",
    label: "Total Events",
    description: "Webhook events received",
    icon: Activity,
    getValue: (overview) => overview?.events?.total ?? 0,
  },
  {
    key: "actions",
    label: "Total Actions",
    description: "Bot actions executed",
    icon: Zap,
    getValue: (overview) => overview?.actions?.total ?? 0,
  },
  {
    key: "failedActions",
    label: "Failed Actions",
    description: "Actions that did not complete",
    icon: AlertTriangle,
    getValue: (overview) => overview?.actions?.byStatus?.FAILED ?? 0,
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

function SummaryCard({ item, overview }) {
  const Icon = item.icon;
  const value = item.getValue(overview);

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

export function DashboardSummaryCards({ overview, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {SUMMARY_ITEMS.map((item) => (
          <SummaryCardSkeleton key={item.key} />
        ))}
      </div>
    );
  }

  const hasNoData =
    (overview?.repositories?.total ?? 0) === 0 &&
    (overview?.events?.total ?? 0) === 0 &&
    (overview?.actions?.total ?? 0) === 0;

  return (
    <div className="space-y-3">
      {hasNoData ? (
        <p className="text-sm text-muted-foreground">
          No activity yet. Connect a repository to start receiving webhook
          events.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {SUMMARY_ITEMS.map((item) => (
          <SummaryCard key={item.key} item={item} overview={overview} />
        ))}
      </div>
    </div>
  );
}
