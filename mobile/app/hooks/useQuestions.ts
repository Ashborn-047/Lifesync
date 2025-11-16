import { useEffect, useState, useCallback } from "react";
import { fetchQuestions } from "../lib/api";
import type { Question } from "../types";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useQuestions(limit = 30) {
  const [data, setData] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch questions with limit parameter
      const questions = await fetchQuestions(limit);
      
      // Shuffle and limit to requested number
      const shuffled = shuffleArray(questions);
      const limited = shuffled.slice(0, limit);
      
      setData(limited);
    } catch (err: any) {
      console.error("Failed to load questions", err);
      setError(err?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      await refetch();
    }

    load();
    return () => { mounted = false; };
  }, [refetch]);

  return { 
    data, 
    loading, 
    error,
    refetch 
  };
}

