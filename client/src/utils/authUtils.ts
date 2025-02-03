import { useAuthStore } from '../stores/authStore';
import axiosInstance from '../config/axiosInstance';
import { supabase } from '../config/supabase';

export const authenticateUser = async (email: string, password: string) => {
  const { data: session } = await axiosInstance.post('/auth/login', {
    email,
    password,
  });

  if (!session.success) {
    return { success: false, message: session.message };
  }

  useAuthStore.getState().login(session);

  return { success: true };
};

export const authenticateUserWithGoogle = async () => {
  const {
    data: { success, url },
  } = await axiosInstance.post('/auth/google-login');

  if (!success) {
    return { success: false };
  }

  window.location.href = url;
};

export const verifySession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error(error);
    return { success: false };
  }

  const { data } = await axiosInstance.post('/auth/verify-google-oauth', {
    session,
  });

  if (!data.success) {
    return { success: false };
  }

  useAuthStore.getState().login(data);

  return { success: true };
};

export const verifyQRCode = async (id: string) => {
  const { data: session } = await axiosInstance.post('/auth/verify-qr', {
    id,
  });

  if (!session.success) {
    return { success: false };
  }

  useAuthStore.getState().login(session);

  return { success: true };
};

export const logoutUser = async () => {
  const {
    data: { success, message },
  } = await axiosInstance.post('/auth/logout');

  useAuthStore.getState().logout();

  return { success, message };
};

export const requestPasswordReset = async (email: string) => {
  const {
    data: { success, message },
  } = await axiosInstance.post('/auth/request-password-reset', { email });

  return { success, message };
};

export const resetPassword = async (
  accessToken: string,
  refreshToken: string,
  newPassword: string,
) => {
  const {
    data: { success, message },
  } = await axiosInstance.post('/auth/reset-password', {
    accessToken: accessToken,
    refreshToken: refreshToken,
    newPassword: newPassword,
  });

  return { success, message };
};

export const registerUser = async (
  displayName: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) => {
  const {
    data: { success, message },
  } = await axiosInstance.post('/auth/register-user', {
    displayName,
    firstName,
    lastName,
    email,
    password,
  });

  return { success, message };
};

export const processMembershipPurchase = async (
  start_date: string,
  renewal_date: string,
  user_id: string,
  membership_status: boolean,
  billing_rate: number,
) => {
  const {
    data: { success, message },
  } = await axiosInstance.post('/auth/process-membership-purchase', {
    start_date,
    renewal_date,
    user_id,
    membership_status,
    billing_rate,
  });

  return { success, message };
};

export const fetchMembership = async (id: string, email: string) => {
  const {
    data: { success, message },
  } = await axiosInstance.post('/auth/fetch-membership', { id, email });

  return { success, message };
};

export const createCheckoutSession = async (id: string, email: string) => {
  const {
    data: { success, message },
  } = await axiosInstance.post('/auth/create-checkout-session', { id, email });

  return { success, message };
};
