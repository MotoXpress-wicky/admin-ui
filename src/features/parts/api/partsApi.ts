import { axiosClient } from '@/shared/api/axiosClient';
import type {
  AdminPart,
  BikeModel,
  Brand,
  Category,
  Page,
  PartFilters,
  PartInput,
  PhotoRef,
  StockMovement,
  StockReason,
} from '../types/part.types';

const BASE = '/api/v1/product/admin';

export const partsApi = {
  list: async (filters: PartFilters): Promise<Page<AdminPart>> => {
    const { data } = await axiosClient.get<Page<AdminPart>>(`${BASE}/products`, { params: filters });
    return data;
  },

  get: async (id: number): Promise<AdminPart> => {
    const { data } = await axiosClient.get<AdminPart>(`${BASE}/products/${id}`);
    return data;
  },

  create: async (input: PartInput): Promise<AdminPart> => {
    const { data } = await axiosClient.post<AdminPart>(`${BASE}/products`, input);
    return data;
  },

  update: async (id: number, input: PartInput): Promise<AdminPart> => {
    // initialStock belongs to a new part only. The edit endpoint does not take it.
    const body = { ...input };
    delete body.initialStock;
    const { data } = await axiosClient.put<AdminPart>(`${BASE}/products/${id}`, body);
    return data;
  },

  setActive: async (id: number, active: boolean): Promise<AdminPart> => {
    const { data } = await axiosClient.patch<AdminPart>(`${BASE}/products/${id}`, { active });
    return data;
  },

  adjustStock: async (id: number, change: number, reason: StockReason, note?: string) => {
    const { data } = await axiosClient.post<{ productId: number; stockQty: number }>(`${BASE}/products/${id}/stock`, {
      change,
      reason,
      note: note || undefined,
    });
    return data;
  },

  stockHistory: async (id: number, page = 0): Promise<Page<StockMovement>> => {
    const { data } = await axiosClient.get<Page<StockMovement>>(`${BASE}/products/${id}/stock`, { params: { page } });
    return data;
  },

  uploadPhoto: async (id: number, file: File): Promise<PhotoRef> => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await axiosClient.post<PhotoRef>(`${BASE}/products/${id}/photos`, form);
    return data;
  },

  deletePhoto: async (id: number, photoId: number): Promise<void> => {
    await axiosClient.delete(`${BASE}/products/${id}/photos/${photoId}`);
  },

  // ----- brands, models, categories (the pick lists) -----

  brands: async (): Promise<Brand[]> => (await axiosClient.get<Brand[]>(`${BASE}/brands`)).data,
  createBrand: async (name: string): Promise<Brand> => (await axiosClient.post<Brand>(`${BASE}/brands`, { name })).data,
  updateBrand: async (id: number, change: { name?: string; active?: boolean }): Promise<Brand> =>
    (await axiosClient.patch<Brand>(`${BASE}/brands/${id}`, change)).data,

  models: async (brandId: number): Promise<BikeModel[]> =>
    (await axiosClient.get<BikeModel[]>(`${BASE}/brands/${brandId}/models`)).data,
  createModel: async (
    brandId: number,
    model: { name: string; yearFrom?: number; yearTo?: number; engineCc?: number },
  ): Promise<BikeModel> => (await axiosClient.post<BikeModel>(`${BASE}/brands/${brandId}/models`, model)).data,
  updateModel: async (id: number, change: { name?: string; active?: boolean }): Promise<BikeModel> =>
    (await axiosClient.patch<BikeModel>(`${BASE}/models/${id}`, change)).data,

  categories: async (): Promise<Category[]> => (await axiosClient.get<Category[]>(`${BASE}/categories`)).data,
  createCategory: async (name: string): Promise<Category> =>
    (await axiosClient.post<Category>(`${BASE}/categories`, { name })).data,
  updateCategory: async (id: number, change: { name?: string; active?: boolean }): Promise<Category> =>
    (await axiosClient.patch<Category>(`${BASE}/categories/${id}`, change)).data,
};
