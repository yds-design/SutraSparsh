import React from "react";
import { BookOpen, Award, Compass, ShieldCheck } from "lucide-react";
import type { WordComponent } from "../types/wordExplorer.types";

interface WordComponentViewProps {
  component: WordComponent;
}

export const WordComponentView: React.FC<WordComponentViewProps> = ({ component }) => {
  return (
    <div className="bg-gradient-to-br from-amber-950/20 via-stone-900 to-stone-950 border border-amber-500/25 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Component Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-800/80 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            Selected Component • घटक पद
          </span>
          <div className="flex items-baseline space-x-3 mt-0.5">
            <h4 className="font-sanskrit text-2xl sm:text-3xl font-bold text-amber-100">
              {component.surfaceForm}
            </h4>
            <span className="font-serif italic text-base text-amber-300">
              {component.transliteration}
            </span>
          </div>
        </div>

        {component.type && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            {component.type}
          </span>
        )}
      </div>

      {/* Component Meaning */}
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center space-x-1.5">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Linguistic Meaning</span>
        </span>
        <p className="text-sm sm:text-base text-amber-100/90 font-medium leading-relaxed bg-stone-950/60 p-3 rounded-xl border border-stone-800">
          {component.meaning}
        </p>
      </div>

      {/* Contextual Meaning if available */}
      {component.contextMeaning && (
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Nuance in this Verse</span>
          </span>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed italic bg-stone-950/40 p-3 rounded-xl border border-stone-850">
            {component.contextMeaning}
          </p>
        </div>
      )}

      {/* Component Root & Grammar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {component.root && (
          <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3 space-y-1">
            <span className="text-[11px] font-semibold text-amber-400 block">
              Dhatu / धातु (Verbal Root)
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="font-sanskrit text-lg font-bold text-amber-200">
                {component.root.form}
              </span>
              <span className="italic text-xs text-stone-400">
                ({component.root.transliteration})
              </span>
            </div>
            <p className="text-xs text-stone-300">
              {component.root.meaning}
            </p>
          </div>
        )}

        {component.grammar && (
          <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3 space-y-1.5">
            <span className="text-[11px] font-semibold text-amber-400 block">
              Grammatical Classification
            </span>
            {component.grammar.grammaticalForm && (
              <p className="text-xs font-medium text-stone-200">
                {component.grammar.grammaticalForm}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              {component.grammar.case && (
                <span className="px-2 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700">
                  {component.grammar.case}
                </span>
              )}
              {component.grammar.number && (
                <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                  {component.grammar.number}
                </span>
              )}
              {component.grammar.gender && (
                <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                  {component.grammar.gender}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
