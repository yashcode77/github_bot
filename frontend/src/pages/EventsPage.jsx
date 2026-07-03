import { useState, useEffect } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventFilters } from "@/components/events/EventFilters";
import { EventsTable } from "@/components/events/EventsTable";
import { EventDetailsDrawer } from "@/components/events/EventDetailsDrawer";
import { useEvents } from "@/hooks/useEvents";
import { useRepositories } from "@/hooks/useRepositories";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EventsPage() {
  const {
    events,
    isLoading,
    error,
    pagination,
    setPage,
    refresh,
    fetchEvents,
  } = useEvents();

  const { repositories } = useRepositories();

  const [search, setSearch] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [repositoryFilter, setRepositoryFilter] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (eventTypeFilter) params.eventType = eventTypeFilter;
    if (statusFilter) params.status = statusFilter;
    if (repositoryFilter) params.repositoryId = repositoryFilter;

    fetchEvents(params);
  }, [search, eventTypeFilter, statusFilter, repositoryFilter, fetchEvents]);

  const handleRowClick = (event) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPage(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPage(pagination.page + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground">
            View and manage webhook events from connected repositories.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
        >
          <RefreshCw className={isLoading ? "size-4 animate-spin" : "size-4"} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            {error}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={refresh}
              disabled={isLoading}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <EventFilters
        search={search}
        onSearchChange={setSearch}
        eventTypeFilter={eventTypeFilter}
        onEventTypeFilterChange={setEventTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        repositoryFilter={repositoryFilter}
        onRepositoryFilterChange={setRepositoryFilter}
        repositories={repositories}
      />

      <EventsTable
        events={events}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total events)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={pagination.page <= 1 || isLoading}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={pagination.page >= pagination.totalPages || isLoading}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <EventDetailsDrawer
        event={selectedEvent}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
