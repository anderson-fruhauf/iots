import { API_BASE } from "./env";

export type SoilState = {
  deviceId: string;
  soilRaw: number;
  wetPercent: number;
  updatedAt: string;
};

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
