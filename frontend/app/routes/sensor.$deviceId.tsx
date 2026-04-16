import { Link, useParams } from "react-router";
import type { Route } from "./+types/sensor.$deviceId";
import { TelemetryHistoryChart } from "~/components/telemetry/TelemetryHistoryChart";
import { GlassCard } from "~/components/ui/GlassCard";
import { useTelemetryReadings } from "~/lib/hooks/useTelemetryReadings";
import { pickLatest } from "~/lib/telemetry";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IOTS — Sensor" },
    {
      name: "description",
      content: "Leituras e histórico de temperatura e umidade do sensor.",
    },
  ];
}

function Metric({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  accent: "temp" | "hum";
}) {
  const accentClass =
    accent === "temp"
      ? "from-violet-400 to-fuchsia-400"
      : "from-fuchsia-400 to-purple-300";
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-widest text-violet-300/60">
        {label}
      </span>
      <p
        className={`bg-gradient-to-r ${accentClass} bg-clip-text font-display text-4xl font-bold tabular-nums text-transparent sm:text-5xl`}
      >
        {value}
        <span className="ml-1 text-lg font-semibold text-violet-200/80">
          {unit}
        </span>
      </p>
    </div>
  );
}

export default function SensorDetail() {
  const { deviceId: rawId } = useParams();
  const deviceId = rawId?.trim() ?? "";

  const { data, error, loading, refresh } = useTelemetryReadings(200, {
    deviceId: deviceId.length > 0 ? deviceId : undefined,
    refetchIntervalMs: 15_000,
  });

  const latest = pickLatest(data ?? []);

  if (!deviceId) {
    return (
      <div className="space-y-6">
        <Link
          to="/"
          className="w-fit text-sm font-medium text-violet-300/90 underline-offset-4 transition hover:text-white hover:underline"
        >
          ← Voltar aos dispositivos
        </Link>
        <GlassCard>
          <p className="text-violet-200/80">
            Dispositivo não informado na URL.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Link
          to="/"
          className="w-fit text-sm font-medium text-violet-300/90 underline-offset-4 transition hover:text-white hover:underline"
        >
          ← Voltar aos dispositivos
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Sensor
            </h1>
            <p className="mt-2 max-w-xl text-violet-200/75">
              Temperatura, umidade e histórico de leituras.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl border border-fuchsia-500/35 bg-fuchsia-600/15 px-5 py-2.5 text-sm font-semibold text-fuchsia-100 shadow-[0_0_18px_-6px_rgba(217,70,239,0.28)] transition hover:bg-fuchsia-500/25 disabled:opacity-60"
          >
            {loading ? "Atualizando…" : "Recarregar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/25 p-4 text-sm text-red-200 backdrop-blur-md">
          {error}
        </div>
      )}

      <GlassCard className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-2xl" />
        {!latest && !loading && !error ? (
          <p className="text-violet-200/80">
            Ainda não há leituras para este dispositivo.
          </p>
        ) : latest ? (
          <div className="relative grid gap-8 sm:grid-cols-2">
            <Metric
              label="Temperatura"
              value={
                latest.temperature != null
                  ? latest.temperature.toFixed(1)
                  : "—"
              }
              unit="°C"
              accent="temp"
            />
            <Metric
              label="Umidade"
              value={
                latest.humidity != null ? latest.humidity.toFixed(1) : "—"
              }
              unit="%"
              accent="hum"
            />
            <div className="sm:col-span-2 border-t border-white/10 pt-6 text-sm text-violet-200/80">
              <strong className="text-violet-100">Horário da leitura:</strong>{" "}
              {new Date(latest.recordedAt).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "medium",
              })}
            </div>
          </div>
        ) : (
          <p className="text-violet-200/70">Carregando leituras…</p>
        )}
      </GlassCard>

      <div className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-white">
          Histórico
        </h2>
        <TelemetryHistoryChart readings={data ?? []} loading={loading} />
      </div>
    </div>
  );
}
