import type { Route } from "./+types/home";
import { LiveTelemetryPanel } from "~/components/telemetry/LiveTelemetryPanel";
import { useTelemetryReadings } from "~/lib/hooks/useTelemetryReadings";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IOTS — Ao vivo" },
    {
      name: "description",
      content: "Monitoramento ao vivo de temperatura e umidade dos dispositivos.",
    },
  ];
}

export default function Home() {
  const { data, error, loading, refresh } = useTelemetryReadings(1, {
    refetchIntervalMs: 15_000,
  });

  return (
    <LiveTelemetryPanel
      readings={data ?? []}
      loading={loading}
      error={error}
      onRefresh={refresh}
    />
  );
}
