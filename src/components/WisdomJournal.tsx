import React, { useState } from "react";
import {
  Feather,
  Trash2,
  Calendar,
  BookOpen,
  Search,
  BookmarkCheck,
  Edit3,
  Check,
  X,
  Download,
  Copy,
  CheckCheck,
  Share2,
} from "lucide-react";
import type { JournalEntry, ContentItem } from "../types";
import { soundEngine } from "../utils/audio";

interface WisdomJournalProps {
  entries: JournalEntry[];
  bookmarks: string[];
  allVerses: ContentItem[];
  onDeleteEntry: (id: string) => void;
  onEditEntry?: (id: string, newNote: string) => void;
  onOpenVerse: (verse: ContentItem) => void;
  onToggleBookmark: (verseId: string) => void;
}

export const WisdomJournal: React.FC<WisdomJournalProps> = ({
  entries,
  bookmarks,
  allVerses,
  onDeleteEntry,
  onEditEntry,
  onOpenVerse,
  onToggleBookmark,
}) => {
  const [activeView, setActiveView] = useState<"reflections" | "bookmarks">("reflections");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const bookmarkedVerses = allVerses.filter((v) => bookmarks.includes(v.id));

  const filteredEntries = entries.filter(
    (e) =>
      e.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.verseTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditingText(entry.note);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return;
    if (onEditEntry) {
      onEditEntry(id, editingText.trim());
    }
    soundEngine.playTempleBell(330);
    setEditingId(null);
    setToastMessage("Reflection updated successfully.");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExportJournal = () => {
    soundEngine.playTempleBell(220);
    const content = `# SutraSparsh · Sādhana Wisdom Journal
Exported on: ${new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}

Total Reflections: ${entries.length}
Total Saved Verses: ${bookmarks.length}

---

## My Contemplations & Notes

${entries
  .map(
    (e, idx) => `### ${idx + 1}. ${e.verseTitle}
*Date: ${new Date(e.createdAt).toLocaleString()}*

> ${e.note.replace(/\n/g, "\n> ")}

---`
  )
  .join("\n\n")}

## Saved Sacred Verses

${bookmarkedVerses
  .map(
    (v, idx) => `### ${idx + 1}. ${v.title} (${v.metadata.source})
**Sanskrit:**
${v.body}

**Meaning:**
${v.meaning || "—"}

---`
  )
  .join("\n\n")}
`;

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SutraSparsh-Wisdom-Journal-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage("Wisdom Journal exported as Markdown file.");
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleCopyJournalText = () => {
    const text = entries
      .map(
        (e) =>
          `[${new Date(e.createdAt).toLocaleDateString()}] ${e.verseTitle}:\n"${e.note}"`
      )
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    setCopiedStatus(true);
    soundEngine.playTempleBell(440);
    setTimeout(() => setCopiedStatus(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs rounded-full shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header & Sub-nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <h2 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-amber-100">
            Wisdom Journal & Bookmarks
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Review, edit, and export your spiritual reflections and saved sacred verses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action Buttons */}
          {entries.length > 0 && (
            <div className="flex items-center space-x-1.5 mr-2">
              <button
                onClick={handleExportJournal}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 border border-stone-800 text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/10 flex items-center space-x-1.5 transition-all"
                title="Export as Markdown / Backup"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Journal</span>
              </button>
              <button
                onClick={handleCopyJournalText}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 border border-stone-800 text-stone-300 hover:text-stone-100 flex items-center space-x-1.5 transition-all"
                title="Copy all reflections to clipboard"
              >
                {copiedStatus ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy All</span>
                  </>
                )}
              </button>
            </div>
          )}

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
                const isEditing = editingId === entry.id;

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

                        {!isEditing && (
                          <button
                            onClick={() => handleStartEdit(entry)}
                            className="p-1 text-stone-500 hover:text-amber-300 transition-colors"
                            title="Edit reflection"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="p-1 text-stone-500 hover:text-rose-400 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 pt-1">
                        <textarea
                          rows={4}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-3 bg-stone-950 border border-amber-500/50 rounded-xl text-stone-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 leading-relaxed resize-none"
                        />
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 text-stone-300 hover:bg-stone-700 flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                          <button
                            onClick={() => handleSaveEdit(entry.id)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 flex items-center space-x-1 shadow"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-stone-200 text-sm leading-relaxed whitespace-pre-line">
                        {entry.note}
                      </p>
                    )}

                    {linkedVerse && !isEditing && (
                      <div className="pt-2">
                        <button
                          onClick={() => onOpenVerse(linkedVerse)}
                          className="text-[11px] text-amber-400/80 hover:text-amber-300 flex items-center space-x-1 font-semibold"
                        >
                          <span>View Verse Details</span>
                          <span>→</span>
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
                  className="bg-stone-900/70 border border-stone-800 rounded-2xl p-5 hover:border-amber-500/40 transition-colors cursor-pointer space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-400">
                        {verse.metadata.author || verse.metadata.source || "Scripture"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(verse.id);
                        }}
                        className="text-amber-400 hover:text-rose-400 p-1"
                        title="Remove Bookmark"
                      >
                        <BookmarkCheck className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-serif-sacred font-bold text-stone-100 text-base">
                      {verse.title}
                    </h4>

                    <p className="font-sanskrit text-amber-200/90 text-sm line-clamp-2 leading-relaxed">
                      {verse.body}
                    </p>

                    <p className="text-xs text-stone-400 line-clamp-2">
                      {verse.meaning}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs text-amber-400/90">
                    <span className="text-[11px] text-stone-500">{verse.metadata.category || "Scripture"}</span>
                    <span className="font-bold">Study Verse →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
