import { useCallback, useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '@/shared/lib/getErrorMessage';

type FetchState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  reload: () => void;
};

type Result<T> = { request: object; data: T | null; error: string | null };

// Loads data when the page opens and again when `load` changes (or reload() is called).
// Pass a `load` function made with useCallback, so it only changes when its inputs change.
//
// "Loading" is not stored. It is true while the last result belongs to an older request.
// This way no state is set inside the effect itself, only when the answer arrives.
export const useFetch = <T,>(load: () => Promise<T>): FetchState<T> => {
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  // A new object each time the inputs change. It names the current request.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const request = useMemo(() => ({}), [load, tick]);

  useEffect(() => {
    let cancelled = false; // a late answer must not overwrite a newer one

    load()
      .then((data) => {
        if (!cancelled) setResult({ request, data, error: null });
      })
      .catch((e: unknown) => {
        if (!cancelled) setResult({ request, data: null, error: getErrorMessage(e) });
      });

    return () => {
      cancelled = true;
    };
  }, [load, request]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  const isCurrent = result?.request === request;
  return {
    data: result?.data ?? null,
    error: isCurrent ? result.error : null,
    isLoading: !isCurrent,
    reload,
  };
};
