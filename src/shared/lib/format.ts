// Money and time shown to the customer. The API sends money as a number and times as ISO text (UTC).

export const formatMoney = (amount: number | string, currency = 'LKR'): string =>
  `${currency} ${Number(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDateTime = (iso?: string | null): string =>
  iso ? new Date(iso).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' }) : '';

// Photo links can be relative ("/media/products/..."). Put the site address in front of them,
// so they also work when the page itself runs on the Vite port.
export const mediaUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (!url.startsWith('/')) return url;
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  return `${String(base).replace(/\/$/, '')}${url}`;
};
