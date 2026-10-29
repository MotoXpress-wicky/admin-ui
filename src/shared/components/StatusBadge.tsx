// One coloured word for a status such as IN_TRANSIT or COLLECTED. The colours are in index.css (.s-<STATUS>).
export const StatusBadge = ({ status }: { status: string | null | undefined }) =>
  status ? <span className={`badge s-${status}`}>{status.replace(/_/g, ' ').toLowerCase()}</span> : null;
