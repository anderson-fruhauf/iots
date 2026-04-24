import { API_BASE } from "./env";

export type LampRgbStateResponse = {
  deviceId: string;
  lampRgbOn: boolean | null;
  r: number | null;
  g: number | null;
  b: number | null;
};

export function rgbToHex(
  r: number | null | undefined,
  g: number | null | undefined,
  b: number | null | undefined,
  fallback: string = "#ffffff",
) {
  if (r == null || g == null || b == null) return fallback;
  const t = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${t(r)}${t(g)}${t(b)}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  if (h.length < 6) {
    return { r: 255, g: 255, b: 255 };
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export async function fetchLampRgbState(
  deviceId: string,
): Promise<LampRgbStateResponse> {
  const path = `${API_BASE}/devices/${encodeURIComponent(deviceId)}/lamp-rgb`;
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error("Não foi possível obter o estado da lâmpada RGB.");
  }
  return (await res.json()) as LampRgbStateResponse;
}

export async function setLampRgbState(
  deviceId: string,
  on: boolean,
  r: number,
  g: number,
  b: number,
): Promise<LampRgbStateResponse> {
  const path = `${API_BASE}/devices/${encodeURIComponent(deviceId)}/lamp-rgb`;
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ on, r, g, b }),
  });
  if (!res.ok) {
    throw new Error("Não foi possível enviar o comando da lâmpada RGB.");
  }
  return (await res.json()) as LampRgbStateResponse;
}
