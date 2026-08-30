import React, { useState } from "react";
import { Sun, Sparkles, Volume2, Feather, Bookmark, BookmarkCheck, Check } from "lucide-react";
import type { ContentItem } from "../types";
import { soundEngine } from "../utils/audio";

interface DailySutraProps {
  verse: ContentItem | null;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSaveJournalNote: (verseId: string, verseTitle: string, note: string) => void;
  onOpenDetails: (verse: ContentItem) => void;
}

export const DailySutra: React.FC<DailySutraProps> = ({
  verse,
  isBookmarked,
  onToggleBookmark,
  onSaveJournalNote,
  onOpenDetails,
}) => {
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);

  if (!verse) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-stone-400">
        <Sun className="w-12 h-12 text-amber-500/40 mx-auto mb-4 animate-spin" />
        <p>Illuminating today's sacred reflection...</p>
      </div>
    );
  }

  const handleChime = () => {
    soundEngine.playTempleBell(220);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;
    onSaveJournalNote(verse.id, verse.title, reflection.trim());
    setReflection("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/30 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-amber-400 text-xs sm:text-sm font-semibold tracking-wider uppercase">
              <Sun className="w-5 h-5 text-amber-400" />
              <span>Sutra of the Day • दैनिक स्वाध्याय</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleChime}
                title="Chime temple bell"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-amber-300 hover:border-amber-500/40 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>Chime Bell</span>
              </button>

              <button
                onClick={() => onToggleBookmark(verse.id)}
                className="p-2 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <h2 className="font-serif-sacred text-2xl sm:text-4xl font-bold text-amber-100 mb-2">
              {verse.title}
            </h2>
            {verse.subtitle && (
              <p className="text-amber-400/90 text-sm sm:text-base font-light italic">
                {verse.subtitle}
              </p>
            )}
          </div>

          {/* Sanskrit Devanagari */}
          <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-6 sm:p-8 text-center shadow-inner">
            <p className="font-sanskrit text-2xl sm:text-3xl text-amber-200 leading-loose whitespace-pre-line">
              {verse.body}
            </p>
          </div>

          {/* Transliteration */}
          {verse.transliteration && (
            <p className="text-stone-300 font-mono text-xs sm:text-sm text-center italic">
              {verse.transliteration}
            </p>
          )}

          {/* Meaning */}
          {verse.meaning && (
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-6 text-stone-100 text-base sm:text-lg leading-relaxed">
              <strong className="text-amber-300 block text-xs uppercase tracking-wider mb-2 font-mono">
                Essence & Guidance
              </strong>
              {verse.meaning}
            </div>
          )}

          {/* Commentary snippet */}
          {verse.commentary && (
            <div className="text-sm text-stone-300 leading-relaxed border-l-2 border-amber-500/40 pl-4 py-1">
              <p>{verse.commentary}</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => onOpenDetails(verse)}
              className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              Open Full Reading & Philosophical Analysis →
            </button>
          </div>
        </div>
      </div>

      {/* Daily Reflection prompt form */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-amber-300">
          <Feather className="w-5 h-5" />
          <h3 className="font-serif-sacred text-lg font-bold">
            Daily Contemplation Prompt
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-stone-400">
          "How can you apply this teaching to maintain inner serenity and focused action throughout today's activities?"
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <textarea
            rows={4}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Record your morning intention or evening contemplation..."
            className="w-full bg-stone-950/80 border border-stone-800 rounded-2xl p-4 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-sm leading-relaxed"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Entries will appear in your Wisdom Journal tab.
            </span>

            <button
              type="submit"
              disabled={!reflection.trim()}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Feather className="w-4 h-4" />
              <span>Record Reflection</span>
            </button>
          </div>

          {saved && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Your contemplation has been saved into your Wisdom Journal!</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
