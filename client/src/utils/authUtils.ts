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

  useAuthStore.getState().login(session);

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
  total_amount_paid: number,
  user_id: string,
  status: string,
  billing_rate: number) => {

  const { data: { success, message }} = await axiosInstance.post('/auth/process-membership-purchase', 
    {  
    start_date,
    renewal_date,
    total_amount_paid,
    user_id,
    status,
    billing_rate
  });

  return { success, message };
};

export const fetchMembership = async (id: string) => {

  const { data: { success, message }} = await axiosInstance.post(
    '/auth/fetch-membership', { id });

  return { success, message };
};