import React, { useState, useEffect } from "react";
import { Sunrise, Bell, BellRing, Sparkles, Volume2, CheckCircle2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { soundEngine } from "../utils/audio";

interface BrahmaMuhurtaTimerProps {
  theme?: "sandstone" | "amethyst" | "light" | "festival";
  onOpenPref?: () => void;
  compact?: boolean;
}

export const BrahmaMuhurtaTimer: React.FC<BrahmaMuhurtaTimerProps> = ({
  theme = "sandstone",
  onOpenPref,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isLive: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, isLive: false });

  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sutrasparsh_muhurta_reminder");
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [showWisdom, setShowWisdom] = useState<boolean>(false);

  const isLight = theme === "light";
  const isFestival = theme === "festival";
  const isAmethyst = theme === "amethyst";
  const isSandstone = theme === "sandstone" || (!isLight && !isFestival && !isAmethyst);

  // Compute countdown to Brahma Muhurta (traditionally 04:30 AM local time, 48-min window until 05:18 AM)
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();

      // Brahma Muhurta window: 04:24 AM to 05:18 AM (roughly 4:30 to 5:18)
      const currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;
      const startSeconds = 4 * 3600 + 30 * 60; // 04:30:00
      const endSeconds = 5 * 3600 + 18 * 60;   // 05:18:00

      if (currentTotalSeconds >= startSeconds && currentTotalSeconds <= endSeconds) {
        // We are currently in Brahma Muhurta!
        const remainingLiveSeconds = endSeconds - currentTotalSeconds;
        const h = Math.floor(remainingLiveSeconds / 3600);
        const m = Math.floor((remainingLiveSeconds % 3600) / 60);
        const s = remainingLiveSeconds % 60;
        setTimeLeft({ hours: h, minutes: m, seconds: s, isLive: true });
      } else {
        // Not in live window; calculate countdown to next 04:30 AM
        let diffSeconds: number;
        if (currentTotalSeconds < startSeconds) {
          // Earlier today
          diffSeconds = startSeconds - currentTotalSeconds;
        } else {
          // Tomorrow at 04:30 AM
          const secondsUntilMidnight = 24 * 3600 - currentTotalSeconds;
          diffSeconds = secondsUntilMidnight + startSeconds;
        }

        const h = Math.floor(diffSeconds / 3600);
        const m = Math.floor((diffSeconds % 3600) / 60);
        const s = diffSeconds % 60;
        setTimeLeft({ hours: h, minutes: m, seconds: s, isLive: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleReminder = () => {
    const next = !reminderEnabled;
    setReminderEnabled(next);
    try {
      localStorage.setItem("sutrasparsh_muhurta_reminder", JSON.stringify(next));
    } catch {}

    soundEngine.playTempleBell(528); // Miraculous 528Hz awakening tone
    if (next) {
      setFeedbackToast("04:30 AM Brahma Muhūrta Awakening Reminder Active! 🔔");
    } else {
      setFeedbackToast("Awakening Reminder Paused");
    }
    setTimeout(() => setFeedbackToast(null), 3200);
  };

  const handlePlayChime = () => {
    soundEngine.playTempleBell(432);
    setFeedbackToast("Vedic 432Hz Dawn Resonance chimed 🪔");
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  // Card theme classes
  const cardBgClass = isLight
    ? "bg-gradient-to-br from-[#FFFBF4] via-[#FDF6EB] to-[#F5EADB] border-[#E8D7C0] text-stone-900 shadow-md"
    : isFestival
    ? "bg-gradient-to-br from-[#5E111C] via-[#480C14] to-[#36080E] border-[#FF8A00]/40 text-[#FFF6E3] shadow-xl"
    : isAmethyst
    ? "bg-gradient-to-br from-[#251640] via-[#1A0F2E] to-[#120822] border-[#7D46B8]/40 text-[#EDE0F8] shadow-xl"
    : "bg-gradient-to-br from-[#271406] via-[#1D0E04] to-[#140902] border-[#914210]/40 text-[#F5E4C8] shadow-xl";

  const goldAccent = isLight ? "#B9680D" : isFestival ? "#FFB300" : isAmethyst ? "#C4A8E6" : "#E8921A";
  const subTextColor = isLight ? "text-stone-700" : isFestival ? "text-amber-100/90" : isAmethyst ? "text-purple-200/90" : "text-stone-300";

  return (
    <div
      id="brahma-muhurta-timer-card"
      className={`mx-4 rounded-3xl p-4 sm:p-5 border transition-all relative overflow-hidden ${cardBgClass}`}
    >
      {/* Subtle background glow */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-25"
        style={{ backgroundColor: goldAccent }}
      />

      <div className="relative z-10 space-y-3.5">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                timeLeft.isLive
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 animate-pulse shadow-md"
                  : isLight
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
              }`}
            >
              <Sunrise className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span
                  className="font-serif-sacred text-sm sm:text-base font-bold tracking-tight truncate"
                  style={{ color: isLight ? "#2B1A08" : "#FFF7ED" }}
                >
                  Brahma Muhūrta
                </span>
                <span
                  className="font-sanskrit text-xs px-1.5 py-0.2 rounded"
                  style={{
                    backgroundColor: isLight ? "rgba(185,104,13,0.12)" : "rgba(232,146,26,0.15)",
                    color: goldAccent,
                  }}
                >
                  ब्रह्म मुहूर्त
                </span>
              </div>
              <div className={`text-[11px] leading-tight mt-0.5 ${subTextColor}`}>
                Dawn Window: <span className="font-semibold">04:30 AM – 05:18 AM</span> (48 Mins)
              </div>
            </div>
          </div>

          {/* Live Status Pill */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {timeLeft.isLive ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold uppercase bg-emerald-500 text-stone-950 animate-pulse shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-950" />
                <span>Active Now</span>
              </span>
            ) : (
              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  isLight
                    ? "bg-white/80 text-amber-900 border-amber-300"
                    : "bg-black/30 text-amber-300 border-amber-500/30"
                }`}
              >
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Next Dawn</span>
              </span>
            )}
          </div>
        </div>

        {/* Ticking Countdown Timer Blocks */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 py-1">
          {/* Hours Block */}
          <div
            className={`p-2.5 sm:p-3 rounded-2xl text-center border transition-all ${
              isLight
                ? "bg-white/90 border-[#E8DCCB] shadow-xs"
                : "bg-black/40 border-white/10 shadow-inner"
            }`}
          >
            <div
              className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: isLight ? "#1C0F05" : "#FFF7ED" }}
            >
              {String(timeLeft.hours).padStart(2, "0")}
            </div>
            <div
              className={`text-[9.5px] font-bold uppercase tracking-wider mt-0.5 ${
                isLight ? "text-stone-600" : "text-stone-400"
              }`}
            >
              Hours · घंटे
            </div>
          </div>

          {/* Minutes Block */}
          <div
            className={`p-2.5 sm:p-3 rounded-2xl text-center border transition-all ${
              isLight
                ? "bg-white/90 border-[#E8DCCB] shadow-xs"
                : "bg-black/40 border-white/10 shadow-inner"
            }`}
          >
            <div
              className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: isLight ? "#1C0F05" : "#FFF7ED" }}
            >
              {String(timeLeft.minutes).padStart(2, "0")}
            </div>
            <div
              className={`text-[9.5px] font-bold uppercase tracking-wider mt-0.5 ${
                isLight ? "text-stone-600" : "text-stone-400"
              }`}
            >
              Minutes · मिनट
            </div>
          </div>

          {/* Seconds Block */}
          <div
            className={`p-2.5 sm:p-3 rounded-2xl text-center border transition-all ${
              isLight
                ? "bg-white/90 border-[#E8DCCB] shadow-xs"
                : "bg-black/40 border-white/10 shadow-inner"
            }`}
          >
            <div
              className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: goldAccent }}
            >
              {String(timeLeft.seconds).padStart(2, "0")}
            </div>
            <div
              className={`text-[9.5px] font-bold uppercase tracking-wider mt-0.5 ${
                isLight ? "text-stone-600" : "text-stone-400"
              }`}
            >
              Seconds · सेकंड
            </div>
          </div>
        </div>

        {/* Live Status Message */}
        <div
          className={`text-xs text-center py-1 px-2 rounded-xl ${
            timeLeft.isLive
              ? isLight
                ? "bg-emerald-100 text-emerald-950 font-bold border border-emerald-300"
                : "bg-emerald-950/60 text-emerald-200 font-bold border border-emerald-500/30"
              : isLight
              ? "text-stone-700 bg-amber-50/70 border border-amber-200/60"
              : "text-stone-300 bg-white/5 border border-white/5"
          }`}
        >
          {timeLeft.isLive
            ? "✨ Sacred Brahma Muhūrta Window is Live! Optimal period for Dhyana, Japa & inner stillness."
            : `Next awakening window begins at 04:30 AM IST. Prepare your mind for morning stillness.`}
        </div>

        {/* Interactive Controls Bar */}
        <div className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap">
          {/* Reminder Toggle Button */}
          <button
            onClick={handleToggleReminder}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer border ${
              reminderEnabled
                ? isLight
                  ? "bg-amber-100/90 text-amber-950 border-amber-300 shadow-xs hover:bg-amber-200"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                : isLight
                ? "bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200"
                : "bg-white/5 text-stone-400 border-white/10 hover:bg-white/10"
            }`}
          >
            {reminderEnabled ? (
              <>
                <BellRing className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate">04:30 AM Alarm Active</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span className="truncate">Enable 04:30 AM Alarm</span>
              </>
            )}
          </button>

          {/* Test Sound Bell Button */}
          <button
            onClick={handlePlayChime}
            title="Test 432Hz Sacred Chime"
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer border flex-shrink-0 ${
              isLight
                ? "bg-white text-stone-800 border-stone-300 hover:bg-stone-100 shadow-xs"
                : "bg-white/5 text-stone-200 border-white/10 hover:bg-white/10"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Chime</span>
          </button>

          {/* Accordion Wisdom Toggle */}
          <button
            onClick={() => setShowWisdom(!showWisdom)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer border flex-shrink-0 ${
              isLight
                ? "bg-white text-stone-800 border-stone-300 hover:bg-stone-100 shadow-xs"
                : "bg-white/5 text-stone-200 border-white/10 hover:bg-white/10"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Vedic Significance</span>
            {showWisdom ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>
        </div>

        {/* Collapsible Vedic Significance Insight */}
        {showWisdom && (
          <div
            className={`p-3.5 rounded-2xl border text-xs space-y-2 animate-fadeIn ${
              isLight
                ? "bg-[#FAF5ED] border-[#E8DCB8] text-stone-800"
                : "bg-black/50 border-amber-500/20 text-stone-200"
            }`}
          >
            <div className="font-sanskrit font-bold text-amber-500 text-[13px] leading-relaxed">
              "ब्राह्मे मुहूर्ते उत्तिष्ठेत् स्वस्थो रक्षार्थमायुषः।"
            </div>
            <p className="italic leading-relaxed text-[11px] opacity-90">
              — अष्टाङ्गहृदयम् (Ashtanga Hridaya, Sutrasthana 2.1)
            </p>
            <p className="leading-relaxed text-[11.5px]">
              The Brahma Muhūrta occurs approximately 1 hour and 36 minutes before sunrise. At this sacred hour, the atmosphere is saturated with pure Sattva guna, free from agitation and mental noise. Practitioners of Yoga and Vedanta utilize this window for spontaneous concentration, higher contemplation, and lasting spiritual vitality.
            </p>
          </div>
        )}

        {/* Feedback Toast Notification */}
        {feedbackToast && (
          <div
            className={`text-center py-1 px-3 rounded-lg text-xs font-bold border transition-all animate-fadeIn ${
              isLight
                ? "bg-amber-100 text-amber-950 border-amber-300"
                : "bg-amber-500/20 text-amber-200 border-amber-500/40"
            }`}
          >
            {feedbackToast}
          </div>
        )}
      </div>
    </div>
  );
};
