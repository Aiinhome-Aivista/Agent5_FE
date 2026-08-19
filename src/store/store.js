import { create } from 'zustand';

export const useAppStore = create((set) => ({
  provider: 'all', // 'all' | 'aws' | 'azure'
  accountId: null,
  setProvider: (provider) => set({ provider, accountId: null }),
  setAccountId: (accountId) => set({ accountId }),

  // Detected display currency (set by Dashboard from /telemetry/dashboard/overview)
  currency: 'USD',
  setCurrency: (currency) => set({ currency: 'USD' }),

  // Theme: 'dark' | 'light'
  theme: localStorage.getItem('theme') || 'dark',
  toggleTheme: () =>
    set((s) => {
      const nextTheme = s.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: nextTheme };
    }),
  initTheme: () => {
    const saved = localStorage.getItem('theme') || 'dark';
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  // Toast queue
  toasts: [],
  pushToast: (toast) =>
    set((s) => ({ toasts: [...s.toasts, { id: Date.now() + Math.random(), ...toast }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
