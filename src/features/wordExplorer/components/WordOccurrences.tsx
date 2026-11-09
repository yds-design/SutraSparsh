import React from "react";
import { BookMarked, ExternalLink, Sparkles } from "lucide-react";
import type { WordOccurrence } from "../types/wordExplorer.types";

interface WordOccurrencesProps {
  occurrences?: WordOccurrence[];
  wordSurface: string;
  isLight?: boolean;
}

export const WordOccurrences: React.FC<WordOccurrencesProps> = ({
  occurrences,
  wordSurface,
  isLight = false,
}) => {
  if (!occurrences || occurrences.length === 0) {
    return (
      <div className={`text-center py-6 text-xs italic rounded-2xl p-4 border ${
        isLight
          ? "bg-[#FBF8EE] border-[#E8DCC2] text-[#6E5C4E]"
          : "bg-stone-950/40 border-stone-850 text-stone-400"
      }`}>
        Corpus cross-references across the Upanishads and Patanjali Yoga Sutras are being catalogued.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider ${
        isLight ? "text-[#874606]" : "text-amber-400"
      }`}>
        <BookMarked className="w-3.5 h-3.5" />
        <span>Sacred Corpus Occurrences ({occurrences.length})</span>
      </div>

      <div className="space-y-3">
        {occurrences.map((occ) => (
          <div
            key={occ.id}
            className={`rounded-2xl p-4 sm:p-5 space-y-2.5 transition-colors shadow-sm ${
              isLight
                ? "bg-[#FFFDF8] border border-[#E8DCC2] hover:border-[#D8A856] text-[#261B12]"
                : "bg-stone-950/70 border border-stone-800/90 hover:border-amber-500/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isLight ? "text-[#874606]" : "text-amber-300"}`}>
                {occ.scripture} • {occ.chapterVerse}
              </span>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isLight
                  ? "bg-[#F5EEDB] text-[#6E5C4E] border-[#DECB9F]"
                  : "bg-stone-800 text-stone-400 border border-stone-700"
              }`}>
                Canonical Verse
              </span>
            </div>

            <p className={`font-sanskrit text-base sm:text-lg font-medium whitespace-pre-line leading-relaxed ${
              isLight ? "text-[#261B12]" : "text-amber-100/90"
            }`}>
              {occ.verseSnippet}
            </p>

            <p className={`text-xs sm:text-sm italic pt-1 border-t ${
              isLight ? "border-[#E8DCC2] text-[#55526b]" : "border-stone-850 text-stone-300"
            }`}>
              "{occ.translationSnippet}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
