import React, { useEffect, useState, useRef } from "react";
import { X, Sparkles } from "lucide-react";
import { ModalPortal } from "./ModalPortal";

interface DailyPromoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreToday?: () => void;
  todayVerse?: {
    devanagari: string;
    translation: string;
    source: string;
  };
}

export const DailyPromoPopup: React.FC<DailyPromoPopupProps> = ({
  isOpen,
  onClose,
  onExploreToday,
  todayVerse = {
    devanagari: "योगः कर्मसु कौशलम्",
    translation: "Excellence and harmony in action is Yoga.",
    source: "Bhagavad Gita 2.50 • प्रातः स्मरण",
  },
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    // Mark today as seen in localStorage
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem("sutrasparsh_promo_last_date", todayStr);
    } catch {
      // Ignore storage restrictions
    }
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 450);
  };

  const handleCtaClick = () => {
    triggerClose();
    if (onExploreToday) {
      onExploreToday();
    }
  };

  // 5-second auto-dismiss timer unless hovered
  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
      return;
    }

    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(() => {
      triggerClose();
    }, 6000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, isPaused]);

  // Keyboard accessibility: ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        triggerClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div
        id="sutrasparsh-daily-promo-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Daily verse promo"
        onClick={triggerClose}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-500 backdrop-blur-xs select-none ${
          isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          backgroundColor: "rgba(30, 20, 12, 0.62)",
        }}
      >
      {/* Centered Popup Card */}
      <div
        id="sutrasparsh-daily-promo-card"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`relative w-full max-w-[368px] sm:max-w-[380px] rounded-[26px] p-6 sm:p-7 text-center transition-all duration-500 border border-white/60 shadow-[0_24px_60px_rgba(46,33,22,0.4)] ${
          isClosing ? "scale-95 translate-y-3 opacity-0" : "scale-100 translate-y-0 opacity-100 animate-fadeIn"
        }`}
        style={{
          background: "linear-gradient(180deg, #FBF3E6 0%, #F5E8D3 100%)",
          color: "#2E2116",
        }}
      >
        {/* Subtle Gold Trim Mask Border */}
        <div
          className="absolute inset-0 rounded-[26px] pointer-events-none border border-[#EFD9A8]/80"
          style={{
            boxShadow: "inset 0 0 16px rgba(217, 163, 76, 0.12)",
          }}
        />

        {/* Close Button */}
        <button
          id="btn-close-daily-promo"
          type="button"
          onClick={triggerClose}
          aria-label="Close daily promo"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full border border-[#2E2116]/15 bg-[#FFFDF9] text-[#6B5843] hover:text-[#2E2116] hover:bg-[#EFD9A8] active:scale-90 flex items-center justify-center text-sm transition-all duration-200 cursor-pointer shadow-xs z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo Chip */}
        <div className="w-28 sm:w-[120px] mx-auto mt-1 mb-4 rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(255,110,20,0.18)] border border-[#FF6E14]/25 bg-[#ECECEC]">
          <img
            src="/icon.png"
            alt="SutraSparsh Logo"
            className="w-full h-auto object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Heading & Accent */}
        <h2 className="font-serif-sacred font-medium text-2xl sm:text-[26px] leading-[1.22] text-[#2E2116] mb-2 tracking-tight">
          A new day,<br />
          <em className="font-serif-sacred italic text-[#C6461F]">a new discovery.</em>
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#6B5843] leading-relaxed mb-4 px-2 font-normal">
          Begin your day with timeless wisdom that enlightens and inspires.
        </p>

        {/* Ornamental Divider */}
        <div className="flex items-center gap-2.5 mb-4 px-4 opacity-80">
          <span className="flex-1 h-[1px] bg-[#2E2116]/15" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#D9A34C] shadow-xs" />
          <span className="flex-1 h-[1px] bg-[#2E2116]/15" />
        </div>

        {/* Today's Shloka Card Preview */}
        {todayVerse && (
          <div className="bg-[#FFFDF9] border border-[#2E2116]/12 rounded-2xl p-3.5 sm:p-4 text-left mb-5 shadow-xs transition-transform duration-200 hover:scale-[1.01]">
            <div className="flex items-center space-x-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#C6461F] mb-1.5">
              <Sparkles className="w-3 h-3 text-[#D9A34C]" />
              <span>Today's Contemplation</span>
            </div>
            <div className="font-sanskrit text-sm sm:text-[15px] font-bold text-[#C6461F] leading-snug mb-1">
              {todayVerse.devanagari}
            </div>
            <div className="text-xs sm:text-[12.5px] italic text-[#2E2116] leading-relaxed mb-1 font-serif-sacred">
              "{todayVerse.translation}"
            </div>
            <div className="text-[11px] text-[#6B5843] font-medium font-sans">
              — {todayVerse.source}
            </div>
          </div>
        )}

        {/* Primary CTA Button */}
        <button
          id="btn-explore-today-promo-cta"
          type="button"
          onClick={handleCtaClick}
          className="w-full py-3 sm:py-3.5 px-5 bg-gradient-to-r from-[#E15A2E] to-[#C6461F] hover:from-[#E9663A] hover:to-[#CF4E27] text-[#FFF6EC] font-semibold text-sm sm:text-[14.5px] rounded-[14px] shadow-[0_10px_20px_rgba(198,70,31,0.32)] hover:shadow-[0_12px_24px_rgba(198,70,31,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-150 cursor-pointer flex items-center justify-center space-x-2"
        >
          <span>Explore today's verse</span>
          <span className="text-xs opacity-90">→</span>
        </button>

        {/* Depleting Progress Indicator */}
        <div
          className="w-11 h-[3px] bg-[#2E2116]/15 rounded-full mx-auto mt-4 overflow-hidden"
          title={isPaused ? "Timer paused on hover" : "Auto-dismissing in 6 seconds"}
        >
          <div
            className={`h-full w-full bg-[#D9A34C] origin-left ${
              isPaused ? "opacity-40" : "animate-deplete"
            }`}
            style={{
              animation: isPaused ? "none" : "deplete 6s linear forwards",
            }}
          />
        </div>

        {/* Subtle Helper Note */}
        <div className="mt-2 text-[10px] text-[#6B5843]/80 font-mono">
          Loaded once daily • Tap anywhere to close
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};
