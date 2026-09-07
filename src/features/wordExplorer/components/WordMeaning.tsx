import React from "react";
import { BookOpen, Compass, Sparkles, Feather } from "lucide-react";
import type { SanskritWord } from "../types/wordExplorer.types";

interface WordMeaningProps {
  word: SanskritWord;
}

export const WordMeaning: React.FC<WordMeaningProps> = ({ word }) => {
  return (
    <div className="space-y-4">
      {/* General Meaning */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <BookOpen className="w-3.5 h-3.5" />
          <span>General Lexical Meaning • शब्दार्थ</span>
        </div>
        <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 sm:p-5 text-stone-100 leading-relaxed text-sm sm:text-base font-medium">
          {word.generalMeaning}
        </div>
      </div>

      {/* Contextual Meaning in this Verse (FR-07) */}
      {word.contextMeaning && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Compass className="w-3.5 h-3.5" />
            <span>Meaning in This Verse • प्रकृत-भावार्थ</span>
          </div>
          <div className="bg-gradient-to-r from-amber-950/30 via-stone-900 to-stone-950 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-amber-100/95 leading-relaxed text-sm sm:text-base">
            <p className="italic">{word.contextMeaning}</p>
          </div>
        </div>
      )}

      {/* Philosophical commentary note */}
      {word.philosophicalNote && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-stone-400">
            <Feather className="w-3.5 h-3.5 text-amber-400" />
            <span>Philosophical Depth • दार्शनिक तात्पर्य</span>
          </div>
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-4 sm:p-5 text-stone-300 leading-relaxed text-xs sm:text-sm">
            {word.philosophicalNote}
          </div>
        </div>
      )}
    </div>
  );
};
