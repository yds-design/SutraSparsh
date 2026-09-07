import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { AppTheme } from "../types";

interface AtmosphereThemeConfig {
  id: AppTheme;
  name: string;
  sanskrit: string;
  about: string;
  icon: string;
  bgBase: string;
  bgGradient: string;
  auraGradient: string;
  accentColor: string;
  pillBorder: string;
  pillBg: string;
  textColor: string;
  subtextColor: string;
  pitch: number;
}

export const ATMOSPHERE_CONFIGS: Record<AppTheme, AtmosphereThemeConfig> = {
  sandstone: {
    id: "sandstone",
    name: "Sandstone Temple",
    sanskrit: "बलुआ पत्थर • Temple Sanctum",
    about: "Contemplative sanctum with raw sandstone and warm amber gold",
    icon: "🏛️",
    bgBase: "#0A0502",
    bgGradient:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(216, 137, 22, 0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(145, 66, 16, 0.12) 0%, transparent 60%), #0A0502",
    auraGradient:
      "radial-gradient(circle at 50% 35%, rgba(216, 137, 22, 0.38) 0%, rgba(145, 66, 16, 0.16) 45%, transparent 75%)",
    accentColor: "#F4B24B",
    pillBorder: "rgba(216, 137, 22, 0.45)",
    pillBg: "rgba(18, 13, 9, 0.94)",
    textColor: "#F4E9D2",
    subtextColor: "#D88916",
    pitch: 220,
  },
  amethyst: {
    id: "amethyst",
    name: "Amethyst Twilight",
    sanskrit: "जाम्बूनद एवं मणिरत्न • Mystic Violet",
    about: "Midnight violet, sacred amethyst and tranquil lilac mist",
    icon: "🔮",
    bgBase: "#080410",
    bgGradient:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(125, 70, 184, 0.24) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(196, 168, 230, 0.14) 0%, transparent 60%), #080410",
    auraGradient:
      "radial-gradient(circle at 50% 35%, rgba(155, 104, 216, 0.42) 0%, rgba(125, 70, 184, 0.18) 45%, transparent 75%)",
    accentColor: "#D4BEF2",
    pillBorder: "rgba(196, 168, 230, 0.45)",
    pillBg: "rgba(15, 10, 26, 0.94)",
    textColor: "#EDE0F8",
    subtextColor: "#C4A8E6",
    pitch: 432,
  },
  light: {
    id: "light",
    name: "Parchment Dawn",
    sanskrit: "चन्दन एवं पत्र • Sandalwood Dawn",
    about: "Calm morning light with off-white parchment and deep ochre",
    icon: "☀️",
    bgBase: "#FDFBF7",
    bgGradient:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(246, 223, 166, 0.45) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(230, 215, 195, 0.35) 0%, transparent 60%), #FDFBF7",
    auraGradient:
      "radial-gradient(circle at 50% 35%, rgba(246, 223, 166, 0.55) 0%, rgba(217, 119, 6, 0.18) 45%, transparent 75%)",
    accentColor: "#B9680D",
    pillBorder: "rgba(216, 137, 22, 0.35)",
    pillBg: "rgba(255, 251, 245, 0.96)",
    textColor: "#3A2818",
    subtextColor: "#B9680D",
    pitch: 528,
  },
  festival: {
    id: "festival",
    name: "Festival Maroon",
    sanskrit: "उत्सव एवं मङ्गल • Royal Maroon",
    about: "Vibrant celebration with royal maroon, vermilion and saffron",
    icon: "🪔",
    bgBase: "#280509",
    bgGradient:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255, 138, 0, 0.28) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(94, 17, 28, 0.35) 0%, transparent 60%), #280509",
    auraGradient:
      "radial-gradient(circle at 50% 35%, rgba(255, 138, 0, 0.42) 0%, rgba(94, 17, 28, 0.25) 45%, transparent 75%)",
    accentColor: "#FFD54A",
    pillBorder: "rgba(255, 138, 0, 0.45)",
    pillBg: "rgba(40, 5, 9, 0.94)",
    textColor: "#FFF6E3",
    subtextColor: "#FF8A00",
    pitch: 660,
  },
  "golden-hour": {
    id: "golden-hour",
    name: "Golden Hour",
    sanskrit: "गोधूलि वेला • Sacred Dusk",
    about: "Sacred sunset glow with burnt honey and radiant dusk warmth",
    icon: "🌅",
    bgBase: "#140E08",
    bgGradient:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201, 130, 43, 0.32) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(246, 223, 166, 0.16) 0%, transparent 60%), #140E08",
    auraGradient:
      "radial-gradient(circle at 50% 35%, rgba(201, 130, 43, 0.46) 0%, rgba(246, 223, 166, 0.22) 45%, transparent 75%)",
    accentColor: "#F6DFA6",
    pillBorder: "rgba(201, 130, 43, 0.45)",
    pillBg: "rgba(20, 14, 8, 0.94)",
    textColor: "#FFF4D8",
    subtextColor: "#C9822B",
    pitch: 340,
  },
};

interface AtmosphereCrossfadeBackdropProps {
  theme: AppTheme;
  showIndicator?: boolean;
}

