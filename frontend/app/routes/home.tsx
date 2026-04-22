import type { Route } from "./+types/home";
import { DeviceHomeList } from "~/components/home/DeviceHomeList";
import { useSoilList } from "~/lib/hooks/useSoilList";
import { useTelemetryReadings } from "~/lib/hooks/useTelemetryReadings";
import { mergeDeviceIds } from "~/lib/telemetry";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IOTS — Dispositivos" },
    {
      name: "description",
      content:
        "Lista: lâmpada, sensor (ar), umidade do solo e telemetria.",
    },
  ];
}

export default function Home() {
  const {
    data: telemetryData,
    error: telemetryError,
    loading: telemetryLoading,
  } = useTelemetryReadings(200, {
    refetchIntervalMs: 15_000,
  });
  const { data: soilData, error: soilError, loading: soilLoading } = useSoilList(
    { refetchIntervalMs: 15_000 },
  );

  const deviceIds = mergeDeviceIds(telemetryData ?? [], soilData ?? []);
  const loading = telemetryLoading || soilLoading;
  const error = telemetryError ?? soilError;

  return (
    <DeviceHomeList
      deviceIds={deviceIds}
      soilRows={soilData ?? []}
      loading={loading}
      error={error}
    />
  );
}
