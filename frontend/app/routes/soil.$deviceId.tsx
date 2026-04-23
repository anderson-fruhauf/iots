import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { Route } from "./+types/soil.$deviceId";
import { GlassCard } from "~/components/ui/GlassCard";
import {
  fetchIrrigationHistoryByDevice,
  fetchSoilByDevice,
  formatIrrigationDurationMs,
  IRRIGATION_LITERS_PER_HOUR,
  type IrrigationEvent,
  type SoilState,
  volumeLitersFromIrrigationDurationMs,
} from "~/lib/soil";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IOTS — Solo" },
    { name: "description", content: "Umidade do solo e leitura bruta (ADC)." },
  ];
}

export default function SoilDetail() {
  const { deviceId: rawId } = useParams();
  const deviceId = rawId?.trim() ?? "";
  const [row, setRow] = useState<SoilState | null>(null);
  const [irrigation, setIrrigation] = useState<IrrigationEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    setError(null);
    try {
      const [s, h] = await Promise.all([
        fetchSoilByDevice(deviceId),
        fetchIrrigationHistoryByDevice(deviceId).catch(() => [] as IrrigationEvent[]),
      ]);
      setRow(s);
      setIrrigation(h);
    } catch (e) {
      setRow(null);
      setIrrigation(null);
      setError(
        e instanceof Error ? e.message : "Não foi possível carregar o solo.",
      );
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    void load();
  }, [load]);

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
          <p className="text-violet-200/80">Dispositivo não informado.</p>
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
              Solo
            </h1>
            <p className="mt-2 max-w-xl text-violet-200/75">
              Umidade estimada (0% seco, 100% muito húmido) e leitura bruta do
              ADC. Cada fim de irrigação registra duração; o volume exibido usa
              aprox. {IRRIGATION_LITERS_PER_HOUR} L/h.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl border border-emerald-500/35 bg-emerald-600/15 px-5 py-2.5 text-sm font-semibold text-emerald-100 shadow-[0_0_18px_-6px_rgba(16,185,129,0.25)] transition hover:bg-emerald-500/25 disabled:opacity-60"
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
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl" />
        {loading && !row ? (
          <p className="text-violet-200/70">Carregando…</p>
        ) : row ? (
          <div className="relative grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-widest text-violet-300/60">
                Umidade (estimada)
              </span>
              <p className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text font-display text-4xl font-bold tabular-nums text-transparent sm:text-5xl">
                {row.wetPercent}
                <span className="ml-1 text-lg font-semibold text-violet-200/80">
                  %
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-widest text-violet-300/60">
                ADC bruto
              </span>
              <p className="font-display text-4xl font-bold tabular-nums text-violet-100 sm:text-5xl">
                {row.soilRaw}
              </p>
            </div>
            <div className="sm:col-span-2 border-t border-white/10 pt-6 text-sm text-violet-200/80">
              <strong className="text-violet-100">Última leitura:</strong>{" "}
              {new Date(row.updatedAt).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "medium",
              })}
            </div>
            <p className="text-xs text-violet-300/50 sm:col-span-2">
              ID: {row.deviceId}
            </p>
          </div>
        ) : !error ? (
          <p className="text-violet-200/80">Sem dados.</p>
        ) : null}
      </GlassCard>

      <GlassCard className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-6 top-0 h-28 w-28 rounded-full bg-sky-500/15 blur-2xl" />
        <h2 className="relative font-display text-lg font-bold text-white">
          Histórico de irrigação
        </h2>
        <p className="relative mt-1 text-sm text-violet-200/75">
          Duração medida no dispositivo. Volume ≈ duração × {IRRIGATION_LITERS_PER_HOUR}{" "}
          L/h.
        </p>
        {loading && irrigation === null && !error ? (
          <p className="relative mt-4 text-violet-200/70">Carregando…</p>
        ) : irrigation && irrigation.length > 0 ? (
          <ul className="relative mt-4 max-h-80 space-y-2 overflow-y-auto pr-1 text-sm">
            {irrigation.map((ev) => {
              const vol = volumeLitersFromIrrigationDurationMs(ev.durationMs);
              return (
                <li
                  key={String(ev.id)}
                  className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-violet-200/90">
                    {new Date(ev.createdAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    })}
                  </span>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 tabular-nums text-violet-100">
                    <span>
                      {formatIrrigationDurationMs(ev.durationMs)}
                    </span>
                    <span className="text-emerald-200/95">
                      ≈{" "}
                      {vol.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}{" "}
                      L
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : !loading && !error ? (
          <p className="relative mt-4 text-violet-200/80">
            Ainda não há registos de irrigação para este dispositivo.
          </p>
        ) : null}
      </GlassCard>
    </div>
  );
}
