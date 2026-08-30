import React, { useState, useEffect } from "react";
import { speechSafetyEngine } from "../utils/speech";
import { PricingModal } from "./PricingModal";
import { DonationModal } from "./DonationModal";
import { Sparkles, Heart, Crown, ShieldCheck, Zap } from "lucide-react";

export interface WordDictEntry {
  trans: string;
  en: string;
  hi: string;
}

export interface AppConfig {
  page: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  modal: {
    title: string;
    body: string;
    cta: string;
    confirmNote: string;
  };
  appName: string;
  dayNumber: number;
  sessionMinutes: number;
  verseLines: string[];
  transliterationLines: string[];
  sourceCitation: string;
  wordDict: Record<string, WordDictEntry>;
  audio: {
    idle: { en: string; hi: string };
    playing: { en: string; hi: string };
  };
  closing: {
    title: { en: string; hi: string };
    subtitle: { en: string; hi: string };
  };
  promo: {
    icon: string;
    title: string;
    subtitle: string;
  };
  history: Array<{ title: string; sub: string }>;
}

export const DEFAULT_CONFIG: AppConfig = {
  page: {
    eyebrow: "Early Access Preview",
    title: "Your Daily Shloka",
    subtitle: "A living verse, a language of your choosing, and a dictionary at your fingertip."
  },
  modal: {
    title: "Your Daily Shloka App Preview",
    body: "Tap words in the shloka card below to test the premium dictionary lookup — in English or Hindi — or listen to the chant.",
    cta: "Join Early Access Waitlist →",
    confirmNote: "You're on the list — we'll notify you before public launch."
  },
  appName: "YOUR DAILY SHLOKA",
  dayNumber: 12,
  sessionMinutes: 20,
  verseLines: [
    "कर्मण्ये वाधिकारस्ते",
    "मा फलेषु कदाचन।",
    "मा कर्मफलहेतुर्भूर्मा ते",
    "संगोऽस्त्वकर्मणि॥"
  ],
  transliterationLines: [
    "karmaṇy-evādhikāras te",
    "mā phaleṣu kadācana |",
    "mā karma-phala-hetur bhūr",
    "mā te saṅgo 'stv akarmaṇi ||"
  ],
  sourceCitation: "— श्रीमद्भगवद्गीता 2.47",
  wordDict: {
    "कर्मण्ये": { trans: "karmaṇy-eva", en: "In action alone — your domain of duty and effort.", hi: "केवल कर्म करना ही तुम्हारा क्षेत्र है — कर्तव्य और प्रयास का।" },
    "वाधिकारस्ते": { trans: "adhikāras te", en: "...is your right — you are entitled only to your action.", hi: "...ही तुम्हारा अधिकार है — तुम केवल कर्म के अधिकारी हो, फल के नहीं।" },
    "मा": { trans: "mā", en: "Never / do not — a firm prohibition.", hi: "कभी नहीं — एक दृढ़ निषेध।" },
    "फलेषु": { trans: "phaleṣu", en: "In the fruits / results — the outcomes of action.", hi: "फलों में — कर्म के परिणामों में।" },
    "कदाचन": { trans: "kadācana", en: "Ever, at any time — reinforcing 'never'.", hi: "कभी भी — 'कभी नहीं' को और अधिक दृढ़ करता है।" },
    "कर्मफलहेतुर्भूर्मा": { trans: "karma-phala-hetur bhūr mā", en: "Let not the fruit of action be your motive.", hi: "कर्मफल को अपना उद्देश्य मत बनाओ।" },
    "ते": { trans: "te", en: "Your — possessive, referring back to the self.", hi: "तुम्हारा — स्वयं की ओर संकेत करता है।" },
    "संगोऽस्त्वकर्मणि": { trans: "saṅgo 'stv akarmaṇi", en: "Nor let your attachment be to inaction.", hi: "न ही अकर्म में तुम्हारी आसक्ति हो।" }
  },
  audio: {
    idle: { en: "Traditional Sanskrit recitation · 0:42", hi: "पारंपरिक संस्कृत पाठ · 0:42" },
    playing: { en: "Playing recitation… 0:07 / 0:42", hi: "मंत्र चल रहा है… 0:07 / 0:42" }
  },
  closing: {
    title: { en: "Carry this with you today", hi: "आज इसे अपने साथ रखें" },
    subtitle: { en: "A gentle reminder will greet you tomorrow morning.", hi: "कल सुबह एक कोमल याद आपका स्वागत करेगी।" }
  },
  promo: {
    icon: "🌸",
    title: "SutraSparsh Journeys",
    subtitle: "Unlock 30+ spiritual tracks"
  },
  history: [
    { title: "मृत्युर्न तस्य वाच्यम्…", sub: "Day 11 · Gita 2.20" },
    { title: "योगः कर्मसु कौशलम्…", sub: "Day 10 · Gita 2.50" },
    { title: "वासांसि जीर्णानि यथा…", sub: "Day 9 · Gita 2.22" }
  ]
};

