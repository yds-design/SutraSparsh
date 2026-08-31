import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Flame,
  Bookmark,
  BookOpen,
  Feather,
  Sun,
  Compass,
  Crown,
  Heart,
  Share2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Zap,
  Volume2,
  Trash2,
  Plus,
  Copy,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type { ContentItem, JournalEntry } from "../types";
import { soundEngine } from "../utils/audio";
import { progressService, type StreakData } from "../services/progress.service";

interface MyJourneyViewProps {
  verses: ContentItem[];
  bookmarks: string[];
  journalEntries: JournalEntry[];
  onToggleBookmark: (id: string) => void;
  onSaveJournalNote: (verseId: string, verseTitle: string, note: string) => void;
  onDeleteJournalEntry: (id: string) => void;
  onOpenVerseModal: (verse: ContentItem) => void;
  onOpenPricing: () => void;
  onOpenDonation: () => void;
  onNavigateTab: (tab: "today" | "explore" | "search" | "my-journey") => void;
}

export const MyJourneyView: React.FC<MyJourneyViewProps> = ({
  verses,
  bookmarks,
  journalEntries,
  onToggleBookmark,
  onSaveJournalNote,
  onDeleteJournalEntry,
  onOpenVerseModal,
  onOpenPricing,
  onOpenDonation,
  onNavigateTab,
}) => {
  const [subSection, setSubSection] = useState<
    "overview" | "saved" | "reflections" | "recommendations" | "membership" | "advocacy"
  >("overview");

  const [newReflectionText, setNewReflectionText] = useState("");
  const [selectedVerseForReflection, setSelectedVerseForReflection] = useState<string>(
    verses.length > 0 ? verses[0].id : ""
  );
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  const [streakData, setStreakData] = useState<StreakData>(() => progressService.getStreakData());

  useEffect(() => {
    const unsub = progressService.subscribeStreak((streak) => {
      setStreakData(streak);
    });
    return unsub;
  }, []);

  // Filter bookmarked verses
  const savedVersesList = verses.filter((v) => bookmarks.includes(v.id));

  // Last active verse for "Continue Reading"
  const lastActiveVerse = savedVersesList.length > 0 ? savedVersesList[0] : (verses.length > 0 ? verses[0] : null);

  // Recommendations based on habits
  const recommendedVerses = verses.filter((v) => !bookmarks.includes(v.id)).slice(0, 3);

  const handleCreateReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReflectionText.trim()) return;
    const targetVerse = verses.find((v) => v.id === selectedVerseForReflection) || verses[0];
    onSaveJournalNote(targetVerse.id, targetVerse.title, newReflectionText.trim());
    setNewReflectionText("");
    setNotification("Sacred reflection saved to your journal.");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopyWisdomCard = (verse: ContentItem) => {
    const shareText = `"${verse.body}"\n\n${verse.meaning || ""}\n— ${verse.title}\n\nExplore timeless Sanskrit wisdom on SutraSparsh: https://sutrasparsh.com/verse/${verse.id}`;
    navigator.clipboard.writeText(shareText);
    setCopiedCardId(verse.id);
    setNotification(`Sacred Wisdom Card for "${verse.title}" copied to clipboard.`);
    setTimeout(() => {
      setCopiedCardId(null);
      setNotification(null);
    }, 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Journey Banner & Philosophy Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Personal Sanctuary • मेरी साधना</span>
            </div>
            <h1 className="font-serif-sacred text-2xl sm:text-4xl font-bold text-amber-100">
              My Sacred Journey
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed">
              Where timeless Sanskrit wisdom transforms into personal daily practice. Track your habit, review saved verses, journal contemplations, and deepen your spiritual journey.
            </p>
          </div>

          {/* Sādhana Habit Signals (Dynamic Streak) */}
          <div className="flex items-center gap-3 bg-stone-950/80 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-600/30 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Flame className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono text-2xl font-bold text-amber-200">{streakData.currentStreak}</span>
                <span className="text-xs font-bold text-amber-400">Days</span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium">
                {streakData.checkedInToday ? "Consecutive Sādhana Active" : "Daily Sādhana Check-in Ready"}
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs inside My Journey */}
        <div className="mt-8 pt-6 border-t border-stone-800/80 flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setSubSection("overview")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
              subSection === "overview"
                ? "bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Practice & Habits</span>
          </button>

          <button
            onClick={() => setSubSection("saved")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
              subSection === "saved"
                ? "bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Saved Wisdom ({savedVersesList.length})</span>
          </button>

          <button
            onClick={() => setSubSection("reflections")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
              subSection === "reflections"
                ? "bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            }`}
          >
            <Feather className="w-4 h-4 text-amber-400" />
            <span>Reflections & Journal ({journalEntries.length})</span>
          </button>

          <button
            onClick={() => setSubSection("recommendations")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
              subSection === "recommendations"
                ? "bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Recommendations</span>
          </button>

          <button
            onClick={() => setSubSection("membership")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
              subSection === "membership"
                ? "bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-200 border border-amber-400/40 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Membership & Seva</span>
          </button>

          <button
            onClick={() => setSubSection("advocacy")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
              subSection === "advocacy"
                ? "bg-teal-500/20 text-teal-200 border border-teal-400/40 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            }`}
          >
            <Share2 className="w-4 h-4 text-teal-400" />
            <span>Wisdom Cards & Share</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 shadow-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* SECTION 1: PRACTICE & HABITS OVERVIEW */}
      {subSection === "overview" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Continue Reading Card */}
          {lastActiveVerse && (
            <div className="bg-stone-900/60 border border-amber-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4 mb-4">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Continue Where You Left Off</span>
                </div>
                <span className="text-[11px] font-mono text-stone-500">Last Active: Today</span>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif-sacred text-xl sm:text-2xl font-bold text-amber-100">
                  {lastActiveVerse.title}
                </h3>
                <p className="font-sanskrit text-lg text-amber-200/90 whitespace-pre-line leading-relaxed">
                  {lastActiveVerse.body}
                </p>
                {lastActiveVerse.meaning && (
                  <p className="text-stone-300 text-xs sm:text-sm italic line-clamp-2">
                    "{lastActiveVerse.meaning}"
                  </p>
                )}

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onOpenVerseModal(lastActiveVerse)}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs shadow-lg hover:scale-105 transition-all"
                  >
                    <span>Resume Contemplation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigateTab("today")}
                    className="px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 text-stone-300 text-xs transition-colors"
                  >
                    Explore Today's Shloka
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Habit Formation Statistics Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-stone-400 text-xs">
                <span>Total Contemplations</span>
                <BookOpen className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-mono text-2xl font-bold text-amber-200">28</div>
              <p className="text-[11px] text-stone-500">Verses read and reflected upon</p>
            </div>

            <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-stone-400 text-xs">
                <span>Saved to Sanctuary</span>
                <Bookmark className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-mono text-2xl font-bold text-amber-200">{bookmarks.length}</div>
              <p className="text-[11px] text-stone-500">Sacred verses bookmarked</p>
            </div>

            <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-stone-400 text-xs">
                <span>Journal Entries</span>
                <Feather className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-mono text-2xl font-bold text-amber-200">{journalEntries.length}</div>
              <p className="text-[11px] text-stone-500">Personal reflections logged</p>
            </div>

            <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-stone-400 text-xs">
                <span>Habit Tier</span>
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div className="font-mono text-lg font-bold text-orange-300">
                {streakData.currentStreak >= 21
                  ? "Siddha Sādhaka"
                  : streakData.currentStreak >= 7
                  ? "Sādhana Seeker"
                  : streakData.currentStreak >= 3
                  ? "Daily Abhyāsi"
                  : "Prārambhik"}
              </div>
              <p className="text-[11px] text-stone-500">
                {streakData.currentStreak >= 7
                  ? `Consistent ${streakData.currentStreak}+ days practice`
                  : `${streakData.currentStreak} day streak active`}
              </p>
            </div>
          </div>

          {/* Value Recognition Prompt */}
          <div className="bg-gradient-to-r from-amber-950/30 via-stone-900 to-stone-950 border border-amber-500/20 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-serif-sacred font-bold text-amber-100 text-sm sm:text-base">
                "SutraSparsh has become part of my daily spiritual practice."
              </span>
              <p className="text-xs text-stone-400">
                Deepen your journey with full audios, guided study paths, and offline chanting under Sādhaka Membership.
              </p>
            </div>
            <button
              onClick={() => setSubSection("membership")}
              className="shrink-0 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all"
            >
              Explore Membership & Seva →
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: SAVED WISDOM & BOOKMARKS */}
      {subSection === "saved" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-sacred text-xl font-bold text-amber-100">
              Saved Verses & Sacred Passages
            </h2>
            <span className="text-xs text-stone-400">{savedVersesList.length} verses in sanctuary</span>
          </div>

          {savedVersesList.length === 0 ? (
            <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-12 text-center space-y-4">
              <Bookmark className="w-10 h-10 text-stone-600 mx-auto" />
              <p className="text-stone-400 text-sm">You have not bookmarked any verses yet.</p>
              <button
                onClick={() => onNavigateTab("explore")}
                className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold hover:bg-amber-500/30 transition-all"
              >
                Browse Sacred Corpus →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedVersesList.map((verse) => (
                <div
                  key={verse.id}
                  className="bg-stone-900/60 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif-sacred font-bold text-amber-100 text-sm">
                        {verse.title}
                      </span>
                      <button
                        onClick={() => onToggleBookmark(verse.id)}
                        className="text-amber-400 hover:text-rose-400 transition-colors p-1"
                        title="Remove bookmark"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <p className="font-sanskrit text-amber-200 text-sm whitespace-pre-line line-clamp-3">
                      {verse.body}
                    </p>

                    {verse.meaning && (
                      <p className="text-stone-400 text-xs italic line-clamp-2">
                        "{verse.meaning}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenVerseModal(verse)}
                      className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                    >
                      <span>Read Commentary</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyWisdomCard(verse)}
                      className="text-stone-400 hover:text-stone-200 flex items-center space-x-1"
                      title="Share Quote"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: REFLECTIONS & SPIRITUAL JOURNAL */}
      {subSection === "reflections" && (
        <div className="space-y-6 animate-fadeIn">
          {/* New Reflection Composer */}
          <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Feather className="w-4 h-4" />
              <span>Record Daily Contemplation • स्वाध्याय</span>
            </div>

            <form onSubmit={handleCreateReflection} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">
                  Connect Reflection to Sacred Verse:
                </label>
                <select
                  value={selectedVerseForReflection}
                  onChange={(e) => setSelectedVerseForReflection(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60"
                >
                  {verses.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title} — {v.metadata.category || "Scripture"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">
                  Your Personal Contemplation:
                </label>
                <textarea
                  rows={3}
                  value={newReflectionText}
                  onChange={(e) => setNewReflectionText(e.target.value)}
                  placeholder="How does this shloka apply to your mind, work, or inner stillness today?"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newReflectionText.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs shadow hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Reflection</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Reflections */}
          <div className="space-y-4">
            <h3 className="font-serif-sacred text-lg font-bold text-amber-100">
              Journal Entries ({journalEntries.length})
            </h3>

            {journalEntries.length === 0 ? (
              <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-8 text-center text-stone-400 text-xs">
                No reflections recorded yet. Use the composer above to begin your spiritual journaling habit.
              </div>
            ) : (
              <div className="space-y-3">
                {journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-stone-900/50 border border-stone-800 rounded-2xl p-5 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif-sacred font-bold text-amber-300">
                        {entry.verseTitle}
                      </span>
                      <div className="flex items-center space-x-3 text-stone-500 text-[11px]">
                        <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => onDeleteJournalEntry(entry.id)}
                          className="text-stone-500 hover:text-rose-400 p-1"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-stone-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      {entry.note}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: RECOMMENDATIONS */}
      {subSection === "recommendations" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h2 className="font-serif-sacred text-xl font-bold text-amber-100">
              Personalized Wisdom Recommendations
            </h2>
            <p className="text-xs text-stone-400">
              Curated based on your reflection themes, tradition preferences, and daily reading habit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedVerses.map((verse) => (
              <div
                key={verse.id}
                className="bg-stone-900/60 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Recommended
                    </span>
                    <button
                      onClick={() => onToggleBookmark(verse.id)}
                      className="text-stone-400 hover:text-amber-400 p-1"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="font-serif-sacred font-bold text-amber-100 text-sm">
                    {verse.title}
                  </h4>

                  <p className="font-sanskrit text-amber-200 text-xs whitespace-pre-line line-clamp-3">
                    {verse.body}
                  </p>

                  {verse.meaning && (
                    <p className="text-stone-400 text-xs italic line-clamp-2">
                      "{verse.meaning}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onOpenVerseModal(verse)}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                  >
                    <span>Read Shloka</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: MEMBERSHIP & SEVA (30% BUSINESS LAYER PRESENTED NATURALLY) */}
      {subSection === "membership" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Sādhaka & Rishi Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sādhaka Membership */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider">
                    <Crown className="w-4 h-4" />
                    <span>Sādhaka Membership</span>
                  </div>
                  <h3 className="font-serif-sacred text-2xl font-bold text-amber-100">
                    Deepen Your Daily Practice
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono text-2xl font-bold text-amber-300">₹199</span>
                  <span className="text-xs text-stone-400">/mo</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Full Sanskrit audio chants with variable tempo pronunciation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Complete Shankaracharya & Ramanuja comparative commentaries</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Offline study downloads for contemplative meditation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Unlimited journal sync across devices</span>
                </li>
              </ul>

              <button
                onClick={onOpenPricing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs shadow-lg hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Begin Sādhaka Practice →</span>
              </button>
            </div>

            {/* Sacred Gurudakshina / Seva (80G Tax Exemption) */}
            <div className="bg-gradient-to-br from-rose-950/20 via-stone-900 to-stone-950 border border-rose-800/40 rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono uppercase tracking-wider">
                    <Heart className="w-4 h-4 fill-rose-400/20" />
                    <span>Sacred Seva & Gurudakshina</span>
                  </div>
                  <h3 className="font-serif-sacred text-2xl font-bold text-rose-100">
                    Preserve Vedic Heritage
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    80G Tax Exempt
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                Support the scholarly digitization, audio chanting archival, and free open access of ancient Sanskrit wisdom for seekers worldwide.
              </p>

              <ul className="space-y-2.5 text-xs text-stone-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Instant 80G Tax Exemption receipt generation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Preserves endangered Vedic manuscripts & chanting oral traditions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Transparent ashram & scholarship allocation</span>
                </li>
              </ul>

              <button
                onClick={onOpenDonation}
                className="w-full py-3 rounded-xl bg-rose-950/80 border border-rose-700/80 text-rose-200 hover:bg-rose-900 font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <Heart className="w-4 h-4 text-rose-400 fill-current" />
                <span>Offer Seva / Gurudakshina →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: WISDOM CARDS & ADVOCACY LOOP */}
      {subSection === "advocacy" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h2 className="font-serif-sacred text-xl font-bold text-amber-100">
              Sacred Wisdom Cards & Advocacy
            </h2>
            <p className="text-xs text-stone-400">
              Share authentic Sanskrit shlokas and translations with fellow seekers. Bring wisdom to the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {verses.slice(0, 4).map((verse) => (
              <div
                key={verse.id}
                className="bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl relative"
              >
                <div className="flex items-center justify-between text-xs text-amber-400 border-b border-stone-800 pb-3">
                  <div className="flex items-center space-x-1.5 font-serif-sacred font-bold">
                    <span>ॐ</span>
                    <span>SutraSparsh Sacred Card</span>
                  </div>
                  <span className="font-mono text-[10px] text-stone-500">{verse.title}</span>
                </div>

                <div className="text-center py-2 space-y-2">
                  <p className="font-sanskrit text-lg sm:text-xl text-amber-200 leading-loose whitespace-pre-line">
                    {verse.body}
                  </p>
                  {verse.transliteration && (
                    <p className="font-serif text-xs text-amber-400/80 italic">
                      {verse.transliteration}
                    </p>
                  )}
                  {verse.meaning && (
                    <p className="text-stone-300 text-xs leading-relaxed pt-2 border-t border-stone-800/60">
                      "{verse.meaning}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500 font-mono">sutrasparsh.com</span>
                  <button
                    onClick={() => handleCopyWisdomCard(verse)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 text-xs font-semibold transition-all"
                  >
                    {copiedCardId === verse.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied Card!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Quote Card</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
