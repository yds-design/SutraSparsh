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
  LogOut,
  LogIn,
  FileText,
} from "lucide-react";
import { soundEngine } from "../utils/audio";
import { progressService, type StreakData } from "../services/progress.service";
import { authService, type SeekerUser } from "../services/auth.service";
import { useFeatureFlags } from "../services/feature-flags.service";
import { CloudSyncStatusBadge } from "./CloudSyncStatusBadge";
import { ModalPortal } from "./ModalPortal";
import type { AppTheme } from "../types";

interface SadhakaProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCount: number;
  journalCount: number;
  theme?: AppTheme;
  onSelectTheme?: (theme: AppTheme) => void;
  onNavigateTab: (tab: string) => void;
  onOpenPricing: () => void;
  onOpenDonation: () => void;
  onOpenAuth?: () => void;
  onOpenPrivacy?: () => void;
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
  onOpenAuth,
  onOpenPrivacy,
}) => {
  const { isSadhakaEnabled, isGurudakshinaEnabled } = useFeatureFlags();
  const [streakData, setStreakData] = React.useState<StreakData>(() =>
    progressService.getStreakData()
  );
  const [currentUser, setCurrentUser] = React.useState<SeekerUser | null>(() =>
    authService.getCurrentUser()
  );

  React.useEffect(() => {
    const unsubStreak = progressService.subscribeStreak((streak) => {
      setStreakData(streak);
    });
    const unsubAuth = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return () => {
      unsubStreak();
      unsubAuth();
    };
  }, []);

  if (!isOpen) return null;

  const handleSignOff = async () => {
    soundEngine.playTempleBell(220);
    await authService.signOut();
  };

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
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto overscroll-contain animate-fadeIn backdrop-blur-xl bg-stone-950/80 p-0 sm:p-4 md:p-6 lg:p-8 xl:p-10 pt-0 sm:pt-4 md:pt-6 lg:pt-8 xl:pt-10 pb-24 sm:pb-6 md:pb-8 lg:pb-12"
        style={{
          backgroundColor: isLight ? "rgba(58, 40, 24, 0.45)" : "rgba(0, 0, 0, 0.78)",
        }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-full sm:max-w-lg min-h-dvh sm:min-h-0 sm:my-auto rounded-none sm:rounded-3xl shadow-2xl border overflow-hidden relative transition-all flex flex-col"
        style={{
          backgroundColor: isLight
            ? "#f7f6fb"
            : isFestival
            ? "#4B0E17"
            : isAmethyst
            ? "#140A28"
            : "#1C120B",
          borderColor: isLight
            ? "#cfcbe0"
            : isFestival
            ? "rgba(255, 138, 0, 0.35)"
            : isAmethyst
            ? "rgba(196, 168, 230, 0.3)"
            : "rgba(216, 137, 22, 0.3)",
          color: isLight ? "#1d1b2e" : "#F4E9D2",
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
            borderColor: isLight ? "#cfcbe0" : "rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close Profile"
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            style={{
              backgroundColor: isLight ? "rgba(27, 23, 64, 0.08)" : "rgba(255, 255, 255, 0.1)",
              color: isLight ? "#1b1740" : "#F4E9D2",
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
                  style={{ color: isLight ? "#1b1740" : "#F4E9D2" }}
                >
                  {currentUser ? (currentUser.displayName || currentUser.email || "Sādhaka Seeker") : "Guest Sādhaka"}
                </h2>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 uppercase tracking-wider"
                  style={{
                    backgroundColor: isLight ? "#fbf0d6" : "rgba(216, 137, 22, 0.2)",
                    borderColor: isLight ? "#f0cf8a" : "#D88916",
                    color: isLight ? "#b8801f" : "#F2B333",
                  }}
                >
                  {currentUser ? (currentUser.provider === "google" ? "Google" : "Email") : "Guest"}
                </span>
              </div>
              <p
                className="text-xs font-sanskrit mt-0.5 font-medium"
                style={{ color: isLight ? "#55526b" : "#B9A995" }}
              >
                {currentUser?.spiritualTitle || "साधना स्तर ३ • ज्ञान एवं कर्म योग खोजी"}
              </p>
              <p
                className="text-[11px] mt-0.5 truncate font-mono"
                style={{ color: isLight ? "#55526b" : "#8A7961" }}
              >
                {currentUser ? currentUser.email : "Not signed in • Tap below to link account"}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Sacred Streak Card */}
          <div
            className="p-4 rounded-2xl border shadow-xs"
            style={{
              background: isLight
                ? "#ffffff"
                : isFestival
                ? "#5E111C"
                : "rgba(36, 22, 13, 0.6)",
              borderColor: isLight ? "#cfcbe0" : "rgba(216, 137, 22, 0.3)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                  <Flame className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: isLight ? "#1b1740" : "#F4E9D2" }}>
                    Daily Sacred Streak
                  </div>
                  <div className="text-[10px]" style={{ color: isLight ? "#55526b" : "#B9A995" }}>
                    नित्य नियम • Daily Shloka Contemplation
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-amber-500">
                  {streakData.currentStreak || 4} Days
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">Active Today ✓</div>
              </div>
            </div>

            {/* Weekly Habit Dots */}
            <div className={`grid grid-cols-7 gap-2 pt-2 border-t ${isLight ? "border-[#efedf6]" : "border-white/5"}`}>
              {daysOfWeek.map((day, idx) => {
                const isCompleted = idx <= currentDayIndex;
                const isToday = idx === currentDayIndex;
                return (
                  <div key={idx} className="flex flex-col items-center space-y-1">
                    <span className="text-[10px] font-bold" style={{ color: isLight ? "#55526b" : "#8A7961" }}>
                      {day}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? "bg-amber-500 text-stone-950 shadow-xs"
                          : isLight
                          ? "bg-[#efedf6] text-[#55526b] border border-[#cfcbe0]"
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
              className="p-3 rounded-2xl border text-center cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-xs"
              style={{
                background: isLight
                  ? "#ffffff"
                  : isFestival
                  ? "#5E111C"
                  : "rgba(36, 22, 13, 0.6)",
                borderColor: isLight ? "#cfcbe0" : "rgba(255, 255, 255, 0.08)",
              }}
            >
              <Bookmark className="w-4 h-4 mx-auto mb-1 text-amber-500" />
              <div className="text-base font-extrabold" style={{ color: isLight ? "#1b1740" : "#F4E9D2" }}>
                {savedCount}
              </div>
              <div className="text-[10px] font-medium" style={{ color: isLight ? "#55526b" : "#B9A995" }}>
                Saved Verses
              </div>
            </div>

            {/* 2. Reflections */}
            <div
              onClick={() => handleNavigate("my-journey")}
              className="p-3 rounded-2xl border text-center cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-xs"
              style={{
                background: isLight
                  ? "#ffffff"
                  : isFestival
                  ? "#5E111C"
                  : "rgba(36, 22, 13, 0.6)",
                borderColor: isLight ? "#cfcbe0" : "rgba(255, 255, 255, 0.08)",
              }}
            >
              <Feather className="w-4 h-4 mx-auto mb-1 text-rose-500" />
              <div className="text-base font-extrabold" style={{ color: isLight ? "#1b1740" : "#F4E9D2" }}>
                {journalCount || 3}
              </div>
              <div className="text-[10px] font-medium" style={{ color: isLight ? "#55526b" : "#B9A995" }}>
                Reflections
              </div>
            </div>

            {/* 3. Audio Chants */}
            <div
              onClick={() => handleNavigate("today")}
              className="p-3 rounded-2xl border text-center cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-xs"
              style={{
                background: isLight
                  ? "#ffffff"
                  : isFestival
                  ? "#5E111C"
                  : "rgba(36, 22, 13, 0.6)",
                borderColor: isLight ? "#cfcbe0" : "rgba(255, 255, 255, 0.08)",
              }}
            >
              <Volume2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
              <div className="text-base font-extrabold" style={{ color: isLight ? "#1b1740" : "#F4E9D2" }}>
                48m
              </div>
              <div className="text-[10px] font-medium" style={{ color: isLight ? "#55526b" : "#B9A995" }}>
                Chanting Time
              </div>
            </div>
          </div>

          {/* Sādhaka Membership Banner (Phase 2: Gated) */}
          {isSadhakaEnabled && (
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
          )}

          {/* Multi-Device Cloud Sync Status */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5" style={{ color: isLight ? "#55526b" : "#D88916" }}>
              <span>MULTI-DEVICE CLOUD SYNC (FIRESTORE)</span>
            </div>
            <CloudSyncStatusBadge theme={theme} />
          </div>

          {/* Whitelist Atmosphere Selector: Parchment Dawn & Golden Hour */}
          {onSelectTheme && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider flex items-center justify-between" style={{ color: isLight ? "#55526b" : "#D88916" }}>
                <div className="flex items-center space-x-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  <span>SACRED ATMOSPHERE (THEME WHITELIST)</span>
                </div>
                <span className="text-[10px] font-normal opacity-80">2 Active Themes</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl border" style={{ background: isLight ? "#ffffff" : "rgba(0,0,0,0.3)", borderColor: isLight ? "#cfcbe0" : "rgba(255,255,255,0.08)" }}>
                {/* 1. Parchment Dawn */}
                <button
                  type="button"
                  onClick={() => onSelectTheme("light")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
                    theme === "light"
                      ? "bg-[#d9a441] text-[#100e2b] shadow-sm ring-1 ring-[#b8801f]"
                      : isLight
                      ? "text-[#1b1740] hover:bg-[#efedf6]"
                      : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
                  }`}
                >
                  <span className="text-lg">☀️</span>
                  <div className="text-left">
                    <div className="font-bold">Parchment Dawn</div>
                    <div className={`text-[10px] font-sanskrit ${theme === "light" ? "opacity-90 text-[#100e2b]" : isLight ? "text-[#b8801f]" : "opacity-75"}`}>
                      चन्दन एवं पत्र
                    </div>
                  </div>
                </button>

                {/* 2. Golden Hour */}
                <button
                  type="button"
                  onClick={() => onSelectTheme("golden-hour")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
                    theme === "golden-hour"
                      ? "bg-gradient-to-r from-[#C9822B] to-[#F6DFA6] text-stone-950 shadow-md ring-2 ring-amber-400"
                      : isLight
                      ? "text-[#1b1740] hover:bg-[#efedf6]"
                      : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
                  }`}
                >
                  <span className="text-lg">🌅</span>
                  <div className="text-left">
                    <div className="font-bold">Golden Hour</div>
                    <div className={`text-[10px] font-sanskrit ${theme === "golden-hour" ? "opacity-90" : isLight ? "text-[#b8801f]" : "opacity-75"}`}>
                      गोधूलि वेला
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Action Links */}
          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => handleNavigate("my-journey")}
              className="w-full py-3 px-4 rounded-xl border flex items-center justify-between text-xs font-bold transition-all hover:brightness-105 active:scale-[0.99] cursor-pointer shadow-xs"
              style={{
                background: isLight ? "#ffffff" : undefined,
                borderColor: isLight ? "#cfcbe0" : "rgba(255, 255, 255, 0.08)",
                color: isLight ? "#1b1740" : "#F4E9D2",
              }}
            >
              <div className="flex items-center space-x-2.5">
                <Bookmark className={`w-4 h-4 ${isLight ? "text-[#b8801f]" : "text-amber-400"}`} />
                <span>View Full Sādhana Journey & Saved Verses</span>
              </div>
              <ArrowRight className={`w-4 h-4 ${isLight ? "text-[#b8801f]" : "text-stone-400"}`} />
            </button>

            {isGurudakshinaEnabled && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDonation();
                }}
                className="w-full py-3 px-4 rounded-xl border flex items-center justify-between text-xs font-bold transition-all hover:bg-white/5 active:scale-[0.99] cursor-pointer"
                style={{
                  borderColor: isLight ? "#cfcbe0" : "rgba(255, 255, 255, 0.08)",
                  color: isLight ? "#1b1740" : "#F4E9D2",
                }}
              >
                <div className="flex items-center space-x-2.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                  <span>Sacred Gurudakshina / Seva (80G Exemption)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>
            )}

            {/* Auth Sign In / Sign Off Action */}
            {currentUser ? (
              <button
                onClick={handleSignOff}
                className="w-full py-3 px-4 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/50 text-rose-300 flex items-center justify-between text-xs font-bold transition-all active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Off (साधना विश्राम) • {currentUser.email}</span>
                </div>
                <span className="text-[10px] font-mono text-rose-400/80">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-between text-xs font-bold transition-all active:scale-[0.99] cursor-pointer shadow-xs ${
                  isLight
                    ? "bg-[#fbf0d6] hover:bg-[#f0cf8a] text-[#b8801f] border border-[#f0cf8a]"
                    : "border border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <LogIn className={`w-4 h-4 ${isLight ? "text-[#b8801f]" : "text-amber-400"}`} />
                  <span>Sign In via Gmail / Firebase or Email ID</span>
                </div>
                <ArrowRight className={`w-4 h-4 ${isLight ? "text-[#b8801f]" : "text-amber-400"}`} />
              </button>
            )}

            {/* Legal Privacy Policy Link */}
            {onOpenPrivacy && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPrivacy();
                }}
                className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-[11px] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                <span>Privacy Policy & Data Sovereignty</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div
          className="p-4 border-t text-center text-[10px]"
          style={{
            borderColor: isLight ? "#cfcbe0" : "rgba(255, 255, 255, 0.08)",
            color: isLight ? "#55526b" : "#8A7961",
            backgroundColor: isLight ? "#efedf6" : "rgba(0, 0, 0, 0.2)",
          }}
        >
          ॐ स्पर्श से संस्कार, विचार से विस्तार • SutraSparsh Sādhana Engine
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};
