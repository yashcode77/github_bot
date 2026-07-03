import apiClient from "@/api/client";

export const settingsService = {
  getSlackSettings() {
    return apiClient.get("/api/settings/slack");
  },

  updateSlackSettings(payload) {
    return apiClient.put("/api/settings/slack", payload);
  },
};
