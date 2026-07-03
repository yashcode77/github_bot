import apiClient from "@/api/client";

export const eventService = {
  getEvents(params) {
    return apiClient.get("/api/dashboard/events", { params });
  },
};
