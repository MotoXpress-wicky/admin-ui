import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useFetch } from '@/shared/hooks/useFetch';
import { formatDateTime, formatMoney } from '@/shared/lib/format';
import { getErrorMessage } from '@/shared/lib/getErrorMessage';
import { ordersApi } from '../api/ordersApi';

export const OrderDetailPage = () => {
  const { orderNo = '' } = useParams();
  const load = useCallback(() => ordersApi.get(orderNo), [orderNo]);
  const { data: order, error, isLoading, reload } = useFetch(load);
  const [busy, setBusy] = useState(false);

  if (isLoading && !order) return <p className="muted">Loading...</p>;
  if (error || !order) {
    return (
      <>
        <p role="alert" className="error">{error ?? 'Order not found.'}</p>
        <Link to="/orders">Back to orders</Link>
      </>
    );
  }

  const cancel = async () => {
    if (!window.confirm(`Cancel order ${order.orderNo}? The stock goes back on the shelf.`)) return;
    setBusy(true);
    try {
      await ordersApi.cancel(order.orderNo);
      toast.success('Order cancelled');
      reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const c = order.customer;

  return (
    <>
      <p className="no-print">
        <Link to="/orders">&larr; Orders</Link>
      </p>

      {/* This whole page is also the packing slip: the sidebar and the buttons are hidden when printing. */}
      <h1>Order {order.orderNo}</h1>
      <p className="muted">Placed {formatDateTime(order.createdAt)}</p>

      <div className="toolbar no-print">
        <StatusBadge status={order.shipmentStatus} />
        <StatusBadge status={order.paymentStatus} />
        <span className="spacer" />
        {order.shipmentStatus === 'NOT_SHIPPED' && (
          <>
            <Link to={`/shipments?orderNo=${encodeURIComponent(order.orderNo)}`}>
              <button type="button">Create shipment</button>
            </Link>
            <Button variant="secondary" isLoading={busy} onClick={() => void cancel()}>
              Cancel order
            </Button>
          </>
        )}
        <button type="button" data-variant="secondary" onClick={() => window.print()}>
          Print packing slip
        </button>
      </div>

      <section className="card">
        <h2>Ship to</h2>
        <p>
          <strong>{c.name}</strong>
        </p>
        <p>{c.addressLine}</p>
        <p>
          {c.city}, {c.district}
        </p>
        <p>Phone: {c.phone}</p>
        <p className="muted">{c.email}</p>
      </section>

      <section className="card">
        <h2>Items</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Part number</th>
                <th>Name</th>
                <th className="num">Qty</th>
                <th className="num">Price</th>
                <th className="num">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.productId}>
                  <td>{i.partNumber}</td>
                  <td>{i.name}</td>
                  <td className="num">{i.quantity}</td>
                  <td className="num">{formatMoney(i.unitPrice, order.currency)}</td>
                  <td className="num">{formatMoney(i.lineTotal, order.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Parts: {formatMoney(order.itemsTotal, order.currency)}</p>
        <p>Delivery: {formatMoney(order.deliveryFee, order.currency)}</p>
        <p>
          <strong>Cash to collect: {formatMoney(order.total, order.currency)}</strong>
        </p>
      </section>

      {order.shipment && (
        <section className="card no-print">
          <h2>Shipment</h2>
          <p>
            {order.shipment.courier} · {order.shipment.trackingNumber} · <StatusBadge status={order.shipment.status} />
          </p>
          <p className="muted">
            Shipped {formatDateTime(order.shipment.shippedAt)}
            {order.shipment.deliveredAt ? ` · Delivered ${formatDateTime(order.shipment.deliveredAt)}` : ''}
            {order.shipment.returnedAt
              ? ` · Returned ${formatDateTime(order.shipment.returnedAt)} (${order.shipment.returnReason ?? ''})`
              : ''}
          </p>
        </section>
      )}

      {order.cancelledAt && (
        <p className="muted no-print">
          Cancelled {formatDateTime(order.cancelledAt)} by {order.cancelledBy?.toLowerCase()}.
        </p>
      )}
    </>
  );
};
