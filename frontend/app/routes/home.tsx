import type { Route } from "./+types/home";
import { DeviceHomeList } from "~/components/home/DeviceHomeList";
import { useTelemetryReadings } from "~/lib/hooks/useTelemetryReadings";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IOTS — Dispositivos" },
    {
      name: "description",
      content:
        "Lista de dispositivos: lâmpada e sensor, com controle e telemetria.",
    },
  ];
}

export default function Home() {
  const { data, error, loading } = useTelemetryReadings(200, {
    refetchIntervalMs: 15_000,
  });

  return (
    <DeviceHomeList
      readings={data ?? []}
      loading={loading}
      error={error}
    />
  );
}
