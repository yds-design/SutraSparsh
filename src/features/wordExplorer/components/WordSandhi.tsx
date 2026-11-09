import React from "react";
import { Sparkles, ArrowRight, BookOpen, Layers } from "lucide-react";
import type { WordSandhi as IWordSandhi } from "../types/wordExplorer.types";

interface WordSandhiProps {
  sandhi?: IWordSandhi;
  surfaceForm: string;
  isLight?: boolean;
}

export const WordSandhi: React.FC<WordSandhiProps> = ({ sandhi, surfaceForm, isLight = false }) => {
  if (!sandhi || !sandhi.isSandhi) {
    return (
      <div className={`text-center py-6 text-xs italic rounded-2xl p-4 border ${
        isLight
          ? "bg-[#FBF8EE] border-[#E8DCC2] text-[#6E5C4E]"
          : "bg-stone-950/40 border-stone-850 text-stone-400"
      }`}>
        This term is a base non-composite word (अखण्ड पद); no inter-word Sandhi combination is present.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider ${
          isLight ? "text-[#874606]" : "text-amber-400"
        }`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sandhi Synthesis • सन्धि-नियम</span>
        </div>
        {sandhi.type && (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            isLight
              ? "bg-[#FFF7E6] text-[#874606] border-[#DECB9F]"
              : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
          }`}>
            {sandhi.type}
          </span>
        )}
      </div>

      {/* Sandhi Formula Overview */}
      <div className={`rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm ${
        isLight
          ? "bg-[#FFFDF8] border border-[#E8DCC2]"
          : "bg-stone-950/80 border border-amber-900/30"
      }`}>
        <span className={`text-[10px] uppercase tracking-widest font-bold block ${
          isLight ? "text-[#6E5C4E]" : "text-stone-400"
        }`}>
          Constituent Junction (सन्धि-सूत्र)
        </span>
        <p className={`font-sanskrit text-lg sm:text-xl font-bold leading-relaxed ${
          isLight ? "text-[#261B12]" : "text-amber-200"
        }`}>
          {sandhi.formula || sandhi.components?.join(" + ")}
        </p>

        {sandhi.sutraRef && (
          <div className={`pt-2 border-t flex items-center space-x-2 text-xs ${
            isLight ? "border-[#E8DCC2] text-[#6E5C4E]" : "border-stone-800/80 text-stone-400"
          }`}>
            <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isLight ? "text-[#D96500]" : "text-amber-400"}`} />
            <span>Paninian Authority: <strong className={isLight ? "text-[#874606]" : "text-amber-300"}>{sandhi.sutraRef}</strong></span>
          </div>
        )}
      </div>

      {/* Step by step transformations if available */}
      {sandhi.steps && sandhi.steps.length > 0 && (
        <div className="space-y-2">
          <span className={`text-xs font-bold uppercase tracking-wider block ${
            isLight ? "text-[#6E5C4E]" : "text-stone-400"
          }`}>
            Step-by-Step Morpho-Phonemic Rules
          </span>
          <div className="space-y-2.5">
            {sandhi.steps.map((step, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-3.5 space-y-1.5 border ${
                  isLight
                    ? "bg-[#FBF8EE] border-[#E8DCC2]"
                    : "bg-stone-900/80 border border-stone-800"
                }`}
              >
                <div className={`flex items-center justify-between text-xs font-bold ${
                  isLight ? "text-[#874606]" : "text-amber-400"
                }`}>
                  <span>Step {idx + 1}</span>
                  {step.paniniSutra && (
                    <span className={`font-sanskrit text-[11px] ${isLight ? "text-[#6E5C4E]" : "text-stone-400"}`}>
                      {step.paniniSutra}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-sm sm:text-base font-sanskrit font-bold">
                  <span className={isLight ? "text-[#3D3126]" : "text-stone-300"}>{step.from}</span>
                  <ArrowRight className={`w-4 h-4 shrink-0 ${isLight ? "text-[#D96500]" : "text-amber-400"}`} />
                  <span className={isLight ? "text-[#261B12]" : "text-amber-200"}>{step.into}</span>
                </div>

                <p className={`text-xs ${isLight ? "text-[#6E5C4E]" : "text-stone-400"}`}>{step.ruleName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
