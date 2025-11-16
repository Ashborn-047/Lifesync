"use client";

import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface TraitRadarChartProps {
  data: Record<string, number | null>;  // Solution D: can be null if insufficient data
  delay?: number;
  hasCompleteProfile?: boolean;  // True if all 5 traits have data
}

export default function TraitRadarChart({
  data,
  delay = 0,
  hasCompleteProfile = true,
}: TraitRadarChartProps) {
  const traitNames: Record<string, string> = {
    O: "Openness",
    C: "Conscientiousness",
    E: "Extraversion",
    A: "Agreeableness",
    N: "Neuroticism",
  };

  // Solution D: Handle null values - filter out traits with no data
  const oceanOrder = ["O", "C", "E", "A", "N"];
  const chartData = oceanOrder
    .map((key) => {
      const rawValue = data[key];
      if (rawValue === null || rawValue === undefined) {
        return null;  // Skip null values
      }
      // Convert from 0-1 scale to 0-100 for display
      const score = Math.round(rawValue * 100);
      return {
        trait: traitNames[key] || key,
        score: score,
        fullMark: 100,
      };
    })
    .filter((item) => item !== null) as Array<{ trait: string; score: number; fullMark: number }>;

  // Solution D: Show warning if not enough data for chart
  if (chartData.length < 3) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
        className="w-full h-[400px] flex items-center justify-center"
      >
        <div className="text-center p-8 bg-white/5 rounded-lg border border-yellow-500/30">
          <p className="text-yellow-400 font-semibold mb-2">Insufficient Data</p>
          <p className="text-sm text-white/70">
            Not enough traits have sufficient data to display the radar chart.
            <br />
            Complete more questions to see your full personality profile.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      className="w-full h-[400px]"
    >
      {!hasCompleteProfile && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-400">
            ⚠️ Partial data: Some traits are missing from this chart due to insufficient questions answered.
          </p>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
          <PolarAngleAxis
            dataKey="trait"
            tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#667eea"
            fill="#667eea"
            fillOpacity={0.6}
            strokeWidth={2}
            connectNulls={false}  // Don't connect null values
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
