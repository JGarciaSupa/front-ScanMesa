import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface KdsState {
  pendingCount: number;
  silentMode: boolean;
  setPendingCount: (count: number) => void;
  setSilentMode: (silent: boolean) => void;
}

export const useKdsStore = create<KdsState>()(
  persist(
    (set) => ({
      pendingCount: 0,
      silentMode: false,
      setPendingCount: (count) => set({ pendingCount: count }),
      setSilentMode: (silent) => set({ silentMode: silent }),
    }),
    {
      name: 'kds-storage',
    }
  )
);

