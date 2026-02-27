"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import * as Icons from "lucide-react";
import Card from "@/components/ui/Card";
import type { Persona } from "@lifesync/personality-engine/mapping/personaMapping";

interface PersonalityResultCardProps {
  persona: Persona;
  confidence: number;
  delay?: number;
}

/**
 * PersonalityResultCard - Displays persona information with Lucide icons
 * Shows persona name, tagline, strengths, and growth areas
 */
export default function PersonalityResultCard({
  persona,
  confidence,
  delay = 0,
}: PersonalityResultCardProps) {
  if (!persona) {
    return null;
  }

  // Determine icon based on persona ID or fallback
  // For extreme/special personas, use specific icons
  let IconName = "Users";
  if (persona.id === "p_extreme_low") IconName = "BatteryLow";
  else if (persona.id === "p_extreme_high") IconName = "Zap";
  else if (persona.id === "p_uniform_response") IconName = "AlertOctagon";
  else if (persona.id.includes("detached")) IconName = "Microscope";
  else if (persona.id.includes("creative")) IconName = "Lightbulb";
  else if (persona.id.includes("structured")) IconName = "ClipboardCheck";
  else if (persona.id.includes("social")) IconName = "Megaphone";
  else if (persona.id.includes("caring")) IconName = "Heart";
  // ... add more mappings or use a generic mapping logic if available.
  // For now, let's stick to a safe default or simple heuristics if specific icons aren't in the persona object.
  // The previous code tried to load icon by name from persona.icon, but the new Persona type doesn't have an icon field yet.
  // We can add it to the type or just map it here. Let's map a few common ones.

  const IconComponent = (Icons as any)[IconName] || Icons.User;

  const isExtreme = persona.id === "p_extreme_low" || persona.id === "p_extreme_high";
  const isUniform = persona.id === "p_uniform_response";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card glow className={`text-center ${isUniform ? "border-red-500/50 bg-red-500/10" : ""}`}>

        {/* Extreme/Uniform Banners */}
        {isExtreme && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-left flex gap-3">
            <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-400 text-sm mb-1">Note on your profile</h4>
              <p className="text-xs text-white/80">
                {persona.id === "p_extreme_low"
                  ? "Your scores reflect an extremely low-activation profile. This is valid, but may benefit from follow-up or retesting."
                  : "Your responses indicate extremely high activation across traits."}
              </p>
            </div>
          </div>
        )}

        {isUniform && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-left flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-400 text-sm mb-1">Validity Concern</h4>
              <p className="text-xs text-white/80">
                Your answers were highly uniform. This may reduce accuracy. Consider retaking the assessment.
              </p>
            </div>
          </div>
        )}

        {/* Persona Icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: delay + 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${isUniform ? "from-red-500/20 to-orange-500/20" : "from-purple-500/20 to-blue-500/20"} rounded-full blur-xl`} />
            <div className={`relative bg-gradient-to-br ${isUniform ? "from-red-500/10 to-orange-500/10" : "from-purple-500/10 to-blue-500/10"} rounded-full p-6 border border-white/10`}>
              <IconComponent className="w-16 h-16 text-white" size={64} />
            </div>
          </div>
        </motion.div>

        {/* Persona Name */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className="text-4xl font-bold gradient-text mb-3"
        >
          {persona.title}
        </motion.h2>

        {/* MBTI & Confidence */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.3 }}
          className="flex justify-center gap-4 text-sm text-white/60 mb-4 font-mono tracking-wider"
        >
          {persona.mbti && <span>{persona.mbti}</span>}
          {confidence > 0 && <span>Confidence: {confidence}%</span>}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.4 }}
          className="text-lg text-white/80 italic mb-8"
        >
          &ldquo;{persona.tagline}&rdquo;
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.45 }}
          className="text-body text-white/70 mb-8 max-w-2xl mx-auto"
        >
          {persona.description}
        </motion.p>

        {/* Strengths */}
        {persona.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.5 }}
            className="mb-6"
          >
            <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Strengths
            </h3>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              {persona.strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: delay + 0.6 + index * 0.1 }}
                  className="flex items-start gap-2 text-white/80"
                >
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Growth */}
        {persona.growth.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.7 }}
          >
            <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Growth Areas
            </h3>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              {persona.growth.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: delay + 0.8 + index * 0.1 }}
                  className="flex items-start gap-2 text-white/80"
                >
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

