import { create } from 'zustand';

export interface PostalState {
  queue: string[];
  enqueue(id: string): void;
}

export const usePostalStore = create<PostalState>((set, get) => ({
  queue: [],
  enqueue: (id) => set({ queue: [...get().queue, id] }),
}));
