import { BreakdownWidget } from "@/components/dashboard/BreakdownWidget";
import { DashboardErrorState } from "@/components/dashboard/DashboardErrorState";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardSummaryCards } from "@/components/dashboard/DashboardSummaryCards";
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";

export default function DashboardPage() {
  const { overview, stats, isLoading, error, refresh } = useDashboardOverview();

  return (
    <div className="space-y-6">
      <DashboardPageHeader onRefresh={refresh} isRefreshing={isLoading} />

      {error ? (
        <DashboardErrorState
          message={error}
          onRetry={refresh}
          isRetrying={isLoading}
        />
      ) : (
        <>
          <DashboardSummaryCards overview={overview} isLoading={isLoading} />

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-medium">Activity Statistics</h2>
              <p className="text-sm text-muted-foreground">
                Breakdown of events and bot actions across your workspace.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <BreakdownWidget
                title="Events by Type"
                description="Distribution of webhook event types"
                data={stats?.events?.byType}
                isLoading={isLoading}
                emptyMessage="No webhook events recorded yet."
              />
              <BreakdownWidget
                title="Actions by Type"
                description="Types of bot actions executed"
                data={stats?.actions?.byType}
                isLoading={isLoading}
                emptyMessage="No bot actions recorded yet."
              />
              <BreakdownWidget
                title="Actions by Status"
                description="Outcome of executed bot actions"
                data={stats?.actions?.byStatus}
                isLoading={isLoading}
                emptyMessage="No bot actions recorded yet."
              />
            </div>
          </section>

          <RecentEventsTable
            events={overview?.events?.recent ?? []}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
