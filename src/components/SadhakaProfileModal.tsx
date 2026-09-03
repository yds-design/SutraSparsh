import React from "react";
import {
  X,
  Flame,
  Bookmark,
  BookOpen,
  Feather,
  Crown,
  Heart,
  Calendar,
  CheckCircle2,
  Volume2,
  ExternalLink,
  Shield,
  Palette,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { soundEngine } from "../utils/audio";
import { progressService, type StreakData } from "../services/progress.service";

interface SadhakaProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCount: number;
  journalCount: number;
  theme?: "sandstone" | "amethyst" | "light" | "festival";
  onSelectTheme?: (theme: "sandstone" | "amethyst" | "light" | "festival") => void;
  onNavigateTab: (tab: string) => void;
  onOpenPricing: () => void;
  onOpenDonation: () => void;
}

export const SadhakaProfileModal: React.FC<SadhakaProfileModalProps> = ({
  isOpen,
  onClose,
  savedCount,
  journalCount,
  theme = "sandstone",
  onSelectTheme,
  onNavigateTab,
  onOpenPricing,
  onOpenDonation,
}) => {
  const [streakData, setStreakData] = React.useState<StreakData>(() =>
    progressService.getStreakData()
  );

  React.useEffect(() => {
    const unsub = progressService.subscribeStreak((streak) => {
      setStreakData(streak);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const isLight = theme === "light";
  const isFestival = theme === "festival";
  const isAmethyst = theme === "amethyst";

  // Days of week for habit tracker
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

  const handleNavigate = (tab: string) => {
    soundEngine.playTempleBell(330);
    onClose();
    onNavigateTab(tab);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      style={{
        backgroundColor: isLight ? "rgba(58, 40, 24, 0.45)" : "rgba(0, 0, 0, 0.78)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden relative transition-all max-h-[92vh] flex flex-col"
        style={{
          backgroundColor: isLight
            ? "#FFFBF5"
            : isFestival
            ? "#4B0E17"
            : isAmethyst
            ? "#140A28"
            : "#1C120B",
          borderColor: isLight
            ? "#E6D7C3"
            : isFestival
            ? "rgba(255, 138, 0, 0.35)"
            : isAmethyst
            ? "rgba(196, 168, 230, 0.3)"
            : "rgba(216, 137, 22, 0.3)",
          color: isLight ? "#3A2818" : "#F4E9D2",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div
          className="relative px-6 pt-6 pb-5 border-b"
          style={{
            background: isLight
              ? "linear-gradient(135deg, #F6EDE1, #EAD9B6)"
              : isFestival
              ? "linear-gradient(135deg, #5E111C, #7A1825)"
              : isAmethyst
              ? "linear-gradient(135deg, #1E1038, #351C5E)"
              : "linear-gradient(135deg, #24160D, #3A281B)",
            borderColor: isLight ? "#E6D7C3" : "rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close Profile"
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            style={{
              backgroundColor: isLight ? "rgba(58, 40, 24, 0.08)" : "rgba(255, 255, 255, 0.1)",
              color: isLight ? "#3A2818" : "#F4E9D2",
            }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* User Avatar & Identity */}
          <div className="flex items-center space-x-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-sanskrit text-2xl font-bold shadow-lg border relative flex-shrink-0"
              style={{
                background: isLight
                  ? "linear-gradient(135deg, #D88916, #F2B133)"
                  : isFestival
                  ? "linear-gradient(135deg, #FF8A00, #FFD54A)"
                  : isAmethyst
                  ? "linear-gradient(135deg, #8A4AC7, #C4A8E6)"
                  : "linear-gradient(135deg, #D88916, #70501F)",
                color: isLight || isFestival ? "#1A0E06" : "#FFFFFF",
                borderColor: isLight ? "#D88916" : "#F2B333",
              }}
            >
              <span>ॐ</span>
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow"
                style={{
                  backgroundColor: "#2FA46A",
                  color: "#FFFFFF",
                }}
                title="Active Daily Sādhaka"
              >
                ✓
              </span>
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center space-x-2">
                <h2
                  id="profile-modal-title"
                  className="font-serif-sacred text-xl font-bold truncate"
                  style={{ color: isLight ? "#3A2818" : "#F4E9D2" }}
                >
                  Vishal Kumar
                </h2>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 uppercase tracking-wider"
                  style={{
                    backgroundColor: isLight ? "rgba(216, 137, 22, 0.15)" : "rgba(216, 137, 22, 0.2)",
                    borderColor: "#D88916",
                    color: isLight ? "#B9680D" : "#F2B333",
                  }}
                >
                  Sādhaka
                </span>
              </div>
              <p
                className="text-xs font-sanskrit mt-0.5"
                style={{ color: isLight ? "#8A7763" : "#B9A995" }}
              >
                साधना स्तर ३ • ज्ञान एवं कर्म योग खोजी
              </p>
              <p
                className="text-[11px] mt-0.5 truncate"
                style={{ color: isLight ? "#6B5844" : "#8A7961" }}
              >
                vishal.kr.gupta@gmail.com
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Sacred Streak Card */}
          <div
            className="p-4 rounded-2xl border"
            style={{
              backgroundColor: isLight ? "#FFFFFF" : isFestival ? "#5E111C" : "rgba(36, 22, 13, 0.6)",
              borderColor: isLight ? "#E6D7C3" : "rgba(216, 137, 22, 0.3)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                  <Flame className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: isLight ? "#3A2818" : "#F4E9D2" }}>
                    Daily Sacred Streak
                  </div>
                  <div className="text-[10px]" style={{ color: isLight ? "#8A7763" : "#B9A995" }}>
                    नित्य नियम • Daily Shloka Contemplation
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-amber-500">
                  {streakData.currentStreak || 7} Days
                </div>
                <div className="text-[10px] text-emerald-500 font-semibold">Active Today ✓</div>
              </div>
            </div>

            {/* Weekly Habit Dots */}
            <div className="grid grid-cols-7 gap-2 pt-2 border-t border-white/5">
              {daysOfWeek.map((day, idx) => {
                const isCompleted = idx <= currentDayIndex;
                const isToday = idx === currentDayIndex;
                return (
                  <div key={idx} className="flex flex-col items-center space-y-1">
                    <span className="text-[10px] font-bold" style={{ color: isLight ? "#8A7763" : "#8A7961" }}>
                      {day}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? "bg-amber-500 text-stone-950 shadow-sm"
                          : isLight
                          ? "bg-stone-200 text-stone-400"
                          : "bg-white/5 text-stone-600"
                      } ${isToday ? "ring-2 ring-amber-400" : ""}`}
                    >
                      {isCompleted ? "✓" : "·"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* 1. Saved */}
            <div
              onClick={() => handleNavigate("my-journey")}
              className="p-3 rounded-2xl border text-center cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
              style={{
                backgroundColor: isLight ? "#FFFFFF" : isFestival ? "#5E111C" : "rgba(36, 22, 13, 0.6)",
                borderColor: isLight ? "#E6D7C3" : "rgba(255, 255, 255, 0.08)",
              }}
            >
              <Bookmark className="w-4 h-4 mx-auto mb-1 text-amber-500" />
              <div className="text-base font-extrabold" style={{ color: isLight ? "#3A2818" : "#F4E9D2" }}>
                {savedCount}
              </div>
              <div className="text-[10px]" style={{ color: isLight ? "#8A7763" : "#B9A995" }}>
                Saved Verses
              </div>
            </div>

            {/* 2. Reflections */}
            <div
              onClick={() => handleNavigate("my-journey")}
              className="p-3 rounded-2xl border text-center cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
              style={{
                backgroundColor: isLight ? "#FFFFFF" : isFestival ? "#5E111C" : "rgba(36, 22, 13, 0.6)",
                borderColor: isLight ? "#E6D7C3" : "rgba(255, 255, 255, 0.08)",
              }}
            >
              <Feather className="w-4 h-4 mx-auto mb-1 text-rose-400" />
              <div className="text-base font-extrabold" style={{ color: isLight ? "#3A2818" : "#F4E9D2" }}>
                {journalCount || 3}
              </div>
              <div className="text-[10px]" style={{ color: isLight ? "#8A7763" : "#B9A995" }}>
                Reflections
              </div>
            </div>

            {/* 3. Audio Chants */}
            <div
              onClick={() => handleNavigate("today")}
              className="p-3 rounded-2xl border text-center cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
              style={{
                backgroundColor: isLight ? "#FFFFFF" : isFestival ? "#5E111C" : "rgba(36, 22, 13, 0.6)",
                borderColor: isLight ? "#E6D7C3" : "rgba(255, 255, 255, 0.08)",
              }}
            >
              <Volume2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              <div className="text-base font-extrabold" style={{ color: isLight ? "#3A2818" : "#F4E9D2" }}>
                48m
              </div>
              <div className="text-[10px]" style={{ color: isLight ? "#8A7763" : "#B9A995" }}>
                Chanting Time
              </div>
            </div>
          </div>

          {/* Sādhaka Membership Banner */}
          <div
            className="p-4 rounded-2xl border relative overflow-hidden"
            style={{
              background: isLight
                ? "linear-gradient(135deg, #F6EDE1, #FFFBF5)"
                : isFestival
                ? "linear-gradient(135deg, #7A1825, #4B0E17)"
                : "linear-gradient(135deg, #2E1C12, #1C120B)",
              borderColor: "#D88916",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <Crown className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                  <span className="text-xs font-bold" style={{ color: isLight ? "#3A2818" : "#F4E9D2" }}>
                    Sādhaka Sacred Membership
                  </span>
                </div>
                <p className="text-[11px]" style={{ color: isLight ? "#8A7763" : "#B9A995" }}>
                  Unlimited chants, offline audio packs, and guided paths.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPricing();
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
              >
                Upgrade
              </button>
            </div>
          </div>

          {/* Quick Atmosphere Selector (Dark, Light, Festival) */}
          {onSelectTheme && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5" style={{ color: isLight ? "#6B5844" : "#D88916" }}>
                <Palette className="w-3.5 h-3.5" />
                <span>SACRED ATMOSPHERE (DESIGN SYSTEM)</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl border" style={{ backgroundColor: isLight ? "#FFFFFF" : "rgba(0,0,0,0.3)", borderColor: isLight ? "#E6D7C3" : "rgba(255,255,255,0.08)" }}>
                <button
                  type="button"
                  onClick={() => onSelectTheme("sandstone")}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center space-y-0.5 transition-all cursor-pointer ${
                    theme === "sandstone"
                      ? "bg-amber-500 text-stone-950 shadow"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span>🏛️</span>
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTheme("light")}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center space-y-0.5 transition-all cursor-pointer ${
                    theme === "light"
                      ? "bg-amber-500 text-stone-950 shadow"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span>☀️</span>
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTheme("festival")}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center space-y-0.5 transition-all cursor-pointer ${
                    theme === "festival"
                      ? "bg-amber-500 text-stone-950 shadow"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span>🪔</span>
                  <span>Festival</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTheme("amethyst")}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center space-y-0.5 transition-all cursor-pointer ${
                    theme === "amethyst"
                      ? "bg-purple-400 text-stone-950 shadow"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span>🔮</span>
                  <span>Amethyst</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Action Links */}
          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => handleNavigate("my-journey")}
              className="w-full py-3 px-4 rounded-xl border flex items-center justify-between text-xs font-bold transition-all hover:bg-white/5 active:scale-[0.99] cursor-pointer"
              style={{
                borderColor: isLight ? "#E6D7C3" : "rgba(255, 255, 255, 0.08)",
                color: isLight ? "#3A2818" : "#F4E9D2",
              }}
            >
              <div className="flex items-center space-x-2.5">
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span>View Full Sādhana Journey & Saved Verses</span>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDonation();
              }}
              className="w-full py-3 px-4 rounded-xl border flex items-center justify-between text-xs font-bold transition-all hover:bg-white/5 active:scale-[0.99] cursor-pointer"
              style={{
                borderColor: isLight ? "#E6D7C3" : "rgba(255, 255, 255, 0.08)",
                color: isLight ? "#3A2818" : "#F4E9D2",
              }}
            >
              <div className="flex items-center space-x-2.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                <span>Sacred Gurudakshina / Seva (80G Exemption)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div
          className="p-4 border-t text-center text-[10px]"
          style={{
            borderColor: isLight ? "#E6D7C3" : "rgba(255, 255, 255, 0.08)",
            color: isLight ? "#8A7763" : "#8A7961",
            backgroundColor: isLight ? "#F6EDE1" : "rgba(0, 0, 0, 0.2)",
          }}
        >
          ॐ स्पर्श से संस्कार, विचार से विस्तार • SutraSparsh Sādhana Engine
        </div>
      </div>
    </div>
  );
};
