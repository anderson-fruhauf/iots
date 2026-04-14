import type { Route } from "./+types/historico";
import { TelemetryHistoryChart } from "~/components/telemetry/TelemetryHistoryChart";
import { useTelemetryReadings } from "~/lib/hooks/useTelemetryReadings";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IOTS — Histórico" },
    {
      name: "description",
      content: "Histórico de temperatura e umidade ao longo do tempo.",
    },
  ];
}

export default function Historico() {
  const { data, error, loading, refresh } = useTelemetryReadings(200, {
    refetchIntervalMs: 30_000,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Histórico
          </h1>
          <p className="mt-2 max-w-2xl text-violet-200/75">
            Evolução das últimas leituras em ordem cronológica. Os dados são
            atualizados automaticamente.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl border border-fuchsia-500/35 bg-fuchsia-600/15 px-5 py-2.5 text-sm font-semibold text-fuchsia-100 shadow-[0_0_28px_-8px_rgba(217,70,239,0.55)] transition hover:bg-fuchsia-500/25 disabled:opacity-60"
        >
          {loading ? "Atualizando…" : "Recarregar série"}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/25 p-4 text-sm text-red-200 backdrop-blur-md">
          {error}
        </div>
      )}

      <TelemetryHistoryChart readings={data ?? []} loading={loading} />
    </div>
  );
}
