import { useCallback, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import { useFetch } from '@/shared/hooks/useFetch';
import { getErrorMessage } from '@/shared/lib/getErrorMessage';
import { partsApi } from '../api/partsApi';
import type { AdminPart } from '../types/part.types';

// Same limits as product-service (ProductCreate / ProductUpdate).
const schema = z.object({
  partNumber: z.string().trim().min(1, 'Part number is required').max(50, 'At most 50 characters'),
  name: z.string().trim().min(1, 'Name is required').max(200, 'At most 200 characters'),
  description: z.string().max(4000, 'At most 4000 characters').optional(),
  categoryId: z.string().min(1, 'Choose a category'),
  partBrand: z.string().trim().max(100, 'At most 100 characters').optional(),
  condition: z.enum(['NEW', 'USED']),
  price: z.string().trim().regex(/^\d{1,10}(\.\d{1,2})?$/, 'Type a price, for example 3500.00'),
  initialStock: z.string().trim().regex(/^\d{0,7}$/, 'A whole number').optional(),
  universalFit: z.boolean(),
});
type Values = z.infer<typeof schema>;

type Props = {
  part: AdminPart | null; // null = a new part
  onSaved: (part: AdminPart) => void;
};

export const PartForm = ({ part, onSaved }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [bikeIds, setBikeIds] = useState<Set<number>>(new Set(part?.bikes.map((b) => b.id) ?? []));

  const loadCategories = useCallback(() => partsApi.categories(), []);
  const categories = useFetch(loadCategories);

  // All bike models, grouped by brand, for the "fits these bikes" ticks.
  const loadBikes = useCallback(async () => {
    const brands = await partsApi.brands();
    return Promise.all(brands.map(async (brand) => ({ brand, models: await partsApi.models(brand.id) })));
  }, []);
  const bikes = useFetch(loadBikes);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      partNumber: part?.partNumber ?? '',
      name: part?.name ?? '',
      description: part?.description ?? '',
      categoryId: part?.category ? String(part.category.id) : '',
      partBrand: part?.partBrand ?? '',
      condition: part?.condition ?? 'NEW',
      price: part ? String(part.price) : '',
      initialStock: '0',
      universalFit: part?.universalFit ?? false,
    },
  });

  const universal = useWatch({ control, name: 'universalFit' });

  const toggleBike = (id: number) =>
    setBikeIds((old) => {
      const next = new Set(old);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onSubmit = async (v: Values) => {
    setError(null);
    const input = {
      partNumber: v.partNumber,
      name: v.name,
      description: v.description || undefined,
      categoryId: Number(v.categoryId),
      partBrand: v.partBrand || undefined,
      condition: v.condition,
      price: Number(v.price),
      universalFit: v.universalFit,
      bikeModelIds: v.universalFit ? [] : [...bikeIds],
      initialStock: v.initialStock ? Number(v.initialStock) : 0,
    };
    try {
      const saved = part ? await partsApi.update(part.id, input) : await partsApi.create(input);
      toast.success(part ? 'Part saved' : `Part ${saved.partNumber} created`);
      onSaved(saved);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      <div className="form-grid">
        <InputField label="Part number" error={errors.partNumber?.message} {...register('partNumber')} />
        <InputField label="Name" error={errors.name?.message} {...register('name')} />
        <InputField label="Part brand (optional)" error={errors.partBrand?.message} {...register('partBrand')} />
        <InputField label="Price (LKR)" inputMode="decimal" error={errors.price?.message} {...register('price')} />
        {!part && <InputField label="Starting stock" inputMode="numeric" error={errors.initialStock?.message} {...register('initialStock')} />}

        <div className="field">
          <label className="field-label" htmlFor="categoryId">
            Category
          </label>
          <select id="categoryId" aria-invalid={!!errors.categoryId} {...register('categoryId')}>
            <option value="">Choose a category</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.active ? '' : ' (hidden)'}
              </option>
            ))}
          </select>
          {errors.categoryId && <span className="input-error">{errors.categoryId.message}</span>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="condition">
            Condition
          </label>
          <select id="condition" {...register('condition')}>
            <option value="NEW">New</option>
            <option value="USED">Used</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="description">
          Description
        </label>
        <textarea id="description" rows={4} {...register('description')} />
        {errors.description && <span className="input-error">{errors.description.message}</span>}
      </div>

      <div className="field">
        <label>
          <input type="checkbox" {...register('universalFit')} /> Fits every bike
        </label>
      </div>

      {!universal && (
        <div className="field">
          <span className="field-label">Fits these bikes</span>
          {bikes.isLoading && <p className="muted">Loading bikes...</p>}
          {bikes.data?.map(({ brand, models }) => (
            <div key={brand.id}>
              <strong>{brand.name}</strong>
              <div className="checks">
                {models.map((m) => (
                  <label key={m.id}>
                    <input type="checkbox" checked={bikeIds.has(m.id)} onChange={() => toggleBike(m.id)} />
                    {m.name}
                  </label>
                ))}
                {models.length === 0 && <span className="muted">No models yet</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        {part ? 'Save changes' : 'Create part'}
      </Button>
    </form>
  );
};
