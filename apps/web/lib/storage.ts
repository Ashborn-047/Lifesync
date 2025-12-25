/**
 * LifeSync Web - Local Storage Utilities
 * Handles localStorage persistence for quiz progress and results
 */

import type { Question, AssessmentResult } from "@lifesync/types";

const STORAGE_KEYS = {
  QUIZ_PROGRESS: "lifesync_quiz_progress",
  LAST_RESULT: "lifesync_last_result",
  QUIZ_RESPONSES: "lifesync_quiz_responses",
  CURRENT_INDEX: "lifesync_current_index",
} as const;

export interface QuizProgress {
  currentIndex: number;
  responses: Map<string, number>;
  questions: Question[];
  startedAt: string;
}

/**
 * Save quiz progress to localStorage
 */
export function saveQuizProgress(progress: QuizProgress): void {
  try {
    const data = {
      currentIndex: progress.currentIndex,
      responses: Array.from(progress.responses.entries()),
      questions: progress.questions,
      startedAt: progress.startedAt,
    };
    localStorage.setItem(STORAGE_KEYS.QUIZ_PROGRESS, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save quiz progress:", error);
  }
}

/**
 * Load quiz progress from localStorage
 */
export function loadQuizProgress(): QuizProgress | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZ_PROGRESS);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return {
      currentIndex: parsed.currentIndex || 0,
      responses: new Map(parsed.responses || []),
      questions: parsed.questions || [],
      startedAt: parsed.startedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to load quiz progress:", error);
    return null;
  }
}

/**
 * Clear quiz progress from localStorage
 */
export function clearQuizProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_RESPONSES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_INDEX);
  } catch (error) {
    console.error("Failed to clear quiz progress:", error);
  }
}

/**
 * Save last assessment result
 */
export function saveLastResult(result: AssessmentResult): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_RESULT, JSON.stringify(result));
  } catch (error) {
    console.error("Failed to save last result:", error);
  }
}

/**
 * Load last assessment result
 */
export function loadLastResult(): AssessmentResult | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LAST_RESULT);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load last result:", error);
    return null;
  }
}

/**
 * Clear last result
 */
export function clearLastResult(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.LAST_RESULT);
  } catch (error) {
    console.error("Failed to clear last result:", error);
  }
}

/**
 * Save individual response (for auto-save after each question)
 */
export function saveResponse(questionId: string, value: number): void {
  try {
    const key = `${STORAGE_KEYS.QUIZ_RESPONSES}_${questionId}`;
    localStorage.setItem(key, value.toString());
  } catch (error) {
    console.error("Failed to save response:", error);
  }
}

/**
 * Load all saved responses
 */
export function loadAllResponses(): Map<string, number> {
  const responses = new Map<string, number>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEYS.QUIZ_RESPONSES)) {
        const questionId = key.replace(`${STORAGE_KEYS.QUIZ_RESPONSES}_`, "");
        const value = parseInt(localStorage.getItem(key) || "0", 10);
        if (value > 0) {
          responses.set(questionId, value);
        }
      }
    }
  } catch (error) {
    console.error("Failed to load responses:", error);
  }
  return responses;
}

/**
 * Clear all saved responses
 */
export function clearAllResponses(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEYS.QUIZ_RESPONSES)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("Failed to clear responses:", error);
  }
}

