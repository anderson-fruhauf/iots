import {
  useCallback,
  useId,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import { GlassCard } from "~/components/ui/GlassCard";
import { hexToRgb, rgbToHex } from "~/lib/deviceRgbLamp";
import { useLampRgbState } from "~/lib/hooks/useLampRgbState";

type Props = {
  deviceId: string;
  label?: string;
};

export function RgbLampControl({
  deviceId,
  label = "Lâmpada RGB",
}: Props) {
  const { data, error, pending, apply } = useLampRgbState(deviceId, {
    refetchIntervalMs: 10_000,
  });
  const idColor = useId();
  const isOn = data?.lampRgbOn === true;
  const r = data?.r ?? 255;
  const g = data?.g ?? 255;
  const b = data?.b ?? 255;
  const hex = rgbToHex(r, g, b);

  const onToggle = useCallback(() => {
    if (pending) return;
    void apply(!isOn, r, g, b);
  }, [apply, b, g, isOn, pending, r]);

  const onColorPick = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (pending) return;
      const { r: nr, g: ng, b: nb } = hexToRgb(e.target.value);
      void apply(true, nr, ng, nb);
    },
    [apply, pending],
  );

  const onCardClick = (e: MouseEvent<HTMLDivElement>) => {
    if (pending) return;
    if ((e.target as HTMLElement).closest("[data-rgb-pick]")) {
      return;
    }
    onToggle();
  };

  const onCardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (pending) return;
      onToggle();
    }
  };

  return (
    <div className="w-40 sm:w-44">
      <GlassCard
        glow="fuchsia"
        className="!p-0 ring-0 transition hover:bg-white/[0.07]"
      >
        <div
          className="relative flex aspect-square w-full cursor-pointer flex-col items-stretch justify-between gap-1 rounded-2xl p-4 text-center outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
          onClick={onCardClick}
          onKeyDown={onCardKeyDown}
          tabIndex={0}
          role="group"
          aria-label={
            isOn
              ? `${label}, ligada. Clique no card para desligar; use o seletor para a cor.`
              : `${label}, desligada. Clique no card para ligar.`
          }
        >
          {pending && (
            <span
              className="absolute right-3 top-3 h-2.5 w-2.5 animate-pulse rounded-full bg-violet-400/70"
              aria-hidden
            />
          )}
          <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-2 pt-1">
            <div
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/15"
              style={
                isOn
                  ? {
                      backgroundColor: `rgb(${r}, ${g}, ${b})`,
                      boxShadow: `0 0 20px -4px rgba(${r},${g},${b},0.5)`,
                    }
                  : { backgroundColor: "rgb(20, 20, 32)" }
              }
              aria-hidden
            />
            <div
              data-rgb-pick
              className="flex w-full max-w-full flex-col items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                id={idColor}
                type="color"
                value={hex}
                onChange={onColorPick}
                disabled={pending}
                className="h-8 w-full min-w-0 max-w-[5.5rem] cursor-pointer rounded border border-white/20 bg-white/5 p-0.5"
                title="Cor"
                aria-label={`Ajustar cor: ${label}`}
                onKeyDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-[10px] text-violet-300/75">Ajuste de cor</span>
            </div>
          </div>
          <p className="line-clamp-2 font-display text-sm font-semibold leading-snug text-violet-100">
            {label}
          </p>
        </div>
      </GlassCard>
      {error && (
        <p className="mt-2 text-center text-xs text-red-300/90" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
