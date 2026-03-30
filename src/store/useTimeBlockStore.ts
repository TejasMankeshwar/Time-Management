import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TimeBlock, DayTemplate } from '../types';

interface TimeBlockState {
  blocks: TimeBlock[];
  templates: DayTemplate[];
  addBlock: (block: Omit<TimeBlock, 'id'>) => void;
  updateBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteBlock: (id: string) => void;
  addTemplate: (template: Omit<DayTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  applyTemplate: (date: string, templateId: string) => void;
  getBlocksByDate: (date: string) => TimeBlock[];
}

export const useTimeBlockStore = create<TimeBlockState>()(
  persist(
    (set, get) => ({
      blocks: [],
      templates: [],
      addBlock: (block) =>
        set((state) => ({
          blocks: [...state.blocks, { ...block, id: crypto.randomUUID() }],
        })),
      updateBlock: (id, updates) =>
        set((state) => ({
          blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),
      deleteBlock: (id) =>
        set((state) => ({
          blocks: state.blocks.filter((b) => b.id !== id),
        })),
      addTemplate: (template) =>
        set((state) => ({
          templates: [...state.templates, { ...template, id: crypto.randomUUID() }],
        })),
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
      applyTemplate: (date, templateId) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) return;
        const newBlocks: TimeBlock[] = template.blocks.map((b) => ({
          ...b,
          id: crypto.randomUUID(),
          date,
        }));
        set((state) => ({ blocks: [...state.blocks, ...newBlocks] }));
      },
      getBlocksByDate: (date) => get().blocks.filter((b) => b.date === date),
    }),
    { name: 'timeflow-timeblocks-storage' }
  )
);
