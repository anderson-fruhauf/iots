import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard } from "~/components/ui/GlassCard";
import type { TelemetryEvent } from "~/lib/telemetry";

export type ChartPoint = {
  label: string;
  temp: number | null;
  hum: number | null;
};

function toChartPoints(events: TelemetryEvent[]): ChartPoint[] {
  const chronological = [...events].reverse();
  return chronological.map((e) => ({
    label: new Date(e.receivedAt).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    temp: e.temperature,
    hum: e.humidity,
  }));
}

const tooltipStyle = {
  backgroundColor: "rgba(15, 10, 35, 0.95)",
  border: "1px solid rgba(139, 92, 246, 0.45)",
  borderRadius: "12px",
  color: "#ede9fe",
};

type Props = {
  events: TelemetryEvent[];
  loading: boolean;
};

export function TelemetryHistoryChart({ events, loading }: Props) {
  const points = toChartPoints(events);

  return (
    <GlassCard className="min-h-[420px]">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            Série temporal
          </h2>
          <p className="text-sm text-violet-300/70">
            Até {points.length} pontos (ordem cronológica)
          </p>
        </div>
        {loading && (
          <span className="text-sm text-fuchsia-300/80">Atualizando…</span>
        )}
      </div>

      {points.length === 0 ? (
        <p className="py-16 text-center text-violet-300/70">
          Sem dados para o gráfico. Aguarde telemetria ou verifique a API.
        </p>
      ) : (
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="rgba(139, 92, 246, 0.12)"
                strokeDasharray="4 8"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(196, 181, 253, 0.75)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(139, 92, 246, 0.25)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="t"
                tick={{ fill: "rgba(196, 181, 253, 0.75)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
                label={{
                  value: "°C",
                  angle: -90,
                  position: "insideLeft",
                  fill: "rgba(167, 139, 250, 0.8)",
                  fontSize: 11,
                }}
              />
              <YAxis
                yAxisId="h"
                orientation="right"
                tick={{ fill: "rgba(244, 114, 182, 0.85)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
                label={{
                  value: "%",
                  angle: 90,
                  position: "insideRight",
                  fill: "rgba(244, 114, 182, 0.85)",
                  fontSize: 11,
                }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#ddd6fe" }}
                formatter={(value, name) => {
                  const v = value as number | string | undefined;
                  if (v === undefined) return ["—", String(name)];
                  if (name === "temp")
                    return [`${Number(v).toFixed(1)} °C`, "Temperatura"];
                  if (name === "hum")
                    return [`${Number(v).toFixed(1)} %`, "Umidade"];
                  return [v, String(name)];
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) =>
                  value === "temp" ? "Temperatura" : value === "hum" ? "Umidade" : value
                }
              />
              <Area
                yAxisId="t"
                type="monotone"
                dataKey="temp"
                name="temp"
                stroke="#c084fc"
                strokeWidth={2}
                fill="url(#fillTemp)"
                connectNulls
              />
              <Line
                yAxisId="h"
                type="monotone"
                dataKey="hum"
                name="hum"
                stroke="#f472b6"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}
