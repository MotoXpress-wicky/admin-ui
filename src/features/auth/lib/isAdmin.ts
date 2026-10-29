import type { AuthUser } from '../types/auth.types';

export const isAdmin = (user: Pick<AuthUser, 'roles'> | null | undefined): boolean =>
  !!user?.roles?.includes('ROLE_ADMIN');
