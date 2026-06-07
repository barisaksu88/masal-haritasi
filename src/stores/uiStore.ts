import { create } from 'zustand';
import { AppState, Notification } from '../types';

interface UIStore extends AppState {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  setMode: (mode: 'archive' | 'table') => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  addRecentRecord: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mode: 'archive',
  activeCampaign: null,
  selectedRecordId: null,
  selectedRecordType: null,
  searchQuery: '',
  isSearchOpen: false,
  recentRecords: [],
  notifications: [],

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: Math.random().toString(36).slice(2),
          timestamp: Date.now(),
        },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  setMode: (mode) => set({ mode }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  addRecentRecord: (id) =>
    set((state) => ({
      recentRecords: [id, ...state.recentRecords.filter((r) => r !== id)].slice(0, 20),
    })),
}));
