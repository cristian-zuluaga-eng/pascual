"use client";

import { ReactNode, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import type { AgentStatus, QuickAction, SubAgentStatus } from "@/lib/api/mock/pascual-agents";

// ============================================================================
// AGENT HEADER
// ============================================================================

interface AgentHeaderProps {
  name: string;
  icon: string;
  lema: string;
  status: AgentStatus;
  onRefresh?: () => void;
  onSettings?: () => void;
  onChat?: () => void;
}

export function AgentHeader({ name, icon, lema, status, onRefresh, onSettings, onChat }: AgentHeaderProps) {
  const getStatusColor = (s: AgentStatus) => {
    switch (s) {
      case "active": return "bg-[#39ff14]";
      case "busy": return "bg-amber-400";
      case "idle": return "bg-zinc-500";
      case "offline": return "bg-zinc-600";
      case "error": return "bg-[#ff006e]";
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <span className="text-4xl">{icon}</span>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-white">{name}</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} ${status === "active" ? "status-pulse" : ""}`} />
              <span className="font-mono text-xs text-zinc-400 capitalize">{status}</span>
            </div>
          </div>
          <p className="font-mono text-sm text-zinc-500 italic">"{lema}"</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh} title="Refresh">
            ⟳
          </Button>
        )}
        {onSettings && (
          <Button variant="ghost" size="sm" onClick={onSettings} title="Settings">
            ⚙
          </Button>
        )}
        {onChat && (
          <Button variant="ghost" size="sm" onClick={onChat} title="Chat with Pascual">
            💬
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PASCUAL FEEDBACK BAR
// ============================================================================

interface PascualFeedbackBarProps {
  agentId: string;
  agentName: string;
  agentIcon: string;
  quickActions: QuickAction[];
  placeholder?: string;
  onSendMessage?: (message: string) => void;
}

export function PascualFeedbackBar({ agentId, agentName, agentIcon, quickActions, placeholder, onSendMessage }: PascualFeedbackBarProps) {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Import growl hook dynamically to avoid circular deps
  const [sendToAgent, setSendToAgent] = useState<((agentId: string, agentName: string, agentIcon: string, message: string) => void) | null>(null);

  useState(() => {
    import("@/components/growl").then(({ useGrowl }) => {
      // This is a workaround - we'll use the hook properly in each page
    });
  });

  const handleSend = () => {
    if (message.trim()) {
      // Trigger growl via custom event (will be handled by GrowlContainer)
      window.dispatchEvent(new CustomEvent("pascual:sendToAgent", {
        detail: { agentId, agentName, agentIcon, message: message.trim() }
      }));

      if (onSendMessage) {
        onSendMessage(message);
      }
      setMessage("");
      setIsExpanded(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    // Trigger growl via custom event
    window.dispatchEvent(new CustomEvent("pascual:sendToAgent", {
      detail: { agentId, agentName, agentIcon, message: action.prompt }
    }));

    if (onSendMessage) {
      onSendMessage(action.prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="mb-6">
      <CardBody className="py-3 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#00d9ff]">💬</span>
          <span className="font-mono text-zinc-400">Pascual:</span>
          <span className="font-mono text-zinc-300">"¿Qué necesitas de {agentName}?"</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-sm font-mono text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 border-dashed rounded-sm font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {isExpanded ? "Cerrar" : "Escribir mensaje..."}
          </button>
        </div>

        {isExpanded && (
          <div className="flex gap-2 pt-2">
            <Textarea
              placeholder={placeholder || `Escribe tu solicitud para ${agentName}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-h-[60px]"
            />
            <Button variant="primary" onClick={handleSend} disabled={!message.trim()}>
              Enviar
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ============================================================================
// SUB-AGENTS STATUS BAR
// ============================================================================

interface SubAgentsStatusBarProps {
  subAgents: SubAgentStatus[];
  lastSync: string;
  onSubAgentClick?: (subAgentId: string) => void;
}

export function SubAgentsStatusBar({ subAgents, lastSync, onSubAgentClick }: SubAgentsStatusBarProps) {
  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case "active": return "bg-[#39ff14]";
      case "busy": return "bg-amber-400";
      case "idle": return "bg-zinc-500";
      case "offline": return "bg-zinc-600";
      case "error": return "bg-[#ff006e]";
    }
  };

  return (
    <Card className="mt-6">
      <CardBody className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            {subAgents.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onSubAgentClick?.(sub.id)}
                className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 hover:bg-zinc-800 rounded-sm transition-colors"
                title={`${sub.name}: ${sub.description}\nModel: ${sub.model}\nTasks: ${sub.activeTasks}`}
              >
                <div className={`w-2 h-2 rounded-full ${getStatusColor(sub.status)} ${sub.status === "active" ? "status-pulse" : ""}`} />
                <span className="font-mono text-xs text-zinc-400">{sub.name}</span>
                {sub.activeTasks > 0 && (
                  <Badge variant="info" className="text-[9px] px-1 py-0">{sub.activeTasks}</Badge>
                )}
              </button>
            ))}
          </div>
          <span className="font-mono text-[10px] text-zinc-600">Sync: {lastSync}</span>
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// KPI CARD
// ============================================================================

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; positive: boolean };
  status?: "good" | "warning" | "critical" | "neutral";
  icon?: string;
}

export function KPICard({ title, value, subtitle, trend, status = "neutral", icon }: KPICardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "good": return "text-[#39ff14]";
      case "warning": return "text-amber-400";
      case "critical": return "text-[#ff006e]";
      default: return "text-white";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "good": return "✓";
      case "warning": return "⚠";
      case "critical": return "✕";
      default: return null;
    }
  };

  return (
    <Card>
      <CardBody className="text-center py-4">
        {icon && <span className="text-2xl mb-1 block">{icon}</span>}
        <p className={`font-mono text-2xl font-bold ${getStatusColor()}`}>{value}</p>
        <p className="font-mono text-[10px] text-zinc-500 uppercase mt-1">{title}</p>
        {trend && (
          <p className={`font-mono text-[10px] mt-1 ${trend.positive ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
            {trend.positive ? "▲" : "▼"} {Math.abs(trend.value)}%
          </p>
        )}
        {subtitle && (
          <p className="font-mono text-[10px] text-zinc-600 mt-0.5 flex items-center justify-center gap-1">
            {getStatusIcon() && <span>{getStatusIcon()}</span>}
            {subtitle}
          </p>
        )}
      </CardBody>
    </Card>
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  showValue?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({ label, value, max = 100, color = "#00d9ff", showValue = true, size = "md" }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const height = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs text-zinc-500 w-20 truncate">{label}</span>
      <div className={`flex-1 ${height} bg-zinc-800 rounded-full overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      {showValue && (
        <span className="font-mono text-xs text-zinc-400 w-12 text-right">{value}%</span>
      )}
    </div>
  );
}

// ============================================================================
// ACTIVITY LIST ITEM
// ============================================================================

interface ActivityItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  timestamp: string;
  status?: "completed" | "pending" | "in_progress" | "failed";
}

export function ActivityItem({ icon, title, subtitle, timestamp, status }: ActivityItemProps) {
  const getStatusStyle = () => {
    switch (status) {
      case "completed": return "text-[#39ff14]";
      case "pending": return "text-zinc-500";
      case "in_progress": return "text-[#00d9ff]";
      case "failed": return "text-[#ff006e]";
      default: return "text-zinc-400";
    }
  };

  return (
    <div className="flex items-start gap-3 py-2 border-b border-zinc-800 last:border-0">
      <span className="text-sm flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-mono text-xs ${getStatusStyle()} truncate`}>{title}</p>
        {subtitle && <p className="font-mono text-[10px] text-zinc-600 truncate">{subtitle}</p>}
      </div>
      <span className="font-mono text-[10px] text-zinc-600 flex-shrink-0">{timestamp}</span>
    </div>
  );
}

// ============================================================================
// SECTION CARD
// ============================================================================

interface SectionCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, action, children, className = "" }: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <span className="font-mono text-sm text-zinc-400 uppercase">{title}</span>
        {action}
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

// ============================================================================
// AGENT DASHBOARD LAYOUT
// ============================================================================

interface AgentDashboardLayoutProps {
  header: ReactNode;
  feedbackBar: ReactNode;
  kpis: ReactNode;
  mainContent: ReactNode;
  subAgentsBar: ReactNode;
}

export function AgentDashboardLayout({ header, feedbackBar, kpis, mainContent, subAgentsBar }: AgentDashboardLayoutProps) {
  return (
    <div className="space-y-6">
      {header}
      {feedbackBar}
      {kpis}
      {mainContent}
      {subAgentsBar}
    </div>
  );
}

export default AgentDashboardLayout;
