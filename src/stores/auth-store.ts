import { create } from "zustand";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthState {
  user: AuthUser | null;
  /** "loading" until Firebase has restored (or failed to restore) the saved session. */
  status: "loading" | "ready";
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  setUser: (user) => set({ user, status: "ready" }),
}));
