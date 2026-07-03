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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
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
