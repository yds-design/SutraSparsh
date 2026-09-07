import React from "react";
import { ShieldCheck, BookOpen, ScrollText } from "lucide-react";
import type { WordSource } from "../types/wordExplorer.types";

interface WordSourcesProps {
  sources?: WordSource[];
  isVerified: boolean;
  unavailableReason?: string;
}

export const WordSources: React.FC<WordSourcesProps> = ({
  sources,
  isVerified,
  unavailableReason,
}) => {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-stone-400">
        <ScrollText className="w-3.5 h-3.5 text-amber-400" />
        <span>Source Transparency & Attributions • प्रमाण</span>
      </div>

      {!isVerified && unavailableReason && (
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
          <p className="font-semibold mb-1">Authenticity Assurance:</p>
          <p>{unavailableReason}</p>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-stone-900/60 border border-stone-800/80"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-200 block">{src.name}</span>
                {src.reference && (
                  <span className="text-[11px] text-stone-400 block mt-0.5">
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
