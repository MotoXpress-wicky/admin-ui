// Shapes of product-service (/api/v1/product/admin/...).
import type { Page } from '@/features/orders/types/order.types';

export type { Page };

export type PartCondition = 'NEW' | 'USED';
export type StockReason = 'INITIAL' | 'RESTOCK' | 'CORRECTION' | 'ORDER_RESERVED' | 'ORDER_RELEASED';

export interface Brand {
  id: number;
  name: string;
  active: boolean;
}

export interface BikeModel {
  id: number;
  brandId: number;
  name: string;
  yearFrom: number | null;
  yearTo: number | null;
  engineCc: number | null;
  active: boolean;
}

export interface Category {
  id: number;
  name: string;
  active: boolean;
}

export interface PhotoRef {
  id: number;
  url: string;
}

export interface BikeRef {
  id: number;
  brandId: number;
  brand: string;
  name: string;
}

export interface AdminPart {
  id: number;
  partNumber: string;
  name: string;
  description: string | null;
  category: { id: number; name: string } | null;
  partBrand: string | null;
  condition: PartCondition;
  price: number;
  stockQty: number;
  universalFit: boolean;
  active: boolean;
  bikes: BikeRef[];
  photos: PhotoRef[];
  createdAt: string;
  updatedAt: string;
}

// POST (new) and PUT (edit) send the same fields. Only a new part can have an initial stock.
export interface PartInput {
  partNumber: string;
  name: string;
  description?: string;
  categoryId: number;
  partBrand?: string;
  condition: PartCondition;
  price: number;
  universalFit: boolean;
  bikeModelIds: number[];
  initialStock?: number;
}

export interface PartFilters {
  q?: string;
  categoryId?: number;
  bikeModelId?: number;
  active?: boolean;
  page?: number;
  size?: number;
}

export interface StockMovement {
  id: number;
  change: number;
  reason: StockReason;
  note: string | null;
  orderNo: string | null;
  adminUserId: number | null;
  createdAt: string;
}
