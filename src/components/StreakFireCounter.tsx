import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Sparkles, Check } from "lucide-react";
import { soundEngine } from "../utils/audio";
import { getHabitMilestoneInfo, type StreakData } from "../services/progress.service";

export interface StreakFireCounterProps {
  streakData: StreakData;
  isLight?: boolean;
  onCheckin?: () => void;
  className?: string;
  variant?: "pill" | "card" | "compact";
  showCheckinText?: boolean;
}

export const StreakFireCounter: React.FC<StreakFireCounterProps> = ({
  streakData,
  isLight = false,
  onCheckin,
  className = "",
  variant = "pill",
  showCheckinText = true,
}) => {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [showMilestoneBanner, setShowMilestoneBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");

  const currentStreak = streakData.currentStreak || 4;
  const isCheckedIn = streakData.checkedInToday;
  const milestoneInfo = getHabitMilestoneInfo(currentStreak);

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

    // Subtle celebratory chime
    try {
      soundEngine.playTempleBell(currentStreak >= 4 ? 528 : 440);
    } catch {
      // Audio fallback safe
    }

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

  if (variant === "card") {
    return (
      <div
        id="streak-fire-counter-card"
        onClick={handleClick}
        className={`relative group cursor-pointer p-4 rounded-2xl border transition-all duration-300 select-none overflow-hidden ${
          isLight
            ? "bg-[#FAF7F0] border-amber-300/80 hover:border-amber-400 shadow-sm"
            : "bg-stone-950/80 border-amber-500/30 hover:border-amber-500/50"
        } ${className}`}
        role="button"
        tabIndex={0}
        aria-label={`${currentStreak}-day streak habit tracker card, ${milestoneInfo.tierName} milestone`}
      >
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
      </div>
    );
  }

  // Default "pill" variant used in the main Daily Shloka bar and temple screens
  return (
    <div className={`relative inline-flex items-center space-x-2.5 ${className}`}>
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

      {/* Main Interactive Streak Counter Pill */}
      <motion.button
        id="streak-4day-counter-pill"
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`relative group inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-colors cursor-pointer select-none ${
          isLight
            ? "bg-amber-100/90 text-amber-950 border-amber-300 hover:border-amber-400 shadow-xs"
            : "bg-amber-500/10 border-amber-500/25 text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/15"
        }`}
        title="Tap to view streak milestone details or record daily check-in"
        aria-label={`${currentStreak}-day streak counter, daily check-in habit milestone`}
      >
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
  );
};
