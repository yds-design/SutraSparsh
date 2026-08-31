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
} from "lucide-react";
import { ShareModal } from "./ShareModal";
import { progressService, type StreakData } from "../services/progress.service";
import { sharingService } from "../services/sharing.service";
import type { ReadingProgress } from "../types/progress";
import type { ShareableContent } from "../types/sharing";
import { soundEngine } from "../utils/audio";
import { speechSafetyEngine } from "../utils/speech";
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

export type AppTheme = "sandstone" | "amethyst";

interface SutraSparshTempleAppProps {
  onOpenAdmin?: () => void;
  onOpenPricing?: () => void;
  onOpenDonation?: () => void;
}

export const SutraSparshTempleApp: React.FC<SutraSparshTempleAppProps> = ({
  onOpenAdmin,
  onOpenPricing,
  onOpenDonation,
}) => {
  // Theme state
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      return (localStorage.getItem("sutrasparsh_theme") as AppTheme) || "sandstone";
    } catch {
      return "sandstone";
    }
  });

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
  >("none");

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

  const handleSelectTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("sutrasparsh_theme", newTheme);
    } catch {}
    soundEngine.playTempleBell(newTheme === "sandstone" ? 220 : 330);
    const themeName = newTheme === "sandstone" ? "Sandstone Temple" : "Amethyst Twilight";
    setThemeToast(`Atmosphere switched to ${themeName}`);
    setTimeout(() => {
      setThemeToast(null);
    }, 2800);
  };

  const handleResetPreferences = () => {
    setTheme("sandstone");
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
            if (th) setTheme(th);
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
  const isSandstone = theme === "sandstone";
  const themeCardDark = isSandstone
    ? "bg-gradient-to-b from-[#2B1706] to-[#1D0F04] border border-[#78300C]/40 text-[#F5E4C8]"
    : "bg-gradient-to-b from-[#251640] to-[#150B28] border border-[#52297A]/40 text-[#EDE0F8]";

  const themeGold = isSandstone ? "#E8921A" : "#C4A8E6";
  const themeGoldLight = isSandstone ? "#F4B24B" : "#D4BEF2";
  const themeMist = isSandstone ? "#D4BC96" : "#B8A4CC";
  const themeCardBg = isSandstone
    ? "linear-gradient(145deg, #fdf0d0, #f5e0a0)"
    : "linear-gradient(145deg, #ede2f8, #d8c2f0)";

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
      className="min-h-screen flex justify-center selection:bg-amber-500/30 selection:text-amber-200"
      style={{ backgroundColor: isSandstone ? "#0A0502" : "#080410" }}
    >
      {/* Mobile Shell Container */}
      <div
        className="w-full max-w-[430px] min-h-screen flex flex-col relative overflow-hidden shadow-2xl transition-colors duration-300 pb-28 font-sans"
        style={{ backgroundColor: isSandstone ? "#120A04" : "#0F0A1A" }}
      >
        {/* ════════════ ONBOARDING MODAL ════════════ */}
        {!onboardingDone && (
          <div
            className="fixed inset-0 max-w-[430px] mx-auto z-50 flex flex-col justify-between p-6 overflow-y-auto animate-fadeIn backdrop-blur-xl"
            style={{
              backgroundColor: isSandstone ? "rgba(18,10,4,0.98)" : "rgba(15,10,26,0.98)",
            }}
          >
            <div className="space-y-6 pt-6">
              <div className="text-center space-y-3">
                <span
                  className="font-sanskrit text-5xl block"
                  style={{ color: themeGoldLight }}
                >
                  ॐ
                </span>
                <h1 className="font-serif-sacred text-2xl font-bold text-stone-100">
                  Welcome to SutraSparsh
                </h1>
                <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: themeMist }}>
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
        )}

        {/* ════════════ APP BAR ════════════ */}
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
            {/* Greeting */}
            <div className="px-5 pt-3 pb-1">
              <div
                className="text-[11px] font-extrabold tracking-widest uppercase mb-1"
                style={{ color: themeGoldLight }}
              >
                {getGreeting()}
              </div>
              <h2 className="font-serif-sacred text-2xl font-bold text-stone-100 leading-tight">
                Take a moment<br />with today's wisdom.
              </h2>
              <div className="flex items-center justify-between mt-1 text-xs" style={{ color: themeMist }}>
                <span>Daily Contemplation Habit</span>
                {/* Date Navigation Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSelectedDateOffset((prev) => prev - 1)}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-stone-300 text-[10px]"
                    title="Yesterday's Shloka"
                  >
                    ← Prev
                  </button>
                  <span className="font-mono text-[10.5px] px-1 text-amber-300 font-bold">
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
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-stone-300 text-[10px]"
                    title="Tomorrow's Shloka"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>

            {/* Today's Wisdom Card (Dynamic Daily Rotation) */}
            <div className={`mx-4 p-6 rounded-3xl ${themeCardDark} space-y-4 shadow-xl`}>
              <div className="flex items-center justify-between">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  DAILY SHLOKA ROTATION
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {currentDailyVerse.source}
                </span>
              </div>

              {/* Sacred Sanskrit Verse */}
              <div className="font-sanskrit text-xl leading-[2.1] text-stone-100 text-center py-1">
                {currentDailyVerse.sanskrit.split("\n").map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
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

              {/* Meaning */}
              <p
                className="text-xs italic leading-relaxed text-center"
                style={{ color: themeMist }}
              >
                "{currentDailyVerse.meaning}"
              </p>

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
                  className="flex-1 py-2.5 rounded-full font-bold text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow hover:scale-[1.02] transition-transform text-center"
                >
                  Read & Study
                </button>
                <button
                  onClick={() => {
                    openVerseScreen(currentDailyVerse.id);
                    handleStartListen();
                  }}
                  className="flex-1 py-2.5 rounded-full font-bold text-xs bg-white/10 hover:bg-white/15 text-stone-200 border border-white/10 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedVerseData(currentDailyVerse);
                    handleOpenShare();
                  }}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 text-stone-200 flex items-center justify-center transition-colors"
                  title="Share Shloka"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Streak Bar (Dynamic from Progress Engine) */}
            <div className="px-5 flex items-center space-x-2.5">
              <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300">
                <span>🔥</span>
                <span>{streakData.currentStreak}-day streak</span>
              </div>
              <span className="text-xs" style={{ color: themeMist }}>
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
                  className="text-xs font-bold text-stone-400 hover:text-amber-300 transition-colors"
                >
                  View all
                </button>
              </div>

              <div
                onClick={() => openScriptureScreen("bhagavad_gita")}
                className="p-4 rounded-2xl bg-stone-900/60 border border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all flex items-center space-x-3.5 group shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  📗
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-stone-100 truncate">
                    {resumePoint?.scriptureTitle || "Bhagavad Gita"}
                  </div>
                  <div className="text-[11.5px] text-stone-400 truncate mt-0.5">
                    {resumePoint?.chapterTitle || "Chapter 2 · Verse 47 · Sankhya Yoga"}
                  </div>
                  <div className="w-full bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${resumePoint?.progressPercent || 62}%` }}
                    />
                  </div>
                  <div className="text-[10.5px] font-bold text-amber-400/90 mt-1">
                    {resumePoint?.progressPercent || 62}% · 266 verses read
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* EXPLORE WISDOM CORPUS */}
            <div className="px-4 space-y-2.5 pt-2">
              <div className="px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  EXPLORE SACRED SCRIPTURES
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
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
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-stone-200 hover:bg-amber-500/10 hover:border-amber-500/30 transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* QUICK ACCESS TILES */}
            <div className="px-4 space-y-2.5 pt-2">
              <div className="px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  QUICK ACCESS
                </span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                <div
                  onClick={() => setActiveTab("journey")}
                  className="flex-shrink-0 w-28 p-3.5 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: "linear-gradient(145deg, #fdf0d0, #f5e0a0)" }}
                >
                  <span className="text-xl block mb-1">☆</span>
                  <div className="text-xs font-bold text-stone-950">
                    {savedVerses.length} Saved
                  </div>
                  <div className="text-[10px] text-stone-700">Your verses</div>
                </div>

                <div
                  onClick={() => setSubScreen("glossary")}
                  className="flex-shrink-0 w-28 p-3.5 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: "linear-gradient(145deg, #c6ede0, #96d8c2)" }}
                >
                  <span className="text-xl block mb-1">📚</span>
                  <div className="text-xs font-bold text-stone-950">Glossary</div>
                  <div className="text-[10px] text-stone-700">Sanskrit terms</div>
                </div>

                <div
                  onClick={() => setSubScreen("paths")}
                  className="flex-shrink-0 w-28 p-3.5 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: "linear-gradient(145deg, #f5e4c8, #e8c88a)" }}
                >
                  <span className="text-xl block mb-1">🛤️</span>
                  <div className="text-xs font-bold text-stone-950">Paths</div>
                  <div className="text-[10px] text-stone-700">Guided journeys</div>
                </div>

                <div
                  onClick={() => setActiveTab("journey")}
                  className="flex-shrink-0 w-28 p-3.5 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: "linear-gradient(145deg, #fad8ce, #f4b09a)" }}
                >
                  <span className="text-xl block mb-1">📝</span>
                  <div className="text-xs font-bold text-stone-950">
                    {reflections.length} Notes
                  </div>
                  <div className="text-[10px] text-stone-700">Your reflections</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. EXPLORE SCREEN */}
        {activeTab === "explore" && subScreen === "none" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="px-5 pt-2 flex items-center justify-between">
              <h2 className="font-serif-sacred text-2xl font-bold text-stone-100">
                Explore Scriptures & Traditions
              </h2>
              <button
                onClick={() => setActiveTab("search")}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
              >
                <Search className="w-4 h-4 text-stone-200" />
              </button>
            </div>

            {/* Search Bar Input Trigger */}
            <div className="px-4">
              <div
                onClick={() => setActiveTab("search")}
                className="flex items-center space-x-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:border-amber-500/40 transition-colors"
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-stone-400">Search all wisdom, mantras, traditions...</span>
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
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
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
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{ background: "linear-gradient(145deg, #fad8ce, #f4b09a)" }}
                >
                  <span className="text-2xl block mb-1.5">🏷️</span>
                  <div className="text-xs font-bold text-stone-950">Topics</div>
                  <div className="text-[10.5px] text-stone-700">Karma, Dharma, Bhakti…</div>
                </div>

                <div
                  onClick={() => openScriptureScreen("yoga_sutras")}
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
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
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
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
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      explorePill === pill
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-white/5 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Scriptures List */}
              <div className="rounded-3xl bg-stone-900/60 border border-amber-500/20 overflow-hidden divide-y divide-white/5">
                {Object.values(SCRIPTURES_CORPUS)
                  .filter((sc) => explorePill === "All" || sc.category === explorePill)
                  .map((sc) => (
                    <div
                      key={sc.id}
                      onClick={() => openScriptureScreen(sc.id)}
                      className="p-4 flex items-center space-x-3.5 cursor-pointer hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-sanskrit text-lg text-amber-300 flex-shrink-0">
                        {sc.sanskritName.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-stone-100 truncate">
                          {sc.name}
                        </div>
                        <div className="text-[11px] text-stone-400 truncate mt-0.5">
                          {sc.totalChapters} {sc.id === "yoga_sutras" ? "Padas" : "Chapters"} · {sc.totalVerses} Verses · {sc.category}
                        </div>
                        <div className="w-full bg-stone-800 h-1 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                            style={{ width: sc.id === "bhagavad_gita" ? "62%" : "15%" }}
                          />
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
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
              <h2 className="font-serif-sacred text-2xl font-bold text-stone-100">
                Search Sacred Corpus
              </h2>
            </div>

            {/* Search Input Bar */}
            <div className="px-4 space-y-3">
              <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                <Search className="w-4 h-4 text-amber-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a Sanskrit shloka, keyword ('karma', 'atman', 'dharma')..."
                  className="flex-1 bg-transparent text-xs text-stone-100 placeholder-stone-500 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-stone-500 hover:text-stone-300 text-xs font-bold px-1"
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
                  <div className="p-6 rounded-2xl bg-white/5 text-center text-xs text-stone-400">
                    No verses found matching "{searchQuery}". Try searching for "karma", "equanimity", or "yoga".
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {searchResults.map((verse) => (
                      <div
                        key={verse.id}
                        onClick={() => openVerseScreen(verse.id)}
                        className="p-4 rounded-2xl bg-stone-900/70 border border-white/5 hover:border-amber-500/40 cursor-pointer transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400">
                            {verse.source} · {verse.title}
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-500" />
                        </div>
                        <div className="font-sanskrit text-sm text-stone-100 line-clamp-2 leading-relaxed">
                          {verse.sanskrit}
                        </div>
                        <p className="text-xs text-stone-300 line-clamp-2">
                          {verse.meaning}
                        </p>
                      </div>
                    ))}
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
              <h2 className="font-serif-sacred text-2xl font-bold text-stone-100">
                My Sādhana Sanctuary
              </h2>
              {reflections.length > 0 && (
                <button
                  onClick={handleExportReflections}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 flex items-center space-x-1"
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
                className="p-3.5 rounded-2xl text-center"
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
                className="p-3.5 rounded-2xl text-center"
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
                className="p-3.5 rounded-2xl text-center"
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
                {savedVerses.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openVerseScreen(item.id)}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center space-x-3 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <span className="text-base text-rose-400">❤️</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-sanskrit text-sm text-stone-100 truncate">
                        {item.title}
                      </div>
                      <div
                        className="text-[11px] font-bold mt-0.5"
                        style={{ color: themeGoldLight }}
                      >
                        {item.ref}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  </div>
                ))}
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
                <div className="p-4 rounded-2xl bg-white/5 text-center text-xs text-stone-400">
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

        {/* 5. MORE SCREEN */}
        {activeTab === "more" && subScreen === "none" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="px-5 pt-2">
              <h2 className="font-serif-sacred text-2xl font-bold text-stone-100">
                More & Sādhaka Account
              </h2>
            </div>

            {/* LEARN */}
            <div className="space-y-1">
              <div className="px-5 text-[10.5px] font-extrabold tracking-widest uppercase text-stone-500">
                LEARN & SCRIPTURAL FOUNDATIONS
              </div>
              <div
                onClick={() => setSubScreen("about")}
                className="px-5 py-3.5 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
              >
                <span className="text-base">🕉️</span>
                <span className="text-xs font-semibold text-stone-200 flex-1">
                  About SutraSparsh
                </span>
                <ChevronRight className="w-4 h-4 text-stone-500" />
              </div>
              <div
                onClick={() => setSubScreen("glossary")}
                className="px-5 py-3.5 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
              >
                <span className="text-base">📖</span>
                <span className="text-xs font-semibold text-stone-200 flex-1">
                  Sanskrit Glossary & Root Etymology
                </span>
                <ChevronRight className="w-4 h-4 text-stone-500" />
              </div>
              <div
                onClick={() => setSubScreen("paths")}
                className="px-5 py-3.5 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
              >
                <span className="text-base">🛤️</span>
                <span className="text-xs font-semibold text-stone-200 flex-1">
                  Start a Guided Spiritual Path
                </span>
                <ChevronRight className="w-4 h-4 text-stone-500" />
              </div>
            </div>

            {/* YOUR ACCOUNT & PREFERENCES */}
            <div className="space-y-1">
              <div className="px-5 text-[10.5px] font-extrabold tracking-widest uppercase text-stone-500">
                ATMOSPHERE & PREFERENCES
              </div>
              <div
                onClick={() => setSubScreen("pref")}
                className="px-5 py-3.5 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
              >
                <span className="text-base">⚙️</span>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-stone-200">
                    Preferences & Themes
                  </div>
                  <div className="text-[10.5px] text-amber-400 mt-0.5">
                    Currently: {isSandstone ? "Sandstone Temple" : "Amethyst Twilight"}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-500" />
              </div>
              <div
                onClick={() => onOpenPricing && onOpenPricing()}
                className="px-5 py-3.5 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 text-amber-300"
              >
                <span className="text-base">⭐</span>
                <span className="text-xs font-bold flex-1">
                  SutraSparsh Premium (Unlimited Chants)
                </span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </div>
            </div>

            {/* SUPPORT & SEVA */}
            <div className="space-y-1">
              <div className="px-5 text-[10.5px] font-extrabold tracking-widest uppercase text-stone-500">
                SUPPORT & SEVA
              </div>
              <div
                onClick={() => onOpenDonation && onOpenDonation()}
                className="px-5 py-3.5 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
              >
                <span className="text-base">💙</span>
                <span className="text-xs font-semibold text-stone-200 flex-1">
                  Gurudakshina / Seva (80G Tax Exemption)
                </span>
                <ChevronRight className="w-4 h-4 text-stone-500" />
              </div>
            </div>

            {/* ADMIN CONSOLE SWITCHER */}
            {onOpenAdmin && (
              <div className="px-5 pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="w-full py-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center space-x-2 hover:bg-amber-500/25 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  <span>Open SutraSparsh Admin Console</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════ SUB-SCREEN 1: SCRIPTURE DETAIL (DYNAMIC CORPUS) ════════════ */}
        {subScreen === "scripture" && (
          <div
            className="fixed inset-0 max-w-[430px] mx-auto z-40 flex flex-col overflow-y-auto animate-fadeIn pb-24"
            style={{ backgroundColor: isSandstone ? "#120A04" : "#0F0A1A" }}
          >
            {/* Sub Bar */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b border-white/5 backdrop-blur-md"
              style={{ backgroundColor: isSandstone ? "rgba(18,10,4,0.95)" : "rgba(15,10,26,0.95)" }}
            >
              <button
                onClick={() => setSubScreen("none")}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-stone-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-sm text-stone-100 truncate max-w-[200px]">
                {activeScriptureData.name}
              </span>
              <button
                onClick={handleToggleTanpura}
                className="text-stone-300 p-1"
                title="Toggle Tanpura Drone"
              >
                <Radio className={`w-4 h-4 ${isDroneActive ? "text-amber-400" : ""}`} />
              </button>
            </div>

            {/* Scripture Hero */}
            <div className="p-6 border-b border-amber-500/10 space-y-4">
              <div className="space-y-1">
                <div className="font-sanskrit text-amber-300 text-lg">
                  {activeScriptureData.sanskritName}
                </div>
                <h1 className="font-serif-sacred text-3xl font-bold text-stone-100">
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
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex space-x-6 pt-2">
                <div>
                  <div className="font-serif-sacred text-xl font-bold text-amber-400">
                    {activeScriptureData.totalChapters}
                  </div>
                  <div className="text-[10.5px] font-bold text-stone-400">
                    {activeScriptureData.sectionType?.split(" ")[0] || (activeScriptureData.id === "yoga_sutras" ? "Pādas" : activeScriptureData.id.includes("upanishad") ? "Khaṇḍas" : "Chapters")}
                  </div>
                </div>
                <div>
                  <div className="font-serif-sacred text-xl font-bold text-amber-400">
                    {activeScriptureData.totalVerses}
                  </div>
                  <div className="text-[10.5px] font-bold text-stone-400">
                    {activeScriptureData.id === "yoga_sutras" ? "Sūtras" : activeScriptureData.id.includes("upanishad") ? "Mantras" : "Verses / Shlokas"}
                  </div>
                </div>
                <div>
                  <div className="font-serif-sacred text-xl font-bold text-amber-400">
                    {activeScriptureData.category}
                  </div>
                  <div className="text-[10.5px] font-bold text-stone-400">
                    Tradition
                  </div>
                </div>
              </div>

              <button
                onClick={() => openVerseScreen(activeScriptureData.defaultVerseId)}
                className="w-full py-3 rounded-full font-bold text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow hover:scale-[1.02] transition-transform"
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

              <div className="divide-y divide-white/5">
                {activeScriptureData.chapters.map((ch) => (
                  <div
                    key={ch.num}
                    onClick={() => openVerseScreen(ch.featuredVerseId || activeScriptureData.defaultVerseId)}
                    className="py-3.5 px-2 flex items-center space-x-3.5 cursor-pointer rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center justify-center text-xs font-bold flex-shrink-0 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                      {ch.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-stone-100 group-hover:text-amber-300 transition-colors truncate">
                        {ch.name} <span className="font-sanskrit font-normal text-stone-400">({ch.sanskritName})</span>
                      </div>
                      <div className="text-[11px] text-stone-400 truncate mt-0.5">
                        {ch.versesCount} {activeScriptureData.id === "yoga_sutras" ? "sūtras" : activeScriptureData.id.includes("upanishad") ? "mantras" : "verses"} · {ch.summary}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ SUB-SCREEN 2: VERSE DETAIL (DYNAMIC MULTI-SCRIPTURE) ════════════ */}
        {subScreen === "verse" && (
          <div
            className="fixed inset-0 max-w-[430px] mx-auto z-40 flex flex-col overflow-y-auto animate-fadeIn pb-24"
            style={{ backgroundColor: isSandstone ? "#120A04" : "#0F0A1A" }}
          >
            {/* Sub Bar */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b border-white/5 backdrop-blur-md"
              style={{ backgroundColor: isSandstone ? "rgba(18,10,4,0.95)" : "rgba(15,10,26,0.95)" }}
            >
              <button
                onClick={() => setSubScreen("none")}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-stone-200 hover:bg-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-sm text-stone-100 truncate max-w-[200px]">
                {selectedVerseData.title}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleTanpura}
                  className={`p-1.5 rounded-full ${isDroneActive ? "text-amber-400" : "text-stone-400"}`}
                  title="Toggle Tanpura Drone"
                >
                  <Radio className="w-4 h-4" />
                </button>
                <button
                  onClick={handleOpenShare}
                  className="text-stone-300 p-1"
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
                <div className="font-sanskrit text-2xl leading-[2.2] text-stone-100 py-2 select-text">
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
              <div className="px-6 py-4 border-t border-white/5 space-y-2">
                <div
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  IAST ROMAN TRANSLITERATION
                </div>
                <div
                  className="text-xs italic leading-relaxed font-mono whitespace-pre-line"
                  style={{ color: themeMist }}
                >
                  {selectedVerseData.transliteration}
                </div>
              </div>
            )}

            {/* WORD-BY-WORD VOCABULARY DICTIONARY */}
            {selectedVerseData.wordDict && (
              <div className="px-6 py-4 border-t border-white/5 space-y-2.5">
                <div
                  className="text-[10.5px] font-extrabold tracking-widest uppercase flex items-center justify-between"
                  style={{ color: themeGoldLight }}
                >
                  <span>WORD-BY-WORD BREAKDOWN (पदच्छेद)</span>
                  <span className="text-[9px] text-stone-400 lowercase">tap word for sound</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedVerseData.wordDict).map(([sanskritWord, details]) => (
                    <div
                      key={sanskritWord}
                      onClick={() => handleWordTap(sanskritWord)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-sanskrit font-bold text-amber-300">{sanskritWord}</span>
                        <span className="text-[10px] text-stone-400 font-mono italic">{details.trans}</span>
                      </div>
                      <div className="text-[11px] text-stone-200">
                        {prefLang === "hi" ? details.hi : details.en}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MEANING (ENGLISH / HINDI / DUAL) */}
            <div className="px-6 py-4 border-t border-white/5 space-y-2">
              <div
                className="text-[10.5px] font-extrabold tracking-widest uppercase"
                style={{ color: themeGoldLight }}
              >
                MEANING (अर्थ)
              </div>
              {(prefLang === "dual" || prefLang === "en") && (
                <div className="text-sm font-medium leading-relaxed text-stone-100">
                  {selectedVerseData.meaning}
                </div>
              )}
              {(prefLang === "dual" || prefLang === "hi") && selectedVerseData.hindiMeaning && (
                <div className="text-xs font-serif-sacred leading-relaxed text-amber-200/90 pt-1">
                  {selectedVerseData.hindiMeaning}
                </div>
              )}
            </div>

            {/* COMMENTARY */}
            <div className="px-6 py-4 border-t border-white/5 space-y-2">
              <div
                className="text-[10.5px] font-extrabold tracking-widest uppercase"
                style={{ color: themeGoldLight }}
              >
                AUTHENTIC LINEAGE COMMENTARY
              </div>
              <div
                className="text-xs leading-relaxed text-stone-300"
                style={{ color: themeMist }}
              >
                {commentaryExpanded
                  ? `${selectedVerseData.commentary} Shankara emphasizes that Karma Yoga is the purification of mental tendencies (citta-shuddhi). When actions are undertaken free from possessiveness, one naturally attains clarity, leading smoothly into Jnana Yoga (the direct realization of non-dual Truth).`
                  : selectedVerseData.commentary}
              </div>
              <button
                onClick={() => setCommentaryExpanded(!commentaryExpanded)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 pt-1 flex items-center space-x-1"
              >
                <span>{commentaryExpanded ? "Show concise summary ↑" : "Read full commentary ↓"}</span>
              </button>
            </div>

            {/* ACTION BAR */}
            <div className="px-6 py-4 border-t border-white/5 grid grid-cols-4 gap-2">
              <button
                onClick={handleStartListen}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1 transition-all ${
                  isSpeakingChant
                    ? "bg-amber-500 text-stone-950 font-bold"
                    : "bg-white/5 hover:bg-white/10 text-stone-300"
                }`}
              >
                <Volume2 className={`w-5 h-5 ${isSpeakingChant ? "text-stone-950 animate-bounce" : "text-amber-400"}`} />
                <span className="text-[11px] font-bold">
                  {isSpeakingChant ? "Chanting..." : "Listen"}
                </span>
              </button>

              <button
                onClick={handleToggleSave}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center space-y-1"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isCurrentVerseSaved ? "fill-rose-500 text-rose-500" : "text-stone-300"
                  }`}
                />
                <span className="text-[11px] font-bold text-stone-300">
                  {isCurrentVerseSaved ? "Saved" : "Save"}
                </span>
              </button>

              <button
                onClick={handleOpenShare}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center space-y-1"
              >
                <Share2 className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] font-bold text-stone-300">Share</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playTempleBell(330);
                  setThemeToast(`Context: Spoken in ${selectedVerseData.source}`);
                  setTimeout(() => setThemeToast(null), 2500);
                }}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center space-y-1"
              >
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] font-bold text-stone-300">Context</span>
              </button>
            </div>

            {/* REFLECT JOURNAL BOX */}
            <div className="px-6 py-4 border-t border-white/5 space-y-2.5">
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
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-amber-500/20 text-xs text-stone-100 placeholder-stone-500 outline-none resize-none focus:border-amber-500/50"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={handleSaveReflection}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow hover:scale-105 transition-transform"
                >
                  Save to Sādhana Journal
                </button>
                {reflectionSavedMessage && (
                  <span className="text-xs text-emerald-400 font-semibold animate-fadeIn">
                    ✓ Saved to Your Journey!
                  </span>
                )}
              </div>
            </div>

            {/* CONSECUTIVE SCRIPTURAL NAVIGATION */}
            {(() => {
              const { prevVerse, nextVerse } = getAdjacentVerses(selectedVerseData.id);
              return (
                <div className="px-6 py-4 border-t border-white/5 space-y-2">
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
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-all group"
                      >
                        <div className="text-[10px] text-stone-400 font-mono">← PREVIOUS</div>
                        <div className="text-xs font-bold text-stone-200 truncate mt-0.5 group-hover:text-amber-300">
                          {prevVerse.title}
                        </div>
                      </button>
                    ) : (
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.02] text-left opacity-40">
                        <div className="text-[10px] text-stone-500 font-mono">START OF TEXT</div>
                        <div className="text-xs font-bold text-stone-500 truncate mt-0.5">First Verse</div>
                      </div>
                    )}

                    {nextVerse ? (
                      <button
                        onClick={() => openVerseScreen(nextVerse.id)}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-right transition-all group"
                      >
                        <div className="text-[10px] text-stone-400 font-mono">NEXT →</div>
                        <div className="text-xs font-bold text-stone-200 truncate mt-0.5 group-hover:text-amber-300">
                          {nextVerse.title}
                        </div>
                      </button>
                    ) : (
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.02] text-right opacity-40">
                        <div className="text-[10px] text-stone-500 font-mono">END OF CORPUS</div>
                        <div className="text-xs font-bold text-stone-500 truncate mt-0.5">Last Verse</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* RELATED WISDOM (CONNECTED LINKS) */}
            <div className="px-6 py-4 border-t border-white/5 space-y-2.5">
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
                    className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center space-x-3 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: themeGoldLight }}
                    >
                      {item.ref}
                    </span>
                    <span className="font-sanskrit text-xs text-stone-100 flex-1 truncate">
                      {item.snippet}
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ SUB-SCREEN 3: PREFERENCES & THEMES (PERSISTENT) ════════════ */}
        {subScreen === "pref" && (
          <div
            className="fixed inset-0 max-w-[430px] mx-auto z-40 flex flex-col overflow-y-auto animate-fadeIn pb-24"
            style={{ backgroundColor: isSandstone ? "#120A04" : "#0F0A1A" }}
          >
            {/* Top Bar */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b border-white/5 backdrop-blur-md"
              style={{ backgroundColor: isSandstone ? "rgba(18,10,4,0.95)" : "rgba(15,10,26,0.95)" }}
            >
              <button
                onClick={() => setSubScreen("none")}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-stone-200 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <div className="font-bold text-sm text-stone-100">Preferences & Themes</div>
                <div className="text-[10px] text-stone-400 font-serif-sacred">रुचि एवं स्वरूप</div>
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
                  Choose your sacred reading environment. Your palette is saved to local storage and persists across all app sessions.
                </p>
              </div>

              {/* Theme Palette Switcher Cards */}
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
                    !isSandstone
                      ? "bg-[#241540]/90 border-purple-400/80 shadow-[0_0_20px_rgba(196,168,230,0.25)]"
                      : "bg-stone-900/40 border-stone-800/80 hover:bg-stone-800/40 opacity-75 hover:opacity-100"
                  }`}
                >
                  {!isSandstone && (
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
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        prefScript === item.id
                          ? "bg-amber-500/20 border-amber-400 text-stone-100 font-bold"
                          : "bg-white/5 border-white/5 text-stone-400 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-xs leading-tight">{item.label}</div>
                      <div className="text-[9.5px] text-stone-400 mt-0.5">{item.sub}</div>
                    </button>
                  ))}
                </div>

                {/* Translation Language */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-semibold text-stone-300">Default Meaning Language</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "dual", label: "English + Hindi" },
                      { id: "en", label: "English Only" },
                      { id: "hi", label: "हिंदी केवल" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setPrefLang(item.id as any)}
                        className={`py-2 px-1 rounded-xl border text-center text-xs transition-all ${
                          prefLang === item.id
                            ? "bg-amber-500/20 border-amber-400 text-stone-100 font-bold"
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
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <Music className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-stone-200">Chant Recitation Tempo</div>
                      <div className="text-[10.5px] text-stone-400">Pace of TTS recitation</div>
                    </div>
                  </div>

                  <div className="flex space-x-1.5">
                    {[0.85, 1.0, 1.15].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPrefChantSpeed(speed)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                          prefChantSpeed === speed
                            ? "bg-amber-500 text-stone-950"
                            : "bg-white/10 text-stone-300 hover:bg-white/15"
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Brahma Muhurta Reminder with Permission Request */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-stone-200">Daily Shloka Notification</div>
                      <div className="text-[10.5px] text-stone-400">Brahma Muhurta or Sandhya</div>
                    </div>
                  </div>

                  <div className="flex space-x-1.5">
                    {[
                      { time: "05:30", label: "5:30 AM" },
                      { time: "06:30", label: "6:30 AM" },
                      { time: "20:00", label: "8:00 PM" },
                    ].map((item) => (
                      <button
                        key={item.time}
                        onClick={() => {
                          setPrefReminder(item.time);
                          handleRequestNotifications();
                        }}
                        className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-colors ${
                          prefReminder === item.time
                            ? "bg-amber-500 text-stone-950"
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
                <p className="text-xs text-stone-400 leading-relaxed">
                  Export all your saved verses, journal entries, streaks, and reading progress to a portable JSON file, or restore from a previous backup.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleExportBackupJson}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4 flex-shrink-0" />
                    <span>Export Backup</span>
                  </button>

                  <label className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 text-xs font-bold transition-colors flex items-center justify-center space-x-2 cursor-pointer">
                    <Upload className="w-4 h-4 flex-shrink-0 text-amber-400" />
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
              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={handleResetPreferences}
                  className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-stone-300 text-xs font-semibold hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Default Preferences & Sandstone Atmosphere</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ SUB-SCREEN 4: ABOUT SUTRASPARSH ════════════ */}
        {subScreen === "about" && (
          <div
            className="fixed inset-0 max-w-[430px] mx-auto z-40 flex flex-col overflow-y-auto animate-fadeIn pb-24"
            style={{ backgroundColor: isSandstone ? "#120A04" : "#0F0A1A" }}
          >
            {/* Top Bar */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b border-white/5 backdrop-blur-md"
              style={{ backgroundColor: isSandstone ? "rgba(18,10,4,0.95)" : "rgba(15,10,26,0.95)" }}
            >
              <button
                onClick={() => setSubScreen("none")}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-stone-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-sm text-stone-100">About SutraSparsh</span>
              <div className="w-8" />
            </div>

            <div className="p-6 space-y-5 text-center">
              <span
                className="font-sanskrit text-5xl text-amber-400 block"
                style={{ color: themeGoldLight }}
              >
                ॐ
              </span>
              <h1 className="font-serif-sacred text-2xl font-bold text-stone-100">
                SutraSparsh 2.0
              </h1>
              <p className="text-xs leading-relaxed text-left text-stone-300" style={{ color: themeMist }}>
                SutraSparsh is a digital temple engineered to bring the timeless wisdom of ancient Sanskrit scriptures—the Bhagavad Gita, Upanishads, Patanjali Yoga Sutras, and Ashtavakra Gita—directly into contemplative daily life.
              </p>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left space-y-2">
                <div className="text-xs font-bold text-amber-300">Core Architecture:</div>
                <ul className="text-xs space-y-1.5 text-stone-300 list-disc list-inside">
                  <li>Full 18-chapter Bhagavad Gita and multi-scripture indexing</li>
                  <li>Pure Sanskrit typography with word-by-word padaccheda</li>
                  <li>Deterministic daily shloka calendar rotation</li>
                  <li>Continuous 432Hz meditative Tanpura drone synthesizer</li>
                  <li>Persistent Sandstone & Amethyst atmospheres</li>
                </ul>
              </div>

              <div className="text-[11px] text-stone-500 pt-4">
                Version 2.0.0 · Sacred Sanskrit Sanctuary
              </div>
            </div>
          </div>
        )}

        {/* ════════════ SUB-SCREEN 5: SANSKRIT GLOSSARY ════════════ */}
        {subScreen === "glossary" && (
          <div
            className="fixed inset-0 max-w-[430px] mx-auto z-40 flex flex-col overflow-y-auto animate-fadeIn pb-24"
            style={{ backgroundColor: isSandstone ? "#120A04" : "#0F0A1A" }}
          >
            {/* Top Bar */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b border-white/5 backdrop-blur-md"
              style={{ backgroundColor: isSandstone ? "rgba(18,10,4,0.95)" : "rgba(15,10,26,0.95)" }}
            >
              <button
                onClick={() => setSubScreen("none")}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-stone-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <div className="font-bold text-sm text-stone-100">Sanskrit Glossary</div>
                <div className="text-[10px] text-stone-400">धातु एवं मूल अर्थ</div>
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
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-300">{item.term}</span>
                    <span className="text-[10px] text-stone-400 font-mono">{item.root}</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">{item.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════ SUB-SCREEN 6: GUIDED PATHS ════════════ */}
        {subScreen === "paths" && (
          <div
            className="fixed inset-0 max-w-[430px] mx-auto z-40 flex flex-col overflow-y-auto animate-fadeIn pb-24"
            style={{ backgroundColor: isSandstone ? "#120A04" : "#0F0A1A" }}
          >
            {/* Top Bar */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b border-white/5 backdrop-blur-md"
              style={{ backgroundColor: isSandstone ? "rgba(18,10,4,0.95)" : "rgba(15,10,26,0.95)" }}
            >
              <button
                onClick={() => setSubScreen("none")}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-stone-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-sm text-stone-100">Guided Spiritual Paths</span>
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
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center space-x-3.5 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <span className="text-2xl">{track.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-stone-100">{track.title}</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">{track.sub}</div>
                    <div className="text-[10px] text-amber-400 font-semibold mt-1">{track.verses}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════ MINI PLAYER BAR ════════════ */}
        {playerVisible && (
          <div
            className="fixed bottom-[68px] left-0 right-0 max-w-[430px] mx-auto z-30 p-3 px-4 flex items-center space-x-3 shadow-2xl border-t border-amber-500/20 backdrop-blur-md"
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
