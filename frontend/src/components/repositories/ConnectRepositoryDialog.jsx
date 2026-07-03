import { useEffect, useMemo, useState } from "react";
import { AlertCircle, GitBranch } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGitHubRepositories } from "@/hooks/useGitHubRepositories";
import {
  getRepositoryVisibilityLabel,
  getRepositoryVisibilityVariant,
  isRepositoryConnected,
} from "@/lib/repositories";

function GitHubRepositorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function ConnectRepositoryDialog({
  open,
  onOpenChange,
  connectedRepositories,
  onConnect,
}) {
  const { repositories, isLoading, error, refresh } = useGitHubRepositories(open);
  const [search, setSearch] = useState("");
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedRepository(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const availableRepositories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return repositories.filter((repository) => {
      if (isRepositoryConnected(connectedRepositories, repository.id)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        repository.name.toLowerCase().includes(query) ||
        repository.owner.toLowerCase().includes(query)
      );
    });
  }, [connectedRepositories, repositories, search]);

  const handleConnect = async () => {
    if (!selectedRepository) {
      return;
    }

    setIsSubmitting(true);

    const success = await onConnect({
      githubRepoId: Number(selectedRepository.id),
      owner: selectedRepository.owner,
      name: selectedRepository.name,
    });

    setIsSubmitting(false);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect Repository</DialogTitle>
          <DialogDescription>
            Select one of your GitHub repositories to connect webhook automation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search GitHub repositories..."
            aria-label="Search GitHub repositories"
          />

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Unable to load repositories</AlertTitle>
              <AlertDescription className="flex flex-col gap-3">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={refresh}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <GitHubRepositorySkeleton />
          ) : availableRepositories.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <GitBranch className="mx-auto mb-2 size-5 text-muted-foreground" />
              <p className="text-sm font-medium">No repositories available</p>
              <p className="text-sm text-muted-foreground">
                {repositories.length === 0
                  ? "No owned repositories were found on your GitHub account."
                  : "All matching repositories are already connected."}
              </p>
            </div>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {availableRepositories.map((repository) => {
                const isSelected = selectedRepository?.id === repository.id;

                return (
                  <button
                    key={repository.id}
                    type="button"
                    onClick={() => setSelectedRepository(repository)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-colors ${isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                      }`}
                  >
                    <div>
                      <p className="font-medium">{repository.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {repository.owner}
                      </p>
                    </div>
                    <Badge variant={getRepositoryVisibilityVariant(repository.isPrivate)}>
                      {getRepositoryVisibilityLabel(repository.isPrivate)}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={!selectedRepository || isSubmitting}
          >
            {isSubmitting ? "Connecting..." : "Connect Repository"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
