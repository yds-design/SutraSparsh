import React from "react";
import { Sparkles, Layers, ArrowRight, BookOpen, Compass } from "lucide-react";
import { soundEngine } from "../../../utils/audio";

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
      className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border transition-all duration-300 shadow-xl ${
        isLight
          ? "bg-gradient-to-br from-amber-50/80 via-white to-stone-100/90 border-amber-200 text-stone-900"
          : "bg-gradient-to-br from-amber-950/40 via-stone-900/90 to-stone-950 border-amber-500/30 text-stone-100"
      }`}
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>SutraSparsh Discovery</span>
            </span>
            <span className="text-xs text-stone-400">• Look Closer Experience</span>
          </div>

          <h3 className="font-serif-sacred text-2xl sm:text-3xl font-bold tracking-tight text-amber-100">
            Don't just read the translation.{" "}
            <span className="text-amber-400 italic">Explore the word.</span>
          </h3>

          <p className="text-sm text-stone-300 leading-relaxed font-sans">
            A translation tells you what a sentence means. But sometimes, the words tell you much more. Tap individual Sanskrit words to unlock their roots, Sandhi synthesis, grammatical cases, and scriptural occurrences.
          </p>

          {/* Mini Interactive Preview Strip */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-sanskrit font-bold text-amber-200 bg-stone-950/60 px-2.5 py-1 rounded-lg border border-stone-800">
              कर्मण्येवाधिकारस्ते
            </span>
            <span className="text-amber-400/80 font-bold">→</span>
            <span className="font-sanskrit text-stone-300 bg-stone-950/40 px-2 py-0.5 rounded border border-stone-800">
              कर्मणि
            </span>
            <span className="text-stone-500">+</span>
            <span className="font-sanskrit text-stone-300 bg-stone-950/40 px-2 py-0.5 rounded border border-stone-800">
              एव
            </span>
            <span className="text-stone-500">+</span>
            <span className="font-sanskrit text-stone-300 bg-stone-950/40 px-2 py-0.5 rounded border border-stone-800">
              अधिकारः
            </span>
            <span className="text-stone-500">+</span>
            <span className="font-sanskrit text-stone-300 bg-stone-950/40 px-2 py-0.5 rounded border border-stone-800">
              ते
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              soundEngine.playTempleBell(261.63);
              onOpenLookCloser();
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch "Look Closer"</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTempleBell(329.63);
              onOpenExplorer();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-stone-200 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Browse Word Explorer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
