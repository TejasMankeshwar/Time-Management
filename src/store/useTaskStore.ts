import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '../types';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  getTasksByStrategy: (strategy: Task['source']) => Task[];
  getTodaysTasks: () => Task[];
  getTodaysFrog: () => Task | undefined;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      completeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'completed',
                  completedAt: new Date().toISOString(),
                  priority: t.priority === 'frog' && t.status !== 'completed' ? 'low' : t.priority, // Deprioritize done frog
                }
              : t
          ),
        })),
      getTasksByStrategy: (strategy) => get().tasks.filter((t) => t.source === strategy),
      getTodaysTasks: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().tasks.filter(
          (t) => t.dueDate === today || (t.source === 'eatthefrog' && t.status === 'active')
        );
      },
      getTodaysFrog: () => {
        return get().getTodaysTasks().find((t) => t.priority === 'frog' && t.source === 'eatthefrog');
      },
    }),
    {
      name: 'timeflow-tasks-storage',
    }
  )
);
