import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import { COURIERS } from '@/shared/config';
import { getErrorMessage } from '@/shared/lib/getErrorMessage';
import { shipmentsApi } from '../api/shipmentsApi';

const schema = z.object({
  orderNo: z.string().trim().min(1, 'Order number is required'),
  courier: z.string().min(1, 'Choose a courier'),
  trackingNumber: z.string().trim().min(1, 'Tracking number is required').max(100, 'At most 100 characters'),
});
type Values = z.infer<typeof schema>;

type Props = {
  initialOrderNo?: string;
  onCreated: () => void;
};

// New shipment: the admin hands an order to a courier and types the tracking number.
// The photo or PDF of the courier's pickup receipt is optional.
export const NewShipmentForm = ({ initialOrderNo = '', onCreated }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { orderNo: initialOrderNo, courier: '', trackingNumber: '' },
  });

  const onSubmit = async (values: Values) => {
    setError(null);
    try {
      await shipmentsApi.create({ ...values, pickupReceipt: file });
      toast.success(`Order ${values.orderNo} is now with ${values.courier}`);
      reset({ orderNo: '', courier: values.courier, trackingNumber: '' });
      setFile(null);
      onCreated();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>New shipment</h2>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="form-grid">
        <InputField label="Order number" placeholder="MX-10001" error={errors.orderNo?.message} {...register('orderNo')} />

        <div className="field">
          <label className="field-label" htmlFor="courier">
            Courier
          </label>
          <select id="courier" aria-invalid={!!errors.courier} {...register('courier')}>
            <option value="">Choose a courier</option>
            {COURIERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.courier && <span className="input-error">{errors.courier.message}</span>}
        </div>

        <InputField label="Tracking number" error={errors.trackingNumber?.message} {...register('trackingNumber')} />

        <div className="field">
          <label className="field-label" htmlFor="pickupReceipt">
            Pickup receipt (photo or PDF, optional)
          </label>
          <input
            id="pickupReceipt"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
      <Button type="submit" isLoading={isSubmitting}>
        Create shipment
      </Button>
    </form>
  );
};
