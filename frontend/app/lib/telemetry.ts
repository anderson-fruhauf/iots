import { API_BASE } from "./env";

export type TelemetryReading = {
  id: string;
  deviceId: string;
  temperature: number | null;
  humidity: number | null;
  recordedAt: string;
};

export type FetchTelemetryOptions = {
  deviceId?: string;
};

export async function fetchTelemetryReadings(
  limit = 50,
  options?: FetchTelemetryOptions,
): Promise<TelemetryReading[]> {
  const url = new URL(`${API_BASE}/telemetry/readings`);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 200)));
  if (options?.deviceId) {
    url.searchParams.set("deviceId", options.deviceId);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Não foi possível carregar os dados no momento.");
  }
  return (await res.json()) as TelemetryReading[];
}

/** IDs distintos preservando a ordem de primeira aparição. */
export function uniqueDeviceIds(readings: TelemetryReading[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of readings) {
    if (!seen.has(r.deviceId)) {
      seen.add(r.deviceId);
      out.push(r.deviceId);
    }
  }
  return out;
}

type DeviceIdHolder = { deviceId: string };

export function mergeDeviceIds(
  fromTelemetry: TelemetryReading[],
  fromSoil: DeviceIdHolder[],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of fromTelemetry) {
    if (!seen.has(r.deviceId)) {
      seen.add(r.deviceId);
      out.push(r.deviceId);
    }
  }
  for (const s of fromSoil) {
    if (s.deviceId && !seen.has(s.deviceId)) {
      seen.add(s.deviceId);
      out.push(s.deviceId);
    }
  }
  return out;
}

/** Primeiro item da lista (ordenada da mais recente para a mais antiga). */
export function pickLatest(
  readings: TelemetryReading[],
): TelemetryReading | undefined {
  return readings[0];
}
