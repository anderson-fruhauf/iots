import { NavLink, Outlet } from "react-router";

const linkBase =
  "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200";
const linkInactive =
  "text-violet-200/70 hover:bg-white/5 hover:text-violet-100";
const linkActive =
  "bg-gradient-to-r from-violet-600/40 to-fuchsia-600/30 text-white shadow-[0_0_14px_-4px_rgba(168,85,247,0.26)]";

export function AppShell() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-deep)] text-violet-50">
      <div
        className="pointer-events-none fixed inset-0 opacity-90"
        aria-hidden
      >
        <div className="absolute -left-1/4 top-0 h-[520px] w-[520px] rounded-full bg-violet-600/14 blur-[120px]" />
        <div className="absolute -right-1/4 bottom-0 h-[480px] w-[480px] rounded-full bg-fuchsia-600/11 blur-[110px]" />
        <div className="absolute left-1/2 top-1/3 h-px w-[min(100%,80rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
      </div>

      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-lg font-bold text-white shadow-md shadow-violet-500/22"
              aria-hidden
            >
              Io
            </span>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight text-white">
                IOTS
              </p>
              <p className="text-xs text-violet-300/70">
                Telemetria em tempo real
              </p>
            </div>
          </div>
          <nav className="flex gap-1" aria-label="Principal">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                [linkBase, isActive ? linkActive : linkInactive].join(" ")
              }
            >
              Dispositivos
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
