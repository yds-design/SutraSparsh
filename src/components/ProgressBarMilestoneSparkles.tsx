import React from "react";
import { motion, AnimatePresence } from "motion/react";

interface ProgressBarMilestoneSparklesProps {
  active: boolean;
  isLight?: boolean;
  className?: string;
}

interface SparkParticle {
  id: number;
  x: number;
  y: number;
  scale: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
}

const GOLD_EMERALD_PALETTE = [
  "#F59E0B", // amber-500
  "#FBBF24", // amber-400
  "#10B981", // emerald-500
  "#34D399", // emerald-400
  "#FDE68A", // amber-200
  "#A7F3D0", // emerald-200
  "#FB923C", // orange-400
  "#FEF3C7", // gold-shimmer
];

export const ProgressBarMilestoneSparkles: React.FC<ProgressBarMilestoneSparklesProps> = ({
  active,
  isLight = false,
  className = "",
}) => {
  if (!active) return null;

  // 12 subtle confetti particles drifting upward from the progress bar
  const confettiParticles = Array.from({ length: 14 }, (_, i) => {
    // Spread along the horizontal progress track (0% to 100%)
    const startX = 10 + (i / 13) * 80; // 10% to 90%
    const targetY = -18 - (i % 3) * 10 - Math.random() * 8; // gentle upward lift
    const driftX = (Math.sin(i * 1.8) * 16);
    const color = GOLD_EMERALD_PALETTE[i % GOLD_EMERALD_PALETTE.length];
    const isRect = i % 2 === 0;
    const size = isRect ? 4 : 5;

    return {
      id: `confetti-${i}`,
      startX,
      targetY,
      driftX,
      color,
      isRect,
      size,
      duration: 1.8 + (i % 3) * 0.4,
      delay: (i % 4) * 0.08,
      rotation: (i * 72) % 360,
    };
  });

  // 8 localized radial sparks bursting at the 100% milestone cap (right edge)
  const capSparks: SparkParticle[] = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 2 * Math.PI;
    const distance = 14 + (i % 2) * 8;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      scale: 0.8 + (i % 3) * 0.3,
      color: GOLD_EMERALD_PALETTE[i % GOLD_EMERALD_PALETTE.length],
      delay: i * 0.04,
      duration: 1.4 + (i % 2) * 0.3,
      rotation: (i * 45) % 180,
    };
  });

  return (
    <div
      data-testid="progress-bar-milestone-celebration"
      className={`pointer-events-none absolute inset-0 z-20 overflow-visible ${className}`}
      aria-hidden="true"
    >
      {/* 1. Subtle Confetti Particles drifting up from the progress bar track */}
      <div data-testid="progress-bar-milestone-confetti" className="absolute inset-0">
        {confettiParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              left: `${p.startX}%`,
              bottom: 0,
              y: 0,
              x: 0,
              opacity: 0,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              left: `${p.startX}%`,
              bottom: 0,
              y: p.targetY,
              x: p.driftX,
              opacity: [0, 1, 1, 0.7, 0],
              scale: [0, 1.2, 1, 0.8, 0],
              rotate: p.rotation + 180,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute"
            style={{
              width: p.size,
              height: p.isRect ? p.size * 1.5 : p.size,
              backgroundColor: p.color,
              borderRadius: p.isRect ? "1px" : "50%",
              boxShadow: `0 0 5px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* 2. Radial Spark Animation at the 100% Milestone Cap (Right end of track) */}
      <div
        data-testid="progress-bar-milestone-sparks"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 flex items-center justify-center pointer-events-none"
      >
        {/* Pulsing golden milestone halo ring */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.6, 2.2, 2.8], opacity: [0.8, 0.4, 0] }}
          transition={{ duration: 1.6, repeat: 2, ease: "easeOut" }}
          className="absolute w-5 h-5 rounded-full border border-amber-400/80 bg-amber-400/20"
        />

        {/* Central radiant star sparkle */}
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: [0, 1.4, 1.1, 1.3, 0], rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 3.2, ease: "easeInOut" }}
          className="relative text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
          </svg>
        </motion.div>

        {/* Radiating sparkle stars */}
        {capSparks.map((spark) => (
          <motion.div
            key={spark.id}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: spark.x,
              y: spark.y,
              scale: [0, spark.scale, spark.scale * 0.7, 0],
              opacity: [1, 1, 0.8, 0],
              rotate: spark.rotation + 90,
            }}
            transition={{
              duration: spark.duration,
              delay: spark.delay,
              ease: "easeOut",
            }}
            className="absolute"
            style={{ color: spark.color }}
          >
            <svg
              viewBox="0 0 24 24"
              width={10 * spark.scale}
              height={10 * spark.scale}
              fill="currentColor"
              style={{ filter: `drop-shadow(0 0 4px ${spark.color})` }}
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
