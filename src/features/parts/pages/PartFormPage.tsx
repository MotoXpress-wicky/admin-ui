import { useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '@/shared/hooks/useFetch';
import { partsApi } from '../api/partsApi';
import { PartForm } from '../components/PartForm';
import { PhotosSection } from '../components/PhotosSection';
import { StockSection } from '../components/StockSection';

// /parts/new makes a part. /parts/:id edits it and also shows its photos and stock.
export const PartFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const partId = id ? Number(id) : null;

  // For a new part there is nothing to load.
  const load = useCallback(() => (partId === null ? Promise.resolve(null) : partsApi.get(partId)), [partId]);
  const { data: part, error, isLoading, reload } = useFetch(load);

  if (isLoading && !part && partId !== null) return <p className="muted">Loading...</p>;
  if (error) {
    return (
      <>
        <p role="alert" className="error">{error}</p>
        <Link to="/parts">Back to parts</Link>
      </>
    );
  }
  if (isLoading && partId === null) return <p className="muted">Loading...</p>;

  return (
    <>
      <p>
        <Link to="/parts">&larr; Parts</Link>
      </p>
      <h1>{part ? `${part.partNumber} · ${part.name}` : 'New part'}</h1>

      {/* key: after a save the form starts again from the saved values */}
      <PartForm
        key={part ? `${part.id}-${part.updatedAt}` : 'new'}
        part={part}
        onSaved={(saved) => {
          if (part) reload();
          else navigate(`/parts/${saved.id}`, { replace: true });
        }}
      />

      {part && (
        <>
          <PhotosSection part={part} onChanged={reload} />
          <StockSection part={part} onChanged={reload} />
        </>
      )}
    </>
  );
};
