import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  X,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Feather,
  Sparkles,
  Share2,
  Check,
  BookOpen,
  Layers,
  Info,
  ChevronRight,
} from "lucide-react";
import type { ContentItem } from "../types";
import { soundEngine } from "../utils/audio";
import {
  InteractiveVerseText,
  WordBreakdown,
  WordMeaning,
  WordGrammar,
  WordSandhi,
  WordSources,
  WordExplorerService,
  useWordExplorer,
  type UseWordExplorerReturn,
  type SanskritWord,
} from "../features/wordExplorer";

interface VerseModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  isBookmarked: boolean;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  onSaveJournalNote: (verseId: string, verseTitle: string, note: string) => void;
  onOpenWord?: (surface: string) => void;
  wordExplorer?: UseWordExplorerReturn;
}

export const VerseModal: React.FC<VerseModalProps> = ({
  item,
  isOpen,
  isBookmarked,
  onClose,
  onToggleBookmark,
  onSaveJournalNote,
  onOpenWord,
  wordExplorer: passedWordExplorer,
}) => {
  const internalWordExplorer = useWordExplorer();
  const wordExplorer = passedWordExplorer || internalWordExplorer;

  const [activeSubTab, setActiveSubTab] = useState<"verse" | "commentary" | "journal" | "words">("verse");
  const [journalNote, setJournalNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [chantingRepetitions, setChantingRepetitions] = useState(0);

  // Word-Level Interaction Layer State
  const [selectedWordSurface, setSelectedWordSurface] = useState<string | null>(null);
  const [activeVerseWord, setActiveVerseWord] = useState<SanskritWord | null>(null);

  // Identify all individual Sanskrit words in this verse
  const identifiedWords = useMemo(() => {
    if (!item?.body) return [];
    return WordExplorerService.tokenizeVerse(item.body).filter((t) => t.isWord);
  }, [item?.body]);

  // Reset word selection when changing verse
  useEffect(() => {
    setSelectedWordSurface(null);
    setActiveVerseWord(null);
  }, [item?.id]);

  // Word-level interaction handler: highlights on click and triggers Word Explorer hook
  const handleSelectWord = useCallback(
    async (surface: string, autoOpenDrawer = false) => {
      const cleaned = surface.replace(/[।॥,\.!\?;:\"\'\-–—\s]/g, "").trim();
      if (!cleaned) return;

      // 1. Highlight clicked word
      setSelectedWordSurface(cleaned);

      // 2. Resolve word details from verified lexicon / morphology
      const found = WordExplorerService.getWordBySurfaceSync(cleaned, item?.title);
      setActiveVerseWord(found);

      // 3. Play sacred acoustic harmonic bell
      soundEngine.playTempleBell(329.63);

      // 4. Trigger Word Explorer hook
      if (autoOpenDrawer) {
        await wordExplorer.openWord(cleaned);
        if (onOpenWord) {
          onOpenWord(cleaned);
        }
      } else {
        await wordExplorer.selectWord(cleaned);
      }

      // 5. Track word discovery event
      WordExplorerService.trackEvent("word_selected", {
        surfaceForm: cleaned,
        verseId: item?.id,
        isVerified: found?.isVerified ?? false,
      });
    },
    [item?.id, item?.title, wordExplorer, onOpenWord]
  );

  if (!isOpen || !item) return null;

  const handlePlayBell = () => {
    soundEngine.playTempleBell(220);
    setChantingRepetitions((prev) => prev + 1);
  };

  const handleShare = () => {
    const textToCopy = `${item.title}\n\n${item.body}\n\nMeaning:\n${item.meaning || ""}\n\n— via SutraSparsh`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalNote.trim()) return;
    onSaveJournalNote(item.id, item.title, journalNote.trim());
    setJournalNote("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
      <div
        id="verse-detail-modal"
        className="relative w-full max-w-3xl bg-stone-900 border border-stone-700/80 rounded-3xl shadow-2xl overflow-hidden my-8"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-800 bg-stone-950/50">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {item.metadata.author || "Scripture"}
            </span>
            {item.metadata.category && (
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-stone-800 text-stone-300 border border-stone-700">
                {item.metadata.category}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              title="Copy verse text"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onToggleBookmark(item.id)}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Verse"}
              className="p-2 rounded-xl text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Sub-tabs */}
        <div className="flex border-b border-stone-800 px-6 bg-stone-950/20">
          <button
            onClick={() => setActiveSubTab("verse")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeSubTab === "verse"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sacred Verse & Translation</span>
          </button>
          <button
            onClick={() => setActiveSubTab("commentary")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeSubTab === "commentary"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Philosophical Commentary</span>
          </button>
          <button
            onClick={() => setActiveSubTab("journal")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeSubTab === "journal"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Reflect & Journal</span>
          </button>
          <button
            onClick={() => {
              if (!activeVerseWord && identifiedWords.length > 0) {
                const firstWord = identifiedWords[0].cleaned;
                handleSelectWord(firstWord, false);
              }
              setActiveSubTab("words");
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeSubTab === "words"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Word Explorer • पद-बोध</span>
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeSubTab === "verse" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif-sacred text-2xl font-bold text-amber-100">
                  {item.title}
                </h2>
                {item.subtitle && (
                  <p className="text-sm text-amber-400/90 mt-1 italic">
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* Word-Level Sanskrit Interaction Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Sanskrit Word-Level Layer • पद-विभाग
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25">
                    {identifiedWords.length} Words Identified
                  </span>
                  {selectedWordSurface && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWordSurface(null);
                        setActiveVerseWord(null);
                      }}
                      className="text-[11px] text-stone-400 hover:text-stone-200 underline transition-colors"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>

              {/* Devanagari Sanskrit Body with Interactive Words */}
              <div className="bg-stone-950/80 rounded-2xl p-6 border border-amber-900/30 text-center relative overflow-hidden shadow-inner">
                <div className="absolute top-2 right-2 text-stone-800 font-sanskrit text-6xl pointer-events-none select-none opacity-40">
                  ॐ
                </div>
                <InteractiveVerseText
                  verseText={item.body}
                  selectedSurface={selectedWordSurface || undefined}
                  onSelectWord={(surface) => handleSelectWord(surface, false)}
                />
                <p className="text-[11px] text-stone-500 mt-4 italic font-sans">
                  Tap any word above to highlight it and view Paninian decomposition & Sandhi rules.
                </p>
              </div>

              {/* Identified Words Strip (Quick Selector Row) */}
              <div className="bg-stone-950/50 rounded-2xl p-3.5 border border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                  <span className="font-medium">Identified Sanskrit Words:</span>
                  <span className="text-[11px] text-amber-400/80">Tap to select & highlight</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {identifiedWords.map((t) => {
                    const clean = t.cleaned;
                    const isSelected = selectedWordSurface === clean;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectWord(clean, false)}
                        className={`px-2.5 py-1 rounded-xl border text-xs font-sanskrit font-medium transition-all ${
                          isSelected
                            ? "bg-amber-500/25 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/50 scale-[1.03]"
                            : "bg-stone-900/90 border-stone-800 text-stone-300 hover:border-amber-500/40 hover:text-amber-200"
                        }`}
                      >
                        {clean}
                        {t.hasAnalysis && (
                          <span className="ml-1 text-[9px] text-amber-400 font-sans">•</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Word-Level Interaction Inspector Card (appears when a word is highlighted) */}
              {selectedWordSurface && activeVerseWord ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/35 space-y-3 shadow-xl">
                  <div className="flex items-start justify-between gap-3 border-b border-amber-500/20 pb-3">
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          Highlighted Word:
                        </span>
                        <span className="font-sanskrit text-2xl font-bold text-amber-100">
                          {activeVerseWord.surfaceForm}
                        </span>
                        <span className="font-serif italic text-xs text-amber-300/80">
                          ({activeVerseWord.transliteration})
                        </span>
                      </div>
                      <p className="text-xs text-stone-200 mt-1 font-sans">
                        {activeVerseWord.contextMeaning || activeVerseWord.generalMeaning}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {activeVerseWord.isVerified ? (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                          Paninian Verified
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                          Lexicon
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWordSurface(null);
                          setActiveVerseWord(null);
                        }}
                        className="p-1 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors"
                        title="Clear highlight"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Morphological Quick Details */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {activeVerseWord.root && (
                      <div className="px-2.5 py-1 rounded-lg bg-stone-900/90 border border-stone-700/60 text-stone-300">
                        <span className="text-stone-400 mr-1 font-semibold">Root (धातु):</span>
                        <span className="font-sanskrit text-amber-200 font-bold">{activeVerseWord.root.form}</span>
                        <span className="text-[11px] text-stone-400 ml-1">({activeVerseWord.root.meaning})</span>
                      </div>
                    )}

                    {activeVerseWord.grammar?.case && (
                      <div className="px-2.5 py-1 rounded-lg bg-stone-900/90 border border-stone-700/60 text-stone-300">
                        <span className="text-stone-400 mr-1 font-semibold">Vibhakti:</span>
                        <span className="text-amber-200 font-medium">{activeVerseWord.grammar.case}</span>
                      </div>
                    )}

                    {activeVerseWord.sandhi?.isSandhi && (
                      <div className="px-2.5 py-1 rounded-lg bg-stone-900/90 border border-stone-700/60 text-stone-300">
                        <span className="text-stone-400 mr-1 font-semibold">Sandhi:</span>
                        <span className="text-amber-200 font-mono text-[11px]">{activeVerseWord.sandhi.formula || "Compound"}</span>
                      </div>
                    )}

                    {activeVerseWord.components && activeVerseWord.components.length > 0 && (
                      <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200">
                        <span className="font-semibold">{activeVerseWord.components.length} Decomposed Units: </span>
                        <span className="font-sanskrit font-bold">
                          {activeVerseWord.components.map((c) => c.surfaceForm).join(" + ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => soundEngine.playTempleBell(440)}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors flex items-center space-x-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sound Chime</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setActiveSubTab("words")}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-700 text-xs font-semibold transition-colors flex items-center space-x-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Inspect Morphology Tab</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          wordExplorer.openWord(activeVerseWord.surfaceForm);
                          if (onOpenWord) {
                            onOpenWord(activeVerseWord.surfaceForm);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Open Word Explorer Drawer</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Look Closer Discovery Strip when no word is highlighted */
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-stone-900 to-stone-950 border border-amber-500/25 gap-3">
                  <div className="flex items-center space-x-2 text-xs text-amber-200">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Look Closer:</strong> Tap any Sanskrit word above to highlight and explore roots, Sandhi, and grammatical cases.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const firstWord = identifiedWords[0]?.cleaned || "कर्मण्येवाधिकारस्ते";
                      handleSelectWord(firstWord, false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Select First Word</span>
                  </button>
                </div>
              )}

              {/* Transliteration */}
              {item.transliteration && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                    IAST Transliteration
                  </h4>
                  <div className="bg-stone-950/40 rounded-xl p-4 border border-stone-800/80 text-stone-300 font-mono text-sm leading-relaxed whitespace-pre-line">
                    {item.transliteration}
                  </div>
                </div>
              )}

              {/* English Meaning */}
              {item.meaning && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-2">
                    English Translation
                  </h4>
                  <p className="text-base text-stone-200 leading-relaxed bg-amber-950/10 border border-amber-500/10 rounded-xl p-4">
                    {item.meaning}
                  </p>
                </div>
              )}

              {/* Chanting Sadhana Practice Section */}
              <div className="bg-stone-950/60 rounded-2xl p-4 border border-stone-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handlePlayBell}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-all font-medium text-sm"
                  >
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Chime Bell (Japa)</span>
                  </button>
                  <div className="text-xs text-stone-400">
                    Chanted: <span className="text-amber-300 font-bold">{chantingRepetitions}</span> repetitions
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {item.metadata.tags?.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-md bg-stone-800 text-stone-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "commentary" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif-sacred text-xl font-bold text-amber-100">
                  Commentary & Spiritual Insights
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Context and philosophical breakdown for {item.title}
                </p>
              </div>

              <div className="bg-stone-950/60 rounded-2xl p-6 border border-stone-800 text-stone-200 leading-relaxed text-base space-y-4">
                <p className="whitespace-pre-line">
                  {item.commentary ||
                    "This timeless sacred verse addresses the deep inner dimensions of human existence, offering guidance on duty, mindfulness, and the nature of conscious awareness."}
                </p>

                <div className="pt-4 border-t border-stone-800 text-xs text-stone-400">
                  <p>
                    <strong className="text-stone-300">Application in Daily Life:</strong> Take 3 conscious breaths, release anxiety regarding results, and focus purely on doing your present action with dignity and complete devotion.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "journal" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif-sacred text-xl font-bold text-amber-100">
                  Reflect on this Verse
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Write down your personal contemplation, questions, or meditation insights.
                </p>
              </div>

              <form onSubmit={handleSaveNote} className="space-y-4">
                <textarea
                  id="journal-note-input"
                  rows={5}
                  value={journalNote}
                  onChange={(e) => setJournalNote(e.target.value)}
                  placeholder="How does this sacred wisdom speak to your life right now? Write your meditation reflection..."
                  className="w-full bg-stone-950/80 border border-stone-800 rounded-2xl p-4 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-sm leading-relaxed"
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">
                    Saved entries remain available across sessions in your Journal.
                  </span>

                  <button
                    type="submit"
                    disabled={!journalNote.trim()}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Feather className="w-4 h-4" />
                    <span>Save Reflection</span>
                  </button>
                </div>

                {savedSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Your reflection has been recorded in your Wisdom Journal!</span>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeSubTab === "words" && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  Sanskrit Word Explorer • पद-ज्ञान
                </span>
                <h3 className="font-serif-sacred text-xl font-bold text-amber-100 mt-0.5">
                  Deconstruct Words from this Verse
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Explore components, root (धातु), grammatical cases, and Sandhi for individual terms.
                </p>
              </div>

              {/* Quick word selector pills from this verse */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone-400">Select word from verse:</span>
                <div className="flex flex-wrap gap-2">
                  {identifiedWords.map((t) => {
                    const isSelected =
                      selectedWordSurface === t.cleaned ||
                      activeVerseWord?.surfaceForm === t.cleaned;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectWord(t.cleaned, false)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-sanskrit font-bold transition-all ${
                          isSelected
                            ? "bg-amber-500/25 border-amber-400 text-amber-100 shadow ring-1 ring-amber-400/40"
                            : "bg-stone-900 border-stone-800 text-stone-300 hover:border-amber-500/40"
                        }`}
                      >
                        {t.cleaned}
                        {t.hasAnalysis && (
                          <span className="ml-1 text-[9px] text-amber-400 font-sans">•</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeVerseWord ? (
                <div className="space-y-6 pt-2">
                  {/* Word Header */}
                  <div className="bg-stone-950/80 border border-amber-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex items-baseline space-x-3">
                        <span className="font-sanskrit text-3xl font-bold text-amber-200">
                          {activeVerseWord.surfaceForm}
                        </span>
                        <span className="font-serif italic text-base text-amber-300/80">
                          ({activeVerseWord.transliteration})
                        </span>
                      </div>
                      {activeVerseWord.isVerified ? (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Verified Paninian Analysis
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Lexicon Entry
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Decomposition */}
                  {activeVerseWord.components && activeVerseWord.components.length > 0 && (
                    <WordBreakdown
                      components={activeVerseWord.components}
                      selectedComponentId={null}
                      onSelectComponent={(id) => {
                        const comp = activeVerseWord.components?.find((c) => c.id === id);
                        if (comp) {
                          handleSelectWord(comp.surfaceForm, false);
                        } else if (onOpenWord) {
                          onOpenWord(activeVerseWord.surfaceForm);
                        }
                      }}
                      fullWordSurface={activeVerseWord.surfaceForm}
                    />
                  )}

                  {/* Meaning */}
                  <WordMeaning word={activeVerseWord} />

                  {/* Grammar */}
                  <WordGrammar grammar={activeVerseWord.grammar} root={activeVerseWord.root} />

                  {/* Sandhi if applicable */}
                  {activeVerseWord.sandhi?.isSandhi && (
                    <WordSandhi
                      sandhi={activeVerseWord.sandhi}
                      surfaceForm={activeVerseWord.surfaceForm}
                    />
                  )}

                  {/* Source transparency */}
                  <WordSources
                    sources={activeVerseWord.sources}
                    isVerified={activeVerseWord.isVerified}
                    unavailableReason={activeVerseWord.unavailableReason}
                  />

                  {/* Full screen Explorer trigger */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        wordExplorer.openWord(activeVerseWord.surfaceForm);
                        if (onOpenWord) {
                          onOpenWord(activeVerseWord.surfaceForm);
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all inline-flex items-center space-x-2"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Launch Full Word Explorer Drawer</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  Tap any word above to inspect its deep morphological breakdown.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-950/80 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
