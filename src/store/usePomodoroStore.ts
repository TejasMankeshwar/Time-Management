import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PomodoroSession } from '../types';

interface PomodoroState {
  sessions: PomodoroSession[];
  settings: {
    focusDuration: number;
    shortBreak: number;
    longBreak: number;
    dailyGoal: number;
  };
  currentSession: {
    type: PomodoroSession['type'];
    taskId?: string;
    startedAt: string | null;
  };
  addSession: (session: PomodoroSession) => void;
  updateSettings: (settings: Partial<PomodoroState['settings']>) => void;
  setCurrentSession: (session: Partial<PomodoroState['currentSession']>) => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set) => ({
      sessions: [],
      settings: {
        focusDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        dailyGoal: 8,
      },
      currentSession: {
        type: 'focus',
        taskId: undefined,
        startedAt: null,
      },
      addSession: (session) =>
        set((state) => ({ sessions: [...state.sessions, session] })),
      updateSettings: (settings) =>
        set((state) => ({ settings: { ...state.settings, ...settings } })),
      setCurrentSession: (session) =>
        set((state) => ({ currentSession: { ...state.currentSession, ...session } })),
    }),
    {
      name: 'timeflow-pomodoro-storage',
    }
  )
);
