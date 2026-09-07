import React from "react";
import { Award, Layers, Hash, BookMarked } from "lucide-react";
import type { WordGrammar as IWordGrammar, WordRoot } from "../types/wordExplorer.types";

interface WordGrammarProps {
  grammar?: IWordGrammar;
  root?: WordRoot;
}

export const WordGrammar: React.FC<WordGrammarProps> = ({ grammar, root }) => {
  if (!grammar && !root) {
    return (
      <div className="text-center py-6 text-stone-400 text-xs italic">
        Detailed grammatical attributes are being indexed from the Paninian Dhatupatha.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
        <Award className="w-3.5 h-3.5" />
        <span>Grammatical Anatomy • व्याकरण विन्यास</span>
      </div>

      {/* Root card */}
      {root && (
        <div className="bg-gradient-to-r from-amber-950/30 to-stone-900 border border-amber-500/25 rounded-2xl p-4 sm:p-5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            Dhatu (Verbal Root) • धातु निर्देश
          </span>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-sanskrit text-3xl font-bold text-amber-200">
              {root.form}
            </span>
            <span className="font-serif italic text-lg text-amber-300/80">
              ({root.transliteration})
            </span>
            {root.gana && (
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-stone-800 text-stone-300 border border-stone-700">
                {root.gana}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-300">
            Root Meaning: <span className="font-medium text-amber-100">{root.meaning}</span>
          </p>
        </div>
      )}

      {/* Grammar attributes grid */}
      {grammar && (
        <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4">
          {grammar.grammaticalForm && (
            <div className="pb-3 border-b border-stone-800">
              <span className="text-xs text-stone-400 block mb-0.5">Syntactic Structure</span>
              <p className="text-sm font-semibold text-amber-200">{grammar.grammaticalForm}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {grammar.case && (
              <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  Vibhakti / विभक्ति (Case)
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-200 mt-0.5 block">
                  {grammar.case}
                </span>
              </div>
            )}

            {grammar.number && (
              <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  Vachana / वचन (Number)
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-200 mt-0.5 block">
                  {grammar.number}
                </span>
              </div>
            )}

            {grammar.gender && (
              <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  Linga / लिङ्ग (Gender)
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-200 mt-0.5 block">
                  {grammar.gender}
                </span>
              </div>
            )}

            {grammar.person && (
              <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  Purusha / पुरुष (Person)
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-200 mt-0.5 block">
                  {grammar.person}
                </span>
              </div>
            )}

            {grammar.tense && (
              <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  Lakara / लकार (Tense/Mood)
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-200 mt-0.5 block">
                  {grammar.tense}
                </span>
              </div>
            )}
          </div>

          {grammar.notes && (
            <p className="text-xs text-stone-400 pt-2 border-t border-stone-850 italic">
              Grammatical Note: {grammar.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
