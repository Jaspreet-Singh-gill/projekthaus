import axios from "axios";
import useAuthStore from "../store/authStore.js";
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000,
  withCredentials: true,
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
    const status = error.response?.status || error.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refreshTokens`,
          { withCredentials: true }
        );
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearTheUser();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    if (status === 429) {
      toast.error("Too many requests please try again later");
    }

    if (status === 502) {
      toast.error("Service is temporarily unavailable");
    }

    return Promise.reject(error.response.data);
  },
);

export default api;
