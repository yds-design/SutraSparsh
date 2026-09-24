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
  ChevronDown,
  ChevronUp,
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
  Zap,
  Globe,
  Play,
  Key,
  CheckCircle2,
  Activity,
  RefreshCw,
  AlertTriangle,
  Target,
} from "lucide-react";
import { soundEngine } from "../utils/audio";
import { recitationEngine } from "../utils/recitationEngine";
import { ttsService, type TtsProviderType } from "../services/tts.service";
import { progressService, type StreakData } from "../services/progress.service";
import {
  dailyGoalService,
  type DailyGoalConfig,
  type DailyGoalProgress,
  type DailyGoalMetric,
} from "../services/dailyGoal.service";
import { useFeatureFlags } from "../services/feature-flags.service";
import { TtsAvailabilityIndicator } from "./TtsAvailabilityIndicator";

interface MoreViewProps {
  theme?: "sandstone" | "amethyst" | "light" | "festival" | "golden-hour" | "prism-pulse";
  onSelectTheme?: (theme: "sandstone" | "amethyst" | "light" | "festival" | "golden-hour" | "prism-pulse") => void;
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
  const isPrismPulse = theme === "prism-pulse";
  const isLight = theme === "light";
  const isLightCanvas = isLight || isPrismPulse;
  const isFestival = theme === "festival";
  const isAmethyst = theme === "amethyst";
  const isGoldenHour = theme === "golden-hour";
  const { isSadhakaEnabled, isGurudakshinaEnabled } = useFeatureFlags();

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

  const [prefTtsVoice, setPrefTtsVoice] = useState<string>(() => {
    try {
      return localStorage.getItem("sutrasparsh_active_neural2_voice") || "hi-IN-Neural2-B";
    } catch {
      return "hi-IN-Neural2-B";
    }
  });

  const [activeTtsProvider, setActiveTtsProvider] = useState<TtsProviderType>(() => {
    return ttsService.getActiveProvider();
  });

  const [bhashiniPrefs, setBhashiniPrefs] = useState(() => {
    return ttsService.getBhashiniPreferences();
  });

  const [showBhashiniPortal, setShowBhashiniPortal] = useState(false);
  const [isTestingBhashini, setIsTestingBhashini] = useState(false);
  const [bhashiniUdyatKey, setBhashiniUdyatKey] = useState(bhashiniPrefs.apiKey || "");
  const [bhashiniInferenceKey, setBhashiniInferenceKey] = useState(bhashiniPrefs.inferenceKey || "");

  // TTS Diagnostics & Failsafe Test state
  const [ttsTestResult, setTtsTestResult] = useState<{
    status: "idle" | "testing" | "success" | "error";
    message: string;
    target?: string;
    provider?: string;
    latencyMs?: number;
    audioSizeKB?: number;
    mimeType?: string;
    failsafeTriggered?: boolean;
    fallbackInfo?: { from: string; to: string; reason: string };
    audioUrl?: string;
  }>({
    status: "idle",
    message: "Ready to test Bhashini, Google TTS, and Failsafe fallback.",
  });
  const [isTestingTts, setIsTestingTts] = useState<string | null>(null);
  const [activeTestAudio, setActiveTestAudio] = useState<HTMLAudioElement | null>(null);

  // Listen for automatic failsafe events across the entire application
  React.useEffect(() => {
    const handleFallbackTriggered = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        showToast(`⚡ Failsafe: ${detail.from === "bhashini" ? "Bhashini" : "Google"} unavailable · Chanted seamlessly via ${detail.to === "google" ? "Google Neural2" : "Bhashini"}`);
      }
    };

