/**
 * Design Tokens System
 *
 * Centralized source of truth for all design values.
 * Can be modified programmatically by bots to customize themes.
 */

export interface ColorToken {
  value: string;
  description: string;
  category: "background" | "text" | "accent" | "border" | "status";
}

export interface SpacingToken {
  value: string;
  pixels: number;
  description: string;
}

export interface TypographyToken {
  fontFamily: string;
  fontSize: string;
  fontWeight: string | number;
  lineHeight: string;
  letterSpacing?: string;
}

export interface ShadowToken {
  value: string;
  description: string;
}

export interface AnimationToken {
  value: string;
  duration: string;
  easing: string;
  description: string;
}

// ============================================
// COLOR TOKENS
// ============================================

export const colors = {
  // Backgrounds
  bg: {
    primary: { value: "#0a0a0a", description: "Main background", category: "background" },
    secondary: { value: "#171717", description: "Surface/card background", category: "background" },
    tertiary: { value: "#262626", description: "Elevated surface", category: "background" },
    hover: { value: "#3f3f46", description: "Hover state background", category: "background" },
  },

  // Text
  text: {
    primary: { value: "#ededed", description: "Primary text color", category: "text" },
    secondary: { value: "#a1a1aa", description: "Secondary text", category: "text" },
    muted: { value: "#6b7280", description: "Muted/disabled text", category: "text" },
    inverse: { value: "#0a0a0a", description: "Text on light backgrounds", category: "text" },
  },

  // Accents (Neo-punk palette)
  accent: {
    cyan: { value: "#00d9ff", description: "Primary accent - info, links", category: "accent" },
    pink: { value: "#ff006e", description: "Secondary accent - danger, alerts", category: "accent" },
    green: { value: "#39ff14", description: "Success accent", category: "accent" },
    yellow: { value: "#ffaa00", description: "Warning accent", category: "accent" },
  },

  // Borders
  border: {
    default: { value: "#262626", description: "Default border", category: "border" },
    subtle: { value: "#1a1a1a", description: "Subtle border", category: "border" },
    focus: { value: "#00d9ff", description: "Focus ring", category: "border" },
  },

  // Status colors
  status: {
    success: { value: "#39ff14", description: "Success state", category: "status" },
    warning: { value: "#ffaa00", description: "Warning state", category: "status" },
    error: { value: "#ff006e", description: "Error state", category: "status" },
    info: { value: "#00d9ff", description: "Info state", category: "status" },
    offline: { value: "#6b7280", description: "Offline/disabled state", category: "status" },
  },

  // Semantic backgrounds for status
  statusBg: {
    success: { value: "rgba(57, 255, 20, 0.1)", description: "Success background", category: "status" },
    warning: { value: "rgba(255, 170, 0, 0.1)", description: "Warning background", category: "status" },
    error: { value: "rgba(255, 0, 110, 0.1)", description: "Error background", category: "status" },
    info: { value: "rgba(0, 217, 255, 0.1)", description: "Info background", category: "status" },
  },
} as const;

// ============================================
// SPACING TOKENS
// ============================================

export const spacing = {
  px: { value: "1px", pixels: 1, description: "1 pixel" },
  0: { value: "0", pixels: 0, description: "No spacing" },
  0.5: { value: "0.125rem", pixels: 2, description: "Extra small" },
  1: { value: "0.25rem", pixels: 4, description: "Small" },
  1.5: { value: "0.375rem", pixels: 6, description: "Small-medium" },
  2: { value: "0.5rem", pixels: 8, description: "Medium-small" },
  2.5: { value: "0.625rem", pixels: 10, description: "Medium" },
  3: { value: "0.75rem", pixels: 12, description: "Medium" },
  4: { value: "1rem", pixels: 16, description: "Base" },
  5: { value: "1.25rem", pixels: 20, description: "Large-small" },
  6: { value: "1.5rem", pixels: 24, description: "Large" },
  8: { value: "2rem", pixels: 32, description: "Extra large" },
  10: { value: "2.5rem", pixels: 40, description: "2x large" },
  12: { value: "3rem", pixels: 48, description: "3x large" },
  16: { value: "4rem", pixels: 64, description: "4x large" },
} as const;

// ============================================
// TYPOGRAPHY TOKENS
// ============================================

