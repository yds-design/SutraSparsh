import React, { useState } from "react";
import { X, Volume2, Bookmark, BookmarkCheck, Feather, Sparkles, Share2, Check, BookOpen } from "lucide-react";
import type { ContentItem } from "../types";
import { soundEngine } from "../utils/audio";

interface VerseModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  isBookmarked: boolean;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  onSaveJournalNote: (verseId: string, verseTitle: string, note: string) => void;
}

export const VerseModal: React.FC<VerseModalProps> = ({
  item,
  isOpen,
  isBookmarked,
  onClose,
  onToggleBookmark,
  onSaveJournalNote,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"verse" | "commentary" | "journal">("verse");
  const [journalNote, setJournalNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [chantingRepetitions, setChantingRepetitions] = useState(0);

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

              {/* Devanagari Sanskrit Body */}
              <div className="bg-stone-950/80 rounded-2xl p-6 border border-stone-800 text-center relative overflow-hidden">
                <div className="absolute top-2 right-2 text-stone-800 font-sanskrit text-6xl pointer-events-none select-none opacity-40">
                  ॐ
                </div>
                <p className="font-sanskrit text-xl sm:text-2xl text-amber-200 leading-loose whitespace-pre-line">
                  {item.body}
                </p>
              </div>

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
