"use client";

import { useState, useEffect } from "react";
import { getQuestions } from "../client";
import type { Question } from "@lifesync/types";

interface UseQuestionsReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage questions
 * 
 * Features:
 * - Fetches questions from backend
 * - Limits to first 30 questions
 * - Handles loading and error states
 * - Provides refetch capability
 */
export function useQuestions(limit: number = 30): UseQuestionsReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request only the number of questions needed from backend (performance optimization)
      const data = await getQuestions(limit);

      setQuestions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load questions"
      );
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [limit]);

  return {
    questions,
    loading,
    error,
    refetch: fetchQuestions,
  };
}

