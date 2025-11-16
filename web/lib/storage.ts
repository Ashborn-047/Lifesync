import type {
  AssessmentResult,
  QuizProgress,
  SerializedQuizProgress,
} from "@/lib/types";

const QUIZ_PROGRESS_KEY = "lifesync_quiz_progress";
const LAST_RESULT_SESSION_KEY = "assessmentResult";
const LAST_RESULT_LOCAL_KEY = "lifesync_last_result";

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveQuizProgress(progress: QuizProgress) {
  if (!isBrowser()) return;

  try {
    const serialized: SerializedQuizProgress = {
      currentIndex: progress.currentIndex,
      startedAt: progress.startedAt,
      questions: progress.questions,
      responses: Array.from(progress.responses.entries()),
    };

    window.localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.warn("Failed to save quiz progress:", error);
  }
}

export function loadQuizProgress(): QuizProgress | null {
  if (!isBrowser()) return null;

  try {
    const stored = window.localStorage.getItem(QUIZ_PROGRESS_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<SerializedQuizProgress>;
    if (!parsed) {
      return null;
    }

    return {
      currentIndex: parsed.currentIndex ?? 0,
      startedAt: parsed.startedAt ?? new Date().toISOString(),
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      responses: new Map(
        Array.isArray(parsed.responses) ? parsed.responses : []
      ),
    };
  } catch (error) {
    console.warn("Failed to load quiz progress:", error);
    return null;
  }
}

export function clearQuizProgress() {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(QUIZ_PROGRESS_KEY);
  } catch (error) {
    console.warn("Failed to clear quiz progress:", error);
  }
}

export function saveLastResult(result: AssessmentResult) {
  if (!isBrowser()) return;

  try {
    const serialized = JSON.stringify(result);
    window.sessionStorage.setItem(LAST_RESULT_SESSION_KEY, serialized);
    window.localStorage.setItem(LAST_RESULT_LOCAL_KEY, serialized);
  } catch (error) {
    console.warn("Failed to persist last assessment result:", error);
  }
}
