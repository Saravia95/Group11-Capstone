import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum Role {
  Admin = 'admin',
  Customer = 'customer',
}

interface User {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: Role;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface IAuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (userData: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

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
