import React, { useEffect } from "react";
import { Plus, ArrowDown, ChevronRight, Layers } from "lucide-react";
import type { WordComponent } from "../types/wordExplorer.types";
import { WordExplorerService } from "../services/wordExplorer.service";

interface WordBreakdownProps {
  components: WordComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  fullWordSurface: string;
  isLight?: boolean;
}

export const WordBreakdown: React.FC<WordBreakdownProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  fullWordSurface,
  isLight = false,
}) => {
  useEffect(() => {
    if (components && components.length > 0) {
      WordExplorerService.trackEvent("word_breakdown_viewed", {
        fullWordSurface,
        componentCount: components.length,
      });
    }
  }, [fullWordSurface, components.length]);

  if (!components || components.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className={`w-4 h-4 ${isLight ? "text-[#D96500]" : "text-amber-400"}`} />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${
            isLight ? "text-[#874606]" : "text-amber-200"
          }`}>
            Word Decomposition • पद-विच्छेद
          </h3>
        </div>
        <span className={`text-[11px] ${isLight ? "text-[#6E5C4E]" : "text-stone-400"}`}>
          Tap any component to inspect
        </span>
      </div>

      {/* Visual transformation: Composite word to decomposed parts */}
      <div className={`rounded-2xl p-4 sm:p-5 space-y-4 ${
        isLight
          ? "bg-[#FBF8EE] border border-[#E8DCC2] shadow-sm"
          : "bg-stone-950/80 border border-amber-900/30 shadow-inner"
      }`}>
        {/* Full surface pill */}
        <div className={`text-center pb-3 border-b ${isLight ? "border-[#E8DCC2]" : "border-stone-800/80"}`}>
          <span className={`text-xs uppercase tracking-wider block mb-1 ${
            isLight ? "text-[#6E5C4E]" : "text-stone-400"
          }`}>
            Syntactic Compound (संयुक्त पद)
          </span>
          <span className={`font-sanskrit text-2xl font-bold tracking-wide ${
            isLight ? "text-[#261B12]" : "text-amber-300"
          }`}>
            {fullWordSurface}
          </span>
        </div>

        <div className="flex justify-center -my-2">
          <span className={`p-1 rounded-full ${
            isLight
              ? "bg-[#FFFDF8] border border-[#E8DCC2] text-[#874606]"
              : "bg-stone-900 border border-stone-800 text-amber-400/80"
          }`}>
            <ArrowDown className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Interactive Components Chain */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 pt-1">
          {components.map((comp, index) => {
            const isSelected = selectedComponentId === comp.id;
            return (
              <React.Fragment key={comp.id}>
                <button
                  type="button"
                  onClick={() => onSelectComponent(comp.id)}
                  className={`group relative flex flex-col items-center px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? isLight
                        ? "bg-[#FBEFD3] border-[#D96500] text-[#261B12] ring-2 ring-[#D96500]/40 shadow-md scale-105"
                        : "bg-amber-500/20 border-amber-400 text-amber-100 ring-2 ring-amber-400/30 shadow-lg scale-105"
                      : isLight
                      ? "bg-[#FFFDF8] border-[#E8DCC2] text-[#261B12] hover:border-[#D8A856] hover:bg-[#FDFBF7]"
                      : "bg-stone-900/90 border-stone-800 text-stone-300 hover:border-amber-500/50 hover:bg-stone-850"
                  }`}
                >
                  <span className={`font-sanskrit text-base sm:text-lg font-bold ${
                    isLight ? "text-[#261B12]" : "text-stone-100"
                  }`}>
                    {comp.surfaceForm}
                  </span>
                  <span className={`text-[10px] sm:text-[11px] italic font-serif mt-0.5 ${
                    isLight ? "text-[#874606]" : "text-amber-300/80"
                  }`}>
                    {comp.transliteration}
                  </span>
                  {comp.type && (
                    <span className={`mt-1 text-[9px] px-1.5 py-0.2 rounded-full border ${
                      isLight
                        ? "bg-[#F5EEDB] text-[#6E5C4E] border-[#DECB9F]"
                        : "bg-stone-800 text-stone-400 border border-stone-700/60"
                    }`}>
                      {comp.type.split("/")[0].trim()}
                    </span>
                  )}
                </button>

                {/* Plus connector between components */}
                {index < components.length - 1 && (
                  <span className={`flex items-center justify-center ${
                    isLight ? "text-[#874606]" : "text-amber-500/60"
                  }`}>
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
