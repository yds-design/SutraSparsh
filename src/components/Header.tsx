import React from "react";
import { Sparkles, BookOpen, Sun, Activity, Volume2, VolumeX, Bookmark } from "lucide-react";
import { soundEngine } from "../utils/audio";

interface HeaderProps {
  activeTab: "explorer" | "daily" | "journal" | "importer";
  setActiveTab: (tab: "explorer" | "daily" | "journal" | "importer") => void;
  savedCount: number;
  backendOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  backendOnline,
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
              id="tab-importer"
              onClick={() => setActiveTab("importer")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === "importer"
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/30 shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
              }`}
            >
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Pipeline Status</span>
              <span className="md:hidden">Pipeline</span>
            </button>
          </nav>

          {/* Action buttons (Audio Drone + Backend indicator) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              id="btn-drone-soundscape"
              onClick={toggleSoundscape}
              title={isDroneActive ? "Mute Tanpura Drone (136.1Hz)" : "Play Meditative Tanpura Ambience"}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all border ${
                isDroneActive
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-200 animate-pulse"
                  : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
              }`}
            >
              {isDroneActive ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden lg:inline">{isDroneActive ? "Om Drone On" : "Om Drone"}</span>
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
