import React from "react";
import { BookOpen, Award, Compass, ShieldCheck } from "lucide-react";
import type { WordComponent } from "../types/wordExplorer.types";

interface WordComponentViewProps {
  component: WordComponent;
  isLight?: boolean;
}

export const WordComponentView: React.FC<WordComponentViewProps> = ({ component, isLight = false }) => {
  return (
    <div className={`rounded-2xl p-5 space-y-4 shadow-sm ${
      isLight
        ? "bg-[#FBF8EE] border border-[#E8DCC2]"
        : "bg-gradient-to-br from-amber-950/20 via-stone-900 to-stone-950 border border-amber-500/25 shadow-xl"
    }`}>
      {/* Component Header */}
      <div className={`flex flex-wrap items-baseline justify-between gap-2 border-b pb-3 ${
        isLight ? "border-[#E8DCC2]" : "border-stone-800/80"
      }`}>
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${
            isLight ? "text-[#874606]" : "text-amber-400"
          }`}>
            Selected Component • घटक पद
          </span>
          <div className="flex items-baseline space-x-3 mt-0.5">
            <h4 className={`font-sanskrit text-2xl sm:text-3xl font-bold ${
              isLight ? "text-[#261B12]" : "text-amber-100"
            }`}>
              {component.surfaceForm}
            </h4>
            <span className={`font-serif italic text-base ${
              isLight ? "text-[#874606]" : "text-amber-300"
            }`}>
              {component.transliteration}
            </span>
          </div>
        </div>

        {component.type && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isLight
              ? "bg-[#FFF7E6] text-[#874606] border-[#DECB9F]"
              : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
          }`}>
            {component.type}
          </span>
        )}
      </div>

      {/* Component Meaning */}
      <div className="space-y-1">
        <span className={`text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 ${
          isLight ? "text-[#6E5C4E]" : "text-stone-400"
        }`}>
          <BookOpen className={`w-3.5 h-3.5 ${isLight ? "text-[#D96500]" : "text-amber-400"}`} />
          <span>Linguistic Meaning</span>
        </span>
        <p className={`text-sm sm:text-base font-medium leading-relaxed p-3 rounded-xl border ${
          isLight
            ? "text-[#261B12] bg-[#FFFDF8] border-[#E8DCC2]"
            : "text-amber-100/90 bg-stone-950/60 border-stone-800"
        }`}>
          {component.meaning}
        </p>
      </div>

      {/* Contextual Meaning if available */}
      {component.contextMeaning && (
        <div className="space-y-1">
          <span className={`text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 ${
            isLight ? "text-[#6E5C4E]" : "text-stone-400"
          }`}>
            <Compass className={`w-3.5 h-3.5 ${isLight ? "text-[#D96500]" : "text-amber-400"}`} />
            <span>Nuance in this Verse</span>
          </span>
          <p className={`text-xs sm:text-sm leading-relaxed italic p-3 rounded-xl border ${
            isLight
              ? "text-[#3D3126] bg-[#FFF7E6] border-[#D8A856]"
              : "text-stone-300 bg-stone-950/40 border-stone-850"
          }`}>
            {component.contextMeaning}
          </p>
        </div>
      )}

      {/* Component Root & Grammar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {component.root && (
          <div className={`rounded-xl p-3 space-y-1 border ${
            isLight
              ? "bg-[#FFFDF8] border-[#E8DCC2]"
              : "bg-stone-900/80 border border-stone-800"
          }`}>
            <span className={`text-[11px] font-semibold block ${
              isLight ? "text-[#874606]" : "text-amber-400"
            }`}>
              Dhatu / धातु (Verbal Root)
            </span>
            <div className="flex items-baseline space-x-2">
              <span className={`font-sanskrit text-lg font-bold ${
                isLight ? "text-[#261B12]" : "text-amber-200"
              }`}>
                {component.root.form}
              </span>
              <span className={`italic text-xs ${isLight ? "text-[#6E5C4E]" : "text-stone-400"}`}>
                ({component.root.transliteration})
              </span>
            </div>
            <p className={`text-xs ${isLight ? "text-[#3D3126]" : "text-stone-300"}`}>
              {component.root.meaning}
            </p>
          </div>
        )}

        {component.grammar && (
          <div className={`rounded-xl p-3 space-y-1.5 border ${
            isLight
              ? "bg-[#FFFDF8] border-[#E8DCC2]"
              : "bg-stone-900/80 border border-stone-800"
          }`}>
            <span className={`text-[11px] font-semibold block ${
              isLight ? "text-[#874606]" : "text-amber-400"
            }`}>
              Grammatical Classification
            </span>
            {component.grammar.grammaticalForm && (
              <p className={`text-xs font-medium ${isLight ? "text-[#261B12]" : "text-stone-200"}`}>
                {component.grammar.grammaticalForm}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              {component.grammar.case && (
                <span className={`px-2 py-0.5 rounded border ${
                  isLight
                    ? "bg-[#F5EEDB] text-[#874606] border-[#DECB9F]"
                    : "bg-stone-800 text-amber-300 border border-stone-700"
                }`}>
                  {component.grammar.case}
                </span>
              )}
              {component.grammar.number && (
                <span className={`px-2 py-0.5 rounded border ${
                  isLight
                    ? "bg-[#F5EEDB] text-[#3D3126] border-[#DECB9F]"
                    : "bg-stone-800 text-stone-300 border border-stone-700"
                }`}>
                  {component.grammar.number}
                </span>
              )}
              {component.grammar.gender && (
                <span className={`px-2 py-0.5 rounded border ${
                  isLight
                    ? "bg-[#F5EEDB] text-[#3D3126] border-[#DECB9F]"
                    : "bg-stone-800 text-stone-300 border border-stone-700"
                }`}>
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
