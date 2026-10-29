import { axiosClient } from '@/shared/api/axiosClient';
import type { Page } from '@/features/orders/types/order.types';
import type { NewReceipt, Payment, PaymentFilters, ReceiptDetail, ReceiptSummary } from '../types/payment.types';

const BASE = '/api/v1/payment/admin';

export const paymentsApi = {
  list: async (filters: PaymentFilters): Promise<Page<Payment>> => {
    const { data } = await axiosClient.get<Page<Payment>>(`${BASE}/payments`, { params: filters });
    return data;
  },

  receipts: async (courier?: string, page = 0): Promise<Page<ReceiptSummary>> => {
    const { data } = await axiosClient.get<Page<ReceiptSummary>>(`${BASE}/courier-receipts`, {
      params: { courier: courier || undefined, page },
    });
    return data;
  },

  receipt: async (id: string): Promise<ReceiptDetail> => {
    const { data } = await axiosClient.get<ReceiptDetail>(`${BASE}/courier-receipts/${id}`);
    return data;
  },

  // A multipart form. The tracking numbers are the same field repeated. If one is wrong, nothing is saved.
  createReceipt: async (receipt: NewReceipt): Promise<ReceiptDetail> => {
    const form = new FormData();
    form.append('courier', receipt.courier);
    form.append('receiptNo', receipt.receiptNo);
    if (receipt.bankReference) form.append('bankReference', receipt.bankReference);
    form.append('receivedOn', receipt.receivedOn);
    form.append('amountReceived', receipt.amountReceived);
    receipt.trackingNumbers.forEach((t) => form.append('trackingNumbers', t));
    form.append('file', receipt.file);
    const { data } = await axiosClient.post<ReceiptDetail>(`${BASE}/courier-receipts`, form);
    return data;
  },

  // The receipt file is private. It is opened through this admin URL, with the login cookie.
  receiptFileUrl: (id: string): string => `${axiosClient.defaults.baseURL ?? ''}${BASE}/courier-receipts/${id}/file`,
};
