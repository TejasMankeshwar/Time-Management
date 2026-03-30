import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KanbanCard, KanbanColumn } from '../types';

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do', wipLimit: 5 },
  { id: 'inprogress', title: 'In Progress', wipLimit: 3 },
  { id: 'review', title: 'Review', wipLimit: 3 },
  { id: 'done', title: 'Done' },
];

interface KanbanState {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  addColumn: (title: string) => void;
  updateColumn: (id: string, updates: Partial<KanbanColumn>) => void;
  deleteColumn: (id: string) => void;
  addCard: (card: Omit<KanbanCard, 'id' | 'createdAt'>) => string;
  updateCard: (id: string, updates: Partial<KanbanCard>) => void;
  deleteCard: (id: string) => void;
  moveCard: (cardId: string, toColumnId: string) => void;
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      columns: DEFAULT_COLUMNS,
      cards: [],
      addColumn: (title) =>
        set((state) => ({
          columns: [...state.columns, { id: crypto.randomUUID(), title }],
        })),
      updateColumn: (id, updates) =>
        set((state) => ({
          columns: state.columns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteColumn: (id) =>
        set((state) => ({
          columns: state.columns.filter((c) => c.id !== id),
          cards: state.cards.filter((card) => card.columnId !== id),
        })),
      addCard: (card) => {
        const id = crypto.randomUUID();
        set((state) => ({
          cards: [...state.cards, { ...card, id, createdAt: new Date().toISOString() }],
        }));
        return id;
      },
      updateCard: (id, updates) =>
        set((state) => ({
          cards: state.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id),
        })),
      moveCard: (cardId, toColumnId) => {
        set((state) => ({
          cards: state.cards.map((c) => (c.id === cardId ? { ...c, columnId: toColumnId } : c)),
        }));
      },
      getCardsByColumn: (columnId: string) => get().cards.filter((c) => c.columnId === columnId),
    }),
    { name: 'timeflow-kanban-storage' }
  )
);
