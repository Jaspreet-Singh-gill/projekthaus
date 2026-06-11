import axios from "axios";
import useAuthStore from "../store/authStore.js";
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.status;
    if (status == 401 && !originalRequest._retry) {
      originalRequest._retry = true;
    }
    try {
      await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refreshTokens`,
      );
      return api(originalRequest);
    } catch {
      useAuthStore.getState().clearTheUser();
      window.location.href = "/login";
    }

    if (status == 429) {
      toast.error("Too many requests please try again latter");
    }

    if (status == 502) {
      toast.error("Service is temperory unavailable");
    }
  },
);

export default api;
