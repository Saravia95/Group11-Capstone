/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';

interface IAuthStore {
  user: any;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (userData: any) => void;
  logout: () => void;
}

const useAuthStore = create<IAuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUser: (userData: any) =>
    set({
      user: userData.user,
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
      isAuthenticated: true,
    }),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
