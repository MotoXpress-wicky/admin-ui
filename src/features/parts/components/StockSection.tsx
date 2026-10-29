import { useCallback, useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { Pager } from '@/shared/components/Pager';
import { useFetch } from '@/shared/hooks/useFetch';
import { formatDateTime } from '@/shared/lib/format';
import { getErrorMessage } from '@/shared/lib/getErrorMessage';
import { partsApi } from '../api/partsApi';
import type { AdminPart, StockReason } from '../types/part.types';

type Props = {
  part: AdminPart;
  onChanged: () => void;
};

// An admin can add stock (RESTOCK) or fix a count (CORRECTION). Reserved and released stock is written by orders.
export const StockSection = ({ part, onChanged }: Props) => {
  const [change, setChange] = useState('');
  const [reason, setReason] = useState<StockReason>('RESTOCK');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(0);

  const load = useCallback(() => partsApi.stockHistory(part.id, page), [part.id, page]);
  const history = useFetch(load);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const amount = Number(change);
    if (!Number.isInteger(amount) || amount === 0) {
      toast.error('Type a whole number that is not zero. Use a minus sign to remove stock.');
      return;
    }
    setBusy(true);
    try {
      const result = await partsApi.adjustStock(part.id, amount, reason, note.trim());
      toast.success(`Stock is now ${result.stockQty}`);
      setChange('');
      setNote('');
      setPage(0);
      history.reload(); // the list also changes when we are already on page 0
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card">
      <h2>Stock: {part.stockQty}</h2>

      <form className="toolbar" onSubmit={submit}>
        <input
          className="input"
          inputMode="numeric"
          placeholder="+10 or -2"
          aria-label="Change"
          value={change}
          onChange={(e) => setChange(e.target.value)}
        />
        <select aria-label="Reason" value={reason} onChange={(e) => setReason(e.target.value as StockReason)}>
          <option value="RESTOCK">Restock</option>
          <option value="CORRECTION">Correction</option>
        </select>
        <input className="input" placeholder="Note (optional)" aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="submit" disabled={busy}>
          Apply
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th className="num">Change</th>
              <th>Reason</th>
              <th>Order</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {history.data?.content.map((m) => (
              <tr key={m.id}>
                <td>{formatDateTime(m.createdAt)}</td>
                <td className="num">{m.change > 0 ? `+${m.change}` : m.change}</td>
                <td>{m.reason.replace(/_/g, ' ').toLowerCase()}</td>
                <td>{m.orderNo}</td>
                <td>{m.note}</td>
              </tr>
            ))}
            {history.data && history.data.content.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  No stock changes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {history.data && <Pager page={history.data.page} totalPages={history.data.totalPages} onPage={setPage} />}
    </section>
  );
};
