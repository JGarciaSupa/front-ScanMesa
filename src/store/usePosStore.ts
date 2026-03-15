import { create } from 'zustand';

export interface PosAlert {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success';
  timestamp: Date;
  isRead: boolean;
}

interface PosState {
  alerts: PosAlert[];
  addAlert: (alert: Omit<PosAlert, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  clearAlerts: () => void;
  getUnreadCount: () => number;
}

export const usePosStore = create<PosState>((set, get) => ({
  alerts: [],
  addAlert: (alertData) => {
    const newAlert: PosAlert = {
      ...alertData,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      isRead: false,
    };
    set((state) => ({
      alerts: [newAlert, ...state.alerts].slice(0, 50), // Keep last 50
    }));
  },
  markAsRead: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
    }));
  },
  clearAlerts: () => {
    set({ alerts: [] });
  },
  getUnreadCount: () => {
    return get().alerts.filter((a) => !a.isRead).length;
  },
}));
