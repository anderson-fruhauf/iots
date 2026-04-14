import { API_BASE } from "./env";

export type TelemetryReading = {
  id: string;
  deviceId: string;
  temperature: number | null;
  humidity: number | null;
  recordedAt: string;
};

export async function fetchTelemetryReadings(
  limit = 50,
): Promise<TelemetryReading[]> {
  const url = new URL(`${API_BASE}/telemetry/readings`);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 200)));
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Não foi possível carregar os dados no momento.");
  }
  return (await res.json()) as TelemetryReading[];
}

/** Primeiro item da lista (ordenada da mais recente para a mais antiga). */
export function pickLatest(
  readings: TelemetryReading[],
): TelemetryReading | undefined {
  return readings[0];
}
