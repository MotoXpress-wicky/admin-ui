// Shapes of order-service (/api/v1/order/admin/...).

export type ShipmentStatus = 'NOT_SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COLLECTED' | 'PAID' | 'CANCELLED';

export const SHIPMENT_STATUSES: ShipmentStatus[] = ['NOT_SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELLED'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'COLLECTED', 'PAID', 'CANCELLED'];

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface OrderCounts {
  toShip: number;
  withCourier: number;
  cashWithCouriersCount: number;
  cashWithCouriersAmount: number;
  overdueCount: number;
  overdueAmount: number;
  overdueDays: number;
  currency: string;
}

export interface OrderSummary {
  orderNo: string;
  createdAt: string;
  shipmentStatus: ShipmentStatus;
  paymentStatus: PaymentStatus;
  total: number;
  currency: string;
  itemCount: number;
  customerName: string;
  customerEmail: string;
  city: string;
  courier: string | null;
  trackingNumber: string | null;
  customerConfirmedAt: string | null;
}

export interface OrderItem {
  productId: number;
  partNumber: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderShipment {
  id: number;
  courier: string;
  trackingNumber: string;
  status: 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';
  shippedAt: string | null;
  deliveredAt: string | null;
  returnedAt: string | null;
  returnReason: string | null;
  hasPickupReceipt: boolean;
}

export interface OrderDetail {
  orderNo: string;
  createdAt: string;
  shipmentStatus: ShipmentStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'COD';
  items: OrderItem[];
  itemsTotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  customer: {
    userId: number;
    name: string;
    email: string;
    phone: string;
    addressLine: string;
    city: string;
    district: string;
  };
  shipment: OrderShipment | null;
  customerConfirmedAt: string | null;
  cancelledBy: 'CUSTOMER' | 'ADMIN' | null;
  cancelledAt: string | null;
}

export interface OrderFilters {
  shipmentStatus?: ShipmentStatus;
  paymentStatus?: PaymentStatus;
  q?: string;
  from?: string; // yyyy-mm-dd
  to?: string;
  overdue?: boolean;
  page?: number;
  size?: number;
}
