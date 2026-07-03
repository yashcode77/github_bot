import { useCallback, useEffect, useState } from "react";
import { repositoryService } from "@/services/repository.service";

export function useGitHubRepositories(enabled) {
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGitHubRepositories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await repositoryService.listGitHubRepositories();
      setRepositories(data.repositories);
    } catch (requestError) {
      setRepositories([]);
      setError(requestError.message ?? "Failed to load GitHub repositories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    fetchGitHubRepositories();
  }, [enabled, fetchGitHubRepositories]);

  return {
    repositories,
    isLoading,
    error,
    refresh: fetchGitHubRepositories,
  };
}
