"use client";

import { useState } from "react";
import { NavLink } from "../ui/NavLink";
import { useDashboardConfig, DashboardConfig } from "@/lib/context/DashboardConfigContext";

const navItems = [
  { name: "Home", path: "/dashboard", icon: "⊞", configKey: "home" as keyof DashboardConfig["views"] },
  { name: "Planificador", path: "/dashboard/tasks", icon: "☑", configKey: "planificador" as keyof DashboardConfig["views"] },
  { name: "Agents", path: "/dashboard/agents", icon: "◎", configKey: "agents" as keyof DashboardConfig["views"] },
  { name: "Administración", path: "/dashboard/administracion", icon: "⚙", configKey: null }, // Siempre visible
];


// Agentes Especializados - Individual Agent Dashboards
const agentDashboardItems = [
  { name: "Sentinel", path: "/dashboard/agents/sentinel", icon: "🛡️", configKey: "sentinel" as keyof DashboardConfig["agentViews"] },
  { name: "Nexus", path: "/dashboard/agents/nexus", icon: "💻", configKey: "nexus" as keyof DashboardConfig["agentViews"] },
  { name: "Cóndor360", path: "/dashboard/agents/condor360", icon: "📈", configKey: "condor360" as keyof DashboardConfig["agentViews"] },
  { name: "Gambito", path: "/dashboard/agents/gambito", icon: "🎯", configKey: "gambito" as keyof DashboardConfig["agentViews"] },
  { name: "Scout", path: "/dashboard/agents/scout", icon: "🔍", configKey: "scout" as keyof DashboardConfig["agentViews"] },
  { name: "Audiovisual", path: "/dashboard/agents/audiovisual", icon: "🎬", configKey: "audiovisual" as keyof DashboardConfig["agentViews"] },
  { name: "Consultor", path: "/dashboard/agents/consultor", icon: "📚", configKey: "consultor" as keyof DashboardConfig["agentViews"] },
  { name: "Asistente", path: "/dashboard/agents/asistente", icon: "👤", configKey: "asistente" as keyof DashboardConfig["agentViews"] },
  { name: "Picasso", path: "/dashboard/agents/picasso", icon: "🎨", configKey: "picasso" as keyof DashboardConfig["agentViews"] },
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
  const { config } = useDashboardConfig();

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
        {/* Main Navigation Items */}
        {navItems
          .filter((item) => item.configKey === null || config.views[item.configKey])
          .map((item) => {
            // Renderizamos los items de navegación principal
            const isAgentsItem = item.name === "Agents";

            return (
              <div key={item.path}>
                <NavLink
                  href={item.path}
                  icon={item.icon}
                  collapsed={collapsed}
                >
                  {item.name}
                </NavLink>

                {/* Si es Agents, insertamos la sección de agentes especializados justo después */}
                {isAgentsItem && (
                  <div className="ml-4">
                    {!collapsed && (
                      <div className="px-3 py-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                        Agentes
                      </div>
                    )}
                    {agentDashboardItems
                      .filter((agentItem) => config.agentViews[agentItem.configKey])
                      .map((agentItem) => (
                        <NavLink
                          key={agentItem.path}
                          href={agentItem.path}
                          icon={agentItem.icon}
                          collapsed={collapsed}
                        >
                          {agentItem.name}
                        </NavLink>
                      ))}
                  </div>
                )}
              </div>
            );
          })}

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
