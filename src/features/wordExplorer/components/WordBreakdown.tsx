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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Layers className={`w-3.5 h-3.5 ${isLight ? "text-[#D96500]" : "text-amber-400"}`} />
          <h3 className={`text-xs font-bold uppercase tracking-wider ${
            isLight ? "text-[#874606]" : "text-amber-200"
          }`}>
            Word Decomposition • पद-विच्छेद
          </h3>
        </div>
        <span className={`text-[10px] ${isLight ? "text-[#6E5C4E]" : "text-stone-400"}`}>
          Tap component to inspect
        </span>
      </div>

      {/* Visual transformation: Composite word to decomposed parts */}
      <div className={`rounded-xl p-2.5 sm:p-3 space-y-2 ${
        isLight
          ? "bg-[#FBF8EE] border border-[#E8DCC2] shadow-sm"
          : "bg-stone-950/80 border border-amber-900/30 shadow-inner"
      }`}>
        {/* Full surface pill */}
        <div className={`text-center pb-1.5 border-b ${isLight ? "border-[#E8DCC2]" : "border-stone-800/80"}`}>
          <span className={`text-[10px] uppercase tracking-wider block mb-0.5 ${
            isLight ? "text-[#6E5C4E]" : "text-stone-400"
          }`}>
            Syntactic Compound (संयुक्त पद)
          </span>
          <span
            className={`font-sanskrit text-lg sm:text-xl font-bold tracking-wide ${
              isLight ? "text-[#1b1740]" : "text-amber-300"
            }`}
            style={{ color: isLight ? "#1b1740" : "#fde68a" }}
          >
            {fullWordSurface}
          </span>
        </div>

        <div className="flex justify-center -my-1">
          <span className={`p-0.5 rounded-full ${
            isLight
              ? "bg-[#FFFDF8] border border-[#E8DCC2] text-[#874606]"
              : "bg-stone-900 border border-stone-800 text-amber-400/80"
          }`}>
            <ArrowDown className="w-3 h-3" />
          </span>
        </div>

        {/* Interactive Components Chain */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-0.5">
          {components.map((comp, index) => {
            const isSelected = selectedComponentId === comp.id;
            return (
              <React.Fragment key={comp.id}>
                <button
                  type="button"
                  onClick={() => onSelectComponent(comp.id)}
                  className={`group relative flex flex-col items-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? isLight
                        ? "bg-[#FBEFD3] border-[#D96500] text-[#261B12] ring-2 ring-[#D96500]/40 shadow-xs scale-102"
                        : "bg-amber-500/20 border-amber-400 text-amber-100 ring-2 ring-amber-400/30 shadow-md scale-102"
                      : isLight
                      ? "bg-[#FFFDF8] border-[#E8DCC2] text-[#261B12] hover:border-[#D8A856] hover:bg-[#FDFBF7]"
                      : "bg-stone-900/90 border-stone-800 text-stone-300 hover:border-amber-500/50 hover:bg-stone-850"
                  }`}
                >
                  <span
                    className={`font-sanskrit text-sm sm:text-base font-bold ${
                      isLight ? "text-[#1b1740]" : "text-stone-100"
                    }`}
                    style={{ color: isLight ? "#1b1740" : "#fffbeb" }}
                  >
                    {comp.surfaceForm}
                  </span>
                  <span
                    className={`text-[9px] sm:text-[10px] italic font-serif mt-0.5 ${
                      isLight ? "text-[#874606]" : "text-amber-300/80"
                    }`}
                    style={{ color: isLight ? "#874606" : "#fde68a" }}
                  >
                    {comp.transliteration}
                  </span>
                  {comp.type && (
                    <span className={`mt-0.5 text-[8px] px-1 py-0.2 rounded-full border ${
                      isLight
                        ? "bg-[#F5EEDB] text-[#6E5C4E] border-[#DECB9F]"
                        : "bg-stone-800 text-stone-400 border border-stone-700/60"
                    }`}>
                      {(comp.type || "").split("/")[0].trim()}
                    </span>
                  )}
                </button>

                {/* Plus connector between components */}
                {index < components.length - 1 && (
                  <span className={`flex items-center justify-center ${
                    isLight ? "text-[#874606]" : "text-amber-500/60"
                  }`}>
                    <Plus className="w-3 h-3" />
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
