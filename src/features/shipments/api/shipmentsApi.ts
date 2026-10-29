import { axiosClient } from '@/shared/api/axiosClient';
import type { OrderDetail, Page } from '@/features/orders/types/order.types';
import type { BulkResult, NewShipment, ReturnReason, ShipmentFilters, ShipmentSummary } from '../types/shipment.types';

const BASE = '/api/v1/order/admin/shipments';

export const shipmentsApi = {
  list: async (filters: ShipmentFilters): Promise<Page<ShipmentSummary>> => {
    const { data } = await axiosClient.get<Page<ShipmentSummary>>(BASE, { params: filters });
    return data;
  },

  // A multipart form. The browser sets the Content-Type (with the boundary) from the FormData.
  create: async (shipment: NewShipment): Promise<OrderDetail> => {
    const form = new FormData();
    form.append('orderNo', shipment.orderNo);
    form.append('courier', shipment.courier);
    form.append('trackingNumber', shipment.trackingNumber);
    if (shipment.pickupReceipt) form.append('pickupReceipt', shipment.pickupReceipt);
    const { data } = await axiosClient.post<OrderDetail>(BASE, form);
    return data;
  },

  delivered: async (shipmentIds: number[]): Promise<BulkResult> => {
    const { data } = await axiosClient.post<BulkResult>(`${BASE}/delivered`, { shipmentIds });
    return data;
  },

  returned: async (shipmentIds: number[], reason: ReturnReason): Promise<BulkResult> => {
    const { data } = await axiosClient.post<BulkResult>(`${BASE}/returned`, { shipmentIds, reason });
    return data;
  },

  // The pickup receipt is private. It is opened through this admin URL, with the login cookie.
  pickupReceiptUrl: (id: number): string =>
    `${axiosClient.defaults.baseURL ?? ''}${BASE}/${id}/pickup-receipt`,
};
