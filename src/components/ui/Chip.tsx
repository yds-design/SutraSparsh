import React from "react";
import type { AppTheme } from "../../types";

export type ChipVariant = "filter" | "suggestion" | "topic" | "tag" | "default";
export type ChipSize = "sm" | "md" | "lg";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: React.ReactNode;
  theme?: AppTheme | string;
  dataTestId?: string;
}

/**
 * Chip Component — Unified Global Design System Primitive
 *
 * Implements subtle glow visual state for selected/active chips across all modules:
 * - Explore filters, search tags, modal selectors, and category pills
 * - Light Mode: Multi-layer ambient shadow with low spread and warm or primary tint
 * - Dark Mode: Increased luminescence diffused glow preventing deep background blending
 * - Fully WCAG 2.2 AA compliant with fill color and typography weight contrast
 * - Reduced motion & high-contrast accessibility support via CSS design tokens
 */
export const Chip: React.FC<ChipProps> = ({
  selected = false,
  variant = "filter",
  size = "md",
  icon,
  theme,
  children,
  className = "",
  dataTestId,
  onClick,
  disabled,
  ...rest
}) => {
  const currentTheme =
    theme ||
    (typeof window !== "undefined"
      ? (localStorage.getItem("sutrasparsh_theme") as any) || "sandstone"
      : "sandstone");

  const isLight = currentTheme === "light";
  const isGoldenHour = currentTheme === "golden-hour";
  const isFestival = currentTheme === "festival";
  const isAmethyst = currentTheme === "amethyst";

  // Size styling
  const sizeClasses = {
    sm: "px-2.5 py-1 text-[11px] gap-1",
    md: "px-3.5 py-1.5 text-xs gap-1.5",
    lg: "px-4 py-2 text-sm gap-2",
  }[size];

  const glowShadow = selected
    ? isLight
      ? "0 2px 8px 0 rgba(27, 23, 64, 0.25), 0 0 6px 1px rgba(217, 164, 65, 0.35)"
      : isGoldenHour
      ? "0 0 12px 2px rgba(201, 130, 43, 0.48), 0 2px 6px rgba(225, 90, 46, 0.25)"
      : isFestival
      ? "0 0 12px 2px rgba(255, 138, 0, 0.45), 0 2px 6px rgba(230, 96, 32, 0.25)"
      : isAmethyst
      ? "0 0 12px 2px rgba(147, 107, 250, 0.45), 0 2px 6px rgba(109, 40, 217, 0.25)"
      : "0 0 12px 1px rgba(245, 158, 11, 0.40)"
    : undefined;

  // Selected & Unselected variant styling
  let stateClasses = "";

  if (variant === "suggestion") {
    if (selected) {
      stateClasses = isLight
        ? "bg-[#d9a441] text-[#100e2b] border-[#d9a441] font-bold chip-suggestion-glow-selected"
        : "bg-amber-500/20 text-amber-200 border-amber-500/50 font-bold chip-glow-selected";
    } else {
      stateClasses = isLight
        ? "bg-[#efedf6] border-[#cfcbe0] text-[#55526b] hover:bg-white hover:text-[#1b1740] hover:border-[#d9a441]"
        : "bg-stone-950 border-stone-800/80 text-stone-300 hover:border-amber-500/40 hover:text-amber-300";
    }
  } else if (variant === "topic") {
    if (selected) {
      stateClasses = isLight
        ? "bg-[#1b1740] text-[#f4f2ff] border-[#1b1740] font-bold chip-glow-selected"
        : isFestival
        ? "bg-[#FF8A00]/25 text-[#FFF6E3] border-[#FF8A00]/60 font-bold chip-glow-selected"
        : isAmethyst
        ? "bg-[#52297A]/45 text-[#EDE0F8] border-[#8A4AC7]/60 font-bold chip-glow-selected"
        : "bg-amber-500/25 text-amber-200 border-amber-500/50 font-bold chip-glow-selected";
    } else {
      stateClasses = isLight
        ? "bg-[#fbf0d6] border border-[#f0cf8a] text-[#b8801f] hover:bg-[#f0cf8a]"
        : isFestival
        ? "bg-white/5 border border-[#FF8A00]/20 text-[#FFF6E3]/80 hover:bg-white/10"
        : isAmethyst
        ? "bg-white/5 border border-[#52297A]/30 text-[#EDE0F8]/80 hover:bg-white/10"
        : "bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20";
    }
  } else {
    // Default / "filter" variant
    if (selected) {
      stateClasses = isLight
        ? "bg-[#1b1740] text-[#f4f2ff] border-[#1b1740] font-semibold chip-glow-selected"
        : isFestival
        ? "bg-[#FF8A00]/25 text-[#FFF6E3] border-[#FF8A00]/60 font-semibold chip-glow-selected"
        : isAmethyst
        ? "bg-[#52297A]/40 text-[#EDE0F8] border-[#8A4AC7]/60 font-semibold chip-glow-selected"
        : "bg-amber-500/25 text-amber-200 border-amber-500/40 font-semibold chip-glow-selected";
    } else {
      stateClasses = isLight
        ? "bg-white text-[#1d1b2e] hover:border-[#d9a441] hover:bg-[#fbf0d6] border border-[#cfcbe0]"
        : isFestival
        ? "bg-white/5 text-stone-300 hover:text-white border border-white/10 hover:border-[#FF8A00]/40"
        : isAmethyst
        ? "bg-white/5 text-stone-300 hover:text-white border border-white/10 hover:border-[#8A4AC7]/40"
        : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800";
    }
  }

  return (
    <button
      type="button"
      role="button"
      aria-pressed={selected}
      data-testid={dataTestId}
      data-chip-selected={selected ? "true" : "false"}
      data-theme={currentTheme}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...(glowShadow ? { boxShadow: glowShadow } : {}),
        ...rest.style,
      }}
      className={`chip-interactive inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 select-none cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${stateClasses} ${className}`}
      {...rest}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
