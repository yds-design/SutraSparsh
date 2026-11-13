import React from "react";
import { Compass, Home, Search, BookOpen, Volume2 } from "lucide-react";
import type { AppTheme } from "../types";

interface NotFoundPageProps {
  theme?: AppTheme;
  requestedPath: string;
  onNavigateHome: () => void;
  onNavigateTab: (tab: "today" | "explore" | "search" | "preferences") => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  theme = "light",
  requestedPath,
  onNavigateHome,
  onNavigateTab,
}) => {
  const isLight = theme === "light";

  return (
    <section
      aria-labelledby="not-found-heading"
      className="max-w-2xl mx-auto py-10 sm:py-16 px-4 text-center animate-fadeIn"
    >
      <div
        className={`rounded-3xl border p-8 sm:p-12 space-y-6 shadow-sm ${
          isLight
            ? "bg-white border-[#cfcbe0] text-[#1d1b2e]"
            : "bg-stone-900/80 border-amber-500/25 text-[#F4E9D2]"
        }`}
      >
        <div
          className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center font-serif-sacred text-2xl font-bold ${
            isLight
              ? "bg-[#fbf0d6] text-[#874606] border border-[#f0cf8a]"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/35"
          }`}
        >
          404
        </div>

        <div className="space-y-2">
          <p
            className={`text-xs font-extrabold uppercase tracking-widest ${
              isLight ? "text-[#874606]" : "text-amber-400"
            }`}
          >
            Path Not Found • मार्ग अनुपलब्ध
          </p>
          <h1
            id="not-found-heading"
            className={`font-serif-sacred text-2xl sm:text-3xl font-bold ${
              isLight ? "text-[#1b1740]" : "text-amber-100"
            }`}
          >
            This Sanctuary Page Could Not Be Found
          </h1>
          <p className={`text-xs sm:text-sm leading-relaxed max-w-md mx-auto ${isLight ? "text-[#55526b]" : "text-stone-300"}`}>
            The requested address (<code>{requestedPath}</code>) does not exist or may have moved. Return to the daily contemplation or explore our Sanskrit scripture library.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onNavigateHome}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isLight
                ? "bg-[#1b1740] hover:bg-[#100e2b] text-white"
                : "bg-amber-500 hover:bg-amber-400 text-stone-950"
            }`}
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Go to Daily Shloka</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("explore")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isLight
                ? "bg-[#fbf0d6] border-[#d9a441] text-[#5c3004] hover:bg-[#f3e1b6]"
                : "bg-stone-800 border-stone-700 text-amber-200 hover:bg-stone-700"
            }`}
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>Explore Scriptures</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("search")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isLight
                ? "bg-white border-[#cfcbe0] text-[#1b1740] hover:bg-[#efedf6]"
                : "bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700"
            }`}
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>Search Verses</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("preferences")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isLight
                ? "bg-white border-[#cfcbe0] text-[#1b1740] hover:bg-[#efedf6]"
                : "bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700"
            }`}
          >
            <Volume2 className="w-4 h-4" aria-hidden="true" />
            <span>TTS Recitation Studio</span>
          </button>
        </div>

        <div className={`pt-2 flex items-center justify-center gap-1.5 text-[11px] ${isLight ? "text-[#55526b]" : "text-stone-400"}`}>
          <Compass className="w-3.5 h-3.5" aria-hidden="true" />
          <span>SutraSparsh • Spiritual Wisdom &amp; Sacred Voice</span>
        </div>
      </div>
    </section>
  );
};
