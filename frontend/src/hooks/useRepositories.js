import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { repositoryService } from "@/services/repository.service";

export function useRepositories() {
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRepositories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await repositoryService.listConnected({ limit: 100 });
      setRepositories(data.data);
    } catch (requestError) {
      setRepositories([]);
      setError(requestError.message ?? "Failed to load repositories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  const connectRepository = useCallback(
    async (payload) => {
      try {
        await repositoryService.connectRepository(payload);
        toast.success("Repository connected successfully");
        await fetchRepositories();
        return true;
      } catch (requestError) {
        toast.error(requestError.message ?? "Failed to connect repository");
        return false;
      }
    },
    [fetchRepositories],
  );

  const disconnectRepository = useCallback(
    async (id) => {
      try {
        await repositoryService.disconnectRepository(id);
        toast.success("Repository disconnected successfully");
        await fetchRepositories();
        return true;
      } catch (requestError) {
        toast.error(requestError.message ?? "Failed to disconnect repository");
        return false;
      }
    },
    [fetchRepositories],
  );

  return {
    repositories,
    isLoading,
    error,
    refresh: fetchRepositories,
    connectRepository,
    disconnectRepository,
  };
}
