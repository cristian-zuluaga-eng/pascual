"use client";

import { ReactNode, useState } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea, Select } from "@/components/ui/Input";
import { Sparkline } from "@/components/charts/LineChart";
import { Tooltip } from "@/components/ui/Tooltip";
import { useGrowl } from "@/components/growl";
import type { AgentStatus, QuickAction, SubAgentStatus } from "@/lib/api/mock/pascual-agents";
import type { Agent } from "@/components/dashboard/AgentCard";
import { getModelEfficiency } from "@/components/dashboard/AgentCard";
import { AVAILABLE_MODELS, agentCapabilities } from "@/lib/api/mock/agents";

// ============================================================================
// TIME RANGE TYPES
// ============================================================================

export type TimeRange = "24h" | "7d" | "1m" | "1y";

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "24H",
  "7d": "7D",
  "1m": "1M",
  "1y": "1Y",
};

// ============================================================================
// AGENT HEADER
// ============================================================================

interface HeaderKPI {
  label: string;
  value: string | number;
  /** Values for different time ranges */
  values?: Record<TimeRange, string | number>;
  status?: "good" | "warning" | "critical" | "neutral";
  /** Status for different time ranges */
  statuses?: Record<TimeRange, "good" | "warning" | "critical" | "neutral">;
}

interface UsageData {
  /** Data points for the sparkline */
  data: number[];
  /** Data for different time ranges */
  dataByRange?: Record<TimeRange, number[]>;
  /** Color of the sparkline */
  color?: string;
}

interface AgentHeaderProps {
  name: string;
  icon: string;
  lema: string;
  status: AgentStatus;
  kpis?: HeaderKPI[];
  usage?: UsageData;
  showTimeRange?: boolean;
  defaultTimeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  onRefresh?: () => void;
  onSettings?: () => void;
  onChat?: () => void;
}

