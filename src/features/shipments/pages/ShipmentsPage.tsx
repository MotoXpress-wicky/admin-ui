import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Pager } from '@/shared/components/Pager';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { COURIERS } from '@/shared/config';
import { useFetch } from '@/shared/hooks/useFetch';
import { formatDateTime, formatMoney } from '@/shared/lib/format';
import { getErrorMessage } from '@/shared/lib/getErrorMessage';
import { shipmentsApi } from '../api/shipmentsApi';
import { NewShipmentForm } from '../components/NewShipmentForm';
import {
  RETURN_REASONS,
  SHIPMENT_STATES,
  type BulkResult,
  type ReturnReason,
  type ShipmentState,
} from '../types/shipment.types';

export const ShipmentsPage = () => {
  const [params, setParams] = useSearchParams();
  const courier = params.get('courier') ?? '';
  const status = (params.get('status') ?? '') as ShipmentState | '';
  const page = Number(params.get('page') ?? '0');
  // The order page links here with ?orderNo=..., so the form opens already filled.
  const orderNoFromLink = params.get('orderNo') ?? '';

  const [showForm, setShowForm] = useState(orderNoFromLink !== '');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [reason, setReason] = useState<ReturnReason>('REFUSED');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ title: string; outcome: BulkResult } | null>(null);

  const load = useCallback(
    () => shipmentsApi.list({ courier: courier || undefined, status: status || undefined, page }),
    [courier, status, page],
  );
  const shipments = useFetch(load);
  const data = shipments.data;

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
    setSelected(new Set());
  };

  const toggle = (id: number) =>
    setSelected((old) => {
      const next = new Set(old);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Only parcels that are still with the courier can be marked.
  const selectable = data?.content.filter((s) => s.status === 'IN_TRANSIT') ?? [];

  const runBulk = async (title: string, action: (ids: number[]) => Promise<BulkResult>) => {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      const outcome = await action([...selected]);
      setResult({ title, outcome });
      if (outcome.failed.length === 0) toast.success(`${outcome.done.length} parcel(s) updated`);
      setSelected(new Set());
      shipments.reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="toolbar">
        <h1>Shipments</h1>
        <span className="spacer" />
        <button type="button" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Hide form' : 'New shipment'}
        </button>
      </div>

      {showForm && (
        <NewShipmentForm
          initialOrderNo={orderNoFromLink}
          onCreated={() => {
            shipments.reload();
            if (orderNoFromLink) setParams({});
          }}
        />
      )}

      <div className="toolbar">
        <select aria-label="Courier" value={courier} onChange={(e) => setFilter('courier', e.target.value)}>
          <option value="">All couriers</option>
          {COURIERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select aria-label="Status" value={status} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">Any status</option>
          {SHIPMENT_STATES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ').toLowerCase()}
            </option>
          ))}
        </select>

        <span className="spacer" />
        <span className="muted">{selected.size} selected</span>
        <button type="button" disabled={busy || selected.size === 0} onClick={() => void runBulk('Marked delivered', shipmentsApi.delivered)}>
          Mark delivered
        </button>
        <select aria-label="Return reason" value={reason} onChange={(e) => setReason(e.target.value as ReturnReason)}>
          {RETURN_REASONS.map((r) => (
            <option key={r} value={r}>
              {r.replace(/_/g, ' ').toLowerCase()}
            </option>
          ))}
        </select>
        <button
          type="button"
          data-variant="secondary"
          disabled={busy || selected.size === 0}
          onClick={() => void runBulk('Marked returned', (ids) => shipmentsApi.returned(ids, reason))}
        >
          Mark returned
        </button>
      </div>

      {result && (
        <section className="card" role="status">
          <h2>{result.title}</h2>
          <p>{result.outcome.done.length} worked.</p>
          {result.outcome.failed.length > 0 && (
            <>
              <p className="error">{result.outcome.failed.length} did not work:</p>
              <ul>
                {result.outcome.failed.map((f) => (
                  <li key={f.shipmentId} className="error">
                    {f.orderNo}: {f.message}
                  </li>
                ))}
              </ul>
            </>
          )}
          <button type="button" className="link-button" onClick={() => setResult(null)}>
            Close
          </button>
        </section>
      )}

      {shipments.isLoading && <p className="muted">Loading shipments...</p>}
      {shipments.error && <p role="alert" className="error">{shipments.error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Select all parcels on this page"
                  checked={selectable.length > 0 && selectable.every((s) => selected.has(s.id))}
                  onChange={(e) => setSelected(e.target.checked ? new Set(selectable.map((s) => s.id)) : new Set())}
                />
              </th>
              <th>Order</th>
              <th>Customer</th>
              <th>Courier</th>
              <th>Tracking</th>
              <th>Status</th>
              <th>Shipped</th>
              <th className="num">Cash</th>
              <th>Payment</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((s) => (
              <tr key={s.id}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Select ${s.orderNo}`}
                    disabled={s.status !== 'IN_TRANSIT'}
                    checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)}
                  />
                </td>
                <td>
                  <Link to={`/orders/${s.orderNo}`}>{s.orderNo}</Link>
                </td>
                <td>{s.customerName}</td>
                <td>{s.courier}</td>
                <td>{s.trackingNumber}</td>
                <td>
                  <StatusBadge status={s.status} />
                  {s.returnReason ? ` ${s.returnReason.replace(/_/g, ' ').toLowerCase()}` : ''}
                </td>
                <td>{formatDateTime(s.shippedAt)}</td>
                <td className="num">{formatMoney(s.total, s.currency)}</td>
                <td>
                  <StatusBadge status={s.paymentStatus} />
                </td>
                <td>
                  {s.hasPickupReceipt ? (
                    <a href={shipmentsApi.pickupReceiptUrl(s.id)} target="_blank" rel="noreferrer">
                      open
                    </a>
                  ) : (
                    ''
                  )}
                </td>
              </tr>
            ))}
            {data && data.content.length === 0 && (
              <tr>
                <td colSpan={10} className="muted">
                  No shipments found.
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
            setSelected(new Set());
          }}
        />
      )}
    </>
  );
};
