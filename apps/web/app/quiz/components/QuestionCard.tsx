"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import type { Question } from "@lifesync/types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Card hover className="max-w-3xl mx-auto">
        <div className="mb-4">
          <span className="text-sm font-medium text-white/60">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>

        <h2 className="text-h2 text-white mb-4 leading-tight">
          {question.text}
        </h2>

        <div className="flex flex-wrap gap-2 mt-6">
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
            {question.trait}
          </span>
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-medium">
            {question.facet}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
