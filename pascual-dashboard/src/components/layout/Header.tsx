"use client";

import { StatusBadge } from "../ui/Badge";
import { useDashboardConfig } from "@/lib/context/DashboardConfigContext";
import { mockSystemResources } from "@/lib/api/mock/dashboard";
import { SystemResources, getMemoryPercentage, getUsageColor } from "@/lib/api/types";

interface HeaderProps {
  title?: string;
  systemStatus?: "active" | "busy" | "offline" | "error";
  /** Recursos del sistema (RAM/VRAM). Si no se provee, usa mock data */
  systemResources?: SystemResources;
}

export function Header({
  title = "Dashboard",
  systemStatus = "active",
  systemResources = mockSystemResources,
}: HeaderProps) {
  const { config } = useDashboardConfig();

  const ramPercentage = getMemoryPercentage(systemResources.ram);
  const vramPercentage = getMemoryPercentage(systemResources.vram);

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-800 px-6 pr-24 flex items-center justify-between">
      {/* Left: Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-mono font-bold text-white">{title}</h2>
        <StatusBadge status={systemStatus} />
      </div>

      {/* Right: System Resources & Status */}
      <div className="flex items-center gap-6">
        {/* RAM Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] text-zinc-500 uppercase">RAM</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-sm font-bold" style={{ color: getUsageColor(ramPercentage) }}>
                {systemResources.ram.used}
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                / {systemResources.ram.total} GB
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${ramPercentage}%`,
                  backgroundColor: getUsageColor(ramPercentage),
                }}
              />
            </div>
            <span
              className="font-mono text-[10px] font-bold"
              style={{ color: getUsageColor(ramPercentage) }}
            >
              {ramPercentage}%
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-zinc-800" />

        {/* VRAM Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] text-zinc-500 uppercase">VRAM</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-sm font-bold" style={{ color: getUsageColor(vramPercentage) }}>
                {systemResources.vram.used}
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                / {systemResources.vram.total} GB
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${vramPercentage}%`,
                  backgroundColor: getUsageColor(vramPercentage),
                }}
              />
            </div>
            <span
              className="font-mono text-[10px] font-bold"
              style={{ color: getUsageColor(vramPercentage) }}
            >
              {vramPercentage}%
            </span>
          </div>
        </div>

        {/* System Status Indicators */}
        {(config.header.showSystemStatus || config.header.showLastSync) && (
          <>
            {/* Divider */}
            <div className="h-8 w-px bg-zinc-800" />

            <div className="flex items-center gap-4">
              {config.header.showSystemStatus && (
                <>
                  <div className="w-2 h-2 rounded-full bg-[#39ff14] status-pulse" />
                  <span className="font-mono text-xs text-zinc-400">
                    Uptime: <span className="text-[#39ff14]">99.8%</span>
                  </span>
                </>
              )}
              {config.header.showSystemStatus && config.header.showLastSync && (
                <span className="text-zinc-700">|</span>
              )}
              {config.header.showLastSync && (
                <span className="font-mono text-xs text-zinc-400">
                  Sync: <span className="text-[#00d9ff]">2s</span>
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
