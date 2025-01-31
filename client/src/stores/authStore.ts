import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (userData: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user }),

      login: (userData: AuthResponse) => {
        if (!userData || !userData.user || !userData.accessToken) {
          console.error('Invalid user data received');
          return;
        }
        set({
          user: userData.user,
          accessToken: userData.accessToken,
          refreshToken: userData.refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    { name: 'auth-storage' },
  ),
);