const STRINGS = {
  en: {
    hint: "Tap any underlined word for its meaning",
    lock: "✦ Premium Dictionary",
    complete: "Session Complete",
    take: "Take your time to stay",
    reflection: "TODAY'S REFLECTION",
    extend: "Extend",
    extendSub: "+5 mins",
    fav1: "Add to",
    fav2: "Favorites",
    fav1Active: "Saved to",
    fav2Active: "Favorites",
    listen1: "Listen",
    listen2: "Chant",
    favEmpty: "No favorites yet. Tap the heart on a shloka to save it here.",
    profileName: "Guest Reader",
    profileSub: "Sign in to sync your streak and favorites across devices.",
    profileCta: "Join Early Access"
  },
  hi: {
    hint: "अर्थ जानने के लिए किसी भी रेखांकित शब्द को छुएं",
    lock: "✦ प्रीमियम शब्दकोश",
    complete: "सत्र पूर्ण",
    take: "अपना समय लें",
    reflection: "आज का चिंतन",
    extend: "बढ़ाएँ",
    extendSub: "+5 मिनट",
    fav1: "पसंदीदा में",
    fav2: "जोड़ें",
    fav1Active: "सहेजा गया",
    fav2Active: "पसंदीदा में",
    listen1: "मंत्र",
    listen2: "सुनें",
    favEmpty: "अभी कोई पसंदीदा नहीं। सहेजने के लिए हृदय चिह्न दबाएं।",
    profileName: "अतिथि पाठक",
    profileSub: "अपनी लड़ी (streak) और पसंदीदा को सभी उपकरणों पर सिंक करने के लिए साइन इन करें।",
    profileCta: "प्रारंभिक प्रवेश से जुड़ें"
  }
};

export interface DailyShlokaMobileProps {
  onOpenAdmin?: () => void;
}

