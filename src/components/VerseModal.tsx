import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  X,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Feather,
  Sparkles,
  Share2,
  Check,
  BookOpen,
  Layers,
  Info,
  ChevronRight,
} from "lucide-react";
import type { ContentItem } from "../types";
import { ModalPortal } from "./ModalPortal";
import { recitationEngine } from "../utils/recitationEngine";
import {
  InteractiveVerseText,
  WordBreakdown,
  WordMeaning,
  WordGrammar,
  WordSandhi,
  WordSources,
  WordExplorerService,
  useWordExplorer,
  type UseWordExplorerReturn,
  type SanskritWord,
} from "../features/wordExplorer";

interface VerseModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  isBookmarked: boolean;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  onSaveJournalNote: (verseId: string, verseTitle: string, note: string) => void;
  onOpenWord?: (surface: string) => void;
  wordExplorer?: UseWordExplorerReturn;
  theme?: string;
}

const getVerseModalThemeClasses = (theme?: string) => {
  switch (theme) {
    case "light":
    case "prism-pulse":
      return {
        overlay: "bg-stone-900/60",
        container: "bg-[#FFFDF9] border border-stone-300 text-stone-900 shadow-2xl",
        headerBg: "bg-[#F5EFEB] border-stone-200",
        headerTag: "bg-amber-100 text-amber-900 border-amber-300",
        headerCategory: "bg-stone-200 text-stone-800 border-stone-300",
        headerBtn: "text-stone-600 hover:text-stone-950 hover:bg-stone-200",
        headerCloseBtn: "text-stone-500 hover:text-stone-900 hover:bg-stone-200",
        tabBar: "border-stone-200 bg-[#EFE7E0]",
        tabActive: "border-amber-700 text-amber-950 font-bold",
        tabInactive: "border-transparent text-stone-600 hover:text-stone-950",
        heading: "text-stone-950 font-bold",
        subHeading: "text-amber-800 font-semibold",
        badgeAccent: "bg-amber-100 text-amber-900 border-amber-300",
        verseBox: "bg-[#FAF6EE] border-stone-300 text-stone-950",
        omWatermark: "text-stone-300/40",
        verseHelperText: "text-stone-500",
        wordStripBg: "bg-[#F4ECE2] border-stone-300",
        wordStripLabel: "text-stone-600",
        wordStripHint: "text-amber-800",
        wordChipActive: "bg-amber-200/90 border-amber-600 text-amber-950 shadow-sm ring-1 ring-amber-500/40",
        wordChipInactive: "bg-white border-stone-300 text-stone-800 hover:border-amber-500 hover:text-stone-950",
        inspectorCard: "bg-white border-amber-400/70 shadow-lg",
        inspectorHeaderBorder: "border-amber-200",
        inspectorWord: "text-amber-900",
        inspectorTranslit: "text-amber-800/90",
        inspectorMeaning: "text-stone-800",
        cardSubItemBg: "bg-stone-50 border-stone-200 text-stone-800",
        cardSubLabel: "text-stone-600",
        lookCloserStrip: "bg-amber-50/80 border-amber-300 text-amber-950",
        lookCloserBtn: "bg-amber-200 hover:bg-amber-300 border-amber-400 text-amber-950 font-bold",
        translitBox: "bg-[#FAF6EE] border-stone-300 text-stone-800",
        meaningBox: "bg-amber-50/70 border-amber-200 text-stone-900",
        sadhanaBox: "bg-[#FAF6EE] border-stone-300 text-stone-800",
        sadhanaBtn: "bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400",
        commentaryBox: "bg-[#FAF6EE] border-stone-300 text-stone-900",
        commentaryDivider: "border-stone-300 text-stone-600",
        journalTextarea: "bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600",
        journalSaveBtn: "bg-amber-600 hover:bg-amber-700 text-white font-bold",
        footerBg: "bg-[#F5EFEB] border-stone-200",
        footerCloseBtn: "bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold",
      };
    case "amethyst":
      return {
        overlay: "bg-[#0A0612]/80",
        container: "bg-[#140D24] border border-[#3D2566] text-[#F8F2E8] shadow-2xl",
        headerBg: "bg-[#1B1230] border-[#3D2566]",
        headerTag: "bg-purple-900/40 text-purple-300 border-purple-500/40",
        headerCategory: "bg-[#251740] text-purple-200 border-purple-700/40",
        headerBtn: "text-purple-300 hover:text-white hover:bg-purple-900/40",
        headerCloseBtn: "text-purple-300 hover:text-white hover:bg-purple-900/40",
        tabBar: "border-[#3D2566] bg-[#110A1F]",
        tabActive: "border-purple-400 text-purple-200 font-bold",
        tabInactive: "border-transparent text-purple-300/70 hover:text-purple-100",
        heading: "text-[#F8F2E8]",
        subHeading: "text-purple-300",
        badgeAccent: "bg-purple-900/40 text-purple-300 border-purple-500/40",
        verseBox: "bg-[#1A1030]/80 border-purple-900/40 text-purple-100",
        omWatermark: "text-purple-900/30",
        verseHelperText: "text-purple-400/70",
        wordStripBg: "bg-[#140C26] border-[#3D2566]/60",
        wordStripLabel: "text-purple-300/80",
        wordStripHint: "text-purple-300",
        wordChipActive: "bg-purple-600/30 border-purple-400 text-purple-100 shadow ring-1 ring-purple-400/50",
        wordChipInactive: "bg-[#1F143A] border-[#3D2566] text-purple-200 hover:border-purple-400 hover:text-white",
        inspectorCard: "bg-[#1D1338] border-purple-500/40 shadow-xl",
        inspectorHeaderBorder: "border-purple-500/25",
        inspectorWord: "text-purple-100",
        inspectorTranslit: "text-purple-300/80",
        inspectorMeaning: "text-purple-100",
        cardSubItemBg: "bg-[#160D2C] border-purple-800/40 text-purple-200",
        cardSubLabel: "text-purple-400",
        lookCloserStrip: "bg-purple-950/40 border-purple-500/30 text-purple-200",
        lookCloserBtn: "bg-purple-600/25 hover:bg-purple-600/40 border-purple-400 text-purple-100 font-bold",
        translitBox: "bg-[#170E2D] border-[#3D2566] text-purple-200",
        meaningBox: "bg-purple-950/30 border-purple-700/30 text-purple-100",
        sadhanaBox: "bg-[#170E2D] border-[#3D2566] text-purple-200",
        sadhanaBtn: "bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border-purple-500/40",
        commentaryBox: "bg-[#170E2D] border-[#3D2566] text-purple-100",
        commentaryDivider: "border-purple-900/50 text-purple-400",
        journalTextarea: "bg-[#120A20] border-[#3D2566] text-purple-100 placeholder:text-purple-400/40 focus:border-purple-400",
        journalSaveBtn: "bg-purple-600 hover:bg-purple-500 text-white font-bold",
        footerBg: "bg-[#1B1230] border-[#3D2566]",
        footerCloseBtn: "bg-[#251740] hover:bg-[#301E52] text-purple-200 font-medium",
      };
    case "festival":
      return {
        overlay: "bg-stone-950/80",
        container: "bg-[#260C05] border border-orange-600/40 text-orange-50 shadow-2xl",
        headerBg: "bg-[#341007] border-orange-900/60",
        headerTag: "bg-orange-500/20 text-orange-300 border-orange-500/40",
        headerCategory: "bg-[#45180A] text-orange-200 border-orange-700/40",
        headerBtn: "text-orange-300 hover:text-white hover:bg-orange-900/40",
        headerCloseBtn: "text-orange-400 hover:text-white hover:bg-orange-900/40",
        tabBar: "border-orange-900/60 bg-[#1F0A04]",
        tabActive: "border-orange-400 text-orange-200 font-bold",
        tabInactive: "border-transparent text-orange-300/70 hover:text-orange-100",
        heading: "text-orange-100",
        subHeading: "text-orange-300",
        badgeAccent: "bg-orange-500/20 text-orange-300 border-orange-500/40",
        verseBox: "bg-[#1F0903] border-orange-900/40 text-orange-100",
        omWatermark: "text-orange-950/40",
        verseHelperText: "text-orange-400/70",
        wordStripBg: "bg-[#1C0803] border-orange-900/50",
        wordStripLabel: "text-orange-300/80",
        wordStripHint: "text-orange-300",
        wordChipActive: "bg-orange-500/30 border-orange-400 text-orange-100 shadow ring-1 ring-orange-400/50",
        wordChipInactive: "bg-[#2D0F06] border-orange-900/60 text-orange-200 hover:border-orange-400 hover:text-white",
        inspectorCard: "bg-[#301007] border-orange-500/40 shadow-xl",
        inspectorHeaderBorder: "border-orange-500/25",
        inspectorWord: "text-orange-100",
        inspectorTranslit: "text-orange-300/80",
        inspectorMeaning: "text-orange-100",
        cardSubItemBg: "bg-[#240B04] border-orange-800/40 text-orange-200",
        cardSubLabel: "text-orange-400",
        lookCloserStrip: "bg-orange-950/40 border-orange-500/30 text-orange-200",
        lookCloserBtn: "bg-orange-500/25 hover:bg-orange-500/40 border-orange-400 text-orange-100 font-bold",
        translitBox: "bg-[#1F0903] border-orange-900/50 text-orange-200",
        meaningBox: "bg-orange-950/30 border-orange-700/30 text-orange-100",
        sadhanaBox: "bg-[#1F0903] border-orange-900/50 text-orange-200",
        sadhanaBtn: "bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border-orange-500/40",
        commentaryBox: "bg-[#1F0903] border-orange-900/50 text-orange-100",
        commentaryDivider: "border-orange-900/50 text-orange-400",
        journalTextarea: "bg-[#1A0702] border-orange-900/60 text-orange-100 placeholder:text-orange-400/40 focus:border-orange-400",
        journalSaveBtn: "bg-orange-500 hover:bg-orange-400 text-stone-950 font-bold",
        footerBg: "bg-[#341007] border-orange-900/60",
        footerCloseBtn: "bg-[#45180A] hover:bg-[#57200D] text-orange-200 font-medium",
      };
    case "golden-hour":
      return {
        overlay: "bg-stone-950/80",
        container: "bg-[#24150A] border border-amber-600/40 text-amber-50 shadow-2xl",
        headerBg: "bg-[#301C0D] border-amber-900/60",
        headerTag: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        headerCategory: "bg-[#42250E] text-amber-200 border-amber-700/40",
        headerBtn: "text-amber-300 hover:text-white hover:bg-amber-900/40",
        headerCloseBtn: "text-amber-400 hover:text-white hover:bg-amber-900/40",
        tabBar: "border-amber-900/60 bg-[#1B0F07]",
        tabActive: "border-amber-400 text-amber-200 font-bold",
        tabInactive: "border-transparent text-amber-300/70 hover:text-amber-100",
        heading: "text-amber-100",
        subHeading: "text-amber-300",
        badgeAccent: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        verseBox: "bg-[#1A0E06] border-amber-900/40 text-amber-100",
        omWatermark: "text-amber-950/40",
        verseHelperText: "text-amber-400/70",
        wordStripBg: "bg-[#180D05] border-amber-900/50",
        wordStripLabel: "text-amber-300/80",
        wordStripHint: "text-amber-300",
        wordChipActive: "bg-amber-500/30 border-amber-400 text-amber-100 shadow ring-1 ring-amber-400/50",
        wordChipInactive: "bg-[#2E1B0D] border-amber-900/60 text-amber-200 hover:border-amber-400 hover:text-white",
        inspectorCard: "bg-[#2F1B0D] border-amber-500/40 shadow-xl",
        inspectorHeaderBorder: "border-amber-500/25",
        inspectorWord: "text-amber-100",
        inspectorTranslit: "text-amber-300/80",
        inspectorMeaning: "text-amber-100",
        cardSubItemBg: "bg-[#221308] border-amber-800/40 text-amber-200",
        cardSubLabel: "text-amber-400",
        lookCloserStrip: "bg-amber-950/40 border-amber-500/30 text-amber-200",
        lookCloserBtn: "bg-amber-500/25 hover:bg-amber-500/40 border-amber-400 text-amber-100 font-bold",
        translitBox: "bg-[#1A0E06] border-amber-900/50 text-amber-200",
        meaningBox: "bg-amber-950/30 border-amber-700/30 text-amber-100",
        sadhanaBox: "bg-[#1A0E06] border-amber-900/50 text-amber-200",
        sadhanaBtn: "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40",
        commentaryBox: "bg-[#1A0E06] border-amber-900/50 text-amber-100",
        commentaryDivider: "border-amber-900/50 text-amber-400",
        journalTextarea: "bg-[#160B04] border-amber-900/60 text-amber-100 placeholder:text-amber-400/40 focus:border-amber-400",
        journalSaveBtn: "bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold",
        footerBg: "bg-[#301C0D] border-amber-900/60",
        footerCloseBtn: "bg-[#42250E] hover:bg-[#522E12] text-amber-200 font-medium",
      };
    case "sandstone":
    default:
      return {
        overlay: "bg-stone-950/80",
        container: "bg-stone-900 border border-stone-700/80 text-stone-100 shadow-2xl",
        headerBg: "bg-stone-950/50 border-stone-800",
        headerTag: "bg-amber-500/10 text-amber-300 border-amber-500/20",
        headerCategory: "bg-stone-800 text-stone-300 border-stone-700",
        headerBtn: "text-stone-400 hover:text-stone-100 hover:bg-stone-800",
        headerCloseBtn: "text-stone-400 hover:text-stone-100 hover:bg-stone-800",
        tabBar: "border-stone-800 bg-stone-950/20",
        tabActive: "border-amber-400 text-amber-300 font-bold",
        tabInactive: "border-transparent text-stone-400 hover:text-stone-200",
        heading: "text-amber-100",
        subHeading: "text-amber-400/90",
        badgeAccent: "bg-amber-500/10 text-amber-300 border-amber-500/25",
        verseBox: "bg-stone-950/80 border-amber-900/30 text-amber-100",
        omWatermark: "text-stone-800 opacity-40",
        verseHelperText: "text-stone-500",
        wordStripBg: "bg-stone-950/50 border-stone-800/80",
        wordStripLabel: "text-stone-400",
        wordStripHint: "text-amber-400/80",
        wordChipActive: "bg-amber-500/25 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/50",
        wordChipInactive: "bg-stone-900/90 border-stone-800 text-stone-300 hover:border-amber-500/40 hover:text-amber-200",
        inspectorCard: "bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-950 border-amber-500/35 shadow-xl",
        inspectorHeaderBorder: "border-amber-500/20",
        inspectorWord: "text-amber-100",
        inspectorTranslit: "text-amber-300/80",
        inspectorMeaning: "text-stone-200",
        cardSubItemBg: "bg-stone-900/90 border-stone-700/60 text-stone-300",
        cardSubLabel: "text-stone-400",
        lookCloserStrip: "bg-gradient-to-r from-amber-950/30 via-stone-900 to-stone-950 border-amber-500/25 text-amber-200",
        lookCloserBtn: "bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-200 font-bold",
        translitBox: "bg-stone-950/40 border-stone-800/80 text-stone-300",
        meaningBox: "bg-amber-950/10 border-amber-500/10 text-stone-200",
        sadhanaBox: "bg-stone-950/60 border-stone-800 text-stone-300",
        sadhanaBtn: "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40",
        commentaryBox: "bg-stone-950/60 border-stone-800 text-stone-200",
        commentaryDivider: "border-stone-800 text-stone-400",
        journalTextarea: "bg-stone-950/80 border-stone-800 text-stone-200 placeholder:text-stone-600 focus:border-amber-500/50",
        journalSaveBtn: "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40 font-medium",
        footerBg: "bg-stone-950/80 border-stone-800",
        footerCloseBtn: "bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium",
      };
  }
};

