import { create } from 'zustand';

interface KdsState {
  pendingCount: number;
  setPendingCount: (count: number) => void;
}

export const useKdsStore = create<KdsState>((set) => ({
  pendingCount: 0,
  setPendingCount: (count) => set({ pendingCount: count }),
}));
