import { API_BASE } from "./env";

export type LampStateResponse = {
  deviceId: string;
  lampOn: boolean | null;
};

export async function fetchLampState(
  deviceId: string,
): Promise<LampStateResponse> {
  const path = `${API_BASE}/devices/${encodeURIComponent(deviceId)}/lamp`;
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error("Não foi possível obter o estado da lâmpada.");
  }
  return (await res.json()) as LampStateResponse;
}

export async function setLampState(
  deviceId: string,
  on: boolean,
): Promise<LampStateResponse> {
  const path = `${API_BASE}/devices/${encodeURIComponent(deviceId)}/lamp`;
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ on }),
  });
  if (!res.ok) {
    throw new Error("Não foi possível enviar o comando da lâmpada.");
  }
  return (await res.json()) as LampStateResponse;
}
