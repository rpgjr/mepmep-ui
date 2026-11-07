import { useEffect, useState } from "react";
import { api } from "./api";

/** Loads a GET endpoint. Re-runs when `path` changes. Pass null to skip. */
export function useGet<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(path !== null);

  useEffect(() => {
    if (path === null) return;
    let cancelled = false; // ignore answers that arrive after the page changed
    setLoading(true);
    setError(null);
    api<T>(path)
      .then((d) => !cancelled && setData(d))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [path]);

  return { data, error, loading };
}
