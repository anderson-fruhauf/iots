import { useCallback, useEffect, useState } from "react";
import {
  fetchLampState,
  setLampState,
  type LampStateResponse,
} from "~/lib/deviceLamp";

type Options = {
  refetchIntervalMs?: number;
};

export function useLampState(deviceId: string | undefined, options?: Options) {
  const [data, setData] = useState<LampStateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(async () => {
    if (!deviceId) {
      setData(null);
      return;
    }
    try {
      setError(null);
      const row = await fetchLampState(deviceId);
      setData(row);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível obter o estado da lâmpada.",
      );
    }
  }, [deviceId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const ms = options?.refetchIntervalMs;
    if (!deviceId || !ms || ms < 1000) return;
    const id = window.setInterval(() => void refresh(), ms);
    return () => window.clearInterval(id);
  }, [deviceId, refresh, options?.refetchIntervalMs]);

  const toggle = useCallback(
    async (on: boolean) => {
      if (!deviceId) return;
      setPending(true);
      setError(null);
      try {
        const row = await setLampState(deviceId, on);
        setData(row);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Não foi possível alterar a lâmpada.",
        );
      } finally {
        setPending(false);
      }
    },
    [deviceId],
  );

  return { data, error, pending, refresh, toggle };
}