export const VerseModal: React.FC<VerseModalProps> = ({
  item,
  isOpen,
  isBookmarked,
  onClose,
  onToggleBookmark,
  onSaveJournalNote,
  onOpenWord,
  wordExplorer: passedWordExplorer,
  theme,
}) => {
  const tc = getVerseModalThemeClasses(theme);
  const internalWordExplorer = useWordExplorer();
  const wordExplorer = passedWordExplorer || internalWordExplorer;

  const [activeSubTab, setActiveSubTab] = useState<"verse" | "commentary" | "journal" | "words">("verse");
  const [journalNote, setJournalNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [chantingRepetitions, setChantingRepetitions] = useState(0);

  // Word-Level Interaction Layer State
  const [selectedWordSurface, setSelectedWordSurface] = useState<string | null>(null);
  const [activeVerseWord, setActiveVerseWord] = useState<SanskritWord | null>(null);

  // Identify all individual Sanskrit words in this verse
  const identifiedWords = useMemo(() => {
    if (!item?.body) return [];
    return WordExplorerService.tokenizeVerse(item.body).filter((t) => t.isWord);
  }, [item?.body]);

  // Reset word selection when changing verse
  useEffect(() => {
    setSelectedWordSurface(null);
    setActiveVerseWord(null);
  }, [item?.id]);

  // Word-level interaction handler: highlights on click and triggers Word Explorer hook
  const handleSelectWord = useCallback(
    async (surface: string, autoOpenDrawer = false) => {
      const cleaned = surface.replace(/[।॥,\.!\?;:\"\'\-–—\s]/g, "").trim();
      if (!cleaned) return;

      // 1. Highlight clicked word
      setSelectedWordSurface(cleaned);

      // 2. Resolve word details from verified lexicon / morphology
      const found = WordExplorerService.getWordBySurfaceSync(cleaned, item);
      setActiveVerseWord(found);

      // 3. Trigger Condition 2: Word click instantly starts verse recitation with zero chimes
      if (item?.id && item?.body) {
        recitationEngine.play(item.id, item.body, 1.0);
      }

      // 4. Trigger Word Explorer hook
      if (autoOpenDrawer) {
        await wordExplorer.openWord(cleaned, item);
        if (onOpenWord) {
          onOpenWord(cleaned);
        }
      } else {
        await wordExplorer.selectWord(cleaned, item);
      }

      // 5. Track word discovery event
      WordExplorerService.trackEvent("word_selected", {
        surfaceForm: cleaned,
        verseId: item?.id,
        isVerified: found?.isVerified ?? false,
      });
    },
    [item?.id, item?.title, item?.body, wordExplorer, onOpenWord]
  );

  if (!isOpen || !item) return null;

  const handlePlayBell = () => {
    if (item?.id && item?.body) {
      recitationEngine.play(item.id, item.body, 1.0);
    }
    setChantingRepetitions((prev) => prev + 1);
  };

  const handleShare = () => {
    const textToCopy = `${item.title}\n\n${item.body}\n\nMeaning:\n${item.meaning || ""}\n\n— via SutraSparsh`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalNote.trim()) return;
    onSaveJournalNote(item.id, item.title, journalNote.trim());
    setJournalNote("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <ModalPortal>
      <div className={`fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto overscroll-contain animate-fadeIn backdrop-blur-xl ${tc.overlay} p-0 sm:p-4 md:p-6 lg:p-8 xl:p-10 pt-0 sm:pt-4 md:pt-6 lg:pt-8 xl:pt-10 pb-24 sm:pb-6 md:pb-8 lg:pb-12`}>
        <div
          id="verse-detail-modal"
          className={`relative w-full max-w-full sm:max-w-2xl md:max-w-3xl min-h-dvh sm:min-h-0 sm:my-auto ${tc.container} rounded-none sm:rounded-2xl md:rounded-3xl overflow-hidden`}
        >
        {/* Top Header Bar */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${tc.headerBg}`}>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tc.headerTag}`}>
              {item.metadata.author || "Scripture"}
            </span>
            {item.metadata.category && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs ${tc.headerCategory}`}>
                {item.metadata.category}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              title="Copy verse text"
              className={`p-2 rounded-xl transition-colors ${tc.headerBtn}`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onToggleBookmark(item.id)}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Verse"}
              className={`p-2 rounded-xl transition-colors ${tc.headerBtn}`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${tc.headerCloseBtn}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Sub-tabs */}
        <div className={`flex border-b px-6 ${tc.tabBar}`}>
          <button
            onClick={() => setActiveSubTab("verse")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeSubTab === "verse"
                ? tc.tabActive
                : tc.tabInactive
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sacred Verse & Translation</span>
          </button>
          <button
            onClick={() => setActiveSubTab("commentary")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeSubTab === "commentary"
                ? tc.tabActive
                : tc.tabInactive
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Philosophical Commentary</span>
          </button>
          <button
            onClick={() => setActiveSubTab("journal")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeSubTab === "journal"
                ? tc.tabActive
                : tc.tabInactive
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Reflect & Journal</span>
          </button>
          <button
            onClick={() => {
              if (!activeVerseWord && identifiedWords.length > 0) {
                const firstWord = identifiedWords[0].cleaned;
                handleSelectWord(firstWord, false);
              }
              setActiveSubTab("words");
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeSubTab === "words"
                ? tc.tabActive
                : tc.tabInactive
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Word Explorer • पद-बोध</span>
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeSubTab === "verse" && (
            <div className="space-y-6">
              <div>
                <h2 className={`font-serif-sacred text-2xl font-bold ${tc.heading}`}>
                  {item.title}
                </h2>
                {item.subtitle && (
                  <p className={`text-sm mt-1 italic ${tc.subHeading}`}>
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* Word-Level Sanskrit Interaction Header */}
              <div className="flex items-center justify-between gap-2 px-1 flex-nowrap w-full">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                  <span className={`text-xs font-bold uppercase tracking-wider truncate ${tc.subHeading}`}>
                    <span className="inline sm:hidden">Word Layer • पद</span>
                    <span className="hidden sm:inline">Sanskrit Word-Level Layer • पद-विभाग</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold whitespace-nowrap border ${tc.badgeAccent}`}>
                    {identifiedWords.length} Words
                  </span>
                  {selectedWordSurface && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWordSurface(null);
                        setActiveVerseWord(null);
                      }}
                      className="text-[11px] opacity-75 hover:opacity-100 underline transition-opacity whitespace-nowrap"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Devanagari Sanskrit Body with Interactive Words */}
              <div className={`rounded-2xl p-6 border text-center relative overflow-hidden shadow-inner ${tc.verseBox}`}>
                <div className={`absolute top-2 right-2 font-sanskrit text-6xl pointer-events-none select-none ${tc.omWatermark}`}>
                  ॐ
                </div>
                <InteractiveVerseText
                  verseText={item.body}
                  selectedSurface={selectedWordSurface || undefined}
                  onSelectWord={(surface) => handleSelectWord(surface, false)}
                />
                <p className={`text-[11px] mt-4 italic font-sans ${tc.verseHelperText}`}>
                  Tap any word above to highlight it and view Paninian decomposition & Sandhi rules.
                </p>
              </div>

              {/* Identified Words Strip (Quick Selector Row) */}
              <div className={`rounded-2xl p-3.5 border space-y-2 ${tc.wordStripBg}`}>
                <div className="flex items-center justify-between text-xs px-1">
                  <span className={`font-medium ${tc.wordStripLabel}`}>Identified Sanskrit Words:</span>
                  <span className={`text-[11px] ${tc.wordStripHint}`}>Tap to select & highlight</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {identifiedWords.map((t) => {
                    const clean = t.cleaned;
                    const isSelected = selectedWordSurface === clean;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectWord(clean, false)}
                        className={`px-2.5 py-1 rounded-xl border text-xs font-sanskrit font-medium transition-all ${
                          isSelected
                            ? tc.wordChipActive
                            : tc.wordChipInactive
                        }`}
                      >
                        {clean}
                        {t.hasAnalysis && (
                          <span className="ml-1 text-[9px] text-amber-500 font-sans">•</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Word-Level Interaction Inspector Card (appears when a word is highlighted) */}
              {selectedWordSurface && activeVerseWord ? (
                <div className={`p-4 rounded-2xl border space-y-3 ${tc.inspectorCard}`}>
                  <div className={`flex items-start justify-between gap-3 border-b pb-3 ${tc.inspectorHeaderBorder}`}>
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${tc.subHeading}`}>
                          Highlighted Word:
                        </span>
                        <span className={`font-sanskrit text-2xl font-bold ${tc.inspectorWord}`}>
                          {activeVerseWord.surfaceForm}
                        </span>
                        <span className={`font-serif italic text-xs ${tc.inspectorTranslit}`}>
                          ({activeVerseWord.transliteration})
                        </span>
                      </div>
                      <p className={`text-xs mt-1 font-sans ${tc.inspectorMeaning}`}>
                        {activeVerseWord.contextMeaning || activeVerseWord.generalMeaning}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {activeVerseWord.isVerified ? (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25">
                          Paninian Verified
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                          Lexicon
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWordSurface(null);
                          setActiveVerseWord(null);
                        }}
                        className="p-1 opacity-70 hover:opacity-100 rounded-lg transition-colors"
                        title="Clear highlight"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Morphological Quick Details */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {activeVerseWord.root && (
                      <div className={`px-2.5 py-1 rounded-lg border ${tc.cardSubItemBg}`}>
                        <span className={`mr-1 font-semibold ${tc.cardSubLabel}`}>Root (धातु):</span>
                        <span className="font-sanskrit font-bold text-amber-600 dark:text-amber-200">{activeVerseWord.root.form}</span>
                        <span className={`text-[11px] ml-1 ${tc.cardSubLabel}`}>({activeVerseWord.root.meaning})</span>
                      </div>
                    )}

                    {activeVerseWord.grammar?.case && (
                      <div className={`px-2.5 py-1 rounded-lg border ${tc.cardSubItemBg}`}>
                        <span className={`mr-1 font-semibold ${tc.cardSubLabel}`}>Vibhakti:</span>
                        <span className="font-medium text-amber-600 dark:text-amber-200">{activeVerseWord.grammar.case}</span>
                      </div>
                    )}

                    {activeVerseWord.sandhi?.isSandhi && (
                      <div className={`px-2.5 py-1 rounded-lg border ${tc.cardSubItemBg}`}>
                        <span className={`mr-1 font-semibold ${tc.cardSubLabel}`}>Sandhi:</span>
                        <span className="font-mono text-[11px] text-amber-600 dark:text-amber-200">{activeVerseWord.sandhi.formula || "Compound"}</span>
                      </div>
                    )}

                    {activeVerseWord.components && activeVerseWord.components.length > 0 && (
                      <div className={`px-2.5 py-1 rounded-lg border ${tc.cardSubItemBg}`}>
                        <span className="font-semibold">{activeVerseWord.components.length} Decomposed Units: </span>
                        <span className="font-sanskrit font-bold text-amber-600 dark:text-amber-200">
                          {activeVerseWord.components.map((c) => c.surfaceForm).join(" + ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-1 flex-nowrap w-full">
                    <button
                      type="button"
                      onClick={() => {
                        if (item?.id && item?.body) {
                          recitationEngine.play(item.id, item.body, 1.0);
                        }
                      }}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${tc.cardSubItemBg}`}
                      title="Listen to verse recitation"
                      aria-label="Listen to verse recitation"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>Listen</span>
                    </button>

                    <div className="flex items-center space-x-1.5 sm:space-x-2 flex-1 justify-end min-w-0">
                      <button
                        type="button"
                        onClick={() => setActiveSubTab("words")}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center space-x-1 sm:space-x-1.5 truncate ${tc.cardSubItemBg}`}
                      >
                        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">Morphology<span className="hidden sm:inline"> Tab</span></span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          wordExplorer.openWord(activeVerseWord.surfaceForm);
                          if (onOpenWord) {
                            onOpenWord(activeVerseWord.surfaceForm);
                          }
                        }}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold transition-all shadow-md flex items-center space-x-1 sm:space-x-1.5 truncate"
                      >
                        <Layers className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">Explorer<span className="hidden sm:inline"> Drawer</span></span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Look Closer Discovery Strip when no word is highlighted */
                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl border gap-3 ${tc.lookCloserStrip}`}>
                  <div className="flex items-center space-x-2 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      <strong>Look Closer:</strong> Tap any Sanskrit word above to highlight and explore roots, Sandhi, and grammatical cases.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const firstWord = identifiedWords[0]?.cleaned || "कर्मण्येवाधिकारस्ते";
                      handleSelectWord(firstWord, false);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${tc.lookCloserBtn}`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Select First Word</span>
                  </button>
                </div>
              )}

              {/* Transliteration */}
              {item.transliteration && (
                <div>
                  <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${tc.subHeading}`}>
                    IAST Transliteration
                  </h4>
                  <div className={`rounded-xl p-4 border font-mono text-sm leading-relaxed whitespace-pre-line ${tc.translitBox}`}>
                    {item.transliteration}
                  </div>
                </div>
              )}

              {/* English Meaning */}
              {item.meaning && (
                <div>
                  <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${tc.subHeading}`}>
                    English Translation
                  </h4>
                  <p className={`text-base leading-relaxed border rounded-xl p-4 ${tc.meaningBox}`}>
                    {item.meaning}
                  </p>
                </div>
              )}

              {/* Chanting Sadhana Practice Section */}
              <div className={`rounded-2xl p-4 border flex flex-wrap items-center justify-between gap-4 ${tc.sadhanaBox}`}>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handlePlayBell}
                    title="Listen to verse recitation"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all font-medium text-sm cursor-pointer ${tc.sadhanaBtn}`}
                  >
                    <Volume2 className="w-4 h-4 text-amber-500" />
                    <span>Listen (Japa)</span>
                  </button>
                  <div className="text-xs opacity-80">
                    Chanted: <span className="font-bold text-amber-500">{chantingRepetitions}</span> repetitions
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {item.metadata.tags?.map((t) => (
                    <span
                      key={t}
                      className={`text-xs px-2.5 py-1 rounded-md border ${tc.cardSubItemBg}`}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "commentary" && (
            <div className="space-y-6">
              <div>
                <h3 className={`font-serif-sacred text-xl font-bold ${tc.heading}`}>
                  Commentary & Spiritual Insights
                </h3>
                <p className={`text-xs mt-1 ${tc.cardSubLabel}`}>
                  Context and philosophical breakdown for {item.title}
                </p>
              </div>

              <div className={`rounded-2xl p-6 border leading-relaxed text-base space-y-4 ${tc.commentaryBox}`}>
                <p className="whitespace-pre-line">
                  {item.commentary ||
                    "This timeless sacred verse addresses the deep inner dimensions of human existence, offering guidance on duty, mindfulness, and the nature of conscious awareness."}
                </p>

                <div className={`pt-4 border-t text-xs ${tc.commentaryDivider}`}>
                  <p>
                    <strong className="font-bold">Application in Daily Life:</strong> Take 3 conscious breaths, release anxiety regarding results, and focus purely on doing your present action with dignity and complete devotion.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "journal" && (
            <div className="space-y-6">
              <div>
                <h3 className={`font-serif-sacred text-xl font-bold ${tc.heading}`}>
                  Reflect on this Verse
                </h3>
                <p className={`text-xs mt-1 ${tc.cardSubLabel}`}>
                  Write down your personal contemplation, questions, or meditation insights.
                </p>
              </div>

              <form onSubmit={handleSaveNote} className="space-y-4">
                <textarea
                  id="journal-note-input"
                  rows={5}
                  value={journalNote}
                  onChange={(e) => setJournalNote(e.target.value)}
                  placeholder="How does this sacred wisdom speak to your life right now? Write your meditation reflection..."
                  className={`w-full rounded-2xl p-4 text-sm leading-relaxed ${tc.journalTextarea}`}
                />

                <div className="flex items-center justify-between">
                  <span className={`text-xs ${tc.cardSubLabel}`}>
                    Saved entries remain available across sessions in your Journal.
                  </span>

                  <button
                    type="submit"
                    disabled={!journalNote.trim()}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl border font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all ${tc.journalSaveBtn}`}
                  >
                    <Feather className="w-4 h-4" />
                    <span>Save Reflection</span>
                  </button>
                </div>

                {savedSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Your reflection has been recorded in your Wisdom Journal!</span>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeSubTab === "words" && (
            <div className="space-y-6">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${tc.subHeading}`}>
                  Sanskrit Word Explorer • पद-ज्ञान
                </span>
                <h3 className={`font-serif-sacred text-xl font-bold mt-0.5 ${tc.heading}`}>
                  Deconstruct Words from this Verse
                </h3>
                <p className={`text-xs mt-1 ${tc.cardSubLabel}`}>
                  Explore components, root (धातु), grammatical cases, and Sandhi for individual terms.
                </p>
              </div>

              {/* Quick word selector pills from this verse */}
              <div className="space-y-1.5">
                <span className={`text-xs font-semibold ${tc.cardSubLabel}`}>Select word from verse:</span>
                <div className="flex flex-wrap gap-2">
                  {identifiedWords.map((t) => {
                    const isSelected =
                      selectedWordSurface === t.cleaned ||
                      activeVerseWord?.surfaceForm === t.cleaned;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectWord(t.cleaned, false)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-sanskrit font-bold transition-all ${
                          isSelected
                            ? tc.wordChipActive
                            : tc.wordChipInactive
                        }`}
                      >
                        {t.cleaned}
                        {t.hasAnalysis && (
                          <span className="ml-1 text-[9px] text-amber-500 font-sans">•</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeVerseWord ? (
                <div className="space-y-6 pt-2">
                  {/* Word Header */}
                  <div className={`rounded-2xl p-5 space-y-3 border ${tc.verseBox}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex items-baseline space-x-3">
                        <span className={`font-sanskrit text-3xl font-bold ${tc.inspectorWord}`}>
                          {activeVerseWord.surfaceForm}
                        </span>
                        <span className={`font-serif italic text-base ${tc.inspectorTranslit}`}>
                          ({activeVerseWord.transliteration})
                        </span>
                      </div>
                      {activeVerseWord.isVerified ? (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                          Verified Paninian Analysis
                        </span>
                      ) : (
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${tc.badgeAccent}`}>
                          Lexicon Entry
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Decomposition */}
                  {activeVerseWord.components && activeVerseWord.components.length > 0 && (
                    <WordBreakdown
                      components={activeVerseWord.components}
                      selectedComponentId={null}
                      onSelectComponent={(id) => {
                        const comp = activeVerseWord.components?.find((c) => c.id === id);
                        if (comp) {
                          handleSelectWord(comp.surfaceForm, false);
                        } else if (onOpenWord) {
                          onOpenWord(activeVerseWord.surfaceForm);
                        }
                      }}
                      fullWordSurface={activeVerseWord.surfaceForm}
                    />
                  )}

                  {/* Meaning */}
                  <WordMeaning word={activeVerseWord} />

                  {/* Grammar */}
                  <WordGrammar grammar={activeVerseWord.grammar} root={activeVerseWord.root} />

                  {/* Sandhi if applicable */}
                  {activeVerseWord.sandhi?.isSandhi && (
                    <WordSandhi
                      sandhi={activeVerseWord.sandhi}
                      surfaceForm={activeVerseWord.surfaceForm}
                    />
                  )}

                  {/* Source transparency */}
                  <WordSources
                    sources={activeVerseWord.sources}
                    isVerified={activeVerseWord.isVerified}
                    unavailableReason={activeVerseWord.unavailableReason}
                  />

                  {/* Full screen Explorer trigger */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        wordExplorer.openWord(activeVerseWord.surfaceForm);
                        if (onOpenWord) {
                          onOpenWord(activeVerseWord.surfaceForm);
                        }
                      }}
                      className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all inline-flex items-center space-x-2 ${tc.lookCloserBtn}`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Launch Full Word Explorer Drawer</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className={`text-xs italic ${tc.cardSubLabel}`}>
                  Tap any word above to inspect its deep morphological breakdown.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-4 border-t flex justify-end ${tc.footerBg}`}>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${tc.footerCloseBtn}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};
