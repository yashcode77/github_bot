import { useCallback, useEffect, useState } from "react";
import { eventService } from "@/services/event.service";

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchEvents = useCallback(
    async (params = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await eventService.getEvents({
          page: pagination.page,
          limit: pagination.limit,
          ...params,
        });

        setEvents(response.data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
        }));
      } catch (requestError) {
        setEvents([]);
        setError(requestError.message ?? "Failed to load events");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const setPage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    return fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    pagination,
    setPage,
    refresh,
    fetchEvents,
  };
}
