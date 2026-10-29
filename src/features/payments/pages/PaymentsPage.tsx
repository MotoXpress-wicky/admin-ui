import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pager } from '@/shared/components/Pager';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { COURIERS } from '@/shared/config';
import { useFetch } from '@/shared/hooks/useFetch';
import { formatDateTime, formatMoney } from '@/shared/lib/format';
import { PAYMENT_STATUSES, type PaymentStatus } from '@/features/orders/types/order.types';
import { paymentsApi } from '../api/paymentsApi';

// Read only. Cash on delivery changes only through events and courier receipts, never by hand here.
export const PaymentsPage = () => {
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') ?? '') as PaymentStatus | '';
  const courier = params.get('courier') ?? '';
  const reference = params.get('reference') ?? '';
  const trackingNumber = params.get('trackingNumber') ?? '';
  const page = Number(params.get('page') ?? '0');
  const [refText, setRefText] = useState(reference);
  const [trackText, setTrackText] = useState(trackingNumber);

  const load = useCallback(
    () =>
      paymentsApi.list({
        status: status || undefined,
        courier: courier || undefined,
        reference: reference || undefined,
        trackingNumber: trackingNumber || undefined,
        page,
      }),
    [status, courier, reference, trackingNumber, page],
  );
  const { data, error, isLoading } = useFetch(load);

  const setFilters = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    next.delete('page');
    setParams(next);
  };

  return (
    <>
      <h1>Payments</h1>

      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters({ reference: refText.trim(), trackingNumber: trackText.trim() });
        }}
      >
        <select aria-label="Status" value={status} onChange={(e) => setFilters({ status: e.target.value })}>
          <option value="">Any status</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.toLowerCase()}
            </option>
          ))}
        </select>
        <select aria-label="Courier" value={courier} onChange={(e) => setFilters({ courier: e.target.value })}>
          <option value="">All couriers</option>
          {COURIERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input className="input" placeholder="Order number" aria-label="Order number" value={refText} onChange={(e) => setRefText(e.target.value)} />
        <input className="input" placeholder="Tracking number" aria-label="Tracking number" value={trackText} onChange={(e) => setTrackText(e.target.value)} />
        <button type="submit">Search</button>
        <button type="button" data-variant="secondary" onClick={() => { setRefText(''); setTrackText(''); setParams({}); }}>
          Clear
        </button>
      </form>

      {isLoading && <p className="muted">Loading payments...</p>}
      {error && <p role="alert" className="error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Payment</th>
              <th>Order</th>
              <th className="num">Amount</th>
              <th>Status</th>
              <th>Courier</th>
              <th>Tracking</th>
              <th>Collected</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((p) => (
              <tr key={p.paymentNo}>
                <td>{p.paymentNo}</td>
                <td>{p.reference}</td>
                <td className="num">{formatMoney(p.amount, p.currency)}</td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
                <td>{p.courier}</td>
                <td>{p.trackingNumber}</td>
                <td>{formatDateTime(p.collectedAt)}</td>
                <td>{p.courierReceiptNo}</td>
              </tr>
            ))}
            {data && data.content.length === 0 && (
              <tr>
                <td colSpan={8} className="muted">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <Pager
          page={data.page}
          totalPages={data.totalPages}
          onPage={(p) => {
            const next = new URLSearchParams(params);
            next.set('page', String(p));
            setParams(next);
          }}
        />
      )}
    </>
  );
};
