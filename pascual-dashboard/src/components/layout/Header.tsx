"use client";

import { useState } from "react";
import { Badge, StatusBadge } from "../ui/Badge";
import { IconButton } from "../ui/Button";

interface HeaderProps {
  title?: string;
  systemStatus?: "active" | "busy" | "offline" | "error";
}

export function Header({ title = "Dashboard", systemStatus = "active" }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-800 px-6 pr-24 flex items-center justify-between">
      {/* Left: Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-mono font-bold text-white">{title}</h2>
        <StatusBadge status={systemStatus} />
      </div>

      {/* Right: System Status & Actions */}
      <div className="flex items-center gap-4">
        {/* System Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-[#39ff14] status-pulse" />
          <span className="font-mono text-xs text-zinc-400">
            Uptime: <span className="text-[#39ff14]">99.8%</span>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-xs text-zinc-400">
            Last sync: <span className="text-[#00d9ff]">2s ago</span>
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <IconButton
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative"
          >
            <span>⚑</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff006e] rounded-full" />
          </IconButton>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-950 border border-zinc-800 rounded-sm shadow-neo z-50">
              <div className="p-3 border-b border-zinc-800">
                <h3 className="text-sm font-mono font-bold">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <NotificationItem
                  title="Agent Nexus activated"
                  time="2m ago"
                  type="info"
                />
                <NotificationItem
                  title="Security scan complete"
                  time="15m ago"
                  type="success"
                />
                <NotificationItem
                  title="High CPU usage detected"
                  time="1h ago"
                  type="warning"
                />
              </div>
              <div className="p-2 border-t border-zinc-800">
                <button className="w-full text-xs font-mono text-[#00d9ff] hover:text-white transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

interface NotificationItemProps {
  title: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
}

function NotificationItem({ title, time, type }: NotificationItemProps) {
  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-l-[#39ff14]";
      case "warning":
        return "border-l-amber-400";
      case "error":
        return "border-l-[#ff006e]";
      default:
        return "border-l-[#00d9ff]";
    }
  };

  return (
    <div
      className={`p-3 border-l-2 ${getBorderColor()} hover:bg-zinc-900 transition-colors cursor-pointer`}
    >
      <p className="text-sm font-mono text-zinc-200">{title}</p>
      <p className="text-xs font-mono text-zinc-500 mt-1">{time}</p>
    </div>
  );
}
