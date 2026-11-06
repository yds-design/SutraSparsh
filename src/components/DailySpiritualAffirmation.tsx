import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Share2,
  Heart,
  Feather,
  BookOpen,
} from "lucide-react";
import { speechSafetyEngine } from "../utils/speech";

export interface SpiritualAffirmation {
  id: string;
  sanskrit: string;
  transliteration: string;
  english: string;
  hindi: string;
  source: string;
  themeCategory: "Peace" | "Resilience" | "Wisdom" | "Joy" | "Courage" | "Compassion";
  sanskritCategory: string;
}

export const AFFIRMATIONS_DATA: SpiritualAffirmation[] = [
  {
    id: "aff-1",
    sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।",
    transliteration: "uddhared ātmanātmānaṁ nātmānam avasādayet |",
    english: "Elevate yourself through the power of your mind; do not degrade yourself. Your mind is your greatest friend.",
    hindi: "अपने मन के द्वारा अपना उद्धार करें, स्वयं को कभी निराश न करें।",
    source: "श्रीमद्भगवद्गीता ६.५",
    themeCategory: "Resilience",
    sanskritCategory: "धैर्य एवं उत्थान",
  },
  {
    id: "aff-2",
    sanskrit: "समत्वं योग उच्यते।",
    transliteration: "samatvaṁ yoga ucyate |",
    english: "Equanimity in success and failure is called Yoga. Today, I remain anchored in inner stillness.",
    hindi: "सुख-दुःख और सफलता-विफलता में समभाव ही योग है।",
    source: "श्रीमद्भगवद्गीता २.४८",
    themeCategory: "Peace",
    sanskritCategory: "समत्व भाव",
  },
  {
    id: "aff-3",
    sanskrit: "आनन्दो ब्रह्मेति व्यजानात्।",
    transliteration: "ānando brahmeti vyajānāt |",
    english: "Recognize that pure joy is the true essence of the Divine. All creation springs from joy and abides in joy.",
    hindi: "आनन्द ही ब्रह्म का वास्तविक स्वरूप है — समस्त सृष्टि आनन्द से उत्पन्न होती है।",
    source: "तैत्तिरीयोपनिषद् ३.६.१",
    themeCategory: "Joy",
    sanskritCategory: "आनन्द स्वरूप",
  },
  {
    id: "aff-4",
    sanskrit: "अभयं सत्त्वसंशुद्धिर्ज्ञानयोगव्यवस्थितिः।",
    transliteration: "abhayaṁ sattvasaṁśuddhir jñānayoga-vyavasthitiḥ |",
    english: "Fearlessness, purity of heart, and unwavering devotion to knowledge are the supreme divine virtues.",
    hindi: "निर्भयता, अंतःकरण की शुद्धि और ज्ञान में अडिग स्थिति ही दैवी संपदा है।",
    source: "श्रीमद्भगवद्गीता १६.१",
    themeCategory: "Courage",
    sanskritCategory: "अभय एवं तेज",
  },
  {
    id: "aff-5",
    sanskrit: "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।",
    transliteration: "sarve bhavantu sukhinaḥ sarve santu nirāmayāḥ |",
    english: "May all beings everywhere be happy, may all be free from illness, may all perceive auspiciousness.",
    hindi: "सभी सुखी हों, सभी रोगमुक्त हों, सभी का कल्याण हो।",
    source: "बृहदारण्यक उपनिषद् शान्ति मन्त्र",
    themeCategory: "Compassion",
    sanskritCategory: "विश्व कल्याण",
  },
  {
    id: "aff-6",
    sanskrit: "तेजस्वि नावधीतमस्तु मा विद्विषावहै।",
    transliteration: "tejasvi nāv adhītam astu mā vidviṣāvahai |",
    english: "May our intellect become luminous and brilliant; may there never be any discord or enmity between us.",
    hindi: "हमारा अध्ययन तेजस्वी बने और हम परस्पर कभी द्वेष न करें।",
    source: "कठोपनिषद् शान्ति पाठ",
    themeCategory: "Wisdom",
    sanskritCategory: "तेजस्विता",
  },
  {
    id: "aff-7",
    sanskrit: "सत्यमेव जयते नानृतम्।",
    transliteration: "satyameva jayate nānṛtam |",
    english: "Truth alone triumphs, never falsehood. The path of divine illumination is paved with truth.",
    hindi: "सत्य की ही सदा विजय होती है, असत्य की नहीं।",
    source: "मुण्डकोपनिषद् ३.१.६",
    themeCategory: "Wisdom",
    sanskritCategory: "सत्य निष्ठा",
  },
  {
    id: "aff-8",
    sanskrit: "यद् भावं तद् भवति।",
    transliteration: "yad bhāvaṁ tad bhavati |",
    english: "As you think and feel in your deepest awareness, so you become. Cultivate radiant, sacred thoughts.",
    hindi: "जैसी भावना होती है, वैसा ही स्वरूप निर्मित होता है।",
    source: "ब्रह्मबिन्दु उपनिषद्",
    themeCategory: "Resilience",
    sanskritCategory: "संकल्प शक्ति",
  },
  {
    id: "aff-9",
    sanskrit: "शान्तिः प्रशान्तिः परमा शान्तिः।",
    transliteration: "śāntiḥ praśāntiḥ paramā śāntiḥ |",
    english: "Peace within the physical, peace in the mental, and supreme transcendental peace in the spirit.",
    hindi: "शारीरिक, मानसिक और परम आध्यात्मिक शान्ति की अनुभूति।",
    source: "वैदिक मन्त्र संग्रह",
    themeCategory: "Peace",
    sanskritCategory: "परम शान्ति",
  },
  {
    id: "aff-10",
    sanskrit: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।",
    transliteration: "yogasthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya |",
    english: "Perform your daily duties established in Yoga, casting aside all anxieties over selfish attachment.",
    hindi: "योग में स्थिर होकर, आसक्ति त्यागकर अपने कर्तव्य कर्म करो।",
    source: "श्रीमद्भगवद्गीता २.४८",
    themeCategory: "Wisdom",
    sanskritCategory: "कर्म योग",
  },
];

