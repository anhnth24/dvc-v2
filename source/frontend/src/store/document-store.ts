import { create } from 'zustand';

export interface DocumentState {
  items: { id: string; name: string }[];
  setItems(items: DocumentState['items']): void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));
