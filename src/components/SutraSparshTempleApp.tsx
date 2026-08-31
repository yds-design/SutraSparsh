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
} from "lucide-react";
import { ShareModal } from "./ShareModal";
import { progressService } from "../services/progress.service";
import { sharingService } from "../services/sharing.service";
import type { ReadingProgress } from "../types/progress";
import type { ShareableContent } from "../types/sharing";

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
  const [subScreen, setSubScreen] = useState<"none" | "scripture" | "verse" | "glossary" | "paths" | "about" | "pref">("none");

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
  const [selectedScriptureId, setSelectedScriptureId] = useState("bhagavad_gita");
  const [selectedVerseData, setSelectedVerseData] = useState<{
    id: string;
    title: string;
    chapterName: string;
    chapterNum: number;
    verseNum: number;
    sanskrit: string;
    transliteration: string;
    meaning: string;
    commentary: string;
    source: string;
  }>({
    id: "bg_2_47",
    title: "Bhagavad Gita 2.47",
    chapterName: "Sankhya Yoga",
    chapterNum: 2,
    verseNum: 47,
    sanskrit: `कर्मण्येवाधिकारस्ते\nमा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते\nसंगोऽस्त्वकर्मणि॥`,
    transliteration: `karmaṇy-evādhikāras te mā phaleṣu kadācana |\nmā karma-phala-hetur bhūr mā te saṅgo 'stv akarmaṇi ||`,
    meaning: `You have a right only to action, never to its fruits. Let not the fruits of action be your motive, nor let your attachment be to inaction.`,
    commentary: `Shankara interprets this as the foundational teaching of Karma Yoga — that one should perform all actions as an offering to the Divine, without personal attachment to results. The verse does not advocate passivity; rather, it directs the energy of action inward, transforming work into a form of meditation.`,
    source: "Bhagavad Gita",
  });

  // Progress & Resume Subsystem (Phase 26)
  const [resumePoint, setResumePoint] = useState<ReadingProgress | null>(null);

  // Saved / Bookmark state
  const [savedVerses, setSavedVerses] = useState<Array<{ id: string; title: string; ref: string; snippet: string }>>(() => {
    try {
      const saved = localStorage.getItem("sutrasparsh_saved_verses");
      return saved
        ? JSON.parse(saved)
        : [
            { id: "bg_2_47", title: "कर्मण्येवाधिकारस्ते…", ref: "Bhagavad Gita 2.47", snippet: "You have a right only to action..." },
            { id: "bg_2_22", title: "वासांसि जीर्णानि यथा…", ref: "Bhagavad Gita 2.22", snippet: "Just as a person sheds old garments..." },
            { id: "bg_2_50", title: "योगः कर्मसु कौशलम्…", ref: "Bhagavad Gita 2.50", snippet: "Yoga is skill in action..." },
          ];
    } catch {
      return [
        { id: "bg_2_47", title: "कर्मण्येवाधिकारस्ते…", ref: "Bhagavad Gita 2.47", snippet: "You have a right only to action..." },
      ];
    }
  });

  const [isCurrentVerseSaved, setIsCurrentVerseSaved] = useState(true);

  // Reflections state
  const [reflections, setReflections] = useState<Array<{ id: string; verseRef: string; text: string; date: string }>>(() => {
    try {
      const saved = localStorage.getItem("sutrasparsh_reflections_list");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "ref-1",
              verseRef: "Gita 2.47",
              text: "This verse reminds me that my role at work is to do my best—not to worry about whether I get the recognition or promotion right away.",
              date: "Today",
            },
          ];
    } catch {
      return [];
    }
  });
  const [currentReflectionText, setCurrentReflectionText] = useState("");
  const [reflectionSavedMessage, setReflectionSavedMessage] = useState(false);

  // Full Commentary expansion
  const [commentaryExpanded, setCommentaryExpanded] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"text" | "meaning">("text");

  // Explore Filter Pill state
  const [explorePill, setExplorePill] = useState("All");

  // Mini Player Audio state
  const [playerVisible, setPlayerVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(18); // seconds
  const audioDuration = 42; // seconds
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Share Modal state (Phase 25)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareableContent, setShareableContent] = useState<ShareableContent | null>(null);

  // Sync Progress Service on mount
  useEffect(() => {
    const unsub = progressService.subscribe((current) => {
      setResumePoint(current);
    });
    return unsub;
  }, []);

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
    const themeName = newTheme === "sandstone" ? "Sandstone Temple" : "Amethyst Twilight";
    setThemeToast(`Atmosphere switched to ${themeName} and saved`);
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

  // Audio Playback simulation with real state tracking
  useEffect(() => {
    if (isPlaying) {
      audioTimerRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= audioDuration) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 1;
          // Record progress to progressService
          progressService.recordAudioProgress(
            selectedVerseData.id,
            {
              contentId: selectedVerseData.id,
              timestampSeconds: next,
              durationSeconds: audioDuration,
            },
            {
              scriptureTitle: selectedVerseData.source,
              verseTitle: selectedVerseData.title,
            }
          );
          return next;
        });
      }, 1000);
    } else {
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    }
    return () => {
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    };
  }, [isPlaying, selectedVerseData]);

  // Greeting by time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  const handleStartApp = () => {
    setOnboardingDone(true);
    try {
      localStorage.setItem("sutrasparsh_onboarding_done", "true");
    } catch {}
    setActiveTab("home");
  };

  const toggleOnboardingOpt = (index: number) => {
    setSelectedOnboardingOptions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const openVerseScreen = (verseId = "bg_2_47") => {
    if (verseId === "bg_2_47") {
      setSelectedVerseData({
        id: "bg_2_47",
        title: "Bhagavad Gita 2.47",
        chapterName: "Sankhya Yoga",
        chapterNum: 2,
        verseNum: 47,
        sanskrit: `कर्मण्येवाधिकारस्ते\nमा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते\nसंगोऽस्त्वकर्मणि॥`,
        transliteration: `karmaṇy-evādhikāras te mā phaleṣu kadācana |\nmā karma-phala-hetur bhūr mā te saṅgo 'stv akarmaṇi ||`,
        meaning: `You have a right only to action, never to its fruits. Let not the fruits of action be your motive, nor let your attachment be to inaction.`,
        commentary: `Shankara interprets this as the foundational teaching of Karma Yoga — that one should perform all actions as an offering to the Divine, without personal attachment to results. The verse does not advocate passivity; rather, it directs the energy of action inward, transforming work into a form of meditation.`,
        source: "Bhagavad Gita",
      });
    } else if (verseId === "bg_2_50") {
      setSelectedVerseData({
        id: "bg_2_50",
        title: "Bhagavad Gita 2.50",
        chapterName: "Sankhya Yoga",
        chapterNum: 2,
        verseNum: 50,
        sanskrit: `बुद्धियुक्तो जहातीह\nउभे सुकृतदुष्कृते।\nतस्माद्योगाय युज्यस्व\nयोगः कर्मसु कौशलम्॥`,
        transliteration: `buddhi-yukto jahātīha ubhe sukṛta-duṣkṛte |\ntasmād yogāya yujyasva yogaḥ karmasu kauśalam ||`,
        meaning: `One who is disciplined by wisdom casts away in this world both good and evil deeds. Therefore, strive for Yoga; Yoga is skill in action.`,
        commentary: `Wisdom (Buddhi) brings emotional equanimity, freeing one from the binding reactions of karmic outcomes. Skill in action is maintaining tranquility amidst dynamic work.`,
        source: "Bhagavad Gita",
      });
    } else if (verseId === "bg_3_19") {
      setSelectedVerseData({
        id: "bg_3_19",
        title: "Bhagavad Gita 3.19",
        chapterName: "Karma Yoga",
        chapterNum: 3,
        verseNum: 19,
        sanskrit: `तस्मादसक्तः सततं\nकार्यं कर्म समाचर।\nअसक्तो ह्याचरन्कर्म\nपरमाप्नोति पूरुषः॥`,
        transliteration: `tasmād asaktaḥ satataṁ kāryaṁ karma samācara |\nasakto hy ācharan karma param āpnoti pūruṣaḥ ||`,
        meaning: `Therefore, without being attached, always perform the work that ought to be done; for by doing work without attachment, a person attains the Supreme.`,
        commentary: `Unselfish duty performed with love dissolves the ego boundary, bringing the seeker to supreme spiritual realization.`,
        source: "Bhagavad Gita",
      });
    } else if (verseId === "bg_4_18") {
      setSelectedVerseData({
        id: "bg_4_18",
        title: "Bhagavad Gita 4.18",
        chapterName: "Jnana Karma Sanyasa Yoga",
        chapterNum: 4,
        verseNum: 18,
        sanskrit: `कर्मण्यकर्म यः पश्येत्\nअकर्मणि च कर्म यः।\nस बुद्धिमान्मनुष्येषु\nस युक्तः कृत्स्नकर्मकृत्॥`,
        transliteration: `karmaṇy akarma yaḥ paśyed akarmaṇi cha karma yaḥ |\nsa buddhimān manuṣyeṣu sa yuktaḥ kṛtsna-karma-kṛt ||`,
        meaning: `One who sees inaction in action, and action in inaction, is wise among humans; that person is a yogi and the doer of all actions.`,
        commentary: `Recognizing the silent Witness consciousness while bodily actions happen is the pinnacle of Advaita wisdom.`,
        source: "Bhagavad Gita",
      });
    }

    // Record progress reading position (Phase 26)
    progressService.recordProgress(
      verseId,
      {
        contentType: "verse",
        scriptureId: "bhagavad_gita",
        scriptureTitle: "Bhagavad Gita",
        chapterId: "ch_2",
        chapterTitle: "Chapter 2 · Sankhya Yoga",
        verseId,
        verseTitle: `Bhagavad Gita ${verseId.replace("bg_", "").replace("_", ".")}`,
        progressPercent: 62,
        status: "IN_PROGRESS",
      },
      true
    );

    setSubScreen("verse");
  };

  const handleToggleSave = () => {
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
    const newRef = {
      id: "ref-" + Date.now(),
      verseRef: selectedVerseData.title.replace("Bhagavad Gita ", "Gita "),
      text: currentReflectionText.trim(),
      date: "Today",
    };
    setReflections((prev) => [newRef, ...prev]);
    setCurrentReflectionText("");
    setReflectionSavedMessage(true);
    setTimeout(() => setReflectionSavedMessage(false), 2500);
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
    setIsPlaying(true);
  };

  // Theme-driven CSS class tokens
  const isSandstone = theme === "sandstone";

  // Dynamic Theme Color Mapping
  const themeBg = isSandstone ? "bg-[#120A04]" : "bg-[#0F0A1A]";
  const themeCardBg = isSandstone ? "bg-[#F7EDDB]" : "bg-[#F8F2E8]";
  const themeCardDark = isSandstone
    ? "bg-gradient-to-br from-[#2e1608] to-[#1c0c04] border border-[#E8921A]/20"
    : "bg-gradient-to-br from-[#241540] to-[#160e28] border border-[#E8A93E]/20";
  const themeGold = isSandstone ? "#E8921A" : "#E8A93E";
  const themeGoldLight = isSandstone ? "#F4B84A" : "#F4CB7A";
  const themeIvory = isSandstone ? "#F7EDDB" : "#F8F2E8";
  const themeMist = isSandstone ? "#C4A882" : "#C5B5D4";

  return (
    <div
      className={`min-h-screen ${themeBg} text-[${themeIvory}] font-sans relative flex justify-center selection:bg-amber-500/30 selection:text-amber-200 transition-colors duration-300`}
      style={{
        color: themeIvory,
      }}
    >
      {/* Background Radial Aura */}
      <div
        className="fixed inset-0 pointer-events-none z-0 max-w-[430px] mx-auto"
        style={{
          background: isSandstone
            ? `radial-gradient(ellipse at 18% 0%, rgba(120,48,12,0.75) 0%, transparent 55%),
               radial-gradient(ellipse at 88% 90%, rgba(100,30,10,0.6) 0%, transparent 50%),
               radial-gradient(ellipse at 50% 45%, rgba(60,20,5,0.3) 0%, transparent 70%)`
            : `radial-gradient(ellipse at 18% 0%, rgba(74,34,100,0.7) 0%, transparent 55%),
               radial-gradient(ellipse at 88% 90%, rgba(90,24,46,0.5) 0%, transparent 50%)`,
        }}
      />

      {/* Main Container constrained to Mobile viewport specification (max-width: 430px) */}
      <div className="w-full max-w-[430px] min-h-screen relative z-10 flex flex-col pb-24 shadow-2xl">
        {/* ════════════ ONBOARDING SCREEN ════════════ */}
        {!onboardingDone && (
          <div className="fixed inset-0 max-w-[430px] mx-auto z-50 bg-[#120A04] flex flex-col justify-between p-6 pt-12 overflow-y-auto">
            <div className="space-y-6 text-center">
              {/* Sacred Om */}
              <span
                className="font-sanskrit text-6xl text-amber-400 block transition-transform hover:scale-105"
                style={{
                  color: themeGoldLight,
                  textShadow: `0 4px 28px ${themeGold}80, 0 0 60px ${themeGold}40`,
                }}
              >
                ॐ
              </span>
              <div>
                <h1 className="font-serif-sacred text-3xl font-bold text-stone-100 tracking-tight">
                  SutraSparsh
                </h1>
                <p className="text-sm mt-1" style={{ color: themeMist }}>
                  Ancient wisdom, made personal.
                </p>
              </div>

              <div className="pt-4 text-left">
                <p className="font-serif-sacred text-lg font-semibold text-stone-200 mb-4 text-center">
                  What brings you here?
                </p>
                <div className="space-y-2.5">
                  {[
                    { icon: "🌅", text: "Daily wisdom & reflection" },
                    { icon: "📖", text: "Learn the scriptures deeply" },
                    { icon: "🔍", text: "Find answers to a question" },
                    { icon: "🧘", text: "Build a reading practice" },
                    { icon: "🕉️", text: "Explore Sanskrit & meaning" },
                  ].map((opt, idx) => {
                    const isSel = selectedOnboardingOptions.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleOnboardingOpt(idx)}
                        className={`flex items-center space-x-3.5 p-3.5 rounded-2xl cursor-pointer transition-all border ${
                          isSel
                            ? "bg-amber-500/10 border-amber-500/40 text-stone-100"
                            : "bg-stone-900/40 border-stone-800/80 text-stone-300 hover:bg-stone-800/40"
                        }`}
                      >
                        <span className="text-xl w-7 text-center">{opt.icon}</span>
                        <span className="text-sm font-semibold flex-1">
                          {opt.text}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-colors ${
                            isSel
                              ? "bg-amber-500 border-amber-500 text-stone-950 font-bold"
                              : "border-stone-700 bg-transparent"
                          }`}
                        >
                          {isSel ? "✓" : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <button
                onClick={handleStartApp}
                className="w-full py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <span>→</span>
              </button>
              <button
                onClick={handleStartApp}
                className="w-full text-center text-xs font-semibold py-2 transition-colors"
                style={{ color: themeMist }}
              >
                Skip and explore
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
          </div>

          <div className="flex items-center space-x-2">
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

            {/* Notifications / Bells */}
            <button
              onClick={() => alert(`🔔 Daily Shloka reminders are set for ${prefReminder} IST.`)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-200 transition-colors"
            >
              <Bell className="w-4 h-4" />
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
              <p className="text-xs mt-1" style={{ color: themeMist }}>
                Day 12 of your spiritual journey
              </p>
            </div>

            {/* Today's Wisdom Card */}
            <div className={`mx-4 p-6 rounded-3xl ${themeCardDark} space-y-4 shadow-xl`}>
              <div className="flex items-center space-x-2">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  TODAY'S WISDOM
                </span>
              </div>

              {/* Sacred Sanskrit Verse */}
              <div className="font-sanskrit text-xl leading-[2.1] text-stone-100 text-center py-1">
                कर्मण्येवाधिकारस्ते<br />
                मा फलेषु कदाचन।<br />
                मा कर्मफलहेतुर्भूर्मा ते<br />
                संगोऽस्त्वकर्मणि॥
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

              {/* English Meaning */}
              <p
                className="text-xs italic leading-relaxed text-center"
                style={{ color: themeMist }}
              >
                "You have a right only to action, never to its fruits. Let not the fruits of action be your motive, nor let your attachment be to inaction."
              </p>

              {/* Reference */}
              <div
                className="text-[11.5px] font-bold flex items-center space-x-2 pt-1"
                style={{ color: themeGoldLight }}
              >
                <div
                  className="w-4 h-[1px]"
                  style={{ backgroundColor: themeGold }}
                />
                <span>Bhagavad Gita · Chapter 2, Verse 47</span>
              </div>

              {/* Buttons */}
              <div className="flex space-x-2.5 pt-2">
                <button
                  onClick={() => openVerseScreen("bg_2_47")}
                  className="flex-1 py-2.5 rounded-full font-bold text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow hover:scale-[1.02] transition-transform text-center"
                >
                  Read Shloka
                </button>
                <button
                  onClick={handleStartListen}
                  className="flex-1 py-2.5 rounded-full font-bold text-xs bg-white/10 hover:bg-white/15 text-stone-200 border border-white/10 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
                <button
                  onClick={handleOpenShare}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 text-stone-200 flex items-center justify-center transition-colors"
                  title="Share Shloka"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Streak Bar */}
            <div className="px-5 flex items-center space-x-2.5">
              <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300">
                <span>🔥</span>
                <span>12-day streak</span>
              </div>
              <span className="text-xs" style={{ color: themeMist }}>
                Keep it going!
              </span>
            </div>

            {/* CONTINUE YOUR JOURNEY (Phase 26 M53-M74) */}
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
                onClick={() => setSubScreen("scripture")}
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

            {/* EXPLORE WISDOM FROM */}
            <div className="px-4 space-y-2.5 pt-2">
              <div className="px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  EXPLORE WISDOM FROM
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "📗 Bhagavad Gita", action: () => setSubScreen("scripture") },
                  { label: "📜 Upanishads", action: () => setActiveTab("explore") },
                  { label: "🏹 Ramayana", action: () => setActiveTab("explore") },
                  { label: "⚔️ Mahabharata", action: () => setActiveTab("explore") },
                  { label: "🧘 Yoga Sutras", action: () => setActiveTab("explore") },
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
                Explore
              </h2>
              <button
                onClick={() => setActiveTab("search")}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
              >
                <Search className="w-4 h-4 text-stone-200" />
              </button>
            </div>

            {/* Search Bar Input */}
            <div className="px-4">
              <div
                onClick={() => setActiveTab("search")}
                className="flex items-center space-x-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer"
              >
                <Search className="w-4 h-4 text-stone-400" />
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
                  onClick={() => setSubScreen("scripture")}
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{ background: "linear-gradient(145deg, #fdf0d0, #f5e0a0)" }}
                >
                  <span className="text-2xl block mb-1.5">📚</span>
                  <div className="text-xs font-bold text-stone-950">Scriptures</div>
                  <div className="text-[10.5px] text-stone-700">Gita, Upanishads & more</div>
                </div>

                <div
                  onClick={() => setActiveTab("search")}
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{ background: "linear-gradient(145deg, #fad8ce, #f4b09a)" }}
                >
                  <span className="text-2xl block mb-1.5">🏷️</span>
                  <div className="text-xs font-bold text-stone-950">Topics</div>
                  <div className="text-[10.5px] text-stone-700">Karma, Dharma, Bhakti…</div>
                </div>

                <div
                  onClick={() => setSubScreen("scripture")}
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{ background: "linear-gradient(145deg, #c6ede0, #96d8c2)" }}
                >
                  <span className="text-2xl block mb-1.5">🗂️</span>
                  <div className="text-xs font-bold text-stone-950">Collections</div>
                  <div className="text-[10.5px] text-stone-700">Curated readings</div>
                </div>

                <div
                  onClick={() => setActiveTab("search")}
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{ background: "linear-gradient(145deg, #f5e4c8, #e8c88a)" }}
                >
                  <span className="text-2xl block mb-1.5">🕉️</span>
                  <div className="text-xs font-bold text-stone-950">Traditions</div>
                  <div className="text-[10.5px] text-stone-700">Vedanta, Yoga, Tantra…</div>
                </div>

                <div
                  onClick={() => setActiveTab("search")}
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{ background: "linear-gradient(145deg, #d8eee8, #b0d8ca)" }}
                >
                  <span className="text-2xl block mb-1.5">✍️</span>
                  <div className="text-xs font-bold text-stone-950">Authors</div>
                  <div className="text-[10.5px] text-stone-700">Shankara, Ramanuja…</div>
                </div>

                <div
                  onClick={() => setSubScreen("paths")}
                  className="p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{ background: "linear-gradient(145deg, #deecd8, #b8d8a8)" }}
                >
                  <span className="text-2xl block mb-1.5">🛤️</span>
                  <div className="text-xs font-bold text-stone-950">Paths</div>
                  <div className="text-[10.5px] text-stone-700">Guided journeys</div>
                </div>
              </div>
            </div>

            {/* FEATURED SCRIPTURES */}
            <div className="px-4 space-y-3">
              <div className="px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  FEATURED SCRIPTURES
                </span>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {["All", "Vedas", "Upanishads", "Itihasa", "Puranas", "Darshana", "Stotra"].map(
                  (pill) => (
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
                  )
                )}
              </div>

              {/* Scriptures List */}
              <div className="rounded-3xl bg-stone-900/60 border border-amber-500/20 overflow-hidden divide-y divide-white/5">
                {[
                  {
                    icon: "गी",
                    name: "Bhagavad Gita",
                    meta: "18 Chapters · 700 Verses · Itihasa",
                    prog: 62,
                    action: () => setSubScreen("scripture"),
                  },
                  {
                    icon: "ई",
                    name: "Isha Upanishad",
                    meta: "1 Chapter · 18 Mantras · Upanishads",
                    prog: 0,
                    action: () => openVerseScreen("bg_2_47"),
                  },
                  {
                    icon: "यो",
                    name: "Yoga Sutras of Patanjali",
                    meta: "4 Chapters · 196 Sutras · Darshana",
                    prog: 12,
                    action: () => openVerseScreen("bg_2_50"),
                  },
                  {
                    icon: "वि",
                    name: "Vivekachudamani",
                    meta: "1 Chapter · 580 Verses · Vedanta",
                    prog: 0,
                    action: () => openVerseScreen("bg_3_19"),
                  },
                  {
                    icon: "म",
                    name: "Mandukya Upanishad",
                    meta: "1 Chapter · 12 Mantras · Upanishads",
                    prog: 0,
                    action: () => openVerseScreen("bg_4_18"),
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={item.action}
                    className="p-4 flex items-center space-x-3.5 cursor-pointer hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-sanskrit text-xl text-amber-300 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-stone-100 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-stone-400 truncate mt-0.5">
                        {item.meta}
                      </div>
                      <div className="w-full bg-stone-800 h-1 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                          style={{ width: `${item.prog}%` }}
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
                Search
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
                  placeholder="What are you seeking?"
                  className="flex-1 bg-transparent text-xs text-stone-100 placeholder-stone-500 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-stone-500 hover:text-stone-300 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Mode Toggle: Find Text vs Search by Meaning */}
              <div className="flex p-1 rounded-xl bg-white/5 border border-white/5">
                <button
                  onClick={() => setSearchMode("text")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    searchMode === "text"
                      ? "bg-amber-500/20 text-amber-300"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Find text
                </button>
                <button
                  onClick={() => setSearchMode("meaning")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    searchMode === "meaning"
                      ? "bg-amber-500/20 text-amber-300"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Search by meaning
                </button>
              </div>
            </div>

            {/* Meaning Hint Banner */}
            <div className="px-4">
              <div className="p-3.5 rounded-2xl bg-[#2A7A6A]/15 border border-[#2A7A6A]/30 flex items-start space-x-3">
                <span className="text-xl">💡</span>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-stone-100">
                    Search by meaning
                  </div>
                  <div className="text-[11px] leading-relaxed text-stone-300">
                    Try "I am struggling with attachment" or "What does the Gita say about fear?"
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Searches */}
            <div className="px-4 space-y-2">
              <div className="px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  RECENT
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["karma", "dharma", "meditation", "detachment"].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(chip)}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-stone-300 hover:bg-white/10 transition-colors flex items-center space-x-1.5"
                  >
                    <span>🕐</span>
                    <span>{chip}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Topics */}
            <div className="px-4 space-y-2">
              <div className="px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  POPULAR TOPICS
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Dharma",
                  "Karma",
                  "Bhakti",
                  "Jnana",
                  "Detachment",
                  "Meditation",
                  "Self-knowledge",
                  "Maya",
                  "Moksha",
                  "Ahimsa",
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

            {/* Traditions */}
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
                    sub: "Non-dual philosophy · Shankara",
                    action: () => openVerseScreen("bg_4_18"),
                  },
                  {
                    icon: "🏹",
                    title: "Vaishnava",
                    sub: "Bhakti traditions · Ramanuja",
                    action: () => openVerseScreen("bg_2_47"),
                  },
                  {
                    icon: "🧘",
                    title: "Raja Yoga",
                    sub: "Patanjali's eight limbs",
                    action: () => openVerseScreen("bg_2_50"),
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
          </div>
        )}

        {/* 4. JOURNEY SCREEN */}
        {activeTab === "journey" && subScreen === "none" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header */}
            <div className="px-5 pt-2 flex items-center justify-between">
              <div>
                <h2 className="font-serif-sacred text-2xl font-bold text-stone-100">
                  Your Journey
                </h2>
                <p className="text-xs mt-0.5" style={{ color: themeMist }}>
                  You've returned 8 times this month. Keep going.
                </p>
              </div>
              <button
                onClick={() => setSubScreen("pref")}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-stone-300"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2.5 px-4">
              <div
                className="p-3.5 rounded-2xl text-center"
                style={{ background: "linear-gradient(145deg, #fdf0d0, #f5e0a0)" }}
              >
                <div className="font-serif-sacred text-2xl font-bold text-amber-700 leading-none">
                  12
                </div>
                <div className="text-[10.5px] font-bold text-stone-900 mt-1">
                  Day streak
                </div>
              </div>

              <div
                className="p-3.5 rounded-2xl text-center"
                style={{ background: "linear-gradient(145deg, #fad8ce, #f4b09a)" }}
              >
                <div className="font-serif-sacred text-2xl font-bold text-rose-800 leading-none">
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
                <div className="font-serif-sacred text-2xl font-bold text-teal-800 leading-none">
                  {reflections.length}
                </div>
                <div className="text-[10.5px] font-bold text-stone-900 mt-1">
                  Reflections
                </div>
              </div>
            </div>

            {/* Continue Section */}
            <div className="px-4 space-y-2">
              <div className="px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  CONTINUE
                </span>
              </div>
              <div
                onClick={() => setSubScreen("scripture")}
                className="p-4 rounded-2xl bg-stone-900/60 border border-amber-500/20 cursor-pointer flex items-center space-x-3.5"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center text-xl flex-shrink-0">
                  📗
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-stone-100">
                    Bhagavad Gita
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Chapter 4 · Verse 12 · up next
                  </div>
                  <div className="w-full bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      style={{ width: "62%" }}
                    />
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </div>
            </div>

            {/* SAVED WISDOM LIST */}
            <div className="px-4 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  SAVED WISDOM
                </span>
                <span className="text-xs font-bold text-stone-400">
                  View all {savedVerses.length} →
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

            {/* MY REFLECTIONS */}
            <div className="px-4 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  MY REFLECTIONS
                </span>
              </div>
              {reflections.map((ref) => (
                <div
                  key={ref.id}
                  className="p-4 rounded-2xl"
                  style={{ background: themeCardBg, color: "#2B1A08" }}
                >
                  <div className="text-[11px] font-bold text-amber-800 mb-1">
                    {ref.date} · {ref.verseRef}
                  </div>
                  <div className="text-xs leading-relaxed italic text-stone-800">
                    "{ref.text}"
                  </div>
                </div>
              ))}
            </div>

            {/* RECENTLY READ TIMELINE */}
            <div className="px-4 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  RECENTLY READ
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-900/60 border border-white/5 divide-y divide-white/5">
                {[
                  { day: "TODAY", title: "Bhagavad Gita", ref: "Chapter 2 · Verse 47", action: () => openVerseScreen("bg_2_47") },
                  { day: "YEST.", title: "Bhagavad Gita", ref: "Chapter 2 · Verse 20", action: () => openVerseScreen("bg_2_47") },
                  { day: "YEST.", title: "Bhagavad Gita", ref: "Chapter 3 · Verse 19", action: () => openVerseScreen("bg_3_19") },
                  { day: "MON", title: "Isha Upanishad", ref: "Mantra 1", action: () => openVerseScreen("bg_2_47") },
                ].map((h, idx) => (
                  <div
                    key={idx}
                    onClick={h.action}
                    className="py-2.5 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition-colors px-1"
                  >
                    <span className="text-[10px] font-extrabold tracking-wider text-stone-500 w-12">
                      {h.day}
                    </span>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-stone-200">
                        {h.title}
                      </div>
                      <div
                        className="text-[10.5px] font-bold mt-0.5"
                        style={{ color: themeGoldLight }}
                      >
                        {h.ref}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. MORE SCREEN */}
        {activeTab === "more" && subScreen === "none" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="px-5 pt-2">
              <h2 className="font-serif-sacred text-2xl font-bold text-stone-100">
                More
              </h2>
            </div>

            {/* Profile Bar */}
            <div className="px-5 flex items-center space-x-3.5 py-3 border-b border-white/5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl flex-shrink-0">
                🙏
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-stone-100">
                  Guest Sādhaka
                </div>
                <div className="text-xs text-stone-400">
                  Sign in to sync across devices
                </div>
              </div>
              <button
                onClick={() => alert("Sign in modal / Google Auth triggered")}
                className="text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                Sign in
              </button>
            </div>

            {/* LEARN */}
            <div className="space-y-1">
              <div className="px-5 text-[10.5px] font-extrabold tracking-widest uppercase text-stone-500">
                LEARN
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
                  Start a Guided Path
                </span>
                <ChevronRight className="w-4 h-4 text-stone-500" />
              </div>
            </div>

            {/* YOUR ACCOUNT */}
            <div className="space-y-1">
              <div className="px-5 text-[10.5px] font-extrabold tracking-widest uppercase text-stone-500">
                YOUR ACCOUNT
              </div>
              <div
                onClick={() => setSubScreen("pref")}
                className="px-5 py-3.5 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
              >
                <span className="text-base">⚙️</span>
                <span className="text-xs font-semibold text-stone-200 flex-1">
                  Preferences & Themes
                </span>
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

        {/* ════════════ SUB-SCREEN 1: SCRIPTURE DETAIL ════════════ */}
        {subScreen === "scripture" && (
          <div
            className="fixed inset-0 max-w-[430px] mx-auto z-40 flex flex-col overflow-y-auto animate-fadeIn"
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
              <span className="font-bold text-sm text-stone-100">
                Bhagavad Gita
              </span>
              <button className="text-stone-400 p-1">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Scripture Hero */}
            <div className="p-6 border-b border-amber-500/10 space-y-4">
              <h1 className="font-serif-sacred text-3xl font-bold text-stone-100">
                Bhagavad Gita
              </h1>
              <p className="text-xs leading-relaxed" style={{ color: themeMist }}>
                The eternal dialogue between Krishna and Arjuna on the battlefield of Kurukshetra — a 700-verse synthesis of duty, devotion, knowledge, and liberation.
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  Itihasa
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  Sanskrit
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/10 border border-teal-500/20 text-teal-300">
                  English · Hindi
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-300">
                  Commentary available
                </span>
              </div>

              {/* Stats */}
              <div className="flex space-x-6 pt-2">
                <div>
                  <div className="font-serif-sacred text-xl font-bold text-amber-400">
                    18
                  </div>
                  <div className="text-[10.5px] font-bold text-stone-400">
                    Chapters
                  </div>
                </div>
                <div>
                  <div className="font-serif-sacred text-xl font-bold text-amber-400">
                    700
                  </div>
                  <div className="text-[10.5px] font-bold text-stone-400">
                    Verses
                  </div>
                </div>
                <div>
                  <div className="font-serif-sacred text-xl font-bold text-amber-400">
                    3
                  </div>
                  <div className="text-[10.5px] font-bold text-stone-400">
                    Translations
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-bold text-stone-400">
                  <span>Your progress</span>
                  <span className="text-amber-400">62% · 266 verses</span>
                </div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    style={{ width: "62%" }}
                  />
                </div>
              </div>

              <button
                onClick={() => openVerseScreen("bg_2_47")}
                className="w-full py-3 rounded-full font-bold text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow"
              >
                Continue reading →
              </button>
            </div>

            {/* Chapters List */}
            <div className="p-4 space-y-2">
              <div className="px-2">
                <span
                  className="text-[10.5px] font-extrabold tracking-widest uppercase"
                  style={{ color: themeGoldLight }}
                >
                  CHAPTERS
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {[
                  { num: 1, name: "Arjuna Vishada Yoga", sub: "47 verses · The grief of Arjuna", current: false },
                  { num: 2, name: "Sankhya Yoga", sub: "72 verses · You are here · Verse 47", current: true },
                  { num: 3, name: "Karma Yoga", sub: "43 verses · The path of action", current: false },
                  { num: 4, name: "Jnana Karma Sanyasa Yoga", sub: "42 verses · Knowledge and renunciation", current: false },
                  { num: 5, name: "Karma Vairagya Yoga", sub: "29 verses · Renunciation of action", current: false },
                  { num: 6, name: "Dhyana Yoga", sub: "47 verses · Meditation", current: false },
                ].map((ch) => (
                  <div
                    key={ch.num}
                    onClick={() => openVerseScreen("bg_2_47")}
                    className={`py-3.5 px-2 flex items-center space-x-3.5 cursor-pointer rounded-xl ${
                      ch.current ? "bg-amber-500/10 text-amber-300" : "hover:bg-white/5"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        ch.current
                          ? "bg-amber-500/30 border-amber-400 text-amber-200"
                          : "bg-white/5 border-white/10 text-stone-300"
                      }`}
                    >
                      {ch.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs font-bold truncate ${
                          ch.current ? "text-amber-300" : "text-stone-200"
                        }`}
                      >
                        {ch.name}
                      </div>
                      <div className="text-[11px] text-stone-400 truncate mt-0.5">
                        {ch.sub}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ SUB-SCREEN 2: VERSE DETAIL ════════════ */}
        {subScreen === "verse" && (
          <div
            className="fixed inset-0 max-w-[430px] mx-auto z-40 flex flex-col overflow-y-auto animate-fadeIn pb-20"
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
              <span className="font-bold text-sm text-stone-100">
                Chapter {selectedVerseData.chapterNum} · Verse {selectedVerseData.verseNum}
              </span>
              <button
                onClick={handleOpenShare}
                className="text-stone-300 p-1"
                title="Share this verse"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Verse Hero Card */}
            <div className="p-6 text-center space-y-3">
              <div
                className="text-[10.5px] font-extrabold tracking-widest uppercase"
                style={{ color: themeGoldLight }}
              >
                {selectedVerseData.source.toUpperCase()} · CHAPTER {selectedVerseData.chapterNum}
              </div>
              <div
                className="font-serif-sacred italic text-sm"
                style={{ color: themeMist }}
              >
                {selectedVerseData.chapterName}
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
              <div className="font-sanskrit text-2xl leading-[2.1] text-stone-100 py-2">
                {selectedVerseData.sanskrit.split("\n").map((line, idx) => (
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
            </div>

            {/* TRANSLITERATION */}
            <div className="px-6 py-4 border-t border-white/5 space-y-2">
              <div
                className="text-[10.5px] font-extrabold tracking-widest uppercase"
                style={{ color: themeGoldLight }}
              >
                TRANSLITERATION
              </div>
              <div
                className="text-xs italic leading-relaxed font-mono whitespace-pre-line"
                style={{ color: themeMist }}
              >
                {selectedVerseData.transliteration}
              </div>
            </div>

            {/* MEANING */}
            <div className="px-6 py-4 border-t border-white/5 space-y-2">
              <div
                className="text-[10.5px] font-extrabold tracking-widest uppercase"
                style={{ color: themeGoldLight }}
              >
                MEANING
              </div>
              <div className="text-sm font-medium leading-relaxed text-stone-100">
                {selectedVerseData.meaning}
              </div>
            </div>

            {/* COMMENTARY */}
            <div className="px-6 py-4 border-t border-white/5 space-y-2">
              <div
                className="text-[10.5px] font-extrabold tracking-widest uppercase"
                style={{ color: themeGoldLight }}
              >
                COMMENTARY
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
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center space-y-1"
              >
                <Volume2 className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] font-bold text-stone-300">Listen</span>
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
                onClick={() => alert("Context: Battlefield of Kurukshetra — dialogue before the Great War.")}
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
                REFLECT
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
                  Save reflection
                </button>
                {reflectionSavedMessage && (
                  <span className="text-xs text-emerald-400 font-semibold animate-fadeIn">
                    ✓ Saved to Your Journey!
                  </span>
                )}
              </div>
            </div>

            {/* RELATED WISDOM */}
            <div className="px-6 py-4 border-t border-white/5 space-y-2.5">
              <div
                className="text-[10.5px] font-extrabold tracking-widest uppercase"
                style={{ color: themeGoldLight }}
              >
                RELATED WISDOM
              </div>
              <div className="space-y-2">
                {[
                  { ref: "Gita 2.50", snippet: "योगः कर्मसु कौशलम्…", id: "bg_2_50" },
                  { ref: "Gita 3.19", snippet: "तस्मादसक्तः सततं…", id: "bg_3_19" },
                  { ref: "Gita 4.18", snippet: "कर्मण्यकर्म यः पश्येत्…", id: "bg_4_18" },
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
                  {/* Active Indicator Ribbon */}
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

                      {/* Swatch dots */}
                      <div className="flex items-center space-x-2 mt-3">
                        <div className="flex -space-x-1">
                          <span className="w-4 h-4 rounded-full bg-[#120A04] border border-amber-500/40 shadow-sm" title="#120A04 Base" />
                          <span className="w-4 h-4 rounded-full bg-[#78300C] border border-amber-500/40 shadow-sm" title="#78300C Terracotta" />
                          <span className="w-4 h-4 rounded-full bg-[#E8921A] border border-amber-500/40 shadow-sm" title="#E8921A Gold" />
                          <span className="w-4 h-4 rounded-full bg-[#F7EDDB] border border-amber-500/40 shadow-sm" title="#F7EDDB Ivory" />
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">Terracotta & Gold</span>
                      </div>
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
                  {/* Active Indicator Ribbon */}
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

                      {/* Swatch dots */}
                      <div className="flex items-center space-x-2 mt-3">
                        <div className="flex -space-x-1">
                          <span className="w-4 h-4 rounded-full bg-[#0F0A1A] border border-purple-400/40 shadow-sm" title="#0F0A1A Base" />
                          <span className="w-4 h-4 rounded-full bg-[#4A2264] border border-purple-400/40 shadow-sm" title="#4A2264 Violet" />
                          <span className="w-4 h-4 rounded-full bg-[#E8A93E] border border-purple-400/40 shadow-sm" title="#E8A93E Amber" />
                          <span className="w-4 h-4 rounded-full bg-[#F8F2E8] border border-purple-400/40 shadow-sm" title="#F8F2E8 Moonlit" />
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">Violet & Celestial Gold</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* LocalStorage Persistence Confirmation Box */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-emerald-500/30 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-emerald-300">Persistent Storage Active</div>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    Saved in <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300 font-mono">localStorage("sutrasparsh_theme")</code> as <strong className="text-stone-100 font-semibold">"{theme}"</strong>. Your choice remains active when you return or refresh.
                  </p>
                </div>
              </div>

              {/* Live Shloka Preview Sandbox */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10.5px] font-extrabold tracking-widest uppercase"
                    style={{ color: themeGoldLight }}
                  >
                    LIVE PREVIEW SANDBOX
                  </span>
                  <span className="text-[10.5px] text-stone-400">
                    Theme: {isSandstone ? "Sandstone" : "Amethyst"}
                  </span>
                </div>

                <div className={`p-4 rounded-2xl ${themeCardDark} space-y-2.5 transition-all duration-300 shadow-md`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold" style={{ color: themeGoldLight }}>
                      Gita 2.47 · Sankhya Yoga
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-stone-200">
                      Sample Card
                    </span>
                  </div>

                  <div className="font-sanskrit text-sm leading-relaxed text-stone-100 text-center py-1">
                    कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।
                  </div>

                  <div className="flex items-center space-x-2 py-0.5">
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeGold }} />
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                  </div>

                  <p className="text-[11px] text-center italic" style={{ color: themeMist }}>
                    "You have a right only to action, never to its fruits."
                  </p>
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

                {/* Script Display Options */}
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
                      <div className="text-[10.5px] text-stone-400">Pace of audio chanting</div>
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

                {/* Daily Brahma Muhurta Reminder */}
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
                        onClick={() => setPrefReminder(item.time)}
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
                SutraSparsh
              </h1>
              <p className="text-xs leading-relaxed text-left text-stone-300" style={{ color: themeMist }}>
                SutraSparsh is a digital sanctuary engineered to bring the timeless wisdom of ancient Sanskrit scriptures—the Bhagavad Gita, Upanishads, Patanjali Yoga Sutras, and Ashtavakra Gita—directly into modern contemplative daily life.
              </p>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left space-y-2">
                <div className="text-xs font-bold text-amber-300">Core Principles:</div>
                <ul className="text-xs space-y-1.5 text-stone-300 list-disc list-inside">
                  <li>Living Shloka philosophy (practical daily reflection)</li>
                  <li>Pure Sanskrit typography with IAST romanization</li>
                  <li>Traditional authentic lineage commentaries</li>
                  <li>High-contrast contemplative color palettes</li>
                </ul>
              </div>

              <div className="text-[11px] text-stone-500 pt-4">
                Version 2.4.0 · Sandstone & Amethyst Engine
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
                { term: "Dharma (धर्म)", root: "√dhṛ (to hold, support, sustain)", meaning: "Cosmic order, sacred duty, righteous living, that which upholds truth." },
                { term: "Karma (कर्म)", root: "√kṛ (to do, perform, act)", meaning: "Action, deeds, cause and effect, purposeful intentional effort." },
                { term: "Yoga (योग)", root: "√yuj (to yoke, unite, join)", meaning: "Union of individual consciousness with universal divine truth." },
                { term: "Atman (आत्मन्)", root: "√an (to breathe, live)", meaning: "The immortal inner Self, unchanging consciousness beyond the body and mind." },
                { term: "Brahman (ब्रह्मन्)", root: "√bṛh (to expand, grow)", meaning: "The ultimate, transcendent, infinite reality underlying the cosmos." },
                { term: "Moksha (मोक्ष)", root: "√muc (to release, set free)", meaning: "Liberation from the cycle of rebirth and suffering." },
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
                { title: "Karma Yoga Track", sub: "The Path of Selfless Action", verses: "14 Verses · 7 Days", icon: "⚖️" },
                { title: "Jnana Yoga Track", sub: "The Path of Discrimination & Wisdom", verses: "21 Verses · 14 Days", icon: "🕯️" },
                { title: "Bhakti Yoga Track", sub: "The Path of Loving Devotion", verses: "18 Verses · 10 Days", icon: "🪷" },
                { title: "Dhyana Yoga Track", sub: "The Path of Meditation & Equanimity", verses: "12 Verses · 6 Days", icon: "🧘" },
              ].map((track, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSubScreen("verse");
                  }}
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
              onClick={() => setIsPlaying(!isPlaying)}
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
                  0:{audioProgress.toString().padStart(2, "0")}
                </span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${(audioProgress / audioDuration) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
                  0:{audioDuration}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setPlayerVisible(false);
                setIsPlaying(false);
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

        {/* ════════════ SOCIAL SHARING MODAL (Phase 25) ════════════ */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          content={shareableContent}
        />
      </div>
    </div>
  );
};