export function AgentHeader({
  name,
  icon,
  lema,
  status,
  kpis,
  usage,
  showTimeRange = false,
  defaultTimeRange = "24h",
  onTimeRangeChange,
  onRefresh,
  onSettings,
  onChat
}: AgentHeaderProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    onTimeRangeChange?.(range);
  };

  const getStatusColor = (s: AgentStatus) => {
    switch (s) {
      case "active": return "bg-[#39ff14]";
      case "busy": return "bg-amber-400";
      case "idle": return "bg-zinc-500";
      case "offline": return "bg-zinc-600";
      case "error": return "bg-[#ff006e]";
    }
  };

  const getKPIColor = (s?: "good" | "warning" | "critical" | "neutral") => {
    switch (s) {
      case "good": return "text-[#39ff14]";
      case "warning": return "text-amber-400";
      case "critical": return "text-[#ff006e]";
      default: return "text-white";
    }
  };

  // Get KPI value based on time range
  const getKPIValue = (kpi: HeaderKPI) => {
    if (kpi.values && kpi.values[timeRange] !== undefined) {
      return kpi.values[timeRange];
    }
    return kpi.value;
  };

  // Get KPI status based on time range
  const getKPIStatus = (kpi: HeaderKPI) => {
    if (kpi.statuses && kpi.statuses[timeRange] !== undefined) {
      return kpi.statuses[timeRange];
    }
    return kpi.status;
  };

  // Get usage data based on time range
  const getUsageData = () => {
    if (usage?.dataByRange && usage.dataByRange[timeRange]) {
      return usage.dataByRange[timeRange];
    }
    return usage?.data || [];
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-bold text-white">{name}</h1>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} ${status === "active" ? "status-pulse" : ""}`} />
              <span className="font-mono text-[10px] text-zinc-400 capitalize">{status}</span>
            </div>
          </div>
          <p className="font-mono text-xs text-zinc-500 italic">"{lema}"</p>
        </div>
      </div>

      {/* Right section: Time Range Filter + Usage Chart + KPIs */}
      <div className="flex items-center gap-4 mr-4">
        {/* Time Range Filter */}
        {showTimeRange && (
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-sm p-1">
            {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`px-2 py-1 text-[10px] font-mono rounded-sm transition-colors ${
                  timeRange === range
                    ? "bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/30"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {TIME_RANGE_LABELS[range]}
              </button>
            ))}
          </div>
        )}

        {/* Usage Sparkline */}
        {usage && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-sm px-3 py-2 min-w-[120px]">
            <p className="font-mono text-[9px] text-zinc-500 uppercase mb-1">Uso</p>
            <Sparkline data={getUsageData()} color={usage.color || "#00d9ff"} height={24} />
          </div>
        )}

        {/* KPIs in boxes */}
        {kpis && kpis.length > 0 && (
          <div className="flex items-center gap-3">
            {kpis.map((kpi, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-center min-w-[80px]">
                <p className={`font-mono text-lg font-bold ${getKPIColor(getKPIStatus(kpi))}`}>
                  {getKPIValue(kpi)}
                </p>
                <p className="font-mono text-[9px] text-zinc-500 uppercase">{kpi.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Action buttons */}
      {(onRefresh || onSettings || onChat) && (
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
      )}
    </div>
  );
}

// ============================================================================
// SUB-AGENTS MODAL
// ============================================================================

interface SubAgentsModalProps {
  subAgents: SubAgentStatus[];
  agentName: string;
  onClose: () => void;
}

function SubAgentsModal({ subAgents, agentName, onClose }: SubAgentsModalProps) {
  const getStatusColor = (s: AgentStatus) => {
    switch (s) {
      case "active": return "bg-[#39ff14]";
      case "busy": return "bg-amber-400";
      case "idle": return "bg-zinc-500";
      case "offline": return "bg-zinc-600";
      case "error": return "bg-[#ff006e]";
    }
  };

  const getStatusTextColor = (s: AgentStatus) => {
    switch (s) {
      case "active": return "text-[#39ff14]";
      case "busy": return "text-amber-400";
      case "idle": return "text-zinc-500";
      case "offline": return "text-zinc-600";
      case "error": return "text-[#ff006e]";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-sm shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="font-mono text-lg font-bold text-white">Sub-Agentes de {agentName}</h2>
            <p className="font-mono text-xs text-zinc-500">{subAgents.length} sub-agentes configurados</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {subAgents.map((sub) => (
            <div
              key={sub.id}
              className="bg-zinc-900 border border-zinc-800 rounded-sm p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(sub.status)} ${sub.status === "active" ? "status-pulse" : ""}`} />
                  <div>
                    <h3 className="font-mono text-sm font-bold text-white">{sub.name}</h3>
                    <p className="font-mono text-xs text-zinc-500">{sub.description}</p>
                  </div>
                </div>
                <Badge
                  variant={sub.status === "active" ? "success" : sub.status === "busy" ? "warning" : "default"}
                  className="text-[10px]"
                >
                  {sub.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-zinc-800">
                <div>
                  <p className="font-mono text-[10px] text-zinc-600 uppercase">Modelo</p>
                  <p className="font-mono text-xs text-[#00d9ff]">{sub.model}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-zinc-600 uppercase">Tareas Activas</p>
                  <p className={`font-mono text-xs ${sub.activeTasks > 0 ? "text-amber-400" : "text-zinc-400"}`}>
                    {sub.activeTasks}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-zinc-600 uppercase">Última Actividad</p>
                  <p className="font-mono text-xs text-zinc-400">{sub.lastActivity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#39ff14]" />
                <span className="font-mono text-[10px] text-zinc-500">
                  {subAgents.filter(s => s.status === "active").length} activos
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-mono text-[10px] text-zinc-500">
                  {subAgents.filter(s => s.status === "busy").length} ocupados
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-sm font-mono text-xs text-zinc-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
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
      <CardBody className="text-center py-2 px-3">
        {icon && <span className="text-lg mb-0.5 block">{icon}</span>}
        <p className={`font-mono text-lg font-bold ${getStatusColor()}`}>{value}</p>
        <p className="font-mono text-[9px] text-zinc-500 uppercase mt-0.5">{title}</p>
        {trend && (
          <p className={`font-mono text-[9px] mt-0.5 ${trend.positive ? "text-[#39ff14]" : "text-[#ff006e]"}`}>
            {trend.positive ? "▲" : "▼"} {Math.abs(trend.value)}%
          </p>
        )}
        {subtitle && (
          <p className="font-mono text-[9px] text-zinc-600 mt-0.5 flex items-center justify-center gap-1">
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
// EXPANDABLE LIST ITEM
// ============================================================================

interface ExpandableItemDetail {
  label: string;
  value: string | number | ReactNode;
}

interface ExpandableListItemProps {
  /** Icon or status indicator on the left */
  icon?: ReactNode;
  /** Main title/label */
  title: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Timestamp or secondary info on the right */
  timestamp?: string;
  /** Additional details shown when expanded */
  details?: ExpandableItemDetail[];
  /** Custom expanded content (alternative to details array) */
  expandedContent?: ReactNode;
  /** Status for styling */
  status?: "completed" | "processing" | "pending" | "failed" | "neutral";
  /** Whether the item can be expanded */
  expandable?: boolean;
  /** Custom class name */
  className?: string;
}

export function ExpandableListItem({
  icon,
  title,
  subtitle,
  timestamp,
  details,
  expandedContent,
  status = "neutral",
  expandable = true,
  className = "",
}: ExpandableListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasExpandableContent = expandable && (details?.length || expandedContent);

  const getStatusColor = () => {
    switch (status) {
      case "completed": return "text-[#39ff14]";
      case "processing": return "text-[#00d9ff]";
      case "pending": return "text-amber-400";
      case "failed": return "text-[#ff006e]";
      default: return "text-zinc-400";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "completed": return "✓";
      case "processing": return "◐";
      case "pending": return "◔";
      case "failed": return "✕";
      default: return null;
    }
  };

  return (
    <div className={`bg-zinc-900 rounded-sm overflow-hidden ${className}`}>
      <div
        onClick={() => hasExpandableContent && setIsExpanded(!isExpanded)}
        className={`
          flex items-center gap-3 p-2
          ${hasExpandableContent ? "cursor-pointer hover:bg-zinc-800/50" : ""}
          transition-colors
        `}
      >
        {/* Icon/Status */}
        {icon ? (
          <span className={`font-mono text-sm ${getStatusColor()}`}>{icon}</span>
        ) : status !== "neutral" ? (
          <span className={`font-mono text-sm ${getStatusColor()}`}>{getStatusIcon()}</span>
        ) : null}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-white truncate">{title}</p>
          {subtitle && (
            <p className="font-mono text-[10px] text-zinc-500">{subtitle}</p>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="font-mono text-[10px] text-zinc-600">{timestamp}</span>
        )}

        {/* Expand indicator */}
        {hasExpandableContent && (
          <span className={`font-mono text-[10px] text-zinc-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
            ▼
          </span>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && hasExpandableContent && (
        <div className="px-3 pb-3 pt-1 border-t border-zinc-800 bg-zinc-900/50">
          {expandedContent ? (
            expandedContent
          ) : details ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
              {details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-[10px] text-zinc-600 min-w-[70px]">{detail.label}:</span>
                  <span className="font-mono text-[10px] text-zinc-300 break-all">{detail.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUB-AGENT STATUS GRID
// ============================================================================

interface SubAgentStatusGridProps {
  subAgents: SubAgentStatus[];
  title?: string;
  showTitle?: boolean;
  onSettings?: () => void;
  className?: string;
}

export function SubAgentStatusGrid({ subAgents, title = "Sub-Agentes", showTitle = false, onSettings, className = "" }: SubAgentStatusGridProps) {
  const getStatusColor = (s: AgentStatus) => {
    switch (s) {
      case "active": return "bg-[#39ff14]";
      case "busy": return "bg-amber-400";
      case "idle": return "bg-zinc-500";
      case "offline": return "bg-zinc-600";
      case "error": return "bg-[#ff006e]";
    }
  };

  const getStatusTextColor = (s: AgentStatus) => {
    switch (s) {
      case "active": return "text-[#39ff14]";
      case "busy": return "text-amber-400";
      case "idle": return "text-zinc-500";
      case "offline": return "text-zinc-600";
      case "error": return "text-[#ff006e]";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-[#39ff14]/20 text-[#39ff14] border-[#39ff14]/30";
    if (score >= 75) return "bg-[#00d9ff]/20 text-[#00d9ff] border-[#00d9ff]/30";
    if (score >= 60) return "bg-amber-400/20 text-amber-400 border-amber-400/30";
    return "bg-[#ff006e]/20 text-[#ff006e] border-[#ff006e]/30";
  };

  return (
    <div className={`bg-zinc-950 border border-zinc-800 rounded-sm p-3 ${className}`}>
      {/* Inline header - compact */}
      <div className="flex items-center mb-2">
        <div className="flex items-center gap-3">
          {showTitle ? (
            <span className="font-mono text-sm text-zinc-500 uppercase">{title}</span>
          ) : (
            <span className="font-mono text-xs text-zinc-600">{subAgents.length} sub-agentes</span>
          )}
          {onSettings && (
            <button
              onClick={onSettings}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-mono text-zinc-400 hover:text-[#00d9ff] bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-[#00d9ff]/30 rounded-sm transition-colors"
              title="Configuración del agente"
            >
              <span>⚙</span>
              <span>Config</span>
            </button>
          )}
        </div>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-5 gap-2">
        {subAgents.map((sub) => (
          <div
            key={sub.id}
            className="group relative p-2.5 bg-zinc-900 rounded-sm border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-sm shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-64 pointer-events-none">
              <p className="font-mono text-xs text-zinc-300 leading-relaxed">{sub.detailedDescription}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
            </div>

            {/* Row 1: Name - Model | Score Badge + Status */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white truncate">
                {sub.name} <span className="text-zinc-500">- {sub.model.split(" ")[1]}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${getScoreColor(sub.score)}`}>
                  {sub.score}%
                </span>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(sub.status)} ${sub.status === "active" ? "status-pulse" : ""}`} />
              </div>
            </div>
            {/* Row 2: Description | Last Activity */}
            <div className="flex items-center justify-between mt-1.5">
              <p className="font-mono text-[11px] text-zinc-500 truncate flex-1 mr-2">{sub.description}</p>
              <span className="font-mono text-[11px] text-zinc-600 flex-shrink-0">{sub.lastActivity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CANVAS - Lienzo de respuestas de Pascual
// ============================================================================

interface CanvasInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function CanvasInput({ onSend, placeholder = "Háblale a Pascual...", disabled = false }: CanvasInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`
        flex items-center gap-3
        bg-zinc-900 border rounded-sm px-3 py-2.5
        transition-all duration-300
        ${isFocused ? "border-[#00d9ff]/50 shadow-[0_0_15px_rgba(0,217,255,0.1)]" : "border-zinc-800"}
        ${disabled ? "opacity-50" : ""}
      `}
    >
      <span className="text-[#00d9ff]">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-robot-idle"
        >
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <circle cx="8" cy="16" r="1.5" fill="currentColor" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        </svg>
      </span>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent font-mono text-sm text-white placeholder:text-zinc-600 outline-none disabled:cursor-not-allowed"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-sm font-mono text-xs
          transition-all duration-200
          ${message.trim() && !disabled
            ? "text-[#00d9ff] hover:bg-[#00d9ff]/20 cursor-pointer"
            : "text-zinc-700 cursor-not-allowed"
          }
        `}
      >
        <span>Enviar</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </button>
    </div>
  );
}

interface QuickPrompt {
  label: string;
  prompt: string;
}

interface CanvasProps {
  /** Título opcional del canvas */
  title?: string;
  /** Contenido principal del canvas (respuestas de Pascual, visualizaciones, etc.) */
  children?: ReactNode;
  /** Callback cuando se envía un mensaje. Si no se proporciona, no se muestra el input */
  onSendMessage?: (message: string) => void;
  /** Placeholder del input */
  placeholder?: string;
  /** Deshabilitar el input */
  inputDisabled?: boolean;
  /** Mostrar el input de Pascual (default: true) */
  showInput?: boolean;
  /** Altura mínima del área de contenido */
  minHeight?: string;
  /** Preguntas preestablecidas */
  quickPrompts?: QuickPrompt[];
  /** Clases CSS adicionales */
  className?: string;
}

export function Canvas({
  title,
  children,
  onSendMessage,
  placeholder = "Háblale a Pascual...",
  inputDisabled = false,
  showInput = true,
  minHeight = "200px",
  quickPrompts,
  className = ""
}: CanvasProps) {
  const handleQuickPrompt = (prompt: string) => {
    if (onSendMessage) {
      onSendMessage(prompt);
    }
  };

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <span className="font-mono text-sm text-zinc-400 uppercase">{title}</span>
        </CardHeader>
      )}
      <CardBody className="p-4 flex flex-col justify-center">
        {/* Canvas content area - donde se renderizan las respuestas */}
        <div
          className="flex-1 overflow-y-auto flex flex-col justify-center"
          style={{ minHeight }}
        >
          {children ? (
            <div className="flex flex-col justify-center h-full">{children}</div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              {/* Robot Icon */}
              <span className="text-[#00d9ff]">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-robot-idle"
                >
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <circle cx="8" cy="16" r="1.5" fill="currentColor" />
                  <circle cx="16" cy="16" r="1.5" fill="currentColor" />
                </svg>
              </span>
              <p className="font-mono text-xs text-zinc-600">Escribe un mensaje para comenzar...</p>
              {/* Quick Prompts - inyectados desde el componente padre */}
              {quickPrompts && quickPrompts.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {quickPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(qp.prompt)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-[#00d9ff]/30 rounded-sm font-mono text-[10px] text-zinc-400 hover:text-[#00d9ff] transition-colors"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pascual Input - comportamiento default */}
        {showInput && onSendMessage && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <CanvasInput
              onSend={onSendMessage}
              placeholder={placeholder}
              disabled={inputDisabled}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ============================================================================
// FILTER TABS
// ============================================================================

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface FilterTabsProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  className = ""
}: FilterTabsProps<T>) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {onSearchChange !== undefined && (
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue || ""}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-2 py-0.5 w-32 font-mono text-[10px] bg-zinc-900 border border-zinc-700 rounded-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#00d9ff]/50"
        />
      )}
      <div className="flex items-center gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-2 py-0.5 font-mono text-[10px] rounded-sm border transition-colors ${
              value === option.value
                ? "bg-[#00d9ff]/20 border-[#00d9ff]/50 text-[#00d9ff]"
                : "bg-transparent border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
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
  maxHeight?: string;
}

export function SectionCard({ title, action, children, className = "", maxHeight = "300px" }: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <span className="font-mono text-sm text-zinc-400 uppercase">{title}</span>
        {action}
      </CardHeader>
      <CardBody>
        <div className="overflow-y-auto scrollbar-thin" style={{ maxHeight }}>
          {children}
        </div>
      </CardBody>
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

// ============================================================================
// AGENT CHAT INPUT - Input reutilizable para hablar con un agente
// ============================================================================

interface AgentChatInputProps {
  agentId: string;
  agentName: string;
  agentIcon: string;
  placeholder?: string;
  label?: string;
}

export function AgentChatInput({ agentId, agentName, agentIcon, placeholder, label }: AgentChatInputProps) {
  const [message, setMessage] = useState("");
  const { sendToAgent } = useGrowl();

  const handleSend = () => {
    if (message.trim()) {
      sendToAgent(agentId, agentName, agentIcon, message.trim());
      setMessage("");
    }
  };

  return (
    <div>
      {label && <p className="text-xs font-mono text-zinc-500 uppercase mb-2">{label}</p>}
      <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-sm px-3 py-2.5">
        <span className="text-[#00d9ff]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-robot-idle">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <circle cx="8" cy="16" r="1.5" fill="currentColor" />
            <circle cx="16" cy="16" r="1.5" fill="currentColor" />
          </svg>
        </span>
        <input
          type="text"
          placeholder={placeholder || `Háblale a ${agentName}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 bg-transparent font-mono text-sm text-white placeholder:text-zinc-600 outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-sm font-mono text-xs transition-all duration-200 ${
            message.trim()
              ? "text-[#00d9ff] hover:bg-[#00d9ff]/20 cursor-pointer"
              : "text-zinc-700 cursor-not-allowed"
          }`}
        >
          <span>Enviar</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// AGENT CONFIG MODAL - Modal reutilizable para configuración de agentes
// ============================================================================

interface AgentConfigModalProps {
  agent: Agent;
  onClose: () => void;
  onAgentModelChange?: (agentId: string, newModel: string) => void;
  onSubAgentModelChange?: (agentId: string, subAgentId: string, newModel: string) => void;
  availableModels?: string[];
}

export function AgentConfigModal({
  agent,
  onClose,
  onAgentModelChange,
  onSubAgentModelChange,
  availableModels = AVAILABLE_MODELS,
}: AgentConfigModalProps) {
  const handleModelChange = (newModel: string) => {
    onAgentModelChange?.(agent.id, newModel);
  };

  const handleSubAgentModelChange = (subAgentId: string, newModel: string) => {
    onSubAgentModelChange?.(agent.id, subAgentId, newModel);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-950 border border-zinc-800 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{agent.icon}</span>
            <h2 className="font-mono text-lg font-bold">{agent.name}</h2>
            <StatusBadge status={agent.status} />
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </CardHeader>

        <CardBody className="space-y-5">
          {/* Description */}
          <div>
            <p className="text-xs font-mono text-zinc-500 uppercase mb-1">Descripción</p>
            <p className="font-mono text-sm text-zinc-400">{agent.description}</p>
          </div>

          {/* Agent Info with Model Selector */}
          <div className="flex items-start justify-between">
            <div className="flex gap-8">
              <div>
                <p className="text-xs font-mono text-zinc-500 uppercase">Rol</p>
                <p className="font-mono text-white capitalize">{agent.role}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-zinc-500 uppercase">Tareas Activas</p>
                <p className="font-mono text-white">{agent.activeTasks}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-zinc-500 uppercase mb-1">Modelo</p>
              <div className="flex items-center gap-2">
                <Select
                  options={availableModels.map(m => ({ value: m, label: m }))}
                  value={agent.model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  compact
                  className="w-36"
                />
                <Tooltip content="Considera revisar la selección del modelo" position="top" inline>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm cursor-help bg-amber-950/50 text-amber-400 border border-amber-500/30">
                    !
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Sub-agents with model selection */}
          {agent.subAgents && agent.subAgents.length > 0 && (
            <div>
              <p className="text-xs font-mono text-zinc-500 uppercase mb-2">Sub-agentes</p>
              <div className="space-y-2">
                {agent.subAgents.map((subAgent) => (
                  <div
                    key={subAgent.id}
                    className="flex items-center justify-between p-2 bg-zinc-900 rounded-sm border border-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        subAgent.status === "active" ? "bg-[#39ff14]" :
                        subAgent.status === "busy" ? "bg-amber-400" :
                        subAgent.status === "error" ? "bg-[#ff006e]" : "bg-zinc-600"
                      }`} />
                      <div>
                        <p className="font-mono text-xs text-white">{subAgent.name}</p>
                        <p className="font-mono text-[10px] text-zinc-500">{subAgent.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Select
                        options={availableModels.map(m => ({ value: m, label: m }))}
                        value={subAgent.model}
                        onChange={(e) => handleSubAgentModelChange(subAgent.id, e.target.value)}
                        compact
                        className="w-36"
                      />
                      {(() => {
                        const efficiency = getModelEfficiency(subAgent.name, subAgent.model);
                        return (
                          <Tooltip content={efficiency.reason} position="top" inline>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm cursor-help ${
                              efficiency.isEfficient
                                ? "bg-green-950/50 text-[#39ff14] border border-green-500/30"
                                : "bg-amber-950/50 text-amber-400 border border-amber-500/30"
                            }`}>
                              {efficiency.isEfficient ? "✓" : "!"}
                            </span>
                          </Tooltip>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat con el agente */}
          <AgentChatInput
            agentId={agent.id}
            agentName={agent.name}
            agentIcon={agent.icon}
            label={`Hablar con ${agent.name}`}
          />

          {/* Capabilities */}
          <div>
            <p className="text-xs font-mono text-zinc-500 uppercase mb-2">Capacidades</p>
            <div className="flex flex-wrap gap-2">
              {(agentCapabilities[agent.id] || ["General"]).map((cap, index) => (
                <Badge key={cap} variant={index === 0 ? "success" : "info"}>{cap}</Badge>
              ))}
            </div>
          </div>
        </CardBody>

        <CardFooter className="justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          {agent.id !== "pascual" && (
            <Button variant="secondary">
              Deshabilitar Agente
            </Button>
          )}
          <Button variant="primary">
            Guardar Cambios
          </Button>
        </CardFooter>
      </div>
    </div>
  );
}

// ============================================================================
// USE AGENT CONFIG HOOK - Hook reutilizable para manejar estado de configuración
// ============================================================================

import { mockAgents } from "@/lib/api/mock/agents";

export function useAgentConfig(agentId: string) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [agentData, setAgentData] = useState<Agent>(() => {
    const agent = mockAgents.find(a => a.id === agentId);
    return agent || mockAgents[0];
  });

  const handleAgentModelChange = (_agentId: string, newModel: string) => {
    setAgentData(prev => ({ ...prev, model: newModel }));
  };

  const handleSubAgentModelChange = (_agentId: string, subAgentId: string, newModel: string) => {
    setAgentData(prev => ({
      ...prev,
      subAgents: prev.subAgents?.map(sub =>
        sub.id === subAgentId ? { ...sub, model: newModel } : sub
      )
    }));
  };

  return {
    showConfigModal,
    setShowConfigModal,
    agentData,
    handleAgentModelChange,
    handleSubAgentModelChange,
    openConfig: () => setShowConfigModal(true),
    closeConfig: () => setShowConfigModal(false),
  };
}

export default AgentDashboardLayout;
