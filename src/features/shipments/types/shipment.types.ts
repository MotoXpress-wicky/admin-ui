// Shapes of order-service (/api/v1/order/admin/shipments).
import type { PaymentStatus } from '@/features/orders/types/order.types';

export type ShipmentState = 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';
export const SHIPMENT_STATES: ShipmentState[] = ['IN_TRANSIT', 'DELIVERED', 'RETURNED'];

export type ReturnReason = 'REFUSED' | 'NOT_REACHABLE' | 'WRONG_ADDRESS' | 'OTHER';
export const RETURN_REASONS: ReturnReason[] = ['REFUSED', 'NOT_REACHABLE', 'WRONG_ADDRESS', 'OTHER'];

export interface ShipmentSummary {
  id: number;
  orderNo: string;
  customerName: string;
  courier: string;
  trackingNumber: string;
  status: ShipmentState;
  shippedAt: string | null;
  deliveredAt: string | null;
  returnedAt: string | null;
  returnReason: string | null;
  hasPickupReceipt: boolean;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
}

// Each shipment in a bulk action is handled on its own: some can work and some can fail.
export interface BulkResult {
  done: { shipmentId: number; orderNo: string }[];
  failed: { shipmentId: number; orderNo: string; code: string; message: string }[];
}

export interface ShipmentFilters {
  courier?: string;
  status?: ShipmentState;
  page?: number;
  size?: number;
}

export interface NewShipment {
  orderNo: string;
  courier: string;
  trackingNumber: string;
  pickupReceipt?: File | null;
}
