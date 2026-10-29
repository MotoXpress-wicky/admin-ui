import axios from 'axios';
import type { ApiErrorBody, ErrorCode } from '@/features/auth/types/auth.types';


export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return (
      error.response?.data?.message ??
      'Something went wrong. Please try again.'
    );
  }

  return 'An unexpected error occurred.';
};


export const getErrorCode = (error: unknown): ErrorCode | undefined => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.code;
  }
  return undefined;
};
