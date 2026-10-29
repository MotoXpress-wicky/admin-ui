import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import { COURIERS } from '@/shared/config';
import { useFetch } from '@/shared/hooks/useFetch';
import { formatMoney } from '@/shared/lib/format';
import { getErrorMessage } from '@/shared/lib/getErrorMessage';
import type { ApiErrorBody } from '@/features/auth/types/auth.types';
import { paymentsApi } from '../api/paymentsApi';

const schema = z.object({
  receiptNo: z.string().trim().min(1, 'Receipt number is required').max(100, 'At most 100 characters'),
  bankReference: z.string().trim().max(100, 'At most 100 characters').optional(),
  receivedOn: z.string().min(1, 'Choose the date'),
  amountReceived: z.string().trim().regex(/^\d{1,10}(\.\d{1,2})?$/, 'Type an amount, for example 11950.00'),
});
type Values = z.infer<typeof schema>;

const cents = (amount: number) => Math.round(amount * 100);

// New courier receipt. The courier pays for a group of delivered parcels. The admin ticks those parcels,
// types what arrived and attaches the courier's receipt. If anything is wrong, nothing is saved.
export const NewReceiptPage = () => {
  const navigate = useNavigate();
  const [courier, setCourier] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  // Parcels whose cash the courier holds (payment status COLLECTED), for the chosen courier.
  const loadCollected = useCallback(
    () =>
      courier
        ? paymentsApi.list({ status: 'COLLECTED', courier, size: 100 })
        : Promise.resolve({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 }),
    [courier],
  );
  const collected = useFetch(loadCollected);
  const payments = collected.data?.content ?? [];

  const chosen = payments.filter((p) => p.trackingNumber && selected.has(p.trackingNumber));
  const collectedCents = chosen.reduce((sum, p) => sum + cents(p.amount), 0);
  const receivedText = useWatch({ control, name: 'amountReceived' });
  const receivedCents = /^\d+(\.\d{1,2})?$/.test(receivedText ?? '') ? cents(Number(receivedText)) : null;
  const feesCents = receivedCents === null ? null : collectedCents - receivedCents;

  const toggle = (tracking: string) =>
    setSelected((old) => {
      const next = new Set(old);
      if (next.has(tracking)) next.delete(tracking);
      else next.add(tracking);
      return next;
    });

  const onSubmit = async (values: Values) => {
    setError(null);
    setProblems([]);
    if (!file) {
      setFileError('The receipt file (PDF or photo) is required');
      return;
    }
    setFileError(null);
    if (chosen.length === 0) {
      setError('Tick at least one parcel.');
      return;
    }
    try {
      const saved = await paymentsApi.createReceipt({
        courier,
        receiptNo: values.receiptNo,
        bankReference: values.bankReference || undefined,
        receivedOn: values.receivedOn,
        amountReceived: values.amountReceived,
        trackingNumbers: chosen.map((p) => p.trackingNumber as string),
        file,
      });
      toast.success(`Receipt ${saved.receipt.receiptNo} saved. ${saved.payments.length} payment(s) are now paid.`);
      navigate(`/courier-receipts/${saved.receipt.id}`, { replace: true });
    } catch (e) {
      setError(getErrorMessage(e));
      // The service lists every problem at once, for example "mark WB55312 delivered first".
      if (axios.isAxiosError<ApiErrorBody>(e)) setProblems(e.response?.data?.details ?? []);
    }
  };

  return (
    <>
      <p>
        <Link to="/courier-receipts">&larr; Courier receipts</Link>
      </p>
      <h1>New courier receipt</h1>

      <form className="card" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {problems.length > 0 && (
          <ul className="error">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}

        <div className="form-grid">
          <div className="field">
            <label className="field-label" htmlFor="courier">
              Courier
            </label>
            <select
              id="courier"
              value={courier}
              onChange={(e) => {
                setCourier(e.target.value);
                setSelected(new Set());
              }}
            >
              <option value="">Choose a courier</option>
              {COURIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <InputField label="Receipt number" error={errors.receiptNo?.message} {...register('receiptNo')} />
          <InputField label="Bank reference (optional)" error={errors.bankReference?.message} {...register('bankReference')} />
          <InputField label="Received on" type="date" error={errors.receivedOn?.message} {...register('receivedOn')} />
          <InputField
            label="Amount received (LKR)"
            inputMode="decimal"
            placeholder="11950.00"
            error={errors.amountReceived?.message}
            {...register('amountReceived')}
          />
          <div className="field">
            <label className="field-label" htmlFor="file">
              Receipt file (PDF or photo, required)
            </label>
            <input
              id="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {fileError && <span className="input-error">{fileError}</span>}
          </div>
        </div>

        <h2>Parcels covered by this receipt</h2>
        {!courier && <p className="muted">Choose a courier to see the parcels with collected cash.</p>}
        {courier && collected.isLoading && <p className="muted">Loading parcels...</p>}
        {courier && !collected.isLoading && payments.length === 0 && (
          <p className="muted">This courier holds no collected cash. Mark parcels delivered first.</p>
        )}
        {payments.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Tracking</th>
                  <th>Order</th>
                  <th className="num">Cash</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.paymentNo}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${p.trackingNumber}`}
                        disabled={!p.trackingNumber}
                        checked={!!p.trackingNumber && selected.has(p.trackingNumber)}
                        onChange={() => p.trackingNumber && toggle(p.trackingNumber)}
                      />
                    </td>
                    <td>{p.trackingNumber}</td>
                    <td>{p.reference}</td>
                    <td className="num">{formatMoney(p.amount, p.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p>
          {chosen.length} parcel(s) · collected <strong>{formatMoney(collectedCents / 100)}</strong>
          {feesCents !== null && (
            <>
              {' '}
              · fees <strong>{formatMoney(feesCents / 100)}</strong>
              {feesCents < 0 && <span className="error"> (more received than collected)</span>}
            </>
          )}
        </p>

        <Button type="submit" isLoading={isSubmitting} disabled={!courier}>
          Save receipt
        </Button>
      </form>
    </>
  );
};
