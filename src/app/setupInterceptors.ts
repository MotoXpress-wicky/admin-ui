import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { axiosClient } from '@/shared/api/axiosClient';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { ApiErrorBody } from '@/features/auth/types/auth.types';

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// A 401 from these must never start a refresh.
// login/register -> wrong credentials, the form shows the error.
// refresh/logout  -> refreshing these would recurse.
const NO_REFRESH_ENDPOINTS = [
  '/api/v1/user/auth/login',
  '/api/v1/user/auth/register',
  '/api/v1/user/auth/refresh',
  '/api/v1/user/auth/logout',
] as const;

// Shared across callers so N parallel 401s cause exactly ONE refresh.
// Without this, rotation sees the second call replaying a spent token,
// flags it as reuse, and revokes every session the user has.
let refreshPromise: Promise<void> | null = null;

const refreshSession = (): Promise<void> => {
  refreshPromise ??= authApi
    .refresh()
    .then((user) => {
      useAuthStore.getState().setUser(user);
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const setupInterceptors = () => {
  axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorBody>) => {
      const config = error.config as RetriableConfig | undefined;
      const url = config?.url ?? '';

      if (error.response?.status !== 401 || !config) {
        return Promise.reject(error);
      }

      if (NO_REFRESH_ENDPOINTS.some((path) => url.includes(path))) {
        if (url.includes('/api/v1/user/auth/refresh')) {
          useAuthStore.getState().clearSession();
        }
        return Promise.reject(error);
      }

      // The server decides. Only ACCESS_TOKEN_EXPIRED sets refreshable: true.
      if (!error.response.data?.refreshable || config._retried) {
        useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }

      config._retried = true;

      try {
        await refreshSession();
        return await axiosClient(config);
      } catch (refreshError) {
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      }
    },
  );
};