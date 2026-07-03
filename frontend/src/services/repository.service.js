import apiClient from "@/api/client";

export const repositoryService = {
  listConnected(params) {
    return apiClient.get("/api/dashboard/repositories", { params });
  },

  listGitHubRepositories() {
    return apiClient.get("/api/repositories/github");
  },

  connectRepository(payload) {
    return apiClient.post("/api/repositories/connect", payload);
  },

  disconnectRepository(id) {
    return apiClient.delete(`/api/repositories/${id}`);
  },
};
