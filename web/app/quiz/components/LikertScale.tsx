"use client";

import { motion } from "framer-motion";

interface LikertScaleProps {
  value: number | null;
  onChange: (value: number) => void;
}

const options = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

export default function LikertScale({ value, onChange }: LikertScaleProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2">
        {options.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(option.value)}
            className={`
              flex-1 p-4 rounded-xl font-medium transition-all duration-300
              ${
                value === option.value
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50"
                  : "glass-card text-white/70 hover:bg-white/10 hover:text-white"
              }
            `}
          >
            <div className="text-2xl font-bold mb-1">{option.value}</div>
            <div className="text-xs hidden sm:block">{option.label}</div>
          </motion.button>
        ))}
      </div>

      <div className="flex justify-between text-xs text-white/50 px-2">
        <span>Strongly Disagree</span>
        <span>Strongly Agree</span>
      </div>
    </div>
  );
}
