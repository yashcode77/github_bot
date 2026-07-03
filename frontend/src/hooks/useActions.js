import { useCallback, useEffect, useState } from "react";
import { actionService } from "@/services/action.service";

export function useActions() {
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchActions = useCallback(
    async (params = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await actionService.getActions({
          page: pagination.page,
          limit: pagination.limit,
          ...params,
        });

        setActions(response.data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
        }));
      } catch (requestError) {
        setActions([]);
        setError(requestError.message ?? "Failed to load actions");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const setPage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    return fetchActions();
  }, [fetchActions]);

  return {
    actions,
    isLoading,
    error,
    pagination,
    setPage,
    refresh,
    fetchActions,
  };
}
