import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardPageHeader({ onRefresh, isRefreshing }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Monitor repositories, automation activity, and recent webhook events.
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={isRefreshing ? "size-4 animate-spin" : "size-4"} />
        Refresh
      </Button>
    </div>
  );
}
