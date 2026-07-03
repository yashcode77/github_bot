import apiClient from "@/api/client";

export const actionService = {
  getActions(params) {
    return apiClient.get("/api/dashboard/actions", { params });
  },
};