export const AtmosphereCrossfadeBackdrop: React.FC<AtmosphereCrossfadeBackdropProps> = ({
  theme,
  showIndicator = true,
}) => {
  const [baseTheme, setBaseTheme] = useState<AppTheme>(theme);
  const [incomingTheme, setIncomingTheme] = useState<AppTheme | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [indicatorTheme, setIndicatorTheme] = useState<AppTheme | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const initialRender = useRef(true);
  const prevThemeRef = useRef<AppTheme>(theme);
  const indicatorTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. Dedicated Atmospheric Canvas Cross-Fade Effect
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      setBaseTheme(theme);
      return;
    }

    if (theme === baseTheme) return;

    // Trigger crossfade between outgoing canvas and incoming theme
    setIncomingTheme(theme);
    setIsCrossfading(true);
  }, [theme, baseTheme]);

  // 2. Dedicated Theme Detail Popup Lifecycle (Guaranteed 2-Second Automatic Dismissal & Graceful Exit)
  useEffect(() => {
    // Only trigger popup when theme actually changes from a previous theme
    if (prevThemeRef.current === theme) {
      return;
    }
    prevThemeRef.current = theme;

    // Set active popup theme and make visible
    setIndicatorTheme(theme);
    setIsPopupVisible(true);

    // Clear any previous timer
    if (indicatorTimer.current) {
      clearTimeout(indicatorTimer.current);
      indicatorTimer.current = null;
    }

    // Automatically dismiss in exactly 2 seconds (2000ms) with graceful exit animation
    indicatorTimer.current = setTimeout(() => {
      setIsPopupVisible(false);
    }, 2000);

    return () => {
      if (indicatorTimer.current) {
        clearTimeout(indicatorTimer.current);
      }
    };
  }, [theme]);

  const baseConfig = ATMOSPHERE_CONFIGS[baseTheme] || ATMOSPHERE_CONFIGS.sandstone;
  const incomingConfig = incomingTheme
    ? ATMOSPHERE_CONFIGS[incomingTheme] || ATMOSPHERE_CONFIGS.sandstone
    : null;
  const activeIndicatorConfig = indicatorTheme
    ? ATMOSPHERE_CONFIGS[indicatorTheme] || ATMOSPHERE_CONFIGS.sandstone
    : null;

  return (
    <>
      {/* ── Fixed Full-Viewport Canvas Backdrop ── */}
      <div
        id="atmosphere-crossfade-canvas"
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
        aria-hidden="true"
      >
        {/* Layer 1: Base/Outgoing Theme Background */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundColor: baseConfig.bgBase,
            backgroundImage: baseConfig.bgGradient,
          }}
        />

        {/* Layer 2: Incoming Theme Cross-Fade Overlap */}
        <AnimatePresence>
          {isCrossfading && incomingConfig && (
            <motion.div
              key={`crossfade-${incomingConfig.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.65,
                ease: [0.4, 0, 0.2, 1], // standard material smooth deceleration
              }}
              onAnimationComplete={() => {
                // Settle: commit incoming theme as new base
                setBaseTheme(incomingConfig.id);
                setIncomingTheme(null);
                setIsCrossfading(false);
              }}
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundColor: incomingConfig.bgBase,
                backgroundImage: incomingConfig.bgGradient,
              }}
            />
          )}
        </AnimatePresence>

        {/* Layer 3: Ethereal Sacred Aura Wave (Atmospheric Light Transition) */}
        <AnimatePresence>
          {isCrossfading && incomingConfig && (
            <motion.div
              key={`aura-${incomingConfig.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: [0, 0.7, 0],
                scale: [0.92, 1.05, 1.15],
              }}
              transition={{
                duration: 0.75,
                ease: "easeOut",
              }}
              className="absolute inset-0 w-full h-full"
              style={{
                background: incomingConfig.auraGradient,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Floating Sacred Atmosphere Switch Indicator (Theme Detail Popup) ── */}
      {showIndicator && (
        <div
          id="atmosphere-popup-container"
          className="fixed top-14 sm:top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <AnimatePresence>
            {isPopupVisible && activeIndicatorConfig && (
              <motion.div
                key={`indicator-${activeIndicatorConfig.id}`}
                id="atmosphere-detail-popup"
                initial={{ opacity: 0, y: -22, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.94 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setIsPopupVisible(false)}
                className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border pointer-events-auto cursor-pointer max-w-[94vw] sm:max-w-md w-auto text-center"
                style={{
                  backgroundColor: activeIndicatorConfig.pillBg,
                  borderColor: activeIndicatorConfig.pillBorder,
                  boxShadow: `0 16px 40px -10px ${activeIndicatorConfig.pillBorder}`,
                }}
                title="Click to dismiss"
              >
                {/* Line 1: Icon + Theme Name + Active Status Badge (Strictly 1 Line) */}
                <div className="w-full flex items-center justify-center space-x-2 whitespace-nowrap overflow-hidden leading-tight">
                  <span className="text-base sm:text-lg shrink-0">
                    {activeIndicatorConfig.icon}
                  </span>
                  <span
                    className="text-xs sm:text-sm font-bold tracking-wide shrink-0"
                    style={{ color: activeIndicatorConfig.textColor }}
                  >
                    {activeIndicatorConfig.name}
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold shadow-sm shrink-0"
                    style={{
                      backgroundColor: activeIndicatorConfig.accentColor,
                      color: activeIndicatorConfig.id === "light" ? "#1C1917" : "#0A0502",
                    }}
                  >
                    Active
                  </span>
                </div>

                {/* Line 2: Sacred Sanskrit Tradition Subtitle (Strictly 1 Line) */}
                <div
                  className="w-full text-[11px] font-sanskrit whitespace-nowrap overflow-hidden text-ellipsis block mt-1 leading-tight font-medium"
                  style={{ color: activeIndicatorConfig.subtextColor }}
                >
                  {activeIndicatorConfig.sanskrit}
                </div>

                {/* Line 3: About Theme Description (Strictly 1 Line) */}
                <div
                  className="w-full text-[10px] sm:text-[11px] whitespace-nowrap overflow-hidden text-ellipsis block mt-1 font-medium leading-tight opacity-90"
                  style={{ color: activeIndicatorConfig.textColor }}
                >
                  {activeIndicatorConfig.about}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};
