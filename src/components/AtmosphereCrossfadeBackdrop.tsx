import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { AppTheme } from "../types";

interface AtmosphereThemeConfig {
  id: AppTheme;
  name: string;
  sanskrit: string;
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
    sanskrit: "चन्दन एवं पत्र • Sandalwood",
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
    sanskrit: "गोधूलि वेला • Dusk Glow",
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

  const initialRender = useRef(true);
  const indicatorTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Avoid crossfade flash on initial page mount
    if (initialRender.current) {
      initialRender.current = false;
      setBaseTheme(theme);
      return;
    }

    if (theme === baseTheme) return;

    // Start crossfade: set incoming theme layer and trigger aura
    setIncomingTheme(theme);
    setIsCrossfading(true);
    setIndicatorTheme(theme);

    if (indicatorTimer.current) {
      clearTimeout(indicatorTimer.current);
    }
    indicatorTimer.current = setTimeout(() => {
      setIndicatorTheme(null);
    }, 2200);

    return () => {
      if (indicatorTimer.current) clearTimeout(indicatorTimer.current);
    };
  }, [theme, baseTheme]);

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

      {/* ── Floating Sacred Atmosphere Switch Indicator (Cross-fade pill) ── */}
      {showIndicator && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <AnimatePresence>
            {activeIndicatorConfig && (
              <motion.div
                key={`indicator-${activeIndicatorConfig.id}`}
                initial={{ opacity: 0, y: -16, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center space-x-2.5 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md border"
                style={{
                  backgroundColor: activeIndicatorConfig.pillBg,
                  borderColor: activeIndicatorConfig.pillBorder,
                  boxShadow: `0 12px 36px -8px ${activeIndicatorConfig.pillBorder}`,
                }}
              >
                <span className="text-base sm:text-lg animate-pulse">
                  {activeIndicatorConfig.icon}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className="text-xs font-bold tracking-wide"
                      style={{ color: activeIndicatorConfig.textColor }}
                    >
                      {activeIndicatorConfig.name}
                    </span>
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-ping"
                      style={{ backgroundColor: activeIndicatorConfig.accentColor }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-sanskrit"
                    style={{ color: activeIndicatorConfig.subtextColor }}
                  >
                    {activeIndicatorConfig.sanskrit}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};
