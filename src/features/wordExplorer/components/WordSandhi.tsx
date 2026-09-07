import React from "react";
import { Sparkles, ArrowRight, BookOpen, Layers } from "lucide-react";
import type { WordSandhi as IWordSandhi } from "../types/wordExplorer.types";

interface WordSandhiProps {
  sandhi?: IWordSandhi;
  surfaceForm: string;
}

export const WordSandhi: React.FC<WordSandhiProps> = ({ sandhi, surfaceForm }) => {
  if (!sandhi || !sandhi.isSandhi) {
    return (
      <div className="text-center py-6 text-stone-400 text-xs italic bg-stone-950/40 rounded-2xl border border-stone-850 p-4">
        This term is a base non-composite word (अखण्ड पद); no inter-word Sandhi combination is present.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sandhi Synthesis • सन्धि-नियम</span>
        </div>
        {sandhi.type && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            {sandhi.type}
          </span>
        )}
      </div>

      {/* Sandhi Formula Overview */}
      <div className="bg-stone-950/80 border border-amber-900/30 rounded-2xl p-4 sm:p-5 space-y-3">
        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold block">
          Constituent Junction (सन्धि-सूत्र)
        </span>
        <p className="font-sanskrit text-lg sm:text-xl font-bold text-amber-200 leading-relaxed">
          {sandhi.formula || sandhi.components?.join(" + ")}
        </p>

        {sandhi.sutraRef && (
          <div className="pt-2 border-t border-stone-800/80 flex items-center space-x-2 text-xs text-stone-400">
            <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Paninian Authority: <strong className="text-amber-300">{sandhi.sutraRef}</strong></span>
          </div>
        )}
      </div>

      {/* Step by step transformations if available */}
      {sandhi.steps && sandhi.steps.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
            Step-by-Step Morpho-Phonemic Rules
          </span>
          <div className="space-y-2.5">
            {sandhi.steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Step {idx + 1}</span>
                  {step.paniniSutra && (
                    <span className="font-sanskrit text-stone-400 text-[11px]">
                      {step.paniniSutra}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-sm sm:text-base font-sanskrit font-bold">
                  <span className="text-stone-300">{step.from}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-amber-200">{step.into}</span>
                </div>

                <p className="text-xs text-stone-400">{step.ruleName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
