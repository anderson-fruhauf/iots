import { useCallback, useEffect, useState } from "react";
import {
  type TelemetryReading,
  fetchTelemetryReadings,
} from "~/lib/telemetry";

type Options = {
  /** Intervalo de atualização automática em ms (omitir para só carregar uma vez). */
  refetchIntervalMs?: number;
};

export function useTelemetryReadings(limit: number, options?: Options) {
  const [data, setData] = useState<TelemetryReading[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const rows = await fetchTelemetryReadings(limit);
      setData(rows);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar os dados. Tente novamente.",
      );
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
