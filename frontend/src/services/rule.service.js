import apiClient from "@/api/client";

export const ruleService = {
  listRules(params) {
    return apiClient.get("/api/rules", { params });
  },

  createRule(payload) {
    return apiClient.post("/api/rules", payload);
  },

  updateRule(id, payload) {
    return apiClient.put(`/api/rules/${id}`, payload);
  },

  deleteRule(id) {
    return apiClient.delete(`/api/rules/${id}`);
  },
};