interface DailySpiritualAffirmationProps {
  theme?: string;
  onReflect?: (affirmation: SpiritualAffirmation) => void;
  className?: string;
}

export const DailySpiritualAffirmation: React.FC<DailySpiritualAffirmationProps> = ({
  theme = "sandstone",
  onReflect,
  className = "",
}) => {
  const isLight = theme === "light";
  const isPrismPulse = theme === "prism-pulse";
  const isFestival = theme === "festival";
  const isAmethyst = theme === "amethyst";
  const isGoldenHour = theme === "golden-hour";
  const isLightCanvas = isLight || isPrismPulse;

  // Pick deterministic affirmation for today's date or user override
  const getDailyIndex = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return dayOfYear % AFFIRMATIONS_DATA.length;
  };

  const [currentIndex, setCurrentIndex] = useState<number>(getDailyIndex);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentAffirmation = AFFIRMATIONS_DATA[currentIndex];

  const handleNext = () => {
    speechSafetyEngine.cancel();
    setIsPlayingAudio(false);
    setCurrentIndex((prev) => (prev + 1) % AFFIRMATIONS_DATA.length);
  };

  const handleCopy = async () => {
    const textToCopy = `${currentAffirmation.sanskrit}\n${currentAffirmation.transliteration}\n"${currentAffirmation.english}"\n${currentAffirmation.source} — SutraSparsh`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      speechSafetyEngine.cancel();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speechSafetyEngine.speak(currentAffirmation.sanskrit, {
        lang: "sa",
        rate: 0.85,
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      speechSafetyEngine.cancel();
    };
  }, []);

  return (
    <div
      data-testid="daily-spiritual-affirmation-card"
      className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition-all shadow-md ${
        isLight
          ? "bg-[#FFFDF8] border-[#E8DCC2] text-[#261B12]"
          : isPrismPulse
          ? "bg-white border-stone-200 text-[#1e1b2e]"
          : isFestival
          ? "bg-[#450A12]/90 border-[#FF8A00]/30 text-[#FFF6E3]"
          : isAmethyst
          ? "bg-[#180C2C]/90 border-[#52297A]/40 text-[#EDE0F8]"
          : isGoldenHour
          ? "bg-[#281B12]/90 border-[#C9822B]/35 text-[#FFF4D8]"
          : "bg-gradient-to-br from-amber-950/40 via-stone-900/90 to-stone-950 border-amber-500/25 text-stone-100"
      } ${className}`}
    >
      {/* Background ambient sacred glow */}
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          isLight
            ? "bg-amber-400/10"
            : isPrismPulse
            ? "bg-purple-500/10"
            : "bg-orange-500/10"
        }`}
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div className="flex items-center space-x-2">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
              isLight
                ? "bg-[#FBEFD3] text-[#874606] border border-[#DECB9F]"
                : isPrismPulse
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}
          >
            ॐ
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span
                className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest ${
                  isLight
                    ? "text-[#C65507]"
                    : isPrismPulse
                    ? "text-purple-700"
                    : "text-amber-400"
                }`}
              >
                DAILY SPIRITUAL AFFIRMATION
              </span>
              <span className="text-[10px] opacity-70 font-mono">
                · {currentAffirmation.sanskritCategory}
              </span>
            </div>
            <p
              className={`text-[10.5px] font-medium ${
                isLight ? "text-[#6E5C4E]" : "text-stone-400"
              }`}
            >
              Rotating Daily Sanskrit Thought for Mindfulness &amp; Clarity
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          {/* Rotate / Next Affirmation */}
          <button
            type="button"
            onClick={handleNext}
            className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center space-x-1 ${
              isLight
                ? "bg-[#F5EEDB] hover:bg-[#EFE6D0] border-[#E8DCC2] text-[#4A3A2F]"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-stone-300"
            }`}
            title="Rotate to Next Sanskrit Affirmation (अग्रे)"
            aria-label="Next Affirmation"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-semibold hidden xs:inline">Next</span>
          </button>

          {/* Audio Pronunciation */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              isPlayingAudio
                ? "bg-amber-500/25 border-amber-500/60 text-amber-200 animate-pulse"
                : isLight
                ? "bg-[#F5EEDB] hover:bg-[#EFE6D0] border-[#E8DCC2] text-[#4A3A2F]"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-stone-300"
            }`}
            title={isPlayingAudio ? "Pause Audio Recitation" : "Listen to Sanskrit Recitation"}
            aria-label="Listen to Affirmation"
          >
            {isPlayingAudio ? (
              <VolumeX className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-500" />
            )}
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              isLight
                ? "bg-[#F5EEDB] hover:bg-[#EFE6D0] border-[#E8DCC2] text-[#4A3A2F]"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-stone-300"
            }`}
            title="Copy Affirmation to Clipboard"
            aria-label="Copy Affirmation"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-amber-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main Affirmation Quote Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAffirmation.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="space-y-2.5 relative z-10"
        >
          {/* Sanskrit Devanagari Typography */}
          <div className="text-center py-1">
            <h3
              className={`font-serif-sacred text-xl sm:text-2xl font-bold tracking-wide leading-relaxed ${
                isLight
                  ? "text-[#1E1610]"
                  : isPrismPulse
                  ? "text-[#1e1b2e]"
                  : "text-amber-200"
              }`}
            >
              {currentAffirmation.sanskrit}
            </h3>
            <p
              className={`text-xs sm:text-sm font-sans tracking-wide italic mt-1 ${
                isLight
                  ? "text-[#544134]"
                  : isPrismPulse
                  ? "text-[#4B5563]"
                  : "text-amber-400/80"
              }`}
            >
              {currentAffirmation.transliteration}
            </p>
          </div>

          {/* English Contemplative Meaning */}
          <div
            className={`rounded-2xl p-3 sm:p-3.5 border text-center ${
              isLight
                ? "bg-[#FAF5EA] border-[#E8DCC2] text-[#3D2C1E]"
                : isPrismPulse
                ? "bg-purple-50/70 border-purple-200 text-stone-800"
                : "bg-stone-900/60 border-stone-800 text-stone-200"
            }`}
          >
            <p className="text-xs sm:text-sm leading-relaxed font-normal">
              "{currentAffirmation.english}"
            </p>
            {currentAffirmation.hindi && (
              <p
                className={`text-[11.5px] font-sanskrit mt-1.5 ${
                  isLight ? "text-[#874606]" : "text-amber-300/80"
                }`}
              >
                {currentAffirmation.hindi}
              </p>
            )}
          </div>

          {/* Citation & Reflection CTA */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span
              className={`font-semibold ${
                isLight ? "text-[#874606]" : "text-amber-400"
              }`}
            >
              {currentAffirmation.source}
            </span>

            {onReflect && (
              <button
                type="button"
                onClick={() => onReflect(currentAffirmation)}
                className={`inline-flex items-center space-x-1 font-semibold transition-colors hover:underline cursor-pointer ${
                  isLight ? "text-[#C65507]" : "text-amber-300"
                }`}
              >
                <Feather className="w-3 h-3" />
                <span>Reflect in Journal</span>
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
