import { useAuthStore } from '../stores/authStore';
import axiosInstance from '../config/axiosInstance';

export const authenticateUser = async (email: string, password: string) => {
  const { data: session } = await axiosInstance.post('/auth/login', {
    email,
    password,
  });

  if (!session.success) {
    return { success: false, message: session.message };
  }

  useAuthStore.getState().login({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      role: session.user.role,
    },
  });

  return { success: true };
};

export const verifyQRCode = async (id: string) => {
  const { data: session } = await axiosInstance.post('/auth/verify-qr', {
    id,
  });

  if (!session.success) {
    return { success: false };
  }

  useAuthStore.getState().login({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      role: session.user.role,
    },
  });

  return { success: true };
};

export const logoutUser = async () => {
  await axiosInstance.post('/auth/logout');

  useAuthStore.getState().logout();

  return { success: true };
};

export const requestPasswordReset = async (email: string) => {
  await axiosInstance.post('/auth/request-password-reset', { email: email });

  return { success: true };
};

export const resetPassword = async (
  accessToken: string,
  refreshToken: string,
  newPassword: string,
) => {
  await axiosInstance.post('/auth/reset-password', {
    accessToken: accessToken,
    refreshToken: refreshToken,
    newPassword: newPassword,
  });

  return { success: true };
};

export const registerUser = async (
  displayName: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) => {
  await axiosInstance.post('/auth/register-user', {
    displayName,
    firstName,
    lastName,
    email,
    password,
  });

  return { success: true };
};
