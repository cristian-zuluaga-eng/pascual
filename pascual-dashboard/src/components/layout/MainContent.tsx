import { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export function MainContent({ children, className = "" }: MainContentProps) {
  return (
    <main
      className={`
        flex-1 overflow-hidden
        bg-zinc-950 bg-grid
        p-6
        flex flex-col
        ${className}
      `}
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {children}
      </div>
    </main>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-mono font-bold text-white">{title}</h1>
        {description && (
          <p className="text-sm font-mono text-zinc-400 mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
}

export function Section({ children, className = "" }: SectionProps) {
  return <section className={className || "mb-6"}>{children}</section>;
}

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider">
        {title}
      </h2>
      {action}
    </div>
  );
}

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function Grid({
  children,
  cols = 4,
  gap = "md",
  className = "",
}: GridProps) {
  const getColsClass = () => {
    switch (cols) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      case 5:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-5";
      case 6:
        return "grid-cols-1 md:grid-cols-3 lg:grid-cols-6";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    }
  };

  const getGapClass = () => {
    switch (gap) {
      case "sm":
        return "gap-2";
      case "md":
        return "gap-4";
      case "lg":
        return "gap-6";
      default:
        return "gap-4";
    }
  };

  return (
    <div className={`grid ${getColsClass()} ${getGapClass()} ${className}`}>
      {children}
    </div>
  );
}
