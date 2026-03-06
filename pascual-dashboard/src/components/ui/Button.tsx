import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

const getVariantClasses = (variant: ButtonVariant) => {
  switch (variant) {
    case "primary":
      return "btn-neo";
    case "secondary":
      return "btn-neo btn-neo-pink";
    case "danger":
      return "bg-rose-950 text-[#ff006e] border border-rose-800 hover:bg-rose-900";
    case "ghost":
      return "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800";
    default:
      return "btn-neo";
  }
};

const getSizeClasses = (size: ButtonSize) => {
  switch (size) {
    case "sm":
      return "px-2 py-1 text-xs";
    case "md":
      return "px-4 py-2 text-sm";
    case "lg":
      return "px-6 py-3 text-base";
    default:
      return "px-4 py-2 text-sm";
  }
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        font-mono rounded-sm transition-all duration-200
        focus-neo
        ${getVariantClasses(variant)}
        ${getSizeClasses(size)}
        ${fullWidth ? "w-full" : ""}
        ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⟳</span>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function IconButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`
        p-2 rounded-sm font-mono
        text-zinc-400 hover:text-white
        bg-transparent hover:bg-zinc-800
        transition-all duration-200
        focus-neo
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
