import React, { useState } from "react";
import {
  Calendar,
  Moon,
  Sun,
  Sparkles,
  Bell,
  BellCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  BookOpen,
  Flame,
  Compass,
} from "lucide-react";
import { soundEngine } from "../utils/audio";

export interface TithiItem {
  id: string;
  nameEn: string;
  nameHi: string;
  tithi: string;
  paksha: "Shukla" | "Krishna";
  dateFormatted: string;
  dayOfWeek: string;
  category: "ekadashi" | "purnima_amavasya" | "festival" | "pradosh";
  significance: string;
  observance: string;
  recommendedVerseId?: string;
  recommendedVerseTitle?: string;
}

// Authentic Tithis & Parvs for the current month (Bhadrapada - Ashvina / September 2026)
export const CURRENT_MONTH_TITHIS: TithiItem[] = [
  {
    id: "janmashtami-2026",
    nameEn: "Krishna Janmashtami",
    nameHi: "श्रीकृष्ण जन्माष्टमी",
    tithi: "Ashtami (अष्टमी)",
    paksha: "Krishna",
    dateFormatted: "Sep 4, 2026",
    dayOfWeek: "Friday",
    category: "festival",
    significance: "The supreme advent of Bhagavan Sri Krishna, speaker of the sacred Bhagavad Gita.",
    observance: "Nirjala/Phalahar fast, midnight Krishna Dhyana, recitation of Gita Chapter 12 & 15.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Karma Yoga",
  },
  {
    id: "aja-ekadashi-2026",
    nameEn: "Aja Ekadashi",
    nameHi: "अजा एकादशी",
    tithi: "Ekadashi (एकादशी)",
    paksha: "Krishna",
    dateFormatted: "Sep 8, 2026",
    dayOfWeek: "Tuesday",
    category: "ekadashi",
    significance: "Sacred Krishna Paksha Ekadashi destroying past obstacles and cultivating deep dispassion.",
    observance: "Grain-free fasting, unbroken Om Namo Bhagavate Vasudevaya japa, evening reflection.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Duty & Detachment",
  },
  {
    id: "pradosh-krishna-2026",
    nameEn: "Bhadrapada Pradosh Vrat",
    nameHi: "प्रदोष व्रत (कृष्ण)",
    tithi: "Trayodashi (त्रयोदशी)",
    paksha: "Krishna",
    dateFormatted: "Sep 9, 2026",
    dayOfWeek: "Wednesday",
    category: "pradosh",
    significance: "Sacred twilight hour dedicated to Mahadeva Shiva for emotional equilibrium and peaceful mind.",
    observance: "Twilight meditation during sandhya period, chanting Om Namah Shivaya.",
    recommendedVerseId: "mandukya-mantra-1",
    recommendedVerseTitle: "Mandukya 1 · Sound of OM",
  },
  {
    id: "bhadrapada-amavasya-2026",
    nameEn: "Bhadrapada Amavasya (Darsha)",
    nameHi: "भाद्रपद अमावस्या",
    tithi: "Amavasya (अमावस्या)",
    paksha: "Krishna",
    dateFormatted: "Sep 11, 2026",
    dayOfWeek: "Friday",
    category: "purnima_amavasya",
    significance: "Stillness of the cosmic lunar cycle, deep inward contemplation and ancestral gratefulness.",
    observance: "Silent contemplation, breath awareness, Sattvic mindfulness.",
    recommendedVerseId: "yoga-sutra-1-2",
    recommendedVerseTitle: "Yoga Sutra 1.2 · Chitta Vritti",
  },
  {
    id: "ganesh-chaturthi-2026",
    nameEn: "Ganesh Chaturthi (Vinayaka)",
    nameHi: "गणेश चतुर्थी",
    tithi: "Shukla Chaturthi (चतुर्थी)",
    paksha: "Shukla",
    dateFormatted: "Sep 14, 2026",
    dayOfWeek: "Monday",
    category: "festival",
    significance: "Advent of Sri Vighnaharta Ganesha, deity of auspicious intellect, discrimination, and wisdom.",
    observance: "Modak offerings, study of sacred mantras, contemplation on removal of inner doubts.",
    recommendedVerseId: "isha-upanishad-1",
    recommendedVerseTitle: "Isha Upanishad 1 · Divine Presence",
  },
  {
    id: "rishi-panchami-2026",
    nameEn: "Rishi Panchami",
    nameHi: "ऋषि पंचमी",
    tithi: "Shukla Panchami (पंचमी)",
    paksha: "Shukla",
    dateFormatted: "Sep 16, 2026",
    dayOfWeek: "Wednesday",
    category: "festival",
    significance: "Reverence to the ancient Vedic Saptarishis whose realizations form the Upanishads and Shrutis.",
    observance: "Scripture study, meditation on Rishi lineage and eternal Dharma.",
    recommendedVerseId: "yoga-sutra-2-46",
    recommendedVerseTitle: "Yoga Sutra 2.46 · Sthira Sukham",
  },
  {
    id: "parivartini-ekadashi-2026",
    nameEn: "Parivartini / Parsva Ekadashi",
    nameHi: "परिवर्तिनी एकादशी",
    tithi: "Shukla Ekadashi (एकादशी)",
    paksha: "Shukla",
    dateFormatted: "Sep 22, 2026",
    dayOfWeek: "Tuesday",
    category: "ekadashi",
    significance: "The cosmic turn of Mahavishnu in Yoga Nidra. Bestows spiritual elevation and mental clarity.",
    observance: "Complete/partial fast, continuous awareness of divine presence, Gita recitation.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Nishkama Karma",
  },
  {
    id: "anant-chaturdashi-2026",
    nameEn: "Anant Chaturdashi",
    nameHi: "अनंत चतुर्दशी",
    tithi: "Shukla Chaturdashi (चतुर्दशी)",
    paksha: "Shukla",
    dateFormatted: "Sep 25, 2026",
    dayOfWeek: "Friday",
    category: "festival",
    significance: "Worship of the Boundless Infinite Reality (Ananta Brahman) and holy conclusion of Ganeshotsav.",
    observance: "Tying sacred protective cord, meditation on timeless consciousness.",
    recommendedVerseId: "mandukya-mantra-1",
    recommendedVerseTitle: "Mandukya 1 · Eternal Brahman",
  },
  {
    id: "bhadrapada-purnima-2026",
    nameEn: "Bhadrapada Purnima (Satyanarayan)",
    nameHi: "भाद्रपद पूर्णिमा (महालया प्रारंभ)",
    tithi: "Purnima (पूर्णिमा)",
    paksha: "Shukla",
    dateFormatted: "Sep 26, 2026",
    dayOfWeek: "Saturday",
    category: "purnima_amavasya",
    significance: "Radiant Full Moon illumination, Satyanarayan Vrat, and commencement of holy Pitru Paksha.",
    observance: "Moonlight Dhyana, offering of pure gratitude, Satyanarayan katha reflection.",
    recommendedVerseId: "isha-upanishad-1",
    recommendedVerseTitle: "Isha Upanishad 1 · All is Divine",
  },
  {
    id: "indira-ekadashi-2026",
    nameEn: "Indira Ekadashi (Pitru Paksha)",
    nameHi: "इन्दिरा एकादशी",
    tithi: "Krishna Ekadashi (एकादशी)",
    paksha: "Krishna",
    dateFormatted: "Oct 7, 2026",
    dayOfWeek: "Wednesday",
    category: "ekadashi",
    significance: "Ekadashi occurring during Pitru Paksha. Dedicated to peace of all living and departed beings.",
    observance: "Strict fasting, selfless charity, prayers for universal liberation.",
    recommendedVerseId: "gita-2-47",
    recommendedVerseTitle: "Gita 2.47 · Selfless Surrender",
  },
];

