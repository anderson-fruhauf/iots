import { LampControl } from "~/components/telemetry/LampControl";
import { GlassCard } from "~/components/ui/GlassCard";
import { pickLatest, type TelemetryReading } from "~/lib/telemetry";

function lampLabel(index: number, total: number): string {
  if (total <= 1) {
    return "Lâmpada principal";
  }
  return index === 0 ? "Lâmpada principal" : `Lâmpada ${index + 1}`;
}

function uniqueDeviceIds(readings: TelemetryReading[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of readings) {
    if (!seen.has(r.deviceId)) {
      seen.add(r.deviceId);
      out.push(r.deviceId);
    }
  }
  return out;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  });
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

type Props = {
  readings: TelemetryReading[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

export function LiveTelemetryPanel({ readings, loading, error, onRefresh }: Props) {
  const latest = pickLatest(readings);
  const deviceIdsForLamp = uniqueDeviceIds(readings);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Painel ao vivo
          </h1>
          <p className="mt-2 max-w-xl text-violet-200/75">
            Acompanhe temperatura, umidade e o controle dos dispositivos, com
            atualização periódica.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl border border-violet-500/40 bg-violet-600/20 px-5 py-2.5 text-sm font-semibold text-violet-100 shadow-[0_0_28px_-8px_rgba(139,92,246,0.6)] transition hover:bg-violet-500/30 disabled:opacity-60"
        >
          {loading ? "Atualizando…" : "Atualizar agora"}
        </button>
      </div>

      {error && (
        <GlassCard glow="fuchsia" className="border-red-500/30 bg-red-950/20">
          <p className="text-sm text-red-200">{error}</p>
          <p className="mt-2 text-xs text-violet-300/60">
            Verifique sua conexão e tente novamente. Se o problema continuar,
            entre em contato com o suporte.
          </p>
        </GlassCard>
      )}

      <GlassCard className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-2xl" />
        {!latest && !loading && !error ? (
          <p className="text-violet-200/80">
            Ainda não há leituras disponíveis. Os valores aparecerão aqui assim
            que o dispositivo estiver enviando dados.
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
            <div className="sm:col-span-2 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-sm text-violet-200/80">
              <span>
                <strong className="text-violet-100">Dispositivo:</strong>{" "}
                <code className="rounded bg-white/5 px-1.5 py-0.5">
                  {latest.deviceId}
                </code>
              </span>
              <span>
                <strong className="text-violet-100">Horário:</strong>{" "}
                {formatTime(latest.recordedAt)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-violet-200/70">Carregando leitura mais recente…</p>
        )}
      </GlassCard>

      {deviceIdsForLamp.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-white">
            Controle de dispositivos
          </h2>
          <div className="flex flex-wrap gap-4">
            {deviceIdsForLamp.map((id, index) => (
              <LampControl
                key={id}
                deviceId={id}
                label={lampLabel(index, deviceIdsForLamp.length)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
