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
      style={{
        boxShadow: isLight
          ? "0 4px 20px -2px rgba(80, 50, 20, 0.06), 0 0 0 1px rgba(222, 203, 159, 0.4)"
          : undefined,
      }}
      className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border transition-all duration-300 ${
        isLight
          ? "bg-[#FFFDF8] border-[#E8DCC2] text-[#261B12]"
          : "bg-gradient-to-br from-[#231C18] via-[#352B23] to-[#4D382A] border-amber-500/25 text-[#DAC5B0] shadow-xl"
      }`}
    >
      {/* Decorative Glow */}
      <div
        className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
          isLight ? "bg-amber-500/5" : "bg-amber-500/10"
        }`}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          {/* Eyebrow & Category Badges */}
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isLight
                  ? "bg-[#FBEFD3] text-[#874606] border-[#E8CF9A]"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLight ? "text-[#874606]" : "text-amber-400"}`} />
              <span>SutraSparsh Discovery</span>
            </span>
            <span
              className={`text-xs ${
                isLight ? "text-[#846D5B] font-medium" : "text-stone-400"
              }`}
            >
              • Look Closer Experience
            </span>
          </div>

          {/* Primary Heading with high-contrast emphasis */}
          <h3
            className={`font-serif-sacred text-2xl sm:text-3xl font-bold tracking-tight leading-tight ${
              isLight ? "text-[#261B12]" : "text-[#FBE29D]"
            }`}
          >
            Don't just read the translation.{" "}
            <span
              className={
                isLight
                  ? "text-[#B43E00] italic font-semibold"
                  : "text-[#F3C068] italic font-semibold"
              }
            >
              Explore the word.
            </span>
          </h3>

          {/* Body Copy - High Contrast Roasted Espresso in Light Mode */}
          <p
            className={`text-sm leading-relaxed font-sans ${
              isLight ? "text-[#423429]" : "text-[#DAC5B0]"
            }`}
          >
            A translation tells you what a sentence means. But sometimes, the words tell you much more. Tap individual Sanskrit words to unlock their roots, Sandhi synthesis, grammatical cases, and scriptural occurrences.
          </p>

          {/* Mini Interactive Preview Strip */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`font-sanskrit font-bold px-2.5 py-1 rounded-lg border ${
                isLight
                  ? "bg-[#F5EEDB] text-[#261B12] border-[#E8DCC2]"
                  : "text-amber-200 bg-stone-950/80 border-stone-800"
              }`}
            >
              कर्मण्येवाधिकारस्ते
            </span>
            <span
              className={`font-bold ${
                isLight ? "text-[#A64E04]" : "text-amber-400/80"
              }`}
            >
              →
            </span>
            <span
              className={`font-sanskrit px-2 py-0.5 rounded border ${
                isLight
                  ? "bg-[#FAF6EC] text-[#423429] border-[#E8DCC2]"
                  : "text-stone-300 bg-stone-950/50 border-stone-800"
              }`}
            >
              कर्मणि
            </span>
            <span className={isLight ? "text-[#846D5B]" : "text-stone-500"}>+</span>
            <span
              className={`font-sanskrit px-2 py-0.5 rounded border ${
                isLight
                  ? "bg-[#FAF6EC] text-[#423429] border-[#E8DCC2]"
                  : "text-stone-300 bg-stone-950/50 border-stone-800"
              }`}
            >
              एव
            </span>
            <span className={isLight ? "text-[#846D5B]" : "text-stone-500"}>+</span>
            <span
              className={`font-sanskrit px-2 py-0.5 rounded border ${
                isLight
                  ? "bg-[#FAF6EC] text-[#423429] border-[#E8DCC2]"
                  : "text-stone-300 bg-stone-950/50 border-stone-800"
              }`}
            >
              अधिकारः
            </span>
            <span className={isLight ? "text-[#846D5B]" : "text-stone-500"}>+</span>
            <span
              className={`font-sanskrit px-2 py-0.5 rounded border ${
                isLight
                  ? "bg-[#FAF6EC] text-[#423429] border-[#E8DCC2]"
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
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              isLight
                ? "bg-gradient-to-b from-[#E66020] to-[#D44E0E] text-white hover:brightness-105"
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
            className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              isLight
                ? "bg-[#FFF7E6] hover:bg-[#FDF3DF] border border-[#D8A856] text-[#783C00]"
                : "bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-stone-200"
            }`}
          >
            <Layers className={`w-4 h-4 ${isLight ? "text-[#874606]" : "text-amber-400"}`} />
            <span>Browse Word Explorer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
