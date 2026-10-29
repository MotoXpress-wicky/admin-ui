import { axiosClient } from '@/shared/api/axiosClient';
import type { AdminUser, AuditEntry, Page, UserChange } from '../types/user.types';

const BASE = '/api/v1/user/admin';

export const usersApi = {
  list: async (q: string | undefined, page: number): Promise<Page<AdminUser>> => {
    const { data } = await axiosClient.get<Page<AdminUser>>(`${BASE}/users`, { params: { q, page } });
    return data;
  },

  change: async (id: number, change: UserChange): Promise<AdminUser> => {
    const { data } = await axiosClient.patch<AdminUser>(`${BASE}/users/${id}`, change);
    return data;
  },

  auditLog: async (page: number): Promise<Page<AuditEntry>> => {
    const { data } = await axiosClient.get<Page<AuditEntry>>(`${BASE}/audit-log`, { params: { page } });
    return data;
  },
};
