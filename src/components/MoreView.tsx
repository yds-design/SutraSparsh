import React, { useState } from "react";
import {
  Palette,
  Languages,
  Clock,
  Volume2,
  Bell,
  Sparkles,
  BookOpen,
  Compass,
  Crown,
  Heart,
  ShieldCheck,
  ChevronRight,
  Check,
  User,
  Flame,
  Bookmark,
  Feather,
  Info,
  Sliders,
  ExternalLink,
  Lock,
  Monitor,
} from "lucide-react";
import { soundEngine } from "../utils/audio";
import { recitationEngine } from "../utils/recitationEngine";
import { progressService, type StreakData } from "../services/progress.service";

interface MoreViewProps {
  theme?: "sandstone" | "amethyst" | "light" | "festival";
  onSelectTheme?: (theme: "sandstone" | "amethyst" | "light" | "festival") => void;
  onOpenProfile?: () => void;
  onOpenPricing?: () => void;
  onOpenDonation?: () => void;
  onOpenAdminConsole?: () => void;
  onNavigateTab?: (tab: string) => void;
  savedCount?: number;
  journalCount?: number;
}

export const MoreView: React.FC<MoreViewProps> = ({
  theme = "sandstone",
  onSelectTheme,
  onOpenProfile,
  onOpenPricing,
  onOpenDonation,
  onOpenAdminConsole,
  onNavigateTab,
  savedCount,
  journalCount,
}) => {
  const isLight = theme === "light";
  const isFestival = theme === "festival";
  const isAmethyst = theme === "amethyst";

  // Device classification: Admin Console is strictly enabled ONLY from device: screen
  const [isScreenDevice, setIsScreenDevice] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const isDesktopWidth = window.innerWidth >= 1024;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isDesktopWidth && !isMobileUA;
  });

  React.useEffect(() => {
    const handleResize = () => {
      const isDesktopWidth = window.innerWidth >= 1024;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsScreenDevice(isDesktopWidth && !isMobileUA);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scripture & Reading Preferences state (persisted to localStorage)
  const [prefScript, setPrefScript] = useState<"both" | "devanagari" | "transliteration">(() => {
    try {
      return (localStorage.getItem("sutrasparsh_pref_script") as any) || "both";
    } catch {
      return "both";
    }
  });

  const [prefLang, setPrefLang] = useState<"en" | "hi" | "dual">(() => {
    try {
      return (localStorage.getItem("sutrasparsh_pref_lang") as any) || "dual";
    } catch {
      return "dual";
    }
  });

  const [prefChantSpeed, setPrefChantSpeed] = useState<number>(() => {
    try {
      return parseFloat(localStorage.getItem("sutrasparsh_pref_speed") || "1.0");
    } catch {
      return 1.0;
    }
  });

  const [prefReminder, setPrefReminder] = useState<string>(() => {
    try {
      return localStorage.getItem("sutrasparsh_pref_reminder") || "06:00";
    } catch {
      return "06:00";
    }
  });

  const [streakData, setStreakData] = useState<StreakData>(() =>
    progressService.getStreakData()
  );

  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Sub-dialog view state inside More: 'none' | 'about' | 'glossary' | 'paths'
  const [activeSubView, setActiveSubView] = useState<"none" | "about" | "glossary" | "paths">("none");

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 2800);
  };

  const handleScriptChange = (s: "both" | "devanagari" | "transliteration") => {
    setPrefScript(s);
    try {
      localStorage.setItem("sutrasparsh_pref_script", s);
      window.dispatchEvent(new CustomEvent("sutrasparsh:pref_script", { detail: s }));
    } catch {}
    soundEngine.playTempleBell(330);
    showToast(`Script display updated: ${s === "both" ? "Dual Script" : s === "devanagari" ? "Devanagari Only" : "Roman IAST"}`);
  };

  const handleLangChange = (l: "en" | "hi" | "dual") => {
    setPrefLang(l);
    try {
      localStorage.setItem("sutrasparsh_pref_lang", l);
      window.dispatchEvent(new CustomEvent("sutrasparsh:pref_lang", { detail: l }));
    } catch {}
    soundEngine.playTempleBell(330);
    showToast(`Translation updated: ${l === "dual" ? "English + Hindi" : l === "en" ? "English Only" : "Hindi Only"}`);
  };

  const handleSpeedChange = (speed: number) => {
    setPrefChantSpeed(speed);
    try {
      localStorage.setItem("sutrasparsh_pref_speed", speed.toString());
      window.dispatchEvent(new CustomEvent("sutrasparsh:pref_speed", { detail: speed }));
    } catch {}
    recitationEngine.setPlaybackRate(speed);
    soundEngine.playTempleBell(Math.round(440 * speed));
    showToast(`Recitation chant speed set to ${speed}x`);
  };

  const handleReminderChange = (time: string) => {
    setPrefReminder(time);
    try {
      localStorage.setItem("sutrasparsh_pref_reminder", time);
      window.dispatchEvent(new CustomEvent("sutrasparsh:pref_reminder", { detail: time }));
    } catch {}
    soundEngine.playTempleBell(440);
    showToast(`Brahma Muhurta reminder set to ${time} IST`);
  };

  const handleTestNotification = async () => {
    soundEngine.playTempleBell(440);
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          new Notification("SutraSparsh • प्रातः स्मरण", {
            body: "Brahma Muhurta contemplation: योगः कर्मसु कौशलम् — Gita 2.50",
            icon: "/favicon.ico",
          });
          showToast(`✓ Brahma Muhurta notification triggered for ${prefReminder} IST!`);
          return;
        }
      } catch {}
    }
    showToast(`✓ Sacred reminder bell tested & scheduled for ${prefReminder} IST.`);
  };

  // Color variables according to design assets
  const textPrimary = isLight ? "#3A2818" : isFestival ? "#FFF6E3" : isAmethyst ? "#EDE0F8" : "#F4E9D2";
  const textSecondary = isLight ? "#6B5844" : isFestival ? "#FFDDB3" : isAmethyst ? "#B8A4CC" : "#B9A995";
  const textMuted = isLight ? "#8A7763" : isFestival ? "#E6B17E" : isAmethyst ? "#8A79A5" : "#8A7961";
  const cardBg = isLight ? "#FFFFFF" : isFestival ? "#5E111C" : isAmethyst ? "#1A0E2E" : "#1C120B";
  const cardBorder = isLight ? "#E6D7C3" : isFestival ? "rgba(255, 138, 0, 0.3)" : isAmethyst ? "rgba(196, 168, 230, 0.25)" : "rgba(216, 137, 22, 0.25)";
  const saffronColor = isFestival ? "#FF8A00" : "#D88916";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-amber-500 text-stone-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-amber-400 text-xs flex items-center space-x-2 animate-bounce">
          <span>🕉️</span>
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Page Title & Sacred Header (Refined for responsive alignment) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1
              className="font-serif-sacred text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: textPrimary }}
            >
              More & Sacred Settings
            </h1>
            <span
              className="font-sanskrit text-xs px-2.5 py-0.5 rounded-full border whitespace-nowrap"
              style={{
                backgroundColor: isLight ? "rgba(216, 137, 22, 0.12)" : "rgba(216, 137, 22, 0.2)",
                borderColor: saffronColor,
                color: isLight ? "#B9680D" : "#F2B333",
              }}
            >
              अधिक एवं स्वरूप
            </span>
          </div>
          <p className="text-xs sm:text-sm" style={{ color: textSecondary }}>
            Personalize your spiritual atmosphere, recitation preferences, and profile identity.
          </p>
        </div>

        {/* Profile Button Shortcut (compact without redundant text clutter) */}
        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            type="button"
            className="self-start sm:self-center p-2 rounded-2xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer flex-shrink-0 group"
            title="Seeker Profile"
            aria-label="Seeker Profile"
            style={{
              backgroundColor: cardBg,
              borderColor: cardBorder,
              color: textPrimary,
            }}
          >
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
              ॐ
            </div>
          </button>
        )}
      </div>

      {/* 1. SĀDHAKA PROFILE SUMMARY CARD */}
      <div
        className="p-5 sm:p-6 rounded-3xl border shadow-lg relative overflow-hidden transition-all"
        style={{
          backgroundColor: cardBg,
          borderColor: cardBorder,
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-sanskrit text-2xl font-bold shadow border flex-shrink-0"
              style={{
                background: isLight
                  ? "linear-gradient(135deg, #D88916, #F2B133)"
                  : isFestival
                  ? "linear-gradient(135deg, #FF8A00, #FFD54A)"
                  : isAmethyst
                  ? "linear-gradient(135deg, #8A4AC7, #C4A8E6)"
                  : "linear-gradient(135deg, #D88916, #70501F)",
                color: isLight || isFestival ? "#1A0E06" : "#FFFFFF",
                borderColor: saffronColor,
              }}
            >
              ॐ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif-sacred text-lg font-bold" style={{ color: textPrimary }}>
                  Vishal Kumar
                </h3>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
                  style={{
                    backgroundColor: "rgba(216, 137, 22, 0.15)",
                    borderColor: saffronColor,
                    color: isLight ? "#B9680D" : "#F2B333",
                  }}
                >
                  Sādhaka Level 3
                </span>
              </div>
              <p className="text-xs font-sanskrit mt-0.5" style={{ color: textSecondary }}>
                ज्ञान एवं कर्म योग साधक • vishal.kr.gupta@gmail.com
              </p>
              <div className="flex items-center space-x-3 mt-2 text-xs">
                <span className="flex items-center space-x-1 text-amber-500 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{streakData.currentStreak || 7}-Day Streak</span>
                </span>
                <span style={{ color: textMuted }}>•</span>
                <span className="flex items-center space-x-1" style={{ color: textSecondary }}>
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>{savedCount} Saved</span>
                </span>
                <span style={{ color: textMuted }}>•</span>
                <span className="flex items-center space-x-1" style={{ color: textSecondary }}>
                  <Feather className="w-3.5 h-3.5 text-rose-400" />
                  <span>{journalCount || 3} Reflections</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>Open Sādhaka Profile</span>
          </button>
        </div>
      </div>

      {/* 2. SACRED ATMOSPHERE THEMES (MATCHING DESIGN ASSET) */}
      <div
        className="p-5 sm:p-6 rounded-3xl border shadow-lg space-y-4"
        style={{
          backgroundColor: cardBg,
          borderColor: cardBorder,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif-sacred text-base sm:text-lg font-bold" style={{ color: textPrimary }}>
              Sacred Atmosphere & Color Philosophy
            </h2>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
            {theme === "sandstone"
              ? "Dark Mode Active"
              : theme === "light"
              ? "Light Mode Active"
              : theme === "festival"
              ? "Festival Mode Active"
              : "Amethyst Mode Active"}
          </span>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: textSecondary }}>
          Rooted in the warmth of temples, scriptures, and glowing sacred traditions. Select from the 3 authentic modes defined in the SutraSparsh design system:
        </p>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* A. DARK MODE (Contemplative Sandstone) */}
          <div
            onClick={() => onSelectTheme && onSelectTheme("sandstone")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
              theme === "sandstone"
                ? "ring-2 ring-amber-500 shadow-xl scale-[1.01]"
                : "opacity-80 hover:opacity-100"
            }`}
            style={{
              backgroundColor: "#1C120B",
              borderColor: theme === "sandstone" ? "#D88916" : "#3A2818",
            }}
          >
            {theme === "sandstone" && (
              <div className="absolute top-0 right-0 bg-amber-500 text-stone-950 font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg shadow flex items-center space-x-1">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Active</span>
              </div>
            )}
            <div className="text-2xl mb-2">🌙</div>
            <div className="font-bold text-sm text-[#F4E9D2]">Dark Mode</div>
            <div className="text-[11px] font-sanskrit text-amber-400">बलुआ पत्थर • Temple Brown</div>
            <p className="text-[11px] text-[#B9A995] mt-1 leading-relaxed">
              Default contemplative experience. Ink/Night ground (#120D09) with warm saffron & ivory accents.
            </p>
            <div className="flex items-center space-x-1.5 mt-3 pt-2 border-t border-white/10">
              <span className="w-3.5 h-3.5 rounded-full bg-[#120D09] border border-white/20" title="Ink #120D09" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#24160D]" title="Card Brown #24160D" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#D88916]" title="Saffron #D88916" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#F4E9D2]" title="Ivory #F4E9D2" />
            </div>
          </div>

          {/* B. LIGHT MODE (Clean, Calm & Readable) */}
          <div
            onClick={() => onSelectTheme && onSelectTheme("light")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
              theme === "light"
                ? "ring-2 ring-amber-500 shadow-xl scale-[1.01]"
                : "opacity-80 hover:opacity-100"
            }`}
            style={{
              backgroundColor: "#FFFBF5",
              borderColor: theme === "light" ? "#D88916" : "#E6D7C3",
            }}
          >
            {theme === "light" && (
              <div className="absolute top-0 right-0 bg-amber-500 text-stone-950 font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg shadow flex items-center space-x-1">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Active</span>
              </div>
            )}
            <div className="text-2xl mb-2">☀️</div>
            <div className="font-bold text-sm text-[#3A2818]">Light Mode</div>
            <div className="text-[11px] font-sanskrit text-amber-700">चन्दन एवं पत्र • Sandalwood</div>
            <p className="text-[11px] text-[#6B5844] mt-1 leading-relaxed">
              Clean, calm and readable. Soft ivory ground (#FFFBF5) with parchment and deep brown typography.
            </p>
            <div className="flex items-center space-x-1.5 mt-3 pt-2 border-t border-stone-200">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FFFBF5] border border-stone-300" title="Soft Ivory #FFFBF5" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#F6E8C9]" title="Sandalwood #F6E8C9" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#D88916]" title="Saffron #D88916" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#3A2818]" title="Deep Brown #3A2818" />
            </div>
          </div>

          {/* C. FESTIVAL MODE (Vibrant & Auspicious) */}
          <div
            onClick={() => onSelectTheme && onSelectTheme("festival")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
              theme === "festival"
                ? "ring-2 ring-amber-400 shadow-xl scale-[1.01]"
                : "opacity-80 hover:opacity-100"
            }`}
            style={{
              backgroundColor: "#4B0E17",
              borderColor: theme === "festival" ? "#FF8A00" : "#7A1825",
            }}
          >
            {theme === "festival" && (
              <div className="absolute top-0 right-0 bg-amber-400 text-stone-950 font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg shadow flex items-center space-x-1">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Active</span>
              </div>
            )}
            <div className="text-2xl mb-2">🪔</div>
            <div className="font-bold text-sm text-[#FFF6E3]">Festival Mode</div>
            <div className="text-[11px] font-sanskrit text-amber-300">उत्सव एवं मङ्गल • Royal Maroon</div>
            <p className="text-[11px] text-[#FFDDB3] mt-1 leading-relaxed">
              Vibrant, celebratory and auspicious. Deep royal maroon (#4B0E17), vivid saffron (#FF8A00), and gold.
            </p>
            <div className="flex items-center space-x-1.5 mt-3 pt-2 border-t border-white/10">
              <span className="w-3.5 h-3.5 rounded-full bg-[#4B0E17] border border-white/20" title="Deep Maroon #4B0E17" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#7A1825]" title="Royal Maroon #7A1825" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF8A00]" title="Saffron #FF8A00" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FFD54A]" title="Golden #FFD54A" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SCRIPT & RECITATION PREFERENCES */}
      <div
        className="p-5 sm:p-6 rounded-3xl border shadow-lg space-y-5"
        style={{
          backgroundColor: cardBg,
          borderColor: cardBorder,
        }}
      >
        <div className="flex items-center space-x-2">
          <Languages className="w-5 h-5 text-amber-500" />
          <h2 className="font-serif-sacred text-base sm:text-lg font-bold" style={{ color: textPrimary }}>
            Script & Recitation Display
          </h2>
        </div>

        {/* Script Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold block" style={{ color: textSecondary }}>
            PRIMARY SCRIPT DISPLAY (लिप्यन्तरण)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "both", label: "Devanagari + IAST", sub: "दोनों लिपियाँ" },
              { id: "devanagari", label: "Devanagari Only", sub: "केवल देवनागरी" },
              { id: "transliteration", label: "Roman IAST Only", sub: "केवल रोमन" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleScriptChange(opt.id as any)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  prefScript === opt.id
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                    : "border-transparent hover:bg-white/5 text-stone-400"
                }`}
                style={{
                  backgroundColor: prefScript === opt.id ? "rgba(216, 137, 22, 0.2)" : isLight ? "#F6EDE1" : "rgba(0, 0, 0, 0.2)",
                  borderColor: prefScript === opt.id ? saffronColor : "transparent",
                }}
              >
                <div className="text-xs font-bold" style={{ color: prefScript === opt.id ? (isLight ? "#B9680D" : "#F2B333") : textPrimary }}>
                  {opt.label}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: textMuted }}>
                  {opt.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Translation Language */}
        <div className="space-y-2">
          <label className="text-xs font-bold block" style={{ color: textSecondary }}>
            TRANSLATION & COMMENTARY LANGUAGE (अर्थ एवं भावार्थ)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "dual", label: "English + Hindi", sub: "द्विभाषी अनुवाद" },
              { id: "en", label: "English Only", sub: "English meaning" },
              { id: "hi", label: "Hindi Only", sub: "हिन्दी भावार्थ" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleLangChange(opt.id as any)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  prefLang === opt.id
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                    : "border-transparent hover:bg-white/5 text-stone-400"
                }`}
                style={{
                  backgroundColor: prefLang === opt.id ? "rgba(216, 137, 22, 0.2)" : isLight ? "#F6EDE1" : "rgba(0, 0, 0, 0.2)",
                  borderColor: prefLang === opt.id ? saffronColor : "transparent",
                }}
              >
                <div className="text-xs font-bold" style={{ color: prefLang === opt.id ? (isLight ? "#B9680D" : "#F2B333") : textPrimary }}>
                  {opt.label}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: textMuted }}>
                  {opt.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Dynamic Shloka Preview Card */}
        <div
          className="p-4 rounded-2xl border transition-all text-center space-y-2"
          style={{
            backgroundColor: isLight ? "#FBF6EE" : "rgba(0,0,0,0.35)",
            borderColor: cardBorder,
          }}
        >
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500">
            Live Preview • दृश्य स्वरूप (Gita 2.47)
          </div>

          <div className="space-y-1 py-1">
            {(prefScript === "both" || prefScript === "devanagari") && (
              <div className="font-sanskrit text-base sm:text-lg text-amber-300 leading-relaxed">
                कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।
              </div>
            )}
            {(prefScript === "both" || prefScript === "transliteration") && (
              <div className="font-serif italic text-xs sm:text-sm text-stone-300">
                karmaṇy-evādhikāras te mā phaleṣu kadācana |
              </div>
            )}
          </div>

          <div className="space-y-1 pt-1 border-t border-white/5">
            {(prefLang === "dual" || prefLang === "en") && (
              <p className="text-xs italic leading-relaxed text-stone-400">
                "You have a right to perform your prescribed duty, but not to the fruits of action."
              </p>
            )}
            {(prefLang === "dual" || prefLang === "hi") && (
              <p className="text-xs font-sanskrit leading-relaxed text-amber-400/90">
                "कर्म करने में ही तुम्हारा अधिकार है, उसके फलों में कभी नहीं।"
              </p>
            )}
          </div>
        </div>

        {/* Audio Chant Speed & Brahma Muhurta Reminder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-3 border-t border-white/5">
          {/* Chant Speed */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold" style={{ color: textSecondary }}>
                <Volume2 className="w-4 h-4 text-amber-500" />
                <span>CHANT RECITATION SPEED</span>
              </div>
              <span className="text-[11px] font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/15">
                {prefChantSpeed}x
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[0.75, 0.85, 1.0, 1.15, 1.25].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => handleSpeedChange(speed)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    prefChantSpeed === speed
                      ? "bg-amber-500 text-stone-950 font-black shadow"
                      : "border-transparent hover:border-amber-500/30"
                  }`}
                  style={{
                    backgroundColor: prefChantSpeed === speed ? saffronColor : isLight ? "#F6EDE1" : "rgba(0, 0, 0, 0.2)",
                    color: prefChantSpeed === speed ? "#1A0E06" : textSecondary,
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <p className="text-[10.5px]" style={{ color: textMuted }}>
              Adjusts audio playback rate and Vedic recitation pacing in real-time.
            </p>
          </div>

          {/* Daily Reminder Time */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold" style={{ color: textSecondary }}>
                <Clock className="w-4 h-4 text-amber-500" />
                <span>BRAHMA MUHURTA REMINDER</span>
              </div>
              <button
                type="button"
                onClick={handleTestNotification}
                className="text-[11px] text-amber-500 font-bold hover:underline cursor-pointer flex items-center space-x-1"
                title="Test 432Hz temple bell and notification"
              >
                <span>🔔 Test Bell</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { time: "04:30", label: "04:30 Brahma" },
                { time: "05:30", label: "05:30 Prātah" },
                { time: "06:00", label: "06:00 Surya" },
                { time: "06:30", label: "06:30 Sādhana" },
                { time: "20:00", label: "20:00 Sāndhya" },
              ].map((p) => (
                <button
                  key={p.time}
                  type="button"
                  onClick={() => handleReminderChange(p.time)}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-bold border transition-colors ${
                    prefReminder === p.time
                      ? "bg-amber-500 text-stone-950 border-amber-400"
                      : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="time"
                value={prefReminder}
                onChange={(e) => handleReminderChange(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border text-xs font-bold transition-all"
                style={{
                  backgroundColor: isLight ? "#F6EDE1" : "rgba(0,0,0,0.3)",
                  borderColor: cardBorder,
                  color: textPrimary,
                }}
              />
              <button
                type="button"
                onClick={handleTestNotification}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 transition-all cursor-pointer flex items-center space-x-1"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notify</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SCRIPTURAL FOUNDATIONS & GUIDES */}
      <div
        className="p-5 sm:p-6 rounded-3xl border shadow-lg space-y-3"
        style={{
          backgroundColor: cardBg,
          borderColor: cardBorder,
        }}
      >
        <div className="flex items-center space-x-2 mb-2">
          <BookOpen className="w-5 h-5 text-amber-500" />
          <h2 className="font-serif-sacred text-base sm:text-lg font-bold" style={{ color: textPrimary }}>
            Scriptural Foundations & Heritage
          </h2>
        </div>

        <div className="space-y-2">
          {/* About SutraSparsh */}
          <div
            onClick={() => setActiveSubView(activeSubView === "about" ? "none" : "about")}
            className="p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
            style={{ borderColor: cardBorder }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 text-sm">
                ॐ
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: textPrimary }}>
                  About SutraSparsh (सूत्रस्पर्श दर्शन)
                </div>
                <div className="text-[10px]" style={{ color: textMuted }}>
                  स्पर्श से संस्कार, विचार से विस्तार • Timeless wisdom for modern life
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeSubView === "about" ? "rotate-90" : ""}`} style={{ color: textMuted }} />
          </div>

          {/* About Drawer expansion */}
          {activeSubView === "about" && (
            <div
              className="p-4 rounded-2xl border text-xs leading-relaxed space-y-2.5 animate-fadeIn"
              style={{
                backgroundColor: isLight ? "#F6EDE1" : "rgba(0, 0, 0, 0.3)",
                borderColor: cardBorder,
                color: textSecondary,
              }}
            >
              <p className="font-serif-sacred text-sm font-bold" style={{ color: textPrimary }}>
                ॐ SutraSparsh — स्पर्श से संस्कार, विचार से विस्तार
              </p>
              <p>
                SutraSparsh is a dedicated sacred sanctuary to discover, understand, and reflect on timeless Sanskrit wisdom. Our authentic color palette blends:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px]">
                <li><strong style={{ color: saffronColor }}>Saffron</strong>: Energy, purity, devotion</li>
                <li><strong style={{ color: "#8A1D2D" }}>Maroon</strong>: Strength, tradition, celebration</li>
                <li><strong style={{ color: "#C9A66B" }}>Sandalwood</strong>: Wisdom, peace, grounding</li>
                <li><strong style={{ color: "#EAD9B6" }}>Parchment</strong>: Knowledge, scriptures, heritage</li>
              </ul>
              <p className="text-[11px]">
                Every shloka provides word-by-word sandhi breakdown, IAST diacritics, traditional audio recitations, and profound practical applications.
              </p>
            </div>
          )}

          {/* Sanskrit Glossary */}
          <div
            onClick={() => onNavigateTab?.("explore")}
            className="p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
            style={{ borderColor: cardBorder }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 text-sm">
                📖
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: textPrimary }}>
                  Sanskrit Glossary & Dhatu Roots (शब्दकोष)
                </div>
                <div className="text-[10px]" style={{ color: textMuted }}>
                  Explore 500+ sacred terms, root meanings, and philosophical etymologies
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: textMuted }} />
          </div>

          {/* Guided Paths */}
          <div
            onClick={() => onNavigateTab?.("explore")}
            className="p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
            style={{ borderColor: cardBorder }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 text-sm">
                🛤️
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: textPrimary }}>
                  Guided Spiritual Paths (साधना मार्ग)
                </div>
                <div className="text-[10px]" style={{ color: textMuted }}>
                  Curated journeys: Gita Karma Yoga, Patanjali Meditation, Upanishadic Self-Inquiry
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: textMuted }} />
          </div>
        </div>
      </div>

      {/* 5. MEMBERSHIP, SEVA & ADMIN ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sādhaka Sacred Membership */}
        <div
          className="p-5 rounded-3xl border flex flex-col justify-between space-y-3"
          style={{
            backgroundColor: cardBg,
            borderColor: cardBorder,
          }}
        >
          <div>
            <div className="flex items-center space-x-2 text-amber-500 font-bold text-sm mb-1">
              <Crown className="w-4 h-4 fill-amber-500/30" />
              <span>Sādhaka Sacred Membership</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: textSecondary }}>
              Unlock unlimited offline recitations, guided tracks, and ad-free contemplation sanctuary.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPricing}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            View Sādhaka Plans
          </button>
        </div>

        {/* Gurudakshina & Seva */}
        <div
          className="p-5 rounded-3xl border flex flex-col justify-between space-y-3"
          style={{
            backgroundColor: cardBg,
            borderColor: cardBorder,
          }}
        >
          <div>
            <div className="flex items-center space-x-2 text-rose-500 font-bold text-sm mb-1">
              <Heart className="w-4 h-4 fill-rose-500/30" />
              <span>Sacred Gurudakshina (Seva)</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: textSecondary }}>
              Support preservation and digital dissemination of Vedic & Sanskrit heritage. 80G Tax Exempt.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenDonation}
            className="w-full py-2.5 rounded-xl text-xs font-bold border border-rose-500/50 text-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer"
          >
            Offer Seva / Gurudakshina
          </button>
        </div>
      </div>

      {/* 6. TEMPLE ADMIN CONSOLE BUTTON - Enabled ONLY from device: screen; disabled on all other devices */}
      <div className="pt-3">
        {isScreenDevice ? (
          <div className="space-y-1.5">
            <button
              type="button"
              id="btn-launch-admin-console"
              onClick={onOpenAdminConsole}
              className="w-full py-3.5 px-4 rounded-2xl border flex items-center justify-center space-x-2 text-xs font-bold transition-all hover:bg-white/5 active:scale-[0.99] cursor-pointer shadow-sm group"
              style={{
                backgroundColor: cardBg,
                borderColor: cardBorder,
                color: textPrimary,
              }}
              title="Launch SutraSparsh Temple Admin Operations Console (Device: Screen Verified)"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>Launch SutraSparsh Temple Admin Operations Console</span>
              <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-normal ml-1">
                Screen Device Active
              </span>
            </button>
            <p className="text-[11px] text-stone-500 text-center font-mono">
              🖥️ Device: Screen verified • Administrative control plane enabled
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <button
              type="button"
              id="btn-launch-admin-console-disabled"
              disabled
              aria-disabled="true"
              className="w-full py-3.5 px-4 rounded-2xl border flex items-center justify-center space-x-2 text-xs font-bold opacity-50 cursor-not-allowed bg-stone-900/40 border-stone-800 text-stone-500 shadow-none"
              title="Admin Console is disabled on mobile/handheld devices. Exclusively enabled for device: screen."
            >
              <Lock className="w-4 h-4 text-stone-500" />
              <span>Launch SutraSparsh Temple Admin Operations Console</span>
              <span className="text-[10px] bg-stone-800 text-stone-400 border border-stone-700 px-2 py-0.5 rounded-full font-mono font-normal ml-1">
                Disabled on Mobile
              </span>
            </button>
            <p className="text-[11px] text-amber-500/80 text-center font-mono">
              🔒 Admin Console is enabled only from device: screen. Disabled on mobile/handheld devices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
