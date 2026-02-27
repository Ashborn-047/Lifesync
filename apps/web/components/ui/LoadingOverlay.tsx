"use client";

import { motion } from "framer-motion";

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({
  message = "Loading...",
}: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="glass-card p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
        </div>
        <p className="text-lg font-medium text-white">{message}</p>
      </div>
    </motion.div>
  );
}
