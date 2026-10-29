// Shapes of payment-service (/api/v1/payment/admin/...). payment-service says "reference", never "order".
import type { PaymentStatus } from '@/features/orders/types/order.types';

export interface Payment {
  paymentNo: string;
  reference: string;
  method: 'COD';
  amount: number;
  currency: string;
  status: PaymentStatus;
  courier: string | null;
  trackingNumber: string | null;
  courierReceiptNo: string | null;
  createdAt: string;
  collectedAt: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  courier?: string;
  reference?: string;
  trackingNumber?: string;
  page?: number;
  size?: number;
}

export interface ReceiptSummary {
  id: string;
  courier: string;
  receiptNo: string;
  bankReference: string | null;
  receivedOn: string;
  collectedTotal: number;
  fees: number;
  amountReceived: number;
  paymentCount: number;
  createdBy: number;
  createdAt: string;
}

export interface ReceiptDetail {
  receipt: ReceiptSummary;
  payments: Payment[];
}

export interface NewReceipt {
  courier: string;
  receiptNo: string;
  bankReference?: string;
  receivedOn: string; // yyyy-mm-dd
  amountReceived: string; // typed as text, for example 11950.00
  trackingNumbers: string[];
  file: File;
}
