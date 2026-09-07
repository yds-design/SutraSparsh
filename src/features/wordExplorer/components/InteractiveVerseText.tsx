import React from "react";
import { WordExplorerService } from "../services/wordExplorer.service";
import type { VerseToken } from "../types/wordExplorer.types";

interface InteractiveVerseTextProps {
  verseText: string;
  onSelectWord: (surface: string, token?: VerseToken) => void;
  selectedSurface?: string;
  className?: string;
}

export const InteractiveVerseText: React.FC<InteractiveVerseTextProps> = ({
  verseText,
  onSelectWord,
  selectedSurface,
  className = "",
}) => {
  const tokens = React.useMemo(() => {
    return WordExplorerService.tokenizeVerse(verseText);
  }, [verseText]);

  const cleanSelected = React.useMemo(() => {
    if (!selectedSurface) return "";
    return selectedSurface.replace(/[।॥,\.!\?;:\"\'\-–—\s]/g, "").toLowerCase();
  }, [selectedSurface]);

  return (
    <p
      className={`font-sanskrit text-xl sm:text-2xl text-amber-200 leading-loose whitespace-pre-line select-text ${className}`}
    >
      {tokens.map((token) => {
        if (!token.isWord) {
          return <span key={token.id}>{token.raw}</span>;
        }

        const cleanToken = token.cleaned.replace(/[।॥,\.!\?;:\"\'\-–—\s]/g, "").toLowerCase();
        const isSelected = Boolean(cleanSelected && cleanToken === cleanSelected);

        return (
          <button
            key={token.id}
            type="button"
            role="button"
            aria-pressed={isSelected}
            aria-label={`Sanskrit word: ${token.cleaned}${token.hasAnalysis ? " (Verified Paninian Analysis Available)" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectWord(token.cleaned, token);
            }}
            className={`group inline-block font-sanskrit relative mx-1 my-0.5 px-2 py-0.5 rounded-xl cursor-pointer transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              isSelected
                ? "bg-gradient-to-r from-amber-500/35 to-amber-600/30 text-amber-50 ring-2 ring-amber-400 font-bold shadow-lg shadow-amber-500/25 scale-[1.05] z-10"
                : token.hasAnalysis
                ? "hover:bg-amber-500/20 hover:text-amber-100 hover:ring-1 hover:ring-amber-400/50 hover:scale-[1.02] text-amber-200"
                : "hover:bg-stone-800/80 hover:text-stone-100 hover:ring-1 hover:ring-stone-600 text-amber-200/90"
            }`}
            title={`Explore Sanskrit word "${token.cleaned}" in Word Explorer`}
          >
            {token.raw}
            {isSelected && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-300 ml-1.5 animate-pulse align-middle" />
            )}
            {/* Subtle indicator for words with indexed deep linguistic analysis */}
            {token.hasAnalysis && !isSelected && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400/60 opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all" />
            )}
          </button>
        );
      })}
    </p>
  );
};
