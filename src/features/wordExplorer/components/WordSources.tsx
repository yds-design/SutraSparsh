import React from "react";
import { ShieldCheck, BookOpen, ScrollText } from "lucide-react";
import type { WordSource } from "../types/wordExplorer.types";

interface WordSourcesProps {
  sources?: WordSource[];
  isVerified: boolean;
  unavailableReason?: string;
  isLight?: boolean;
}

export const WordSources: React.FC<WordSourcesProps> = ({
  sources,
  isVerified,
  unavailableReason,
  isLight = false,
}) => {
  return (
    <div className="space-y-3 pt-2">
      <div className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider ${
        isLight ? "text-[#6E5C4E]" : "text-stone-400"
      }`}>
        <ScrollText className={`w-3.5 h-3.5 ${isLight ? "text-[#D96500]" : "text-amber-400"}`} />
        <span>Source Transparency & Attributions • प्रमाण</span>
      </div>

      {!isVerified && unavailableReason && (
        <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
          isLight
            ? "bg-[#FFF7E6] border-[#D8A856] text-[#261B12]"
            : "bg-amber-950/20 border border-amber-500/30 text-amber-200"
        }`}>
          <p className="font-semibold mb-1">Authenticity Assurance:</p>
          <p>{unavailableReason}</p>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 p-2.5 rounded-xl border ${
                isLight
                  ? "bg-[#FFFDF8] border-[#E8DCC2] shadow-sm"
                  : "bg-stone-900/60 border border-stone-800/80"
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? "text-emerald-700" : "text-emerald-400"}`} />
              <div>
                <span className={`font-semibold block ${isLight ? "text-[#261B12]" : "text-stone-200"}`}>{src.name}</span>
                {src.reference && (
                  <span className={`text-[11px] block mt-0.5 ${isLight ? "text-[#6E5C4E]" : "text-stone-400"}`}>
                    {src.reference}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
