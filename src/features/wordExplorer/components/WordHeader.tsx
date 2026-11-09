import React from "react";
import { Volume2, CheckCheck, Sparkles, ShieldCheck, HelpCircle } from "lucide-react";
import type { SanskritWord } from "../types/wordExplorer.types";
import { speechSafetyEngine } from "../../../utils/speech";

interface WordHeaderProps {
  word: SanskritWord;
  isLight?: boolean;
}

export const WordHeader: React.FC<WordHeaderProps> = ({ word, isLight = false }) => {
  const [copied, setCopied] = React.useState(false);

  const handlePronounce = () => {
    // Speak word with authentic voice pronunciation, zero chimes
    speechSafetyEngine.speak(word.surfaceForm, { lang: "sa", rate: 0.85 });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${word.surfaceForm} (${word.transliteration}) - ${word.generalMeaning}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={`space-y-3 pb-5 border-b ${isLight ? "border-[#E8DCC2]" : "border-amber-900/20 dark:border-stone-800"}`}>
      {/* Top badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {word.isVerified ? (
            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
              isLight
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}>
              <ShieldCheck className={`w-3 h-3 ${isLight ? "text-emerald-700" : "text-emerald-400"}`} />
              <span>Verified Linguistic Analysis</span>
            </span>
          ) : (
            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
              isLight
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}>
              <HelpCircle className={`w-3 h-3 ${isLight ? "text-amber-700" : "text-amber-400"}`} />
              <span>Lexicon Verification in Progress</span>
            </span>
          )}

          {word.sandhi?.isSandhi && (
            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
              isLight
                ? "bg-[#FFF7E6] text-[#874606] border border-[#DECB9F]"
                : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
            }`}>
              <Sparkles className="w-2.5 h-2.5" />
              <span>Sandhi Composite</span>
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
            isLight
              ? "bg-[#F5EEDB] hover:bg-[#E8DCC2] text-[#261B12] border border-[#DECB9F]"
              : "bg-stone-800/80 hover:bg-stone-700 text-stone-300"
          }`}
          title="Copy word details"
        >
          {copied ? "Copied!" : "Copy Word"}
        </button>
      </div>

      {/* Main Sanskrit Surface Form */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className={`font-sanskrit text-3xl sm:text-4xl font-bold tracking-wide ${
            isLight ? "text-[#261B12]" : "text-amber-100"
          }`}>
            {word.surfaceForm}
          </h1>
          <p className={`font-serif italic text-base sm:text-lg mt-1 ${
            isLight ? "text-[#874606]" : "text-amber-300/90"
          }`}>
            {word.transliteration}
          </p>
        </div>

        <button
          onClick={handlePronounce}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isLight
              ? "bg-[#FFF7E6] hover:bg-[#FBEFD3] border border-[#D8A856] text-[#783C00]"
              : "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300"
          }`}
          title="Listen to resonant pronunciation"
        >
          <Volume2 className={`w-4 h-4 ${isLight ? "text-[#D96500]" : "text-amber-400"}`} />
          <span>Chant Form</span>
        </button>
      </div>

      {/* Root quick tag if available */}
      {word.root && (
        <div className={`flex items-center space-x-2 text-xs rounded-xl px-3 py-1.5 w-fit ${
          isLight
            ? "bg-[#FBF8EE] border border-[#E8DCC2] text-[#261B12]"
            : "text-stone-300 bg-stone-900/60 border border-stone-800"
        }`}>
          <span className={`font-semibold font-sanskrit ${isLight ? "text-[#874606]" : "text-amber-400"}`}>धातु (Root):</span>
          <span className={`font-bold ${isLight ? "text-[#261B12]" : "text-amber-200"}`}>{word.root.form}</span>
          <span className={`italic ${isLight ? "text-[#6E5C4E]" : "text-stone-400"}`}>({word.root.transliteration})</span>
          <span className={isLight ? "text-[#DECB9F]" : "text-stone-500"}>•</span>
          <span className={isLight ? "text-[#3D3126]" : "text-stone-300"}>{word.root.meaning}</span>
        </div>
      )}
    </div>
  );
};
