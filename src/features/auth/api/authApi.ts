import { axiosClient } from '@/shared/api/axiosClient';
import type { AuthUser, LoginCredentials } from '../types/auth.types';

// The admin site only logs in. Admins are normal users with ROLE_ADMIN (no admin-service).
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthUser> => {
    const { data } = await axiosClient.post<AuthUser>('/api/v1/user/auth/login', credentials);
    return data;
  },

  me: async (): Promise<AuthUser> => {
    const { data } = await axiosClient.get<AuthUser>('/api/v1/user/auth/me');
    return data;
  },

  refresh: async (): Promise<AuthUser> => {
    const { data } = await axiosClient.post<AuthUser>('/api/v1/user/auth/refresh');
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/api/v1/user/auth/logout');
  },
};