interface ImportantTithisParvProps {
  theme?: "sandstone" | "amethyst" | "light" | "festival";
  onSelectVerse?: (verseId: string) => void;
  defaultCollapsed?: boolean;
}

export const ImportantTithisParv: React.FC<ImportantTithisParvProps> = ({
  theme = "sandstone",
  onSelectVerse,
  defaultCollapsed = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);
  const [activeFilter, setActiveFilter] = useState<"all" | "ekadashi" | "purnima_amavasya" | "festival">("all");
  const [savedReminders, setSavedReminders] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("sutrasparsh_tithi_reminders");
      return saved ? JSON.parse(saved) : ["aja-ekadashi-2026", "parivartini-ekadashi-2026", "janmashtami-2026"];
    } catch {
      return ["aja-ekadashi-2026", "parivartini-ekadashi-2026"];
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isLight = theme === "light";
  const isFestival = theme === "festival";
  const isAmethyst = theme === "amethyst";
  const isSandstone = theme === "sandstone" || (!isLight && !isFestival && !isAmethyst);

  const toggleCollapse = () => {
    soundEngine.playTempleBell(isCollapsed ? 520 : 440);
    setIsCollapsed((prev) => !prev);
  };

  const filteredItems = CURRENT_MONTH_TITHIS.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "ekadashi") return item.category === "ekadashi";
    if (activeFilter === "purnima_amavasya") return item.category === "purnima_amavasya" || item.category === "pradosh";
    if (activeFilter === "festival") return item.category === "festival";
    return true;
  });

  const handleToggleReminder = (id: string, name: string) => {
    const isSaved = savedReminders.includes(id);
    const updated = isSaved
      ? savedReminders.filter((item) => item !== id)
      : [...savedReminders, id];

    setSavedReminders(updated);
    try {
      localStorage.setItem("sutrasparsh_tithi_reminders", JSON.stringify(updated));
    } catch {}

    soundEngine.playTempleBell(440);
    setToastMessage(
      isSaved
        ? `Reminder removed for ${name}`
        : `Sacred Reminder set for ${name}! 🔔`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const goldAccent = isLight ? "#B9680D" : isFestival ? "#FFB300" : isAmethyst ? "#C4A8E6" : "#E8921A";
  const sectionTitleColor = isLight ? "text-stone-900" : isFestival ? "text-[#FFF6E3]" : isAmethyst ? "text-[#EDE0F8]" : "text-stone-100";
  const cardBorderClass = isLight ? "border-stone-200" : isFestival ? "border-[#FF8A00]/25" : isAmethyst ? "border-[#52297A]/40" : "border-white/10";
  const cardBgClass = isLight ? "bg-white hover:bg-[#FAF7F0]" : isFestival ? "bg-[#3D0A11]/90 hover:bg-[#4E0D16]" : isAmethyst ? "bg-[#180C2C]/90 hover:bg-[#22123D]" : "bg-stone-900/70 hover:bg-stone-900/90";

  return (
    <div id="important-tithis-parv-section" className="px-4 space-y-2.5 pt-3">
      {/* Interactive Collapsible Section Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={toggleCollapse}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleCollapse();
          }
        }}
        aria-expanded={!isCollapsed}
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${cardBgClass} ${cardBorderClass} shadow-xs hover:border-amber-500/40`}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0 text-base">
            📅
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className={`font-serif-sacred text-sm sm:text-base font-bold tracking-tight truncate ${sectionTitleColor}`}>
                Important Tithis & Parv Dates • महत्वपूर्ण तिथियाँ एवं पर्व
              </h3>
              <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 font-semibold">
                10 Dates
              </span>
            </div>
            <p className="text-xs text-stone-500 truncate">
              Bhadrapada – Ashvina (भाद्रपद - आश्विन) • September 2026
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-400">
            <Moon className="w-3 h-3 text-amber-400" />
            <span>Shukla & Krishna</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center space-x-1.5 text-xs text-amber-300 transition-all font-semibold cursor-pointer"
            aria-label={isCollapsed ? "Expand Tithis & Parv section" : "Collapse Tithis & Parv section"}
          >
            <span>{isCollapsed ? "Expand" : "Collapse"}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsed State Summary Strip */}
      {isCollapsed && (
        <div
          role="button"
          tabIndex={0}
          onClick={toggleCollapse}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleCollapse();
            }
          }}
          className="px-3.5 py-2 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-[11.5px] text-stone-400 flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center space-x-2 truncate">
            <span className="text-amber-400 font-bold flex-shrink-0">Upcoming:</span>
            <span className="truncate">🌿 Aja Ekadashi (Sep 8) • 🪔 Parivartini Ekadashi (Sep 22) • 🌕 Ananta Chaturdashi (Sep 24)</span>
          </div>
          <span className="text-amber-400 font-semibold flex items-center space-x-0.5 ml-2 flex-shrink-0">
            <span>Tap to View All</span>
            <ChevronDown className="w-3 h-3" />
          </span>
        </div>
      )}

      {/* Expanded Content: Filter Tabs & Sacred Tithis Card List */}
      {!isCollapsed && (
        <div className="space-y-3.5 pt-1 animate-fadeIn">
          {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "all" as const, label: "All Tithis", icon: "✨" },
          { id: "ekadashi" as const, label: "Ekadashi Vrat (एकादशी)", icon: "🌿" },
          { id: "purnima_amavasya" as const, label: "Purnima & Amavasya", icon: "🌕" },
          { id: "festival" as const, label: "Utsav & Parv (पर्व)", icon: "🪔" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer border ${
              activeFilter === tab.id
                ? isLight
                  ? "bg-amber-100 text-amber-950 border-amber-400 shadow-xs"
                  : "bg-amber-500/25 text-amber-200 border-amber-500/40 shadow-sm"
                : isLight
                ? "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                : "bg-white/5 text-stone-400 border-white/5 hover:bg-white/10 hover:text-stone-200"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tithis & Parv Cards List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isReminded = savedReminders.includes(item.id);

          return (
            <div
              key={item.id}
              className={`p-4 sm:p-4.5 rounded-2xl border transition-all shadow-sm space-y-2.5 ${cardBgClass} ${cardBorderClass}`}
            >
              {/* Top Row: Date, Tithi Pill, Reminder Toggle */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 flex-wrap">
                  {/* Date Badge */}
                  <span
                    className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                      isLight
                        ? "bg-amber-100/90 text-amber-950 border-amber-300"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {item.dateFormatted} · {item.dayOfWeek}
                  </span>

                  {/* Paksha / Tithi Badge */}
                  <span
                    className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md border ${
                      item.paksha === "Shukla"
                        ? isLight
                          ? "bg-stone-100 text-stone-800 border-stone-200"
                          : "bg-stone-800 text-stone-200 border-stone-700"
                        : isLight
                        ? "bg-stone-100 text-stone-700 border-stone-200"
                        : "bg-stone-800/80 text-stone-300 border-stone-700"
                    }`}
                  >
                    {item.paksha} Paksha · {item.tithi}
                  </span>
                </div>

                {/* Reminder Notification Button */}
                <button
                  onClick={() => handleToggleReminder(item.id, item.nameEn)}
                  title={isReminded ? "Remove Reminder" : "Set Sacred Reminder"}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer border flex-shrink-0 flex items-center space-x-1 ${
                    isReminded
                      ? isLight
                        ? "bg-amber-100 text-amber-900 border-amber-400 font-bold"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                      : isLight
                      ? "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
                      : "bg-white/5 text-stone-400 border-white/10 hover:bg-white/10 hover:text-stone-200"
                  }`}
                >
                  {isReminded ? (
                    <>
                      <BellCheck className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] hidden xs:inline">Reminded</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span className="text-[10px] hidden xs:inline">Remind</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title & Sanskrit Name */}
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <h4
                    className="font-serif-sacred text-base font-bold tracking-tight"
                    style={{ color: isLight ? "#1C0F05" : "#FFF7ED" }}
                  >
                    {item.nameEn}
                  </h4>
                  <span
                    className="font-sanskrit text-sm font-semibold"
                    style={{ color: goldAccent }}
                  >
                    ({item.nameHi})
                  </span>
                </div>
                <p className={`text-xs leading-relaxed mt-1 ${isLight ? "text-stone-700" : "text-stone-300"}`}>
                  {item.significance}
                </p>
              </div>

              {/* Observance & Sādhana Injunction */}
              <div
                className={`p-2.5 rounded-xl text-xs space-y-1 border ${
                  isLight
                    ? "bg-[#FBF8F3] border-[#E8DFC8] text-stone-800"
                    : "bg-black/30 border-white/5 text-stone-300"
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-[11px] text-amber-500">
                  <Flame className="w-3 h-3" />
                  <span>Sādhana Observance (विधि):</span>
                </div>
                <div className="leading-snug text-[11.5px] pl-4">
                  {item.observance}
                </div>
              </div>

              {/* Recommended Shloka Action */}
              {item.recommendedVerseId && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1.5 text-xs text-stone-500 truncate mr-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span className="truncate">
                      Chant: <strong className={isLight ? "text-stone-800" : "text-stone-200"}>{item.recommendedVerseTitle}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectVerse?.(item.recommendedVerseId!)}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors flex items-center space-x-1 flex-shrink-0 cursor-pointer shadow-xs"
                  >
                    <span>Read Shloka</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`text-center py-1.5 px-3 rounded-xl text-xs font-bold border animate-fadeIn ${
            isLight
              ? "bg-amber-100 text-amber-950 border-amber-300"
              : "bg-amber-500/20 text-amber-200 border-amber-500/40"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};
