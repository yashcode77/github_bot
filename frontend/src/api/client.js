import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(accessToken) {
  refreshSubscribers.forEach((callback) => callback(accessToken));
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't attempt refresh for auth endpoints or if already refreshing
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/refresh");
        onTokenRefreshed();
        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshSubscribers = [];
        // Refresh failed - redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.error?.message ??
      error.message ??
      "Request failed";

    return Promise.reject({
      message,
      status: error.response?.status,
      code: error.response?.data?.error?.code,
      original: error,
    });
  },
);

export default apiClient;
