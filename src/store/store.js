import { create } from 'zustand';

export const useAppStore = create((set) => ({
  provider: 'all', // 'all' | 'aws' | 'azure'
  accountId: null,
  setProvider: (provider) => set({ provider, accountId: null }),
  setAccountId: (accountId) => set({ accountId }),

  // Detected display currency (set by Dashboard from /telemetry/dashboard/overview)
  currency: 'USD',
  setCurrency: (currency) => set({ currency: 'USD' }),

  // Toast queue
  toasts: [],
  pushToast: (toast) =>
    set((s) => ({ toasts: [...s.toasts, { id: Date.now() + Math.random(), ...toast }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
