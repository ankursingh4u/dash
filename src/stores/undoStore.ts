import { create } from 'zustand';
import { UndoHistoryItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface UndoState {
  history: UndoHistoryItem[];
  maxHistory: number;
  addAction: (action: Omit<UndoHistoryItem, 'id' | 'created_at'>) => string;
  revertAction: (id: string) => UndoHistoryItem | null;
  getHistory: () => UndoHistoryItem[];
  clearHistory: () => void;
}

export const useUndoStore = create<UndoState>()((set, get) => ({
  history: [],
  maxHistory: 100,

  addAction: (action) => {
    const id = uuidv4();
    const newItem: UndoHistoryItem = {
      ...action,
      id,
      created_at: new Date().toISOString(),
    };

    set((state) => {
      const newHistory = [newItem, ...state.history].slice(0, state.maxHistory);
      return { history: newHistory };
    });

    return id;
  },

  revertAction: (id) => {
    const { history } = get();
    const item = history.find((h) => h.id === id);

    if (!item || item.reverted_at) {
      return null;
    }

    // Mark as reverted
    set((state) => ({
      history: state.history.map((h) =>
        h.id === id ? { ...h, reverted_at: new Date().toISOString() } : h
      ),
    }));

    return item;
  },

  getHistory: () => {
    return get().history.filter((h) => !h.reverted_at);
  },

  clearHistory: () => {
    set({ history: [] });
  },
}));
