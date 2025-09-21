import { create } from 'zustand';

export interface AuthState {
  user: { id: string; name: string } | null;
  setUser(user: AuthState['user']): void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
