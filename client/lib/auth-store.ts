import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // Unix ms
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken?: string, expiresAt?: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken, expiresAt) =>
        set({ accessToken, refreshToken: refreshToken ?? null, expiresAt: expiresAt ?? null, isAuthenticated: true }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const getAuthTokens = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      accessToken: parsed?.state?.accessToken ?? null,
      refreshToken: parsed?.state?.refreshToken ?? null,
      expiresAt: parsed?.state?.expiresAt ?? null,
      user: parsed?.state?.user ?? null,
    };
  } catch {
    return null;
  }
};

export const clearAuthTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth-storage");
};
