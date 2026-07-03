import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectRepositoryDialog } from "@/components/repositories/ConnectRepositoryDialog";
import { DisconnectRepositoryDialog } from "@/components/repositories/DisconnectRepositoryDialog";
import { RepositoryTable } from "@/components/repositories/RepositoryTable";
import { useRepositories } from "@/hooks/useRepositories";
import { REPOSITORY_STATUS_FILTERS } from "@/lib/repositories";

export default function RepositoriesPage() {
  const {
    repositories,
    isLoading,
    error,
    refresh,
    connectRepository,
    disconnectRepository,
  } = useRepositories();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    REPOSITORY_STATUS_FILTERS[0].value,
  );
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState(null);

  const handleDisconnectRequest = (repository) => {
    setSelectedRepository(repository);
    setDisconnectDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Repositories</h1>
          <p className="text-sm text-muted-foreground">
            Connect GitHub repositories and manage webhook automation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={isLoading ? "size-4 animate-spin" : "size-4"} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setConnectDialogOpen(true)}>
            <Plus className="size-4" />
            Connect Repository
          </Button>
        </div>
      </div>

      <RepositoryTable
        repositories={repositories}
        isLoading={isLoading}
        error={error}
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onRetry={refresh}
        onDisconnect={handleDisconnectRequest}
      />

      <ConnectRepositoryDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        connectedRepositories={repositories}
        onConnect={connectRepository}
      />

      <DisconnectRepositoryDialog
        repository={selectedRepository}
        open={disconnectDialogOpen}
        onOpenChange={setDisconnectDialogOpen}
        onConfirm={disconnectRepository}
      />
    </div>
  );
}
