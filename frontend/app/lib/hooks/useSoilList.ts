import { useCallback, useEffect, useState } from "react";
import { fetchSoilRows, type SoilState } from "~/lib/soil";

type Options = {
  refetchIntervalMs?: number;
};

export function useSoilList(options?: Options) {
  const [data, setData] = useState<SoilState[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const rows = await fetchSoilRows();
      setData(rows);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar o solo.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const ms = options?.refetchIntervalMs;
    if (!ms || ms < 1000) return;
    const id = window.setInterval(() => void refresh(), ms);
    return () => window.clearInterval(id);
  }, [refresh, options?.refetchIntervalMs]);

  return { data, error, loading, refresh };
}
