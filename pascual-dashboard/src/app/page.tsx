import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-grid">
      <main className="flex flex-col items-center justify-center gap-8 p-8">
        {/* Logo */}
        <div className="text-center">
          <h1
            className="text-6xl font-mono font-bold neon-text-cyan glitch"
            data-text="PASCUAL"
          >
            PASCUAL
          </h1>
          <p className="text-zinc-500 font-mono mt-4 text-sm tracking-widest uppercase">
            Multi-Agent AI Assistant System
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-sm font-mono">
          <span className="w-2 h-2 rounded-full bg-[#39ff14] status-pulse" />
          <span className="text-zinc-400">System Online</span>
        </div>

        {/* Enter button */}
        <Link
          href="/dashboard"
          className="btn-neo px-8 py-3 text-lg tracking-wider"
        >
          ENTER DASHBOARD
        </Link>

        {/* System info */}
        <div className="grid grid-cols-3 gap-8 mt-8 text-center">
          <div>
            <p className="text-2xl font-mono font-bold text-[#00d9ff]">5</p>
            <p className="text-xs font-mono text-zinc-500 uppercase mt-1">
              Agents
            </p>
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-[#39ff14]">24%</p>
            <p className="text-xs font-mono text-zinc-500 uppercase mt-1">
              CPU Load
            </p>
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-[#ff006e]">3.2GB</p>
            <p className="text-xs font-mono text-zinc-500 uppercase mt-1">
              Memory
            </p>
          </div>
        </div>

        {/* Version */}
        <p className="text-xs font-mono text-zinc-700 mt-8">v1.0.0</p>
      </main>
    </div>
  );
}
