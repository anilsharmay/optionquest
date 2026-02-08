import { create } from 'zustand';
import * as api from '../api/apiClient';

const useStore = create((set, get) => ({
  user: null,
  positions: [],
  completedLessons: [],
  activeQuest: null,
  theme: localStorage.getItem('theme') || 'classroom', 
  plainEnglishEnabled: false,

  setActiveQuest: (quest) => set({ activeQuest: quest }),
  clearActiveQuest: () => set({ activeQuest: null }),

  resetPortfolio: async (id = 1) => {
    await api.resetPortfolio(id);
    get().fetchUser(id); // Refetch user to update cash/total_deposited
    get().fetchPositions(id); // Clear positions
    // Do NOT reset lessons or XP here
  },

  fetchUser: async (id = 1) => {
    const res = await api.fetchUser(id);
    set({ user: res.data });
    // Don't overwrite theme from DB immediately if user just manually changed it
    if (!localStorage.getItem('theme')) {
      set({ theme: res.data.theme });
    }
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'classroom' ? 'terminal' : 'classroom';
    set({ theme: newTheme });
    localStorage.setItem('theme', newTheme);
  },


  fetchPositions: async (id = 1) => {
    const res = await api.fetchPositions(id);
    set({ positions: res.data });
  },

  fetchLessons: async (id = 1) => {
    const res = await api.fetchLessons(id);
    set({ completedLessons: res.data });
  },

  toggleJargon: () => set((state) => ({ plainEnglishEnabled: !state.plainEnglishEnabled })),

  deposit: async (amount, id = 1, silent = false) => {
    await api.deposit(id, amount);
    get().fetchUser(id);
    if (!silent) {
       // toast handled by component usually, but this is a helper
    }
  },

  buyPosition: async (tradeData) => {
    await api.buyTrade(tradeData);
    get().fetchUser(tradeData.userId);
    get().fetchPositions(tradeData.userId);
  },

  sellPosition: async (sellData) => {
    await api.sellTrade(sellData);
    get().fetchUser(sellData.userId);
    get().fetchPositions(sellData.userId);
  },

  completeLesson: async (lessonId, xpGained, userId = 1) => {
    await api.completeLesson(userId, lessonId, xpGained);
    set({ activeQuest: null });
    get().fetchUser(userId);
    get().fetchLessons(userId);
  },
}));

export default useStore;
