import { useCallback, useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { useFetch } from '@/shared/hooks/useFetch';
import { getErrorMessage } from '@/shared/lib/getErrorMessage';
import { partsApi } from '../api/partsApi';

// The pick lists for parts: bike brands, bike models and part categories.
// Nothing is deleted. A wrong name is renamed, and a thing that is not used any more is hidden.
export const CatalogPage = () => {
  const loadBrands = useCallback(() => partsApi.brands(), []);
  const brands = useFetch(loadBrands);
  const loadCategories = useCallback(() => partsApi.categories(), []);
  const categories = useFetch(loadCategories);

  const [brandId, setBrandId] = useState<number | null>(null);
  const loadModels = useCallback(() => (brandId === null ? Promise.resolve([]) : partsApi.models(brandId)), [brandId]);
  const models = useFetch(loadModels);

  const [brandName, setBrandName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [modelName, setModelName] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [engineCc, setEngineCc] = useState('');

  // Run one change, show the answer, reload the lists that may have changed.
  const run = async (action: () => Promise<unknown>, done: string, after: () => void) => {
    try {
      await action();
      toast.success(done);
      after();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const addBrand = (e: FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    void run(() => partsApi.createBrand(brandName.trim()), 'Brand added', () => {
      setBrandName('');
      brands.reload();
    });
  };

  const addCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    void run(() => partsApi.createCategory(categoryName.trim()), 'Category added', () => {
      setCategoryName('');
      categories.reload();
    });
  };

  const addModel = (e: FormEvent) => {
    e.preventDefault();
    if (brandId === null || !modelName.trim()) return;
    void run(
      () =>
        partsApi.createModel(brandId, {
          name: modelName.trim(),
          yearFrom: yearFrom ? Number(yearFrom) : undefined,
          engineCc: engineCc ? Number(engineCc) : undefined,
        }),
      'Model added',
      () => {
        setModelName('');
        setYearFrom('');
        setEngineCc('');
        models.reload();
      },
    );
  };

  return (
    <>
      <h1>Catalog</h1>
      {(brands.error || categories.error || models.error) && (
        <p role="alert" className="error">
          {brands.error ?? categories.error ?? models.error}
        </p>
      )}

      <div className="cards">
        <section className="card">
          <h2>Brands</h2>
          <ul>
            {brands.data?.map((b) => (
              <li key={b.id}>
                <button type="button" className="link-button" onClick={() => setBrandId(b.id)}>
                  {b.name}
                </button>
                {!b.active && <span className="badge no"> hidden</span>}{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => void run(() => partsApi.updateBrand(b.id, { active: !b.active }), 'Saved', brands.reload)}
                >
                  {b.active ? 'hide' : 'show'}
                </button>
              </li>
            ))}
          </ul>
          <form className="toolbar" onSubmit={addBrand}>
            <input className="input" placeholder="New brand" aria-label="New brand" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
            <button type="submit">Add</button>
          </form>
        </section>

        <section className="card">
          <h2>Models{brandId !== null ? ` of ${brands.data?.find((b) => b.id === brandId)?.name ?? ''}` : ''}</h2>
          {brandId === null && <p className="muted">Click a brand to see its models.</p>}
          <ul>
            {models.data?.map((m) => (
              <li key={m.id}>
                {m.name}
                {m.yearFrom ? ` (${m.yearFrom}${m.yearTo ? `-${m.yearTo}` : '+'})` : ''}
                {m.engineCc ? ` ${m.engineCc}cc` : ''}
                {!m.active && <span className="badge no"> hidden</span>}{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => void run(() => partsApi.updateModel(m.id, { active: !m.active }), 'Saved', models.reload)}
                >
                  {m.active ? 'hide' : 'show'}
                </button>
              </li>
            ))}
          </ul>
          {brandId !== null && (
            <form className="toolbar" onSubmit={addModel}>
              <input className="input" placeholder="New model" aria-label="New model" value={modelName} onChange={(e) => setModelName(e.target.value)} />
              <input className="input" style={{ width: 90 }} placeholder="From year" aria-label="From year" inputMode="numeric" value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} />
              <input className="input" style={{ width: 80 }} placeholder="cc" aria-label="Engine cc" inputMode="numeric" value={engineCc} onChange={(e) => setEngineCc(e.target.value)} />
              <button type="submit">Add</button>
            </form>
          )}
        </section>

        <section className="card">
          <h2>Categories</h2>
          <ul>
            {categories.data?.map((c) => (
              <li key={c.id}>
                {c.name}
                {!c.active && <span className="badge no"> hidden</span>}{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => void run(() => partsApi.updateCategory(c.id, { active: !c.active }), 'Saved', categories.reload)}
                >
                  {c.active ? 'hide' : 'show'}
                </button>
              </li>
            ))}
          </ul>
          <form className="toolbar" onSubmit={addCategory}>
            <input className="input" placeholder="New category" aria-label="New category" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
            <button type="submit">Add</button>
          </form>
        </section>
      </div>
    </>
  );
};
