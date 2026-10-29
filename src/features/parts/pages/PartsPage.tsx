import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Pager } from '@/shared/components/Pager';
import { useFetch } from '@/shared/hooks/useFetch';
import { formatMoney } from '@/shared/lib/format';
import { getErrorMessage } from '@/shared/lib/getErrorMessage';
import { partsApi } from '../api/partsApi';

export const PartsPage = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const categoryId = params.get('categoryId') ?? '';
  const active = params.get('active') ?? '';
  const page = Number(params.get('page') ?? '0');
  const [text, setText] = useState(q);

  const loadCategories = useCallback(() => partsApi.categories(), []);
  const categories = useFetch(loadCategories);

  const load = useCallback(
    () =>
      partsApi.list({
        q: q || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        active: active === '' ? undefined : active === 'true',
        page,
      }),
    [q, categoryId, active, page],
  );
  const parts = useFetch(load);
  const data = parts.data;

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const toggleActive = async (id: number, makeActive: boolean) => {
    try {
      await partsApi.setActive(id, makeActive);
      toast.success(makeActive ? 'Part is visible again' : 'Part is hidden from customers');
      parts.reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <>
      <div className="toolbar">
        <h1>Parts</h1>
        <span className="spacer" />
        <Link to="/parts/new">
          <button type="button">New part</button>
        </Link>
      </div>

      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setFilter('q', text.trim());
        }}
      >
        <input className="input" type="search" placeholder="Part number or name" aria-label="Search parts" value={text} onChange={(e) => setText(e.target.value)} />
        <select aria-label="Category" value={categoryId} onChange={(e) => setFilter('categoryId', e.target.value)}>
          <option value="">All categories</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select aria-label="Visibility" value={active} onChange={(e) => setFilter('active', e.target.value)}>
          <option value="">Visible and hidden</option>
          <option value="true">Visible only</option>
          <option value="false">Hidden only</option>
        </select>
        <button type="submit">Search</button>
      </form>

      {parts.isLoading && <p className="muted">Loading parts...</p>}
      {parts.error && <p role="alert" className="error">{parts.error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Part number</th>
              <th>Name</th>
              <th>Category</th>
              <th className="num">Price</th>
              <th className="num">Stock</th>
              <th>Visible</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data?.content.map((p) => (
              <tr key={p.id}>
                <td>{p.partNumber}</td>
                <td>
                  <Link to={`/parts/${p.id}`}>{p.name}</Link>
                </td>
                <td>{p.category?.name}</td>
                <td className="num">{formatMoney(p.price)}</td>
                <td className="num">{p.stockQty}</td>
                <td>
                  <span className={p.active ? 'badge ok' : 'badge no'}>{p.active ? 'visible' : 'hidden'}</span>
                </td>
                <td>
                  <button type="button" className="link-button" onClick={() => void toggleActive(p.id, !p.active)}>
                    {p.active ? 'Hide' : 'Show'}
                  </button>
                </td>
              </tr>
            ))}
            {data && data.content.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
                  No parts found.
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