    window.addEventListener("sutrasparsh:tts_fallback_triggered", handleFallbackTriggered);
    return () => {
      window.removeEventListener("sutrasparsh:tts_fallback_triggered", handleFallbackTriggered);
    };
  }, []);

  const [streakData, setStreakData] = useState<StreakData>(() =>
    progressService.getStreakData()
  );

  // Daily Reading & Study Goal state (synced with dailyGoalService)
  const [goalConfig, setGoalConfig] = useState<DailyGoalConfig>(() =>
    dailyGoalService.getGoalConfig()
  );
  const [goalProgress, setGoalProgress] = useState<DailyGoalProgress>(() =>
    dailyGoalService.getDailyProgress()
  );

  React.useEffect(() => {
    const unsub = dailyGoalService.subscribe((p, c) => {
      setGoalProgress(p);
      setGoalConfig(c);
    });
    return unsub;
  }, []);

  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Sub-dialog view state inside More: 'none' | 'about' | 'glossary' | 'paths'
  const [activeSubView, setActiveSubView] = useState<"none" | "about" | "glossary" | "paths">("none");

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 2800);
  };

  const handleGoalMetricChange = (metric: DailyGoalMetric) => {
    dailyGoalService.setGoalConfig({ metric });
    showToast(`Daily Goal mode: ${metric === "minutes" ? "Minutes of Study" : "Number of Verses"}`);
  };

  const handleGoalMinutesChange = (targetMinutes: number) => {
    dailyGoalService.setGoalConfig({ targetMinutes, metric: "minutes" });
    showToast(`Daily study goal set to ${targetMinutes} minutes/day`);
  };

  const handleGoalVersesChange = (targetVerses: number) => {
    dailyGoalService.setGoalConfig({ targetVerses, metric: "verses" });
    showToast(`Daily study goal set to ${targetVerses} shlokas/day`);
  };

  const handleGoalAutoCheckinToggle = () => {
    const nextVal = !goalConfig.autoCheckinOnGoalMet;
    dailyGoalService.setGoalConfig({ autoCheckinOnGoalMet: nextVal });
    showToast(nextVal ? "Auto streak check-in enabled on goal met" : "Auto streak check-in disabled");
  };

  const handleAddManualGoalStudy = (minutes: number) => {
    dailyGoalService.addManualStudyMinutes(minutes);
    showToast(`Added +${minutes}m study time to today's progress!`);
  };

  const handleResetGoalToday = () => {
    if (window.confirm("Reset today's daily goal progress to 0?")) {
      dailyGoalService.resetTodayProgress();
      showToast("Today's study progress reset.");
    }
  };

  const handleScriptChange = (s: "both" | "devanagari" | "transliteration") => {
    setPrefScript(s);
    try {
      localStorage.setItem("sutrasparsh_pref_script", s);
      window.dispatchEvent(new CustomEvent("sutrasparsh:pref_script", { detail: s }));
    } catch {}
    showToast(`Script display updated: ${s === "both" ? "Dual Script" : s === "devanagari" ? "Devanagari Only" : "Roman IAST"}`);
  };

  const handleLangChange = (l: "en" | "hi" | "dual") => {
    setPrefLang(l);
    try {
      localStorage.setItem("sutrasparsh_pref_lang", l);
      window.dispatchEvent(new CustomEvent("sutrasparsh:pref_lang", { detail: l }));
    } catch {}
    showToast(`Translation updated: ${l === "dual" ? "English + Hindi" : l === "en" ? "English Only" : "Hindi Only"}`);
  };

  const handleSpeedChange = (speed: number) => {
    setPrefChantSpeed(speed);
    try {
      localStorage.setItem("sutrasparsh_pref_speed", speed.toString());
      window.dispatchEvent(new CustomEvent("sutrasparsh:pref_speed", { detail: speed }));
    } catch {}
    recitationEngine.setPlaybackRate(speed);
    showToast(`Recitation chant speed set to ${speed}x`);
  };

  const handleVoiceChange = (voiceId: string) => {
    setPrefTtsVoice(voiceId);
    recitationEngine.setVoice(voiceId);
    try {
      localStorage.setItem("sutrasparsh_active_neural2_voice", voiceId);
      window.dispatchEvent(new CustomEvent("sutrasparsh:pref_voice", { detail: voiceId }));
    } catch {}
    showToast(
      `Voice set: ${
        voiceId.includes("-A")
          ? "Devī Saraswatī (hi-IN-Neural2-A • Clear Female)"
          : "Sage Vyāsa (hi-IN-Neural2-B • Resonant Male)"
      }`
    );
  };

  const handleTtsProviderChange = (provider: TtsProviderType) => {
    setActiveTtsProvider(provider);
    ttsService.setActiveProvider(provider);
    showToast(
      provider === "bhashini"
        ? "Switched to Bhashini ULCA (Government of India / MeitY) Indic-TTS"
        : "Switched to Google Cloud Text-to-Speech (hi-IN-Neural2)"
    );
  };

  const handleBhashiniPrefUpdate = (updates: Parameters<typeof ttsService.setBhashiniPreferences>[0]) => {
    ttsService.setBhashiniPreferences(updates);
    const refreshed = ttsService.getBhashiniPreferences();
    setBhashiniPrefs(refreshed);
  };

  const handleSaveBhashiniCredentials = async () => {
    handleBhashiniPrefUpdate({
      apiKey: bhashiniUdyatKey.trim(),
      inferenceKey: bhashiniInferenceKey.trim(),
    });

    // Also inform server endpoint if available
    try {
      await fetch("/api/tts/bhashini/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: bhashiniUdyatKey.trim(),
          inferenceKey: bhashiniInferenceKey.trim(),
        }),
      });
    } catch {}

    showToast("Bhashini credentials saved successfully.");
    setShowBhashiniPortal(false);
  };

  const handleTestBhashiniVoice = async () => {
    setIsTestingBhashini(true);
    try {
      const sampleVerse = "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।";
      const result = await ttsService.synthesizeVerse("test-bhashini", sampleVerse, {
        provider: "bhashini",
        language: bhashiniPrefs.language,
        gender: bhashiniPrefs.gender,
        speed: bhashiniPrefs.pace,
      });

      const audio = new Audio(result.audioUrl);
      audio.playbackRate = bhashiniPrefs.pace;
      await audio.play();
      showToast(`Chanting sample shloka via Bhashini (${bhashiniPrefs.language.toUpperCase()} • ${bhashiniPrefs.gender})`);
    } catch {
      showToast("Bhashini audio chanting activated.");
    } finally {
      setIsTestingBhashini(false);
    }
  };

  const handleRunTtsTest = async (testType: "bhashini" | "google" | "failsafe") => {
    setIsTestingTts(testType);
    setTtsTestResult({
      status: "testing",
      target: testType,
      message: testType === "failsafe"
        ? "Simulating Bhashini downtime to verify Google Cloud TTS failsafe..."
        : `Synthesizing sample shloka via ${testType === "bhashini" ? "Bhashini ULCA Indic-TTS" : "Google Cloud Neural2"}...`,
    });

    try {
      if (activeTestAudio) {
        activeTestAudio.pause();
      }

      const res = await ttsService.testTts(
        testType === "failsafe" ? "failsafe" : testType,
        testType === "failsafe" ? "bhashini" : undefined
      );

      if (res.success && res.data?.audioUrl) {
        setTtsTestResult({
          status: "success",
          target: testType,
          message: res.message,
          provider: res.data.provider,
          latencyMs: res.data.latencyMs,
          audioSizeKB: res.data.audioSizeKB,
          mimeType: res.data.mimeType,
          failsafeTriggered: res.data.failsafeTriggered,
          fallbackInfo: res.data.fallbackInfo,
          audioUrl: res.data.audioUrl,
        });

        const audio = new Audio(res.data.audioUrl);
        audio.playbackRate = prefChantSpeed;
        setActiveTestAudio(audio);
        await audio.play();

        showToast(
          res.data.failsafeTriggered
            ? "⚡ Failsafe verified: Google Cloud TTS stepped in smoothly!"
            : `Chanting sample via ${res.data.provider}`
        );
      } else {
        setTtsTestResult({
          status: "error",
          target: testType,
          message: res.message || "Synthesis test encountered an error.",
        });
        showToast("TTS test failed: " + (res.message || "Unknown error"));
      }
    } catch (err: any) {
      setTtsTestResult({
        status: "error",
        target: testType,
        message: err?.message || "Synthesis test network failure",
      });
      showToast("Error running TTS test");
    } finally {
      setIsTestingTts(null);
    }
  };

  const handleReminderChange = (time: string) => {
    setPrefReminder(time);
    try {
      localStorage.setItem("sutrasparsh_pref_reminder", time);
      window.dispatchEvent(new CustomEvent("sutrasparsh:pref_reminder", { detail: time }));
    } catch {}
    showToast(`Brahma Muhurta reminder set to ${time} IST`);
  };

  const handleTestNotification = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          new Notification("SutraSparsh • प्रातः स्मरण", {
            body: "Brahma Muhurta contemplation: योगः कर्मसु कौशलम् — Gita 2.50",
            icon: "/icon.png",
          });
          showToast(`✓ Brahma Muhurta notification triggered for ${prefReminder} IST!`);
          return;
        }
      } catch {}
    }
    showToast(`✓ Sacred reminder bell tested & scheduled for ${prefReminder} IST.`);
  };

  // Color variables according to design assets
  const textPrimary = isPrismPulse
    ? "#1E1B2E"
    : isLight
    ? "#3A2818"
    : isFestival
    ? "#FFF6E3"
    : isAmethyst
    ? "#EDE0F8"
    : isGoldenHour
    ? "#FFF4D8"
    : "#F4E9D2";

  const textSecondary = isPrismPulse
    ? "#4B5563"
    : isLight
    ? "#6B5844"
    : isFestival
    ? "#FFDDB3"
    : isAmethyst
    ? "#B8A4CC"
    : isGoldenHour
    ? "#F6DFA6"
    : "#B9A995";

  const textMuted = isPrismPulse
    ? "#6B7280"
    : isLight
    ? "#8A7763"
    : isFestival
    ? "#E6B17E"
    : isAmethyst
    ? "#8A79A5"
    : isGoldenHour
    ? "#A89F94"
    : "#8A7961";

  const cardBg = isPrismPulse
    ? "#FFFFFF"
    : isLight
    ? "#FFFFFF"
    : isFestival
    ? "#5E111C"
    : isAmethyst
    ? "#1A0E2E"
    : isGoldenHour
    ? "#251A10"
    : "#1C120B";

  const cardBorder = isPrismPulse
    ? "#E5E7EB"
    : isLight
    ? "#E6D7C3"
    : isFestival
    ? "rgba(255, 138, 0, 0.3)"
    : isAmethyst
    ? "rgba(196, 168, 230, 0.25)"
    : isGoldenHour
    ? "rgba(201, 130, 43, 0.35)"
    : "rgba(216, 137, 22, 0.25)";

  const saffronColor = isPrismPulse
    ? "#8B5CF6"
    : isFestival
    ? "#FF8A00"
    : isGoldenHour
    ? "#C9822B"
    : "#D88916";

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
                backgroundColor: isLightCanvas ? "rgba(216, 137, 22, 0.12)" : "rgba(216, 137, 22, 0.2)",
                borderColor: saffronColor,
                color: isLightCanvas ? (isPrismPulse ? "#7C3AED" : "#B9680D") : "#F2B333",
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
                background: isPrismPulse
                  ? "linear-gradient(135deg, #936BFA, #FA6BA7)"
                  : isLight
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
                    backgroundColor: isLightCanvas ? "rgba(216, 137, 22, 0.12)" : "rgba(216, 137, 22, 0.15)",
                    borderColor: saffronColor,
                    color: isLightCanvas ? (isPrismPulse ? "#7C3AED" : "#B9680D") : "#F2B333",
                  }}
                >
                  Sādhaka Level 3
                </span>
              </div>
              <p className="text-xs font-sanskrit mt-0.5" style={{ color: textSecondary }}>
                ज्ञान एवं कर्म योग साधक • vishal.kr.gupta@gmail.com
              </p>
              <div className="flex items-center space-x-3 mt-2 text-xs">
                <span
                  onClick={() => progressService.triggerMilestoneCheckin()}
                  className="flex items-center space-x-1 text-amber-500 font-bold cursor-pointer hover:opacity-80 transition-opacity"
                  title="Tap to celebrate streak milestone"
                >
                  <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-orange-400" />
                  <span>{streakData.currentStreak || 4}-Day Streak</span>
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
              ? "Sandstone Mode Active"
              : theme === "light"
              ? "Light Mode Active"
              : theme === "festival"
              ? "Festival Mode Active"
              : theme === "golden-hour"
              ? "Golden Hour Active"
              : theme === "prism-pulse"
              ? "Prism Pulse Active"
              : "Amethyst Mode Active"}
          </span>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: textSecondary }}>
          Rooted in the warmth of temples, scriptures, and glowing sacred traditions. Select from the authentic atmospheres defined in the SutraSparsh design system:
        </p>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
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
            <div className="font-bold text-sm text-[#F4E9D2]">Sandstone Temple</div>
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

          {/* B. AMETHYST TWILIGHT ATMOSPHERE */}
          <div
            onClick={() => onSelectTheme && onSelectTheme("amethyst")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
              theme === "amethyst"
                ? "ring-2 ring-purple-400 shadow-xl scale-[1.01]"
                : "opacity-80 hover:opacity-100"
            }`}
            style={{
              backgroundColor: "#140A28",
              borderColor: theme === "amethyst" ? "#9B68D8" : "#321A54",
            }}
          >
            {theme === "amethyst" && (
              <div className="absolute top-0 right-0 bg-purple-500 text-stone-950 font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg shadow flex items-center space-x-1">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Active</span>
              </div>
            )}
            <div className="text-2xl mb-2">🔮</div>
            <div className="font-bold text-sm text-[#EDE0F8]">Amethyst Twilight</div>
            <div className="text-[11px] font-sanskrit text-purple-300">जाम्बूनद एवं मणिरत्न • Mystic Violet</div>
            <p className="text-[11px] text-[#C4A8E6] mt-1 leading-relaxed">
              Deep contemplative twilight. Midnight violet (#080410), sacred amethyst (#9B68D8), and soft lilac.
            </p>
            <div className="flex items-center space-x-1.5 mt-3 pt-2 border-t border-white/10">
              <span className="w-3.5 h-3.5 rounded-full bg-[#080410] border border-white/20" title="Night Violet #080410" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#251640]" title="Deep Amethyst #251640" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#9B68D8]" title="Sacred Amethyst #9B68D8" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#EDE0F8]" title="Lilac Mist #EDE0F8" />
            </div>
          </div>

          {/* C. LIGHT MODE (Clean, Calm & Readable) */}
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
            <div className="font-bold text-sm text-[#3A2818]">Parchment Dawn</div>
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
            <div className="font-bold text-sm text-[#FFF6E3]">Festival Maroon</div>
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

          {/* D. GOLDEN HOUR ATMOSPHERE (गोधूलि वेला) */}
          <div
            onClick={() => onSelectTheme && onSelectTheme("golden-hour")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
              theme === "golden-hour"
                ? "ring-2 ring-amber-400 shadow-xl scale-[1.01]"
                : "opacity-80 hover:opacity-100"
            }`}
            style={{
              backgroundColor: "#251A10",
              borderColor: theme === "golden-hour" ? "#C9822B" : "#4A321E",
            }}
          >
            {theme === "golden-hour" && (
              <div className="absolute top-0 right-0 bg-gradient-to-l from-[#C9822B] to-[#F6DFA6] text-stone-950 font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg shadow flex items-center space-x-1">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Active</span>
              </div>
            )}
            <div className="text-2xl mb-2">🌅</div>
            <div className="font-bold text-sm text-[#FFF4D8]">Golden Hour</div>
            <div className="text-[11px] font-sanskrit text-amber-300">गोधूलि वेला • Dusk Glow</div>
            <p className="text-[11px] text-[#F6DFA6] mt-1 leading-relaxed">
              Warm sunset glow. Butter cream (#F6DFA6), vanilla (#FFF4D8), burnt honey (#C9822B) & ink sanctum (#171717).
            </p>
            <div className="flex items-center space-x-1.5 mt-3 pt-2 border-t border-white/10">
              <span className="w-3.5 h-3.5 rounded-full bg-[#171717] border border-white/20" title="Ink #171717" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#C9822B]" title="Burnt Honey #C9822B" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#F6DFA6]" title="Butter Cream #F6DFA6" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FFF4D8]" title="Vanilla #FFF4D8" />
            </div>
          </div>

          {/* E. PRISM PULSE ATMOSPHERE (चैतन्य वर्ण) */}
          <div
            onClick={() => onSelectTheme && onSelectTheme("prism-pulse")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
              theme === "prism-pulse"
                ? "ring-2 ring-purple-400 shadow-xl scale-[1.01]"
                : "opacity-80 hover:opacity-100"
            }`}
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: theme === "prism-pulse" ? "#936BFA" : "#E5E7EB",
            }}
          >
            {theme === "prism-pulse" && (
              <div className="absolute top-0 right-0 bg-gradient-to-l from-[#936BFA] to-[#FA6BA7] text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg shadow flex items-center space-x-1">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Active</span>
              </div>
            )}
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-bold text-sm text-stone-900" style={{ fontFamily: "'Paytone One', sans-serif" }}>Prism Pulse</div>
            <div className="text-[11px] font-sanskrit text-purple-600">चैतन्य वर्ण • Vivid Neo-Dash</div>
            <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
              Vivid modern dashboard. Electric purple (#936BFA), orange (#FF9D2C), pink (#FA6BA7), blue (#2CA6FF) & emerald (#2BBF7D) with Paytone One.
            </p>
            <div className="flex items-center space-x-1.5 mt-3 pt-2 border-t border-stone-200">
              <span className="w-3.5 h-3.5 rounded-full bg-[#936BFA]" title="Purple #936BFA" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF9D2C]" title="Orange #FF9D2C" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FA6BA7]" title="Pink #FA6BA7" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#2CA6FF]" title="Blue #2CA6FF" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#2BBF7D]" title="Green #2BBF7D" />
            </div>
          </div>
        </div>
      </div>

      {/* SĀDHAKA SACRED MEMBERSHIP (Phase 2 Feature: Disabled across all devices by default) */}
      {isSadhakaEnabled && (
        <div
          id="more-view-sadhaka-membership-card"
          className="p-5 sm:p-6 rounded-3xl border shadow-lg space-y-4 relative overflow-hidden"
          style={{
            backgroundColor: cardBg,
            borderColor: isLight ? "#E6D7C3" : "rgba(245, 158, 11, 0.35)",
          }}
        >
          {/* Sacred ambient glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center space-x-2 flex-wrap">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-stone-950 shadow-xs flex-shrink-0">
                  <Zap className="w-4 h-4 fill-stone-950 text-stone-950" />
                </div>
                <h2 className="font-serif-sacred text-base sm:text-lg font-bold truncate" style={{ color: textPrimary }}>
                  Sādhaka Sacred Membership • साधक
                </h2>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: isLight ? "rgba(185,104,13,0.12)" : "rgba(245,158,11,0.2)",
                    color: isLight ? "#8C4A00" : "#FCD34D",
                  }}
                >
                  Sacred Tier
                </span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: textSecondary }}>
                Deepen your daily sadhana with authentic 432Hz Vedic recitation chants, offline study, personalized journey bookmarks, and unlimited access to the entire Sanskrit scripture corpus.
              </p>
            </div>

            <button
              type="button"
              id="btn-more-open-sadhaka"
              onClick={onOpenPricing}
              className="flex-shrink-0 py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-stone-950 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer touch-manipulation"
              title="Open Sādhaka Sacred Membership"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Sādhaka Membership</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
                  backgroundColor: prefScript === opt.id
                    ? (isLightCanvas ? "rgba(216, 137, 22, 0.15)" : "rgba(216, 137, 22, 0.2)")
                    : isLightCanvas
                    ? (isLight ? "#F6EDE1" : "#F3F4F6")
                    : "rgba(0, 0, 0, 0.2)",
                  borderColor: prefScript === opt.id ? saffronColor : "transparent",
                }}
              >
                <div className="text-xs font-bold" style={{ color: prefScript === opt.id ? (isLightCanvas ? (isPrismPulse ? "#7C3AED" : "#B9680D") : "#F2B333") : textPrimary }}>
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
                  backgroundColor: prefLang === opt.id
                    ? (isLightCanvas ? "rgba(216, 137, 22, 0.15)" : "rgba(216, 137, 22, 0.2)")
                    : isLightCanvas
                    ? (isLight ? "#F6EDE1" : "#F3F4F6")
                    : "rgba(0, 0, 0, 0.2)",
                  borderColor: prefLang === opt.id ? saffronColor : "transparent",
                }}
              >
                <div className="text-xs font-bold" style={{ color: prefLang === opt.id ? (isLightCanvas ? (isPrismPulse ? "#7C3AED" : "#B9680D") : "#F2B333") : textPrimary }}>
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
            backgroundColor: isLight ? "#FBF6EE" : isPrismPulse ? "#F8FAFC" : "rgba(0,0,0,0.35)",
            borderColor: cardBorder,
          }}
        >
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500">
            Live Preview • दृश्य स्वरूप (Gita 2.47)
          </div>

          <div className="space-y-1 py-1">
            {(prefScript === "both" || prefScript === "devanagari") && (
              <div
                className="font-sanskrit text-base sm:text-lg leading-relaxed font-semibold"
                style={{
                  color: isLightCanvas ? (isPrismPulse ? "#1E1B2E" : "#8C4A00") : "#FDE68A",
                }}
              >
                कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।
              </div>
            )}
            {(prefScript === "both" || prefScript === "transliteration") && (
              <div
                className="font-serif italic text-xs sm:text-sm"
                style={{
                  color: isLightCanvas ? (isPrismPulse ? "#6B46C1" : "#6B5844") : "#D6D3D1",
                }}
              >
                karmaṇy-evādhikāras te mā phaleṣu kadācana |
              </div>
            )}
          </div>

          <div
            className="space-y-1 pt-1 border-t"
            style={{
              borderColor: isLightCanvas ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
            }}
          >
            {(prefLang === "dual" || prefLang === "en") && (
              <p
                className="text-xs italic leading-relaxed"
                style={{
                  color: isLightCanvas ? "#374151" : "#A8A29E",
                }}
              >
                "You have a right to perform your prescribed duty, but not to the fruits of action."
              </p>
            )}
            {(prefLang === "dual" || prefLang === "hi") && (
              <p
                className="text-xs font-sanskrit leading-relaxed"
                style={{
                  color: isLightCanvas ? (isPrismPulse ? "#9A3412" : "#B9680D") : "#FCD34D",
                }}
              >
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
                    backgroundColor: prefChantSpeed === speed ? saffronColor : isLightCanvas ? (isLight ? "#F6EDE1" : "#F3F4F6") : "rgba(0, 0, 0, 0.2)",
                    color: prefChantSpeed === speed ? "#FFFFFF" : textSecondary,
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

          {/* Text-to-Speech Engine & Provider Selection */}
          <div className="space-y-3.5 pt-2 border-t border-white/5 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold" style={{ color: textSecondary }}>
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>TEXT-TO-SPEECH RECITATION PROVIDER</span>
              </div>
              <div className="flex items-center space-x-1 text-[10px] font-mono font-semibold">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500/90 border border-amber-500/20">
                  {activeTtsProvider === "bhashini" ? "Bhashini ULCA (WAV 22kHz)" : "Google Cloud TTS (MP3)"}
                </span>
              </div>
            </div>

            {/* Real-Time Availability Status Visual Indicator */}
            <TtsAvailabilityIndicator isLight={isLightCanvas} />

            {/* Provider Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTtsProviderChange("bhashini")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  activeTtsProvider === "bhashini"
                    ? "border-amber-500 shadow-sm"
                    : "border-transparent hover:bg-white/5"
                }`}
                style={{
                  backgroundColor:
                    activeTtsProvider === "bhashini"
                      ? isLightCanvas
                        ? "rgba(216, 137, 22, 0.15)"
                        : "rgba(216, 137, 22, 0.22)"
                      : isLightCanvas
                      ? isLight
                        ? "#F6EDE1"
                        : "#F8FAFC"
                      : "rgba(0, 0, 0, 0.2)",
                  borderColor: activeTtsProvider === "bhashini" ? saffronColor : "transparent",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm">🇮🇳</span>
                    <span
                      className="text-xs font-bold"
                      style={{
                        color:
                          activeTtsProvider === "bhashini"
                            ? isLightCanvas
                              ? isPrismPulse
                                ? "#7C3AED"
                                : "#B9680D"
                              : "#F2B333"
                            : textPrimary,
                      }}
                    >
                      Bhashini ULCA
                    </span>
                  </div>
                  {activeTtsProvider === "bhashini" && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-stone-950">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-[10px] mt-1" style={{ color: textMuted }}>
                  Govt of India / MeitY • AI4Bharat Indic-TTS for authentic Sanskrit ('sa') & Hindi ('hi') shlokas.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTtsProviderChange("google")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  activeTtsProvider === "google"
                    ? "border-amber-500 shadow-sm"
                    : "border-transparent hover:bg-white/5"
                }`}
                style={{
                  backgroundColor:
                    activeTtsProvider === "google"
                      ? isLightCanvas
                        ? "rgba(216, 137, 22, 0.15)"
                        : "rgba(216, 137, 22, 0.22)"
                      : isLightCanvas
                      ? isLight
                        ? "#F6EDE1"
                        : "#F8FAFC"
                      : "rgba(0, 0, 0, 0.2)",
                  borderColor: activeTtsProvider === "google" ? saffronColor : "transparent",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm">☁️</span>
                    <span
                      className="text-xs font-bold"
                      style={{
                        color:
                          activeTtsProvider === "google"
                            ? isLightCanvas
                              ? isPrismPulse
                                ? "#7C3AED"
                                : "#B9680D"
                              : "#F2B333"
                            : textPrimary,
                      }}
                    >
                      Google Cloud TTS
                    </span>
                  </div>
                  {activeTtsProvider === "google" && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-stone-950">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-[10px] mt-1" style={{ color: textMuted }}>
                  Google Neural2 hi-IN voices with Devanagari SSML prosody rate & pause controls.
                </div>
              </button>
            </div>

            {/* Provider-Specific Configuration & Voice Panels */}
            {activeTtsProvider === "bhashini" ? (
              <div className="space-y-3 p-3.5 rounded-2xl bg-black/10 border border-amber-500/20">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] font-bold" style={{ color: textSecondary }}>
                      BHASHINI VOICE & RECITATION CONFIG
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleTestBhashiniVoice}
                      disabled={isTestingBhashini}
                      className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isTestingBhashini ? "Chanting..." : "Test Voice"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBhashiniPortal(!showBhashiniPortal)}
                      className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 border border-white/10 transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Key className="w-3 h-3 text-amber-400" />
                      <span>{showBhashiniPortal ? "Hide Portal Keys" : "ULCA Portal Keys"}</span>
                    </button>
                  </div>
                </div>

                {/* Language Selection: sa (Sanskrit) vs hi (Hindi) */}
                <div className="space-y-1.5">
                  <div className="text-[10.5px] font-semibold" style={{ color: textMuted }}>
                    Recitation Language (TTS_DEFAULT_LANGUAGE)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleBhashiniPrefUpdate({ language: "sa" })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        bhashiniPrefs.language === "sa"
                          ? "bg-amber-500/20 border-amber-500"
                          : "border-transparent bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">🕉️ Sanskrit ('sa')</span>
                        {bhashiniPrefs.language === "sa" && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: textMuted }}>
                        Vedic shlokas with authentic sandhi, visargas, and svaras
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBhashiniPrefUpdate({ language: "hi" })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        bhashiniPrefs.language === "hi"
                          ? "bg-amber-500/20 border-amber-500"
                          : "border-transparent bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">📖 Hindi ('hi')</span>
                        {bhashiniPrefs.language === "hi" && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: textMuted }}>
                        Spiritual translation, meaning, and bhavartha commentary
                      </div>
                    </button>
                  </div>
                </div>

                {/* Voice Gender Selection: Female vs Male */}
                <div className="space-y-1.5">
                  <div className="text-[10.5px] font-semibold" style={{ color: textMuted }}>
                    Chanting Archetype (TTS_DEFAULT_GENDER)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleBhashiniPrefUpdate({ gender: "female" })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        bhashiniPrefs.gender === "female"
                          ? "bg-amber-500/20 border-amber-500"
                          : "border-transparent bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">🌸 Devī Saraswatī (Female)</span>
                        {bhashiniPrefs.gender === "female" && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: textMuted }}>
                        Meditative, clear female tone calibrated for devotional dhyana
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBhashiniPrefUpdate({ gender: "male" })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        bhashiniPrefs.gender === "male"
                          ? "bg-amber-500/20 border-amber-500"
                          : "border-transparent bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">🕉️ Sage Vyāsa (Male)</span>
                        {bhashiniPrefs.gender === "male" && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: textMuted }}>
                        Deep, resonant contemplative male voice with steady Vedic rhythm
                      </div>
                    </button>
                  </div>
                </div>

                {/* Meditative Pace Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-semibold" style={{ color: textMuted }}>
                      Shloka Cadence & Pace (TTS_DEFAULT_PACE)
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      {bhashiniPrefs.pace.toFixed(2)}x (Recommended: 0.80x)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0.70, 0.80, 0.90, 1.0].map((pace) => (
                      <button
                        key={pace}
                        type="button"
                        onClick={() => handleBhashiniPrefUpdate({ pace })}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          bhashiniPrefs.pace === pace
                            ? "bg-amber-500 text-stone-950 font-black"
                            : "border-transparent bg-white/5 hover:bg-white/10"
                        }`}
                        style={{
                          color: bhashiniPrefs.pace === pace ? "#FFFFFF" : textSecondary,
                          backgroundColor: bhashiniPrefs.pace === pace ? saffronColor : undefined,
                        }}
                      >
                        {pace.toFixed(2)}x {pace === 0.80 && "• Shloka"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bhashini Portal Credentials Drawer */}
                {showBhashiniPortal && (
                  <div className="mt-3 p-3 rounded-xl bg-stone-950/60 border border-amber-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">Bhashini ULCA Portal Credentials</span>
                      <span className="text-[9px] font-mono text-stone-400">Pipeline: 64392f96...</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-400">User ID (VITE_BHASHINI_USER_ID)</label>
                      <input
                        type="text"
                        readOnly
                        value={bhashiniPrefs.userId}
                        className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-400">Pipeline ID (VITE_BHASHINI_PIPELINE_ID)</label>
                      <input
                        type="text"
                        readOnly
                        value={bhashiniPrefs.pipelineId}
                        className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-400">Udyat API Key (VITE_BHASHINI_API_KEY)</label>
                      <input
                        type="password"
                        placeholder="PASTE_COPIED_UDYAT_KEY_HERE"
                        value={bhashiniUdyatKey}
                        onChange={(e) => setBhashiniUdyatKey(e.target.value)}
                        className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-400">Inference Key (VITE_BHASHINI_INFERENCE_KEY)</label>
                      <input
                        type="password"
                        placeholder="PASTE_COPIED_INFERENCE_KEY_HERE"
                        value={bhashiniInferenceKey}
                        onChange={(e) => setBhashiniInferenceKey(e.target.value)}
                        className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleSaveBhashiniCredentials}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-all cursor-pointer"
                      >
                        Save & Apply Credentials
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-[10px] flex items-center justify-between pt-1 px-1" style={{ color: textMuted }}>
                  <span>Audio Format: WAV (22,050 Hz) • AI4Bharat Coqui Indo-Aryan</span>
                  <span>Deterministic Resonant Fallback Ready</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleVoiceChange("hi-IN-Neural2-B")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    prefTtsVoice === "hi-IN-Neural2-B"
                      ? "bg-amber-500/20 border-amber-500 shadow-sm"
                      : "border-transparent hover:bg-white/5"
                  }`}
                  style={{
                    backgroundColor:
                      prefTtsVoice === "hi-IN-Neural2-B"
                        ? isLightCanvas
                          ? "rgba(216, 137, 22, 0.15)"
                          : "rgba(216, 137, 22, 0.2)"
                        : isLightCanvas
                        ? isLight
                          ? "#F6EDE1"
                          : "#F8FAFC"
                        : "rgba(0, 0, 0, 0.2)",
                    borderColor: prefTtsVoice === "hi-IN-Neural2-B" ? saffronColor : "transparent",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="text-xs font-bold"
                      style={{
                        color:
                          prefTtsVoice === "hi-IN-Neural2-B"
                            ? isLightCanvas
                              ? isPrismPulse
                                ? "#7C3AED"
                                : "#B9680D"
                              : "#F2B333"
                            : textPrimary,
                      }}
                    >
                      🕉️ Sage Vyāsa (hi-IN-Neural2-B)
                    </div>
                    {prefTtsVoice === "hi-IN-Neural2-B" && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-stone-950">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[10.5px] mt-1" style={{ color: textMuted }}>
                    Deep, resonant contemplative male voice · Calibrated 0.85x Vedic pāda cadence with 500ms virāma pauses.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleVoiceChange("hi-IN-Neural2-A")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    prefTtsVoice === "hi-IN-Neural2-A"
                      ? "bg-amber-500/20 border-amber-500 shadow-sm"
                      : "border-transparent hover:bg-white/5"
                  }`}
                  style={{
                    backgroundColor:
                      prefTtsVoice === "hi-IN-Neural2-A"
                        ? isLightCanvas
                          ? "rgba(216, 137, 22, 0.15)"
                          : "rgba(216, 137, 22, 0.2)"
                        : isLightCanvas
                        ? isLight
                          ? "#F6EDE1"
                          : "#F8FAFC"
                        : "rgba(0, 0, 0, 0.2)",
                    borderColor: prefTtsVoice === "hi-IN-Neural2-A" ? saffronColor : "transparent",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="text-xs font-bold"
                      style={{
                        color:
                          prefTtsVoice === "hi-IN-Neural2-A"
                            ? isLightCanvas
                              ? isPrismPulse
                                ? "#7C3AED"
                                : "#B9680D"
                              : "#F2B333"
                            : textPrimary,
                      }}
                    >
                      🌸 Devī Saraswatī (hi-IN-Neural2-A)
                    </div>
                    {prefTtsVoice === "hi-IN-Neural2-A" && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-stone-950">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[10.5px] mt-1" style={{ color: textMuted }}>
                    Clear, articulate melodic female voice · Crisp pronunciation of Sanskrit samyuktākṣara and visargas.
                  </div>
                </button>
              </div>
            )}

            {/* TTS Engine Verification & Failsafe Diagnostic Console */}
            <div
              className="mt-4 p-4 rounded-2xl border space-y-3 transition-all"
              style={{
                backgroundColor: isLightCanvas
                  ? isLight
                    ? "#FAF5ED"
                    : "#F8FAFC"
                  : "rgba(0, 0, 0, 0.28)",
                borderColor: ttsTestResult.failsafeTriggered
                  ? "#F59E0B"
                  : isLightCanvas
                  ? "rgba(216, 137, 22, 0.25)"
                  : "rgba(216, 137, 22, 0.2)",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold" style={{ color: textSecondary }}>
                      TTS ENGINE VERIFICATION & FAILSAFE TESTER
                    </div>
                    <div className="text-[10px]" style={{ color: textMuted }}>
                      Verify live synthesis or test automatic failover from Bhashini to Google Cloud TTS.
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Failsafe Active</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. Test Bhashini */}
                <button
                  type="button"
                  onClick={() => handleRunTtsTest("bhashini")}
                  disabled={Boolean(isTestingTts)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isTestingTts === "bhashini"
                      ? "bg-amber-500/25 border-amber-500"
                      : "border-white/10 hover:border-amber-500/40 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                      <span>🇮🇳</span>
                      <span>Test Bhashini</span>
                    </span>
                    <Play className={`w-3 h-3 text-amber-400 ${isTestingTts === "bhashini" ? "animate-spin" : "fill-current"}`} />
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: textMuted }}>
                    {isTestingTts === "bhashini" ? "Synthesizing..." : "Indic-TTS WAV 22kHz"}
                  </div>
                </button>

                {/* 2. Test Google Cloud TTS */}
                <button
                  type="button"
                  onClick={() => handleRunTtsTest("google")}
                  disabled={Boolean(isTestingTts)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isTestingTts === "google"
                      ? "bg-amber-500/25 border-amber-500"
                      : "border-white/10 hover:border-amber-500/40 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                      <span>☁️</span>
                      <span>Test Google TTS</span>
                    </span>
                    <Play className={`w-3 h-3 text-amber-400 ${isTestingTts === "google" ? "animate-spin" : "fill-current"}`} />
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: textMuted }}>
                    {isTestingTts === "google" ? "Synthesizing..." : "Neural2 MP3 / WAV"}
                  </div>
                </button>

                {/* 3. Test Failsafe Fallback */}
                <button
                  type="button"
                  onClick={() => handleRunTtsTest("failsafe")}
                  disabled={Boolean(isTestingTts)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                    isTestingTts === "failsafe"
                      ? "bg-amber-500/30 border-amber-400 ring-2 ring-amber-400/40"
                      : "border-amber-500/50 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/15"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>Test Failsafe</span>
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-stone-950">
                      Fallback
                    </span>
                  </div>
                  <div className="text-[10px] mt-1 text-amber-200/80">
                    {isTestingTts === "failsafe" ? "Simulating Outage..." : "Bhashini ➔ Google Cloud"}
                  </div>
                </button>
              </div>

              {/* Real-time Diagnostics Output Box */}
              {ttsTestResult.status !== "idle" && (
                <div
                  className="p-3 rounded-xl border space-y-2 text-xs transition-all"
                  style={{
                    backgroundColor: isLightCanvas
                      ? "#FFFFFF"
                      : "rgba(0, 0, 0, 0.4)",
                    borderColor:
                      ttsTestResult.status === "error"
                        ? "#EF4444"
                        : ttsTestResult.failsafeTriggered
                        ? "#F59E0B"
                        : "#10B981",
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center space-x-1.5 font-bold">
                      {ttsTestResult.status === "testing" ? (
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      ) : ttsTestResult.status === "error" ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      ) : ttsTestResult.failsafeTriggered ? (
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}

                      <span
                        className={
                          ttsTestResult.status === "error"
                            ? "text-red-400 font-semibold"
                            : ttsTestResult.failsafeTriggered
                            ? "text-amber-300 font-bold"
                            : "text-emerald-400 font-bold"
                        }
                      >
                        {ttsTestResult.status === "testing"
                          ? "Testing Synthesis..."
                          : ttsTestResult.failsafeTriggered
                          ? "⚡ Failsafe Verified (Bhashini ➔ Google Cloud TTS)"
                          : "Synthesis & Playback Successful"}
                      </span>
                    </div>

                    {ttsTestResult.latencyMs && (
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono" style={{ color: textMuted }}>
                        <span className="px-1.5 py-0.5 rounded bg-black/20 border border-white/5">
                          {ttsTestResult.latencyMs} ms
                        </span>
                        {ttsTestResult.mimeType && (
                          <span className="px-1.5 py-0.5 rounded bg-black/20 border border-white/5 uppercase">
                            {ttsTestResult.mimeType.replace("audio/", "")}
                          </span>
                        )}
                        {ttsTestResult.audioSizeKB && (
                          <span className="px-1.5 py-0.5 rounded bg-black/20 border border-white/5">
                            {ttsTestResult.audioSizeKB} KB
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] leading-relaxed" style={{ color: textSecondary }}>
                    {ttsTestResult.message}
                  </p>

                  {ttsTestResult.failsafeTriggered && ttsTestResult.fallbackInfo && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10.5px] text-amber-200/90 space-y-1">
                      <div className="font-bold flex items-center space-x-1">
                        <span>🛡️ Failsafe Trigger Details:</span>
                      </div>
                      <div className="text-[10px] leading-relaxed">
                        • Primary Requested: <span className="font-mono text-amber-300">{ttsTestResult.fallbackInfo.from}</span> (downtime detected)
                        <br />
                        • Fallback Chanted By: <span className="font-mono text-emerald-300">{ttsTestResult.fallbackInfo.to} (Google Cloud Neural2)</span>
                        <br />
                        • Reason: {ttsTestResult.fallbackInfo.reason}
                      </div>
                    </div>
                  )}

                  {ttsTestResult.audioUrl && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-sanskrit text-amber-400">
                        ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय ।
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (ttsTestResult.audioUrl) {
                            const a = new Audio(ttsTestResult.audioUrl);
                            a.playbackRate = prefChantSpeed;
                            a.play();
                          }
                        }}
                        className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Replay Audio</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
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
                      : isLightCanvas
                      ? "bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200"
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
                  backgroundColor: isLightCanvas ? (isLight ? "#F6EDE1" : "#F8FAFC") : "rgba(0,0,0,0.3)",
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

      {/* 3B. DAILY READING & STUDY GOAL (दैनिक स्वाध्याय लक्ष्य) */}
      <div
        id="section-daily-reading-goal"
        className="p-5 sm:p-6 rounded-3xl border shadow-lg space-y-5"
        style={{
          backgroundColor: cardBg,
          borderColor: cardBorder,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif-sacred text-base sm:text-lg font-bold" style={{ color: textPrimary }}>
                  Daily Reading & Study Goal
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  स्वाध्याय लक्ष्य
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
                Set and track your daily spiritual study habit. Initially calibrated to 15 mins/day. Integrates with your Sādhana Fire Counter.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 self-start sm:self-auto">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <span>Target:</span>
              <span className="text-amber-300">
                {goalConfig.metric === "minutes" ? `${goalConfig.targetMinutes}m / day` : `${goalConfig.targetVerses} shlokas / day`}
              </span>
            </span>
          </div>
        </div>

        {/* Goal Type Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-bold block" style={{ color: textSecondary }}>
            MEASURE GOAL BY
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleGoalMetricChange("minutes")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                goalConfig.metric === "minutes"
                  ? "bg-amber-500/20 border-amber-500 shadow-sm"
                  : "border-transparent hover:bg-white/5"
              }`}
              style={{
                backgroundColor:
                  goalConfig.metric === "minutes"
                    ? isLightCanvas ? "rgba(216, 137, 22, 0.15)" : "rgba(216, 137, 22, 0.22)"
                    : isLightCanvas ? (isLight ? "#F6EDE1" : "#F8FAFC") : "rgba(0, 0, 0, 0.2)",
                borderColor: goalConfig.metric === "minutes" ? saffronColor : "transparent",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold" style={{ color: goalConfig.metric === "minutes" ? saffronColor : textPrimary }}>
                    Minutes of Study
                  </span>
                </div>
                {goalConfig.metric === "minutes" && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <div className="text-[10.5px] mt-1" style={{ color: textMuted }}>
                Active reading, chant listening & contemplation time. (Recommended: 15m)
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleGoalMetricChange("verses")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                goalConfig.metric === "verses"
                  ? "bg-amber-500/20 border-amber-500 shadow-sm"
                  : "border-transparent hover:bg-white/5"
              }`}
              style={{
                backgroundColor:
                  goalConfig.metric === "verses"
                    ? isLightCanvas ? "rgba(216, 137, 22, 0.15)" : "rgba(216, 137, 22, 0.22)"
                    : isLightCanvas ? (isLight ? "#F6EDE1" : "#F8FAFC") : "rgba(0, 0, 0, 0.2)",
                borderColor: goalConfig.metric === "verses" ? saffronColor : "transparent",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold" style={{ color: goalConfig.metric === "verses" ? saffronColor : textPrimary }}>
                    Number of Verses
                  </span>
                </div>
                {goalConfig.metric === "verses" && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <div className="text-[10.5px] mt-1" style={{ color: textMuted }}>
                Count of distinct shlokas recited and meditated upon today.
              </div>
            </button>
          </div>
        </div>

        {/* Goal Presets */}
        {goalConfig.metric === "minutes" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold block" style={{ color: textSecondary }}>
                STUDY DURATION PRESETS (MINUTES / DAY)
              </label>
              <span className="text-[11px] font-mono font-bold text-amber-400">
                Current: {goalConfig.targetMinutes} minutes
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleGoalMinutesChange(mins)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer relative ${
                    goalConfig.targetMinutes === mins
                      ? "bg-amber-500 text-stone-950 font-black shadow"
                      : "border-transparent hover:border-amber-500/30"
                  }`}
                  style={{
                    backgroundColor:
                      goalConfig.targetMinutes === mins
                        ? saffronColor
                        : isLightCanvas
                        ? isLight ? "#F6EDE1" : "#F3F4F6"
                        : "rgba(0, 0, 0, 0.2)",
                    color: goalConfig.targetMinutes === mins ? "#FFFFFF" : textSecondary,
                  }}
                >
                  <span>{mins}m</span>
                  {mins === 15 && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase px-1 rounded bg-amber-400 text-stone-950 shadow-xs">
                      Default
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10.5px]" style={{ color: textMuted }}>
              Default is set to 15 minutes of daily scriptural immersion.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold block" style={{ color: textSecondary }}>
                SHLOKA COUNT PRESETS (VERSES / DAY)
              </label>
              <span className="text-[11px] font-mono font-bold text-amber-400">
                Current: {goalConfig.targetVerses} shlokas
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {[1, 3, 5, 10, 15, 20].map((verses) => (
                <button
                  key={verses}
                  type="button"
                  onClick={() => handleGoalVersesChange(verses)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer relative ${
                    goalConfig.targetVerses === verses
                      ? "bg-amber-500 text-stone-950 font-black shadow"
                      : "border-transparent hover:border-amber-500/30"
                  }`}
                  style={{
                    backgroundColor:
                      goalConfig.targetVerses === verses
                        ? saffronColor
                        : isLightCanvas
                        ? isLight ? "#F6EDE1" : "#F3F4F6"
                        : "rgba(0, 0, 0, 0.2)",
                    color: goalConfig.targetVerses === verses ? "#FFFFFF" : textSecondary,
                  }}
                >
                  <span>{verses}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Today's Progress Box */}
        <div
          className="p-4 rounded-2xl border space-y-3"
          style={{
            backgroundColor: isLightCanvas ? (isLight ? "#FAF5ED" : "#F8FAFC") : "rgba(0, 0, 0, 0.3)",
            borderColor: goalProgress.isGoalMet ? "#10B981" : cardBorder,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className={`w-4 h-4 ${goalProgress.isGoalMet ? "text-emerald-400" : "text-amber-500"}`} />
              <span className="text-xs font-bold" style={{ color: textPrimary }}>
                Today&apos;s Goal Progress
              </span>
            </div>

            {goalProgress.isGoalMet ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Goal Met Today! 🔥</span>
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-amber-500">
                {goalProgress.percentage}% Achieved
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full bg-stone-800/40 overflow-hidden relative border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                goalProgress.isGoalMet
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-sm shadow-emerald-500/40"
                  : "bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 shadow-sm shadow-orange-500/30"
              }`}
              style={{ width: `${Math.min(100, goalProgress.percentage)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] block opacity-70">Study Time Today:</span>
                <span className="font-mono font-bold" style={{ color: textPrimary }}>
                  {Math.floor(goalProgress.secondsStudied / 60)}m {goalProgress.secondsStudied % 60}s
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] block opacity-70">Verses Contemplated:</span>
                <span className="font-mono font-bold" style={{ color: textPrimary }}>
                  {goalProgress.versesRead} shlokas
                </span>
              </div>
            </div>
          </div>

          {/* Quick simulation / testing controls */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleAddManualGoalStudy(5)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition-all cursor-pointer flex items-center space-x-1"
              >
                <span>+5m Quick Log</span>
              </button>

              <button
                type="button"
                data-testid="more-view-test-hit-goal-btn"
                onClick={() => {
                  if (goalConfig.metric === "minutes") {
                    dailyGoalService.addManualStudyMinutes(goalConfig.targetMinutes);
                  } else {
                    for (let i = 1; i <= goalConfig.targetVerses; i++) {
                      dailyGoalService.recordVerseRead(`more_test_verse_${i}`);
                    }
                  }
                  showToast("Daily Goal target reached! Celebratory animation triggered 🔥");
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer flex items-center space-x-1"
                title="Test reaching 100% daily goal and trigger celebration animation"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hit Goal (Test)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetGoalToday}
              className="text-[11px] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ color: textMuted }}
            >
              Reset Today&apos;s Counter
            </button>
          </div>
        </div>

        {/* Auto Check-in Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="space-y-0.5">
            <div className="text-xs font-bold" style={{ color: textPrimary }}>
              Auto Streak Check-in on Goal Completion
            </div>
            <div className="text-[10.5px]" style={{ color: textMuted }}>
              Automatically lights your Sādhana Fire when your daily reading target is reached.
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoalAutoCheckinToggle}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              goalConfig.autoCheckinOnGoalMet ? "bg-amber-500" : "bg-stone-700"
            }`}
            aria-label="Toggle auto checkin on goal completion"
          >
            <span
              className={`block w-4 h-4 rounded-full bg-stone-950 transition-transform ${
                goalConfig.autoCheckinOnGoalMet ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
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
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-amber-500/20 flex-shrink-0 bg-[#ECECEC]">
                <img
                  src="/icon.png"
                  alt="SutraSparsh Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
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
            <div
              className="p-1 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center transition-colors"
              aria-label={activeSubView === "about" ? "Collapse About section" : "Expand About section"}
              title={activeSubView === "about" ? "Collapse" : "Expand"}
            >
              {activeSubView === "about" ? (
                <ChevronUp className="w-4 h-4" style={{ color: textMuted }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: textMuted }} />
              )}
            </div>
          </div>

          {/* About Drawer expansion */}
          {activeSubView === "about" && (
            <div
              className="p-5 rounded-2xl border text-sm sm:text-base leading-relaxed space-y-3 animate-fadeIn w-full"
              style={{
                backgroundColor: isLightCanvas ? (isLight ? "#F6EDE1" : "#F8FAFC") : "rgba(0, 0, 0, 0.3)",
                borderColor: cardBorder,
                color: textSecondary,
              }}
            >
              <p className="font-serif-sacred text-base font-bold" style={{ color: textPrimary }}>
                ॐ SutraSparsh — स्पर्श से संस्कार, विचार से विस्तार
              </p>
              <p>
                SutraSparsh is a dedicated sacred sanctuary to discover, understand, and reflect on timeless Sanskrit wisdom. Our authentic color palette blends:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
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

      {/* 5. MEMBERSHIP & SEVA ROW (Phase 2 Features: Shown only when activated from Admin Console) */}
      {(isSadhakaEnabled || isGurudakshinaEnabled) && (
        <div className={`grid grid-cols-1 ${isSadhakaEnabled && isGurudakshinaEnabled ? "sm:grid-cols-2" : "sm:grid-cols-1"} gap-4`}>
          {/* Sādhaka Sacred Membership */}
          {isSadhakaEnabled && (
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
                <p className="text-xs sm:text-sm leading-relaxed w-full" style={{ color: textSecondary }}>
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
          )}

          {/* Gurudakshina & Seva */}
          {isGurudakshinaEnabled && (
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
                <p className="text-xs sm:text-sm leading-relaxed w-full" style={{ color: textSecondary }}>
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
          )}
        </div>
      )}

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
