import apiClient from "@/api/client";

export const dashboardService = {
  getOverview(params) {
    return apiClient.get("/api/dashboard/overview", { params });
  },

  getStats(params) {
    return apiClient.get("/api/dashboard/stats", { params });
  },
};
