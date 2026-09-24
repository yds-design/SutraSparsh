import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Layers,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { WordExplorerService, VERIFIED_SANSKRIT_WORDS } from "../services/wordExplorer.service";
import { ModalPortal } from "../../../components/ModalPortal";
import type { SanskritWord } from "../types/wordExplorer.types";
import { VERSES_DATABASE, type DetailedVerse } from "../../../data/scriptureCorpus";
import type { ContentItem } from "../../../types";

interface LookCloserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWordExplorer: (word: SanskritWord) => void;
  verse?: DetailedVerse | ContentItem | null;
  targetWord?: SanskritWord | string;
  theme?: string;
}

export const LookCloserModal: React.FC<LookCloserModalProps> = ({
  isOpen,
  onClose,
  onOpenWordExplorer,
  verse,
  targetWord,
  theme = "sandstone",
}) => {
  const [currentScene, setCurrentScene] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedCompIndex, setSelectedCompIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isLight = theme === "light" || theme === "prism-pulse";
  const isAmethyst = theme === "amethyst";
  const isFestival = theme === "festival";
  const isGoldenHour = theme === "golden-hour";

  // Active verse selection
  const activeVerse: {
    id: string;
    source: string;
    title: string;
    sanskrit: string;
    transliteration: string;
    meaning: string;
    hindiMeaning?: string;
  } = useMemo(() => {
    if (verse) {
      if ("sanskrit" in verse) {
        return {
          id: verse.id,
          source: verse.source,
          title: verse.title,
          sanskrit: verse.sanskrit,
          transliteration: verse.transliteration,
          meaning: verse.meaning,
          hindiMeaning: verse.hindiMeaning,
        };
      }
      return {
        id: verse.id,
        source: verse.metadata?.source || "Bhagavad Gita",
        title: verse.title,
        sanskrit: verse.body,
        transliteration: verse.transliteration || "",
        meaning: verse.meaning || "",
        hindiMeaning: "",
      };
    }
    const defaultV = VERSES_DATABASE["bg_18_65"] || VERSES_DATABASE["bg_2_47"];
    return {
      id: defaultV.id,
      source: defaultV.source,
      title: defaultV.title,
      sanskrit: defaultV.sanskrit,
      transliteration: defaultV.transliteration,
      meaning: defaultV.meaning,
      hindiMeaning: defaultV.hindiMeaning,
    };
  }, [verse]);

  // Dynamically resolve flagship word for this verse
  const flagshipWord: SanskritWord = useMemo(() => {
    if (targetWord) {
      if (typeof targetWord === "object" && targetWord !== null) {
        return targetWord;
      }
      const resolved = WordExplorerService.getWordBySurfaceSync(targetWord, activeVerse);
      if (resolved) return resolved;
    }

    // Verse-specific curated flagship focal terms
    if (activeVerse.id === "bg_18_65") {
      return (
        VERIFIED_SANSKRIT_WORDS["man-mana-bhava-madbhakto"] ||
        WordExplorerService.getWordBySurfaceSync("मन्मना भव मद्भक्तो", activeVerse) ||
        VERIFIED_SANSKRIT_WORDS["manmana"]
      );
    }

    if (activeVerse.id === "bg_2_47") {
      return VERIFIED_SANSKRIT_WORDS["karmany-evadhikaraste"];
    }

    if (activeVerse.id === "bg_2_50") {
      return (
        VERIFIED_SANSKRIT_WORDS["yogah-karmasu-kausalam"] ||
        WordExplorerService.getWordBySurfaceSync("योगः कर्मसु कौशलम्", activeVerse)
      );
    }

    if (activeVerse.id === "bg_18_66") {
      return (
        VERIFIED_SANSKRIT_WORDS["sarvadharman-parityajya"] ||
        WordExplorerService.getWordBySurfaceSync("सर्वधर्मान्परित्यज्य", activeVerse)
      );
    }

    if (activeVerse.id === "ys_1_2") {
      return (
        VERIFIED_SANSKRIT_WORDS["cittavrttinirodhah"] ||
        WordExplorerService.getWordBySurfaceSync("योगश्चित्तवृत्तिनिरोधः", activeVerse)
      );
    }

    // Fallback: extract first significant token from the active verse
    const tokens = WordExplorerService.tokenizeVerse(activeVerse.sanskrit);
    const firstWordToken = tokens.find((t) => t.isWord && t.cleaned.length > 2);
    if (firstWordToken) {
      const dynamicWord = WordExplorerService.getWordBySurfaceSync(firstWordToken.cleaned, activeVerse);
      if (dynamicWord) return dynamicWord;
    }

    return VERIFIED_SANSKRIT_WORDS["karmany-evadhikaraste"];
  }, [activeVerse, targetWord]);

  // Autoplay progression sequence
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const sceneDurations = {
      1: 3400, // Scene 1: Surface translation
      2: 2600, // Scene 2: Turning point / curiosity
      3: 3400, // Scene 3: Deconstructed components
      4: 4200, // Scene 4: Deep layers
      5: 999999, // Final scene stays until action
    };

    timerRef.current = setTimeout(() => {
      setCurrentScene((prev) => {
        if (prev < 5) {
          const next = (prev + 1) as 1 | 2 | 3 | 4 | 5;
          return next;
        }
        return prev;
      });
    }, sceneDurations[currentScene]);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, isPlaying, currentScene]);

  // Reset to Scene 1 when opened or verse changes
  useEffect(() => {
    if (isOpen) {
      setCurrentScene(1);
      setIsPlaying(true);
      setSelectedCompIndex(0);
    }
  }, [isOpen, activeVerse.id]);

  if (!isOpen) return null;

  const handleNext = () => {
    setIsPlaying(false);
    if (currentScene < 5) {
      const next = (currentScene + 1) as 1 | 2 | 3 | 4 | 5;
      setCurrentScene(next);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentScene > 1) {
      const prev = (currentScene - 1) as 1 | 2 | 3 | 4 | 5;
      setCurrentScene(prev);
    }
  };

  const components = flagshipWord.components || [];
  const activeComponent = components[selectedCompIndex] || components[0] || {
    id: "comp-default",
    surfaceForm: flagshipWord.surfaceForm,
    transliteration: flagshipWord.transliteration,
    meaning: flagshipWord.generalMeaning,
    contextMeaning: flagshipWord.contextMeaning,
    type: "Sanskrit Padam",
    root: flagshipWord.root,
    grammar: flagshipWord.grammar,
  };

  const sanskritLines = activeVerse.sanskrit.split("\n").filter((l) => l.trim().length > 0);

  const getThemeClasses = () => {
    if (isLight) {
      return {
        backdrop: "bg-stone-900/60",
        container: "bg-[#FFFDF9] border border-stone-300 text-stone-900 shadow-2xl",
        glow: "bg-amber-400/10",
        headerBorder: "border-stone-200",
        headerTitle: "text-amber-900 font-bold",
        headerSub: "text-stone-600 font-serif",
        btnPause: "bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300",
        pauseIcon: "text-amber-700",
        btnClose: "text-stone-600 hover:text-stone-950 hover:bg-stone-100",
        dotActive: "w-8 bg-amber-600",
        dotPassed: "w-4 bg-amber-400",
        dotFuture: "w-3 bg-stone-300",
        sectionLabel: "text-amber-800 font-bold tracking-widest",
        heading: "text-stone-950 font-bold",
        subHeadingItalic: "text-amber-800 font-bold italic",
        cardBg: "bg-stone-50 border border-stone-200 shadow-sm",
        sanskritVerse: "text-stone-950 font-bold",
        meaningText: "text-stone-800 italic font-serif",
        meaningHindi: "text-stone-600 font-serif",
        bodyMuted: "text-stone-600",
        focalWordBadge: "bg-amber-100 text-amber-950 border border-amber-500 shadow-md ring-2 ring-amber-400/30",
        focalTranslit: "text-amber-900 italic font-serif",
        compChipActive: "bg-amber-100 border-amber-600 text-amber-950 shadow-md scale-105 font-bold",
        compChipInactive: "bg-white border-stone-300 text-stone-800 hover:border-amber-500",
        compPlus: "text-amber-700 font-bold",
        tabActive: "bg-amber-100 border-amber-600 text-amber-950 font-bold",
        tabInactive: "bg-white border-stone-200 text-stone-700 hover:text-stone-950",
        subCard: "bg-white border border-stone-200 text-stone-900 shadow-sm",
        subCardBadge: "bg-stone-100 text-stone-700 border border-stone-300",
        subCardLabel: "text-amber-800 font-bold",
        subCardValue: "text-stone-950 font-bold",
        subCardMuted: "text-stone-600",
        btnPrimary: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-xl",
        btnSecondary: "bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-semibold",
        footerBorder: "border-stone-200",
        footerCounter: "text-stone-500",
        btnPrevDisabled: "opacity-40 cursor-not-allowed border-stone-200 text-stone-400",
        btnPrevActive: "border-stone-300 text-stone-800 hover:bg-stone-100",
        btnNext: "bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-bold",
        btnExplore: "bg-amber-600 hover:bg-amber-700 text-white font-bold",
      };
    }
    if (isAmethyst) {
      return {
        backdrop: "bg-[#090312]/85",
        container: "bg-gradient-to-b from-[#1F1433] via-[#150B28] to-[#0F071D] border border-purple-500/40 text-purple-100 shadow-2xl",
        glow: "bg-purple-500/15",
        headerBorder: "border-[#52297A]/40",
        headerTitle: "text-purple-300 font-bold",
        headerSub: "text-purple-300/70 font-serif",
        btnPause: "bg-[#251740] hover:bg-[#341F59] text-purple-200 border border-[#52297A]/40",
        pauseIcon: "text-amber-300",
        btnClose: "text-purple-300 hover:text-white hover:bg-purple-900/40",
        dotActive: "w-8 bg-purple-400",
        dotPassed: "w-4 bg-purple-500/50",
        dotFuture: "w-3 bg-purple-950",
        sectionLabel: "text-purple-300 font-bold tracking-widest",
        heading: "text-purple-100 font-medium",
        subHeadingItalic: "text-amber-300 font-bold italic",
        cardBg: "bg-[#1E1138]/90 border border-[#52297A]/40 shadow-xl",
        sanskritVerse: "text-[#F3E8FF] font-medium",
        meaningText: "text-purple-200 italic font-serif",
        meaningHindi: "text-purple-300/70 font-serif",
        bodyMuted: "text-purple-300/70",
        focalWordBadge: "bg-purple-900/60 text-amber-300 border border-amber-400 ring-2 ring-amber-400/30",
        focalTranslit: "text-purple-200 italic font-serif",
        compChipActive: "bg-purple-900/80 border-amber-400 text-amber-200 shadow-md scale-105 font-bold",
        compChipInactive: "bg-[#160B2B] border-[#52297A]/40 text-purple-200 hover:border-purple-400",
        compPlus: "text-purple-400 font-bold",
        tabActive: "bg-purple-900/60 border-amber-400 text-amber-300 font-bold",
        tabInactive: "bg-[#160B2B] border-[#52297A]/40 text-purple-300/70 hover:text-purple-100",
        subCard: "bg-[#120824]/80 border border-[#52297A]/40 text-purple-100",
        subCardBadge: "bg-[#251740] text-purple-200 border border-[#52297A]/40",
        subCardLabel: "text-amber-300 font-bold",
        subCardValue: "text-purple-100 font-bold",
        subCardMuted: "text-purple-300/70",
        btnPrimary: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold shadow-xl",
        btnSecondary: "bg-[#251740] hover:bg-[#341F59] text-purple-200 border border-[#52297A]/40 font-semibold",
        footerBorder: "border-[#52297A]/40",
        footerCounter: "text-purple-400/60",
        btnPrevDisabled: "opacity-40 cursor-not-allowed border-[#52297A]/30 text-purple-400/30",
        btnPrevActive: "border-[#52297A]/50 text-purple-200 hover:bg-[#251740]",
        btnNext: "bg-purple-900/50 hover:bg-purple-900/80 border border-purple-400/40 text-purple-200 font-semibold",
        btnExplore: "bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold",
      };
    }
    if (isFestival) {
      return {
        backdrop: "bg-[#150205]/85",
        container: "bg-gradient-to-b from-[#4B0E17] via-[#38060D] to-[#250308] border border-[#FF8A00]/40 text-[#FFF6E3] shadow-2xl",
        glow: "bg-amber-500/15",
        headerBorder: "border-[#FF8A00]/30",
        headerTitle: "text-amber-300 font-bold",
        headerSub: "text-amber-200/70 font-serif",
        btnPause: "bg-[#520914] hover:bg-[#680C1A] text-amber-200 border border-[#FF8A00]/30",
        pauseIcon: "text-amber-400",
        btnClose: "text-amber-200 hover:text-white hover:bg-red-950/40",
        dotActive: "w-8 bg-amber-400",
        dotPassed: "w-4 bg-amber-500/50",
        dotFuture: "w-3 bg-red-950",
        sectionLabel: "text-amber-400 font-bold tracking-widest",
        heading: "text-[#FFF6E3] font-medium",
        subHeadingItalic: "text-amber-300 font-bold italic",
        cardBg: "bg-[#450812]/90 border border-[#FF8A00]/30 shadow-xl",
        sanskritVerse: "text-[#FFF6E3] font-medium",
        meaningText: "text-amber-100 italic font-serif",
        meaningHindi: "text-amber-200/70 font-serif",
        bodyMuted: "text-amber-200/70",
        focalWordBadge: "bg-amber-500/25 text-amber-200 border border-amber-400 ring-2 ring-amber-400/30",
        focalTranslit: "text-amber-200 italic font-serif",
        compChipActive: "bg-amber-500/30 border-amber-400 text-amber-100 shadow-md scale-105 font-bold",
        compChipInactive: "bg-[#2D040A] border-[#FF8A00]/30 text-amber-200 hover:border-amber-400",
        compPlus: "text-amber-400 font-bold",
        tabActive: "bg-amber-500/25 border-amber-400 text-amber-200 font-bold",
        tabInactive: "bg-[#2D040A] border-[#FF8A00]/30 text-amber-200/70 hover:text-white",
        subCard: "bg-[#220307]/80 border border-[#FF8A00]/30 text-amber-100",
        subCardBadge: "bg-[#520914] text-amber-200 border border-[#FF8A00]/30",
        subCardLabel: "text-amber-400 font-bold",
        subCardValue: "text-[#FFF6E3] font-bold",
        subCardMuted: "text-amber-200/70",
        btnPrimary: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold shadow-xl",
        btnSecondary: "bg-[#520914] hover:bg-[#680C1A] text-amber-100 border border-[#FF8A00]/30 font-semibold",
        footerBorder: "border-[#FF8A00]/30",
        footerCounter: "text-amber-200/60",
        btnPrevDisabled: "opacity-40 cursor-not-allowed border-[#FF8A00]/20 text-amber-400/30",
        btnPrevActive: "border-[#FF8A00]/40 text-amber-200 hover:bg-[#520914]",
        btnNext: "bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-semibold",
        btnExplore: "bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold",
      };
    }
    if (isGoldenHour) {
      return {
        backdrop: "bg-[#0C0704]/85",
        container: "bg-gradient-to-b from-[#2B1D12] via-[#1C140D] to-[#120B06] border border-[#C9822B]/40 text-[#FFF4D8] shadow-2xl",
        glow: "bg-amber-500/15",
        headerBorder: "border-[#C9822B]/35",
        headerTitle: "text-amber-300 font-bold",
        headerSub: "text-amber-200/70 font-serif",
        btnPause: "bg-[#332115] hover:bg-[#452D1D] text-amber-200 border border-[#C9822B]/35",
        pauseIcon: "text-amber-400",
        btnClose: "text-amber-200 hover:text-white hover:bg-amber-950/40",
        dotActive: "w-8 bg-amber-400",
        dotPassed: "w-4 bg-amber-500/50",
        dotFuture: "w-3 bg-stone-900",
        sectionLabel: "text-amber-400 font-bold tracking-widest",
        heading: "text-[#FFF4D8] font-medium",
        subHeadingItalic: "text-amber-300 font-bold italic",
        cardBg: "bg-[#26180F]/90 border border-[#C9822B]/35 shadow-xl",
        sanskritVerse: "text-[#FFF4D8] font-medium",
        meaningText: "text-amber-100 italic font-serif",
        meaningHindi: "text-amber-200/70 font-serif",
        bodyMuted: "text-amber-200/70",
        focalWordBadge: "bg-amber-500/25 text-amber-200 border border-amber-400 ring-2 ring-amber-400/30",
        focalTranslit: "text-amber-200 italic font-serif",
        compChipActive: "bg-amber-500/30 border-amber-400 text-amber-100 shadow-md scale-105 font-bold",
        compChipInactive: "bg-[#18100A] border-[#C9822B]/30 text-amber-200 hover:border-amber-400",
        compPlus: "text-amber-400 font-bold",
        tabActive: "bg-amber-500/25 border-amber-400 text-amber-200 font-bold",
        tabInactive: "bg-[#18100A] border-[#C9822B]/30 text-amber-200/70 hover:text-white",
        subCard: "bg-[#120B06]/80 border border-[#C9822B]/30 text-amber-100",
        subCardBadge: "bg-[#332115] text-amber-200 border border-[#C9822B]/35",
        subCardLabel: "text-amber-400 font-bold",
        subCardValue: "text-[#FFF4D8] font-bold",
        subCardMuted: "text-amber-200/70",
        btnPrimary: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold shadow-xl",
        btnSecondary: "bg-[#332115] hover:bg-[#452D1D] text-amber-100 border border-[#C9822B]/35 font-semibold",
        footerBorder: "border-[#C9822B]/35",
        footerCounter: "text-amber-200/60",
        btnPrevDisabled: "opacity-40 cursor-not-allowed border-[#C9822B]/20 text-amber-400/30",
        btnPrevActive: "border-[#C9822B]/40 text-amber-200 hover:bg-[#332115]",
        btnNext: "bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-semibold",
        btnExplore: "bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold",
      };
    }
    // Sandstone default
    return {
      backdrop: "bg-stone-950/85",
      container: "bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 border border-amber-500/40 text-stone-100 shadow-2xl",
      glow: "bg-amber-500/10",
      headerBorder: "border-stone-800/80",
      headerTitle: "text-amber-300 font-bold",
      headerSub: "text-stone-400 font-serif",
      btnPause: "bg-stone-800/80 hover:bg-stone-700 text-stone-300",
      pauseIcon: "text-amber-400",
      btnClose: "text-stone-400 hover:text-stone-100 hover:bg-stone-800",
      dotActive: "w-8 bg-amber-400",
      dotPassed: "w-4 bg-amber-500/50",
      dotFuture: "w-3 bg-stone-800",
      sectionLabel: "text-amber-400/90 font-semibold tracking-widest",
      heading: "text-amber-100 font-medium",
      subHeadingItalic: "text-amber-300 font-bold italic",
      cardBg: "bg-stone-900/90 border border-stone-800 shadow-lg",
      sanskritVerse: "text-amber-200/90 font-medium",
      meaningText: "text-stone-200 italic font-serif",
      meaningHindi: "text-stone-400 font-serif",
      bodyMuted: "text-stone-400",
      focalWordBadge: "bg-amber-500/20 text-amber-200 border border-amber-400 ring-2 ring-amber-400/30",
      focalTranslit: "text-amber-300/80 italic font-serif",
      compChipActive: "bg-amber-500/25 border-amber-400 text-amber-100 shadow-md scale-105",
      compChipInactive: "bg-stone-900 border-stone-800 text-stone-300 hover:border-amber-500/40",
      compPlus: "text-amber-500/60 font-bold",
      tabActive: "bg-amber-500/20 border-amber-400 text-amber-200",
      tabInactive: "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200",
      subCard: "bg-stone-950/60 border border-stone-800 text-stone-100",
      subCardBadge: "bg-stone-800 text-stone-300 border border-stone-700",
      subCardLabel: "text-amber-400 font-bold",
      subCardValue: "text-amber-100 font-bold",
      subCardMuted: "text-stone-400",
      btnPrimary: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold shadow-xl",
      btnSecondary: "bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold",
      footerBorder: "border-stone-800/80",
      footerCounter: "text-stone-500",
      btnPrevDisabled: "opacity-30 cursor-not-allowed border-stone-800 text-stone-600",
      btnPrevActive: "border-stone-700 text-stone-300 hover:bg-stone-800",
      btnNext: "bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-semibold",
      btnExplore: "bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold",
    };
  };

  const tc = getThemeClasses();

  return (
    <ModalPortal>
      <div className={`fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto overscroll-contain animate-fadeIn backdrop-blur-xl ${tc.backdrop} p-0 sm:p-4 md:p-6 lg:p-8 xl:p-10 pt-0 sm:pt-4 md:pt-6 lg:pt-8 xl:pt-10 pb-24 sm:pb-6 md:pb-8 lg:pb-12`}>
        <div
          id="look-closer-experience"
          className={`relative w-full max-w-full sm:max-w-2xl min-h-dvh sm:min-h-0 sm:my-auto ${tc.container} rounded-none sm:rounded-3xl overflow-hidden p-6 sm:p-10 transition-all flex flex-col justify-between sm:justify-start`}
        >
          {/* Ambient Golden Glow in background */}
          <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 ${tc.glow} rounded-full blur-3xl pointer-events-none`} />

          {/* ── Top Header Controls ── */}
          <div className={`relative z-10 flex items-center justify-between pb-5 border-b ${tc.headerBorder}`}>
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <div>
                <span className={`text-xs font-bold uppercase tracking-widest ${tc.headerTitle} block`}>
                  SutraSparsh Discovery • Look Closer
                </span>
                <span className={`text-[10px] ${tc.headerSub}`}>
                  {activeVerse.source} · {activeVerse.title}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-2.5 py-1 rounded-lg ${tc.btnPause} text-xs flex items-center space-x-1.5 transition-colors`}
                title={isPlaying ? "Pause auto-advance" : "Resume auto-advance"}
              >
                {isPlaying ? <Pause className={`w-3.5 h-3.5 ${tc.pauseIcon}`} /> : <Play className={`w-3.5 h-3.5 ${tc.pauseIcon}`} />}
                <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
              </button>

              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg ${tc.btnClose} transition-colors`}
                title="Close experience"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Scene Progress Indicators ── */}
          <div className="relative z-10 flex items-center justify-center space-x-2 my-5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentScene(s as any);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentScene === s
                    ? tc.dotActive
                    : currentScene > s
                    ? tc.dotPassed
                    : tc.dotFuture
                }`}
                title={`Jump to Scene ${s}`}
              />
            ))}
          </div>

          {/* ── Main Sequence Stage ── */}
          <div className="relative z-10 min-h-[340px] sm:min-h-[380px] flex flex-col justify-center py-2">
            {/* ════════ SCENE 1: Translation ════════ */}
            {currentScene === 1 && (
              <div className="space-y-5 text-center animate-fadeIn">
                <div className="space-y-1">
                  <span className={`text-xs uppercase ${tc.sectionLabel}`}>
                    The Surface
                  </span>
                  <h2 className={`font-serif-sacred text-2xl sm:text-3xl ${tc.heading}`}>
                    “A translation tells you what a sentence means.”
                  </h2>
                </div>

                {/* Verse Display */}
                <div className={`${tc.cardBg} rounded-2xl p-6 space-y-3`}>
                  <div className="space-y-1.5">
                    {sanskritLines.map((line, idx) => (
                      <p
                        key={idx}
                        className={`font-sanskrit text-xl sm:text-2xl ${tc.sanskritVerse} leading-relaxed`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>

                  <div className={`pt-3 border-t ${tc.headerBorder} space-y-1`}>
                    <p className={`text-sm sm:text-base ${tc.meaningText} leading-relaxed`}>
                      “{activeVerse.meaning}”
                    </p>
                    {activeVerse.hindiMeaning && (
                      <p className={`text-xs ${tc.meaningHindi} leading-relaxed pt-1`}>
                        भावार्थ: {activeVerse.hindiMeaning}
                      </p>
                    )}
                  </div>
                </div>

                <p className={`text-xs ${tc.bodyMuted} italic`}>
                  At first glance, the translated sentence appears complete and self-contained.
                </p>
              </div>
            )}

            {/* ════════ SCENE 2: Curiosity ════════ */}
            {currentScene === 2 && (
              <div className="space-y-5 text-center animate-fadeIn">
                <div className="space-y-1">
                  <span className={`text-xs uppercase ${tc.sectionLabel}`}>
                    The Turning Point
                  </span>
                  <h2 className={`font-serif-sacred text-3xl sm:text-4xl ${tc.subHeadingItalic}`}>
                    “But sometimes...”
                  </h2>
                </div>

                {/* Receding Verse with Highlighted Focal Term */}
                <div className={`${tc.cardBg} rounded-2xl p-6 space-y-4`}>
                  <div className="space-y-2">
                    <div className={`inline-block px-4 py-2 rounded-2xl ${tc.focalWordBadge} font-sanskrit font-bold text-2xl sm:text-3xl animate-pulse`}>
                      {flagshipWord.surfaceForm}
                    </div>
                    <p className={`text-xs ${tc.focalTranslit}`}>
                      ({flagshipWord.transliteration})
                    </p>
                  </div>

                  <div className={`pt-2 border-t ${tc.headerBorder} opacity-75 transition-opacity`}>
                    <p className={`text-xs sm:text-sm ${tc.meaningText}`}>
                      “{activeVerse.meaning}”
                    </p>
                  </div>
                </div>

                <p className={`text-xs ${tc.subHeadingItalic}`}>
                  The translated sentence recedes. A single sacred phrase beckons you to look deeper.
                </p>
              </div>
            )}

            {/* ════════ SCENE 3: Word Discovery ════════ */}
            {currentScene === 3 && (
              <div className="space-y-5 text-center animate-fadeIn">
                <div className="space-y-1">
                  <span className={`text-xs uppercase ${tc.sectionLabel}`}>
                    Deconstruction
                  </span>
                  <h2 className={`font-serif-sacred text-2xl sm:text-3xl ${tc.heading}`}>
                    “The words tell you much more.”
                  </h2>
                </div>

                {/* The Word Breaks into Components */}
                <div className={`${tc.cardBg} rounded-2xl p-6 space-y-4`}>
                  <div className={`text-xs ${tc.bodyMuted} uppercase tracking-wider`}>
                    Sacred Phrase & Compound Structure:
                  </div>
                  <div className={`font-sanskrit text-2xl sm:text-3xl font-bold ${tc.subCardLabel}`}>
                    {flagshipWord.surfaceForm}
                  </div>

                  <div className={`text-xs font-semibold uppercase tracking-widest flex items-center justify-center space-x-2 ${tc.sectionLabel}`}>
                    <span>↓ Unfolds Into Conscious Components ↓</span>
                  </div>

                  {/* Splitting animation chips */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {components.map((comp, idx) => (
                      <React.Fragment key={comp.id || idx}>
                        <button
                          onClick={() => {
                            setSelectedCompIndex(idx);
                          }}
                          className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all ${
                            selectedCompIndex === idx
                              ? tc.compChipActive
                              : tc.compChipInactive
                          }`}
                        >
                          <span className="font-sanskrit text-lg font-bold">
                            {comp.surfaceForm}
                          </span>
                          <span className={`text-[10px] italic font-serif ${selectedCompIndex === idx ? "" : tc.bodyMuted}`}>
                            {comp.transliteration}
                          </span>
                        </button>
                        {idx < components.length - 1 && (
                          <span className={tc.compPlus}>+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <p className={`text-xs ${tc.bodyMuted}`}>
                  This is not a mere translation lookup. It is an exploration of how sacred wisdom is assembled.
                </p>
              </div>
            )}

            {/* ════════ SCENE 4: Deeper Layers ════════ */}
            {currentScene === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-center space-y-1">
                  <span className={`text-xs uppercase ${tc.sectionLabel}`}>
                    The Infinite Depth
                  </span>
                  <h2 className={`font-serif-sacred text-2xl sm:text-3xl ${tc.heading}`}>
                    Deeper Layers of a Single Word
                  </h2>
                </div>

                {/* Component selection tabs */}
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {components.map((c, i) => (
                    <button
                      key={c.id || i}
                      onClick={() => {
                        setSelectedCompIndex(i);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-sanskrit font-bold border transition-colors ${
                        selectedCompIndex === i
                          ? tc.tabActive
                          : tc.tabInactive
                      }`}
                    >
                      {c.surfaceForm}
                    </button>
                  ))}
                </div>

                {/* Layer Details Card */}
                <div className={`${tc.cardBg} rounded-2xl p-5 space-y-3.5 text-xs sm:text-sm`}>
                  <div className={`flex items-baseline justify-between border-b ${tc.headerBorder} pb-2`}>
                    <div>
                      <span className={`font-sanskrit text-2xl ${tc.sanskritVerse}`}>
                        {activeComponent?.surfaceForm}
                      </span>
                      <span className={`font-serif italic ${tc.focalTranslit} ml-2`}>
                        ({activeComponent?.transliteration})
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${tc.subCardBadge}`}>
                      {activeComponent?.type || "Sanskrit Padam"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className={`text-[10px] uppercase font-bold ${tc.subCardLabel} block`}>
                      Meaning in Context:
                    </span>
                    <p className={`${tc.subCardValue} leading-relaxed`}>
                      {activeComponent?.meaning}{" "}
                      {activeComponent?.contextMeaning && `— ${activeComponent.contextMeaning}`}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className={`${tc.subCard} p-2.5 rounded-xl`}>
                      <span className={`text-[10px] uppercase ${tc.subCardLabel} block`}>
                        Root / धातु:
                      </span>
                      <span className={`font-sanskrit text-sm font-bold ${tc.subCardValue}`}>
                        {activeComponent?.root
                          ? `${activeComponent.root.form} (${activeComponent.root.transliteration || ""})`
                          : "Avyaya / Invariable (अव्यय)"}
                      </span>
                      {activeComponent?.root && (
                        <p className={`text-[10px] ${tc.subCardMuted} mt-0.5`}>
                          {activeComponent.root.gana ? `${activeComponent.root.gana} · ` : ""}
                          {activeComponent.root.meaning}
                        </p>
                      )}
                    </div>

                    <div className={`${tc.subCard} p-2.5 rounded-xl`}>
                      <span className={`text-[10px] uppercase ${tc.subCardLabel} block`}>
                        Grammar / विभक्ति / लकार:
                      </span>
                      <span className={`${tc.subCardValue} text-xs font-semibold block`}>
                        {activeComponent?.grammar?.case ||
                          activeComponent?.grammar?.tense ||
                          activeComponent?.grammar?.grammaticalForm ||
                          "Classical Paninian Form"}
                      </span>
                      <span className={`text-[10px] ${tc.subCardMuted} block mt-0.5`}>
                        {activeComponent?.grammar?.number ||
                          activeComponent?.grammar?.notes ||
                          "Panini Ashtadhyayi"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className={`text-[11px] text-center ${tc.bodyMuted} italic`}>
                  Translation → Word → Components → Root → Context → Deeper Understanding
                </p>
              </div>
            )}

            {/* ════════ SCENE 5: Final Brand Message ════════ */}
            {currentScene === 5 && (
              <div className="space-y-6 text-center animate-fadeIn py-2">
                <div className="space-y-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${tc.subCardBadge}`}>
                    SutraSparsh Principle
                  </span>
                  <h1 className={`font-serif-sacred text-4xl sm:text-5xl font-bold ${tc.heading} tracking-tight`}>
                    “Look closer.”
                  </h1>
                  <p className={`font-serif text-lg sm:text-xl ${tc.subHeadingItalic}`}>
                    One word. Many layers.
                  </p>
                </div>

                <div className={`max-w-md mx-auto ${tc.cardBg} rounded-2xl p-5 text-xs sm:text-sm ${tc.subCardValue} leading-relaxed`}>
                  Because sometimes the deepest meaning is not hidden in the sentence.
                  <strong className={`block mt-1 ${tc.subCardLabel}`}>
                    It is hidden inside the words.
                  </strong>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenWordExplorer(flagshipWord);
                    }}
                    className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl ${tc.btnPrimary} text-sm flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Enter Word Explorer</span>
                  </button>

                  <button
                    onClick={onClose}
                    className={`w-full sm:w-auto px-5 py-3.5 rounded-2xl ${tc.btnSecondary} text-xs transition-colors`}
                  >
                    Return to Scripture
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom Step Navigation Controls ── */}
          <div className={`relative z-10 flex items-center justify-between pt-5 border-t ${tc.footerBorder} text-xs`}>
            <button
              onClick={handlePrev}
              disabled={currentScene === 1}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border transition-colors ${
                currentScene === 1
                  ? tc.btnPrevDisabled
                  : tc.btnPrevActive
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className={`${tc.footerCounter} font-mono text-[11px]`}>
              Scene {currentScene} / 5
            </span>

            {currentScene < 5 ? (
              <button
                onClick={handleNext}
                className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-xl ${tc.btnNext} transition-colors`}
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenWordExplorer(flagshipWord);
                }}
                className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-xl ${tc.btnExplore} transition-colors`}
              >
                <span>Explore</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
