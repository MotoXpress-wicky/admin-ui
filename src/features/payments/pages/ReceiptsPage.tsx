import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pager } from '@/shared/components/Pager';
import { COURIERS } from '@/shared/config';
import { useFetch } from '@/shared/hooks/useFetch';
import { formatMoney } from '@/shared/lib/format';
import { paymentsApi } from '../api/paymentsApi';

export const ReceiptsPage = () => {
  const [courier, setCourier] = useState('');
  const [page, setPage] = useState(0);

  const load = useCallback(() => paymentsApi.receipts(courier, page), [courier, page]);
  const { data, error, isLoading } = useFetch(load);

  return (
    <>
      <div className="toolbar">
        <h1>Courier receipts</h1>
        <span className="spacer" />
        <select
          aria-label="Courier"
          value={courier}
          onChange={(e) => {
            setCourier(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All couriers</option>
          {COURIERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Link to="/courier-receipts/new">
          <button type="button">New receipt</button>
        </Link>
      </div>

      {isLoading && <p className="muted">Loading receipts...</p>}
      {error && <p role="alert" className="error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Receipt</th>
              <th>Courier</th>
              <th>Received on</th>
              <th className="num">Parcels</th>
              <th className="num">Collected</th>
              <th className="num">Fees</th>
              <th className="num">Received</th>
              <th>Bank reference</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link to={`/courier-receipts/${r.id}`}>{r.receiptNo}</Link>
                </td>
                <td>{r.courier}</td>
                <td>{r.receivedOn}</td>
                <td className="num">{r.paymentCount}</td>
                <td className="num">{formatMoney(r.collectedTotal)}</td>
                <td className="num">{formatMoney(r.fees)}</td>
                <td className="num">{formatMoney(r.amountReceived)}</td>
                <td>{r.bankReference}</td>
              </tr>
            ))}
            {data && data.content.length === 0 && (
              <tr>
                <td colSpan={8} className="muted">
                  No receipts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </>
  );
};
