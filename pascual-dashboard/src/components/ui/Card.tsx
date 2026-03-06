import { ReactNode } from "react";
import { registerComponent } from "@/lib/registry";
import { cardPropsSchema, statCardPropsSchema } from "@/lib/registry/schemas";
import { colors } from "@/lib/theme";

type CardVariant = "default" | "success" | "danger" | "warning" | "info";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  glow?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    positive: boolean;
  };
  icon?: ReactNode;
  variant?: CardVariant;
}

const getVariantGlow = (variant: CardVariant) => {
  switch (variant) {
    case "success":
      return "card-glow-green";
    case "danger":
      return "card-glow-pink";
    case "info":
      return "card-glow";
    default:
      return "card-glow";
  }
};

export function Card({
  children,
  className = "",
  variant = "default",
  glow = true,
}: CardProps) {
  return (
    <div
      className={`bg-zinc-950 border border-zinc-800 rounded-sm ${glow ? getVariantGlow(variant) : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between border-b border-zinc-800 p-3 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-3 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between bg-zinc-900 p-2 px-3 text-xs font-mono ${className}`}
    >
      {children}
    </div>
  );
}

const getIconVariantStyle = (variant: CardVariant) => {
  switch (variant) {
    case "success":
      return `bg-emerald-950 text-[${colors.accent.green.value}] border border-emerald-800`;
    case "danger":
      return `bg-rose-950 text-[${colors.accent.pink.value}] border border-rose-800`;
    case "warning":
      return "bg-amber-950 text-amber-400 border border-amber-800";
    case "info":
      return `bg-cyan-950 text-[${colors.accent.cyan.value}] border border-cyan-800`;
    default:
      return "bg-zinc-800 text-zinc-400";
  }
};

export function StatCard({
  title,
  value,
  trend,
  icon,
  variant = "default",
}: StatCardProps) {
  return (
    <Card variant={variant}>
      <CardBody>
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="text-zinc-400 text-xs uppercase tracking-wider font-mono">
              {title}
            </h3>
            <p className="text-xl font-mono font-bold text-white mt-1">
              {value}
            </p>
            {trend && (
              <div
                className={`flex items-center mt-1 font-mono text-xs ${
                  trend.positive
                    ? `text-[${colors.accent.green.value}]`
                    : `text-[${colors.accent.pink.value}]`
                }`}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}%
              </div>
            )}
          </div>
          {icon && (
            <div className={`p-2 rounded-sm ${getIconVariantStyle(variant)}`}>
              {icon}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================
// COMPONENT REGISTRATION
// ============================================

// Register Card component
registerComponent(
  {
    id: "ui.card",
    name: "Card",
    description: "A container component with neo-punk styling and optional glow effects",
    category: "ui",
    tags: ["container", "card", "surface"],
    version: "1.0.0",
    propsSchema: cardPropsSchema,
    defaultProps: {
      variant: "default",
      glow: true,
    },
    acceptsChildren: true,
    dataBindable: false,
    examples: [
      {
        name: "Default Card",
        description: "Basic card with default styling",
        props: { variant: "default", glow: true },
      },
      {
        name: "Success Card",
        description: "Card with success variant",
        props: { variant: "success", glow: true },
      },
    ],
  },
  Card as unknown as React.ComponentType<Record<string, unknown>>
);

// Register StatCard component
registerComponent(
  {
    id: "ui.stat-card",
    name: "StatCard",
    description: "A card component for displaying statistics with optional trend indicators",
    category: "ui",
    tags: ["stat", "metric", "card", "dashboard"],
    version: "1.0.0",
    propsSchema: statCardPropsSchema,
    defaultProps: {
      variant: "default",
    },
    acceptsChildren: false,
    dataBindable: true,
    examples: [
      {
        name: "Basic Stat",
        description: "Simple stat card",
        props: { title: "Users", value: "1,234" },
      },
      {
        name: "Stat with Trend",
        description: "Stat card with positive trend",
        props: {
          title: "Revenue",
          value: "$12,345",
          trend: { value: 12, positive: true },
          variant: "success",
        },
      },
    ],
  },
  StatCard as unknown as React.ComponentType<Record<string, unknown>>
);
