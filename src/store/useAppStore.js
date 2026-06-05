import { create } from 'zustand';

/**
 * Global Zustand App Store
 * Handles lightweight global user session state for KisanApp.
 */
export const useAppStore = create((set) => ({
  // User profile session state (holds authenticated user metadata)
  user: null,

  // Action: Set active authenticated user session
  setUser: (userData) => set({ user: userData }),

  // Action: Clear user session on logout
  logout: () => set({ user: null }),
}));
