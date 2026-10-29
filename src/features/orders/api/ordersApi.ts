import { axiosClient } from '@/shared/api/axiosClient';
import type { OrderCounts, OrderDetail, OrderFilters, OrderSummary, Page } from '../types/order.types';

const BASE = '/api/v1/order/admin/orders';

export const ordersApi = {
  summary: async (): Promise<OrderCounts> => {
    const { data } = await axiosClient.get<OrderCounts>(`${BASE}/summary`);
    return data;
  },

  list: async (filters: OrderFilters): Promise<Page<OrderSummary>> => {
    const { data } = await axiosClient.get<Page<OrderSummary>>(BASE, { params: filters });
    return data;
  },

  get: async (orderNo: string): Promise<OrderDetail> => {
    const { data } = await axiosClient.get<OrderDetail>(`${BASE}/${encodeURIComponent(orderNo)}`);
    return data;
  },

  // Only before the order is shipped.
  cancel: async (orderNo: string): Promise<OrderDetail> => {
    const { data } = await axiosClient.post<OrderDetail>(`${BASE}/${encodeURIComponent(orderNo)}/cancel`);
    return data;
  },
};
