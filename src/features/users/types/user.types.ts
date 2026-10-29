// Shapes of user-service (/api/v1/user/admin/...).
import type { Page } from '@/features/orders/types/order.types';

export type { Page };

export interface AdminUser {
  id: number;
  name: string | null;
  email: string;
  roles: string[];
  authProvider: 'LOCAL' | 'GOOGLE';
  locked: boolean;
  admin: boolean;
}

// PATCH body. A missing field means "do not change it".
export interface UserChange {
  locked?: boolean;
  admin?: boolean;
}

export type AuditAction = 'LOCK' | 'UNLOCK' | 'GRANT_ADMIN' | 'REVOKE_ADMIN';

export interface AuditEntry {
  id: number;
  adminUserId: number | null; // empty when the start-up bootstrap made the change
  adminEmail: string;
  action: AuditAction;
  targetUserId: number;
  targetEmail: string;
  createdAt: string;
}
