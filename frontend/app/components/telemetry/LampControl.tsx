import { GlassCard } from "~/components/ui/GlassCard";
import { useLampState } from "~/lib/hooks/useLampState";

type Props = {
  deviceId: string;
  /** Nome exibido no card (o ID continua sendo usado só na API). */
  label?: string;
};

function LampIcon({ on }: { on: boolean }) {
  if (on) {
    return (
      <span
        className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-amber-400/25 text-amber-200 shadow-[0_0_32px_-6px_rgba(251,191,36,0.7)] ring-1 ring-amber-300/40"
        aria-hidden
      >
        <svg
          className="h-16 w-16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3a6 6 0 0 1 3 11.197V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.803A6 6 0 0 1 12 3Z"
            fill="currentColor"
            className="text-amber-100"
          />
          <path
            d="M9 18h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1Z"
            fill="currentColor"
            className="text-amber-200/90"
          />
          <path
            d="M9 4.5V2M15 4.5V2M6.5 7.5 5 6M17.5 7.5 19 6"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="text-amber-200/80"
          />
        </svg>
      </span>
    );
  }
  return (
    <span
      className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-violet-300/50 ring-1 ring-white/10"
      aria-hidden
    >
      <svg
        className="h-16 w-16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3a6 6 0 0 1 3 11.197V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.803A6 6 0 0 1 12 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9 18h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function LampControl({
  deviceId,
  label = "Lâmpada principal",
}: Props) {
  const { data, error, pending, toggle } = useLampState(deviceId, {
    refetchIntervalMs: 10_000,
  });

  const lampOn = data?.lampOn;
  const isOn = lampOn === true;

  const handleCardClick = () => {
    if (pending) return;
    void toggle(!isOn);
  };

  return (
    <div className="w-40 sm:w-44">
      <GlassCard
        glow="fuchsia"
        className="!p-0 ring-0 transition hover:bg-white/[0.07]"
      >
        <button
          type="button"
          onClick={handleCardClick}
          disabled={pending}
          aria-busy={pending}
          aria-pressed={isOn}
          aria-label={
            isOn
              ? `${label}, ligada. Toque para desligar.`
              : `${label}, desligada. Toque para ligar.`
          }
          className="relative flex aspect-square w-full flex-col items-center justify-between gap-3 rounded-2xl p-4 pb-5 text-center outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 disabled:cursor-wait disabled:opacity-70"
        >
          {pending && (
            <span
              className="absolute right-3 top-3 h-2.5 w-2.5 animate-pulse rounded-full bg-violet-400/70"
              aria-hidden
            />
          )}
          <div className="flex flex-1 flex-col items-center justify-center pt-1">
            <LampIcon on={isOn} />
          </div>
          <p className="line-clamp-2 w-full px-0.5 font-display text-sm font-semibold leading-snug tracking-tight text-violet-100">
            {label}
          </p>
        </button>
      </GlassCard>
      {error && (
        <p className="mt-2 text-xs text-red-300/90" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
