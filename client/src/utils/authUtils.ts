import { useAuthStore } from '../stores/authStore';
import axiosInstance from '../axiosInstance';

export const authenticateUser = async (email: string, password: string) => {
  const {
    data: { session },
  } = await axiosInstance.post('/auth/login', {
    email,
    password,
  });

  useAuthStore.getState().login({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
    },
  });

  return { success: true };
};
