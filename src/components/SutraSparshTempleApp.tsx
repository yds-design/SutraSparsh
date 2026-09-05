import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Heart,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  X,
  Sparkles,
  Flame,
  BookOpen,
  Compass,
  FileText,
  User,
  Settings,
  HelpCircle,
  Shield,
  Crown,
  Check,
  RotateCcw,
  Sun,
  Moon,
  ExternalLink,
  Palette,
  CheckCircle2,
  Languages,
  Clock,
  Music,
  Sliders,
  Sparkle,
  Radio,
  Edit3,
  Download,
  Upload,
  Copy,
  Calendar,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Sunrise,
} from "lucide-react";
import { ShareModal } from "./ShareModal";
import { MoreView } from "./MoreView";
import { BrahmaMuhurtaTimer } from "./BrahmaMuhurtaTimer";
import { ImportantTithisParv } from "./ImportantTithisParv";
import { progressService, type StreakData } from "../services/progress.service";
import { sharingService } from "../services/sharing.service";
import type { ReadingProgress } from "../types/progress";
import type { ShareableContent } from "../types/sharing";
import { soundEngine } from "../utils/audio";
import { speechSafetyEngine } from "../utils/speech";
import { useFeatureFlags } from "../services/feature-flags.service";
import { recitationEngine, type RecitationState } from "../utils/recitationEngine";
import { matchesSanskritQuery } from "../utils/sanskritSearch";
import {
  SCRIPTURES_CORPUS,
  VERSES_DATABASE,
  getDailyShlokaForDate,
  getAdjacentVerses,
  getVersesByScriptureAndChapter,
  type ScriptureData,
  type DetailedVerse,
} from "../data/scriptureCorpus";

export type AppTheme = "sandstone" | "amethyst" | "light" | "festival";

interface SutraSparshTempleAppProps {
  onOpenAdmin?: () => void;
  onOpenPricing?: () => void;
  onOpenDonation?: () => void;
  hideHeaderAndNav?: boolean;
  theme?: AppTheme;
  onSelectTheme?: (theme: AppTheme) => void;
  initialSubScreen?: "none" | "scripture" | "verse" | "glossary" | "paths" | "about" | "pref";
  onNavigateTab?: (tab: string) => void;
}

