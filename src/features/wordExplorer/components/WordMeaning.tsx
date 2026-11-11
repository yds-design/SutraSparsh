import React from "react";
import { BookOpen, Compass, Sparkles, Feather } from "lucide-react";
import type { SanskritWord } from "../types/wordExplorer.types";

interface WordMeaningProps {
  word: SanskritWord;
  isLight?: boolean;
}

export const WordMeaning: React.FC<WordMeaningProps> = ({ word, isLight = false }) => {
  return (
    <div className="space-y-2.5">
      {/* General Meaning */}
      <div className="space-y-1">
        <div className={`flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider ${
          isLight ? "text-[#874606]" : "text-amber-400"
        }`}>
          <BookOpen className="w-3.5 h-3.5" />
          <span>General Lexical Meaning • शब्दार्थ</span>
        </div>
        <div className={`rounded-xl p-2.5 sm:p-3 leading-relaxed text-xs sm:text-sm font-medium ${
          isLight
            ? "bg-[#FFFDF8] border border-[#E8DCC2] text-[#261B12] shadow-sm"
            : "bg-stone-950/70 border border-stone-800 text-stone-100"
        }`}>
          {word.generalMeaning}
        </div>
      </div>

      {/* Contextual Meaning in this Verse (FR-07) */}
      {word.contextMeaning && (
        <div className="space-y-1">
          <div className={`flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider ${
            isLight ? "text-[#874606]" : "text-amber-300"
          }`}>
            <Compass className="w-3.5 h-3.5" />
            <span>Meaning in This Verse • प्रकृत-भावार्थ</span>
          </div>
          <div className={`rounded-xl p-2.5 sm:p-3 leading-relaxed text-xs sm:text-sm ${
            isLight
              ? "bg-[#FFF7E6] border border-[#D8A856] text-[#261B12] shadow-sm"
              : "bg-gradient-to-r from-amber-950/30 via-stone-900 to-stone-950 border border-amber-500/30 text-amber-100/95"
          }`}>
            <p className="italic">{word.contextMeaning}</p>
          </div>
        </div>
      )}

      {/* Philosophical commentary note */}
      {word.philosophicalNote && (
        <div className="space-y-1">
          <div className={`flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider ${
            isLight ? "text-[#6E5C4E]" : "text-stone-400"
          }`}>
            <Feather className={`w-3.5 h-3.5 ${isLight ? "text-[#D96500]" : "text-amber-400"}`} />
            <span>Philosophical Depth • दार्शनिक तात्पर्य</span>
          </div>
          <div className={`rounded-xl p-2 sm:p-2.5 leading-relaxed text-[11px] sm:text-xs ${
            isLight
              ? "bg-[#FBF8EE] border border-[#E8DCC2] text-[#3D3126] shadow-sm"
              : "bg-stone-900/60 border border-stone-800 text-stone-300"
          }`}>
            {word.philosophicalNote}
          </div>
        </div>
      )}
    </div>
  );
};
