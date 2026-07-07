import axios from "axios";
import { AuthTokens, ShortenResponse, URLStats, User } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

let refreshTokenPromise: Promise<string | null> | null = null;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Check if running in the browser
    const token = localStorage.getItem("jwt_access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";
    const canAccessStorage = typeof window !== "undefined";

    const isAuthEndpoint =
      requestUrl.includes("/token/") || requestUrl.includes("/token/refresh/");

    if (status === 401 && !isAuthEndpoint && !originalRequest?._retry) {
      const refreshToken = canAccessStorage
        ? localStorage.getItem("jwt_refresh")
        : null;

      if (refreshToken) {
        originalRequest._retry = true;

        try {
          if (!refreshTokenPromise) {
            refreshTokenPromise = axios
              .post(`${API_BASE_URL}/token/refresh/`, {
                refresh: refreshToken,
              })
              .then(({ data }) => {
                const newAccessToken = data.access as string | undefined;

                if (newAccessToken && canAccessStorage) {
                  localStorage.setItem("jwt_access", newAccessToken);
                  return newAccessToken;
                }

                return null;
              })
              .catch(() => null)
              .finally(() => {
                refreshTokenPromise = null;
              });
          }

          const newAccessToken = await refreshTokenPromise;

          if (newAccessToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Fall through to token clear below.
        }
      }
    }

    if (status === 401 && canAccessStorage) {
      localStorage.removeItem("jwt_access");
      localStorage.removeItem("jwt_refresh");
      // Optionally redirect to login or refresh page
    }

    return Promise.reject(error);
  },
);

export const apiService = {
  // Authentication
  async login(username: string, password: string): Promise<AuthTokens> {
    const { data } = await api.post("/token/", { username, password });
    return data;
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get("/me");
    return data;
  },

  // URL Operations
  async shortenUrl(url: string): Promise<ShortenResponse> {
    const { data } = await api.post("/shorten", { url });
    return {
      ...data,
      shortUrl:
        data.shortUrl ||
        `${process.env.NEXT_PUBLIC_SHORT_URL_BASE}/${data.shortCode}`,
    };
  },

  async getStats(): Promise<URLStats[]> {
    const { data } = await api.get("/stats");
    return data;
  },

  async deleteUrl(shortCode: string): Promise<void> {
    await api.delete(`/urls/${shortCode}/`);
  },

  // Health check
  async healthCheck(): Promise<any> {
    const { data } = await api.get("/health");
    return data;
  },
};
