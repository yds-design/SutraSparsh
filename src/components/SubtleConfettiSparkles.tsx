import React from "react";
import { motion } from "motion/react";

interface SubtleConfettiSparklesProps {
  active: boolean;
  count?: number;
  className?: string;
  isLight?: boolean;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  shape: "circle" | "sparkle" | "rect";
  duration: number;
  delay: number;
  rotate: number;
}

const GOLD_PALETTE = [
  "#F59E0B", // amber-500
  "#FBBF24", // amber-400
  "#D97706", // amber-600
  "#10B981", // emerald-500
  "#34D399", // emerald-400
  "#FB923C", // orange-400
  "#FDE68A", // amber-200
  "#FEF3C7", // gold-shimmer
];

export const SubtleConfettiSparkles: React.FC<SubtleConfettiSparklesProps> = ({
  active,
  count = 18,
  className = "",
}) => {
  if (!active) return null;

  // Generate deterministic particles for fluid radial burst
  const particles: Particle[] = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI + (Math.sin(i * 99) * 0.4);
    const distance = 26 + (i % 4) * 14 + (Math.cos(i * 13) * 8);
    const size = 3 + (i % 3) * 2;
    const color = GOLD_PALETTE[i % GOLD_PALETTE.length];
    const shapes: ("circle" | "sparkle" | "rect")[] = ["circle", "sparkle", "rect"];
    const shape = shapes[i % shapes.length];
    const duration = 1.6 + (i % 3) * 0.3;
    const delay = (i % 5) * 0.05;
    const rotate = (i * 65) % 360;

    return {
      id: i,
      angle,
      distance,
      size,
      color,
      shape,
      duration,
      delay,
      rotate,
    };
  });

  return (
    <div
      data-testid="subtle-goal-confetti"
      className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-visible ${className}`}
      aria-hidden="true"
    >
      {particles.map((p) => {
        const targetX = Math.cos(p.angle) * p.distance;
        const targetY = Math.sin(p.angle) * p.distance - 6; // slight upward lift

        return (
          <motion.div
            key={p.id}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              x: targetX,
              y: targetY,
              scale: [0, 1.3, 0.8, 0],
              opacity: [1, 1, 0.85, 0],
              rotate: p.rotate + (p.angle > Math.PI ? -180 : 180),
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.18, 0.89, 0.32, 1.28], // soft celebratory spring/pop
            }}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.shape === "rect" ? p.color : undefined,
              borderRadius: p.shape === "circle" ? "50%" : p.shape === "rect" ? "2px" : "1px",
              boxShadow: `0 0 6px ${p.color}`,
            }}
          >
            {p.shape === "sparkle" && (
              <svg
                viewBox="0 0 24 24"
                width={p.size * 2.2}
                height={p.size * 2.2}
                className="transform -translate-x-1/4 -translate-y-1/4"
                fill={p.color}
              >
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
