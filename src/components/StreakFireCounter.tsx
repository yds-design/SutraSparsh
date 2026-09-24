import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Sparkles, Check, Target, ChevronRight, Clock, BookOpen } from "lucide-react";
import { getHabitMilestoneInfo, type StreakData } from "../services/progress.service";
import {
  dailyGoalService,
  type DailyGoalProgress,
  type DailyGoalConfig,
} from "../services/dailyGoal.service";
import { DailyGoalModal } from "./DailyGoalModal";
import { SubtleConfettiSparkles } from "./SubtleConfettiSparkles";
import { ProgressBarMilestoneSparkles } from "./ProgressBarMilestoneSparkles";

export interface StreakFireCounterProps {
  streakData: StreakData;
  isLight?: boolean;
  onCheckin?: () => void;
  className?: string;
  variant?: "pill" | "card" | "compact";
  showCheckinText?: boolean;
  showDailyGoal?: boolean;
  showStudyProgressBar?: boolean;
  onOpenGoalSettings?: () => void;
}

export const StreakFireCounter: React.FC<StreakFireCounterProps> = ({
  streakData,
  isLight = false,
  onCheckin,
  className = "",
  variant = "pill",
  showCheckinText = true,
  showDailyGoal = true,
  showStudyProgressBar = true,
  onOpenGoalSettings,
}) => {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isGoalCelebrating, setIsGoalCelebrating] = useState(false);
  const [isProgressBarMilestoneCelebrating, setIsProgressBarMilestoneCelebrating] = useState(false);
  const [showMilestoneBanner, setShowMilestoneBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const [goalProgress, setGoalProgress] = useState<DailyGoalProgress>(() =>
    dailyGoalService.getDailyProgress()
  );
  const [goalConfig, setGoalConfig] = useState<DailyGoalConfig>(() =>
    dailyGoalService.getGoalConfig()
  );

  const currentStreak = streakData.currentStreak || 4;
  const isCheckedIn = streakData.checkedInToday;
  const milestoneInfo = getHabitMilestoneInfo(currentStreak);
  const prevPercentageRef = useRef(goalProgress.percentage);

  // Subscribe to daily reading goal updates
  useEffect(() => {
    const unsub = dailyGoalService.subscribe((p, c) => {
      setGoalProgress(p);
      setGoalConfig(c);
    });
    return unsub;
  }, []);

  const triggerProgressBarMilestone = (customMsg?: string) => {
    setIsProgressBarMilestoneCelebrating(true);
    setIsGoalCelebrating(true);
    triggerFirePulse(customMsg || "15-Minute Study Milestone Achieved! 🎯✨ Sādhana goal completed!");

    const timer = setTimeout(() => {
      setIsProgressBarMilestoneCelebrating(false);
      setIsGoalCelebrating(false);
    }, 4500);

    return () => clearTimeout(timer);
  };

  // Watch for progress bar reaching 100% of study goal
  useEffect(() => {
    if (prevPercentageRef.current < 100 && goalProgress.percentage >= 100) {
      triggerProgressBarMilestone();
    }
    prevPercentageRef.current = goalProgress.percentage;
  }, [goalProgress.percentage]);

  // Listen for daily goal achieved celebration
  useEffect(() => {
    const handleGoalMet = () => {
      triggerGoalCelebration();
    };
    window.addEventListener("sutrasparsh:daily_goal_achieved", handleGoalMet);
    return () => {
      window.removeEventListener("sutrasparsh:daily_goal_achieved", handleGoalMet);
    };
  }, [currentStreak, milestoneInfo]);

  const triggerGoalCelebration = () => {
    setIsGoalCelebrating(true);
    setIsProgressBarMilestoneCelebrating(true);
    triggerFirePulse("Daily Sādhana Goal Achieved! 🎯🔥 Inner flame illuminated!");

    const timer = setTimeout(() => {
      setIsGoalCelebrating(false);
      setIsProgressBarMilestoneCelebrating(false);
    }, 4500);

    return () => clearTimeout(timer);
  };

  // Trigger celebration when a new milestone is hit or when trigger timestamp changes
  useEffect(() => {
    if (streakData.lastMilestoneTriggerTimestamp) {
      triggerFirePulse("Daily check-in recorded! Streak burning bright 🔥");
    }
  }, [streakData.lastMilestoneTriggerTimestamp]);

  const triggerFirePulse = (customMsg?: string) => {
    setIsCelebrating(true);
    setShowMilestoneBanner(true);
    setBannerMessage(
      customMsg ||
        (currentStreak >= 4
          ? `Day ${currentStreak} Milestone Hit! 🔥 ${milestoneInfo.tierName} practice active`
          : `Day ${currentStreak} Sādhana recorded! Keep the inner flame burning`)
    );

    // Reset celebration states smoothly
    const pulseTimer = setTimeout(() => {
      setIsCelebrating(false);
    }, 2400);

    const bannerTimer = setTimeout(() => {
      setShowMilestoneBanner(false);
    }, 3800);

    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(bannerTimer);
    };
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isCheckedIn && onCheckin) {
      onCheckin();
      triggerFirePulse(`Day ${currentStreak} Check-in Complete! 🔥`);
    } else {
      // Re-trigger celebratory fire pulse animation on tap so user can inspect and enjoy feedback
      triggerFirePulse(
        `${currentStreak}-Day Streak Milestone 🔥 ${milestoneInfo.description}`
      );
    }
  };

  const handleOpenGoal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenGoalSettings) {
      onOpenGoalSettings();
    } else {
      setIsGoalModalOpen(true);
    }
  };

  if (variant === "card") {
    return (
      <div
        id="streak-fire-counter-card"
        onClick={handleClick}
        className={`relative group cursor-pointer p-4 rounded-2xl border transition-all duration-500 select-none overflow-hidden ${
          isGoalCelebrating
            ? "border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/20"
            : isLight
            ? "bg-[#FAF7F0] border-amber-300/80 hover:border-amber-400 shadow-sm"
            : "bg-stone-950/80 border-amber-500/30 hover:border-amber-500/50"
        } ${className}`}
        role="button"
        tabIndex={0}
        aria-label={`${currentStreak}-day streak habit tracker card, ${milestoneInfo.tierName} milestone`}
      >
        {/* Subtle Confetti Particles Burst on Goal Achieved */}
        <SubtleConfettiSparkles active={isGoalCelebrating} count={24} isLight={isLight} />

        {/* Animated Glowing Celebratory Border Shimmer */}
        <AnimatePresence>
          {isGoalCelebrating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.9, 0.5, 0.9, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4.2, ease: "easeInOut" }}
              className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500 opacity-70 blur-[2px] pointer-events-none -z-10"
            />
          )}
        </AnimatePresence>

        {/* Subtle fire pulse aura background */}
        <AnimatePresence>
          {isCelebrating && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: [0.95, 1.08, 1], opacity: [0.35, 0.7, 0.35] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, repeat: 1, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-orange-500/20 to-amber-600/15 rounded-2xl pointer-events-none"
            />
          )}
        </AnimatePresence>

        <div className="relative flex items-center space-x-3.5 z-10">
          {/* Animated Flame Container */}
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-600/30 border border-orange-500/40 flex items-center justify-center text-orange-400 overflow-hidden">
            {/* Fire pulse expanding ring */}
            <AnimatePresence>
              {isCelebrating && (
                <motion.span
                  initial={{ scale: 0.6, opacity: 0.8 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border-2 border-orange-400 pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Flame Icon with subtle organic flicker */}
            <motion.div
              animate={
                isCelebrating
                  ? {
                      scale: [1, 1.35, 0.95, 1.2, 1],
                      rotate: [0, -5, 5, -2, 0],
                      filter: [
                        "drop-shadow(0 0 2px rgba(245,158,11,0.5))",
                        "drop-shadow(0 0 12px rgba(234,88,12,0.9))",
                        "drop-shadow(0 0 4px rgba(245,158,11,0.5))",
                      ],
                    }
                  : {
                      scale: [1, 1.12, 0.98, 1.08, 1],
                      rotate: [-1.5, 1.5, -0.5, 1.5, 0],
                      filter: [
                        "drop-shadow(0 0 2px rgba(245,158,11,0.4))",
                        "drop-shadow(0 0 6px rgba(234,88,12,0.7))",
                        "drop-shadow(0 0 2px rgba(245,158,11,0.4))",
                      ],
                    }
              }
              transition={{
                duration: isCelebrating ? 1.4 : 3,
                repeat: isCelebrating ? 0 : Infinity,
                ease: "easeInOut",
              }}
              className="text-orange-400 flex items-center justify-center"
            >
              <Flame className="w-6 h-6 fill-current" />
            </motion.div>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <motion.span
                key={currentStreak}
                animate={isCelebrating ? { scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 0.5 }}
                className={`font-mono text-2xl font-bold ${
                  isLight ? "text-amber-900" : "text-amber-200"
                }`}
              >
                {currentStreak}
              </motion.span>
              <span className="text-xs font-bold text-amber-600">Days</span>
              {currentStreak >= 4 && (
                <span className="ml-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Milestone
                </span>
              )}
            </div>
            <p
              className={`text-[11px] font-medium ${
                isLight ? "text-stone-600" : "text-stone-400"
              }`}
            >
              {isCheckedIn
                ? "Consecutive Sādhana Active"
                : "Daily Sādhana Check-in Ready"}
            </p>
          </div>
        </div>

        {/* Daily Reading Goal Card Section */}
        {showDailyGoal && (
          <div
            onClick={handleOpenGoal}
            className={`mt-3.5 pt-3 border-t rounded-xl p-3 transition-all cursor-pointer group/goal ${
              isLight
                ? "border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 shadow-xs"
                : "border-amber-500/15 bg-stone-900/60 hover:bg-stone-900/90"
            }`}
            title="Tap to configure your Daily Reading Goal"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-amber-500 group-hover/goal:scale-110 transition-transform" />
                <span className="font-bold text-amber-500">Daily Study Goal</span>
                <span className="text-[10px] font-mono opacity-70">
                  ({goalConfig.metric === "minutes" ? `${goalConfig.targetMinutes}m/day` : `${goalConfig.targetVerses}v/day`})
                </span>
              </div>

              <div className="flex items-center space-x-1 font-mono text-[11px] font-bold">
                {goalProgress.isGoalMet ? (
                  <span className="inline-flex items-center space-x-1 text-emerald-400">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Goal Met! 🔥</span>
                  </span>
                ) : (
                  <span className={isLight ? "text-stone-700" : "text-amber-200"}>
                    {goalConfig.metric === "minutes"
                      ? `${goalProgress.minutesStudied} / ${goalConfig.targetMinutes}m`
                      : `${goalProgress.versesRead} / ${goalConfig.targetVerses} shlokas`}
                    <span className="text-amber-500 ml-1">({goalProgress.percentage}%)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-stone-800/40 overflow-hidden relative border border-white/5">
              <motion.div
                initial={false}
                animate={{ width: `${Math.min(100, goalProgress.percentage)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full transition-all ${
                  goalProgress.isGoalMet
                    ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-sm shadow-emerald-500/40"
                    : "bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 shadow-sm shadow-orange-500/30"
                }`}
              />
            </div>

            <div className="flex items-center justify-between mt-2 text-[10px] text-stone-400">
              <span>
                {goalProgress.isGoalMet
                  ? "Sādhana target reached today!"
                  : goalConfig.metric === "minutes"
                  ? `${Math.max(1, goalConfig.targetMinutes - goalProgress.minutesStudied)}m remaining today`
                  : `${Math.max(1, goalConfig.targetVerses - goalProgress.versesRead)} more verses to hit goal`}
              </span>
              <span className="text-amber-500 font-semibold group-hover/goal:underline flex items-center space-x-0.5">
                <span>Configure</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}

        {/* Transient Milestone Feedback Banner */}
        <AnimatePresence>
          {showMilestoneBanner && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-amber-300 font-medium"
            >
              <span className="flex items-center space-x-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{bannerMessage}</span>
              </span>
              <span className="text-[10px] text-amber-500/80 font-mono shrink-0 ml-2">
                Active
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <DailyGoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          isLight={isLight}
        />
      </div>
    );
  }

  // Default "pill" variant used in the main Daily Shloka bar and temple screens
  return (
    <div className={`relative flex flex-col space-y-2 ${className}`}>
      {/* Floating Milestone Celebration Toast / Tag */}
      <AnimatePresence>
        {showMilestoneBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`absolute -top-9 left-0 z-30 px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 whitespace-nowrap shadow-md pointer-events-none ${
              isLight
                ? "bg-amber-950 text-amber-100 border border-amber-800/60"
                : "bg-stone-900 text-amber-200 border border-amber-500/40"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{bannerMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
        {/* Main Interactive Streak Counter Pill */}
        <motion.button
          id="streak-4day-counter-pill"
          onClick={handleClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={`relative group inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 cursor-pointer select-none ${
            isGoalCelebrating
              ? "border-amber-400 ring-2 ring-amber-400/50 shadow-md shadow-amber-500/20"
              : isLight
              ? "bg-amber-100/90 text-amber-950 border-amber-300 hover:border-amber-400 shadow-xs"
              : "bg-amber-500/10 border-amber-500/25 text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/15"
          }`}
          title="Tap to view streak milestone details or record daily check-in"
          aria-label={`${currentStreak}-day streak counter, daily check-in habit milestone`}
        >
          {/* Subtle Confetti Particles Burst on Goal Achieved */}
          <SubtleConfettiSparkles active={isGoalCelebrating} count={16} isLight={isLight} />

          {/* Animated Glowing Celebratory Border Shimmer */}
          <AnimatePresence>
            {isGoalCelebrating && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.85, 0.4, 0.85, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 4.2, ease: "easeInOut" }}
                className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500 opacity-60 blur-[1.5px] pointer-events-none -z-10"
              />
            )}
          </AnimatePresence>

          {/* Subtle Fire Pulse Halo Wave (Triggers on milestone and check-in) */}
          <AnimatePresence>
            {isCelebrating && (
              <motion.span
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: 1.35, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3, ease: "easeOut" }}
                className="absolute -inset-1 rounded-full border-2 border-orange-400/70 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Ambient Subtle Fire Glow (continuous soft breathing pulse) */}
          <motion.span
            animate={{
              opacity: isCelebrating ? [0.4, 0.8, 0.4] : [0.15, 0.35, 0.15],
            }}
            transition={{
              duration: isCelebrating ? 0.8 : 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 via-amber-500/30 to-orange-500/20 pointer-events-none"
          />

          {/* Flame Icon with subtle organic pulse animation */}
          <motion.span
            animate={
              isCelebrating
                ? {
                    scale: [1, 1.4, 0.92, 1.25, 1],
                    rotate: [0, -6, 6, -3, 0],
                    filter: [
                      "drop-shadow(0 0 2px rgba(245,158,11,0.5))",
                      "drop-shadow(0 0 10px rgba(234,88,12,0.9))",
                      "drop-shadow(0 0 3px rgba(245,158,11,0.5))",
                    ],
                  }
                : {
                    scale: [1, 1.14, 0.98, 1.1, 1],
                    rotate: [-1, 1, -0.5, 1.5, 0],
                    filter: [
                      "drop-shadow(0 0 1px rgba(245,158,11,0.4))",
                      "drop-shadow(0 0 5px rgba(234,88,12,0.65))",
                      "drop-shadow(0 0 1px rgba(245,158,11,0.4))",
                    ],
                  }
            }
            transition={{
              duration: isCelebrating ? 1.2 : 2.6,
              repeat: isCelebrating ? 0 : Infinity,
              ease: "easeInOut",
            }}
            className="relative text-orange-400 flex items-center justify-center shrink-0"
          >
            <Flame className="w-4 h-4 fill-current" />
          </motion.span>

          {/* Streak Counter Text */}
          <span className="relative z-10 flex items-center space-x-1 whitespace-nowrap">
            <motion.span
              key={currentStreak}
              animate={isCelebrating ? { scale: [1, 1.2, 1], color: "#F59E0B" } : {}}
              transition={{ duration: 0.4 }}
            >
              {currentStreak}-day streak
            </motion.span>
          </span>

          {/* Tiny checkmark if checked in today */}
          {isCheckedIn && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
              title="Checked in today"
            />
          )}
        </motion.button>

        {/* Daily Study Goal Chip / Pill */}
        {showDailyGoal && (
          <motion.button
            id="daily-reading-goal-pill"
            type="button"
            onClick={handleOpenGoal}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`relative inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 cursor-pointer select-none ${
              isGoalCelebrating
                ? "border-emerald-400 ring-2 ring-emerald-400/60 shadow-md shadow-emerald-500/25 bg-emerald-500/20 text-emerald-300"
                : goalProgress.isGoalMet
                ? isLight
                  ? "bg-emerald-100/90 text-emerald-950 border-emerald-300 shadow-xs"
                  : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-xs shadow-emerald-500/10"
                : isLight
                ? "bg-amber-100/70 text-amber-950 border-amber-300 hover:border-amber-400 shadow-xs"
                : "bg-amber-500/10 border-amber-500/25 text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/15"
            }`}
            title={`Daily Study Goal: ${
              goalConfig.metric === "minutes"
                ? `${goalProgress.minutesStudied}/${goalConfig.targetMinutes}m`
                : `${goalProgress.versesRead}/${goalConfig.targetVerses} verses`
            } (${goalProgress.percentage}%). Tap to configure.`}
            aria-label="Daily reading goal tracker"
          >
            {/* Subtle Confetti Particles Burst on Goal Pill */}
            <SubtleConfettiSparkles active={isGoalCelebrating} count={14} isLight={isLight} />

            {/* Animated Glowing Celebratory Border Shimmer */}
            <AnimatePresence>
              {isGoalCelebrating && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.35, 0.9, 0.45, 0.9, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 4.2, ease: "easeInOut" }}
                  className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 opacity-70 blur-[1.5px] pointer-events-none -z-10"
                />
              )}
            </AnimatePresence>

            <Target
              className={`w-3.5 h-3.5 ${
                goalProgress.isGoalMet ? "text-emerald-400" : "text-amber-400"
              }`}
            />
            <span className="font-mono text-[11px] font-bold">
              {goalConfig.metric === "minutes"
                ? `${goalProgress.minutesStudied}/${goalConfig.targetMinutes}m`
                : `${goalProgress.versesRead}/${goalConfig.targetVerses}v`}
            </span>
            {goalProgress.isGoalMet ? (
              <span className="text-[10px] font-bold text-emerald-400">🔥</span>
            ) : (
              <span className="text-[10px] opacity-75 font-mono">
                {goalProgress.percentage}%
              </span>
            )}
          </motion.button>
        )}

        {/* Auxiliary Status / Check-in Prompt */}
        {showCheckinText && (
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs ${isLight ? "text-stone-700" : ""}`}
              style={{ color: isLight ? undefined : "#9CA3AF" }}
            >
              {isCheckedIn ? (
                <span className="flex items-center space-x-1.5">
                  <span>Brahma Muhurta habit active today</span>
                  {currentStreak >= 4 && (
                    <span className="inline-flex items-center text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                      Abhyāsi Milestone 🔥
                    </span>
                  )}
                </span>
              ) : (
                <button
                  onClick={handleClick}
                  className={`underline hover:opacity-80 transition-opacity font-semibold ${
                    isLight ? "text-amber-800" : "text-amber-400"
                  }`}
                >
                  Daily check-in ready (Tap to record)
                </button>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Visual Progress Bar beneath StreakFireCounter filling towards 15 minutes of study */}
      {showStudyProgressBar && (
        <div
          data-testid="streak-study-progress-bar-container"
          onClick={(e) => {
            if (goalProgress.percentage >= 100 || goalProgress.isGoalMet) {
              triggerProgressBarMilestone("15-Minute Study Milestone Achieved! 🎯✨ Sādhana goal completed!");
            }
            handleOpenGoal(e);
          }}
          className={`group/bar cursor-pointer pt-0.5 transition-all select-none w-full max-w-sm sm:max-w-md`}
          title={`Daily Sādhana Study Progress: ${
            goalConfig.metric === "minutes"
              ? `${goalProgress.minutesStudied}/${goalConfig.targetMinutes}m`
              : `${goalProgress.versesRead}/${goalConfig.targetVerses} shlokas`
          } (${goalProgress.percentage}%). Tap to configure.`}
          role="progressbar"
          aria-valuenow={goalProgress.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Study goal progress bar: ${goalProgress.minutesStudied} of ${goalConfig.targetMinutes} minutes`}
        >
          {/* Label row above the track */}
          <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
            <div className="flex items-center space-x-1.5">
              <Clock
                className={`w-3 h-3 ${
                  goalProgress.isGoalMet ? "text-emerald-400" : "text-amber-500"
                }`}
              />
              <span
                className={`font-semibold ${
                  isLight ? "text-stone-700" : "text-stone-300"
                }`}
              >
                Daily Study:{" "}
                <span className="font-mono font-bold text-amber-500">
                  {goalConfig.metric === "minutes"
                    ? `${goalProgress.minutesStudied}m / ${goalConfig.targetMinutes}m`
                    : `${goalProgress.versesRead} / ${goalConfig.targetVerses} shlokas`}
                </span>
              </span>
            </div>

            <div className="flex items-center space-x-1">
              {goalProgress.percentage >= 100 || goalProgress.isGoalMet ? (
                <span
                  data-testid="progress-bar-milestone-badge"
                  className="inline-flex items-center space-x-1 text-emerald-400 font-bold font-mono text-[10.5px]"
                >
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  <span>Milestone Achieved!</span>
                </span>
              ) : (
                <span
                  className={`font-mono text-[10.5px] ${
                    isLight ? "text-stone-500" : "text-stone-400"
                  }`}
                >
                  {goalProgress.percentage}%
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar Track with milestone celebration sparkles */}
          <div
            className={`relative w-full h-2 rounded-full border transition-all ${
              goalProgress.isGoalMet || goalProgress.percentage >= 100
                ? isLight
                  ? isProgressBarMilestoneCelebrating
                    ? "bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400/70 shadow-md shadow-emerald-400/30"
                    : "bg-emerald-100 border-emerald-300 ring-1 ring-emerald-400/40"
                  : isProgressBarMilestoneCelebrating
                    ? "bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-400/70 shadow-md shadow-emerald-500/40"
                    : "bg-emerald-950/40 border-emerald-500/40 ring-1 ring-emerald-500/30"
                : isLight
                ? "bg-amber-100/70 border-amber-200/80 group-hover/bar:border-amber-300"
                : "bg-stone-900 border-stone-800 group-hover/bar:border-amber-500/30"
            }`}
          >
            {/* Subtle Confetti and Spark Animation when progress bar reaches 100% of study goal */}
            <ProgressBarMilestoneSparkles
              active={
                isProgressBarMilestoneCelebrating ||
                ((goalProgress.percentage >= 100 || goalProgress.isGoalMet) && isGoalCelebrating)
              }
              isLight={isLight}
            />

            {/* Inner track with overflow-hidden for the smooth fill bar */}
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <motion.div
                data-testid="streak-study-progress-fill"
                initial={false}
                animate={{ width: `${Math.min(100, Math.max(3, goalProgress.percentage))}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full relative transition-all ${
                  goalProgress.isGoalMet || goalProgress.percentage >= 100
                    ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-sm shadow-emerald-500/50"
                    : "bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 shadow-sm shadow-orange-500/30"
                }`}
              >
                {/* Shimmer highlight line */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
              </motion.div>
            </div>
          </div>
        </div>
      )}

      <DailyGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        isLight={isLight}
      />
    </div>
  );
};
