import { useCallback, useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";

export function useDashboardOverview() {
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [overviewResponse, statsResponse] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getStats(),
      ]);

      setOverview(overviewResponse.data.overview);
      setStats(statsResponse.data.stats);
    } catch (requestError) {
      setOverview(null);
      setStats(null);
      setError(requestError.message ?? "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    overview,
    stats,
    isLoading,
    error,
    refresh: fetchDashboard,
  };
}
