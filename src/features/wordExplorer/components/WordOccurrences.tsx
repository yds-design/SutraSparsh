import React from "react";
import { BookMarked, ExternalLink, Sparkles } from "lucide-react";
import type { WordOccurrence } from "../types/wordExplorer.types";

interface WordOccurrencesProps {
  occurrences?: WordOccurrence[];
  wordSurface: string;
}

export const WordOccurrences: React.FC<WordOccurrencesProps> = ({
  occurrences,
  wordSurface,
}) => {
  if (!occurrences || occurrences.length === 0) {
    return (
      <div className="text-center py-6 text-stone-400 text-xs italic bg-stone-950/40 rounded-2xl border border-stone-850 p-4">
        Corpus cross-references across the Upanishads and Patanjali Yoga Sutras are being catalogued.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
        <BookMarked className="w-3.5 h-3.5" />
        <span>Sacred Corpus Occurrences ({occurrences.length})</span>
      </div>

      <div className="space-y-3">
        {occurrences.map((occ) => (
          <div
            key={occ.id}
            className="bg-stone-950/70 border border-stone-800/90 rounded-2xl p-4 sm:p-5 space-y-2.5 transition-colors hover:border-amber-500/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">
                {occ.scripture} • {occ.chapterVerse}
              </span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
                Canonical Verse
              </span>
            </div>

            <p className="font-sanskrit text-base sm:text-lg text-amber-100/90 font-medium whitespace-pre-line leading-relaxed">
              {occ.verseSnippet}
            </p>

            <p className="text-xs sm:text-sm text-stone-300 italic pt-1 border-t border-stone-850">
              "{occ.translationSnippet}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
