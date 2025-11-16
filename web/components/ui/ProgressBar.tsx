"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  color?: "primary" | "accent" | "success";
}

export default function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  label,
  color = "primary",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    primary: "from-purple-500 to-pink-500",
    accent: "from-cyan-500 to-blue-500",
    success: "from-green-500 to-emerald-500",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white/80">
            {label || `${Math.round(percentage)}%`}
          </span>
          <span className="text-sm text-white/60">
            {Math.round(value)}/{max}
          </span>
        </div>
      )}
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className={cn("h-full rounded-full bg-gradient-to-r", colors[color])}
        />
      </div>
    </div>
  );
}
