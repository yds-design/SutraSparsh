import React, { useState } from "react";
import { Feather, Trash2, Calendar, BookOpen, Search, BookmarkCheck } from "lucide-react";
import type { JournalEntry, ContentItem } from "../types";

interface WisdomJournalProps {
  entries: JournalEntry[];
  bookmarks: string[];
  allVerses: ContentItem[];
  onDeleteEntry: (id: string) => void;
  onOpenVerse: (verse: ContentItem) => void;
  onToggleBookmark: (verseId: string) => void;
}

export const WisdomJournal: React.FC<WisdomJournalProps> = ({
  entries,
  bookmarks,
  allVerses,
  onDeleteEntry,
  onOpenVerse,
  onToggleBookmark,
}) => {
  const [activeView, setActiveView] = useState<"reflections" | "bookmarks">("reflections");
  const [searchTerm, setSearchTerm] = useState("");

  const bookmarkedVerses = allVerses.filter((v) => bookmarks.includes(v.id));

  const filteredEntries = entries.filter(
    (e) =>
      e.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.verseTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header & Sub-nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <h2 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100">
            Wisdom Journal & Bookmarks
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Review your personal reflections and saved sacred verses.
          </p>
        </div>

        <div className="flex bg-stone-900 border border-stone-800 rounded-xl p-1">
          <button
            onClick={() => setActiveView("reflections")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${
              activeView === "reflections"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/30 shadow-sm"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Reflections ({entries.length})</span>
          </button>

          <button
            onClick={() => setActiveView("bookmarks")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 ${
              activeView === "bookmarks"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/30 shadow-sm"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Saved Verses ({bookmarks.length})</span>
          </button>
        </div>
      </div>

      {activeView === "reflections" && (
        <div className="space-y-6">
          {/* Search bar */}
          {entries.length > 0 && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="text"
                placeholder="Search within your reflections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-11 pr-4 py-3 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-sm"
              />
            </div>
          )}

          {filteredEntries.length === 0 ? (
            <div className="text-center py-16 bg-stone-900/40 border border-stone-800/80 rounded-3xl p-8 space-y-4">
              <Feather className="w-12 h-12 text-stone-600 mx-auto" />
              <h4 className="text-base font-bold text-stone-300">
                {entries.length === 0
                  ? "No reflections recorded yet"
                  : "No reflections match your search"}
              </h4>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Explore verses in the Sacred Explorer or Daily Sutra tab and write down your insights to build your spiritual diary.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => {
                const linkedVerse = allVerses.find((v) => v.id === entry.verseId);
                return (
                  <div
                    key={entry.id}
                    className="bg-stone-900/70 border border-stone-800 rounded-2xl p-6 space-y-3 hover:border-stone-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-stone-800/60 pb-3">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        <span
                          onClick={() => linkedVerse && onOpenVerse(linkedVerse)}
                          className="font-serif-sacred font-bold text-amber-200 text-sm cursor-pointer hover:underline"
                        >
                          {entry.verseTitle}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-stone-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(entry.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="p-1 text-stone-500 hover:text-rose-400 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-stone-200 text-sm leading-relaxed whitespace-pre-line">
                      {entry.note}
                    </p>

                    {linkedVerse && (
                      <div className="pt-2">
                        <button
                          onClick={() => onOpenVerse(linkedVerse)}
                          className="text-[11px] text-amber-400/80 hover:text-amber-300"
                        >
                          View Verse Details →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeView === "bookmarks" && (
        <div className="space-y-4">
          {bookmarkedVerses.length === 0 ? (
            <div className="text-center py-16 bg-stone-900/40 border border-stone-800/80 rounded-3xl p-8 space-y-4">
              <BookmarkCheck className="w-12 h-12 text-stone-600 mx-auto" />
              <h4 className="text-base font-bold text-stone-300">
                No bookmarked verses yet
              </h4>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Click the bookmark icon on any verse card to save it for quick reference and regular chanting practice.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarkedVerses.map((verse) => (
                <div
                  key={verse.id}
                  onClick={() => onOpenVerse(verse)}
                  className="bg-stone-900/70 border border-stone-800 rounded-2xl p-5 hover:border-amber-500/40 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-400">
                      {verse.metadata.author || "Scripture"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(verse.id);
                      }}
                      className="text-amber-400 hover:text-rose-400"
                      title="Remove Bookmark"
                    >
                      <BookmarkCheck className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="font-serif-sacred font-bold text-stone-100 text-base">
                    {verse.title}
                  </h4>

                  <p className="font-sanskrit text-amber-200/90 text-sm line-clamp-2">
                    {verse.body}
                  </p>

                  <p className="text-xs text-stone-400 line-clamp-2">
                    {verse.meaning}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
