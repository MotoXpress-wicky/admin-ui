import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useFetch } from '@/shared/hooks/useFetch';
import { formatDateTime, formatMoney } from '@/shared/lib/format';
import { paymentsApi } from '../api/paymentsApi';

export const ReceiptDetailPage = () => {
  const { id = '' } = useParams();
  const load = useCallback(() => paymentsApi.receipt(id), [id]);
  const { data, error, isLoading } = useFetch(load);

  if (isLoading && !data) return <p className="muted">Loading...</p>;
  if (error || !data) {
    return (
      <>
        <p role="alert" className="error">{error ?? 'Receipt not found.'}</p>
        <Link to="/courier-receipts">Back to receipts</Link>
      </>
    );
  }

  const { receipt, payments } = data;

  return (
    <>
      <p>
        <Link to="/courier-receipts">&larr; Courier receipts</Link>
      </p>
      <h1>
        Receipt {receipt.receiptNo} · {receipt.courier}
      </h1>

      <section className="card">
        <p>Received on {receipt.receivedOn}</p>
        <p>Collected: {formatMoney(receipt.collectedTotal)}</p>
        <p>Fees: {formatMoney(receipt.fees)}</p>
        <p>
          <strong>Received: {formatMoney(receipt.amountReceived)}</strong>
        </p>
        {receipt.bankReference && <p>Bank reference: {receipt.bankReference}</p>}
        <p className="muted">Entered {formatDateTime(receipt.createdAt)}</p>
        <p>
          <a href={paymentsApi.receiptFileUrl(receipt.id)} target="_blank" rel="noreferrer">
            Open the receipt file
          </a>
        </p>
      </section>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Payment</th>
              <th>Order</th>
              <th>Tracking</th>
              <th className="num">Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.paymentNo}>
                <td>{p.paymentNo}</td>
                <td>
                  <Link to={`/orders/${p.reference}`}>{p.reference}</Link>
                </td>
                <td>{p.trackingNumber}</td>
                <td className="num">{formatMoney(p.amount, p.currency)}</td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
