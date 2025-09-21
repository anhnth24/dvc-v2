import { create } from 'zustand';

export interface UiState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  setTheme(theme: UiState['theme']): void;
  setSidebarOpen(open: boolean): void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  sidebarOpen: true,
  setTheme: (theme) => set({ theme }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
