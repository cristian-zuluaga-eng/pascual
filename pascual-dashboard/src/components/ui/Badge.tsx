import { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  pulse?: boolean;
  className?: string;
}

const getVariantClasses = (variant: BadgeVariant) => {
  switch (variant) {
    case "success":
      return "bg-emerald-950/50 text-[#39ff14] border-emerald-800 shadow-[0_0_8px_rgba(57,255,20,0.3)]";
    case "warning":
      return "bg-amber-950/50 text-amber-400 border-amber-800";
    case "danger":
      return "bg-rose-950/50 text-[#ff006e] border-rose-800";
    case "info":
      return "bg-cyan-950/50 text-[#00d9ff] border-cyan-800 shadow-[0_0_8px_rgba(0,217,255,0.3)]";
    default:
      return "bg-zinc-900 text-zinc-500 border-zinc-800";
  }
};

export function Badge({
  children,
  variant = "default",
  pulse = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        text-xs font-mono px-2 py-0.5 rounded-sm border
        ${getVariantClasses(variant)}
        ${pulse ? "status-pulse" : ""}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

type StatusType = "active" | "busy" | "offline" | "error";

interface StatusBadgeProps {
  status: StatusType;
  showDot?: boolean;
  size?: "sm" | "md";
}

const getStatusConfig = (status: StatusType) => {
  switch (status) {
    case "active":
      return {
        label: "ONLINE",
        variant: "success" as BadgeVariant,
        dotColor: "bg-[#39ff14]",
      };
    case "busy":
      return {
        label: "BUSY",
        variant: "warning" as BadgeVariant,
        dotColor: "bg-amber-400",
      };
    case "offline":
      return {
        label: "OFFLINE",
        variant: "default" as BadgeVariant,
        dotColor: "bg-zinc-500",
      };
    case "error":
      return {
        label: "ERROR",
        variant: "danger" as BadgeVariant,
        dotColor: "bg-[#ff006e]",
      };
    default:
      return {
        label: "UNKNOWN",
        variant: "default" as BadgeVariant,
        dotColor: "bg-zinc-500",
      };
  }
};

export function StatusBadge({ status, showDot = true, size = "md" }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const isSmall = size === "sm";

  return (
    <Badge
      variant={config.variant}
      pulse={status === "active" || status === "busy" || status === "error"}
      className={isSmall ? "text-[9px] px-1.5 py-0" : ""}
    >
      {showDot && (
        <span
          className={`rounded-full ${config.dotColor} ${isSmall ? "w-1 h-1 mr-1" : "w-1.5 h-1.5 mr-1.5"}`}
        />
      )}
      {config.label}
    </Badge>
  );
}
