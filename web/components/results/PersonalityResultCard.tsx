"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import * as Icons from "lucide-react";
import Card from "@/components/ui/Card";
import { getPersona } from "@/lib/getPersonaData";
import type { PersonaProfile } from "@/lib/personas";

interface PersonalityResultCardProps {
  mbtiType: string | null;
  delay?: number;
}

/**
 * PersonalityResultCard - Displays persona information with Lucide icons
 * Shows persona name, tagline, strengths, and challenges
 */
export default function PersonalityResultCard({
  mbtiType,
  delay = 0,
}: PersonalityResultCardProps) {
  if (!mbtiType) {
    return null;
  }

  const persona = getPersona(mbtiType);
  if (!persona) {
    return null;
  }

  // Get the icon component dynamically
  const IconComponent = Icons[persona.icon] as React.ComponentType<any>;

  // Fallback to Users icon if icon not found
  const DisplayIcon = IconComponent || Icons.Users;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card glow className="text-center">
        {/* Persona Icon - Large and prominent */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: delay + 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-xl" />
            <div className="relative bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full p-6 border border-white/10">
              <DisplayIcon className="w-16 h-16 text-white" size={64} />
            </div>
          </div>
        </motion.div>

        {/* Persona Name - Bold */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className="text-4xl font-bold gradient-text mb-3"
        >
          {persona.personaName}
        </motion.h2>

        {/* MBTI Type - Small text underneath */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.3 }}
          className="text-sm text-white/60 mb-4 font-mono tracking-wider"
        >
          {persona.type}
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.4 }}
          className="text-lg text-white/80 italic mb-8"
        >
          &ldquo;{persona.tagline}&rdquo;
        </motion.p>

        {/* Strengths */}
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

        {/* Challenges */}
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
            {persona.challenges.map((challenge, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: delay + 0.8 + index * 0.1 }}
                className="flex items-start gap-2 text-white/80"
              >
                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>{challenge}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </Card>
    </motion.div>
  );
}

