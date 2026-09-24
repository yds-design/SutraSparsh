import React, { useState, useEffect } from "react";
import {
  Target,
  Clock,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Flame,
  X,
  Plus,
  RotateCcw,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ModalPortal } from "./ModalPortal";
import {
  dailyGoalService,
  type DailyGoalConfig,
  type DailyGoalProgress,
  type DailyGoalMetric,
} from "../services/dailyGoal.service";

interface DailyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
}

export const DailyGoalModal: React.FC<DailyGoalModalProps> = ({
  isOpen,
  onClose,
  isLight = false,
}) => {
  const [config, setConfig] = useState<DailyGoalConfig>(() =>
    dailyGoalService.getGoalConfig()
  );
  const [progress, setProgress] = useState<DailyGoalProgress>(() =>
    dailyGoalService.getDailyProgress()
  );

  useEffect(() => {
    if (!isOpen) return;
    const unsub = dailyGoalService.subscribe((p, c) => {
      setProgress(p);
      setConfig(c);
    });
    return unsub;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMetricToggle = (metric: DailyGoalMetric) => {
    dailyGoalService.setGoalConfig({ metric });
  };

  const handleMinutesChange = (targetMinutes: number) => {
    dailyGoalService.setGoalConfig({ targetMinutes, metric: "minutes" });
  };

  const handleVersesChange = (targetVerses: number) => {
    dailyGoalService.setGoalConfig({ targetVerses, metric: "verses" });
  };

  const handleAutoCheckinToggle = () => {
    dailyGoalService.setGoalConfig({
      autoCheckinOnGoalMet: !config.autoCheckinOnGoalMet,
    });
  };

  const handleAddFiveMinutes = () => {
    dailyGoalService.addManualStudyMinutes(5);
  };

  const handleResetToday = () => {
    if (window.confirm("Reset today's study progress back to 0?")) {
      dailyGoalService.resetTodayProgress();
    }
  };

  const minutePresets = [5, 10, 15, 20, 30, 45, 60];
  const versePresets = [1, 3, 5, 10, 15, 20];

  const currentSeconds = progress.secondsStudied;
  const currentMinutesFormatted = `${Math.floor(currentSeconds / 60)}m ${currentSeconds % 60}s`;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
            isLight
              ? "bg-[#FAF7F0] border-amber-300 text-stone-900"
              : "bg-stone-950 border-amber-500/30 text-stone-100"
          }`}
        >
          {/* Header */}
          <div
            className={`p-5 sm:p-6 border-b flex items-start justify-between relative overflow-hidden ${
              isLight
                ? "border-amber-200 bg-amber-50/70"
                : "border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-stone-950 to-orange-950/30"
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-orange-500/20">
                <Target className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-serif-sacred text-lg sm:text-xl font-bold">
                    Daily Sādhana Goal
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    स्वाध्याय लक्ष्य
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isLight ? "text-stone-600" : "text-stone-400"}`}>
                  Build an unbroken daily habit of Sanskrit scriptural reflection.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight
                  ? "border-stone-200 text-stone-600 hover:bg-stone-100"
                  : "border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-900"
              }`}
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            {/* 1. Today's Progress Card */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border relative overflow-hidden ${
                progress.isGoalMet
                  ? isLight
                    ? "bg-emerald-50 border-emerald-300"
                    : "bg-gradient-to-br from-emerald-950/40 via-stone-900 to-amber-950/30 border-emerald-500/40"
                  : isLight
                  ? "bg-white border-amber-200 shadow-xs"
                  : "bg-stone-900/80 border-amber-500/20"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Flame
                    className={`w-4 h-4 ${
                      progress.isGoalMet
                        ? "text-emerald-400 animate-bounce"
                        : "text-orange-400 fill-current"
                    }`}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                    Today&apos;s Progress
                  </span>
                </div>
                {progress.isGoalMet ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Goal Met Today! 🔥</span>
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-amber-500">
                    {progress.percentage}% Achieved
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-stone-800/40 overflow-hidden relative border border-white/5">
                <motion.div
                  initial={false}
                  animate={{ width: `${Math.min(100, progress.percentage)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-full rounded-full transition-all ${
                    progress.isGoalMet
                      ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-md shadow-emerald-500/40"
                      : "bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 shadow-md shadow-orange-500/30"
                  }`}
                />
              </div>

              {/* Numbers breakdown */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-amber-500/10">
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[11px] text-stone-400 font-medium">Study Duration</div>
                    <div className="text-sm font-mono font-bold">
                      {currentMinutesFormatted}{" "}
                      <span className="text-xs font-normal opacity-70">
                        / {config.targetMinutes}m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[11px] text-stone-400 font-medium">Verses Contemplated</div>
                    <div className="text-sm font-mono font-bold">
                      {progress.versesRead}{" "}
                      <span className="text-xs font-normal opacity-70">
                        / {config.targetVerses} shlokas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Choose Goal Metric */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center justify-between">
                <span>Select Daily Goal Type</span>
                <span className="text-[10.5px] font-normal lowercase opacity-80">
                  how you prefer to measure progress
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleMetricToggle("minutes")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    config.metric === "minutes"
                      ? isLight
                        ? "bg-amber-100/80 border-amber-500 ring-2 ring-amber-400/40 shadow-xs"
                        : "bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/30 shadow-md"
                      : isLight
                      ? "bg-white border-stone-200 hover:border-amber-300"
                      : "bg-stone-900/60 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 font-bold text-xs">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Minutes of Study</span>
                    </div>
                    {config.metric === "minutes" && (
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className={`text-[11px] ${isLight ? "text-stone-600" : "text-stone-400"}`}>
                    Active reading & chant listening time. (Default: 15 mins/day)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleMetricToggle("verses")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    config.metric === "verses"
                      ? isLight
                        ? "bg-amber-100/80 border-amber-500 ring-2 ring-amber-400/40 shadow-xs"
                        : "bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/30 shadow-md"
                      : isLight
                      ? "bg-white border-stone-200 hover:border-amber-300"
                      : "bg-stone-900/60 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 font-bold text-xs">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <span>Number of Verses</span>
                    </div>
                    {config.metric === "verses" && (
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className={`text-[11px] ${isLight ? "text-stone-600" : "text-stone-400"}`}>
                    Count of distinct shlokas recited and reflected upon.
                  </p>
                </button>
              </div>
            </div>

            {/* 3. Target Presets */}
            {config.metric === "minutes" ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-500">
                    TARGET MINUTES PER DAY
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {config.targetMinutes} minutes/day
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {minutePresets.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleMinutesChange(mins)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer relative ${
                        config.targetMinutes === mins
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black shadow-md border-amber-400"
                          : isLight
                          ? "bg-white border-stone-200 text-stone-700 hover:border-amber-400"
                          : "bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700"
                      }`}
                    >
                      <span>{mins}m</span>
                      {mins === 15 && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase px-1 rounded bg-amber-400 text-stone-950">
                          Default
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-500">
                    TARGET VERSES PER DAY
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {config.targetVerses} verses/day
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {versePresets.map((verses) => (
                    <button
                      key={verses}
                      type="button"
                      onClick={() => handleVersesChange(verses)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer relative ${
                        config.targetVerses === verses
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black shadow-md border-amber-400"
                          : isLight
                          ? "bg-white border-stone-200 text-stone-700 hover:border-amber-400"
                          : "bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700"
                      }`}
                    >
                      <span>{verses}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Habit Integration Options */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? "bg-stone-50 border-stone-200" : "bg-stone-900/40 border-stone-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Auto-Checkin on Sādhana Goal</div>
                    <div className={`text-[10.5px] ${isLight ? "text-stone-500" : "text-stone-400"}`}>
                      Automatically registers your daily streak check-in when goal is hit.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoCheckinToggle}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    config.autoCheckinOnGoalMet ? "bg-amber-500" : "bg-stone-700"
                  }`}
                  aria-label="Toggle auto checkin"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-stone-950 transition-transform ${
                      config.autoCheckinOnGoalMet ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Quick Actions for testing and manual additions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAddFiveMinutes}
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                      isLight
                        ? "bg-white border-stone-300 hover:bg-stone-100 text-stone-700"
                        : "bg-stone-800 border-stone-700 hover:bg-stone-700 text-stone-300"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>+5m Manual Log</span>
                  </button>

                  <button
                    type="button"
                    data-testid="test-complete-goal-btn"
                    onClick={() => {
                      if (config.metric === "minutes") {
                        dailyGoalService.addManualStudyMinutes(config.targetMinutes);
                      } else {
                        // Mark target number of verses as read
                        for (let i = 1; i <= config.targetVerses; i++) {
                          dailyGoalService.recordVerseRead(`test_verse_${i}`);
                        }
                      }
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/40 cursor-pointer transition-all active:scale-95 shadow-xs"
                    title="Test reaching 100% daily goal and trigger celebration animation"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hit Goal (Test)</span>
                  </button>
                </div>

                <button
                  type="button"
                  data-testid="test-reset-goal-btn"
                  onClick={handleResetToday}
                  className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors opacity-70 hover:opacity-100 ${
                    isLight ? "text-stone-500 hover:text-stone-800" : "text-stone-400 hover:text-stone-200"
                  }`}
                  title="Reset today's progress"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Today</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`p-4 sm:p-5 border-t flex items-center justify-end ${
              isLight ? "border-amber-200 bg-amber-50/50" : "border-stone-800/80 bg-stone-900/50"
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              Done & Save Goal
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
