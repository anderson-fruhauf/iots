import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  glow?: "violet" | "fuchsia" | "none";
};

const glowClass = {
  violet: "shadow-[0_0_36px_-8px_rgba(168,85,247,0.2)]",
  fuchsia: "shadow-[0_0_36px_-8px_rgba(217,70,239,0.18)]",
  none: "",
} as const;

export function GlassCard({ children, className = "", glow = "violet" }: Props) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl",
        "ring-1 ring-inset ring-white/5",
        glowClass[glow],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
