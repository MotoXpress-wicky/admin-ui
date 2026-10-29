import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pager } from '@/shared/components/Pager';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useFetch } from '@/shared/hooks/useFetch';
import { formatDateTime, formatMoney } from '@/shared/lib/format';
import { ordersApi } from '../api/ordersApi';
import {
  PAYMENT_STATUSES,
  SHIPMENT_STATUSES,
  type PaymentStatus,
  type ShipmentStatus,
} from '../types/order.types';

// The filters live in the address, so the page can be shared and the back button works.
export const OrdersPage = () => {
  const [params, setParams] = useSearchParams();
  const shipmentStatus = (params.get('shipmentStatus') ?? '') as ShipmentStatus | '';
  const paymentStatus = (params.get('paymentStatus') ?? '') as PaymentStatus | '';
  const q = params.get('q') ?? '';
  const overdue = params.get('overdue') === 'true';
  const page = Number(params.get('page') ?? '0');
  const [text, setText] = useState(q);

  const loadCounts = useCallback(() => ordersApi.summary(), []);
  const counts = useFetch(loadCounts);

  const loadOrders = useCallback(
    () =>
      ordersApi.list({
        shipmentStatus: shipmentStatus || undefined,
        paymentStatus: paymentStatus || undefined,
        q: q || undefined,
        overdue: overdue || undefined,
        page,
      }),
    [shipmentStatus, paymentStatus, q, overdue, page],
  );
  const orders = useFetch(loadOrders);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const c = counts.data;
  const result = orders.data;

  return (
    <>
      <h1>Orders</h1>

      {c && (
        <div className="cards">
          <button type="button" className="card" onClick={() => setParams({ shipmentStatus: 'NOT_SHIPPED' })}>
            <p className="muted">To ship</p>
            <p className="stat-value">{c.toShip}</p>
          </button>
          <button type="button" className="card" onClick={() => setParams({ shipmentStatus: 'IN_TRANSIT' })}>
            <p className="muted">With a courier</p>
            <p className="stat-value">{c.withCourier}</p>
          </button>
          <div className="card">
            <p className="muted">Cash with couriers ({c.cashWithCouriersCount})</p>
            <p className="stat-value">{formatMoney(c.cashWithCouriersAmount, c.currency)}</p>
          </div>
          <button type="button" className="card" onClick={() => setParams({ overdue: 'true' })}>
            <p className="muted">Overdue cash (over {c.overdueDays} days, {c.overdueCount})</p>
            <p className="stat-value">{formatMoney(c.overdueAmount, c.currency)}</p>
          </button>
        </div>
      )}
      {counts.error && <p role="alert" className="error">{counts.error}</p>}

      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setFilter('q', text.trim());
        }}
      >
        <input
          className="input"
          type="search"
          placeholder="Order number or customer"
          aria-label="Search orders"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <select aria-label="Shipment status" value={shipmentStatus} onChange={(e) => setFilter('shipmentStatus', e.target.value)}>
          <option value="">Any shipment</option>
          {SHIPMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ').toLowerCase()}
            </option>
          ))}
        </select>
        <select aria-label="Payment status" value={paymentStatus} onChange={(e) => setFilter('paymentStatus', e.target.value)}>
          <option value="">Any payment</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.toLowerCase()}
            </option>
          ))}
        </select>
        <label>
          <input type="checkbox" checked={overdue} onChange={(e) => setFilter('overdue', e.target.checked ? 'true' : '')} /> Overdue cash only
        </label>
        <button type="submit">Search</button>
        <button type="button" data-variant="secondary" onClick={() => setParams({})}>
          Clear
        </button>
      </form>

      {orders.isLoading && <p className="muted">Loading orders...</p>}
      {orders.error && <p role="alert" className="error">{orders.error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Placed</th>
              <th>Customer</th>
              <th>City</th>
              <th className="num">Total</th>
              <th>Shipment</th>
              <th>Payment</th>
              <th>Courier</th>
              <th>Tracking</th>
            </tr>
          </thead>
          <tbody>
            {result?.content.map((o) => (
              <tr key={o.orderNo}>
                <td>
                  <Link to={`/orders/${o.orderNo}`}>{o.orderNo}</Link>
                </td>
                <td>{formatDateTime(o.createdAt)}</td>
                <td>{o.customerName}</td>
                <td>{o.city}</td>
                <td className="num">{formatMoney(o.total, o.currency)}</td>
                <td>
                  <StatusBadge status={o.shipmentStatus} />
                </td>
                <td>
                  <StatusBadge status={o.paymentStatus} />
                </td>
                <td>{o.courier}</td>
                <td>{o.trackingNumber}</td>
              </tr>
            ))}
            {result && result.content.length === 0 && (
              <tr>
                <td colSpan={9} className="muted">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {result && (
        <Pager
          page={result.page}
          totalPages={result.totalPages}
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
