import React from "react";
import { Volume2, CheckCheck, Sparkles, ShieldCheck, HelpCircle } from "lucide-react";
import type { SanskritWord } from "../types/wordExplorer.types";
import { soundEngine } from "../../../utils/audio";

interface WordHeaderProps {
  word: SanskritWord;
}

export const WordHeader: React.FC<WordHeaderProps> = ({ word }) => {
  const [copied, setCopied] = React.useState(false);

  const handlePronounce = () => {
    soundEngine.playTempleBell(293.66); // Harmonic D4
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${word.surfaceForm} (${word.transliteration}) - ${word.generalMeaning}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-3 pb-5 border-b border-amber-900/20 dark:border-stone-800">
      {/* Top badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {word.isVerified ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Verified Linguistic Analysis</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span>Lexicon Verification in Progress</span>
            </span>
          )}

          {word.sandhi?.isSandhi && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Sandhi Composite</span>
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-colors"
          title="Copy word details"
        >
          {copied ? "Copied!" : "Copy Word"}
        </button>
      </div>

      {/* Main Sanskrit Surface Form */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="font-sanskrit text-3xl sm:text-4xl text-amber-100 font-bold tracking-wide">
            {word.surfaceForm}
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-amber-300/90 mt-1">
            {word.transliteration}
          </p>
        </div>

        <button
          onClick={handlePronounce}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          title="Listen to resonant pronunciation"
        >
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>Chant Form</span>
        </button>
      </div>

      {/* Root quick tag if available */}
      {word.root && (
        <div className="flex items-center space-x-2 text-xs text-stone-300 bg-stone-900/60 border border-stone-800 rounded-xl px-3 py-1.5 w-fit">
          <span className="text-amber-400 font-semibold font-sanskrit">धातु (Root):</span>
          <span className="font-bold text-amber-200">{word.root.form}</span>
          <span className="italic text-stone-400">({word.root.transliteration})</span>
          <span className="text-stone-500">•</span>
          <span className="text-stone-300">{word.root.meaning}</span>
        </div>
      )}
    </div>
  );
};
