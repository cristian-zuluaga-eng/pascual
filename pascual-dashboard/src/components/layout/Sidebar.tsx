"use client";

import { useState } from "react";
import { NavLink } from "../ui/NavLink";

const navItems = [
  { name: "Home", path: "/dashboard", icon: "⊞" },
  { name: "Agents", path: "/dashboard/agents", icon: "◎" },
  { name: "Security", path: "/dashboard/security", icon: "⛊" },
  { name: "Finance", path: "/dashboard/finance", icon: "◈" },
  { name: "Assistant", path: "/dashboard/assistant", icon: "☰" },
  { name: "Development", path: "/dashboard/development", icon: "⟨/⟩" },
  { name: "Templates", path: "/dashboard/templates", icon: "⬡" },
];

// Mando de Control - Agent Ecosystem Navigation
const controlCenterItems = [
  { name: "Control Center", path: "/dashboard/control-center", icon: "⌘" },
  { name: "Task Queue", path: "/dashboard/control-center/tasks", icon: "☷" },
  { name: "Exec Logs", path: "/dashboard/control-center/logs", icon: "▤" },
  { name: "Agent Details", path: "/dashboard/control-center/agent-details", icon: "◉" },
  { name: "Orchestration", path: "/dashboard/control-center/orchestration", icon: "⚙" },
];

// Agentes Especializados - Individual Agent Dashboards
const agentDashboardItems = [
  { name: "Asistente", path: "/dashboard/agents/asistente", icon: "👤" },
  { name: "Nexus", path: "/dashboard/agents/nexus", icon: "🔧" },
  { name: "Sentinel", path: "/dashboard/agents/sentinel", icon: "🛡️" },
  { name: "Scout", path: "/dashboard/agents/scout", icon: "🔍" },
  { name: "Audiovisual", path: "/dashboard/agents/audiovisual", icon: "🎬" },
  { name: "Consultor", path: "/dashboard/agents/consultor", icon: "📚" },
  { name: "Gambito", path: "/dashboard/agents/gambito", icon: "🎯" },
  { name: "Cóndor360", path: "/dashboard/agents/condor360", icon: "📈" },
  { name: "Optimus", path: "/dashboard/agents/optimus", icon: "🎨" },
];

interface SystemMetrics {
  cpu: number;
  ram: string;
  activeAgents: number;
}

interface SidebarProps {
  metrics?: SystemMetrics;
}

export function Sidebar({ metrics }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const defaultMetrics: SystemMetrics = {
    cpu: 24,
    ram: "3.2GB",
    activeAgents: 5,
  };

  const currentMetrics = metrics || defaultMetrics;

  return (
    <aside
      className={`
        bg-zinc-950 border-r border-zinc-800 h-screen
        flex flex-col
        transition-all duration-300
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800">
        <h1
          className={`text-xl font-mono font-bold text-white neon-text-cyan ${collapsed ? "hidden" : "block"}`}
        >
          PASCUAL
        </h1>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-zinc-400 hover:text-white p-2 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            href={item.path}
            icon={item.icon}
            collapsed={collapsed}
          >
            {item.name}
          </NavLink>
        ))}

        {/* Mando de Control Section */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          {!collapsed && (
            <div className="px-3 py-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
              Mando de Control
            </div>
          )}
          {controlCenterItems.map((item) => (
            <NavLink
              key={item.path}
              href={item.path}
              icon={item.icon}
              collapsed={collapsed}
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Agentes Especializados Section */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          {!collapsed && (
            <div className="px-3 py-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
              Agentes
            </div>
          )}
          {agentDashboardItems.map((item) => (
            <NavLink
              key={item.path}
              href={item.path}
              icon={item.icon}
              collapsed={collapsed}
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* System Metrics Footer */}
      <div className="p-4 border-t border-zinc-800">
        {!collapsed ? (
          <div className="text-xs font-mono text-zinc-400 space-y-1">
            <div className="flex justify-between">
              <span>CPU:</span>
              <span
                className={
                  currentMetrics.cpu > 80
                    ? "text-[#ff006e]"
                    : "text-[#39ff14]"
                }
              >
                {currentMetrics.cpu}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>RAM:</span>
              <span className="text-[#00d9ff]">{currentMetrics.ram}</span>
            </div>
            <div className="flex justify-between">
              <span>AGENTS:</span>
              <span className="text-[#ff006e]">
                {currentMetrics.activeAgents} active
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${currentMetrics.cpu > 80 ? "bg-[#ff006e]" : "bg-[#39ff14]"} status-pulse`}
              title={`CPU: ${currentMetrics.cpu}%`}
            />
            <div
              className="w-2 h-2 rounded-full bg-[#00d9ff]"
              title={`RAM: ${currentMetrics.ram}`}
            />
            <div
              className="w-2 h-2 rounded-full bg-[#ff006e]"
              title={`${currentMetrics.activeAgents} agents active`}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
