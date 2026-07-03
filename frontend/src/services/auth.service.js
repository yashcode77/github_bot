import apiClient from "@/api/client";

export const authService = {
  getCurrentUser() {
    return apiClient.get("/auth/me");
  },

  logout() {
    return apiClient.post("/auth/logout");
  },
};
