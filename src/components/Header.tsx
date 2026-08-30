import React from "react";
import {
  Sparkles,
  BookOpen,
  Sun,
  Bookmark,
  ShieldCheck,
  Volume2,
  VolumeX,
  Zap,
  Heart,
  Crown,
} from "lucide-react";
import { soundEngine } from "../utils/audio";

export type NavTab = "daily-app" | "explorer" | "daily" | "journal" | "membership" | "admin";

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  savedCount: number;
  backendOnline: boolean;
  onOpenPricing?: () => void;
  onOpenDonation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  backendOnline,
  onOpenPricing,
  onOpenDonation,
}) => {
  const [isDroneActive, setIsDroneActive] = React.useState(false);

  const toggleSoundscape = () => {
    const active = soundEngine.toggleTanpuraDrone();
    setIsDroneActive(active);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("explorer")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
              <span className="font-sanskrit text-xl font-bold">ॐ</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif-sacred text-lg sm:text-xl font-bold tracking-wider text-amber-100">
                  SutraSparsh
                </span>
                <span className="font-sanskrit text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  सूत्रस्पर्श
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-light hidden sm:block">
                Spiritual Wisdom & Sacred Scriptures Engine
              </p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="tab-daily-app"
              onClick={() => setActiveTab("daily-app")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === "daily-app"
                  ? "bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-200 border border-amber-400/50 shadow-md ring-1 ring-amber-400/30"
                  : "text-amber-300/80 hover:text-amber-200 hover:bg-stone-900 bg-amber-500/5 border border-amber-500/20"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Daily Shloka App</span>
              <span className="text-[10px] bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full font-bold uppercase hidden md:inline">
                Preview
              </span>
            </button>

            <button
              id="tab-explorer"
              onClick={() => setActiveTab("explorer")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === "explorer"
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/30 shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Explorer</span>
            </button>

            <button
              id="tab-daily"
              onClick={() => setActiveTab("daily")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === "daily"
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/30 shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Daily Sutra</span>
              <span className="sm:hidden">Daily</span>
            </button>

            <button
              id="tab-journal"
              onClick={() => setActiveTab("journal")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors relative ${
                activeTab === "journal"
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/30 shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
              }`}
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>Journal</span>
              {savedCount > 0 && (
                <span className="bg-amber-500/30 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              id="tab-membership"
              onClick={() => setActiveTab("membership")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === "membership"
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/30 shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">My Subscription</span>
              <span className="sm:hidden">Plan</span>
            </button>

            <button
              id="tab-admin"
              onClick={() => setActiveTab("admin")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === "admin"
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/30 shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Admin & Operations</span>
              <span className="md:hidden">Admin</span>
            </button>
          </nav>

          {/* Action buttons (Monetization Quick CTAs + Audio Drone + Backend indicator) */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {onOpenDonation && (
              <button
                onClick={onOpenDonation}
                className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/30 border border-rose-800/40 hover:border-rose-700 transition-all"
                title="Sacred Gurudakshina & Seva (80G Tax Exemption)"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                <span>Seva / 80G</span>
              </button>
            )}

            {onOpenPricing && (
              <button
                onClick={onOpenPricing}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-stone-950 shadow hover:scale-105 active:scale-95 transition-all"
                title="Upgrade to Sādhaka Sacred Membership"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Sādhaka</span>
              </button>
            )}

            <button
              id="btn-drone-soundscape"
              onClick={toggleSoundscape}
              title={isDroneActive ? "Mute Tanpura Drone (136.1Hz)" : "Play Meditative Tanpura Ambience"}
              className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-xs transition-all border ${
                isDroneActive
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-200 animate-pulse"
                  : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
              }`}
            >
              {isDroneActive ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] border ${
                backendOnline
                  ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                  : "bg-amber-950/40 border-amber-800/60 text-amber-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${backendOnline ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`}
              />
              <span className="hidden sm:inline">{backendOnline ? "API Live" : "API Ready"}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
