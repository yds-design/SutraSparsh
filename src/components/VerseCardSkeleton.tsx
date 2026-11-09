import React from "react";
import type { AppTheme } from "../types";

interface VerseCardSkeletonProps {
  theme?: AppTheme | string;
}

export const VerseCardSkeleton: React.FC<VerseCardSkeletonProps> = ({ theme = "light" }) => {
  const isLight = theme === "light";
  const isGoldenHour = theme === "golden-hour";

  const cardBg = isLight
    ? "bg-white border-[#cfcbe0] shadow-[0_1px_2px_rgb(27_23_64_/_0.06)] rounded-[20px]"
    : isGoldenHour
    ? "bg-[#281B12]/80 border-[#C9822B]/30 shadow-md rounded-3xl"
    : "bg-stone-900/70 border-stone-800/80 shadow-md rounded-3xl";

  const shimmerBadge = isLight
    ? "bg-[#fbf0d6] border-[#f0cf8a]"
    : isGoldenHour
    ? "bg-amber-500/20 border-amber-500/30"
    : "bg-amber-500/10 border-amber-500/20";

  const shimmerMuted = isLight
    ? "bg-[#efedf6]"
    : isGoldenHour
    ? "bg-[#3A281A]"
    : "bg-stone-800";

  const shimmerBox = isLight
    ? "bg-[#efedf6]/70 border-[#cfcbe0]"
    : isGoldenHour
    ? "bg-[#20140D] border-[#C9822B]/20"
    : "bg-stone-950/60 border-stone-800/60";

  const shimmerLine = isLight
    ? "bg-[#cfcbe0]"
    : isGoldenHour
    ? "bg-[#4D3624]"
    : "bg-stone-700/70";

  const shimmerLineSubtle = isLight
    ? "bg-[#e5e2f0]"
    : isGoldenHour
    ? "bg-[#3A281A]"
    : "bg-stone-800/60";

  return (
    <div
      role="status"
      aria-label="Loading sacred verse"
      className={`p-6 border flex flex-col justify-between space-y-4 animate-pulse transition-all ${cardBg}`}
    >
      <div className="space-y-4">
        {/* Top Header metadata */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Author Badge */}
            <div className={`h-5 w-24 rounded-full border ${shimmerBadge}`} />
            {/* Category Pill */}
            <div className={`h-5 w-16 rounded-full ${shimmerMuted}`} />
          </div>
          {/* Action icon placeholders */}
          <div className="flex items-center space-x-1.5">
            <div className={`w-7 h-7 rounded-lg ${shimmerMuted}`} />
            <div className={`w-7 h-7 rounded-lg ${shimmerMuted}`} />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className={`h-5 w-3/4 rounded-md ${shimmerLine}`} />
        </div>

        {/* Sacred Sanskrit Devanagari verse box */}
        <div className={`p-4 rounded-xl border space-y-2.5 ${shimmerBox}`}>
          <div className="flex items-center space-x-2">
            <div className={`w-3.5 h-3.5 rounded-full ${shimmerLine}`} />
            <div className={`h-4 w-full rounded ${shimmerLine}`} />
          </div>
          <div className={`h-4 w-5/6 rounded ml-5 ${shimmerLine}`} />
        </div>

        {/* Transliteration line */}
        <div className="space-y-1 pt-1">
          <div className={`h-3 w-4/5 rounded ${shimmerLineSubtle}`} />
        </div>

        {/* English Translation lines */}
        <div className="space-y-1.5 pt-1">
          <div className={`h-3 w-full rounded ${shimmerLineSubtle}`} />
          <div className={`h-3 w-2/3 rounded ${shimmerLineSubtle}`} />
        </div>
      </div>

      {/* Footer Tags & Explore Action Link */}
      <div className={`pt-4 border-t flex items-center justify-between ${
        isLight ? "border-[#cfcbe0] border-dashed" : "border-stone-800/80"
      }`}>
        <div className="flex items-center gap-1.5">
          <div className={`h-4 w-12 rounded-full ${shimmerMuted}`} />
          <div className={`h-4 w-14 rounded-full ${shimmerMuted}`} />
        </div>
        <div className={`h-4 w-20 rounded-md ${shimmerLine}`} />
      </div>
    </div>
  );
};

export const VerseCardSkeletonGrid: React.FC<{ count?: number; theme?: AppTheme | string }> = ({
  count = 6,
  theme = "light",
}) => {
  return (
    <div
      data-testid="verse-card-skeleton-grid"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <VerseCardSkeleton key={idx} theme={theme} />
      ))}
    </div>
  );
};
