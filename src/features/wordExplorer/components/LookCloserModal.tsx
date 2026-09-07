import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Layers,
  Award,
  BookOpen,
  ChevronRight,
  Compass,
} from "lucide-react";
import { soundEngine } from "../../../utils/audio";
import { VERIFIED_SANSKRIT_WORDS } from "../services/wordExplorer.service";
import type { SanskritWord } from "../types/wordExplorer.types";

interface LookCloserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWordExplorer: (word: SanskritWord) => void;
}

export const LookCloserModal: React.FC<LookCloserModalProps> = ({
  isOpen,
  onClose,
  onOpenWordExplorer,
}) => {
  const [currentScene, setCurrentScene] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedCompIndex, setSelectedCompIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const flagshipWord = VERIFIED_SANSKRIT_WORDS["karmany-evadhikaraste"];

  // Autoplay progression sequence
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const sceneDurations = {
      1: 3200, // Scene 1: Translation is shown
      2: 2400, // Scene 2: Curiosity - "But sometimes..."
      3: 3200, // Scene 3: Word breaks into components
      4: 3800, // Scene 4: Deeper layers revealed
      5: 999999, // Final scene stays until action
    };

    timerRef.current = setTimeout(() => {
      setCurrentScene((prev) => {
        if (prev < 5) {
          const next = (prev + 1) as 1 | 2 | 3 | 4 | 5;
          soundEngine.playTempleBell(220 + next * 40);
          return next;
        }
        return prev;
      });
    }, sceneDurations[currentScene]);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, isPlaying, currentScene]);

  // Reset to Scene 1 when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentScene(1);
      setIsPlaying(true);
      setSelectedCompIndex(0);
      soundEngine.playTempleBell(261.63);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    setIsPlaying(false);
    if (currentScene < 5) {
      const next = (currentScene + 1) as 1 | 2 | 3 | 4 | 5;
      setCurrentScene(next);
      soundEngine.playTempleBell(260 + next * 35);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentScene > 1) {
      const prev = (currentScene - 1) as 1 | 2 | 3 | 4 | 5;
      setCurrentScene(prev);
    }
  };

  const activeComponent = flagshipWord.components?.[selectedCompIndex] || flagshipWord.components?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-xl overflow-y-auto">
      <div
        id="look-closer-experience"
        className="relative w-full max-w-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-10 my-6 transition-all"
      >
        {/* Subtle Ambient Golden Glow in background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ── Top Header Controls ── */}
        <div className="relative z-10 flex items-center justify-between pb-6 border-b border-stone-800/80">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
              SutraSparsh Discovery • Look Closer
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs flex items-center space-x-1.5 transition-colors"
              title={isPlaying ? "Pause auto-advance" : "Resume auto-advance"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
              title="Close experience"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Scene Progress Indicators ── */}
        <div className="relative z-10 flex items-center justify-center space-x-2 my-5">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => {
                setIsPlaying(false);
                setCurrentScene(s as any);
                soundEngine.playTempleBell(220 + s * 30);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentScene === s
                  ? "w-8 bg-amber-400"
                  : currentScene > s
                  ? "w-4 bg-amber-500/50"
                  : "w-3 bg-stone-800"
              }`}
              title={`Jump to Scene ${s}`}
            />
          ))}
        </div>

        {/* ── Main Sequence Stage ── */}
        <div className="relative z-10 min-h-[340px] sm:min-h-[380px] flex flex-col justify-center py-4">
          {/* ════════ SCENE 1: Translation ════════ */}
          {currentScene === 1 && (
            <div className="space-y-6 text-center animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-amber-400/90 font-semibold">
                  The Surface
                </span>
                <h2 className="font-serif-sacred text-2xl sm:text-3xl text-amber-100 font-medium">
                  “A translation tells you what a sentence means.”
                </h2>
              </div>

              {/* Verse Display */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 shadow-lg space-y-3">
                <p className="font-sanskrit text-xl sm:text-2xl text-amber-200/90 font-medium leading-relaxed">
                  कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।
                </p>
                <div className="pt-3 border-t border-stone-800">
                  <p className="text-sm sm:text-base text-stone-300 italic font-serif leading-relaxed">
                    “You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.”
                  </p>
                </div>
              </div>

              <p className="text-xs text-stone-400 italic">
                At first glance, the translated sentence appears complete and sufficient.
              </p>
            </div>
          )}

          {/* ════════ SCENE 2: Curiosity ════════ */}
          {currentScene === 2 && (
            <div className="space-y-6 text-center animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-amber-400/90 font-semibold">
                  The Turning Point
                </span>
                <h2 className="font-serif-sacred text-3xl sm:text-4xl text-amber-300 font-bold italic">
                  “But sometimes...”
                </h2>
              </div>

              {/* Receding Verse with Highlighted Word */}
              <div className="bg-stone-900/70 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
                <p className="font-sanskrit text-xl sm:text-2xl text-stone-500 leading-relaxed">
                  <span className="inline-block px-3 py-1 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400 font-bold text-2xl sm:text-3xl shadow-lg ring-2 ring-amber-400/30 animate-pulse">
                    कर्मण्येवाधिकारस्ते
                  </span>{" "}
                  मा फलेषु कदाचन।
                </p>

                {/* Receding translation */}
                <div className="pt-2 border-t border-stone-800/60 opacity-40 transition-opacity">
                  <p className="text-xs sm:text-sm text-stone-400 italic font-serif">
                    “You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.”
                  </p>
                </div>
              </div>

              <p className="text-xs text-amber-200/80 font-medium">
                The sentence recedes. A single Sanskrit word beckons you to look deeper.
              </p>
            </div>
          )}

          {/* ════════ SCENE 3: Word Discovery ════════ */}
          {currentScene === 3 && (
            <div className="space-y-6 text-center animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-amber-400/90 font-semibold">
                  Deconstruction
                </span>
                <h2 className="font-serif-sacred text-2xl sm:text-3xl text-amber-100 font-medium">
                  “The words tell you much more.”
                </h2>
              </div>

              {/* The Word Breaks into Components */}
              <div className="bg-stone-950/80 border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="text-xs text-stone-400 uppercase tracking-wider">
                  One Compound Word:
                </div>
                <div className="font-sanskrit text-2xl sm:text-3xl font-bold text-amber-300">
                  {flagshipWord.surfaceForm}
                </div>

                <div className="text-amber-400/80 text-xs font-semibold uppercase tracking-widest flex items-center justify-center space-x-2">
                  <span>↓ Breaks Into Four Conscious Components ↓</span>
                </div>

                {/* Splitting animation */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {flagshipWord.components?.map((comp, idx) => (
                    <React.Fragment key={comp.id}>
                      <button
                        onClick={() => {
                          setSelectedCompIndex(idx);
                          soundEngine.playTempleBell(300 + idx * 40);
                        }}
                        className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all ${
                          selectedCompIndex === idx
                            ? "bg-amber-500/25 border-amber-400 text-amber-100 shadow-md scale-105"
                            : "bg-stone-900 border-stone-800 text-stone-300 hover:border-amber-500/40"
                        }`}
                      >
                        <span className="font-sanskrit text-lg font-bold">
                          {comp.surfaceForm}
                        </span>
                        <span className="text-[10px] italic font-serif text-amber-300/80">
                          {comp.transliteration}
                        </span>
                      </button>
                      {idx < (flagshipWord.components?.length || 0) - 1 && (
                        <span className="text-amber-500/60 font-bold">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <p className="text-xs text-stone-300">
                This is not a mere translation lookup. It is an exploration of how sacred meaning is assembled.
              </p>
            </div>
          )}

          {/* ════════ SCENE 4: Deeper Layers ════════ */}
          {currentScene === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="text-xs uppercase tracking-widest text-amber-400/90 font-semibold">
                  The Infinite Depth
                </span>
                <h2 className="font-serif-sacred text-2xl sm:text-3xl text-amber-100 font-medium">
                  Deeper Layers of a Single Word
                </h2>
              </div>

              {/* Component selection tabs */}
              <div className="flex items-center justify-center gap-1.5">
                {flagshipWord.components?.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCompIndex(i);
                      soundEngine.playTempleBell(280 + i * 30);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-sanskrit font-bold border transition-colors ${
                      selectedCompIndex === i
                        ? "bg-amber-500/20 border-amber-400 text-amber-200"
                        : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {c.surfaceForm}
                  </button>
                ))}
              </div>

              {/* Layer Details Card */}
              <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-3.5 shadow-xl text-xs sm:text-sm">
                <div className="flex items-baseline justify-between border-b border-stone-800 pb-2">
                  <div>
                    <span className="font-sanskrit text-2xl text-amber-200 font-bold">
                      {activeComponent?.surfaceForm}
                    </span>
                    <span className="font-serif italic text-amber-300/80 ml-2">
                      ({activeComponent?.transliteration})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-800 text-stone-300 border border-stone-700">
                    {activeComponent?.type}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">
                    Meaning in Context:
                  </span>
                  <p className="text-stone-100 font-medium leading-relaxed">
                    {activeComponent?.meaning} — {activeComponent?.contextMeaning}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
                    <span className="text-[10px] uppercase text-amber-400 block font-bold">
                      Root / धातु:
                    </span>
                    <span className="font-sanskrit text-sm font-bold text-amber-100">
                      {activeComponent?.root ? `${activeComponent.root.form} (${activeComponent.root.transliteration})` : "Indedeclinable (अव्यय)"}
                    </span>
                    {activeComponent?.root && (
                      <p className="text-[10px] text-stone-400 mt-0.5">{activeComponent.root.meaning}</p>
                    )}
                  </div>

                  <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
                    <span className="text-[10px] uppercase text-amber-400 block font-bold">
                      Grammar / विभक्ति:
                    </span>
                    <span className="text-stone-200 text-xs font-semibold block">
                      {activeComponent?.grammar?.case || "Invariable Particle"}
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      {activeComponent?.grammar?.number || "Avyaya"}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-center text-stone-400 italic">
                Translation → Word → Components → Root → Context → Deeper Understanding
              </p>
            </div>
          )}

          {/* ════════ SCENE 5: Final Brand Message ════════ */}
          {currentScene === 5 && (
            <div className="space-y-7 text-center animate-fadeIn py-4">
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  SutraSparsh Principle
                </span>
                <h1 className="font-serif-sacred text-4xl sm:text-5xl font-bold text-amber-100 tracking-tight">
                  “Look closer.”
                </h1>
                <p className="font-serif text-lg sm:text-xl text-amber-300 italic">
                  One word. Many layers.
                </p>
              </div>

              <div className="max-w-md mx-auto bg-stone-900/60 border border-stone-800/80 rounded-2xl p-5 text-xs sm:text-sm text-stone-300 leading-relaxed">
                Because sometimes the deepest meaning is not hidden in the sentence.
                <strong className="text-amber-200 block mt-1">
                  It is hidden inside the words.
                </strong>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenWordExplorer(flagshipWord);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Enter Word Explorer</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition-colors"
                >
                  Return to Scripture
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Step Navigation Controls ── */}
        <div className="relative z-10 flex items-center justify-between pt-5 border-t border-stone-800/80 text-xs">
          <button
            onClick={handlePrev}
            disabled={currentScene === 1}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border transition-colors ${
              currentScene === 1
                ? "opacity-30 cursor-not-allowed border-stone-800 text-stone-600"
                : "border-stone-700 text-stone-300 hover:bg-stone-800"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="text-stone-500 font-mono text-[11px]">
            Scene {currentScene} / 5
          </span>

          {currentScene < 5 ? (
            <button
              onClick={handleNext}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-semibold transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenWordExplorer(flagshipWord);
              }}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-amber-400 text-stone-950 font-bold transition-colors"
            >
              <span>Explore</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
