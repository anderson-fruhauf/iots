import type { Route } from "./+types/historico";
import { TelemetryHistoryChart } from "~/components/telemetry/TelemetryHistoryChart";
import { useTelemetryEvents } from "~/lib/hooks/useTelemetryEvents";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IOTS — Histórico" },
    { name: "description", content: "Gráfico de histórico de telemetria." },
  ];
}

export default function Historico() {
  const { data, error, loading, refresh } = useTelemetryEvents(200, {
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
            Visualização das últimas leituras retornadas por{" "}
            <code className="rounded-md bg-white/5 px-1.5 py-0.5 text-sm">
              GET /telemetry/events?limit=200
            </code>
            , em ordem cronológica no gráfico.
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

      <TelemetryHistoryChart events={data ?? []} loading={loading} />
    </div>
  );
}
