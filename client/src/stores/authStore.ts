import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  spotifyAccessToken: string | null;
  spotifyRefreshToken: string | null;
  spotifyExpiresIn: number | null;
  setUser: (user: User | null) => void;
  login: (userData: AuthResponse) => void;
  logout: () => void;
  setSpotifyTokens: (tokens: SpotifyTokens) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      spotifyAccessToken: null,
      spotifyRefreshToken: null,
      spotifyExpiresIn: null,
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
          spotifyAccessToken: null,
          spotifyRefreshToken: null,
          spotifyExpiresIn: null,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          spotifyAccessToken: null,
          spotifyRefreshToken: null,
          spotifyExpiresIn: null,
        });
      },

      setSpotifyTokens: (tokens: SpotifyTokens) => {
        set({
          spotifyAccessToken: tokens.accessToken,
          spotifyRefreshToken: tokens.refreshToken,
          spotifyExpiresIn: tokens.expiresIn,
        });
      },
    }),
    { name: 'auth-storage' },
  ),
);
