import useAuthStore from '../stores/authStore';
import axiosInstance from './axiosInstance';

export const handleLogin = async (email: string, password: string) => {
  const {
    data: { session },
  } = await axiosInstance.post('/auth/login', {
    email,
    password,
  });

  useAuthStore.getState().setUser({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.display_name,
      firstName: session.user.first_name,
      lastName: session.user.last_name,
    },
  });

  localStorage.setItem('accessToken', session.accessToken);
  localStorage.setItem('refreshToken', session.refreshToken);

  return true;
};
