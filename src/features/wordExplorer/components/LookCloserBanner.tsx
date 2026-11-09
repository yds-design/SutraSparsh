import React from "react";
import { Sparkles, Layers, BookOpen, Compass } from "lucide-react";

interface LookCloserBannerProps {
  onOpenLookCloser: () => void;
  onOpenExplorer: () => void;
  theme?: string;
}

export const LookCloserBanner: React.FC<LookCloserBannerProps> = ({
  onOpenLookCloser,
  onOpenExplorer,
  theme = "sandstone",
}) => {
  const isLight = theme === "light";

  return (
    <div
      id="look-closer-feature-card"
      className={`relative overflow-hidden rounded-[20px] p-6 sm:p-8 border transition-all duration-300 ${
        isLight
          ? "bg-white border-[#cfcbe0] text-[#1d1b2e] shadow-[0_1px_2px_rgb(27_23_64_/_0.06)]"
          : "bg-gradient-to-br from-[#231C18] via-[#352B23] to-[#4D382A] border-amber-500/25 text-[#DAC5B0] shadow-xl"
      }`}
    >
      {/* Decorative Glow */}
      <div
        className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
          isLight ? "bg-[#d9a441]/5" : "bg-amber-500/10"
        }`}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          {/* Eyebrow & Category Badges */}
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isLight
                  ? "bg-[#fbf0d6] text-[#b8801f] border-[#f0cf8a]/60"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLight ? "text-[#b8801f]" : "text-amber-400"}`} />
              <span>SutraSparsh Discovery</span>
            </span>
            <span
              className={`text-xs ${
                isLight ? "text-[#55526b] font-medium" : "text-stone-400"
              }`}
            >
              • Look Closer Experience
            </span>
          </div>

          {/* Primary Heading with high-contrast emphasis */}
          <h3
            className={`font-serif-sacred text-2xl sm:text-3xl font-bold tracking-tight leading-tight ${
              isLight ? "text-[#1b1740]" : "text-[#FBE29D]"
            }`}
          >
            Don't just read the translation.{" "}
            <span
              className={
                isLight
                  ? "text-[#b8801f] italic font-semibold"
                  : "text-[#F3C068] italic font-semibold"
              }
            >
              Explore the word.
            </span>
          </h3>

          {/* Body Copy */}
          <p
            className={`text-sm leading-relaxed font-sans ${
              isLight ? "text-[#1d1b2e]" : "text-[#DAC5B0]"
            }`}
          >
            A translation tells you what a sentence means. But sometimes, the words tell you much more. Tap individual Sanskrit words to unlock their roots, Sandhi synthesis, grammatical cases, and scriptural occurrences.
          </p>

          {/* Mini Interactive Preview Strip */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`font-sanskrit font-bold px-3 py-1 rounded-full border ${
                isLight
                  ? "bg-[#efedf6] text-[#1b1740] border-[#cfcbe0]"
                  : "text-amber-200 bg-stone-950/80 border-stone-800"
              }`}
            >
              कर्मण्येवाधिकारस्ते
            </span>
            <span
              className={`font-bold ${
                isLight ? "text-[#b8801f]" : "text-amber-400/80"
              }`}
            >
              →
            </span>
            <span
              className={`font-sanskrit px-2.5 py-0.5 rounded-full border ${
                isLight
                  ? "bg-[#f7f6fb] text-[#1d1b2e] border-[#cfcbe0]"
                  : "text-stone-300 bg-stone-950/50 border-stone-800"
              }`}
            >
              कर्मणि
            </span>
            <span className={isLight ? "text-[#55526b]" : "text-stone-500"}>+</span>
            <span
              className={`font-sanskrit px-2.5 py-0.5 rounded-full border ${
                isLight
                  ? "bg-[#f7f6fb] text-[#1d1b2e] border-[#cfcbe0]"
                  : "text-stone-300 bg-stone-950/50 border-stone-800"
              }`}
            >
              एव
            </span>
            <span className={isLight ? "text-[#55526b]" : "text-stone-500"}>+</span>
            <span
              className={`font-sanskrit px-2.5 py-0.5 rounded-full border ${
                isLight
                  ? "bg-[#f7f6fb] text-[#1d1b2e] border-[#cfcbe0]"
                  : "text-stone-300 bg-stone-950/50 border-stone-800"
              }`}
            >
              अधिकारः
            </span>
            <span className={isLight ? "text-[#55526b]" : "text-stone-500"}>+</span>
            <span
              className={`font-sanskrit px-2.5 py-0.5 rounded-full border ${
                isLight
                  ? "bg-[#f7f6fb] text-[#1d1b2e] border-[#cfcbe0]"
                  : "text-stone-300 bg-stone-950/50 border-stone-800"
              }`}
            >
              ते
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              onOpenLookCloser();
            }}
            className={`w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              isLight
                ? "bg-[#1b1740] hover:bg-[#100e2b] text-[#f4f2ff]"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-xl"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch "Look Closer"</span>
          </button>

          <button
            onClick={() => {
              onOpenExplorer();
            }}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              isLight
                ? "bg-white hover:bg-[#fbf0d6] border border-[#cfcbe0] hover:border-[#d9a441] text-[#1b1740]"
                : "bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-stone-200"
            }`}
          >
            <Layers className={`w-4 h-4 ${isLight ? "text-[#b8801f]" : "text-amber-400"}`} />
            <span>Browse Word Explorer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
