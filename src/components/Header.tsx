import React from "react";
import {
  Sun,
  BookOpen,
  Search,
  Compass,
  Bookmark,
  ShieldCheck,
  Volume2,
  VolumeX,
  Zap,
  Heart,
  Crown,
  Sliders,
  User,
  LogIn,
  LogOut,
  Sparkles,
  Users,
  UserCheck,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  AlertCircle,
  Database,
} from "lucide-react";
import { soundEngine } from "../utils/audio";
import { authService, type SeekerUser } from "../services/auth.service";
import { communityService } from "../services/community.service";
import { useFeatureFlags } from "../services/feature-flags.service";
import { firestoreSyncService, type SyncStatus } from "../services/firestore-sync.service";
import { type AppTheme } from "../types";

export type NavTab =
  | "today"
  | "explore"
  | "search"
  | "services"
  | "community"
  | "my-journey"
  | "preferences"
  | "daily-app"
  | "explorer"
  | "daily"
  | "journal"
  | "membership";

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  savedCount: number;
  backendOnline: boolean;
  theme?: AppTheme;
  onToggleTheme?: () => void;
  onOpenProfile?: () => void;
  onOpenPricing?: () => void;
  onOpenDonation?: () => void;
  onOpenAdminConsole?: () => void;
  onOpenAuth?: () => void;
  onOpenAssets?: () => void;
  onOpenLookCloser?: () => void;
  onOpenWordExplorer?: () => void;
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  backendOnline,
  theme = "sandstone",
  onToggleTheme,
  onOpenProfile,
  onOpenPricing,
  onOpenDonation,
  onOpenAdminConsole,
  onOpenAuth,
  onOpenAssets,
  onOpenLookCloser,
  onOpenWordExplorer,
  onManualSync,
}) => {
  const { isSadhakaEnabled, isGurudakshinaEnabled } = useFeatureFlags();
  const [currentUser, setCurrentUser] = React.useState<SeekerUser | null>(() =>
    authService.getCurrentUser()
  );
  const [isDroneActive, setIsDroneActive] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>(() =>
    firestoreSyncService.getStatus()
  );
  const [isManualSyncing, setIsManualSyncing] = React.useState(false);

  React.useEffect(() => {
    const unsubAuth = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    const unsubSync = firestoreSyncService.subscribeStatus((status) => {
      setSyncStatus(status);
    });
    return () => {
      unsubAuth();
      unsubSync();
    };
  }, []);

  const handleTriggerSync = async () => {
    if (isManualSyncing) return;
    setIsManualSyncing(true);
    try {
      if (onManualSync) {
        await onManualSync();
      } else {
        await firestoreSyncService.reconcileData(
          currentUser?.uid || "guest_seeker",
          [],
          []
        );
      }
    } finally {
      setTimeout(() => setIsManualSyncing(false), 600);
    }
  };

  const formatLastSync = (isoString: string | null) => {
    if (!isoString) return "Real-time";
    try {
      const date = new Date(isoString);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 10) return "Just now";
      if (diffSec < 60) return `${diffSec}s ago`;
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Synced";
    }
  };
  const isLight = theme === "light";
  const isFestival = theme === "festival";
  const isAmethyst = theme === "amethyst";
  const isGoldenHour = theme === "golden-hour";
  const isPrismPulse = theme === "prism-pulse";
  const isSandstone = theme === "sandstone" || (!isLight && !isFestival && !isAmethyst && !isGoldenHour && !isPrismPulse);

  const toggleSoundscape = () => {
    const active = soundEngine.toggleTanpuraDrone();
    setIsDroneActive(active);
  };

  const isTodayActive = activeTab === "today" || activeTab === "daily-app" || activeTab === "daily";
  const isExploreActive = activeTab === "explore" || activeTab === "explorer";
  const isSearchActive = activeTab === "search";
  const isCommunityActive = activeTab === "community";
  const isJourneyActive = activeTab === "my-journey" || activeTab === "journal" || activeTab === "membership";
  const isPreferencesActive = activeTab === "preferences";

  const headerBg = isLight
    ? "rgba(251, 248, 238, 0.96)"
    : isFestival
    ? "rgba(75, 14, 23, 0.94)"
    : isAmethyst
    ? "rgba(15, 10, 26, 0.94)"
    : isGoldenHour
    ? "rgba(24, 17, 11, 0.94)"
    : "rgba(18, 13, 9, 0.94)";

  const headerBorder = isLight
    ? "#E8DCC2"
    : isFestival
    ? "rgba(255, 138, 0, 0.3)"
    : isAmethyst
    ? "rgba(196, 168, 230, 0.2)"
    : isGoldenHour
    ? "rgba(201, 130, 43, 0.35)"
    : "rgba(216, 137, 22, 0.2)";

  const brandTextColor = isLight ? "#261B12" : isFestival ? "#FFF6E3" : isGoldenHour ? "#FFF4D8" : "#F4E9D2";

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-300 overflow-x-hidden"
      style={{
        backgroundColor: headerBg,
        borderColor: headerBorder,
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18 lg:h-20">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none group touch-manipulation"
            onClick={() => setActiveTab("today")}
            role="button"
            aria-label="SutraSparsh Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105 border border-amber-500/20 flex-shrink-0 bg-[#ECECEC]">
              <img
                src="/icon.png"
                alt="SutraSparsh Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span
                  className="font-serif-sacred text-base sm:text-xl font-bold tracking-tight"
                  style={{ color: brandTextColor }}
                >
                  SutraSparsh
                </span>
                <span
                  className="font-sanskrit text-[10px] sm:text-xs px-1.5 py-0.5 rounded border hidden xs:inline"
                  style={{
                    backgroundColor: isLight ? "#FBEFD3" : isSandstone ? "rgba(232,146,26,0.12)" : "rgba(196,168,230,0.12)",
                    borderColor: isLight ? "#E8CF9A" : isSandstone ? "rgba(232,146,26,0.3)" : "rgba(196,168,230,0.3)",
                    color: isLight ? "#874606" : isSandstone ? "#F4B24B" : "#D4BEF2",
                  }}
                >
                  सूत्रस्पर्श
                </span>
              </div>
              <p
                className={`text-[10px] sm:text-[11px] font-light hidden 2xl:block truncate max-w-sm ${
                  isLight ? "text-[#6E5C4E]" : "text-stone-400"
                }`}
              >
                A sacred space to discover, understand, and reflect on timeless wisdom
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on Mobile & Tablet to prevent horizontal overflow; handled by BottomNav) */}
          <nav
            aria-label="Main Desktop Navigation"
            className="hidden md:flex items-center space-x-1 lg:space-x-1.5 flex-shrink-0"
          >
            {/* 1. TODAY */}
            <button
              id="tab-today"
              type="button"
              onClick={() => setActiveTab("today")}
              className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isTodayActive
                  ? isLight
                    ? "bg-[#FBEFD3] text-[#874606] border border-[#DECB9F] shadow-xs ring-1 ring-amber-400/30 font-bold"
                    : "bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm ring-1 ring-amber-400/20"
                  : isLight
                  ? "text-[#69574A] hover:text-[#261B12] hover:bg-[#F5EEDB]"
                  : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Today</span>
              <span className={`text-[10px] font-sanskrit hidden 2xl:inline ${isLight ? "text-[#874606]" : "text-amber-400/80"}`}>आज</span>
            </button>

            {/* 2. EXPLORE */}
            <button
              id="tab-explore"
              type="button"
              onClick={() => setActiveTab("explore")}
              className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isExploreActive
                  ? isLight
                    ? "bg-[#FBEFD3] text-[#874606] border border-[#DECB9F] shadow-xs ring-1 ring-amber-400/30 font-bold"
                    : "bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm ring-1 ring-amber-400/20"
                  : isLight
                  ? "text-[#69574A] hover:text-[#261B12] hover:bg-[#F5EEDB]"
                  : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Explore</span>
              <span className={`text-[10px] font-sanskrit hidden 2xl:inline ${isLight ? "text-[#874606]" : "text-amber-400/80"}`}>दर्शन</span>
            </button>

            {/* 3. SEARCH */}
            <button
              id="tab-search"
              type="button"
              onClick={() => setActiveTab("search")}
              className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isSearchActive
                  ? isLight
                    ? "bg-[#FBEFD3] text-[#874606] border border-[#DECB9F] shadow-xs ring-1 ring-amber-400/30 font-bold"
                    : "bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm ring-1 ring-amber-400/20"
                  : isLight
                  ? "text-[#69574A] hover:text-[#261B12] hover:bg-[#F5EEDB]"
                  : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
              }`}
            >
              <Search className="w-4 h-4 text-amber-500" />
              <span>Search</span>
              <span className={`text-[10px] font-sanskrit hidden 2xl:inline ${isLight ? "text-[#874606]" : "text-amber-400/80"}`}>खोज</span>
            </button>

            {/* 4. COMMUNITY (SATSANG MANDALI) */}
            <button
              id="tab-community"
              type="button"
              onClick={() => setActiveTab("community")}
              className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 relative cursor-pointer ${
                isCommunityActive
                  ? isLight
                    ? "bg-[#FBEFD3] text-[#874606] border border-[#DECB9F] shadow-xs ring-1 ring-amber-400/30 font-bold"
                    : "bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm ring-1 ring-amber-400/20"
                  : isLight
                  ? "text-[#69574A] hover:text-[#261B12] hover:bg-[#F5EEDB]"
                  : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
              }`}
              title="Satsang Mandali: Sacred In-App Community Board & Discussions"
            >
              <Users className="w-4 h-4 text-amber-500" />
              <span>Community</span>
              <span className={`text-[10px] font-sanskrit hidden 2xl:inline ${isLight ? "text-[#874606]" : "text-amber-400/80"}`}>सत्संग</span>
              {/* Unread activity dot (FR-NAV-01) */}
              {communityService.getUnreadNotificationCount() > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-stone-950 animate-pulse" />
              )}
            </button>

            {/* 4c. SERVICES (VEDIC PUROHIT DIRECTORY) */}
            <button
              id="tab-services"
              type="button"
              onClick={() => setActiveTab("services")}
              className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 relative cursor-pointer ${
                activeTab === "services"
                  ? isLight
                    ? "bg-[#FBEFD3] text-[#874606] border border-[#DECB9F] shadow-xs ring-1 ring-amber-400/30 font-bold"
                    : "bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm ring-1 ring-amber-400/20"
                  : isLight
                  ? "text-[#69574A] hover:text-[#261B12] hover:bg-[#F5EEDB]"
                  : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
              }`}
              title="Vedic Purohit Directory: Direct Zero-Fee Connection with Verified Priests"
            >
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>Services</span>
              <span className={`text-[10px] font-sanskrit hidden 2xl:inline ${isLight ? "text-[#874606]" : "text-amber-400/80"}`}>सेवा</span>
            </button>

            {/* WORD EXPLORER / LOOK CLOSER */}
            {(onOpenLookCloser || onOpenWordExplorer) && (
              <button
                id="btn-nav-look-closer"
                type="button"
                onClick={() => {
                  if (onOpenLookCloser) onOpenLookCloser();
                  else if (onOpenWordExplorer) onOpenWordExplorer();
                }}
                title="Look Closer: Explore Sanskrit Word Components, Roots & Grammar"
                className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isLight
                    ? "bg-[#FFF7E6] text-[#783C00] hover:bg-[#FBEFD3] border border-[#D8A856] shadow-xs"
                    : "bg-amber-500/15 text-amber-200 hover:bg-amber-500/25 border border-amber-500/30"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Look Closer</span>
                <span className={`text-[10px] font-sanskrit hidden 2xl:inline ${isLight ? "text-[#783C00]" : "text-amber-400/80"}`}>
                  पद-बोध
                </span>
              </button>
            )}

            {/* 5. PREFERENCES / SETTINGS (Icon-only, accessible label) */}
            <button
              id="tab-preferences"
              type="button"
              onClick={() => setActiveTab("preferences")}
              title="Sacred Atmosphere, Recitation & Settings"
              aria-label="Settings"
              className={`p-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isPreferencesActive
                  ? isLight
                    ? "bg-amber-100 text-amber-950 border border-amber-300 shadow-xs ring-1 ring-amber-400/30"
                    : "bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm ring-1 ring-amber-400/20"
                  : isLight
                  ? "text-stone-700 hover:text-stone-950 hover:bg-stone-200/60"
                  : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-500" />
            </button>
          </nav>

          {/* Action Group: Theme, Tanpura, Profile, Seva, Sadhaka, Admin, API Live */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
            {/* Theme Toggle Button (Icon-focused to save critical space) */}
            {onToggleTheme && (
              <button
                id="btn-toggle-theme"
                type="button"
                onClick={onToggleTheme}
                aria-label={`Atmosphere: ${theme === "light" ? "Parchment Dawn" : "Golden Hour"}. Click to toggle sacred theme.`}
                title={`Atmosphere: ${theme === "light" ? "Parchment Dawn (☀️)" : "Golden Hour (🌅)"} (Click to toggle)`}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border text-xs font-bold transition-all duration-500 active:scale-90 flex items-center justify-center touch-manipulation cursor-pointer hover:scale-105"
                style={{
                  backgroundColor: isLight
                    ? "rgba(216,137,22,0.15)"
                    : isPrismPulse
                    ? "rgba(147,107,250,0.15)"
                    : isFestival
                    ? "rgba(255,138,0,0.2)"
                    : isAmethyst
                    ? "rgba(196,168,230,0.18)"
                    : isGoldenHour
                    ? "rgba(201,130,43,0.25)"
                    : "rgba(232,146,26,0.18)",
                  borderColor: isLight
                    ? "#D88916"
                    : isPrismPulse
                    ? "#936BFA"
                    : isFestival
                    ? "#FF8A00"
                    : isAmethyst
                    ? "rgba(196,168,230,0.45)"
                    : isGoldenHour
                    ? "#C9822B"
                    : "rgba(232,146,26,0.45)",
                  color: isLight
                    ? "#3A2818"
                    : isPrismPulse
                    ? "#936BFA"
                    : isFestival
                    ? "#FDE68A"
                    : isAmethyst
                    ? "#D4BEF2"
                    : isGoldenHour
                    ? "#F6DFA6"
                    : "#F4B24B",
                }}
              >
                <span className="text-sm">
                  {isLight ? "☀️" : isFestival ? "🪔" : isAmethyst ? "🔮" : isGoldenHour ? "🌅" : isPrismPulse ? "⚡" : "🏛️"}
                </span>
              </button>
            )}

            {/* Ambient Soundscape & Tanpura Drone Audio Button (Icon-focused) */}
            <button
              id="btn-drone-soundscape"
              type="button"
              onClick={toggleSoundscape}
              aria-label={isDroneActive ? "Mute Ambient Soundscape" : "Play Meditative Ambient Soundscape"}
              title={isDroneActive ? "Mute Ambient Soundscape" : "Play Meditative Ambient Soundscape (Temple Bell / Himalayan Breeze / River Ganga)"}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs transition-all duration-150 border flex items-center justify-center touch-manipulation cursor-pointer active:scale-95 ${
                isDroneActive
                  ? "bg-amber-500/25 border-amber-500/60 text-amber-200 animate-pulse shadow-[0_0_12px_rgba(232,146,26,0.3)]"
                  : isLight
                  ? "bg-[#FFF7E6] border-[#E8DCC2] text-[#6E5C4E] hover:text-[#261B12] hover:bg-[#F5EEDB]"
                  : "bg-white/5 border-white/10 text-stone-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {isDroneActive ? (
                <Volume2 className={`w-4 h-4 ${isLight ? "text-[#874606]" : "text-amber-400"}`} />
              ) : (
                <VolumeX className={`w-4 h-4 ${isLight ? "text-[#6E5C4E]" : "text-stone-400"}`} />
              )}
            </button>

            {/* Auth Sign In / User Account Screen Button */}
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl border flex items-center space-x-1.5 text-xs font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: currentUser
                    ? isLight
                      ? "rgba(216, 137, 22, 0.15)"
                      : "rgba(255, 255, 255, 0.08)"
                    : isLight
                    ? "#FAF6EE"
                    : "rgba(216, 137, 22, 0.15)",
                  borderColor: isLight ? "#D88916" : "rgba(216, 137, 22, 0.4)",
                  color: isLight ? "#3A2818" : "#F4E9D2",
                }}
                title={
                  currentUser
                    ? `Signed in as ${currentUser.displayName} (${currentUser.email}). Click to manage or Sign Off.`
                    : "Sign In via Gmail / Firebase or Email ID"
                }
              >
                {currentUser ? (
                  <>
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-[9px] flex items-center justify-center">
                      {currentUser.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline font-mono text-[11px] truncate max-w-[90px]">
                      {currentUser.displayName.split(" ")[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline text-[11px]">Sign In</span>
                  </>
                )}
              </button>
            )}

            {/* Sādhaka Profile Button (Icon-focused with Om badge) */}
            {onOpenProfile && (
              <button
                id="btn-open-sadhaka-profile"
                type="button"
                onClick={onOpenProfile}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-semibold border flex items-center justify-center touch-manipulation cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm"
                style={{
                  backgroundColor: isLight ? "rgba(216, 137, 22, 0.12)" : "rgba(255, 255, 255, 0.08)",
                  borderColor: isLight ? "#D88916" : "rgba(216, 137, 22, 0.4)",
                  color: isLight ? "#3A2818" : "#F4E9D2",
                }}
                title="Sādhaka Profile, Sacred Streaks & Spiritual Stats (7d streak active)"
                aria-label="Open Sādhaka Profile"
              >
                <div className="w-5 h-5 rounded-full bg-amber-500/25 text-amber-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  ॐ
                </div>
              </button>
            )}

            {/* Sacred Gurudakshina & Seva Button (Phase 2 Feature: Disabled by default) */}
            {onOpenDonation && isGurudakshinaEnabled && (
              <button
                type="button"
                onClick={onOpenDonation}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs text-rose-300 hover:text-rose-200 bg-rose-950/30 border border-rose-800/40 hover:border-rose-700 transition-all cursor-pointer"
                title="Sacred Gurudakshina & Seva (80G Tax Exemption)"
                aria-label="Seva"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
              </button>
            )}

            {/* Sādhaka Sacred Membership Button (Phase 2 Feature: Disabled by default) */}
            {onOpenPricing && isSadhakaEnabled && (
              <button
                type="button"
                onClick={onOpenPricing}
                className="hidden md:flex h-8 sm:h-9 px-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-stone-950 shadow-md hover:scale-105 active:scale-95 transition-all items-center space-x-1 touch-manipulation cursor-pointer"
                title="Upgrade to Sādhaka Sacred Membership"
                aria-label="Sādhaka Membership"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Sādhaka</span>
              </button>
            )}

            {/* Admin Gateway Button - Exclusively enabled on screen / desktop workstations */}
            {onOpenAdminConsole && (
              <button
                id="btn-open-admin-console"
                type="button"
                onClick={onOpenAdminConsole}
                className="hidden lg:flex w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 text-stone-400 hover:text-amber-300 items-center justify-center transition-colors cursor-pointer"
                title="Open SutraSparsh Admin Console (Screen / Desktop Only)"
                aria-label="Admin Console"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {/* Visual Real-Time Firestore Sync Status Indicator */}
            <button
              id="firestore-sync-indicator"
              type="button"
              onClick={handleTriggerSync}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded-full text-[10px] sm:text-[10.5px] font-semibold border transition-all cursor-pointer shadow-xs active:scale-95 ${
                isManualSyncing || syncStatus.state === "syncing"
                  ? isLight
                    ? "bg-[#FFF2D6] border-[#D97706]/50 text-[#874606]"
                    : "bg-amber-950/40 border-amber-500/50 text-amber-300"
                  : syncStatus.state === "error"
                  ? "bg-rose-950/40 border-rose-500/50 text-rose-300"
                  : syncStatus.state === "offline"
                  ? isLight
                    ? "bg-[#F5EEDB] border-[#E8DCC2] text-[#6E5C4E]"
                    : "bg-stone-900 border-stone-800 text-stone-400"
                  : isLight
                  ? "bg-[#EBF7EE] border-[#86EFAC] text-[#166534]"
                  : "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              }`}
              title={`Firestore Database: ${
                isManualSyncing || syncStatus.state === "syncing"
                  ? "Reconciling background changes..."
                  : syncStatus.state === "error"
                  ? `Sync Alert: ${syncStatus.error || "Connection issue"}`
                  : syncStatus.state === "offline"
                  ? "Local Sanctuary Cache"
                  : `Real-time Synced (${formatLastSync(syncStatus.lastSyncedAt)})`
              } • Tap to reconcile now`}
              aria-label="Firestore Connection & Sync Status"
            >
              {isManualSyncing || syncStatus.state === "syncing" ? (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-500 animate-spin flex-shrink-0" />
                  <span className="hidden sm:inline font-mono">Syncing...</span>
                </>
              ) : syncStatus.state === "error" ? (
                <>
                  <AlertCircle className="w-3 h-3 text-rose-400 flex-shrink-0" />
                  <span className="hidden sm:inline font-mono">Offline / Retry</span>
                </>
              ) : syncStatus.state === "offline" ? (
                <>
                  <CloudOff className="w-3 h-3 text-stone-400 flex-shrink-0" />
                  <span className="hidden sm:inline font-mono">Offline</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.95)]"></span>
                  </span>
                  <CloudCheck className="w-3 h-3 text-emerald-500 flex-shrink-0 hidden xs:inline" />
                  <span className="hidden sm:inline font-mono">Firestore</span>
                </>
              )}
            </button>

            {/* API Engine Pulsating Orange Dot - Screen / Desktop Toolbar only (Moved to Bottom Toolbar on Mobile) */}
            <div
              id="api-engine-indicator"
              className="hidden md:flex items-center space-x-1.5 px-2 py-1 rounded-full text-[10px] sm:text-[10.5px] font-semibold border bg-orange-950/40 border-orange-500/40 text-orange-300 flex-shrink-0 shadow-sm"
              title="API Engine: Online & Synced (Screen Toolbar)"
              aria-label="API Engine Live"
            >
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.95)]"></span>
              </span>
              <span className="whitespace-nowrap tracking-wide font-sans">API Engine</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
