import { useState } from 'react';
import { toast } from 'react-toastify';
import { mediaUrl } from '@/shared/lib/format';
import { getErrorMessage } from '@/shared/lib/getErrorMessage';
import { partsApi } from '../api/partsApi';
import type { AdminPart } from '../types/part.types';

type Props = {
  part: AdminPart;
  onChanged: () => void;
};

export const PhotosSection = ({ part, onChanged }: Props) => {
  const [busy, setBusy] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      await partsApi.uploadPhoto(part.id, file);
      toast.success('Photo added');
      onChanged();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (photoId: number) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await partsApi.deletePhoto(part.id, photoId);
      toast.success('Photo deleted');
      onChanged();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <section className="card">
      <h2>Photos</h2>
      <div className="photo-row">
        {part.photos.map((p) => (
          <div key={p.id} className="photo-box">
            <img src={mediaUrl(p.url)} alt="" />
            <button type="button" className="link-button" onClick={() => void remove(p.id)}>
              Delete
            </button>
          </div>
        ))}
        {part.photos.length === 0 && <p className="muted">No photos yet.</p>}
      </div>
      <div className="field">
        <label className="field-label" htmlFor="photo">
          Add a photo (JPEG, PNG or WebP)
        </label>
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(e) => {
            void upload(e.target.files?.[0]);
            e.target.value = ''; // so the same file can be chosen again
          }}
        />
      </div>
    </section>
  );
};
