import React, { useEffect } from "react";
import { Plus, ArrowDown, ChevronRight, Layers } from "lucide-react";
import type { WordComponent } from "../types/wordExplorer.types";
import { WordExplorerService } from "../services/wordExplorer.service";

interface WordBreakdownProps {
  components: WordComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  fullWordSurface: string;
}

export const WordBreakdown: React.FC<WordBreakdownProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  fullWordSurface,
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
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-200">
            Word Decomposition • पद-विच्छेद
          </h3>
        </div>
        <span className="text-[11px] text-stone-400">
          Tap any component to inspect
        </span>
      </div>

      {/* Visual transformation: Composite word to decomposed parts */}
      <div className="bg-stone-950/80 border border-amber-900/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-inner">
        {/* Full surface pill */}
        <div className="text-center pb-3 border-b border-stone-800/80">
          <span className="text-xs text-stone-400 uppercase tracking-wider block mb-1">
            Syntactic Compound (संयुक्त पद)
          </span>
          <span className="font-sanskrit text-2xl text-amber-300 font-bold tracking-wide">
            {fullWordSurface}
          </span>
        </div>

        <div className="flex justify-center -my-2">
          <span className="p-1 rounded-full bg-stone-900 border border-stone-800 text-amber-400/80">
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
                  className={`group relative flex flex-col items-center px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-400 text-amber-100 ring-2 ring-amber-400/30 shadow-lg scale-105"
                      : "bg-stone-900/90 border-stone-800 text-stone-300 hover:border-amber-500/50 hover:bg-stone-850"
                  }`}
                >
                  <span className="font-sanskrit text-base sm:text-lg font-bold">
                    {comp.surfaceForm}
                  </span>
                  <span className="text-[10px] sm:text-[11px] italic font-serif text-amber-300/80 mt-0.5">
                    {comp.transliteration}
                  </span>
                  {comp.type && (
                    <span className="mt-1 text-[9px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-400 border border-stone-700/60">
                      {comp.type.split("/")[0].trim()}
                    </span>
                  )}
                </button>

                {/* Plus connector between components */}
                {index < components.length - 1 && (
                  <span className="text-amber-500/60 flex items-center justify-center">
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
