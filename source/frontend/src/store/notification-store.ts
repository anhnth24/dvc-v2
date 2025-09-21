import { create } from 'zustand';

export interface NotificationState {
  items: { id: string; message: string }[];
  push(n: { id: string; message: string }): void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  push: (n) => set({ items: [...get().items, n] }),
}));
