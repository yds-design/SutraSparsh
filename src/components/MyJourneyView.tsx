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
  Clock,
  Target,
  Award,
} from "lucide-react";
import type { ContentItem, JournalEntry } from "../types";
import type { ReadingProgress } from "../types/progress";
import { soundEngine } from "../utils/audio";
import { progressService, type StreakData } from "../services/progress.service";
import { useFeatureFlags } from "../services/feature-flags.service";
import { StreakFireCounter } from "./StreakFireCounter";
import { CloudSyncStatusBadge } from "./CloudSyncStatusBadge";

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
  onManualSync?: () => void;
  theme?: "sandstone" | "amethyst" | "light" | "festival" | "golden-hour" | "prism-pulse";
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
  onManualSync,
  theme: propTheme,
}) => {
  const currentTheme =
    propTheme ||
    (typeof window !== "undefined"
      ? (localStorage.getItem("sutrasparsh_theme") as any) || "sandstone"
      : "sandstone");

  const isLight = currentTheme === "light";
  const isFestival = currentTheme === "festival";
  const isAmethyst = currentTheme === "amethyst";
  const isGoldenHour = currentTheme === "golden-hour";
  const isPrismPulse = currentTheme === "prism-pulse";
  const isLightCanvas = isLight || isPrismPulse;
  const { isSadhakaEnabled, isGurudakshinaEnabled } = useFeatureFlags();

  const bannerBgClass = isLightCanvas
    ? isPrismPulse
      ? "bg-white border-stone-200 text-[#1e1b2e] shadow-xs"
      : "bg-white border-stone-200 text-stone-900 shadow-md"
    : isFestival
    ? "bg-[#450A12]/90 border-[#FF8A00]/30 text-[#FFF6E3] shadow-2xl"
    : isAmethyst
    ? "bg-[#180C2C]/90 border-[#52297A]/40 text-[#EDE0F8] shadow-2xl"
    : isGoldenHour
    ? "bg-[#281B12]/90 border-[#C9822B]/35 text-[#FFF4D8] shadow-2xl"
    : "bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border-amber-500/30 text-stone-100 shadow-2xl";

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
  const [currentProgress, setCurrentProgress] = useState<ReadingProgress | null>(() =>
    progressService.getCurrentResumePoint()
  );
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("sutrasparsh_daily_goal_minutes");
      return saved ? parseInt(saved, 10) : 15;
    } catch {
      return 15;
    }
  });

  useEffect(() => {
    const unsubStreak = progressService.subscribeStreak((streak) => {
      setStreakData(streak);
    });
    const unsubProgress = progressService.subscribe((progress) => {
      setCurrentProgress(progress);
    });
    return () => {
      unsubStreak();
      unsubProgress();
    };
  }, []);

  const handleSelectDailyGoal = (mins: number) => {
    setDailyGoalMinutes(mins);
    try {
      localStorage.setItem("sutrasparsh_daily_goal_minutes", mins.toString());
    } catch {}
    soundEngine.playTempleBell(330);
    setNotification(`Daily Sādhana Goal set to ${mins} minutes.`);
    setTimeout(() => setNotification(null), 2500);
  };

  // Aggregated reading time calculation using progressService data
  const allProgressItems = progressService.getAllProgress();
  const totalSecondsLogged = allProgressItems.reduce(
    (sum, p) => sum + (p.totalTimeSpentSeconds || 0),
    0
  );
  const readingTimeMinutes = Math.max(
    Math.round(totalSecondsLogged / 60),
    currentProgress ? Math.round((currentProgress.totalTimeSpentSeconds || 420) / 60) : 7
  );
  const goalPercentage = Math.min(100, Math.round((readingTimeMinutes / dailyGoalMinutes) * 100));
  const isGoalCompleted = readingTimeMinutes >= dailyGoalMinutes;

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
      <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-10 ${bannerBgClass}`}>
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-amber-500 text-xs font-mono uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Personal Sanctuary • मेरी साधना</span>
            </div>
            <h1
              className={`font-serif-sacred text-2xl sm:text-4xl font-bold ${
                isLightCanvas
                  ? isPrismPulse
                    ? "text-[#1e1b2e]"
                    : "text-[#221509]"
                  : "text-amber-100"
              }`}
            >
              My Sacred Journey
            </h1>
            <p
              className={`text-xs sm:text-sm font-light leading-relaxed ${
                isLightCanvas
                  ? isPrismPulse
                    ? "text-stone-600"
                    : "text-[#5C4533]"
                  : "text-stone-300"
              }`}
            >
              Where timeless Sanskrit wisdom transforms into personal daily practice. Track your habit, review saved verses, journal contemplations, and deepen your spiritual journey.
            </p>
          </div>

          {/* Sādhana Habit Signals (Dynamic Streak with Fire Pulse Animation) */}
          <StreakFireCounter
            variant="card"
            streakData={streakData}
            isLight={isLightCanvas}
            onCheckin={() => {
              progressService.triggerMilestoneCheckin();
            }}
          />
        </div>

        {/* Sub-Navigation Tabs inside My Journey */}
        <div
          className={`mt-8 pt-6 border-t flex flex-wrap gap-2 text-xs ${
            isLightCanvas ? "border-stone-200" : "border-stone-800/80"
          }`}
        >
          <button
            onClick={() => setSubSection("overview")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
              subSection === "overview"
                ? isLightCanvas
                  ? isPrismPulse
                    ? "bg-[#936BFA]/15 text-[#6D28D9] border border-[#936BFA]/40 shadow-xs font-semibold"
                    : "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm font-semibold"
                  : "bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm"
                : isLightCanvas
                ? "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Practice & Habits</span>
          </button>

          <button
            onClick={() => setSubSection("saved")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
              subSection === "saved"
                ? isLightCanvas
                  ? isPrismPulse
                    ? "bg-[#936BFA]/15 text-[#6D28D9] border border-[#936BFA]/40 shadow-xs font-semibold"
                    : "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm font-semibold"
                  : "bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm"
                : isLightCanvas
                ? "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>Saved Wisdom ({savedVersesList.length})</span>
          </button>

          <button
            onClick={() => setSubSection("reflections")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
              subSection === "reflections"
                ? isLightCanvas
                  ? isPrismPulse
                    ? "bg-[#936BFA]/15 text-[#6D28D9] border border-[#936BFA]/40 shadow-xs font-semibold"
                    : "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm font-semibold"
                  : "bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm"
                : isLightCanvas
                ? "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            }`}
          >
            <Feather className="w-4 h-4 text-amber-500" />
            <span>Reflections & Journal ({journalEntries.length})</span>
          </button>

          <button
            onClick={() => setSubSection("recommendations")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
              subSection === "recommendations"
                ? isLightCanvas
                  ? isPrismPulse
                    ? "bg-[#936BFA]/15 text-[#6D28D9] border border-[#936BFA]/40 shadow-xs font-semibold"
                    : "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm font-semibold"
                  : "bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm"
                : isLightCanvas
                ? "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Recommendations</span>
          </button>

          {(isSadhakaEnabled || isGurudakshinaEnabled) && (
            <button
              onClick={() => setSubSection("membership")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                subSection === "membership"
                  ? isLightCanvas
                    ? isPrismPulse
                      ? "bg-[#936BFA]/15 text-[#6D28D9] border border-[#936BFA]/40 shadow-xs font-semibold"
                      : "bg-amber-100 text-amber-900 border border-amber-400 shadow-sm font-semibold"
                    : "bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-200 border border-amber-400/40 shadow-sm"
                  : isLightCanvas
                  ? "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Membership & Seva</span>
            </button>
          )}

          <button
            onClick={() => setSubSection("advocacy")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
              subSection === "advocacy"
                ? isLightCanvas
                  ? "bg-teal-500/15 text-teal-800 border border-teal-300 shadow-xs font-semibold"
                  : "bg-teal-500/20 text-teal-200 border border-teal-400/40 shadow-sm"
                : isLightCanvas
                ? "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
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
            <div
              className={`rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border transition-all ${
                isLightCanvas
                  ? isPrismPulse
                    ? "bg-white border-stone-200 text-[#1e1b2e] shadow-xs"
                    : "bg-white border-stone-200 text-stone-900 shadow-md"
                  : isFestival
                  ? "bg-[#450A12]/90 border-[#FF8A00]/30 text-[#FFF6E3]"
                  : isAmethyst
                  ? "bg-[#180C2C]/90 border-[#52297A]/40 text-[#EDE0F8]"
                  : isGoldenHour
                  ? "bg-[#281B12]/90 border-[#C9822B]/35 text-[#FFF4D8]"
                  : "bg-stone-900/60 border-amber-500/30 text-stone-100"
              }`}
            >
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-4 ${
                  isLightCanvas ? "border-stone-200" : "border-stone-800/80"
                }`}
              >
                <div
                  className={`flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider ${
                    isLightCanvas
                      ? isPrismPulse
                        ? "text-[#7C3AED]"
                        : "text-amber-800"
                      : "text-amber-400"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Continue Where You Left Off</span>
                </div>
                <span className="text-[11px] font-mono text-stone-500">Last Active: Today</span>
              </div>

              <div className="space-y-3">
                <h3
                  className={`font-serif-sacred text-xl sm:text-2xl font-bold ${
                    isLightCanvas
                      ? isPrismPulse
                        ? "text-[#1e1b2e]"
                        : "text-[#221509]"
                      : "text-amber-100"
                  }`}
                >
                  {lastActiveVerse.title}
                </h3>
                <p
                  className={`font-sanskrit text-lg whitespace-pre-line leading-relaxed ${
                    isLightCanvas
                      ? isPrismPulse
                        ? "text-[#181326] font-bold"
                        : "text-[#1C0F05] font-semibold"
                      : "text-amber-200/90"
                  }`}
                >
                  {lastActiveVerse.body}
                </p>
                {lastActiveVerse.meaning && (
                  <p
                    className={`text-xs sm:text-sm italic leading-relaxed ${
                      isLightCanvas
                        ? isPrismPulse
                          ? "text-[#2d3748]"
                          : "text-[#5C4533]"
                        : "text-stone-300"
                    }`}
                  >
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
                    className={`px-4 py-2.5 rounded-xl border text-xs transition-colors ${
                      isLightCanvas
                        ? "bg-stone-100 border-stone-200 hover:border-amber-500/40 text-stone-800"
                        : "bg-stone-950 border border-stone-800 hover:border-amber-500/40 text-stone-300"
                    }`}
                  >
                    Explore Today's Shloka
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DAILY READING TIME GOAL RADIAL PROGRESS BAR (M53-M74 PROGRESS SERVICE) */}
          <div
            className={`rounded-3xl border p-6 sm:p-8 relative overflow-hidden shadow-xl transition-all ${
              isLightCanvas
                ? isPrismPulse
                  ? "bg-white border-stone-200 text-[#1e1b2e] shadow-xs"
                  : "bg-white border-stone-200 text-stone-900 shadow-md"
                : isFestival
                ? "bg-[#450A12]/80 border-[#FF8A00]/30 text-[#FFF6E3]"
                : isAmethyst
                ? "bg-[#180C2C]/80 border-[#52297A]/40 text-[#EDE0F8]"
                : isGoldenHour
                ? "bg-[#281B12]/80 border-[#C9822B]/35 text-[#FFF4D8]"
                : "bg-stone-900/60 border-amber-500/30 text-stone-100"
            }`}
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Radial Meter SVG */}
              <div className="flex items-center space-x-6">
                <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background Track Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      strokeWidth="10"
                      fill="transparent"
                      stroke={
                        isLightCanvas
                          ? "#EAE0D2"
                          : isFestival
                          ? "rgba(255, 138, 0, 0.15)"
                          : isAmethyst
                          ? "rgba(168, 85, 247, 0.15)"
                          : isGoldenHour
                          ? "rgba(201, 130, 43, 0.15)"
                          : "rgba(245, 158, 11, 0.15)"
                      }
                    />
                    {/* Animated Progress Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      strokeWidth="10"
                      strokeDasharray={301.59}
                      strokeDashoffset={301.59 - (goalPercentage / 100) * 301.59}
                      strokeLinecap="round"
                      fill="transparent"
                      stroke={
                        isGoalCompleted
                          ? "#10B981"
                          : isPrismPulse
                          ? "#936BFA"
                          : isFestival
                          ? "#FF8A00"
                          : isAmethyst
                          ? "#C084FC"
                          : isGoldenHour
                          ? "#E5983B"
                          : "#F59E0B"
                      }
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>

                  {/* Inside Center Metrics */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span
                      className={`font-mono text-lg font-extrabold ${
                        isGoalCompleted
                          ? "text-emerald-500"
                          : isLightCanvas
                          ? isPrismPulse
                            ? "text-[#6D28D9]"
                            : "text-stone-900"
                          : "text-amber-200"
                      }`}
                    >
                      {readingTimeMinutes}m
                    </span>
                    <span className="text-[10px] font-mono opacity-60">
                      of {dailyGoalMinutes}m
                    </span>
                    <span
                      className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full mt-0.5 ${
                        isGoalCompleted
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {goalPercentage}%
                    </span>
                  </div>
                </div>

                {/* Text Description */}
                <div className="space-y-1.5 max-w-sm">
                  <div
                    className={`flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider ${
                      isLightCanvas
                        ? isPrismPulse
                          ? "text-[#7C3AED]"
                          : "text-amber-800"
                        : "text-amber-500"
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span>Daily Svādhyāya Goal • दैनिक स्वाध्याय</span>
                  </div>
                  <h4
                    className={`font-serif-sacred text-lg font-bold ${
                      isLightCanvas
                        ? isPrismPulse
                          ? "text-[#1e1b2e]"
                          : "text-stone-900"
                        : "text-amber-100"
                    }`}
                  >
                    {isGoalCompleted
                      ? "Daily Contemplation Goal Achieved!"
                      : `${Math.max(1, dailyGoalMinutes - readingTimeMinutes)} min remaining today`}
                  </h4>
                  <p className="text-xs opacity-75 leading-relaxed">
                    {isGoalCompleted
                      ? "You have fulfilled your daily meditation vow. Continue reading to deepen insights."
                      : `Dedicated study time tracked in real-time from active scripture chanting and reading.`}
                  </p>
                  {currentProgress && (
                    <div className="text-[11px] font-mono text-amber-400/90 pt-1 flex items-center space-x-1 truncate">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">Active: {currentProgress.verseTitle}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Goal Target Adjuster Controls */}
              <div className="flex flex-col sm:items-end space-y-2.5 w-full lg:w-auto">
                <span className="text-[11px] font-semibold opacity-70 flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Set Daily Goal (Min/Day):</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {[10, 15, 20, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleSelectDailyGoal(mins)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                        dailyGoalMinutes === mins
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md scale-105"
                          : isLightCanvas
                          ? "bg-stone-100 hover:bg-stone-200 text-stone-800"
                          : "bg-stone-950 border border-stone-800 text-stone-300 hover:border-amber-500/40"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Habit Formation Statistics Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Contemplations",
                icon: BookOpen,
                value: "28",
                sub: "Verses read and reflected upon",
                color: "amber",
              },
              {
                label: "Saved to Sanctuary",
                icon: Bookmark,
                value: bookmarks.length,
                sub: "Sacred verses bookmarked",
                color: "amber",
              },
              {
                label: "Journal Entries",
                icon: Feather,
                value: journalEntries.length,
                sub: "Personal reflections logged",
                color: "amber",
              },
              {
                label: "Habit Tier",
                icon: Flame,
                value:
                  streakData.currentStreak >= 21
                    ? "Siddha Sādhaka"
                    : streakData.currentStreak >= 7
                    ? "Sādhana Seeker"
                    : streakData.currentStreak >= 3
                    ? "Daily Abhyāsi"
                    : "Prārambhik",
                sub:
                  streakData.currentStreak >= 7
                    ? `Consistent ${streakData.currentStreak}+ days practice`
                    : `${streakData.currentStreak} day streak active`,
                color: "orange",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`border rounded-2xl p-5 space-y-2 transition-all ${
                  isLightCanvas
                    ? isPrismPulse
                      ? "bg-white border-stone-200 text-[#1e1b2e] shadow-xs"
                      : "bg-white border-stone-200 text-stone-900 shadow-sm"
                    : isFestival
                    ? "bg-[#450A12]/60 border-[#FF8A00]/25 text-[#FFF6E3]"
                    : isAmethyst
                    ? "bg-[#180C2C]/60 border-[#52297A]/35 text-[#EDE0F8]"
                    : isGoldenHour
                    ? "bg-[#281B12]/60 border-[#C9822B]/30 text-[#FFF4D8]"
                    : "bg-stone-900/40 border-stone-800/80 text-stone-100"
                }`}
              >
                <div
                  className={`flex items-center justify-between text-xs ${
                    isLightCanvas ? "text-stone-600" : "text-stone-400"
                  }`}
                >
                  <span>{stat.label}</span>
                  <stat.icon
                    className={`w-4 h-4 ${
                      stat.color === "orange"
                        ? "text-orange-400"
                        : isLightCanvas && isPrismPulse
                        ? "text-[#7C3AED]"
                        : "text-amber-500"
                    }`}
                  />
                </div>
                <div
                  className={`font-mono text-2xl font-bold ${
                    stat.color === "orange"
                      ? "text-orange-400"
                      : isLightCanvas
                      ? isPrismPulse
                        ? "text-[#6D28D9]"
                        : "text-amber-800"
                      : "text-amber-200"
                  }`}
                >
                  {stat.value}
                </div>
                <p
                  className={`text-[11px] ${
                    isLightCanvas ? "text-stone-500" : "text-stone-500"
                  }`}
                >
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Value Recognition Prompt (Phase 2 Feature: Shown when membership or seva is active) */}
          {(isSadhakaEnabled || isGurudakshinaEnabled) && (
            <div
              className={`border rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
                isLightCanvas
                  ? isPrismPulse
                    ? "bg-white border-stone-200 text-[#1e1b2e] shadow-xs"
                    : "bg-white border-stone-200 text-stone-900 shadow-sm"
                  : isFestival
                  ? "bg-[#450A12]/80 border-[#FF8A00]/30 text-[#FFF6E3]"
                  : isAmethyst
                  ? "bg-[#180C2C]/80 border-[#52297A]/40 text-[#EDE0F8]"
                  : isGoldenHour
                  ? "bg-[#281B12]/80 border-[#C9822B]/35 text-[#FFF4D8]"
                  : "bg-stone-900/60 border-amber-500/30 text-stone-100"
              }`}
            >
              <div className="space-y-1">
                <span
                  className={`font-serif-sacred font-bold text-sm sm:text-base ${
                    isLightCanvas
                      ? isPrismPulse
                        ? "text-[#1e1b2e]"
                        : "text-stone-900"
                      : "text-amber-100"
                  }`}
                >
                  "SutraSparsh has become part of my daily spiritual practice."
                </span>
                <p className="text-xs opacity-75">
                  Deepen your journey with full audios, guided study paths, and offline chanting under Sādhaka Membership.
                </p>
              </div>
              <button
                onClick={() => setSubSection("membership")}
                className="shrink-0 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all"
              >
                Explore Membership & Seva →
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: SAVED WISDOM & BOOKMARKS */}
      {subSection === "saved" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Cloud Sync Status */}
          <CloudSyncStatusBadge onManualSync={onManualSync} />

          <div className="flex items-center justify-between">
            <h2
              className={`font-serif-sacred text-xl font-bold ${
                isLightCanvas
                  ? isPrismPulse
                    ? "text-[#1e1b2e]"
                    : "text-stone-900"
                  : "text-amber-100"
              }`}
            >
              Saved Verses & Sacred Passages
            </h2>
            <span className="text-xs opacity-60">{savedVersesList.length} verses in sanctuary</span>
          </div>

          {savedVersesList.length === 0 ? (
            <div
              className={`border rounded-3xl p-12 text-center space-y-4 ${
                isLightCanvas
                  ? "bg-white border-stone-200 text-stone-600 shadow-xs"
                  : "bg-stone-900/40 border-stone-800 text-stone-400"
              }`}
            >
              <Bookmark className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-sm">You have not bookmarked any verses yet.</p>
              <button
                onClick={() => onNavigateTab("explore")}
                className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 text-xs font-semibold hover:bg-amber-500/30 transition-all"
              >
                Browse Sacred Corpus →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedVersesList.map((verse) => (
                <div
                  key={verse.id}
                  className={`border rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between ${
                    isLightCanvas
                      ? isPrismPulse
                        ? "bg-white border-stone-200 text-[#1e1b2e] shadow-xs hover:border-[#7C3AED]/40"
                        : "bg-white border-stone-200 text-stone-900 shadow-sm hover:border-amber-500/40"
                      : isFestival
                      ? "bg-[#450A12]/80 border-[#FF8A00]/30 text-[#FFF6E3] hover:border-[#FF8A00]/60"
                      : isAmethyst
                      ? "bg-[#180C2C]/80 border-[#52297A]/40 text-[#EDE0F8] hover:border-[#C084FC]/40"
                      : isGoldenHour
                      ? "bg-[#281B12]/80 border-[#C9822B]/35 text-[#FFF4D8] hover:border-[#E5983B]/50"
                      : "bg-stone-900/60 border-stone-800 hover:border-amber-500/40 text-stone-100"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-serif-sacred font-bold text-sm ${
                          isLightCanvas
                            ? isPrismPulse
                              ? "text-[#1e1b2e]"
                              : "text-stone-900"
                            : "text-amber-100"
                        }`}
                      >
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

                    <p
                      className={`font-sanskrit text-sm whitespace-pre-line leading-relaxed ${
                        isLightCanvas
                          ? isPrismPulse
                            ? "text-[#181326] font-bold"
                            : "text-[#1C0F05] font-semibold"
                          : "text-amber-200"
                      }`}
                    >
                      {verse.body}
                    </p>

                    {verse.meaning && (
                      <p
                        className={`text-xs italic leading-relaxed ${
                          isLightCanvas
                            ? isPrismPulse
                              ? "text-[#4a5568]"
                              : "text-stone-600"
                            : "text-stone-300"
                        }`}
                      >
                        "{verse.meaning}"
                      </p>
                    )}
                  </div>

                  <div
                    className={`pt-3 border-t flex items-center justify-between text-xs ${
                      isLightCanvas ? "border-stone-200" : "border-stone-800/80"
                    }`}
                  >
                    <button
                      onClick={() => onOpenVerseModal(verse)}
                      className={`font-semibold flex items-center space-x-1 ${
                        isLightCanvas && isPrismPulse
                          ? "text-[#7C3AED] hover:text-[#6D28D9]"
                          : "text-amber-500 hover:text-amber-400"
                      }`}
                    >
                      <span>Read Commentary</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyWisdomCard(verse)}
                      className={`flex items-center space-x-1 transition-colors ${
                        isLightCanvas
                          ? "text-stone-500 hover:text-stone-800"
                          : "text-stone-400 hover:text-stone-200"
                      }`}
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
          {/* Cloud Sync Status */}
          <CloudSyncStatusBadge onManualSync={onManualSync} />

          {/* New Reflection Composer */}
          <div
            className={`border rounded-3xl p-6 space-y-4 ${
              isLightCanvas
                ? isPrismPulse
                  ? "bg-white border-stone-200 text-[#1e1b2e] shadow-xs"
                  : "bg-white border-stone-200 text-stone-900 shadow-sm"
                : isFestival
                ? "bg-[#450A12]/80 border-[#FF8A00]/30 text-[#FFF6E3]"
                : isAmethyst
                ? "bg-[#180C2C]/80 border-[#52297A]/40 text-[#EDE0F8]"
                : isGoldenHour
                ? "bg-[#281B12]/80 border-[#C9822B]/35 text-[#FFF4D8]"
                : "bg-stone-900/60 border-stone-800 text-stone-100"
            }`}
          >
            <div
              className={`flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider ${
                isLightCanvas
                  ? isPrismPulse
                    ? "text-[#7C3AED]"
                    : "text-amber-800"
                  : "text-amber-400"
              }`}
            >
              <Feather className="w-4 h-4" />
              <span>Record Daily Contemplation • स्वाध्याय</span>
            </div>

            <form onSubmit={handleCreateReflection} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-medium mb-1 ${
                    isLightCanvas ? "text-stone-700" : "text-stone-400"
                  }`}
                >
                  Connect Reflection to Sacred Verse:
                </label>
                <select
                  value={selectedVerseForReflection}
                  onChange={(e) => setSelectedVerseForReflection(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors ${
                    isLightCanvas
                      ? "bg-stone-50 border border-stone-300 text-stone-900 focus:border-amber-500"
                      : "bg-stone-950 border border-stone-800 text-stone-200 focus:border-amber-500/60"
                  }`}
                >
                  {verses.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title} — {v.metadata.category || "Scripture"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-xs font-medium mb-1 ${
                    isLightCanvas ? "text-stone-700" : "text-stone-400"
                  }`}
                >
                  Your Personal Contemplation:
                </label>
                <textarea
                  rows={3}
                  value={newReflectionText}
                  onChange={(e) => setNewReflectionText(e.target.value)}
                  placeholder="How does this shloka apply to your mind, work, or inner stillness today?"
                  className={`w-full rounded-xl p-3 text-xs focus:outline-none resize-none transition-colors ${
                    isLightCanvas
                      ? "bg-stone-50 border border-stone-300 text-stone-900 focus:border-amber-500"
                      : "bg-stone-950 border border-stone-800 text-stone-200 focus:border-amber-500/60"
                  }`}
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
            <h3
              className={`font-serif-sacred text-lg font-bold ${
                isLightCanvas
                  ? isPrismPulse
                    ? "text-[#1e1b2e]"
                    : "text-stone-900"
                  : "text-amber-100"
              }`}
            >
              Journal Entries ({journalEntries.length})
            </h3>

            {journalEntries.length === 0 ? (
              <div
                className={`border rounded-2xl p-8 text-center text-xs ${
                  isLightCanvas
                    ? "bg-white border-stone-200 text-stone-600 shadow-xs"
                    : "bg-stone-900/40 border-stone-800 text-stone-400"
                }`}
              >
                No reflections recorded yet. Use the composer above to begin your spiritual journaling habit.
              </div>
            ) : (
              <div className="space-y-3">
                {journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`border rounded-2xl p-5 space-y-2 relative transition-all ${
                      isLightCanvas
                        ? isPrismPulse
                          ? "bg-white border-stone-200 text-[#1e1b2e] shadow-xs"
                          : "bg-white border-stone-200 text-stone-900 shadow-sm"
                        : isFestival
                        ? "bg-[#450A12]/80 border-[#FF8A00]/25 text-[#FFF6E3]"
                        : isAmethyst
                        ? "bg-[#180C2C]/80 border-[#52297A]/35 text-[#EDE0F8]"
                        : isGoldenHour
                        ? "bg-[#281B12]/80 border-[#C9822B]/30 text-[#FFF4D8]"
                        : "bg-stone-900/50 border-stone-800 text-stone-100"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-serif-sacred font-bold ${
                          isLightCanvas
                            ? isPrismPulse
                              ? "text-[#6D28D9]"
                              : "text-amber-800"
                            : "text-amber-300"
                        }`}
                      >
                        {entry.verseTitle}
                      </span>
                      <div className="flex items-center space-x-3 text-stone-500 text-[11px]">
                        <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => onDeleteJournalEntry(entry.id)}
                          className="text-stone-400 hover:text-rose-400 p-1 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p
                      className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        isLightCanvas ? "text-stone-700" : "text-stone-300"
                      }`}
                    >
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
            <h2
              className={`font-serif-sacred text-xl font-bold ${
                isLightCanvas
                  ? isPrismPulse
                    ? "text-[#1e1b2e]"
                    : "text-stone-900"
                  : "text-amber-100"
              }`}
            >
              Personalized Wisdom Recommendations
            </h2>
            <p className="text-xs opacity-60">
              Curated based on your reflection themes, tradition preferences, and daily reading habit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedVerses.map((verse) => (
              <div
                key={verse.id}
                className={`border rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between ${
                  isLightCanvas
                    ? isPrismPulse
                      ? "bg-white border-stone-200 text-[#1e1b2e] shadow-xs hover:border-[#7C3AED]/40"
                      : "bg-white border-stone-200 text-stone-900 shadow-sm hover:border-amber-500/40"
                    : isFestival
                    ? "bg-[#450A12]/80 border-[#FF8A00]/30 text-[#FFF6E3] hover:border-[#FF8A00]/60"
                    : isAmethyst
                    ? "bg-[#180C2C]/80 border-[#52297A]/40 text-[#EDE0F8] hover:border-[#C084FC]/40"
                    : isGoldenHour
                    ? "bg-[#281B12]/80 border-[#C9822B]/35 text-[#FFF4D8] hover:border-[#E5983B]/50"
                    : "bg-stone-900/60 border-stone-800 hover:border-amber-500/40 text-stone-100"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Recommended
                    </span>
                    <button
                      onClick={() => onToggleBookmark(verse.id)}
                      className="text-stone-400 hover:text-amber-400 p-1"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  <h4
                    className={`font-serif-sacred font-bold text-sm ${
                      isLightCanvas
                        ? isPrismPulse
                          ? "text-[#1e1b2e]"
                          : "text-stone-900"
                        : "text-amber-100"
                    }`}
                  >
                    {verse.title}
                  </h4>

                  <p
                    className={`font-sanskrit text-xs whitespace-pre-line leading-relaxed ${
                      isLightCanvas
                        ? isPrismPulse
                          ? "text-[#181326] font-bold"
                          : "text-[#1C0F05] font-semibold"
                        : "text-amber-200"
                    }`}
                  >
                    {verse.body}
                  </p>

                  {verse.meaning && (
                    <p
                      className={`text-xs italic leading-relaxed ${
                        isLightCanvas
                          ? isPrismPulse
                            ? "text-[#4a5568]"
                            : "text-stone-600"
                          : "text-stone-300"
                      }`}
                    >
                      "{verse.meaning}"
                    </p>
                  )}
                </div>

                <div
                  className={`pt-3 border-t flex items-center justify-between text-xs ${
                    isLightCanvas ? "border-stone-200" : "border-stone-800/80"
                  }`}
                >
                  <button
                    onClick={() => onOpenVerseModal(verse)}
                    className={`font-semibold flex items-center space-x-1 ${
                      isLightCanvas && isPrismPulse
                        ? "text-[#7C3AED] hover:text-[#6D28D9]"
                        : "text-amber-500 hover:text-amber-400"
                    }`}
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

      {/* SECTION 5: MEMBERSHIP & SEVA (Phase 2 Features: Shown only when active) */}
      {subSection === "membership" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Sādhaka & Rishi Plan Cards */}
          <div className={`grid grid-cols-1 ${isSadhakaEnabled && isGurudakshinaEnabled ? "md:grid-cols-2" : "max-w-xl mx-auto"} gap-6`}>
            {/* Sādhaka Membership */}
            {isSadhakaEnabled && (
              <div
                className={`rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-xl border transition-all ${
                  isLightCanvas
                    ? isPrismPulse
                      ? "bg-white border-stone-200 text-[#1e1b2e]"
                      : "bg-white border-stone-200 text-stone-900"
                    : "bg-gradient-to-br from-stone-900 to-stone-950 border-amber-500/40 text-stone-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div
                      className={`flex items-center space-x-2 text-xs font-mono uppercase tracking-wider ${
                        isLightCanvas && isPrismPulse ? "text-[#7C3AED]" : "text-amber-500"
                      }`}
                    >
                      <Crown className="w-4 h-4" />
                      <span>Sādhaka Membership</span>
                    </div>
                    <h3
                      className={`font-serif-sacred text-2xl font-bold ${
                        isLightCanvas
                          ? isPrismPulse
                            ? "text-[#1e1b2e]"
                            : "text-stone-900"
                          : "text-amber-100"
                      }`}
                    >
                      Deepen Your Daily Practice
                    </h3>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono text-2xl font-bold ${
                        isLightCanvas
                          ? isPrismPulse
                            ? "text-[#6D28D9]"
                            : "text-amber-800"
                          : "text-amber-300"
                      }`}
                    >
                      ₹199
                    </span>
                    <span className="text-xs opacity-60">/mo</span>
                  </div>
                </div>

                <ul
                  className={`space-y-2.5 text-xs ${
                    isLightCanvas ? "text-stone-700" : "text-stone-300"
                  }`}
                >
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Full Sanskrit audio chants with variable tempo pronunciation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Complete Shankaracharya & Ramanuja comparative commentaries</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Offline study downloads for contemplative meditation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Unlimited journal sync across devices</span>
                  </li>
                </ul>

                <button
                  onClick={onOpenPricing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs shadow-lg hover:scale-105 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Begin Sādhaka Practice →</span>
                </button>
              </div>
            )}

            {/* Sacred Gurudakshina / Seva (80G Tax Exemption) */}
            {isGurudakshinaEnabled && (
              <div
                className={`rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-xl border transition-all ${
                  isLightCanvas
                    ? "bg-rose-50/50 border-rose-200 text-stone-900"
                    : "bg-gradient-to-br from-rose-950/20 via-stone-900 to-stone-950 border-rose-800/40 text-stone-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-rose-500 text-xs font-mono uppercase tracking-wider">
                      <Heart className="w-4 h-4 fill-rose-500/20" />
                      <span>Sacred Seva & Gurudakshina</span>
                    </div>
                    <h3
                      className={`font-serif-sacred text-2xl font-bold ${
                        isLightCanvas ? "text-stone-900" : "text-rose-100"
                      }`}
                    >
                      Preserve Vedic Heritage
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold">
                      80G Tax Exempt
                    </span>
                  </div>
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    isLightCanvas ? "text-stone-700" : "text-stone-300"
                  }`}
                >
                  Support the scholarly digitization, audio chanting archival, and free open access of ancient Sanskrit wisdom for seekers worldwide.
                </p>

                <ul
                  className={`space-y-2.5 text-xs ${
                    isLightCanvas ? "text-stone-700" : "text-stone-300"
                  }`}
                >
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Instant 80G Tax Exemption receipt generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Preserves endangered Vedic manuscripts & chanting oral traditions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Transparent ashram & scholarship allocation</span>
                  </li>
                </ul>

                <button
                  onClick={onOpenDonation}
                  className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    isLightCanvas
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "bg-rose-950/80 border border-rose-700/80 text-rose-200 hover:bg-rose-900"
                  }`}
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>Offer Seva / Gurudakshina →</span>
                </button>
              </div>
            )}

            {!isSadhakaEnabled && !isGurudakshinaEnabled && (
              <div
                className={`col-span-full text-center py-12 p-6 rounded-3xl border space-y-2 ${
                  isLightCanvas
                    ? "bg-white border-stone-200 shadow-xs text-stone-700"
                    : "bg-stone-900/50 border-stone-800 text-stone-300"
                }`}
              >
                <p
                  className={`font-serif-sacred text-base font-bold ${
                    isLightCanvas ? "text-amber-800" : "text-amber-200"
                  }`}
                >
                  Phase 1 Sanctuary
                </p>
                <p className="text-xs opacity-75 max-w-md mx-auto">
                  Sādhaka and Gurudakshina portals are currently reserved for Phase 2 launch. Enjoy complete, uninterrupted sacred study.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 6: WISDOM CARDS & ADVOCACY LOOP */}
      {subSection === "advocacy" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h2
              className={`font-serif-sacred text-xl font-bold ${
                isLightCanvas
                  ? isPrismPulse
                    ? "text-[#1e1b2e]"
                    : "text-stone-900"
                  : "text-amber-100"
              }`}
            >
              Sacred Wisdom Cards & Advocacy
            </h2>
            <p className="text-xs opacity-60">
              Share authentic Sanskrit shlokas and translations with fellow seekers. Bring wisdom to the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {verses.slice(0, 4).map((verse) => (
              <div
                key={verse.id}
                className={`rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl relative border transition-all ${
                  isLightCanvas
                    ? isPrismPulse
                      ? "bg-white border-stone-200 text-[#1e1b2e] shadow-xs"
                      : "bg-white border-stone-200 text-stone-900 shadow-md"
                    : isFestival
                    ? "bg-[#450A12]/90 border-[#FF8A00]/30 text-[#FFF6E3]"
                    : isAmethyst
                    ? "bg-[#180C2C]/90 border-[#52297A]/40 text-[#EDE0F8]"
                    : isGoldenHour
                    ? "bg-[#281B12]/90 border-[#C9822B]/35 text-[#FFF4D8]"
                    : "bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border-amber-500/30 text-stone-100"
                }`}
              >
                <div
                  className={`flex items-center justify-between text-xs border-b pb-3 ${
                    isLightCanvas
                      ? isPrismPulse
                        ? "text-[#7C3AED] border-stone-200"
                        : "text-amber-800 border-stone-200"
                      : "text-amber-400 border-stone-800"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-serif-sacred font-bold">
                    <span>ॐ</span>
                    <span>SutraSparsh Sacred Card</span>
                  </div>
                  <span className="font-mono text-[10px] opacity-60">{verse.title}</span>
                </div>

                <div className="text-center py-2 space-y-2">
                  <p
                    className={`font-sanskrit text-lg sm:text-xl leading-loose whitespace-pre-line ${
                      isLightCanvas
                        ? isPrismPulse
                          ? "text-[#181326] font-bold"
                          : "text-[#1C0F05] font-semibold"
                        : "text-amber-200"
                    }`}
                  >
                    {verse.body}
                  </p>
                  {verse.transliteration && (
                    <p
                      className={`font-serif text-xs italic ${
                        isLightCanvas
                          ? isPrismPulse
                            ? "text-[#6D28D9]"
                            : "text-amber-800"
                          : "text-amber-400/80"
                      }`}
                    >
                      {verse.transliteration}
                    </p>
                  )}
                  {verse.meaning && (
                    <p
                      className={`text-xs sm:text-sm leading-relaxed w-full pt-2 border-t ${
                        isLightCanvas
                          ? isPrismPulse
                            ? "text-[#4a5568] border-stone-200"
                            : "text-stone-600 border-stone-200"
                          : "text-stone-300 border-stone-800/60"
                      }`}
                    >
                      "{verse.meaning}"
                    </p>
                  )}
                </div>

                <div
                  className={`pt-3 border-t flex items-center justify-between text-xs ${
                    isLightCanvas ? "border-stone-200" : "border-stone-800"
                  }`}
                >
                  <span className="text-[11px] opacity-60 font-mono">sutrasparsh.com</span>
                  <button
                    onClick={() => handleCopyWisdomCard(verse)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 hover:bg-amber-500/30 text-xs font-semibold transition-all"
                  >
                    {copiedCardId === verse.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
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
