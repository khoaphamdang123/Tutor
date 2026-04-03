import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { getAuthTokens, clearAuthTokens } from "./auth-store";
import type { User, AdminTutor, AdminTutorSearchResult, TutorStats, CreateTutorRequest, UpdateTutorRequest, Tutor } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api";

// ─── Refresh state ────────────────────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (token: string) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

// ─── Token helpers ─────────────────────────────────────────────────────────────
const getExpiryMs = (): number | null => {
  const tokens = getAuthTokens();
  return tokens?.expiresAt ?? null;
};

const isTokenExpired = (): boolean => {
  const expiry = getExpiryMs();
  if (!expiry) return true;
  // Refresh if less than 5 minutes remaining
  return Date.now() >= expiry - 5 * 60 * 1000;
};

// ─── Axios instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const tokens = getAuthTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 on an auth page → don't redirect, let the page handle it
    if (error.response?.status === 401) {
      const isAuthPage = typeof window !== "undefined" && window.location.pathname.startsWith("/auth");
      if (isAuthPage) return Promise.reject(error);
    }

    // 401 elsewhere → attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const tokens = getAuthTokens();
      const refreshToken = tokens?.refreshToken;

      if (!refreshToken) {
        isRefreshing = false;
        clearAuthTokens();
        if (typeof window !== "undefined") window.location.href = "/auth";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post<{ success: boolean; data: { token: string; refreshToken: string; expiresAt: number } }>(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );

        if (res.data.success) {
          const { token, refreshToken: newRefresh, expiresAt } = res.data.data;

          // Update stored tokens
          const { useAuthStore } = await import("./auth-store");
          useAuthStore.getState().setTokens(token, newRefresh, expiresAt);

          processQueue(token);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } else {
          clearAuthTokens();
          isRefreshing = false;
          if (typeof window !== "undefined") window.location.href = "/auth";
          return Promise.reject(error);
        }
      } catch {
        clearAuthTokens();
        isRefreshing = false;
        if (typeof window !== "undefined") window.location.href = "/auth";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ─── Admin tutors helpers ─────────────────────────────────────────────────────
export const tutorsApi = {
  list: (params: { search?: string; page?: number; pageSize?: number }) =>
    api.get<{ success: boolean; data: AdminTutorSearchResult }>("/tutors/admin", { params }),

  getStats: () =>
    api.get<{ success: boolean; data: TutorStats }>("/tutors/admin/stats"),

  getById: (id: string) =>
    api.get<{ success: boolean; data: AdminTutor }>(`/tutors/admin/${id}`),

  create: (data: CreateTutorRequest) =>
    api.post<{ success: boolean; data: Tutor; message: string }>("/tutors/admin", {
      Email: data.email,
      Password: data.password,
      FullName: data.fullName,
      Phone: data.phone,
      Bio: data.bio,
      HourlyRate: data.hourlyRate,
      Education: data.education,
      YearsOfExperience: data.yearsOfExperience,
      SubjectIds: data.subjectIds ?? [],
      ClassIds: data.classIds ?? [],
    }),

  update: (id: string, data: UpdateTutorRequest) =>
    api.put<{ success: boolean; data: AdminTutor; message: string }>(`/tutors/admin/${id}`, {
      Bio: data.bio,
      HourlyRate: data.hourlyRate,
      Education: data.education,
      YearsOfExperience: data.yearsOfExperience,
      SubjectIds: data.subjectIds,
      ClassIds: data.classIds,
      IsVerified: data.isVerified,
      IsAvailable: data.isAvailable,
    }),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/tutors/admin/${id}`),
};

// ─── Admin users helpers ───────────────────────────────────────────────────────
export const usersApi = {
  list: (params: {
    role?: string;
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }) =>
    api.get<{
      success: boolean;
      data: { users: AdminUser[]; totalCount: number; page: number; pageSize: number };
    }>("/users", { params }),

  getStats: () =>
    api.get<{ success: boolean; data: AdminStats }>("/users/stats"),

  toggleStatus: (id: string) =>
    api.put(`/users/${id}/toggle-status`),
};

// Auth helpers — wrappers over the default instance for auth-specific calls

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; data: { token: string; refreshToken: string; expiresAt: number; user: User } }>(
      "/auth/login",
      { Email: email, Password: password }
    ),

  register: (data: { fullName: string; email: string; password: string; role: string }) =>
    api.post<{ success: boolean; data: { token: string; refreshToken: string; expiresAt: number; user: User } }>("/auth/register", {
      Email: data.email,
      Password: data.password,
      FullName: data.fullName,
      Role: data.role,
    }),
};
