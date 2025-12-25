"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  delay?: number;
}

export default function SectionHeader({
  title,
  subtitle,
  icon,
  className,
  delay = 0,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      className={cn("text-center mb-12", className)}
    >
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2, type: "spring" }}
          className="inline-block mb-4"
        >
          {icon}
        </motion.div>
      )}
      <h2 className="text-h2 gradient-text mb-3">{title}</h2>
      {subtitle && (
        <p className="text-body-lg text-white/70 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
