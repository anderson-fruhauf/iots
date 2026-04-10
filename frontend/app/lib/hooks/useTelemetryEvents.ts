import { useCallback, useEffect, useState } from "react";
import {
  type TelemetryEvent,
  fetchTelemetryEvents,
} from "~/lib/telemetry";

type Options = {
  /** Intervalo de atualização automática em ms (omitir para só carregar uma vez). */
  refetchIntervalMs?: number;
};

export function useTelemetryEvents(limit: number, options?: Options) {
  const [data, setData] = useState<TelemetryEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const rows = await fetchTelemetryEvents(limit);
      setData(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar telemetria");
    } finally {
      setLoading(false);
    }
  }, [limit]);

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
