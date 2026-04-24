import { useCallback, useEffect, useState } from "react";
import {
  fetchLampRgbState,
  setLampRgbState,
  type LampRgbStateResponse,
} from "~/lib/deviceRgbLamp";

type Options = {
  refetchIntervalMs?: number;
};

export function useLampRgbState(
  deviceId: string | undefined,
  options?: Options,
) {
  const [data, setData] = useState<LampRgbStateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(async () => {
    if (!deviceId) {
      setData(null);
      return;
    }
    try {
      setError(null);
      const row = await fetchLampRgbState(deviceId);
      setData(row);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível obter o estado da lâmpada RGB.",
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

  const apply = useCallback(
    async (on: boolean, r: number, g: number, b: number) => {
      if (!deviceId) return;
      setPending(true);
      setError(null);
      try {
        const row = await setLampRgbState(deviceId, on, r, g, b);
        setData(row);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Não foi possível alterar a lâmpada RGB.",
        );
      } finally {
        setPending(false);
      }
    },
    [deviceId],
  );

  return { data, error, pending, refresh, apply };
}
