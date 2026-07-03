import { AlertCircle, FolderGit2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RepositoryRow } from "@/components/repositories/RepositoryRow";
import {
  REPOSITORY_STATUS_FILTERS,
  filterRepositories,
} from "@/lib/repositories";

function RepositoryTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

function EmptyRepositoriesState({ hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="rounded-full bg-muted p-3 text-muted-foreground">
        <FolderGit2 className="size-5" />
      </div>
      <p className="text-sm font-medium">
        {hasFilters ? "No repositories match your filters" : "No repositories connected"}
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "Try adjusting your search or status filter."
          : "Connect a GitHub repository to start receiving webhook events."}
      </p>
    </div>
  );
}

export function RepositoryTable({
  repositories,
  isLoading,
  error,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onRetry,
  onDisconnect,
}) {
  const filteredRepositories = filterRepositories(repositories, {
    search,
    statusFilter,
  });
  const hasFilters =
    search.trim().length > 0 || statusFilter !== REPOSITORY_STATUS_FILTERS[0].value;

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>
            Manage repositories linked to your GitHub automation.
          </CardDescription>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[320px]">
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by repository name..."
            aria-label="Search repositories"
          />

          <div className="flex flex-wrap gap-2">
            {REPOSITORY_STATUS_FILTERS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={statusFilter === option.value ? "default" : "outline"}
                onClick={() => onStatusFilterChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Unable to load repositories</AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={onRetry}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <RepositoryTableSkeleton />
        ) : filteredRepositories.length === 0 ? (
          <EmptyRepositoriesState hasFilters={hasFilters} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repository Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Connected Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepositories.map((repository) => (
                <RepositoryRow
                  key={repository.id}
                  repository={repository}
                  onDisconnect={onDisconnect}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
