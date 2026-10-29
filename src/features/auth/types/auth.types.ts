export type AuthUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
}


export type LoginCredentials = {
  email: string;
  password: string;
}

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  captchaToken: string;
}


export const ErrorCode = {
  // token problems
  ACCESS_TOKEN_MISSING: 'ACCESS_TOKEN_MISSING',
  ACCESS_TOKEN_EXPIRED: 'ACCESS_TOKEN_EXPIRED',
  ACCESS_TOKEN_INVALID: 'ACCESS_TOKEN_INVALID',
  REFRESH_TOKEN_MISSING: 'REFRESH_TOKEN_MISSING',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
  REFRESH_TOKEN_REUSED: 'REFRESH_TOKEN_REUSED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',

  // sign-in problems
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCESS_DENIED: 'ACCESS_DENIED',

  // bad input
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  INVALID_CAPTCHA: 'INVALID_CAPTCHA',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',

  // conflicts
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  OAUTH_ACCOUNT_EXISTS: 'OAUTH_ACCOUNT_EXISTS',
  DATA_CONFLICT: 'DATA_CONFLICT',

  // other
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];


export type ApiErrorBody = {
  timestamp: string;
  status: number;
  code: ErrorCode;
  message: string;
  path: string;
  refreshable: boolean;
  details: string[];
};

export type ForgotPasswordData =  {
  email:string;
  
}

export type ResetPasswordData = {
  token:string,
  newPassword:string,
}

