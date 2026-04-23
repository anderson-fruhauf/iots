import { API_BASE } from "./env";

/** Vazão aproximada usada na UI para volume (L) a partir do tempo. */
export const IRRIGATION_LITERS_PER_HOUR = 180;

export type SoilState = {
  deviceId: string;
  soilRaw: number;
  wetPercent: number;
  updatedAt: string;
};

export type IrrigationEvent = {
  id: string;
  deviceId: string;
  durationMs: number;
  createdAt: string;
};

export function volumeLitersFromIrrigationDurationMs(durationMs: number): number {
  const h = durationMs / (3_600 * 1_000);
  return h * IRRIGATION_LITERS_PER_HOUR;
}

export function formatIrrigationDurationMs(durationMs: number): string {
  const totalSec = Math.max(0, Math.round(durationMs / 1_000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m > 0) {
    return `${m} min ${s.toString().padStart(2, "0")} s`;
  }
  return `${s} s`;
}

export async function fetchSoilRows(): Promise<SoilState[]> {
  const res = await fetch(`${API_BASE}/soil`);
  if (!res.ok) {
    throw new Error("Não foi possível carregar os dados de solo.");
  }
  return (await res.json()) as SoilState[];
}

export async function fetchSoilByDevice(
  deviceId: string,
): Promise<SoilState> {
  const res = await fetch(
    `${API_BASE}/soil/${encodeURIComponent(deviceId)}`,
  );
  if (res.status === 404) {
    throw new Error("Nenhum dado de solo para este dispositivo.");
  }
  if (!res.ok) {
    throw new Error("Não foi possível carregar o solo.");
  }
  return (await res.json()) as SoilState;
}

export async function fetchIrrigationHistoryByDevice(
  deviceId: string,
): Promise<IrrigationEvent[]> {
  const res = await fetch(
    `${API_BASE}/soil/${encodeURIComponent(deviceId)}/irrigation`,
  );
  if (res.status === 404) {
    return [];
  }
  if (!res.ok) {
    throw new Error("Não foi possível carregar o histórico de irrigação.");
  }
  return (await res.json()) as IrrigationEvent[];
}
