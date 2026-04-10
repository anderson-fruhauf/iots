import type { Route } from "./+types/home";
import { LiveTelemetryPanel } from "~/components/telemetry/LiveTelemetryPanel";
import { useTelemetryEvents } from "~/lib/hooks/useTelemetryEvents";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IOTS — Ao vivo" },
    { name: "description", content: "Telemetria mais recente do backend." },
  ];
}

export default function Home() {
  const { data, error, loading, refresh } = useTelemetryEvents(1, {
    refetchIntervalMs: 15_000,
  });

  return (
    <LiveTelemetryPanel
      events={data ?? []}
      loading={loading}
      error={error}
      onRefresh={refresh}
    />
  );
}