export const DailyShlokaMobile: React.FC<DailyShlokaMobileProps> = ({ onOpenAdmin }) => {
  const [currentLang, setCurrentLang] = useState<"en" | "hi">("en");
  const [activeTab, setActiveTab] = useState<"home" | "favorites" | "history" | "profile">("home");
  const [activeWordKey, setActiveWordKey] = useState<string | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState(DEFAULT_CONFIG.sessionMinutes * 60);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favorites, setFavorites] = useState<Array<{ snippet: string; citation: string }>>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true); // Auto-open on load
  const [isReopenFabVisible, setIsReopenFabVisible] = useState(false);
  const [modalConfirmed, setModalConfirmed] = useState(false);
  const [isSpeakingWord, setIsSpeakingWord] = useState(false);
  const [extendAnim, setExtendAnim] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      speechSafetyEngine.cancel();
    };
  }, []);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format session time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const stopSpeaking = () => {
    speechSafetyEngine.cancel();
    setIsSpeakingWord(false);
  };

  const speakWordKey = (wordClean: string) => {
    if (!wordClean) return;
    const data = DEFAULT_CONFIG.wordDict[wordClean];
    const textToSpeak = data?.trans || wordClean;

    speechSafetyEngine.speak(textToSpeak, {
      lang: currentLang,
      rate: 0.88,
      onStart: () => setIsSpeakingWord(true),
      onEnd: () => setIsSpeakingWord(false),
      onError: () => setIsSpeakingWord(false),
    });
  };

  const handleWordTap = (wordClean: string) => {
    stopSpeaking();
    setActiveWordKey(wordClean);
    speakWordKey(wordClean);
  };

  const handleSpeakWord = () => {
    if (activeWordKey) {
      speakWordKey(activeWordKey);
    }
  };

  const handleExtend = () => {
    setSessionSeconds((prev) => prev + 300);
    setExtendAnim(true);
    setTimeout(() => setExtendAnim(false), 200);
  };

  const handleToggleFavorite = () => {
    const newFav = !isFavorited;
    setIsFavorited(newFav);
    if (newFav) {
      setFavorites((prev) => [
        { snippet: DEFAULT_CONFIG.verseLines[0], citation: DEFAULT_CONFIG.sourceCitation },
        ...prev
      ]);
    } else {
      setFavorites((prev) => prev.filter((f) => f.citation !== DEFAULT_CONFIG.sourceCitation));
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsReopenFabVisible(true);
  };

  const handleOpenPromoModal = () => {
    setIsModalOpen(true);
    setIsReopenFabVisible(false);
  };

  const handleJoinCTA = () => {
    setModalConfirmed(true);
  };

  const handleBellClick = () => {
    setNotificationMsg(currentLang === "en" ? "Daily notification set for 06:00 AM" : "दैनिक सूचना सुबह 06:00 बजे निर्धारित है");
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const t = STRINGS[currentLang];
  const activeWordData = activeWordKey ? DEFAULT_CONFIG.wordDict[activeWordKey] : null;

  return (
    <div className="daily-shloka-mobile-container relative w-full max-w-[520px] mx-auto min-h-screen text-[#F8EFDE] overflow-x-hidden font-sans pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
      {/* Background with dot-grid pattern */}
      <div className="fixed inset-0 max-w-[520px] mx-auto pointer-events-none z-0">
        <div
          className="absolute inset-0 bg-[#1A0F22]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 0%, #3a2247 0%, transparent 55%),
              radial-gradient(circle at 90% 100%, #4a1f2e 0%, transparent 55%),
              linear-gradient(180deg, #1A0F22 0%, #150b1c 100%)
            `
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(rgba(231,167,62,0.14) 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />
      </div>

      {/* Sticky App Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 pt-[calc(14px+env(safe-area-inset-top,0px))] pb-3 bg-[#1A0F22]/90 backdrop-blur-md border-b border-[#3a2247]/50">
        <div
          className="w-6 flex flex-col gap-1 cursor-pointer py-1"
          onClick={() => setMenuOpen(!menuOpen)}
          title="Menu"
        >
          <span className="h-[2px] w-full bg-[#F8EFDE] rounded-full" />
          <span className="h-[2px] w-4/5 bg-[#F8EFDE] rounded-full" />
          <span className="h-[2px] w-full bg-[#F8EFDE] rounded-full" />
        </div>

        <h2 className="text-[12.5px] font-extrabold tracking-[0.18em] text-[#F3C978] m-0 font-sans uppercase">
          {DEFAULT_CONFIG.appName}
        </h2>

        <div className="relative cursor-pointer p-1" onClick={handleBellClick} title="Notifications">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
              stroke="#F8EFDE"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M13.7 21a2 2 0 01-3.4 0"
              stroke="#F8EFDE"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute top-0 right-0 w-[9px] height-[9px] bg-[#C6841D] rounded-full border-2 border-[#1A0F22]" />
        </div>
      </header>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#F8EFDE] text-[#2B2117] text-xs font-semibold px-4 py-2 rounded-full shadow-xl animate-fadeIn">
          {notificationMsg}
        </div>
      )}

      {/* Slide-out Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 max-w-[520px] mx-auto z-40 bg-black/60 backdrop-blur-sm flex">
          <div className="w-64 bg-[#2A1836] border-r border-[#E7A73E]/30 p-6 flex flex-col justify-between h-full shadow-2xl animate-fadeIn">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-amber-200 text-lg">SutraSparsh</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-stone-400 hover:text-stone-200 text-sm p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    setActiveTab("home");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium"
                >
                  🏠 Daily Shloka Home
                </button>
                <button
                  onClick={() => {
                    setActiveTab("favorites");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium"
                >
                  🤍 Saved Favorites ({favorites.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab("history");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium"
                >
                  🕐 Reflection History
                </button>
                {onOpenAdmin && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full text-left py-2 px-3 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-sm font-medium"
                  >
                    ⚙️ Operations & QA Console
                  </button>
                )}
              </div>
            </div>

            <div className="text-[11px] text-stone-400 border-t border-stone-700/50 pt-4">
              v1.0.0 • Sacred Sanskrit Wisdom
            </div>
          </div>
          <div className="flex-1" onClick={() => setMenuOpen(false)} />
        </div>
      )}

      {/* Main Tab Content */}
      <div className="relative z-10">
        {/* ================= 1. HOME TAB ================= */}
        {activeTab === "home" && (
          <div className="animate-fadeIn">
            {/* Hero Banner */}
            <div className="pt-2 px-6 pb-5 text-center">
              <div className="text-[11px] tracking-[0.2em] uppercase text-[#F3C978] font-bold mb-2">
                {DEFAULT_CONFIG.page.eyebrow}
              </div>
              <h1 className="font-serif font-semibold text-[26px] sm:text-[30px] mb-2 text-[#F8EFDE] leading-tight">
                {DEFAULT_CONFIG.page.title}
              </h1>
              <p className="text-[#c9b8d4] text-[13.5px] leading-relaxed max-w-[340px] mx-auto">
                {DEFAULT_CONFIG.page.subtitle}
              </p>
            </div>

            {/* Progress & Session Timer */}
            <div className="px-6 py-1">
              <div className="h-[6px] w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[26%] bg-gradient-to-r from-[#F3C978] to-[#C6841D] rounded-full" />
              </div>
              <div className="flex justify-between mt-2 text-[11px] text-[#b6a7c2]">
                <span>{t.complete}</span>
                <span>{t.take}</span>
              </div>
              <div className="text-center text-[11px] text-[#F3C978] mt-1.5 font-semibold">
                {formatTime(sessionSeconds)} {currentLang === "en" ? "remaining" : "शेष"}
              </div>
            </div>

            {/* Om Symbol & Reflection Header */}
            <div className="text-center mt-4 font-serif text-[34px] text-[#F3C978] drop-shadow-[0_2px_14px_rgba(231,167,62,0.35)]">
              ॐ
            </div>
            <div className="text-center mt-1 px-5">
              <div className="text-[11.5px] font-extrabold tracking-[0.18em] text-[#F3C978]">
                {t.reflection}
              </div>
              <div className="italic text-[#d8c6e0] text-[12.5px] mt-0.5 font-serif">
                {currentLang === "en"
                  ? `Day ${DEFAULT_CONFIG.dayNumber} of your journey`
                  : `आपकी यात्रा का ${DEFAULT_CONFIG.dayNumber}वाँ दिन`}
              </div>
            </div>

            {/* Cards Container */}
            <main className="px-[18px] pt-5 pb-6 space-y-4">
              {/* Shloka Card */}
              <div className="bg-[#fffaf0] rounded-[24px] border border-[#ecdcae] p-6 sm:p-7 text-center shadow-[0_16px_34px_-16px_rgba(80,50,10,0.35)] text-[#2B2117]">
                {/* Language Toggle */}
                <div className="inline-flex bg-[#f1e4c4] rounded-full p-[3px] mb-5 gap-1">
                  <button
                    onClick={() => {
                      stopSpeaking();
                      setCurrentLang("en");
                    }}
                    className={`border-none font-bold text-xs px-4 py-1.5 rounded-full cursor-pointer transition-all ${
                      currentLang === "en"
                        ? "bg-gradient-to-b from-[#F3C978] to-[#C6841D] text-[#3a1c00] shadow-[0_6px_14px_-6px_rgba(198,132,29,0.6)]"
                        : "bg-transparent text-[#7A6E5C]"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => {
                      stopSpeaking();
                      setCurrentLang("hi");
                    }}
                    className={`border-none font-bold text-xs px-4 py-1.5 rounded-full cursor-pointer transition-all ${
                      currentLang === "hi"
                        ? "bg-gradient-to-b from-[#F3C978] to-[#C6841D] text-[#3a1c00] shadow-[0_6px_14px_-6px_rgba(198,132,29,0.6)]"
                        : "bg-transparent text-[#7A6E5C]"
                    }`}
                  >
                    हिं
                  </button>
                </div>

                {/* Verse Lines (Word by Word) */}
                <div className="space-y-2 mb-3">
                  {DEFAULT_CONFIG.verseLines.map((line, idx) => {
                    const wordsInLine = line.split(" ");
                    return (
                      <p
                        key={idx}
                        className="font-serif text-[22px] leading-[1.85] text-[#2B2117] m-0 flex flex-wrap justify-center gap-x-[0.3em] gap-y-1"
                      >
                        {wordsInLine.map((wordPart, wIdx) => {
                          const clean = wordPart.replace(/[।॥,]/g, "");
                          const isActive = activeWordKey === clean;
                          return (
                            <span
                              key={wIdx}
                              onClick={() => handleWordTap(clean)}
                              className={`cursor-pointer border-b-2 border-dotted border-[#C6841D] pb-[1px] rounded transition-all select-none ${
                                isActive ? "text-[#8C2F2F] bg-[#f7e6bd] font-semibold" : "hover:text-[#8C2F2F] hover:bg-[#f7e6bd]"
                              }`}
                            >
                              {wordPart}
                            </span>
                          );
                        })}
                      </p>
                    );
                  })}
                </div>

                {/* Source Citation */}
                <div className="mt-4 text-[#6C1F22] text-[13.5px] font-bold font-serif">
                  {DEFAULT_CONFIG.sourceCitation}
                </div>

                {/* Garland Divider */}
                <div className="flex items-center justify-center gap-2 my-5">
                  <div className="w-10 h-[1px] bg-[#e3cf9d]" />
                  <span className="w-[7px] h-[7px] rounded-full bg-[#C6841D] opacity-85" />
                  <span className="w-[7px] h-[7px] rounded-full bg-[#C6841D] opacity-85" />
                  <span className="w-[7px] h-[7px] rounded-full bg-[#8C2F2F] opacity-85" />
                  <div className="w-10 h-[1px] bg-[#e3cf9d]" />
                </div>

                {/* Hint Text */}
                <div className="flex items-center justify-center gap-2 text-xs text-[#7A6E5C]">
                  <span>👆</span>
                  <span>{t.hint}</span>
                </div>

                {/* Meaning Box (Appears on word tap) */}
                {activeWordKey && (
                  <div className="mt-4 bg-[#f4efe3] border border-[#e4d3a8] rounded-2xl p-4 text-left animate-fadeIn">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <span className="font-serif text-[19px] text-[#8C2F2F] font-bold block">
                          {activeWordKey}
                        </span>
                        <span className="text-[11px] tracking-[0.05em] text-[#C6841D] uppercase font-extrabold block mt-0.5">
                          {activeWordData?.trans || "—"}
                        </span>
                      </div>

                      {/* Speaker Button */}
                      <button
                        onClick={handleSpeakWord}
                        className={`w-[34px] h-[34px] rounded-full border-none flex items-center justify-center cursor-pointer transition-all ${
                          isSpeakingWord
                            ? "bg-gradient-to-br from-[#F3C978] to-[#C6841D] text-white animate-speakPulse ring-4 ring-[#E7A73E]/40"
                            : "bg-gradient-to-br from-[#fde9be] to-[#f5d48a] text-[#6C1F22] shadow-[0_4px_10px_-4px_rgba(198,132,29,0.45)] hover:scale-105 active:scale-95"
                        }`}
                        title="Hear the pronunciation"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
                          <path
                            d="M15.5 8.5a5 5 0 0 1 0 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M19 5.5a9 9 0 0 1 0 13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="h-[1px] bg-[#e4d3a8] my-3" />

                    <p className="text-[13.5px] text-[#2B2117] leading-relaxed m-0">
                      {activeWordData
                        ? currentLang === "en"
                          ? activeWordData.en
                          : activeWordData.hi
                        : "Tap to explore this word's meaning in the app."}
                    </p>

                    <div className="mt-3">
                      <span className="inline-block text-[10.5px] font-bold text-[#8C2F2F] bg-[#f0dfae] px-2.5 py-0.5 rounded-full">
                        {t.lock}
                      </span>
                    </div>

                    {/* Full Shloka Recitation Mini-Pill */}
                    <div
                      onClick={handleTogglePlay}
                      className={`mt-3.5 w-full flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all shadow-sm ${
                        isPlaying
                          ? "bg-gradient-to-r from-[#F3C978] to-[#f0c060] border-[#E7A73E]"
                          : "bg-gradient-to-r from-[#fff2d2] to-[#f4dda0] border-[#e8c97a]"
                      }`}
                    >
                      <div
                        className={`w-[30px] h-[30px] rounded-full bg-gradient-to-b from-[#F3C978] to-[#C6841D] flex items-center justify-center shrink-0 shadow ${
                          isPlaying ? "animate-pulse" : ""
                        }`}
                      >
                        {isPlaying ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="#3a1c00">
                            <rect x="6" y="5" width="4" height="14" />
                            <rect x="14" y="5" width="4" height="14" />
                          </svg>
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="#3a1c00">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <span className="text-[12.5px] font-bold text-[#2B2117] block">
                          {currentLang === "en" ? "Listen to full shloka" : "संपूर्ण श्लोक सुनें"}
                        </span>
                        <span className="text-[10.5px] text-[#7A6E5C] block">
                          {isPlaying
                            ? DEFAULT_CONFIG.audio.playing[currentLang]
                            : DEFAULT_CONFIG.audio.idle[currentLang]}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Transliteration Card */}
              <div className="bg-[#fffaf0] rounded-[24px] border border-[#ecdcae] p-6 text-center shadow-[0_16px_34px_-16px_rgba(80,50,10,0.35)] text-[#2B2117]">
                <div className="text-[11px] font-extrabold tracking-[0.16em] text-[#6C1F22] mb-3">
                  TRANSLITERATION
                </div>
                <div className="space-y-0.5">
                  {DEFAULT_CONFIG.transliterationLines.map((line, i) => (
                    <p key={i} className="italic text-[14.5px] leading-relaxed text-[#2B2117] m-0 font-sans">
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* Action Tiles Row (3 Equal Cards) */}
              <div className="flex gap-2.5">
                {/* 1. Extend Timer */}
                <div
                  onClick={handleExtend}
                  style={{ transform: extendAnim ? "scale(0.94)" : "scale(1)" }}
                  className="flex-1 bg-[#fffaf0] rounded-[20px] border border-[#ecdcae] py-4 px-1.5 text-center cursor-pointer transition-transform text-[#2B2117] shadow-sm select-none"
                >
                  <span className="text-[22px] block mb-1.5">⏳</span>
                  <span className="block font-bold text-xs leading-tight">{t.extend}</span>
                  <span className="block text-[10.5px] text-[#C6841D] font-bold mt-0.5">
                    {t.extendSub}
                  </span>
                </div>

                {/* 2. Add to Favorites */}
                <div
                  onClick={handleToggleFavorite}
                  className={`flex-1 rounded-[20px] border py-4 px-1.5 text-center cursor-pointer transition-all text-[#2B2117] shadow-sm select-none ${
                    isFavorited
                      ? "bg-[#fbeee0] border-[#8C2F2F]"
                      : "bg-[#fffaf0] border-[#ecdcae]"
                  }`}
                >
                  <span className="text-[22px] block mb-1.5">{isFavorited ? "❤️" : "🤍"}</span>
                  <span className="block font-bold text-xs leading-tight">
                    {isFavorited ? t.fav1Active : t.fav1}
                  </span>
                  <span
                    className={`block text-[10.5px] font-bold mt-0.5 ${
                      isFavorited ? "text-[#8C2F2F]" : "text-[#C6841D]"
                    }`}
                  >
                    {isFavorited ? t.fav2Active : t.fav2}
                  </span>
                </div>

                {/* 3. Listen / Chant */}
                <div
                  onClick={handleTogglePlay}
                  className={`flex-1 rounded-[20px] border py-4 px-1.5 text-center cursor-pointer transition-all text-[#2B2117] shadow-sm select-none ${
                    isPlaying
                      ? "bg-[#fff2d2] border-[#E7A73E]"
                      : "bg-[#fffaf0] border-[#ecdcae]"
                  }`}
                >
                  <span className="text-[22px] block mb-1.5">{isPlaying ? "⏸️" : "🔊"}</span>
                  <span className="block font-bold text-xs leading-tight">{t.listen1}</span>
                  <span className="block text-[10.5px] text-[#C6841D] font-bold mt-0.5">
                    {t.listen2}
                  </span>
                </div>
              </div>

              {/* Chant Status Line */}
              <div className="text-center text-[11.5px] text-[#7A6E5C] pt-1">
                {isPlaying
                  ? DEFAULT_CONFIG.audio.playing[currentLang]
                  : DEFAULT_CONFIG.audio.idle[currentLang]}
              </div>

              {/* Promo Banner */}
              <div
                onClick={handleOpenPromoModal}
                className="bg-[#fdf3df] rounded-[22px] border border-[#ecdcae] p-4 flex items-center gap-3.5 cursor-pointer shadow-sm text-[#2B2117] hover:bg-[#faeed6] transition-colors"
              >
                <span className="text-[26px]">{DEFAULT_CONFIG.promo.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-sm text-[#2B2117]">{DEFAULT_CONFIG.promo.title}</div>
                  <div className="text-xs text-[#7A6E5C] mt-0.5">{DEFAULT_CONFIG.promo.subtitle}</div>
                </div>
                <span className="text-[#C6841D] text-lg font-bold">›</span>
              </div>

              {/* Closing / Sun Card */}
              <div className="bg-[#fffaf0] rounded-[24px] border border-[#ecdcae] p-6 text-center shadow-[0_16px_34px_-16px_rgba(80,50,10,0.35)] text-[#2B2117]">
                <div className="text-[28px]">☀️</div>
                <div className="font-serif font-semibold text-base mt-2 text-[#2B2117]">
                  {DEFAULT_CONFIG.closing.title[currentLang]}
                </div>
                <div className="text-[11.5px] text-[#7A6E5C] mt-1">
                  {DEFAULT_CONFIG.closing.subtitle[currentLang]}
                </div>
              </div>
            </main>

            <footer className="px-6 pb-4 text-[11px] text-[#8f7ea0] text-center">
              Preview build — dictionary lookups, timers and audio are illustrative for early access testers.
            </footer>
          </div>
        )}

        {/* ================= 2. FAVORITES TAB ================= */}
        {activeTab === "favorites" && (
          <div className="p-5 animate-fadeIn">
            <h2 className="font-serif font-semibold text-xl text-[#F8EFDE] text-center mb-5">
              Favorites / पसंदीदा
            </h2>

            {favorites.length === 0 ? (
              <div className="text-center text-[#c9b8d4] text-[13.5px] py-16 px-4">
                <span className="text-3xl block mb-3">🤍</span>
                <p>{t.favEmpty}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((fav, i) => (
                  <div
                    key={i}
                    className="bg-[#fffaf0] border border-[#ecdcae] rounded-2xl p-4 text-left shadow-sm text-[#2B2117]"
                  >
                    <div className="font-serif text-[17px] text-[#2B2117] mb-1 font-semibold">
                      {fav.snippet}
                    </div>
                    <div className="text-xs text-[#6C1F22] font-bold">{fav.citation}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= 3. HISTORY TAB ================= */}
        {activeTab === "history" && (
          <div className="p-5 animate-fadeIn">
            <h2 className="font-serif font-semibold text-xl text-[#F8EFDE] text-center mb-5">
              Reflection History / इतिहास
            </h2>

            <div className="space-y-3">
              {DEFAULT_CONFIG.history.map((h, i) => (
                <div
                  key={i}
                  className="bg-[#fffaf0] border border-[#ecdcae] rounded-2xl p-4 text-left shadow-sm text-[#2B2117]"
                >
                  <div className="font-serif text-[17px] text-[#2B2117] mb-1 font-semibold">
                    {h.title}
                  </div>
                  <div className="text-xs text-[#6C1F22] font-bold">{h.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 4. PROFILE TAB ================= */}
        {activeTab === "profile" && (
          <div className="p-5 space-y-4 animate-fadeIn">
            <h2 className="font-serif font-semibold text-xl text-[#F8EFDE] text-center mb-4">
              Profile & Sacred Membership / प्रोफ़ाइल
            </h2>

            {/* Profile Avatar Card */}
            <div className="bg-[#fffaf0] border border-[#ecdcae] rounded-3xl p-6 text-center shadow-md text-[#2B2117]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F3C978] to-[#C6841D] flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm">
                🙏
              </div>
              <div className="font-serif font-semibold text-[17px] text-[#2B2117]">
                {t.profileName}
              </div>
              <div className="text-[12px] text-[#7A6E5C] mt-1 max-w-[280px] mx-auto">
                {t.profileSub}
              </div>
            </div>

            {/* Sādhaka Sacred Membership Action Card */}
            <div className="bg-gradient-to-br from-[#3a2247] to-[#1c0f27] border border-[#E7A73E]/40 rounded-3xl p-5 shadow-lg text-[#F8EFDE] space-y-3">
              <div className="flex items-center space-x-2 text-[#F3C978]">
                <Crown className="w-5 h-5 text-[#E7A73E]" />
                <span className="font-serif font-bold text-base">Sādhaka & Rishi Membership</span>
              </div>
              <p className="text-xs text-[#d3c4dd] leading-relaxed">
                Unlock word-by-word Sanskrit etymology, offline master chanting audio, and commentaries from Shankaracharya & Sri Aurobindo.
              </p>
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="w-full bg-gradient-to-r from-[#F3C978] to-[#C6841D] text-[#3a1c00] font-bold text-xs py-3 px-4 rounded-xl border-none cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] transition-transform flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Explore Plans • 7-Day Free Trial</span>
              </button>
            </div>

            {/* Sacred Gurudakshina & Seva (80G Tax Exemption) */}
            <div className="bg-[#fffaf0] border border-[#ecdcae] rounded-3xl p-5 shadow-sm text-[#2B2117] space-y-2">
              <div className="flex items-center space-x-2 text-[#6C1F22]">
                <Heart className="w-5 h-5 text-rose-600 fill-rose-600/20" />
                <span className="font-serif font-bold text-sm">Sacred Gurudakshina & Seva</span>
              </div>
              <p className="text-[11.5px] text-[#7A6E5C]">
                Contribute to manuscript preservation and Vedic scholars. 100% transparent with 80G tax receipts.
              </p>
              <button
                onClick={() => setIsDonationModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#6C1F22] text-[#F8EFDE] hover:bg-[#85272a] transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Make a Sacred Contribution (80G)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4-Tab Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[520px] mx-auto bg-[#fffaf0] border-t border-[#ecdcae] flex justify-around items-center px-1.5 pt-2 pb-[calc(8px+env(safe-area-inset-bottom,0px))] z-30 shadow-lg">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-0.5 text-[10.5px] font-bold cursor-pointer transition-colors bg-transparent border-none ${
            activeTab === "home" ? "text-[#C6841D]" : "text-[#7A6E5C] grayscale opacity-75"
          }`}
        >
          <span className="text-[19px]">🏠</span>
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex flex-col items-center gap-0.5 text-[10.5px] font-bold cursor-pointer transition-colors bg-transparent border-none ${
            activeTab === "favorites" ? "text-[#C6841D]" : "text-[#7A6E5C] grayscale opacity-75"
          }`}
        >
          <span className="text-[19px]">🤍</span>
          <span>Favorites</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center gap-0.5 text-[10.5px] font-bold cursor-pointer transition-colors bg-transparent border-none ${
            activeTab === "history" ? "text-[#C6841D]" : "text-[#7A6E5C] grayscale opacity-75"
          }`}
        >
          <span className="text-[19px]">🕐</span>
          <span>History</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-0.5 text-[10.5px] font-bold cursor-pointer transition-colors bg-transparent border-none ${
            activeTab === "profile" ? "text-[#C6841D]" : "text-[#7A6E5C] grayscale opacity-75"
          }`}
        >
          <span className="text-[19px]">👤</span>
          <span>Profile</span>
        </button>
      </nav>

      {/* Waitlist Modal / Popup */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          className="fixed inset-0 max-w-[520px] mx-auto bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-5 animate-fadeIn"
        >
          <div className="w-full bg-gradient-to-b from-[#3a2247] via-[#241230] to-[#1c0f27] border border-[#E7A73E]/35 rounded-[24px] p-8 text-center relative shadow-[0_26px_55px_-20px_rgba(0,0,0,0.6)]">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/5 border border-white/15 text-[#F8EFDE] flex items-center justify-center cursor-pointer hover:bg-white/15 hover:rotate-90 transition-all"
              title="Close"
            >
              ✕
            </button>

            {/* Flickering Diya Oil Lamp */}
            <div className="relative w-[60px] h-[60px] mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#F3C978] to-[#C6841D] flex items-center justify-center font-serif text-[28px] text-[#3a1c00] shadow-[0_12px_26px_-8px_rgba(231,167,62,0.55)]">
              ॐ
              {/* Flame */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-[7px] h-4 bg-gradient-to-b from-[#ffe9a8] via-[#ff9d3d] to-transparent rounded-full blur-[0.3px] animate-pulse" />
            </div>

            <h2 className="font-serif font-semibold text-[22px] mb-3 text-[#F8EFDE]">
              {DEFAULT_CONFIG.modal.title}
            </h2>

            <p className="text-[13.5px] leading-relaxed text-[#d3c4dd] mb-6">
              {DEFAULT_CONFIG.modal.body}
            </p>

            <button
              onClick={handleJoinCTA}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#F3C978] to-[#C6841D] text-[#3a1c00] font-bold text-[15px] py-3.5 px-6 rounded-full border-none cursor-pointer shadow-[0_16px_30px_-12px_rgba(231,167,62,0.65)] active:scale-98 transition-transform font-sans"
            >
              {DEFAULT_CONFIG.modal.cta}
            </button>

            <div className="mt-3 text-[11.5px] text-[#F3C978] min-h-[16px]">
              {modalConfirmed ? DEFAULT_CONFIG.modal.confirmNote : ""}
            </div>
          </div>
        </div>
      )}

      {/* Floating "✦ Join Waitlist" Reopen Button */}
      {isReopenFabVisible && (
        <button
          onClick={handleOpenPromoModal}
          className="fixed bottom-[calc(76px+14px+env(safe-area-inset-bottom,0px))] right-5 bg-gradient-to-b from-[#F3C978] to-[#C6841D] text-[#3a1c00] font-bold text-xs px-4 py-2.5 rounded-full border-none cursor-pointer shadow-[0_14px_26px_-10px_rgba(231,167,62,0.6)] flex items-center gap-2 z-30 animate-fadeIn"
        >
          ✦ Join Waitlist
        </button>
      )}

      {/* Sādhaka Sacred Membership Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        lang={currentLang}
      />

      {/* Sacred Gurudakshina & Seva (80G Tax Exemption) Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        lang={currentLang}
      />
    </div>
  );
};