export const typography = {
  // Font families
  families: {
    mono: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    sans: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  },

  // Font sizes
  sizes: {
    xs: { value: "0.75rem", pixels: 12 },
    sm: { value: "0.875rem", pixels: 14 },
    base: { value: "1rem", pixels: 16 },
    lg: { value: "1.125rem", pixels: 18 },
    xl: { value: "1.25rem", pixels: 20 },
    "2xl": { value: "1.5rem", pixels: 24 },
    "3xl": { value: "1.875rem", pixels: 30 },
    "4xl": { value: "2.25rem", pixels: 36 },
  },

  // Font weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeights: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },

  // Presets
  presets: {
    heading1: {
      fontFamily: "var(--font-geist-mono)",
      fontSize: "1.5rem",
      fontWeight: 700,
      lineHeight: "1.25",
      letterSpacing: "-0.02em",
    },
    heading2: {
      fontFamily: "var(--font-geist-mono)",
      fontSize: "1.25rem",
      fontWeight: 700,
      lineHeight: "1.25",
    },
    heading3: {
      fontFamily: "var(--font-geist-mono)",
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: "1.25",
    },
    body: {
      fontFamily: "var(--font-geist-mono)",
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: "1.5",
    },
    caption: {
      fontFamily: "var(--font-geist-mono)",
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: "1.5",
    },
    label: {
      fontFamily: "var(--font-geist-mono)",
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: "1",
      letterSpacing: "0.05em",
    },
  } as Record<string, TypographyToken>,
} as const;

// ============================================
// SHADOW TOKENS
// ============================================

export const shadows = {
  none: { value: "none", description: "No shadow" },
  sm: { value: "0 1px 2px 0 rgba(0, 0, 0, 0.5)", description: "Small shadow" },
  md: { value: "0 4px 6px -1px rgba(0, 0, 0, 0.5)", description: "Medium shadow" },
  lg: { value: "0 10px 15px -3px rgba(0, 0, 0, 0.5)", description: "Large shadow" },

  // Neon glow effects
  neo: { value: "0 0 15px rgba(0, 217, 255, 0.5)", description: "Cyan neon glow" },
  neoPink: { value: "0 0 15px rgba(255, 0, 110, 0.5)", description: "Pink neon glow" },
  neoGreen: { value: "0 0 15px rgba(57, 255, 20, 0.5)", description: "Green neon glow" },
  neoYellow: { value: "0 0 15px rgba(255, 170, 0, 0.5)", description: "Yellow neon glow" },

  // Hover glows (softer)
  hoverCyan: { value: "0 0 20px rgba(0, 217, 255, 0.2)", description: "Cyan hover glow" },
  hoverPink: { value: "0 0 20px rgba(255, 0, 110, 0.2)", description: "Pink hover glow" },
  hoverGreen: { value: "0 0 20px rgba(57, 255, 20, 0.2)", description: "Green hover glow" },
} as const;

// ============================================
// ANIMATION TOKENS
// ============================================

export const animations = {
  // Durations
  durations: {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    slower: "500ms",
  },

  // Easings
  easings: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Presets
  presets: {
    fadeIn: {
      value: "fadeIn 200ms ease-out",
      duration: "200ms",
      easing: "ease-out",
      description: "Fade in animation",
    },
    pulse: {
      value: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      duration: "2s",
      easing: "cubic-bezier(0.4, 0, 0.6, 1)",
      description: "Pulsing animation",
    },
    glow: {
      value: "glow 1.5s ease-in-out infinite alternate",
      duration: "1.5s",
      easing: "ease-in-out",
      description: "Neon glow animation",
    },
    glitch: {
      value: "glitch 2s linear infinite alternate",
      duration: "2s",
      easing: "linear",
      description: "Glitch effect animation",
    },
  } as Record<string, AnimationToken>,
} as const;

// ============================================
// BORDER RADIUS TOKENS
// ============================================

export const radii = {
  none: "0",
  sm: "0.125rem",
  default: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  full: "9999px",
} as const;

// ============================================
// Z-INDEX TOKENS
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const;

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ============================================
// COMPLETE THEME OBJECT
// ============================================

export const theme = {
  colors,
  spacing,
  typography,
  shadows,
  animations,
  radii,
  zIndex,
  breakpoints,
} as const;

export type Theme = typeof theme;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a color value by path (e.g., "accent.cyan")
 */
export function getColor(path: string): string {
  const parts = path.split(".");
  let current: unknown = colors;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return path; // Return original if not found
    }
  }

  if (current && typeof current === "object" && "value" in current) {
    return (current as ColorToken).value;
  }

  return path;
}

/**
 * Get a spacing value by key
 */
export function getSpacing(key: keyof typeof spacing): string {
  return spacing[key]?.value ?? "0";
}

/**
 * Get a shadow value by key
 */
export function getShadow(key: keyof typeof shadows): string {
  return shadows[key]?.value ?? "none";
}

/**
 * Export all tokens as CSS custom properties
 */
export function getTokensAsCSS(): string {
  const lines: string[] = [":root {"];

  // Colors
  Object.entries(colors).forEach(([category, categoryColors]) => {
    Object.entries(categoryColors).forEach(([name, token]) => {
      lines.push(`  --color-${category}-${name}: ${token.value};`);
    });
  });

  // Spacing
  Object.entries(spacing).forEach(([key, token]) => {
    lines.push(`  --spacing-${key}: ${token.value};`);
  });

  // Shadows
  Object.entries(shadows).forEach(([key, token]) => {
    lines.push(`  --shadow-${key}: ${token.value};`);
  });

  lines.push("}");
  return lines.join("\n");
}

export default theme;
