"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TraitBarProps {
  trait: string;
  score: number | null;  // Solution D: can be null if insufficient data
  max?: number;
  color?: string;
  delay?: number;
  showValue?: boolean;
}

const traitColors: Record<string, string> = {
  Openness: "from-purple-500 to-pink-500",
  Conscientiousness: "from-blue-500 to-cyan-500",
  Extraversion: "from-yellow-500 to-orange-500",
  Agreeableness: "from-green-500 to-emerald-500",
  Neuroticism: "from-red-500 to-pink-500",
  O: "from-purple-500 to-pink-500",
  C: "from-blue-500 to-cyan-500",
  E: "from-yellow-500 to-orange-500",
  A: "from-green-500 to-emerald-500",
  N: "from-red-500 to-pink-500",
};

export default function TraitBar({
  trait,
  score,
  max = 100,
  color,
  delay = 0,
  showValue = true,
}: TraitBarProps) {
  // Solution D: Handle null scores (insufficient data)
  if (score === null) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-white capitalize">
            {trait}
          </span>
          {showValue && (
            <span className="text-sm font-medium text-yellow-400">
              No Data
            </span>
          )}
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div className="h-full w-full bg-yellow-500/20 rounded-full flex items-center justify-center">
            <span className="text-xs text-yellow-400/70">Not enough questions answered</span>
          </div>
        </div>
      </motion.div>
    );
  }

  const percentage = Math.min(Math.max((score / max) * 100, 0), 100);
  const gradientClass =
    color || traitColors[trait] || "from-purple-500 to-pink-500";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className="w-full"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-semibold text-white capitalize">
          {trait}
        </span>
        {showValue && (
          <span className="text-2xl font-bold gradient-text">
            {score.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1,
            delay: delay + 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
          className={cn("h-full rounded-full bg-gradient-to-r", gradientClass)}
        />
      </div>
    </motion.div>
  );
}
