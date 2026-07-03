import { useState, useEffect } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionFilters } from "@/components/actions/ActionFilters";
import { ActionsTable } from "@/components/actions/ActionsTable";
import { ActionDetailsDrawer } from "@/components/actions/ActionDetailsDrawer";
import { ActionSummaryCards } from "@/components/actions/ActionSummaryCards";
import { useActions } from "@/hooks/useActions";
import { useRepositories } from "@/hooks/useRepositories";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ActionsPage() {
  const {
    actions,
    isLoading,
    error,
    pagination,
    setPage,
    refresh,
    fetchActions,
  } = useActions();

  const { repositories } = useRepositories();

  const [search, setSearch] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [repositoryFilter, setRepositoryFilter] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (actionTypeFilter) params.actionType = actionTypeFilter;
    if (statusFilter) params.status = statusFilter;
    if (repositoryFilter) params.repositoryId = repositoryFilter;

    fetchActions(params);
  }, [search, actionTypeFilter, statusFilter, repositoryFilter, fetchActions]);

  const handleRowClick = (action) => {
    setSelectedAction(action);
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

  // Calculate stats from actions
  const stats = {
    total: pagination.total,
    byStatus: {
      SUCCESS: actions.filter((a) => a.status === "SUCCESS").length,
      FAILED: actions.filter((a) => a.status === "FAILED").length,
      PENDING: actions.filter((a) => a.status === "PENDING").length,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Actions</h1>
          <p className="text-sm text-muted-foreground">
            View and manage bot actions executed on your repositories.
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

      <ActionSummaryCards stats={stats} isLoading={isLoading} />

      <ActionFilters
        search={search}
        onSearchChange={setSearch}
        actionTypeFilter={actionTypeFilter}
        onActionTypeFilterChange={setActionTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        repositoryFilter={repositoryFilter}
        onRepositoryFilterChange={setRepositoryFilter}
        repositories={repositories}
      />

      <ActionsTable
        actions={actions}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total actions)
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

      <ActionDetailsDrawer
        action={selectedAction}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
