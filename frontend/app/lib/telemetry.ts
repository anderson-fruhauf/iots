import { API_BASE } from "./env";

export type TelemetryEvent = {
  id: string;
  deviceId: string;
  temperature: number | null;
  humidity: number | null;
  unit: string | null;
  mqttTopic: string;
  rawPayload: Record<string, unknown> | null;
  receivedAt: string;
};

export async function fetchTelemetryEvents(limit = 50): Promise<TelemetryEvent[]> {
  const url = new URL(`${API_BASE}/telemetry/events`);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 200)));
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return (await res.json()) as TelemetryEvent[];
}

/** Primeiro item da lista retornada pelo backend (DESC por receivedAt) = leitura mais recente. */
export function pickLatest(events: TelemetryEvent[]): TelemetryEvent | undefined {
  return events[0];
}
