import { create } from 'zustand';
import { authApi } from '../api/authApi';
import type { AuthUser } from '../types/auth.types';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',

  setUser: (user) => set({ user, status: 'authenticated' }),

  clearSession: () => set({ user: null, status: 'unauthenticated' }),

  // Fill the auth state when the app runs initialy and on a page refresh
  initialize: async () => {
    if (get().status !== 'idle') return; // guards StrictMode double-invoke
    set({ status: 'loading' });
    try {
      const user = await authApi.me();
      get().setUser(user);

      
    } catch {
      get().clearSession();
    }
  },

  logout: async () => {
    try {
      await authApi.logout(); //clear auth cookies
    } finally {
      get().clearSession(); //clear the data inside auth state
    }
  },
}));

export const selectIsAuthenticated = (state: AuthState) =>
  state.status === 'authenticated';

export const selectIsResolving = (state: AuthState) =>
  state.status === 'idle' || state.status === 'loading';