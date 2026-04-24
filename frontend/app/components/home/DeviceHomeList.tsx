import { Fragment } from "react";
import { Link } from "react-router";
import { GlassCard } from "~/components/ui/GlassCard";
import { RgbLampControl } from "~/components/telemetry/RgbLampControl";
import { useLampState } from "~/lib/hooks/useLampState";
import type { SoilState } from "~/lib/soil";
import type { TelemetryReading } from "~/lib/telemetry";

type Props = {
  deviceIds: string[];
  soilRows: SoilState[];
  loading: boolean;
  error: string | null;
};

function labelForDevice(
  kind: "lamp" | "rgb" | "sensor" | "soil",
  index: number,
  total: number,
): string {
  if (total <= 1) {
    if (kind === "lamp") return "Lâmpada";
    if (kind === "rgb") return "Lâmpada RGB";
    if (kind === "sensor") return "Sensor";
    return "Solo";
  }
  const n = index + 1;
  if (kind === "lamp") return `Lâmpada ${n}`;
  if (kind === "rgb") return `Lâmpada RGB ${n}`;
  if (kind === "sensor") return `Sensor ${n}`;
  return `Solo ${n}`;
}

function LampDeviceCard({
  deviceId,
  label,
}: {
  deviceId: string;
  label: string;
}) {
  const { data, error, pending, toggle } = useLampState(deviceId, {
    refetchIntervalMs: 10_000,
  });
  const isOn = data?.lampOn === true;

  return (
    <div className="min-w-0">
      <GlassCard
        glow="fuchsia"
        className="rounded-xl p-0! ring-0 transition hover:bg-white/[0.06]"
      >
        <button
          type="button"
          onClick={() => {
            if (pending) return;
            void toggle(!isOn);
          }}
          disabled={pending}
          aria-busy={pending}
          aria-label={
            isOn
              ? `${label}, ligada. Toque para alternar.`
              : `${label}, desligada. Toque para alternar.`
          }
          className="flex aspect-square w-full flex-col items-center justify-between gap-2 rounded-xl p-4 pb-5 text-center outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 disabled:cursor-wait disabled:opacity-70"
        >
          <span
            className={`flex min-h-0 flex-1 flex-col items-center justify-center pt-1 ${
              isOn
                ? "text-amber-200"
                : "text-violet-300/50"
            }`}
            aria-hidden
          >
            <span
              className={`flex h-20 w-20 items-center justify-center rounded-xl ${
                isOn
                  ? "bg-amber-400/20 shadow-[0_0_16px_-4px_rgba(251,191,36,0.3)] ring-1 ring-amber-300/35"
                  : "bg-white/5 ring-1 ring-white/10"
              }`}
            >
              <svg
                className="h-11 w-11"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 3a6 6 0 0 1 3 11.197V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.803A6 6 0 0 1 12 3Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </span>
          <div className="flex w-full flex-col items-center gap-1.5">
            {pending ? (
              <span className="text-[11px] text-violet-300/80">Enviando…</span>
            ) : (
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                  isOn
                    ? "bg-amber-500/25 text-amber-100"
                    : "bg-white/10 text-violet-200/85"
                }`}
              >
                {data?.lampOn === null
                  ? "?"
                  : isOn
                    ? "Ligada"
                    : "Desligada"}
              </span>
            )}
            <p className="line-clamp-2 font-display text-sm font-semibold leading-snug text-violet-100">
              {label}
            </p>
          </div>
        </button>
      </GlassCard>
      {error && (
        <p className="mt-2 text-center text-xs text-red-300/90" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function RgbLampDeviceCard({
  deviceId,
  label,
}: {
  deviceId: string;
  label: string;
}) {
  return (
    <div className="min-w-0">
      <RgbLampControl deviceId={deviceId} label={label} />
    </div>
  );
}

function SensorDeviceCard({
  deviceId,
  label,
}: {
  deviceId: string;
  label: string;
}) {
  return (
    <Link
      to={`/sensor/${encodeURIComponent(deviceId)}`}
      className="group min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
      aria-label={`${label}: ver leituras e histórico`}
    >
      <GlassCard
        glow="violet"
        className="rounded-xl p-0! ring-0 transition group-hover:bg-white/[0.06]"
      >
        <span className="flex aspect-square w-full flex-col items-center justify-between gap-2 rounded-xl p-4 pb-5 text-center">
          <span
            className="flex min-h-0 flex-1 flex-col items-center justify-center pt-1 text-violet-200"
            aria-hidden
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-violet-500/20 ring-1 ring-violet-400/25">
              <svg
                className="h-11 w-11"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2a4 4 0 0 1 4 4v1h1a2 2 0 0 1 2 2v1H5V9a2 2 0 0 1 2-2h1V6a4 4 0 0 1 4-4Z"
                  fill="currentColor"
                  opacity="0.9"
                />
                <path
                  d="M5 12h14v2a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-2Z"
                  fill="currentColor"
                  opacity="0.65"
                />
              </svg>
            </span>
          </span>
          <div className="flex w-full flex-col items-center gap-1">
            <span className="text-[11px] font-medium text-violet-300/70">
              Ver dados
            </span>
            <p className="line-clamp-2 font-display text-sm font-semibold leading-snug text-violet-100">
              {label}
            </p>
          </div>
        </span>
      </GlassCard>
    </Link>
  );
}

function SoilDeviceCard({
  deviceId,
  label,
  row,
}: {
  deviceId: string;
  label: string;
  row: SoilState | undefined;
}) {
  const wet = row?.wetPercent;
  return (
    <Link
      to={`/soil/${encodeURIComponent(deviceId)}`}
      className="group min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
      aria-label={`${label}: ver umidade do solo`}
    >
      <GlassCard
        glow="fuchsia"
        className="rounded-xl p-0! ring-0 transition group-hover:bg-white/[0.06]"
      >
        <span className="flex aspect-square w-full flex-col items-center justify-between gap-2 rounded-xl p-4 pb-5 text-center">
          <span
            className="flex min-h-0 flex-1 flex-col items-center justify-center pt-1 text-emerald-200/90"
            aria-hidden
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-400/30">
              <svg
                className="h-11 w-11"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2c-2 3.5-6 6.5-6 11a6 6 0 1 0 12 0c0-4.5-4-7.5-6-11Z"
                  fill="currentColor"
                  opacity="0.9"
                />
                <path
                  d="M8 15h8a4 4 0 0 1-8 0Z"
                  fill="currentColor"
                  opacity="0.5"
                />
              </svg>
            </span>
          </span>
          <div className="flex w-full flex-col items-center gap-1">
            <span className="font-display text-2xl font-bold tabular-nums text-emerald-100">
              {wet != null ? `${wet}%` : "—"}
            </span>
            <span className="text-[11px] font-medium text-emerald-300/70">
              Umidade do solo
            </span>
            <p className="line-clamp-2 font-display text-sm font-semibold leading-snug text-violet-100">
              {label}
            </p>
          </div>
        </span>
      </GlassCard>
    </Link>
  );
}

export function DeviceHomeList({
  deviceIds: ids,
  soilRows,
  loading,
  error,
}: Props) {

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Dispositivos
        </h1>
        <p className="mt-2 max-w-xl text-violet-200/75">
          Lâmpada, lâmpada RGB, sensores (ar) e umidade do solo. Toque em cada
          bloco para detalhes ou ação.
        </p>
      </div>

      {error && (
        <GlassCard glow="fuchsia" className="border-red-500/30 bg-red-950/20">
          <p className="text-sm text-red-200">{error}</p>
        </GlassCard>
      )}

      {!loading && ids.length === 0 && !error && (
        <GlassCard>
          <p className="text-violet-200/80">
            Nenhum dispositivo encontrado ainda. Quando o hardware enviar
            telemetria ou solo, a lista aparecerá aqui.
          </p>
        </GlassCard>
      )}

      {ids.length > 0 && (
        <div>
          <ul
            className="flex flex-wrap justify-center gap-4"
            aria-label="Dispositivos"
          >
            {ids.map((deviceId, index) => {
              const soil = soilRows.find(
                (r) => r.deviceId.toUpperCase() === deviceId.toUpperCase(),
              );
              return (
                <Fragment key={deviceId}>
                  <li className="w-40 min-w-0 sm:w-44">
                    <LampDeviceCard
                      deviceId={deviceId}
                      label={labelForDevice("lamp", index, ids.length)}
                    />
                  </li>
                  <li className="w-40 min-w-0 sm:w-44">
                    <RgbLampDeviceCard
                      deviceId={deviceId}
                      label={labelForDevice("rgb", index, ids.length)}
                    />
                  </li>
                  <li className="w-40 min-w-0 sm:w-44">
                    <SensorDeviceCard
                      deviceId={deviceId}
                      label={labelForDevice("sensor", index, ids.length)}
                    />
                  </li>
                  <li className="w-40 min-w-0 sm:w-44">
                    <SoilDeviceCard
                      deviceId={deviceId}
                      label={labelForDevice("soil", index, ids.length)}
                      row={soil}
                    />
                  </li>
                </Fragment>
              );
            })}
          </ul>
        </div>
      )}

      {loading && ids.length === 0 && !error && (
        <GlassCard>
          <p className="text-violet-200/70">Carregando dispositivos…</p>
        </GlassCard>
      )}
    </div>
  );
}