export const SutraSparshTempleApp: React.FC<SutraSparshTempleAppProps> = ({
  onOpenAdmin,
  onOpenPricing,
  onOpenDonation,
  hideHeaderAndNav = false,
  theme: propTheme,
  onSelectTheme,
  initialSubScreen = "none",
  onNavigateTab,
}) => {
  const { isSadhakaEnabled, isGurudakshinaEnabled } = useFeatureFlags();
  // Theme state
  const [internalTheme, setInternalTheme] = useState<AppTheme>(() => {
    try {
      return (localStorage.getItem("sutrasparsh_theme") as AppTheme) || "sandstone";
    } catch {
      return "sandstone";
    }
  });

  const theme = propTheme || internalTheme;

  useEffect(() => {
    if (propTheme && propTheme !== internalTheme) {
      setInternalTheme(propTheme);
    }
  }, [propTheme]);

  // Onboarding state
  const [onboardingDone, setOnboardingDone] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sutrasparsh_onboarding_done") === "true";
    } catch {
      return false;
    }
  });

  const [selectedOnboardingOptions, setSelectedOnboardingOptions] = useState<number[]>([0]);

  // Screen / Navigation state
  const [activeTab, setActiveTab] = useState<"home" | "explore" | "search" | "journey" | "more">("home");
  const [subScreen, setSubScreen] = useState<
    "none" | "scripture" | "verse" | "glossary" | "paths" | "about" | "pref"
  >(initialSubScreen);

  useEffect(() => {
    if (initialSubScreen && initialSubScreen !== "none") {
      setSubScreen(initialSubScreen);
    }
  }, [initialSubScreen]);

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
      return localStorage.getItem("sutrasparsh_pref_reminder") || "06:30";
    } catch {
      return "06:30";
    }
  });
  const [themeToast, setThemeToast] = useState<string | null>(null);

  // Selected Scripture / Verse state
  const [selectedScriptureId, setSelectedScriptureId] = useState<string>("bhagavad_gita");
  const [selectedVerseData, setSelectedVerseData] = useState<DetailedVerse>(VERSES_DATABASE["bg_2_47"]);

  // Daily Shloka Date Navigation (Rotation Engine)
  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0);
  const currentDailyVerse = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + selectedDateOffset);
    return getDailyShlokaForDate(d);
  }, [selectedDateOffset]);

  // Ambient Tanpura Drone state
  const [isDroneActive, setIsDroneActive] = useState<boolean>(false);

  // Progress & Resume Subsystem
  const [resumePoint, setResumePoint] = useState<ReadingProgress | null>(null);

  // Saved / Bookmark state
  const [savedVerses, setSavedVerses] = useState<
    Array<{ id: string; title: string; ref: string; snippet: string }>
  >(() => {
    try {
      const saved = localStorage.getItem("sutrasparsh_saved_verses");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "bg_2_47",
              title: "कर्मण्येवाधिकारस्ते…",
              ref: "Bhagavad Gita 2.47",
              snippet: "You have a right only to action...",
            },
            {
              id: "bg_2_50",
              title: "योगः कर्मसु कौशलम्…",
              ref: "Bhagavad Gita 2.50",
              snippet: "Yoga is skill in action...",
            },
            {
              id: "ys_1_2",
              title: "योगश्चित्तवृत्तिनिरोधः…",
              ref: "Patanjali Yoga Sutra 1.2",
              snippet: "Yoga is the stilling of mental fluctuations...",
            },
          ];
    } catch {
      return [
        {
          id: "bg_2_47",
          title: "कर्मण्येवाधिकारस्ते…",
          ref: "Bhagavad Gita 2.47",
          snippet: "You have a right only to action...",
        },
      ];
    }
  });

  const [isCurrentVerseSaved, setIsCurrentVerseSaved] = useState(true);

  // Reflections state
  const [reflections, setReflections] = useState<
    Array<{ id: string; verseRef: string; text: string; date: string }>
  >(() => {
    try {
      const saved = localStorage.getItem("sutrasparsh_reflections_list");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "ref-1",
              verseRef: "Gita 2.47",
              text: "This verse reminds me that my role is to perform my duty with wholehearted dedication, releasing anxious attachment to immediate recognition.",
              date: "Today",
            },
          ];
    } catch {
      return [];
    }
  });
  const [currentReflectionText, setCurrentReflectionText] = useState("");
  const [reflectionSavedMessage, setReflectionSavedMessage] = useState(false);
  const [editingRefId, setEditingRefId] = useState<string | null>(null);
  const [editingRefText, setEditingRefText] = useState("");

  // Full Commentary expansion
  const [commentaryExpanded, setCommentaryExpanded] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"text" | "meaning">("text");

  // Explore Filter Pill state
  const [explorePill, setExplorePill] = useState("All");

  // Mini Player Audio state (Driven by ShlokaRecitationEngine)
  const [playerVisible, setPlayerVisible] = useState(false);
  const [recitationState, setRecitationState] = useState<RecitationState>(() => recitationEngine.getState());
  const isPlaying = recitationState.isPlaying;
  const isSpeakingChant = recitationState.isPlaying && recitationState.verseId === selectedVerseData.id;
  const audioProgress = recitationState.currentTime;
  const audioDuration = recitationState.duration;

  // Streak State from Progress Service
  const [streakData, setStreakData] = useState<StreakData>(() => progressService.getStreakData());

  // Share Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareableContent, setShareableContent] = useState<ShareableContent | null>(null);

  // Collapsible section state for Home Screen (Block 4: Brahma Muhūrta & Explore Sacred Scriptures)
  const [isCollapsibleSectionOpen, setIsCollapsibleSectionOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sutrasparsh_collapse_sec4");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [isBrahmaMuhurtaOpen, setIsBrahmaMuhurtaOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sutrasparsh_collapse_muhurta");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [isExploreScripturesOpen, setIsExploreScripturesOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sutrasparsh_collapse_scriptures");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleCollapsibleSection = () => {
    setIsCollapsibleSectionOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sutrasparsh_collapse_sec4", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleBrahmaMuhurta = () => {
    setIsBrahmaMuhurtaOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sutrasparsh_collapse_muhurta", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleExploreScriptures = () => {
    setIsExploreScripturesOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sutrasparsh_collapse_scriptures", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Quick Access Scroller state & helpers
  const quickAccessRef = React.useRef<HTMLDivElement>(null);
  const [quickScrollRatio, setQuickScrollRatio] = useState<number>(0);

  const handleQuickScroll = () => {
    if (quickAccessRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = quickAccessRef.current;
      const max = scrollWidth - clientWidth;
      setQuickScrollRatio(max > 0 ? Math.min(1, Math.max(0, scrollLeft / max)) : 0);
    }
  };

  const scrollQuickAccess = (direction: "left" | "right") => {
    soundEngine.playTempleBell(direction === "right" ? 330 : 260);
    if (quickAccessRef.current) {
      const amount = 220;
      quickAccessRef.current.scrollBy({
        left: direction === "right" ? amount : -amount,
        behavior: "smooth",
      });
    }
  };

  // Sync Progress Service, Streak Engine, and Recitation Engine on mount
  useEffect(() => {
    const unsubProgress = progressService.subscribe((current) => {
      setResumePoint(current);
    });

    const unsubStreak = progressService.subscribeStreak((streak) => {
      setStreakData(streak);
    });

    const unsubRecitation = recitationEngine.subscribe((state) => {
      setRecitationState(state);
      if (state.verseId && state.isPlaying) {
        progressService.recordAudioProgress(
          state.verseId,
          {
            contentId: state.verseId,
            timestampSeconds: state.currentTime,
            durationSeconds: state.duration,
          },
          {
            scriptureTitle: selectedVerseData.source,
            verseTitle: selectedVerseData.title,
          }
        );
      }
    });

    return () => {
      unsubProgress();
      unsubStreak();
      unsubRecitation();
    };
  }, [selectedVerseData]);

  // Save theme
  useEffect(() => {
    try {
      localStorage.setItem("sutrasparsh_theme", theme);
    } catch {}
  }, [theme]);

  // Save additional preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sutrasparsh_pref_script", prefScript);
      localStorage.setItem("sutrasparsh_pref_lang", prefLang);
      localStorage.setItem("sutrasparsh_pref_speed", prefChantSpeed.toString());
      localStorage.setItem("sutrasparsh_pref_reminder", prefReminder);
    } catch {}
  }, [prefScript, prefLang, prefChantSpeed, prefReminder]);

  // Real-time synchronization listeners for preferences changed anywhere in the app
  useEffect(() => {
    const handleScriptEvent = (e: any) => {
      if (e.detail) setPrefScript(e.detail);
    };
    const handleLangEvent = (e: any) => {
      if (e.detail) setPrefLang(e.detail);
    };
    const handleSpeedEvent = (e: any) => {
      if (e.detail) {
        setPrefChantSpeed(e.detail);
        recitationEngine.setPlaybackRate(e.detail);
      }
    };
    const handleReminderEvent = (e: any) => {
      if (e.detail) setPrefReminder(e.detail);
    };

    window.addEventListener("sutrasparsh:pref_script", handleScriptEvent);
    window.addEventListener("sutrasparsh:pref_lang", handleLangEvent);
    window.addEventListener("sutrasparsh:pref_speed", handleSpeedEvent);
    window.addEventListener("sutrasparsh:pref_reminder", handleReminderEvent);

    return () => {
      window.removeEventListener("sutrasparsh:pref_script", handleScriptEvent);
      window.removeEventListener("sutrasparsh:pref_lang", handleLangEvent);
      window.removeEventListener("sutrasparsh:pref_speed", handleSpeedEvent);
      window.removeEventListener("sutrasparsh:pref_reminder", handleReminderEvent);
    };
  }, []);

  const handleSelectTheme = (newTheme: AppTheme) => {
    setInternalTheme(newTheme);
    try {
      localStorage.setItem("sutrasparsh_theme", newTheme);
    } catch {}
    if (onSelectTheme) {
      onSelectTheme(newTheme);
    }
    soundEngine.playTempleBell(newTheme === "sandstone" ? 220 : 330);
    const themeName = newTheme === "sandstone" ? "Sandstone Temple" : "Amethyst Twilight";
    setThemeToast(`Atmosphere switched to ${themeName}`);
    setTimeout(() => {
      setThemeToast(null);
    }, 2800);
  };

  const handleResetPreferences = () => {
    setInternalTheme("sandstone");
    if (onSelectTheme) {
      onSelectTheme("sandstone");
    }
    setPrefScript("both");
    setPrefLang("dual");
    setPrefChantSpeed(1.0);
    setPrefReminder("06:30");
    try {
      localStorage.setItem("sutrasparsh_theme", "sandstone");
      localStorage.setItem("sutrasparsh_pref_script", "both");
      localStorage.setItem("sutrasparsh_pref_lang", "dual");
      localStorage.setItem("sutrasparsh_pref_speed", "1.0");
      localStorage.setItem("sutrasparsh_pref_reminder", "06:30");
    } catch {}
    soundEngine.playTempleBell(220);
    setThemeToast("Preferences reset to default Sandstone Temple atmosphere");
    setTimeout(() => {
      setThemeToast(null);
    }, 2800);
  };

  // Save saved verses
  useEffect(() => {
    try {
      localStorage.setItem("sutrasparsh_saved_verses", JSON.stringify(savedVerses));
    } catch {}
  }, [savedVerses]);

  // Save reflections
  useEffect(() => {
    try {
      localStorage.setItem("sutrasparsh_reflections_list", JSON.stringify(reflections));
    } catch {}
  }, [reflections]);

  // Check if current verse is saved
  useEffect(() => {
    setIsCurrentVerseSaved(savedVerses.some((v) => v.id === selectedVerseData.id));
  }, [selectedVerseData.id, savedVerses]);

  // Toggle ambient Tanpura drone
  const handleToggleTanpura = () => {
    const active = soundEngine.toggleTanpuraDrone();
    setIsDroneActive(active);
    if (active) {
      setThemeToast("🕉️ Meditative Tanpura Drone activated (432Hz)");
    } else {
      setThemeToast("Tanpura Drone paused");
    }
    setTimeout(() => setThemeToast(null), 2500);
  };

  // Greeting by time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING • प्रातः काल";
    if (hour < 17) return "GOOD AFTERNOON • मध्याह्न";
    return "GOOD EVENING • सांध्य वेला";
  };

  const handleStartApp = () => {
    setOnboardingDone(true);
    try {
      localStorage.setItem("sutrasparsh_onboarding_done", "true");
    } catch {}
    soundEngine.playTempleBell(220);
    setActiveTab("home");
  };

  const toggleOnboardingOpt = (index: number) => {
    setSelectedOnboardingOptions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Dynamic Open Scripture Screen
  const openScriptureScreen = (scriptureKey = "bhagavad_gita") => {
    setSelectedScriptureId(scriptureKey);
    setSubScreen("scripture");
    soundEngine.playTempleBell(330);
  };

  // Dynamic Open Verse Screen
  const openVerseScreen = (verseId = "bg_2_47") => {
    const verse = VERSES_DATABASE[verseId] || VERSES_DATABASE["bg_2_47"];
    setSelectedVerseData(verse);
    setSubScreen("verse");
    soundEngine.playTempleBell(440);

    // Record progress reading position
    progressService.recordProgress(
      verse.id,
      {
        contentType: "verse",
        scriptureId: verse.scriptureId,
        scriptureTitle: verse.source,
        chapterId: `ch_${verse.chapterNum}`,
        chapterTitle: `Chapter ${verse.chapterNum} · ${verse.chapterName}`,
        verseId: verse.id,
        verseTitle: verse.title,
        progressPercent: 62,
        status: "IN_PROGRESS",
      },
      true
    );
  };

  const handleToggleSave = () => {
    soundEngine.playTempleBell(330);
    progressService.recordDailyCheckin();
    if (isCurrentVerseSaved) {
      setSavedVerses((prev) => prev.filter((v) => v.id !== selectedVerseData.id));
    } else {
      setSavedVerses((prev) => [
        {
          id: selectedVerseData.id,
          title: selectedVerseData.sanskrit.split("\n")[0] + "…",
          ref: selectedVerseData.title,
          snippet: selectedVerseData.meaning.slice(0, 50) + "...",
        },
        ...prev,
      ]);
    }
  };

  const handleSaveReflection = () => {
    if (!currentReflectionText.trim()) return;
    progressService.recordDailyCheckin();
    const newRef = {
      id: "ref-" + Date.now(),
      verseRef: selectedVerseData.title,
      text: currentReflectionText.trim(),
      date: "Today",
    };
    setReflections((prev) => [newRef, ...prev]);
    setCurrentReflectionText("");
    setReflectionSavedMessage(true);
    soundEngine.playTempleBell(220);
    setTimeout(() => setReflectionSavedMessage(false), 2500);
  };

  const handleSaveEditReflection = (id: string) => {
    if (!editingRefText.trim()) return;
    setReflections((prev) =>
      prev.map((r) => (r.id === id ? { ...r, text: editingRefText.trim() } : r))
    );
    setEditingRefId(null);
    soundEngine.playTempleBell(330);
    setThemeToast("Reflection updated.");
    setTimeout(() => setThemeToast(null), 2000);
  };

  const handleDeleteReflection = (id: string) => {
    setReflections((prev) => prev.filter((r) => r.id !== id));
    soundEngine.playTempleBell(220);
  };

  const handleExportReflections = () => {
    soundEngine.playTempleBell(220);
    const content = `# SutraSparsh · Sādhana Reflections
Export Date: ${new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}

Total Contemplations: ${reflections.length}
Saved Verses: ${savedVerses.length}

---

${reflections
  .map(
    (r, idx) => `### ${idx + 1}. ${r.verseRef} (${r.date})
> ${r.text.replace(/\n/g, "\n> ")}
`
  )
  .join("\n---\n\n")}
`;

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SutraSparsh-Reflections-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setThemeToast("Journal exported to Markdown file.");
    setTimeout(() => setThemeToast(null), 2500);
  };

  const handleExportBackupJson = () => {
    soundEngine.playTempleBell(220);
    const jsonStr = progressService.exportBackupData();
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SutraSparsh-SadhanaBackup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setThemeToast("✓ Full Sādhana Backup (.json) downloaded.");
    setTimeout(() => setThemeToast(null), 2500);
  };

  const handleImportBackupJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = progressService.importBackupData(content);
        if (success) {
          try {
            const saved = localStorage.getItem("sutrasparsh_saved_verses");
            if (saved) setSavedVerses(JSON.parse(saved));
            const refl = localStorage.getItem("sutrasparsh_reflections_list");
            if (refl) setReflections(JSON.parse(refl));
            const th = localStorage.getItem("sutrasparsh_theme") as AppTheme;
            if (th) handleSelectTheme(th);
            setStreakData(progressService.getStreakData());
          } catch {}
          soundEngine.playTempleBell(440);
          setThemeToast("✓ Sādhana backup successfully restored!");
        } else {
          setThemeToast("⚠️ Invalid backup file format.");
        }
        setTimeout(() => setThemeToast(null), 3000);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = "";
  };

  const handleOpenShare = () => {
    setShareableContent({
      id: selectedVerseData.id,
      title: selectedVerseData.title,
      subtitle: selectedVerseData.chapterName,
      sanskritText: selectedVerseData.sanskrit,
      transliteration: selectedVerseData.transliteration,
      meaning: selectedVerseData.meaning,
      commentaryExcerpt: selectedVerseData.commentary,
      source: selectedVerseData.source,
    });
    setIsShareModalOpen(true);
  };

  const handleStartListen = () => {
    setPlayerVisible(true);
    soundEngine.playTempleBell(440);
    recitationEngine.play(
      selectedVerseData.id,
      selectedVerseData.sanskrit,
      prefChantSpeed
    );
  };

  const handleWordTap = (wordKey: string) => {
    soundEngine.playTempleBell(520);
  };

  // Test / Request Notification Permissions
  const handleRequestNotifications = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("SutraSparsh · Daily Shloka", {
          body: `Brahma Muhurta notifications configured for ${prefReminder} IST.`,
          icon: "/favicon.ico",
        });
        setThemeToast(`✓ Notifications enabled for ${prefReminder}`);
      } else {
        setThemeToast("Notifications disabled by browser setting.");
      }
    } else {
      setThemeToast(`✓ Reminder scheduled for ${prefReminder} IST.`);
    }
    setTimeout(() => setThemeToast(null), 3000);
  };

  // Theme-driven CSS class tokens
  const isLight = theme === "light";
  const isFestival = theme === "festival";
  const isAmethyst = theme === "amethyst";
  const isSandstone = theme === "sandstone" || (!isLight && !isFestival && !isAmethyst);

  const themeCardDark = isLight
    ? "bg-gradient-to-b from-[#FFFFFF] to-[#F6EDE1] border border-[#E6D7C3] text-[#3A2818]"
    : isFestival
    ? "bg-gradient-to-b from-[#5E111C] to-[#4B0E17] border border-[#FF8A00]/40 text-[#FFF6E3]"
    : isAmethyst
    ? "bg-gradient-to-b from-[#251640] to-[#150B28] border border-[#52297A]/40 text-[#EDE0F8]"
    : "bg-gradient-to-b from-[#2B1706] to-[#1D0F04] border border-[#78300C]/40 text-[#F5E4C8]";

  const themeGold = isLight ? "#B9680D" : isFestival ? "#FF8A00" : isAmethyst ? "#C4A8E6" : "#E8921A";
  const themeGoldLight = isLight ? "#B9680D" : isFestival ? "#FFD54A" : isAmethyst ? "#D4BEF2" : "#F4B24B";
  const themeMist = isLight ? "#574332" : isFestival ? "#FFDDB3" : isAmethyst ? "#B8A4CC" : "#D4BC96";
  const themeTextColor = isLight ? "text-stone-900" : isFestival ? "text-[#FFF6E3]" : isAmethyst ? "text-[#EDE0F8]" : "text-stone-100";
  const themeSubTextColor = isLight ? "text-stone-700" : isFestival ? "text-amber-200/80" : isAmethyst ? "text-purple-200/80" : "text-stone-400";
  const themeCardBg = isLight
    ? "linear-gradient(145deg, #FFFBF5, #F6EDE1)"
    : isFestival
    ? "linear-gradient(145deg, #7A1825, #4B0E17)"
    : isAmethyst
    ? "linear-gradient(145deg, #ede2f8, #d8c2f0)"
    : "linear-gradient(145deg, #fdf0d0, #f5e0a0)";

  const subScreenBg = isLight
    ? "#FBF9F5"
    : isFestival
    ? "#38060D"
    : isAmethyst
    ? "#120924"
    : "#120A04";

  const subScreenBarBg = isLight
    ? "rgba(251,249,245,0.96)"
    : isFestival
    ? "rgba(56,6,13,0.96)"
    : isAmethyst
    ? "rgba(18,9,36,0.96)"
    : "rgba(18,10,4,0.96)";

  const subScreenBorder = isLight
    ? "border-stone-200"
    : isFestival
    ? "border-[#FF8A00]/25"
    : isAmethyst
    ? "border-[#52297A]/40"
    : "border-white/10";

  const subScreenHeaderBorder = isLight
    ? "border-stone-200"
    : isFestival
    ? "border-[#FF8A00]/20"
    : isAmethyst
    ? "border-[#52297A]/30"
    : "border-white/5";

  // Filtered Corpus for Search Tab with Diacritic-Agnostic & Phonetic Sanskrit Search
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    return Object.values(VERSES_DATABASE).filter(
      (v) =>
        matchesSanskritQuery(v.title, searchQuery) ||
        matchesSanskritQuery(v.sanskrit, searchQuery) ||
        matchesSanskritQuery(v.transliteration, searchQuery) ||
        matchesSanskritQuery(v.meaning, searchQuery) ||
        (v.hindiMeaning && matchesSanskritQuery(v.hindiMeaning, searchQuery)) ||
        matchesSanskritQuery(v.commentary, searchQuery) ||
        matchesSanskritQuery(v.source, searchQuery) ||
        (v.tags && v.tags.some((t) => matchesSanskritQuery(t, searchQuery)))
    );
  }, [searchQuery]);

  const activeScriptureData: ScriptureData =
    SCRIPTURES_CORPUS[selectedScriptureId] || SCRIPTURES_CORPUS["bhagavad_gita"];

  return (
    <div
      className={`w-full ${
        hideHeaderAndNav
          ? "transition-colors duration-300"
          : isLight
          ? "min-h-dvh flex justify-center selection:bg-amber-300 selection:text-stone-950 light-mode"
          : "min-h-dvh flex justify-center selection:bg-amber-500/40 selection:text-amber-100"
      }`}
      style={{
        backgroundColor: hideHeaderAndNav
          ? "transparent"
          : isLight
          ? "#FDFBF7"
          : isFestival
          ? "#280509"
          : isAmethyst
          ? "#080410"
          : "#0A0502",
      }}
    >
      {/* Container: Fluid max-w-7xl on desktop when embedded, or mobile shell when standalone */}
      <div
        className={`w-full ${
          hideHeaderAndNav
            ? "max-w-7xl mx-auto flex flex-col relative transition-colors duration-300 font-sans"
            : "max-w-[430px] min-h-dvh flex flex-col relative overflow-hidden shadow-2xl transition-colors duration-300 pb-28 font-sans"
        }`}
        style={{
          backgroundColor: hideHeaderAndNav
            ? "transparent"
            : isLight
            ? "#FFFBF5"
            : isFestival
            ? "#38090F"
            : isAmethyst
            ? "#0F0A1A"
            : "#120A04",
        }}
      >
        {/* ════════════ ONBOARDING MODAL ════════════ */}
        {!onboardingDone && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn backdrop-blur-xl bg-stone-950/85 flex justify-center p-0 sm:p-4 lg:p-6"
          >
            <div
              className="w-full max-w-lg min-h-dvh sm:min-h-0 sm:my-auto sm:rounded-3xl shadow-2xl flex flex-col justify-between p-6 sm:p-8 overflow-y-auto border border-white/10"
              style={{
                backgroundColor: isSandstone ? "rgba(18,10,4,0.98)" : "rgba(15,10,26,0.98)",
              }}
            >
            <div className="space-y-6 pt-2">
              <div className="text-center space-y-3">
                <span
                  className="font-sanskrit text-5xl block"
                  style={{ color: themeGoldLight }}
                >
                  ॐ
                </span>
                <h1 className="font-serif-sacred text-2xl sm:text-3xl font-bold text-stone-100">
                  Welcome to SutraSparsh
                </h1>
                <p className="text-xs sm:text-sm leading-relaxed max-w-sm mx-auto" style={{ color: themeMist }}>
                  A daily contemplative sanctuary for authentic Sanskrit scriptures, transliterations, and lineage commentaries.
                </p>
              </div>

              {/* Questionnaire Options */}
              <div className="space-y-2.5 pt-2">
                <div
                  className="text-[10.5px] font-extrabold tracking-widest uppercase px-1"
                  style={{ color: themeGoldLight }}
                >
                  WHAT CALLS YOU TO CONTEMPLATION?
                </div>

                {[
                  { text: "Finding inner calm amidst daily noise", icon: "🕊️" },
                  { text: "Studying the Bhagavad Gita & Upanishads", icon: "📗" },
                  { text: "Learning Sanskrit shlokas & pronunciation", icon: "🕉️" },
                  { text: "Cultivating a daily 5-minute reflection habit", icon: "🌱" },
                ].map((opt, idx) => {
                  const isSelected = selectedOnboardingOptions.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleOnboardingOpt(idx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-400 text-stone-100 font-semibold"
                          : "bg-white/5 border-white/5 text-stone-400 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-xs flex-1">{opt.text}</span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? "bg-amber-500 border-amber-400 text-stone-950" : "border-stone-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <button
                onClick={handleStartApp}
                className="w-full py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center space-x-2"
              >
                <span>Enter Sacred Sanctuary</span>
                <span>→</span>
              </button>
            </div>
            </div>
          </div>
        )}

        {/* ════════════ APP BAR (Hidden when embedded into main responsive shell) ════════════ */}
        {!hideHeaderAndNav && (
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-5 py-3.5 backdrop-blur-md border-b border-white/5 transition-colors duration-300"
          style={{ backgroundColor: isSandstone ? "rgba(18,10,4,0.92)" : "rgba(15,10,26,0.92)" }}
        >
          <div className="flex items-center space-x-2">
            <span
              className="font-serif-sacred text-xl font-bold tracking-tight cursor-pointer"
              onClick={() => {
                setSubScreen("none");
                setActiveTab("home");
              }}
              style={{ color: themeGoldLight }}
            >
              Sutra<em className="font-normal opacity-80 not-italic text-stone-200">Sparsh</em>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono">
              2.0
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Meditative Tanpura Drone Continuous Audio Button */}
            <button
              onClick={handleToggleTanpura}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center space-x-1 border ${
                isDroneActive
                  ? "bg-amber-500 text-stone-950 border-amber-400 shadow-[0_0_12px_rgba(232,146,26,0.5)] animate-pulse"
                  : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
              }`}
              title="Toggle Meditative Tanpura Drone (432Hz)"
            >
              <Radio className="w-3 h-3" />
              <span className="text-[10px]">Tanpura</span>
            </button>

            {/* Theme Switcher Quick Toggle */}
            <button
              onClick={() => handleSelectTheme(isSandstone ? "amethyst" : "sandstone")}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs transition-transform active:scale-95 shadow-sm"
              title={`Switch atmosphere to ${isSandstone ? "Amethyst Twilight" : "Sandstone Temple"} (Persisted)`}
            >
              {isSandstone ? "🏛️" : "🔮"}
            </button>

            {/* Search Button */}
            <button
              onClick={() => {
                setSubScreen("none");
                setActiveTab("search");
              }}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-200 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </header>
        )}

        {/* Global Toast Notification for Theme & Preferences */}
        {themeToast && (
          <div className="fixed top-16 left-0 right-0 max-w-[400px] mx-auto z-50 px-4 animate-bounce">
            <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-stone-950 font-bold text-xs shadow-xl flex items-center space-x-2 backdrop-blur-md">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{themeToast}</span>
            </div>
          </div>
        )}

        {/* ════════════ SCREENS ════════════ */}

        {/* 1. HOME SCREEN */}
        {activeTab === "home" && subScreen === "none" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Greeting & Date Navigation: Line 1 = Day's greeting, Line 2 = "Take a moment with today's wisdom" */}
            <div className="px-5 pt-2 pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col min-w-0">
                {/* 1st line: Day's greeting */}
                <div
                  className="text-[11px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  {getGreeting()}
                </div>
                {/* 2nd line: Take a moment with today's wisdom */}
                <h2 className={`font-serif-sacred text-base sm:text-lg font-bold ${themeTextColor} leading-snug mt-0.5`}>
                  Take a moment with today's wisdom
                </h2>
              </div>

              {/* Date Navigation Buttons */}
              <div className="flex items-center space-x-1.5 self-end sm:self-auto flex-shrink-0">
                <button
                  onClick={() => setSelectedDateOffset((prev) => prev - 1)}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-medium transition-colors cursor-pointer border ${
                    isLight
                      ? "bg-white hover:bg-stone-100 text-stone-800 border-stone-300 shadow-xs"
                      : "bg-white/5 hover:bg-white/10 text-stone-300 border-white/5"
                  }`}
                  title="Yesterday's Shloka"
                  aria-label="Previous Day"
                >
                  ← Prev
                </button>
                <span
                  className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold border ${
                    isLight
                      ? "bg-amber-100 text-amber-950 border-amber-300"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/25"
                  }`}
                >
                  {selectedDateOffset === 0
                    ? "Today"
                    : selectedDateOffset === -1
                    ? "Yesterday"
                    : selectedDateOffset === 1
                    ? "Tomorrow"
                    : `Day ${selectedDateOffset > 0 ? "+" : ""}${selectedDateOffset}`}
                </span>
                <button
                  onClick={() => setSelectedDateOffset((prev) => prev + 1)}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-medium transition-colors cursor-pointer border ${
                    isLight
                      ? "bg-white hover:bg-stone-100 text-stone-800 border-stone-300 shadow-xs"
                      : "bg-white/5 hover:bg-white/10 text-stone-300 border-white/5"
                  }`}
                  title="Tomorrow's Shloka"
                  aria-label="Next Day"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* 1. DAILY SHLOKA ROTATION SECTION */}
            {/* Today's Wisdom Card (Dynamic Daily Rotation) */}
            <div className={`mx-4 p-5 sm:p-6 rounded-3xl ${themeCardDark} space-y-4 shadow-xl`}>
              <div className="flex items-center justify-between">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  DAILY SHLOKA ROTATION
                </span>
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                      isLight
                        ? "bg-amber-100 text-amber-950 border-amber-300 font-bold"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {currentDailyVerse.source}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isLight
                        ? "bg-stone-200/80 text-stone-700"
                        : "bg-white/10 text-stone-300"
                    }`}
                  >
                    {prefChantSpeed}x
                  </span>
                </div>
              </div>

              {/* Sacred Sanskrit Verse & Roman Transliteration (Respecting prefScript) */}
              <div className="space-y-2 py-1">
                {(prefScript === "both" || prefScript === "devanagari") && (
                  <div
                    className={`font-sanskrit text-lg sm:text-xl leading-[2.1] text-center ${
                      isLight ? "text-[#1C0F05] font-semibold" : "text-stone-100"
                    }`}
                  >
                    {currentDailyVerse.sanskrit.split("\n").map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                )}
                {(prefScript === "both" || prefScript === "transliteration") && (
                  <div
                    className={`font-serif italic text-xs sm:text-sm leading-relaxed text-center px-2 ${
                      isLight ? "text-[#6E3B0A]" : "text-amber-200/90"
                    }`}
                  >
                    {currentDailyVerse.transliteration}
                  </div>
                )}
              </div>

              {/* Sacred Lotus Rule Divider */}
              <div className="flex items-center space-x-2.5 py-1">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: themeGold }}
                />
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
              </div>

              {/* Meaning & Commentary (Respecting prefLang) */}
              <div className="space-y-1.5 text-center px-1">
                {(prefLang === "dual" || prefLang === "en") && (
                  <p
                    className={`text-xs sm:text-sm italic leading-relaxed ${
                      isLight ? "text-[#2B1B10] font-normal" : ""
                    }`}
                    style={{ color: isLight ? undefined : themeMist }}
                  >
                    "{currentDailyVerse.meaning}"
                  </p>
                )}
                {(prefLang === "dual" || prefLang === "hi") && currentDailyVerse.hindiMeaning && (
                  <p
                    className={`text-xs font-sanskrit leading-relaxed ${
                      isLight ? "text-[#7A3800] font-medium" : "text-amber-300/80"
                    }`}
                  >
                    "{currentDailyVerse.hindiMeaning}"
                  </p>
                )}
              </div>

              {/* Reference */}
              <div
                className="text-[11.5px] font-bold flex items-center justify-center space-x-2 pt-1"
                style={{ color: themeGoldLight }}
              >
                <div className="w-4 h-[1px]" style={{ backgroundColor: themeGold }} />
                <span>
                  {currentDailyVerse.source} · {currentDailyVerse.title}
                </span>
                <div className="w-4 h-[1px]" style={{ backgroundColor: themeGold }} />
              </div>

              {/* Buttons */}
              <div className="flex space-x-2.5 pt-2">
                <button
                  onClick={() => openVerseScreen(currentDailyVerse.id)}
                  className="flex-1 py-2.5 rounded-full font-bold text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow hover:scale-[1.02] transition-transform text-center cursor-pointer"
                >
                  Read & Study
                </button>
                <button
                  onClick={() => {
                    setSelectedVerseData(currentDailyVerse);
                    setPlayerVisible(true);
                    soundEngine.playTempleBell(440);
                    recitationEngine.play(
                      currentDailyVerse.id,
                      currentDailyVerse.sanskrit,
                      prefChantSpeed
                    );
                  }}
                  className={`flex-1 py-2.5 rounded-full font-bold text-xs border transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                    isLight
                      ? "bg-white hover:bg-stone-100 text-stone-800 border-stone-300 shadow-xs"
                      : "bg-white/10 hover:bg-white/15 text-stone-200 border-white/10"
                  }`}
                  aria-label="Listen to recitation at chant speed"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen ({prefChantSpeed}x)</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedVerseData(currentDailyVerse);
                    handleOpenShare();
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
                    isLight
                      ? "bg-white hover:bg-stone-100 text-stone-700 border-stone-300 shadow-xs"
                      : "bg-white/10 hover:bg-white/15 text-stone-200 border-transparent"
                  }`}
                  title="Share Shloka"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Streak Bar (Dynamic from Progress Engine) */}
            <div className="px-5 flex items-center space-x-2.5">
              <div
                className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold ${
                  isLight
                    ? "bg-amber-100/90 text-amber-950 border-amber-300 shadow-xs"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                }`}
              >
                <span>🔥</span>
                <span>{streakData.currentStreak}-day streak</span>
              </div>
              <span className={`text-xs ${isLight ? "text-stone-700" : ""}`} style={{ color: isLight ? undefined : themeMist }}>
                {streakData.checkedInToday ? "Brahma Muhurta habit active today" : "Daily check-in ready"}
              </span>
            </div>

            {/* CONTINUE YOUR SCRIPTURE JOURNEY */}
            <div className="px-4 space-y-2.5 pt-1">
              <div className="flex items-center justify-between px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  CONTINUE YOUR JOURNEY
                </span>
                <button
                  onClick={() => setActiveTab("journey")}
                  className={`text-xs font-bold transition-colors ${
                    isLight ? "text-amber-800 hover:text-amber-950" : "text-stone-400 hover:text-amber-300"
                  }`}
                >
                  View all
                </button>
              </div>

              <div
                onClick={() => openScriptureScreen("bhagavad_gita")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3.5 group shadow ${
                  isLight
                    ? "bg-white border-stone-200 hover:border-amber-400 shadow-sm"
                    : "bg-stone-900/60 border-amber-500/20 hover:border-amber-500/40"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  📗
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold leading-snug break-words ${isLight ? "text-stone-900" : "text-stone-100"}`}>
                    {resumePoint?.scriptureTitle || "Bhagavad Gita"}
                  </div>
                  <div className={`text-[11.5px] leading-snug break-words mt-0.5 ${isLight ? "text-stone-600" : "text-stone-400"}`}>
                    {resumePoint?.chapterTitle || "Chapter 2 · Verse 47 · Sankhya Yoga"}
                  </div>
                  <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${isLight ? "bg-stone-100" : "bg-stone-800"}`}>
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${resumePoint?.progressPercent || 62}%` }}
                    />
                  </div>
                  <div className={`text-[10.5px] font-bold mt-1 ${isLight ? "text-amber-800" : "text-amber-400/90"}`}>
                    {resumePoint?.progressPercent || 62}% · 266 verses read
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-500 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 4. WITH COLLAPSIBLE OPTION: 1. Brahma Muhūrta section, 2. EXPLORE SACRED SCRIPTURES */}
            <div className="space-y-3 pt-1">
              <div className="px-5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-500 text-xs">🌅</span>
                  <span
                    className="text-[10.5px] font-extrabold tracking-widest uppercase"
                    style={{ color: themeGoldLight }}
                  >
                    Brahma Muhūrta & Scriptures • ब्रह्म मुहूर्त एवं शास्त्र
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleCollapsibleSection}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1.5 border transition-colors cursor-pointer ${
                    isLight
                      ? "bg-white hover:bg-stone-100 text-stone-800 border-stone-300 shadow-xs"
                      : "bg-white/5 hover:bg-white/10 text-amber-300 border-white/10"
                  }`}
                  aria-expanded={isCollapsibleSectionOpen}
                  aria-label="Toggle Brahma Muhurta and Scriptures section"
                >
                  <span>{isCollapsibleSectionOpen ? "Collapse" : "Expand"}</span>
                  {isCollapsibleSectionOpen ? (
                    <Minus className="w-3 h-3 text-amber-500" />
                  ) : (
                    <Plus className="w-3 h-3 text-amber-500" />
                  )}
                </button>
              </div>

              {isCollapsibleSectionOpen && (
                <div className="space-y-4 animate-fadeIn">
                  {/* 4.1 Brahma Muhūrta section (with collapsible toggle) */}
                  <div className="space-y-1.5">
                    <div className="px-5 flex items-center justify-between text-[11px]">
                      <span className={`font-semibold flex items-center space-x-1.5 ${isLight ? "text-stone-700" : "text-stone-300"}`}>
                        <span className="font-mono text-[10px] text-amber-500">4.1</span>
                        <span>Brahma Muhūrta Section</span>
                      </span>
                      <button
                        type="button"
                        onClick={toggleBrahmaMuhurta}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isLight ? "bg-stone-100 text-stone-700 border-stone-200" : "bg-white/5 text-amber-400/90 border-white/10"
                        }`}
                        title={isBrahmaMuhurtaOpen ? "Collapse Brahma Muhurta" : "Expand Brahma Muhurta"}
                      >
                        {isBrahmaMuhurtaOpen ? "— Collapse" : "+ Expand"}
                      </button>
                    </div>

                    {isBrahmaMuhurtaOpen ? (
                      <BrahmaMuhurtaTimer theme={theme} onOpenPref={() => setSubScreen("pref")} />
                    ) : (
                      <div
                        onClick={toggleBrahmaMuhurta}
                        className={`mx-4 px-4 py-2.5 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                          isLight
                            ? "bg-amber-50 border-amber-200 text-stone-800 hover:bg-amber-100/70"
                            : "bg-stone-900/50 border-amber-500/20 text-amber-300 hover:bg-stone-900/80"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Sunrise className="w-4 h-4 text-amber-500" />
                          <span className="font-bold">Brahma Muhūrta Window (04:30 – 05:18 AM)</span>
                        </div>
                        <span className="text-[10.5px] font-mono text-amber-500">Tap to expand →</span>
                      </div>
                    )}
                  </div>

                  {/* 4.2 EXPLORE SACRED SCRIPTURES (with collapsible toggle) */}
                  <div className="px-4 space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[10px] text-amber-500">4.2</span>
                        <span
                          className="text-[10.5px] font-extrabold tracking-widest uppercase"
                          style={{ color: themeGoldLight }}
                        >
                          EXPLORE SACRED SCRIPTURES
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={toggleExploreScriptures}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            isLight ? "bg-stone-100 text-stone-700 border-stone-200" : "bg-white/5 text-amber-400/90 border-white/10"
                          }`}
                          title={isExploreScripturesOpen ? "Collapse Scriptures" : "Expand Scriptures"}
                        >
                          {isExploreScripturesOpen ? "— Collapse" : "+ Expand"}
                        </button>
                        <button
                          onClick={() => setActiveTab("explore")}
                          className={`text-xs font-bold transition-colors ${
                            isLight ? "text-amber-800 hover:text-amber-950" : "text-stone-400 hover:text-amber-300"
                          }`}
                        >
                          View all
                        </button>
                      </div>
                    </div>

                    {isExploreScripturesOpen && (
                      <div className="flex flex-wrap gap-2 animate-fadeIn">
                        {[
                          { label: "📗 Bhagavad Gita", action: () => openScriptureScreen("bhagavad_gita") },
                          { label: "🧘 Yoga Sutras", action: () => openScriptureScreen("yoga_sutras") },
                          { label: "📜 Isha Upanishad", action: () => openScriptureScreen("isha_upanishad") },
                          { label: "🕉️ Mandukya Upanishad", action: () => openScriptureScreen("mandukya_upanishad") },
                          { label: "💎 Vivekachudamani", action: () => openScriptureScreen("vivekachudamani") },
                          { label: "⚔️ Ashtavakra Gita", action: () => openScriptureScreen("ashtavakra_gita") },
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={chip.action}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              isLight
                                ? "border-stone-300 bg-white text-stone-800 hover:bg-amber-50 hover:border-amber-400 shadow-xs"
                                : "border-white/10 bg-white/5 text-stone-200 hover:bg-amber-500/10 hover:border-amber-500/30"
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* QUICK ACCESS TILES (ENHANCED 2-ROW RESPONSIVE GRID) */}
            <div className="px-4 space-y-2.5 pt-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-amber-500 text-xs">✨</span>
                  <span
                    className="text-[11px] font-extrabold tracking-wider uppercase font-sans"
                    style={{ color: themeGoldLight }}
                  >
                    Quick Access • त्वरित सेवा
                  </span>
                </div>
                <span className="text-[10px] text-amber-300/80 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  8 Sacred Portals
                </span>
              </div>

              {/* 2-Row Responsive Grid (4 columns on sm/tablet/desktop, 2 columns on mobile) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {/* 1. Saved Verses Tile */}
                <div
                  onClick={() => setActiveTab("journey")}
                  className="p-3 sm:p-3.5 rounded-2xl cursor-pointer hover:opacity-95 transition-all shadow-md active:scale-95 border border-amber-400/30 group flex flex-col justify-between min-h-[102px]"
                  style={{ background: "linear-gradient(145deg, #FFB347, #E88916)" }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${savedVerses.length} saved shlokas`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl group-hover:scale-110 transition-transform">⭐</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-950/20 text-stone-900 px-1.5 py-0.5 rounded-md">
                      Corpus
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-950 tracking-tight leading-tight break-words">
                      {savedVerses.length} Saved
                    </div>
                    <div className="text-[10px] text-stone-800 font-medium leading-tight mt-0.5">Favorite Shlokas</div>
                  </div>
                </div>

                {/* 2. Sanskrit Glossary Tile */}
                <div
                  onClick={() => setSubScreen("glossary")}
                  className="p-3 sm:p-3.5 rounded-2xl cursor-pointer hover:opacity-95 transition-all shadow-md active:scale-95 border border-emerald-400/30 group flex flex-col justify-between min-h-[102px]"
                  style={{ background: "linear-gradient(145deg, #D4ECD5, #9ED4A3)" }}
                  role="button"
                  tabIndex={0}
                  aria-label="Open Sanskrit Glossary"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl group-hover:scale-110 transition-transform">📚</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-950/20 text-stone-900 px-1.5 py-0.5 rounded-md">
                      Dhātu
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-950 tracking-tight leading-tight break-words">Glossary</div>
                    <div className="text-[10px] text-stone-800 font-medium leading-tight mt-0.5">Roots & Meaning</div>
                  </div>
                </div>

                {/* 3. Guided Paths Tile */}
                <div
                  onClick={() => setSubScreen("paths")}
                  className="p-3 sm:p-3.5 rounded-2xl cursor-pointer hover:opacity-95 transition-all shadow-md active:scale-95 border border-amber-300/40 group flex flex-col justify-between min-h-[102px]"
                  style={{ background: "linear-gradient(145deg, #FDE6B8, #F0C475)" }}
                  role="button"
                  tabIndex={0}
                  aria-label="Start Guided Spiritual Paths"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl group-hover:scale-110 transition-transform">🛤️</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-950/20 text-stone-900 px-1.5 py-0.5 rounded-md">
                      Track
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-950 tracking-tight leading-tight break-words">Paths</div>
                    <div className="text-[10px] text-stone-800 font-medium leading-tight mt-0.5">Guided Journeys</div>
                  </div>
                </div>

                {/* 4. Personal Notes & Reflections */}
                <div
                  onClick={() => setActiveTab("journey")}
                  className="p-3 sm:p-3.5 rounded-2xl cursor-pointer hover:opacity-95 transition-all shadow-md active:scale-95 border border-rose-300/40 group flex flex-col justify-between min-h-[102px]"
                  style={{ background: "linear-gradient(145deg, #FBD5CC, #F7AB9C)" }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${reflections.length} reflections`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl group-hover:scale-110 transition-transform">✍️</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-950/20 text-stone-900 px-1.5 py-0.5 rounded-md">
                      Sādhana
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-950 tracking-tight leading-tight break-words">
                      {reflections.length} Notes
                    </div>
                    <div className="text-[10px] text-stone-800 font-medium leading-tight mt-0.5">Your Reflections</div>
                  </div>
                </div>

                {/* 5. 432Hz Chanting Audio */}
                <div
                  onClick={() => handleStartListen()}
                  className="p-3 sm:p-3.5 rounded-2xl cursor-pointer hover:opacity-95 transition-all shadow-md active:scale-95 border border-purple-400/30 group flex flex-col justify-between min-h-[102px]"
                  style={{ background: "linear-gradient(145deg, #E6D2F7, #C6A1EC)" }}
                  role="button"
                  tabIndex={0}
                  aria-label="Listen to 432Hz Chanting Audio"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl group-hover:scale-110 transition-transform">🪔</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-950/20 text-stone-900 px-1.5 py-0.5 rounded-md">
                      Audio
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-950 tracking-tight leading-tight break-words">Recitation</div>
                    <div className="text-[10px] text-stone-800 font-medium leading-tight mt-0.5">432Hz Vedic Tone</div>
                  </div>
                </div>

                {/* 6. Brahma Muhurta Reminder */}
                <div
                  onClick={() => setSubScreen("pref")}
                  className="p-3 sm:p-3.5 rounded-2xl cursor-pointer hover:opacity-95 transition-all shadow-md active:scale-95 border border-amber-500/40 group flex flex-col justify-between min-h-[102px]"
                  style={{ background: "linear-gradient(145deg, #FFE082, #FFB300)" }}
                  role="button"
                  tabIndex={0}
                  aria-label="Configure Brahma Muhurta Reminder"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl group-hover:scale-110 transition-transform">🌅</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-950/20 text-stone-900 px-1.5 py-0.5 rounded-md">
                      Muhūrta
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-950 tracking-tight leading-tight break-words">{prefReminder} IST</div>
                    <div className="text-[10px] text-stone-800 font-medium leading-tight mt-0.5">Dawn Reminder</div>
                  </div>
                </div>

                {/* 7. Sacred Gurudakshina / Seva (Phase 2 Feature: Disabled by default) */}
                {isGurudakshinaEnabled && (
                  <div
                    onClick={() => onOpenDonation?.()}
                    className="p-3 sm:p-3.5 rounded-2xl cursor-pointer hover:opacity-95 transition-all shadow-md active:scale-95 border border-rose-600/40 group flex flex-col justify-between min-h-[102px]"
                    style={{ background: "linear-gradient(145deg, #7A1825, #4B0E17)" }}
                    role="button"
                    tabIndex={0}
                    aria-label="Sacred Seva and Gurudakshina"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl group-hover:scale-110 transition-transform">💛</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 text-amber-200 px-1.5 py-0.5 rounded-md">
                        80G Tax
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#FFF6E3] tracking-tight leading-tight break-words">Gurudakshina</div>
                      <div className="text-[10px] text-amber-200/80 font-medium leading-tight mt-0.5">Sacred Seva</div>
                    </div>
                  </div>
                )}

                {/* 8. Sādhaka Club / Membership (Phase 2 Feature: Disabled by default) */}
                {isSadhakaEnabled && (
                  <div
                    onClick={() => onOpenPricing?.()}
                    className="p-3 sm:p-3.5 rounded-2xl cursor-pointer hover:opacity-95 transition-all shadow-md active:scale-95 border border-amber-500/30 group flex flex-col justify-between min-h-[102px]"
                    style={{ background: "linear-gradient(145deg, #2D1B4E, #1A0D2E)" }}
                    role="button"
                    tabIndex={0}
                    aria-label="Sādhaka Membership Access"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl group-hover:scale-110 transition-transform">⚡</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md">
                        Premium
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-amber-200 tracking-tight leading-tight break-words">Sādhaka Access</div>
                      <div className="text-[10px] text-purple-200/80 font-medium leading-tight mt-0.5">Exclusive Corpus</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sacred Lunar Calendar Tithis & Parv Dates */}
            <ImportantTithisParv theme={theme} onSelectVerse={openVerseScreen} />
          </div>
        )}

        {/* 2. EXPLORE SCREEN */}
        {activeTab === "explore" && subScreen === "none" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="px-5 pt-2 flex items-center justify-between">
              <h2 className={`font-serif-sacred text-2xl font-bold ${themeTextColor}`}>
                Explore Scriptures & Traditions
              </h2>
              <button
                onClick={() => setActiveTab("search")}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  isLight ? "bg-stone-200/80 text-stone-700 hover:bg-stone-300" : "bg-white/5 text-stone-200 hover:bg-white/10"
                }`}
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar Input Trigger */}
            <div className="px-4">
              <div
                onClick={() => setActiveTab("search")}
                className={`flex items-center space-x-2.5 p-3 rounded-2xl border cursor-pointer transition-colors ${
                  isLight
                    ? "bg-white border-stone-300 hover:border-amber-400 shadow-xs"
                    : "bg-white/5 border-white/10 hover:border-amber-500/40"
                }`}
              >
                <Search className="w-4 h-4 text-amber-500" />
                <span className={`text-xs ${isLight ? "text-stone-500" : "text-stone-400"}`}>Search all wisdom, mantras, traditions...</span>
              </div>
            </div>

            {/* BROWSE BY GRID */}
            <div className="px-4 space-y-2.5">
              <div className="px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  BROWSE BY
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  onClick={() => openScriptureScreen("bhagavad_gita")}
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform shadow-xs"
                  style={{ background: "linear-gradient(145deg, #fdf0d0, #f5e0a0)" }}
                >
                  <span className="text-2xl block mb-1.5">📚</span>
                  <div className="text-xs font-bold text-stone-950">Scriptures</div>
                  <div className="text-[10.5px] text-stone-700">Gita, Upanishads & more</div>
                </div>

                <div
                  onClick={() => {
                    setSearchQuery("Karma");
                    setActiveTab("search");
                  }}
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform shadow-xs"
                  style={{ background: "linear-gradient(145deg, #fad8ce, #f4b09a)" }}
                >
                  <span className="text-2xl block mb-1.5">🏷️</span>
                  <div className="text-xs font-bold text-stone-950">Topics</div>
                  <div className="text-[10.5px] text-stone-700">Karma, Dharma, Bhakti…</div>
                </div>

                <div
                  onClick={() => openScriptureScreen("yoga_sutras")}
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform shadow-xs"
                  style={{ background: "linear-gradient(145deg, #c6ede0, #96d8c2)" }}
                >
                  <span className="text-2xl block mb-1.5">🗂️</span>
                  <div className="text-xs font-bold text-stone-950">Yoga & Mind</div>
                  <div className="text-[10.5px] text-stone-700">Patanjali's Sutras</div>
                </div>

                <div
                  onClick={() => {
                    setSearchQuery("Advaita");
                    setActiveTab("search");
                  }}
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform shadow-xs"
                  style={{ background: "linear-gradient(145deg, #f5e4c8, #e8c88a)" }}
                >
                  <span className="text-2xl block mb-1.5">🕉️</span>
                  <div className="text-xs font-bold text-stone-950">Traditions</div>
                  <div className="text-[10.5px] text-stone-700">Vedanta, Yoga, Tantra…</div>
                </div>
              </div>
            </div>

            {/* COMPLETE SCRIPTURE CATALOG */}
            <div className="px-4 space-y-3">
              <div className="px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  SACRED SCRIPTURE CORPUS
                </span>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {["All", "Itihasa", "Darshana", "Upanishads", "Vedanta"].map((pill) => (
                  <button
                    key={pill}
                    onClick={() => setExplorePill(pill)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      explorePill === pill
                        ? isLight
                          ? "bg-amber-500 text-stone-950 font-extrabold shadow-xs"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : isLight
                        ? "bg-stone-200/70 text-stone-700 hover:bg-stone-200"
                        : "bg-white/5 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Scriptures List */}
              <div
                className={`rounded-3xl border overflow-hidden ${
                  isLight
                    ? "bg-white border-stone-200 divide-y divide-stone-100 shadow-sm"
                    : "bg-stone-900/60 border-amber-500/20 divide-y divide-white/5"
                }`}
              >
                {Object.values(SCRIPTURES_CORPUS)
                  .filter((sc) => explorePill === "All" || sc.category === explorePill)
                  .map((sc) => (
                    <div
                      key={sc.id}
                      onClick={() => openScriptureScreen(sc.id)}
                      className={`p-4 flex items-center space-x-3.5 cursor-pointer transition-colors group ${
                        isLight ? "hover:bg-amber-50/60" : "hover:bg-white/5"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-sanskrit text-lg flex-shrink-0 ${
                          isLight
                            ? "bg-amber-100 text-amber-950 border-amber-300 font-bold"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                        }`}
                      >
                        {sc.sanskritName.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-bold truncate ${isLight ? "text-stone-900" : "text-stone-100"}`}>
                          {sc.name}
                        </div>
                        <div className={`text-[11px] truncate mt-0.5 ${isLight ? "text-stone-600" : "text-stone-400"}`}>
                          {sc.totalChapters} {sc.id === "yoga_sutras" ? "Padas" : "Chapters"} · {sc.totalVerses} Verses · {sc.category}
                        </div>
                        <div className={`w-full h-1 rounded-full mt-2 overflow-hidden ${isLight ? "bg-stone-100" : "bg-stone-800"}`}>
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                            style={{ width: sc.id === "bhagavad_gita" ? "62%" : "15%" }}
                          />
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-all ${isLight ? "text-stone-400 group-hover:text-amber-600" : "text-stone-500 group-hover:text-amber-400"}`} />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. SEARCH SCREEN */}
        {activeTab === "search" && subScreen === "none" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="px-5 pt-2">
              <h2 className={`font-serif-sacred text-2xl font-bold ${themeTextColor}`}>
                Search Sacred Corpus
              </h2>
            </div>

            {/* Search Input Bar */}
            <div className="px-4 space-y-3">
              <div
                className={`flex items-center space-x-2.5 p-3 rounded-2xl border ${
                  isLight
                    ? "bg-white border-stone-300 shadow-xs"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <Search className="w-4 h-4 text-amber-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a Sanskrit shloka, keyword ('karma', 'atman', 'dharma')..."
                  className={`flex-1 bg-transparent text-xs outline-none ${
                    isLight
                      ? "text-stone-900 placeholder-stone-400"
                      : "text-stone-100 placeholder-stone-500"
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`text-xs font-bold px-1 cursor-pointer ${
                      isLight ? "text-stone-500 hover:text-stone-700" : "text-stone-500 hover:text-stone-300"
                    }`}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Live Search Results if Query Present */}
            {searchQuery.trim() ? (
              <div className="px-4 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span
                    className="text-[10.5px] font-extrabold tracking-widest uppercase"
                    style={{ color: themeGoldLight }}
                  >
                    SEARCH RESULTS ({searchResults.length})
                  </span>
                </div>

                {searchResults.length === 0 ? (
                  <div
                    className={`p-6 rounded-2xl text-center text-xs border ${
                      isLight
                        ? "bg-white border-stone-200 text-stone-600 shadow-xs"
                        : "bg-white/5 border-white/5 text-stone-400"
                    }`}
                  >
                    No verses found matching "{searchQuery}". Try searching for "karma", "equanimity", or "yoga".
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {searchResults.map((verse) => {
                      const displaySource =
                        verse.source && !["json", "production", "manual"].includes(verse.source.toLowerCase())
                          ? verse.source
                          : "Bhagavad Gita";

                      return (
                        <div
                          key={verse.id}
                          onClick={() => openVerseScreen(verse.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                            isLight
                              ? "bg-white border-stone-200 hover:border-amber-400 shadow-sm text-stone-900"
                              : isFestival
                              ? "bg-[#480C14]/90 border-[#FF8A00]/30 hover:border-[#FF8A00]/60 text-[#FFF6E3]"
                              : isAmethyst
                              ? "bg-[#180C2C]/90 border-[#52297A]/40 hover:border-[#8A4AC7]/60 text-[#EDE0F8]"
                              : "bg-stone-900/70 border-white/5 hover:border-amber-500/40 text-stone-100"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold ${
                                isLight ? "text-amber-800" : "text-amber-400"
                              }`}
                            >
                              {displaySource} · {verse.title}
                            </span>
                            <ChevronRight className="w-4 h-4 text-stone-400" />
                          </div>
                          {/* Full Sanskrit Verse - no line clamp */}
                          <div
                            className={`font-sanskrit text-sm leading-relaxed whitespace-pre-line ${
                              isLight ? "text-[#1A0E05] font-semibold" : "text-stone-100"
                            }`}
                          >
                            {verse.sanskrit}
                          </div>
                          {/* Transliteration */}
                          {verse.transliteration && (
                            <p
                              className={`font-serif italic text-xs leading-relaxed ${
                                isLight ? "text-[#6E3B0A]" : "text-amber-200/80"
                              }`}
                            >
                              {verse.transliteration}
                            </p>
                          )}
                          {/* English Meaning - no line clamp */}
                          <p
                            className={`text-xs leading-relaxed ${
                              isLight ? "text-stone-700" : "text-stone-300"
                            }`}
                          >
                            {verse.meaning}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Popular Topics Chips */}
                <div className="px-4 space-y-2">
                  <div className="px-1">
                    <span
                      className="text-[10.5px] font-extrabold tracking-widest uppercase"
                      style={{ color: themeGoldLight }}
                    >
                      POPULAR TOPICS (TAP TO FILTER)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Karma",
                      "Dharma",
                      "Bhakti",
                      "Jnana",
                      "Detachment",
                      "Meditation",
                      "Self-mastery",
                      "Equanimity",
                      "OM",
                      "Advaita",
                    ].map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchQuery(topic)}
                        className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explore by Tradition */}
                <div className="px-4 space-y-2">
                  <div className="px-1">
                    <span
                      className="text-[10.5px] font-extrabold tracking-widest uppercase"
                      style={{ color: themeGoldLight }}
                    >
                      EXPLORE BY TRADITION
                    </span>
                  </div>
                  <div className="rounded-2xl bg-stone-900/60 border border-amber-500/20 divide-y divide-white/5">
                    {[
                      {
                        icon: "🕉️",
                        title: "Advaita Vedanta",
                        sub: "Non-dual philosophy · Shankara & Ashtavakra",
                        action: () => openVerseScreen("bg_4_18"),
                      },
                      {
                        icon: "🏹",
                        title: "Karma Yoga",
                        sub: "Selfless action without attachment · Gita",
                        action: () => openVerseScreen("bg_2_47"),
                      },
                      {
                        icon: "🧘",
                        title: "Raja Yoga",
                        sub: "Eight limbs & mental stilling · Patanjali",
                        action: () => openVerseScreen("ys_1_2"),
                      },
                      {
                        icon: "📜",
                        title: "Upanishadic Non-duality",
                        sub: "Cosmic vision & renunciation · Isha",
                        action: () => openVerseScreen("isha_1"),
                      },
                    ].map((trad, idx) => (
                      <div
                        key={idx}
                        onClick={trad.action}
                        className="p-3.5 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <span className="text-xl">{trad.icon}</span>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-stone-100">
                            {trad.title}
                          </div>
                          <div className="text-[10.5px] text-stone-400">
                            {trad.sub}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 4. JOURNEY SCREEN */}
        {activeTab === "journey" && subScreen === "none" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="px-5 pt-2 flex items-center justify-between">
              <h2 className={`font-serif-sacred text-2xl font-bold ${themeTextColor}`}>
                My Sādhana Sanctuary
              </h2>
              {reflections.length > 0 && (
                <button
                  onClick={handleExportReflections}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center space-x-1 cursor-pointer transition-colors ${
                    isLight
                      ? "bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200"
                      : "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                  }`}
                  title="Export Journal as Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="px-4 grid grid-cols-3 gap-2.5">
              <div
                className="p-3.5 rounded-2xl text-center shadow-xs"
                style={{ background: "linear-gradient(145deg, #fdf0d0, #f5e0a0)" }}
              >
                <div className="font-serif-sacred text-2xl font-bold text-amber-950 leading-none">
                  {streakData.currentStreak}
                </div>
                <div className="text-[10.5px] font-bold text-stone-900 mt-1">
                  Day Streak 🔥
                </div>
              </div>

              <div
                className="p-3.5 rounded-2xl text-center shadow-xs"
                style={{ background: "linear-gradient(145deg, #fad8ce, #f4b09a)" }}
              >
                <div className="font-serif-sacred text-2xl font-bold text-rose-950 leading-none">
                  {savedVerses.length}
                </div>
                <div className="text-[10.5px] font-bold text-stone-900 mt-1">
                  Saved
                </div>
              </div>

              <div
                className="p-3.5 rounded-2xl text-center shadow-xs"
                style={{ background: "linear-gradient(145deg, #c6ede0, #96d8c2)" }}
              >
                <div className="font-serif-sacred text-2xl font-bold text-teal-950 leading-none">
                  {reflections.length}
                </div>
                <div className="text-[10.5px] font-bold text-stone-900 mt-1">
                  Reflections
                </div>
              </div>
            </div>

            {/* SAVED WISDOM LIST */}
            <div className="px-4 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  SAVED SACRED VERSES ({savedVerses.length})
                </span>
              </div>
              <div className="space-y-2">
                {savedVerses.length === 0 ? (
                  <div
                    className={`p-4 rounded-2xl text-center text-xs border ${
                      isLight
                        ? "bg-white border-stone-200 text-stone-600 shadow-xs"
                        : "bg-white/5 border-white/5 text-stone-400"
                    }`}
                  >
                    No saved verses yet. Bookmark verses as you read to keep them in your sanctuary.
                  </div>
                ) : (
                  savedVerses.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openVerseScreen(item.id)}
                      className={`p-3.5 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-colors ${
                        isLight
                          ? "bg-white border-stone-200 hover:border-amber-400 shadow-xs"
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-base text-rose-500">❤️</span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-sanskrit text-sm font-semibold truncate ${isLight ? "text-stone-900" : "text-stone-100"}`}>
                          {item.title}
                        </div>
                        <div
                          className="text-[11px] font-bold mt-0.5"
                          style={{ color: themeGoldLight }}
                        >
                          {item.ref}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isLight ? "text-stone-400" : "text-stone-500"}`} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* MY REFLECTIONS WITH INLINE EDIT */}
            <div className="px-4 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  MY CONTEMPLATION NOTES ({reflections.length})
                </span>
              </div>
              {reflections.length === 0 ? (
                <div
                  className={`p-4 rounded-2xl text-center text-xs border ${
                    isLight
                      ? "bg-white border-stone-200 text-stone-600 shadow-xs"
                      : "bg-white/5 border-white/5 text-stone-400"
                  }`}
                >
                  No reflection notes yet. Read a shloka and record your personal insight!
                </div>
              ) : (
                reflections.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-4 rounded-2xl space-y-2"
                    style={{ background: themeCardBg, color: "#2B1A08" }}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 border-b border-amber-900/15 pb-1.5">
                      <span>
                        {ref.date} · {ref.verseRef}
                      </span>
                      <div className="flex items-center space-x-2">
                        {editingRefId !== ref.id && (
                          <button
                            onClick={() => {
                              setEditingRefId(ref.id);
                              setEditingRefText(ref.text);
                            }}
                            className="p-1 text-stone-700 hover:text-stone-950"
                            title="Edit Note"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReflection(ref.id)}
                          className="p-1 text-rose-700 hover:text-rose-900"
                          title="Delete Note"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {editingRefId === ref.id ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={3}
                          value={editingRefText}
                          onChange={(e) => setEditingRefText(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white/80 text-xs text-stone-950 border border-amber-900/30 outline-none resize-none"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingRefId(null)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-200 text-stone-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEditReflection(ref.id)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white shadow"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs leading-relaxed italic text-stone-900 whitespace-pre-wrap">
                        "{ref.text}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. MORE SCREEN (High-Contrast UI/UX with Clean Hierarchy) */}
        {activeTab === "more" && subScreen === "none" && (
          <div className="animate-fadeIn">
            <MoreView
              theme={theme}
              onSelectTheme={handleSelectTheme}
              onOpenProfile={() => setSubScreen("pref")}
              onOpenPricing={onOpenPricing}
              onOpenDonation={onOpenDonation}
              onOpenAdminConsole={onOpenAdmin}
              onNavigateTab={(tab) => {
                if (tab === "today") setActiveTab("home");
                else if (tab === "explore") setActiveTab("explore");
                else if (tab === "search") setActiveTab("search");
                else if (tab === "my-journey") setActiveTab("journey");
                else if (tab === "about") setSubScreen("about");
                else if (tab === "glossary") setSubScreen("glossary");
                else if (tab === "paths") setSubScreen("paths");
                else if (tab === "preferences") setSubScreen("pref");
              }}
              savedCount={savedVerses.length}
              journalCount={reflections.length}
            />
          </div>
        )}

        {/* ════════════ SUB-SCREEN 1: SCRIPTURE DETAIL (DYNAMIC CORPUS) ════════════ */}
        {subScreen === "scripture" && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn backdrop-blur-xl bg-stone-950/80 flex justify-center p-0 sm:p-4 lg:p-6 pb-20 sm:pb-8"
          >
            <div
              className={`w-full max-w-3xl min-h-dvh sm:min-h-0 sm:my-auto sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border ${subScreenBorder}`}
              style={{ backgroundColor: subScreenBg }}
            >
            {/* Sub Bar */}
            <div
              className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b backdrop-blur-md ${subScreenHeaderBorder}`}
              style={{ backgroundColor: subScreenBarBg }}
            >
              <button
                onClick={() => setSubScreen("none")}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? "bg-stone-200 text-stone-700 hover:bg-stone-300" : "bg-white/5 text-stone-200 hover:bg-white/10"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className={`font-bold text-sm truncate max-w-[200px] ${themeTextColor}`}>
                {activeScriptureData.name}
              </span>
              <button
                onClick={handleToggleTanpura}
                className={`p-1 cursor-pointer ${isLight ? "text-stone-700" : "text-stone-300"}`}
                title="Toggle Tanpura Drone"
              >
                <Radio className={`w-4 h-4 ${isDroneActive ? "text-amber-500" : ""}`} />
              </button>
            </div>

            {/* Scripture Hero */}
            <div className={`p-6 border-b space-y-4 ${isLight ? "border-stone-200" : "border-amber-500/10"}`}>
              <div className="space-y-1">
                <div className={`font-sanskrit text-lg ${isLight ? "text-amber-800 font-bold" : "text-amber-300"}`}>
                  {activeScriptureData.sanskritName}
                </div>
                <h1 className={`font-serif-sacred text-3xl font-bold ${themeTextColor}`}>
                  {activeScriptureData.name}
                </h1>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: themeMist }}>
                {activeScriptureData.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {activeScriptureData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      isLight
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex space-x-6 pt-2">
                <div>
                  <div className={`font-serif-sacred text-xl font-bold ${isLight ? "text-amber-800" : "text-amber-400"}`}>
                    {activeScriptureData.totalChapters}
                  </div>
                  <div className={`text-[10.5px] font-bold ${isLight ? "text-stone-600" : "text-stone-400"}`}>
                    {activeScriptureData.sectionType?.split(" ")[0] || (activeScriptureData.id === "yoga_sutras" ? "Pādas" : activeScriptureData.id.includes("upanishad") ? "Khaṇḍas" : "Chapters")}
                  </div>
                </div>
                <div>
                  <div className={`font-serif-sacred text-xl font-bold ${isLight ? "text-amber-800" : "text-amber-400"}`}>
                    {activeScriptureData.totalVerses}
                  </div>
                  <div className={`text-[10.5px] font-bold ${isLight ? "text-stone-600" : "text-stone-400"}`}>
                    {activeScriptureData.id === "yoga_sutras" ? "Sūtras" : activeScriptureData.id.includes("upanishad") ? "Mantras" : "Verses / Shlokas"}
                  </div>
                </div>
                <div>
                  <div className={`font-serif-sacred text-xl font-bold ${isLight ? "text-amber-800" : "text-amber-400"}`}>
                    {activeScriptureData.category}
                  </div>
                  <div className={`text-[10.5px] font-bold ${isLight ? "text-stone-600" : "text-stone-400"}`}>
                    Tradition
                  </div>
                </div>
              </div>

              <button
                onClick={() => openVerseScreen(activeScriptureData.defaultVerseId)}
                className="w-full py-3 rounded-full font-bold text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow hover:scale-[1.02] transition-transform cursor-pointer"
              >
                {activeScriptureData.id === "yoga_sutras" ? "Read First Yoga Sūtra →" : activeScriptureData.id.includes("upanishad") ? "Read Opening Vedic Mantra →" : "Read Featured Shloka →"}
              </button>
            </div>

            {/* Chapters / Pādas / Khaṇḍas Complete List */}
            <div className="p-4 space-y-2">
              <div className="px-2">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  {activeScriptureData.id === "yoga_sutras"
                    ? `4 RADICAL PĀDAS OF RĀJA YOGA`
                    : activeScriptureData.id === "isha_upanishad"
                    ? `3 VEDIC KHAṆḌAS OF ISHA UPANISHAD`
                    : activeScriptureData.id === "mandukya_upanishad"
                    ? `4 CONSCIOUSNESS PRAKARAṆAS OF MANDUKYA`
                    : activeScriptureData.id === "vivekachudamani"
                    ? `5 PHILOSOPHICAL PRAKARAṆAS OF VIVEKACHUDAMANI`
                    : `ALL ${activeScriptureData.chapters.length} ${activeScriptureData.sectionType?.toUpperCase() || "CHAPTERS"}`}
                </span>
              </div>

              <div className={`divide-y ${isLight ? "divide-stone-200" : "divide-white/5"}`}>
                {activeScriptureData.chapters.map((ch) => (
                  <div
                    key={ch.num}
                    onClick={() => openVerseScreen(ch.featuredVerseId || activeScriptureData.defaultVerseId)}
                    className={`py-3.5 px-2 flex items-center space-x-3.5 cursor-pointer rounded-xl transition-colors group ${
                      isLight ? "hover:bg-amber-100/50" : "hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                      isLight
                        ? "border-amber-400 bg-amber-100 text-amber-950 group-hover:bg-amber-500 group-hover:text-stone-950"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-300 group-hover:bg-amber-500 group-hover:text-stone-950"
                    }`}>
                      {ch.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold transition-colors truncate ${
                        isLight ? "text-stone-900 group-hover:text-amber-800" : "text-stone-100 group-hover:text-amber-300"
                      }`}>
                        {ch.name} <span className={`font-sanskrit font-normal ${isLight ? "text-stone-600" : "text-stone-400"}`}>({ch.sanskritName})</span>
                      </div>
                      <div className={`text-[11px] truncate mt-0.5 ${isLight ? "text-stone-600" : "text-stone-400"}`}>
                        {ch.versesCount} {activeScriptureData.id === "yoga_sutras" ? "sūtras" : activeScriptureData.id.includes("upanishad") ? "mantras" : "verses"} · {ch.summary}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                      isLight ? "text-stone-400 group-hover:text-amber-700" : "text-stone-500 group-hover:text-amber-400"
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ════════════ SUB-SCREEN 2: VERSE DETAIL (DYNAMIC MULTI-SCRIPTURE) ════════════ */}
        {subScreen === "verse" && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn backdrop-blur-xl bg-stone-950/80 flex justify-center p-0 sm:p-4 lg:p-6 pb-20 sm:pb-8"
          >
            <div
              className={`w-full max-w-3xl min-h-dvh sm:min-h-0 sm:my-auto sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border ${subScreenBorder}`}
              style={{ backgroundColor: subScreenBg }}
            >
            {/* Sub Bar */}
            <div
              className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b backdrop-blur-md ${subScreenHeaderBorder}`}
              style={{ backgroundColor: subScreenBarBg }}
            >
              <button
                onClick={() => setSubScreen("none")}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? "bg-stone-200 text-stone-700 hover:bg-stone-300" : "bg-white/5 text-stone-200 hover:bg-white/10"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className={`font-bold text-sm truncate max-w-[200px] ${themeTextColor}`}>
                {selectedVerseData.title}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleTanpura}
                  className={`p-1.5 rounded-full cursor-pointer ${isDroneActive ? "text-amber-500" : isLight ? "text-stone-600" : "text-stone-400"}`}
                  title="Toggle Tanpura Drone"
                >
                  <Radio className="w-4 h-4" />
                </button>
                <button
                  onClick={handleOpenShare}
                  className={`p-1 cursor-pointer ${isLight ? "text-stone-700 hover:text-stone-900" : "text-stone-300 hover:text-stone-100"}`}
                  title="Share this verse"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Verse Hero Card */}
            <div className="p-6 text-center space-y-3">
              <div
                className="text-[10.5px] font-extrabold tracking-widest uppercase"
                style={{ color: themeGoldLight }}
              >
                {selectedVerseData.source.toUpperCase()} · {selectedVerseData.chapterName.toUpperCase()}
              </div>

              {/* Sacred Lotus Rule Divider */}
              <div className="flex items-center space-x-2.5 py-1">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: themeGold }}
                />
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
              </div>

              {/* Sanskrit Shloka */}
              {(prefScript === "both" || prefScript === "devanagari") && (
                <div className={`font-sanskrit text-2xl leading-[2.2] py-2 select-text ${isLight ? "text-stone-950 font-bold" : "text-stone-100"}`}>
                  {selectedVerseData.sanskrit.split("\n").map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              )}

              {/* Sacred Lotus Rule Divider */}
              <div className="flex items-center space-x-2.5 py-1">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: themeGold }}
                />
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
              </div>
            </div>

            {/* TRANSLITERATION (IAST) */}
            {(prefScript === "both" || prefScript === "transliteration") && (
              <div className={`px-6 py-4 border-t space-y-2 ${isLight ? "border-stone-200" : "border-white/5"}`}>
                <div
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  IAST ROMAN TRANSLITERATION
                </div>
                <div
                  className={`text-xs italic leading-relaxed font-mono whitespace-pre-line ${isLight ? "text-stone-800" : ""}`}
                  style={{ color: isLight ? "#5C4033" : themeMist }}
                >
                  {selectedVerseData.transliteration}
                </div>
              </div>
            )}

            {/* WORD-BY-WORD VOCABULARY DICTIONARY */}
            {selectedVerseData.wordDict && (
              <div className={`px-6 py-4 border-t space-y-2.5 ${isLight ? "border-stone-200" : "border-white/5"}`}>
                <div
                  className="text-[10.5px] font-extrabold tracking-widest uppercase flex items-center justify-between"
                  style={{ color: themeGoldLight }}
                >
                  <span>WORD-BY-WORD BREAKDOWN (पदच्छेद)</span>
                  <span className={`text-[9px] lowercase ${isLight ? "text-stone-500" : "text-stone-400"}`}>tap word for sound</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedVerseData.wordDict).map(([sanskritWord, details]) => (
                    <div
                      key={sanskritWord}
                      onClick={() => handleWordTap(sanskritWord)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-colors space-y-0.5 ${
                        isLight
                          ? "bg-white border-stone-200 hover:border-amber-400 shadow-2xs"
                          : "bg-white/5 hover:bg-white/10 border-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-sanskrit font-bold ${isLight ? "text-amber-900" : "text-amber-300"}`}>{sanskritWord}</span>
                        <span className={`text-[10px] font-mono italic ${isLight ? "text-stone-500" : "text-stone-400"}`}>{details.trans}</span>
                      </div>
                      <div className={`text-[11px] ${isLight ? "text-stone-800" : "text-stone-200"}`}>
                        {prefLang === "hi" ? details.hi : details.en}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MEANING (ENGLISH / HINDI / DUAL) */}
            <div className={`px-6 py-4 border-t space-y-2 ${isLight ? "border-stone-200" : "border-white/5"}`}>
              <div
                className="text-[10.5px] font-extrabold tracking-widest uppercase"
                style={{ color: themeGoldLight }}
              >
                MEANING (अर्थ)
              </div>
              {(prefLang === "dual" || prefLang === "en") && (
                <div className={`text-sm font-medium leading-relaxed ${isLight ? "text-stone-900" : "text-stone-100"}`}>
                  {selectedVerseData.meaning}
                </div>
              )}
              {(prefLang === "dual" || prefLang === "hi") && selectedVerseData.hindiMeaning && (
                <div className={`text-xs font-serif-sacred leading-relaxed pt-1 ${isLight ? "text-amber-950 font-medium" : "text-amber-200/90"}`}>
                  {selectedVerseData.hindiMeaning}
                </div>
              )}
            </div>

            {/* COMMENTARY */}
            <div className={`px-6 py-4 border-t space-y-2 ${isLight ? "border-stone-200" : "border-white/5"}`}>
              <div
                className="text-[10.5px] font-extrabold tracking-widest uppercase"
                style={{ color: themeGoldLight }}
              >
                AUTHENTIC LINEAGE COMMENTARY
              </div>
              <div
                className={`text-xs leading-relaxed ${isLight ? "text-stone-800" : "text-stone-300"}`}
                style={{ color: isLight ? "#453223" : themeMist }}
              >
                {commentaryExpanded
                  ? `${selectedVerseData.commentary} Shankara emphasizes that Karma Yoga is the purification of mental tendencies (citta-shuddhi). When actions are undertaken free from possessiveness, one naturally attains clarity, leading smoothly into Jnana Yoga (the direct realization of non-dual Truth).`
                  : selectedVerseData.commentary}
              </div>
              <button
                onClick={() => setCommentaryExpanded(!commentaryExpanded)}
                className={`text-xs font-bold pt-1 flex items-center space-x-1 cursor-pointer ${
                  isLight ? "text-amber-800 hover:text-amber-900" : "text-amber-400 hover:text-amber-300"
                }`}
              >
                <span>{commentaryExpanded ? "Show concise summary ↑" : "Read full commentary ↓"}</span>
              </button>
            </div>

            {/* ACTION BAR */}
            <div className={`px-6 py-4 border-t grid grid-cols-4 gap-2 ${isLight ? "border-stone-200" : "border-white/5"}`}>
              <button
                onClick={handleStartListen}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  isSpeakingChant
                    ? "bg-amber-500 text-stone-950 font-bold"
                    : isLight
                    ? "bg-white border border-stone-200 hover:bg-amber-50/50 text-stone-800 shadow-2xs"
                    : "bg-white/5 hover:bg-white/10 text-stone-300"
                }`}
              >
                <Volume2 className={`w-5 h-5 ${isSpeakingChant ? "text-stone-950 animate-bounce" : "text-amber-500"}`} />
                <span className="text-[11px] font-bold">
                  {isSpeakingChant ? "Chanting..." : "Listen"}
                </span>
              </button>

              <button
                onClick={handleToggleSave}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
                  isLight
                    ? "bg-white border border-stone-200 hover:bg-amber-50/50 text-stone-800 shadow-2xs"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isCurrentVerseSaved ? "fill-rose-500 text-rose-500" : isLight ? "text-stone-600" : "text-stone-300"
                  }`}
                />
                <span className={`text-[11px] font-bold ${isLight ? "text-stone-800" : "text-stone-300"}`}>
                  {isCurrentVerseSaved ? "Saved" : "Save"}
                </span>
              </button>

              <button
                onClick={handleOpenShare}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
                  isLight
                    ? "bg-white border border-stone-200 hover:bg-amber-50/50 text-stone-800 shadow-2xs"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <Share2 className="w-5 h-5 text-amber-500" />
                <span className={`text-[11px] font-bold ${isLight ? "text-stone-800" : "text-stone-300"}`}>Share</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playTempleBell(330);
                  setThemeToast(`Context: Spoken in ${selectedVerseData.source}`);
                  setTimeout(() => setThemeToast(null), 2500);
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
                  isLight
                    ? "bg-white border border-stone-200 hover:bg-amber-50/50 text-stone-800 shadow-2xs"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span className={`text-[11px] font-bold ${isLight ? "text-stone-800" : "text-stone-300"}`}>Context</span>
              </button>
            </div>

            {/* REFLECT JOURNAL BOX */}
            <div className={`px-6 py-4 border-t space-y-2.5 ${isLight ? "border-stone-200" : "border-white/5"}`}>
              <div
                className="text-[10.5px] font-extrabold tracking-widest uppercase"
                style={{ color: themeGoldLight }}
              >
                RECORD CONTEMPLATION (स्वाध्याय)
              </div>
              <textarea
                rows={3}
                value={currentReflectionText}
                onChange={(e) => setCurrentReflectionText(e.target.value)}
                placeholder="What does this mean for you today? Take a moment to write your thoughts…"
                className={`w-full p-3.5 rounded-2xl border text-xs outline-none resize-none transition-colors ${
                  isLight
                    ? "bg-white border-stone-300 text-stone-950 placeholder-stone-400 focus:border-amber-500 shadow-xs"
                    : "bg-white/5 border-amber-500/20 text-stone-100 placeholder-stone-500 focus:border-amber-500/50"
                }`}
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={handleSaveReflection}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow hover:scale-105 transition-transform cursor-pointer"
                >
                  Save to Sādhana Journal
                </button>
                {reflectionSavedMessage && (
                  <span className="text-xs text-emerald-600 font-semibold animate-fadeIn">
                    ✓ Saved to Your Journey!
                  </span>
                )}
              </div>
            </div>

            {/* CONSECUTIVE SCRIPTURAL NAVIGATION */}
            {(() => {
              const { prevVerse, nextVerse } = getAdjacentVerses(selectedVerseData.id);
              return (
                <div className={`px-6 py-4 border-t space-y-2 ${isLight ? "border-stone-200" : "border-white/5"}`}>
                  <div
                    className="text-[10.5px] font-extrabold tracking-widest uppercase"
                    style={{ color: themeGoldLight }}
                  >
                    SCRIPTURAL SEQUENTIAL NAVIGATION
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {prevVerse ? (
                      <button
                        onClick={() => openVerseScreen(prevVerse.id)}
                        className={`p-3 rounded-2xl border text-left transition-all group cursor-pointer ${
                          isLight
                            ? "bg-white border-stone-200 hover:border-amber-400 shadow-2xs"
                            : "bg-white/5 hover:bg-white/10 border-white/5"
                        }`}
                      >
                        <div className={`text-[10px] font-mono ${isLight ? "text-stone-500" : "text-stone-400"}`}>← PREVIOUS</div>
                        <div className={`text-xs font-bold truncate mt-0.5 ${
                          isLight ? "text-stone-900 group-hover:text-amber-800" : "text-stone-200 group-hover:text-amber-300"
                        }`}>
                          {prevVerse.title}
                        </div>
                      </button>
                    ) : (
                      <div className={`p-3 rounded-2xl border text-left opacity-40 ${
                        isLight ? "bg-stone-100 border-stone-200" : "bg-white/[0.02] border-white/[0.02]"
                      }`}>
                        <div className="text-[10px] text-stone-500 font-mono">START OF TEXT</div>
                        <div className="text-xs font-bold text-stone-500 truncate mt-0.5">First Verse</div>
                      </div>
                    )}

                    {nextVerse ? (
                      <button
                        onClick={() => openVerseScreen(nextVerse.id)}
                        className={`p-3 rounded-2xl border text-right transition-all group cursor-pointer ${
                          isLight
                            ? "bg-white border-stone-200 hover:border-amber-400 shadow-2xs"
                            : "bg-white/5 hover:bg-white/10 border-white/5"
                        }`}
                      >
                        <div className={`text-[10px] font-mono ${isLight ? "text-stone-500" : "text-stone-400"}`}>NEXT →</div>
                        <div className={`text-xs font-bold truncate mt-0.5 ${
                          isLight ? "text-stone-900 group-hover:text-amber-800" : "text-stone-200 group-hover:text-amber-300"
                        }`}>
                          {nextVerse.title}
                        </div>
                      </button>
                    ) : (
                      <div className={`p-3 rounded-2xl border text-right opacity-40 ${
                        isLight ? "bg-stone-100 border-stone-200" : "bg-white/[0.02] border-white/[0.02]"
                      }`}>
                        <div className="text-[10px] text-stone-500 font-mono">END OF CORPUS</div>
                        <div className="text-xs font-bold text-stone-500 truncate mt-0.5">Last Verse</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* RELATED WISDOM (CONNECTED LINKS) */}
            <div className={`px-6 py-4 border-t space-y-2.5 ${isLight ? "border-stone-200" : "border-white/5"}`}>
              <div
                className="text-[10.5px] font-extrabold tracking-widest uppercase"
                style={{ color: themeGoldLight }}
              >
                CONNECTED SACRED VERSES
              </div>
              <div className="space-y-2">
                {[
                  { ref: "Gita 2.50", snippet: "योगः कर्मसु कौशलम्… (Skill in action)", id: "bg_2_50" },
                  { ref: "Patanjali 1.2", snippet: "योगश्चित्तवृत्तिनिरोधः… (Stilling mind)", id: "ys_1_2" },
                  { ref: "Isha Mantra 1", snippet: "ईशा वास्यमिदँ सर्वं… (Divine unity)", id: "isha_1" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => openVerseScreen(item.id)}
                    className={`p-3 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-colors ${
                      isLight
                        ? "bg-white border-stone-200 hover:border-amber-400 shadow-2xs"
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: themeGoldLight }}
                    >
                      {item.ref}
                    </span>
                    <span className={`font-sanskrit text-xs flex-1 truncate ${isLight ? "text-stone-800" : "text-stone-100"}`}>
                      {item.snippet}
                    </span>
                    <ChevronRight className={`w-4 h-4 ${isLight ? "text-stone-400" : "text-stone-500"}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ════════════ SUB-SCREEN 3: PREFERENCES & THEMES (PERSISTENT) ════════════ */}
        {subScreen === "pref" && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn backdrop-blur-xl bg-stone-950/80 flex justify-center p-0 sm:p-4 lg:p-6 pb-20 sm:pb-8"
          >
            <div
              className={`w-full max-w-3xl min-h-dvh sm:min-h-0 sm:my-auto sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border ${subScreenBorder}`}
              style={{ backgroundColor: subScreenBg }}
            >
            {/* Top Bar */}
            <div
              className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b backdrop-blur-md ${subScreenHeaderBorder}`}
              style={{ backgroundColor: subScreenBarBg }}
            >
              <button
                onClick={() => setSubScreen("none")}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? "bg-stone-200 text-stone-700 hover:bg-stone-300" : "bg-white/5 text-stone-200 hover:bg-white/10"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <div className={`font-bold text-sm ${themeTextColor}`}>Preferences & Themes</div>
                <div className={`text-[10px] font-serif-sacred ${isLight ? "text-stone-500" : "text-stone-400"}`}>रुचि एवं स्वरूप</div>
              </div>
              <div className="w-8" />
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-6">
              {/* Header Title */}
              <div>
                <div
                  className="text-[11px] font-extrabold tracking-widest uppercase mb-1 flex items-center space-x-1.5"
                  style={{ color: themeGoldLight }}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>SACRED ATMOSPHERE & COLOR PALETTE</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: themeMist }}>
                  Choose your sacred reading environment. Your preference is automatically saved to local storage and persists across sessions.
                </p>
              </div>

              {/* ════ Persistent Theme Toggle Component ════ */}
              <div
                className="p-3.5 rounded-2xl border transition-all shadow-inner"
                style={{
                  backgroundColor: isLight ? "#FFFFFF" : isFestival ? "rgba(75,14,23,0.75)" : isSandstone ? "rgba(40,22,8,0.75)" : "rgba(36,21,64,0.75)",
                  borderColor: isLight ? "#E7E5E4" : isFestival ? "rgba(255,138,0,0.3)" : isSandstone ? "rgba(232,146,26,0.3)" : "rgba(196,168,230,0.3)",
                }}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold ${isLight ? "text-stone-900" : "text-stone-200"}`}>Atmosphere Theme</span>
                    <span className={`text-[10px] font-serif-sacred ${isLight ? "text-stone-500" : "text-stone-400"}`}>स्वरुप</span>
                  </div>
                  <span
                    className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 transition-all"
                    style={{
                      backgroundColor: isSandstone ? "rgba(232,146,26,0.2)" : isAmethyst ? "rgba(196,168,230,0.2)" : isLight ? "rgba(217,119,6,0.15)" : "rgba(255,138,0,0.2)",
                      borderColor: isSandstone ? "rgba(232,146,26,0.5)" : isAmethyst ? "rgba(196,168,230,0.5)" : isLight ? "rgba(217,119,6,0.4)" : "rgba(255,138,0,0.5)",
                      color: isSandstone ? "#F4B24B" : isAmethyst ? "#D4BEF2" : isLight ? "#92400E" : "#FFD54A",
                    }}
                  >
                    <span>
                      {isSandstone
                        ? "🏛️ Sandstone Active"
                        : isAmethyst
                        ? "🔮 Amethyst Active"
                        : isLight
                        ? "☀️ Light Active"
                        : "🪔 Festival Active"}
                    </span>
                  </span>
                </div>

                {/* Persistent Segmented Switch Toggle (4 Themes) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 relative">
                  <button
                    type="button"
                    onClick={() => handleSelectTheme("sandstone")}
                    className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      isSandstone
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md scale-[1.01]"
                        : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <span>🏛️</span>
                    <span>Sandstone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme("amethyst")}
                    className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      isAmethyst
                        ? "bg-gradient-to-r from-purple-400 to-indigo-500 text-stone-950 shadow-md scale-[1.01]"
                        : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <span>🔮</span>
                    <span>Amethyst</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme("light")}
                    className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      isLight
                        ? "bg-gradient-to-r from-amber-200 to-amber-400 text-stone-950 shadow-md scale-[1.01]"
                        : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <span>☀️</span>
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme("festival")}
                    className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      isFestival
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow-md scale-[1.01]"
                        : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <span>🪔</span>
                    <span>Festival</span>
                  </button>
                </div>
              </div>

              {/* Theme Palette Cards with Detailed Color Previews */}
              <div className="space-y-3.5">
                {/* 1. Sandstone Temple Theme Card */}
                <div
                  onClick={() => handleSelectTheme("sandstone")}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border relative overflow-hidden ${
                    isSandstone
                      ? "bg-[#281608]/90 border-amber-500/80 shadow-[0_0_20px_rgba(232,146,26,0.25)]"
                      : "bg-stone-900/40 border-stone-800/80 hover:bg-stone-800/40 opacity-75 hover:opacity-100"
                  }`}
                >
                  {isSandstone && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-stone-950 font-bold text-[9.5px] uppercase tracking-wider px-3 py-0.5 rounded-bl-xl shadow flex items-center space-x-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Active Palette</span>
                    </div>
                  )}

                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#78300c] via-[#e8921a] to-[#281608] flex items-center justify-center text-xl flex-shrink-0 shadow border border-amber-400/30">
                      🏛️
                    </div>
                    <div className="flex-1 min-w-0 pr-16">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-stone-100">Sandstone Temple</span>
                        <span className="text-[11px] font-sanskrit text-amber-300">बलुआ पत्थर</span>
                      </div>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                        Warm temple ochre, rich amber accents (#E8921A), gold leaf highlights & deep espresso sanctum ground.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Amethyst Twilight Theme Card */}
                <div
                  onClick={() => handleSelectTheme("amethyst")}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border relative overflow-hidden ${
                    isAmethyst
                      ? "bg-[#241540]/90 border-purple-400/80 shadow-[0_0_20px_rgba(196,168,230,0.25)]"
                      : "bg-stone-900/40 border-stone-800/80 hover:bg-stone-800/40 opacity-75 hover:opacity-100"
                  }`}
                >
                  {isAmethyst && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-400 to-indigo-500 text-stone-950 font-bold text-[9.5px] uppercase tracking-wider px-3 py-0.5 rounded-bl-xl shadow flex items-center space-x-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Active Palette</span>
                    </div>
                  )}

                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4a2264] via-[#e8a93e] to-[#0f0a1a] flex items-center justify-center text-xl flex-shrink-0 shadow border border-purple-300/30">
                      🔮
                    </div>
                    <div className="flex-1 min-w-0 pr-16">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-stone-100">Amethyst Twilight</span>
                        <span className="text-[11px] font-sanskrit text-purple-300">गोधूलि जामुनी</span>
                      </div>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                        Meditative deep violet dusk (#0F0A1A), celestial purple aura (#4A2264), radiant amber & moonlit cream.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Light Parchment Theme Card */}
                <div
                  onClick={() => handleSelectTheme("light")}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border relative overflow-hidden ${
                    isLight
                      ? "bg-[#FFFBF5] border-amber-500 shadow-[0_0_20px_rgba(216,137,22,0.25)] text-stone-950"
                      : "bg-stone-900/40 border-stone-800/80 hover:bg-stone-800/40 opacity-75 hover:opacity-100 text-stone-200"
                  }`}
                >
                  {isLight && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-stone-950 font-bold text-[9.5px] uppercase tracking-wider px-3 py-0.5 rounded-bl-xl shadow flex items-center space-x-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Active Palette</span>
                    </div>
                  )}

                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFF8ED] via-[#F4E2C7] to-[#E5CDAA] flex items-center justify-center text-xl flex-shrink-0 shadow border border-amber-400/40">
                      ☀️
                    </div>
                    <div className="flex-1 min-w-0 pr-16">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${isLight ? "text-stone-950" : "text-stone-100"}`}>
                          Parchment Dawn (Light Mode)
                        </span>
                        <span className="text-[11px] font-sanskrit text-amber-600">उषाकाल</span>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${isLight ? "text-stone-700" : "text-stone-300"}`}>
                        Daylight readability on soft manuscript parchment (#FFFBF5), deep sandalwood text (#3A2818) & gold accents.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Festival Maroon & Gold Theme Card */}
                <div
                  onClick={() => handleSelectTheme("festival")}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border relative overflow-hidden ${
                    isFestival
                      ? "bg-[#5E111C]/90 border-amber-400 shadow-[0_0_20px_rgba(255,138,0,0.3)] text-stone-100"
                      : "bg-stone-900/40 border-stone-800/80 hover:bg-stone-800/40 opacity-75 hover:opacity-100 text-stone-200"
                  }`}
                >
                  {isFestival && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-orange-500 text-stone-950 font-bold text-[9.5px] uppercase tracking-wider px-3 py-0.5 rounded-bl-xl shadow flex items-center space-x-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Active Palette</span>
                    </div>
                  )}

                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7A1825] via-[#FF8A00] to-[#4B0E17] flex items-center justify-center text-xl flex-shrink-0 shadow border border-amber-300/50">
                      🪔
                    </div>
                    <div className="flex-1 min-w-0 pr-16">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-amber-100">
                          Festival Gold & Maroon
                        </span>
                        <span className="text-[11px] font-sanskrit text-amber-300">उत्सव कुंकुम</span>
                      </div>
                      <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                        Royal temple vermilion, kumkum maroon (#4B0E17), blazing deep saffron glow & ceremonial gold ornamentation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SCRIPT & READING DISPLAY */}
              <div className="pt-2 space-y-3">
                <div
                  className="text-[10.5px] font-extrabold tracking-widest uppercase flex items-center space-x-1.5"
                  style={{ color: themeGoldLight }}
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>SCRIPT & TRANSLATION DISPLAY</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "both", label: "Devanagari + IAST", sub: "Dual Script" },
                    { id: "devanagari", label: "देवनागरी Only", sub: "Sanskrit only" },
                    { id: "transliteration", label: "IAST Roman", sub: "English phonetics" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setPrefScript(item.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        prefScript === item.id
                          ? isLight
                            ? "bg-amber-100 border-amber-500 text-stone-900 font-bold shadow-2xs"
                            : "bg-amber-500/20 border-amber-400 text-stone-100 font-bold"
                          : isLight
                          ? "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                          : "bg-white/5 border-white/5 text-stone-400 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-xs leading-tight">{item.label}</div>
                      <div className={`text-[9.5px] mt-0.5 ${isLight ? "text-stone-500" : "text-stone-400"}`}>{item.sub}</div>
                    </button>
                  ))}
                </div>

                {/* Translation Language */}
                <div className="space-y-1.5 pt-1">
                  <span className={`text-xs font-semibold ${isLight ? "text-stone-800" : "text-stone-300"}`}>Default Meaning Language</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "dual", label: "English + Hindi" },
                      { id: "en", label: "English Only" },
                      { id: "hi", label: "हिंदी केवल" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setPrefLang(item.id as any)}
                        className={`py-2 px-1 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          prefLang === item.id
                            ? isLight
                              ? "bg-amber-100 border-amber-500 text-stone-900 font-bold shadow-2xs"
                              : "bg-amber-500/20 border-amber-400 text-stone-100 font-bold"
                            : isLight
                            ? "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                            : "bg-white/5 border-white/5 text-stone-400 hover:bg-white/10"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CHANT AUDIO & REMINDERS */}
              <div className="pt-2 space-y-3">
                <div
                  className="text-[10.5px] font-extrabold tracking-widest uppercase flex items-center space-x-1.5"
                  style={{ color: themeGoldLight }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>SĀDHANA ALARM & RECITATION PACE</span>
                </div>

                {/* Recitation Speed */}
                <div className={`flex items-center justify-between p-3 rounded-2xl border ${
                  isLight ? "bg-white border-stone-200 shadow-2xs" : "bg-white/5 border-white/5"
                }`}>
                  <div className="flex items-center space-x-2.5">
                    <Music className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className={`text-xs font-bold ${isLight ? "text-stone-900" : "text-stone-200"}`}>Chant Recitation Tempo</div>
                      <div className={`text-[10.5px] ${isLight ? "text-stone-500" : "text-stone-400"}`}>Pace of TTS recitation</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 justify-end max-w-[200px]">
                    {[0.75, 0.85, 1.0, 1.15, 1.25].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPrefChantSpeed(speed);
                          recitationEngine.setPlaybackRate(speed);
                          window.dispatchEvent(new CustomEvent("sutrasparsh:pref_speed", { detail: speed }));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                          prefChantSpeed === speed
                            ? "bg-amber-500 text-stone-950 shadow-sm"
                            : isLight
                            ? "bg-stone-100 text-stone-700 hover:bg-stone-200"
                            : "bg-white/10 text-stone-300 hover:bg-white/15"
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Brahma Muhurta Reminder with Permission Request */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border gap-2.5 ${
                  isLight ? "bg-white border-stone-200 shadow-2xs" : "bg-white/5 border-white/5"
                }`}>
                  <div className="flex items-center space-x-2.5">
                    <Bell className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <div>
                      <div className={`text-xs font-bold ${isLight ? "text-stone-900" : "text-stone-200"}`}>Brahma Muhūrta Reminder</div>
                      <div className={`text-[10.5px] ${isLight ? "text-stone-500" : "text-stone-400"}`}>Sacred dawn notification (IST)</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 self-end sm:self-auto">
                    {[
                      { time: "04:30", label: "4:30 AM" },
                      { time: "05:30", label: "5:30 AM" },
                      { time: "06:00", label: "6:00 AM" },
                      { time: "06:30", label: "6:30 AM" },
                      { time: "20:00", label: "8:00 PM" },
                    ].map((item) => (
                      <button
                        key={item.time}
                        onClick={() => {
                          setPrefReminder(item.time);
                          window.dispatchEvent(new CustomEvent("sutrasparsh:pref_reminder", { detail: item.time }));
                          handleRequestNotifications();
                        }}
                        className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-colors cursor-pointer ${
                          prefReminder === item.time
                            ? "bg-amber-500 text-stone-950 shadow-sm"
                            : isLight
                            ? "bg-stone-100 text-stone-700 hover:bg-stone-200"
                            : "bg-white/10 text-stone-300 hover:bg-white/15"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SĀDHANA DATA BACKUP & CLOUD RESTORE */}
              <div className="pt-2 space-y-3">
                <div
                  className="text-[10.5px] font-extrabold tracking-widest uppercase flex items-center space-x-1.5"
                  style={{ color: themeGoldLight }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DATA PORTABILITY & BACKUP (JSON)</span>
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? "text-stone-600" : "text-stone-400"}`}>
                  Export all your saved verses, journal entries, streaks, and reading progress to a portable JSON file, or restore from a previous backup.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleExportBackupJson}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
                      isLight
                        ? "bg-white hover:bg-amber-50/50 border-amber-600/30 text-amber-900 shadow-2xs"
                        : "bg-white/5 hover:bg-white/10 border-amber-500/30 text-amber-300"
                    }`}
                  >
                    <Download className="w-4 h-4 flex-shrink-0" />
                    <span>Export Backup</span>
                  </button>

                  <label className={`p-3 rounded-2xl border text-xs font-bold transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
                    isLight
                      ? "bg-white hover:bg-stone-50 border-stone-200 text-stone-800 shadow-2xs"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-stone-200"
                  }`}>
                    <Upload className={`w-4 h-4 flex-shrink-0 ${isLight ? "text-amber-600" : "text-amber-400"}`} />
                    <span>Import Backup</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportBackupJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset to Defaults */}
              <div className={`pt-4 border-t ${isLight ? "border-stone-200" : "border-white/5"}`}>
                <button
                  onClick={handleResetPreferences}
                  className={`w-full py-3 rounded-2xl border text-xs font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
                    isLight
                      ? "bg-white hover:bg-stone-50 border-stone-200 text-stone-700 shadow-2xs"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-stone-300"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Default Preferences & Sandstone Atmosphere</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ════════════ SUB-SCREEN 4: ABOUT SUTRASPARSH ════════════ */}
        {subScreen === "about" && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn backdrop-blur-xl bg-stone-950/80 flex justify-center p-0 sm:p-4 lg:p-6 pb-20 sm:pb-8"
          >
            <div
              className={`w-full max-w-3xl min-h-dvh sm:min-h-0 sm:my-auto sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border ${subScreenBorder}`}
              style={{ backgroundColor: subScreenBg }}
            >
            {/* Top Bar */}
            <div
              className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b backdrop-blur-md ${subScreenHeaderBorder}`}
              style={{ backgroundColor: subScreenBarBg }}
            >
              <button
                onClick={() => setSubScreen("none")}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? "bg-stone-200 text-stone-700 hover:bg-stone-300" : "bg-white/5 text-stone-200 hover:bg-white/10"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className={`font-bold text-sm ${themeTextColor}`}>About SutraSparsh</span>
              <div className="w-8" />
            </div>

            <div className="p-6 space-y-5 text-center">
              <span
                className="font-sanskrit text-5xl block"
                style={{ color: themeGoldLight }}
              >
                ॐ
              </span>
              <h1 className={`font-serif-sacred text-2xl font-bold ${themeTextColor}`}>
                SutraSparsh 2.0
              </h1>
              <p className={`text-xs leading-relaxed text-left ${isLight ? "text-stone-700" : "text-stone-300"}`} style={{ color: isLight ? "#453223" : themeMist }}>
                SutraSparsh is a digital temple engineered to bring the timeless wisdom of ancient Sanskrit scriptures—the Bhagavad Gita, Upanishads, Patanjali Yoga Sutras, and Ashtavakra Gita—directly into contemplative daily life.
              </p>

              <div className={`p-4 rounded-2xl border text-left space-y-2 ${
                isLight ? "bg-white border-stone-200 shadow-2xs" : "bg-white/5 border-white/5"
              }`}>
                <div className={`text-xs font-bold ${isLight ? "text-amber-900" : "text-amber-300"}`}>Core Architecture:</div>
                <ul className={`text-xs space-y-1.5 list-disc list-inside ${isLight ? "text-stone-700" : "text-stone-300"}`}>
                  <li>Full 18-chapter Bhagavad Gita and multi-scripture indexing</li>
                  <li>Pure Sanskrit typography with word-by-word padaccheda</li>
                  <li>Deterministic daily shloka calendar rotation</li>
                  <li>Continuous 432Hz meditative Tanpura drone synthesizer</li>
                  <li>Persistent Sandstone, Amethyst, Light, and Festival atmospheres</li>
                </ul>
              </div>

              <div className={`text-[11px] pt-4 ${isLight ? "text-stone-500" : "text-stone-500"}`}>
                Version 2.0.0 · Sacred Sanskrit Sanctuary
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ════════════ SUB-SCREEN 5: SANSKRIT GLOSSARY ════════════ */}
        {subScreen === "glossary" && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn backdrop-blur-xl bg-stone-950/80 flex justify-center p-0 sm:p-4 lg:p-6 pb-20 sm:pb-8"
          >
            <div
              className={`w-full max-w-3xl min-h-dvh sm:min-h-0 sm:my-auto sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border ${subScreenBorder}`}
              style={{ backgroundColor: subScreenBg }}
            >
            {/* Top Bar */}
            <div
              className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b backdrop-blur-md ${subScreenHeaderBorder}`}
              style={{ backgroundColor: subScreenBarBg }}
            >
              <button
                onClick={() => setSubScreen("none")}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? "bg-stone-200 text-stone-700 hover:bg-stone-300" : "bg-white/5 text-stone-200 hover:bg-white/10"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <div className={`font-bold text-sm ${themeTextColor}`}>Sanskrit Glossary</div>
                <div className={`text-[10px] ${isLight ? "text-stone-500" : "text-stone-400"}`}>धातु एवं मूल अर्थ</div>
              </div>
              <div className="w-8" />
            </div>

            <div className="p-5 space-y-3">
              {[
                { term: "Dharma (धर्म)", root: "√dhṛ (to hold, sustain)", meaning: "Cosmic order, sacred duty, righteous living, that which upholds truth." },
                { term: "Karma (कर्म)", root: "√kṛ (to do, perform)", meaning: "Action, deeds, cause and effect, intentional dedicated effort." },
                { term: "Yoga (योग)", root: "√yuj (to yoke, unite)", meaning: "Union of individual consciousness with universal divine truth." },
                { term: "Chitta (चित्त)", root: "√cit (to perceive)", meaning: "Mind-stuff, the subconscious storehouse of memories and impressions." },
                { term: "Atman (आत्मन्)", root: "√an (to breathe, live)", meaning: "The immortal inner Self, unchanging consciousness beyond the body and mind." },
                { term: "Brahman (ब्रह्मन्)", root: "√bṛh (to expand, grow)", meaning: "The ultimate, transcendent, infinite reality underlying the cosmos." },
                { term: "Moksha (मोक्ष)", root: "√muc (to release, set free)", meaning: "Liberation from the cycle of rebirth and worldly suffering." },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border space-y-1 ${
                    isLight ? "bg-white border-stone-200 shadow-2xs" : "bg-white/5 border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-xs ${isLight ? "text-amber-900 font-semibold" : "text-amber-300"}`}>{item.term}</span>
                    <span className={`text-[10px] font-mono ${isLight ? "text-stone-500" : "text-stone-400"}`}>{item.root}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isLight ? "text-stone-700" : "text-stone-300"}`}>{item.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* ════════════ SUB-SCREEN 6: GUIDED PATHS ════════════ */}
        {subScreen === "paths" && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn backdrop-blur-xl bg-stone-950/80 flex justify-center p-0 sm:p-4 lg:p-6 pb-20 sm:pb-8"
          >
            <div
              className={`w-full max-w-3xl min-h-dvh sm:min-h-0 sm:my-auto sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border ${subScreenBorder}`}
              style={{ backgroundColor: subScreenBg }}
            >
            {/* Top Bar */}
            <div
              className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b backdrop-blur-md ${subScreenHeaderBorder}`}
              style={{ backgroundColor: subScreenBarBg }}
            >
              <button
                onClick={() => setSubScreen("none")}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? "bg-stone-200 text-stone-700 hover:bg-stone-300" : "bg-white/5 text-stone-200 hover:bg-white/10"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className={`font-bold text-sm ${themeTextColor}`}>Guided Spiritual Paths</span>
              <div className="w-8" />
            </div>

            <div className="p-5 space-y-3.5">
              {[
                { title: "Karma Yoga Track", sub: "The Path of Selfless Action", verses: "14 Verses · 7 Days", icon: "⚖️", verseId: "bg_2_47" },
                { title: "Raja Yoga & Meditation", sub: "Patanjali's Eightfold Path to Stillness", verses: "12 Verses · 6 Days", icon: "🧘", verseId: "ys_1_2" },
                { title: "Jnana & Non-duality Track", sub: "Advaita Vedanta from Isha & Mandukya", verses: "21 Verses · 14 Days", icon: "🕯️", verseId: "isha_1" },
                { title: "Bhakti Yoga Track", sub: "The Path of Loving Devotion & Surrender", verses: "18 Verses · 10 Days", icon: "🪷", verseId: "bg_2_50" },
              ].map((track, idx) => (
                <div
                  key={idx}
                  onClick={() => openVerseScreen(track.verseId)}
                  className={`p-4 rounded-2xl border flex items-center space-x-3.5 cursor-pointer transition-colors ${
                    isLight
                      ? "bg-white border-stone-200 hover:border-amber-400 shadow-2xs"
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="text-2xl">{track.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold ${isLight ? "text-stone-900" : "text-stone-100"}`}>{track.title}</div>
                    <div className={`text-[11px] mt-0.5 ${isLight ? "text-stone-600" : "text-stone-400"}`}>{track.sub}</div>
                    <div className={`text-[10px] font-semibold mt-1 ${isLight ? "text-amber-800" : "text-amber-400"}`}>{track.verses}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isLight ? "text-stone-400" : "text-stone-500"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* ════════════ MINI PLAYER BAR ════════════ */}
        {playerVisible && (
          <div
            className={`fixed ${
              hideHeaderAndNav
                ? "bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-8 max-w-lg rounded-2xl border"
                : "bottom-[68px] left-0 right-0 max-w-[430px] border-t"
            } mx-auto z-40 p-3 px-4 flex items-center space-x-3 shadow-2xl border-amber-500/20 backdrop-blur-md`}
            style={{
              background: isSandstone
                ? "linear-gradient(90deg, #2a1404, #1e0e02)"
                : "linear-gradient(90deg, #22103a, #1a0d2e)",
            }}
          >
            <button
              onClick={() => {
                if (isPlaying) {
                  recitationEngine.pause();
                } else {
                  recitationEngine.resume(selectedVerseData.sanskrit, prefChantSpeed);
                }
              }}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center shadow hover:scale-105 transition-transform flex-shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-stone-950" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-stone-100 truncate">
                {selectedVerseData.source} · {selectedVerseData.title}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[10px] text-stone-400 font-mono">
                  {Math.floor(audioProgress / 60)}:{(audioProgress % 60).toString().padStart(2, "0")}
                </span>
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newProgress = Math.round((clickX / rect.width) * audioDuration);
                    recitationEngine.seek(newProgress);
                  }}
                  className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer flex items-center"
                  title="Click to seek recitation"
                >
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-150"
                    style={{ width: `${Math.min(100, (audioProgress / Math.max(1, audioDuration)) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
                  {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setPlayerVisible(false);
                recitationEngine.stop();
              }}
              className="p-1.5 text-stone-400 hover:text-stone-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ════════════ BOTTOM NAVIGATION BAR ════════════ */}
        {!hideHeaderAndNav && (
          <nav
            className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-30 py-2 px-3 border-t border-amber-500/20 backdrop-blur-lg flex justify-around"
            style={{
              background: isSandstone ? "rgba(16,8,2,0.97)" : "rgba(18,11,28,0.97)",
            }}
          >
            {[
              { id: "home", label: "Home", icon: "🏠" },
              { id: "explore", label: "Explore", icon: "🧭" },
              { id: "search", label: "Search", icon: "🔍" },
              { id: "journey", label: "Journey", icon: "♡" },
              { id: "more", label: "More", icon: "☰" },
            ].map((tab) => {
              const isActive = activeTab === tab.id && subScreen === "none";
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSubScreen("none");
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex-1 flex flex-col items-center space-y-0.5 py-1 font-bold text-[10px] transition-all ${
                    isActive
                      ? "text-amber-400 scale-105"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* ════════════ SOCIAL SHARING MODAL ════════════ */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          content={shareableContent}
        />
      </div>
    </div>
  );
};
