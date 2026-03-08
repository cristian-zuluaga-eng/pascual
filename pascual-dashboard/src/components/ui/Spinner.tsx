interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "cyan" | "green" | "pink" | "white" | "zinc";
  message?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-3",
};

const colorClasses = {
  cyan: "border-[#00d9ff]",
  green: "border-[#39ff14]",
  pink: "border-[#ff006e]",
  white: "border-white",
  zinc: "border-zinc-400",
};

export function Spinner({
  size = "md",
  color = "cyan",
  message,
  className = "",
}: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color]}
          border-t-transparent
          rounded-full
          animate-spin
        `}
      />
      {message && (
        <span className="font-mono text-xs text-zinc-500">{message}</span>
      )}
    </div>
  );
}

interface GridLoaderProps {
  message?: string;
  minHeight?: string;
}

export function GridLoader({
  message = "Cargando...",
  minHeight = "120px",
}: GridLoaderProps) {
  return (
    <div
      className="flex items-center justify-center w-full"
      style={{ minHeight }}
    >
      <Spinner size="md" color="cyan" message={message} />
    </div>
  );
}
