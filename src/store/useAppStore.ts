import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPrefs {
  name: string;
  dailyStartHour: string; // e.g. "08:00"
  workdayHours: number;
  theme: 'light' | 'dark';
}

interface AppState {
  sidebarCollapsed: boolean;
  currentDate: string;
  userPrefs: UserPrefs;
  toggleSidebar: () => void;
  setUserPrefs: (prefs: Partial<UserPrefs>) => void;
  setCurrentDate: (date: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      currentDate: new Date().toISOString().split('T')[0],
      userPrefs: {
        name: 'User',
        dailyStartHour: '08:00',
        workdayHours: 8,
        theme: 'light',
      },
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setUserPrefs: (prefs) =>
        set((state) => ({ userPrefs: { ...state.userPrefs, ...prefs } })),
      setCurrentDate: (date) => set({ currentDate: date }),
    }),
    {
      name: 'timeflow-app-storage',
    }
  )
);
