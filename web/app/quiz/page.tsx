"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import QuestionCard from "./components/QuestionCard";
import LikertScale from "./components/LikertScale";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import Card from "@/components/ui/Card";
import { submitAssessment } from "@/lib/api";
import { useQuestions } from "@/hooks/useQuestions";
import {
  saveQuizProgress,
  loadQuizProgress,
  clearQuizProgress,
} from "@/lib/storage";
import { trackQuizStarted, trackQuizCompleted } from "@/lib/analytics";
import type { Question, AssessmentResponse } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();
  const { questions, loading: questionsLoading, error: questionsError, refetch } = useQuestions(30);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, number>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Try to restore saved progress on mount
  useEffect(() => {
    const savedProgress = loadQuizProgress();
    if (savedProgress && savedProgress.questions.length > 0) {
      // Check if saved questions match current questions (by IDs)
      const savedIds = new Set(savedProgress.questions.map((q) => q.id));
      const currentIds = new Set(questions.map((q) => q.id));
      const idsMatch = 
        savedIds.size === currentIds.size &&
        Array.from(savedIds).every((id) => currentIds.has(id));

      if (idsMatch) {
        // Restore from saved progress
        setCurrentIndex(savedProgress.currentIndex);
        setResponses(savedProgress.responses);
      }
    }
    trackQuizStarted();
  }, [questions]);

  // Track when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !questionsLoading) {
      trackQuizStarted();
    }
  }, [questions.length, questionsLoading]);

  const handleResponse = (value: number) => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion || !currentQuestion.id) {
      console.error("Cannot handle response: invalid question", currentQuestion);
      return;
    }
    const newResponses = new Map(responses.set(currentQuestion.id, value));
    setResponses(newResponses);

    // Auto-save progress
    if (questions.length > 0) {
      saveQuizProgress({
        currentIndex,
        responses: newResponses,
        questions,
        startedAt: new Date().toISOString(),
      });
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const assessmentResponses: AssessmentResponse[] = Array.from(
        responses.entries()
      ).map(([question_id, response]) => ({
        question_id,
        response,
      }));

      const result = await submitAssessment(assessmentResponses);

      sessionStorage.setItem("assessmentResult", JSON.stringify(result));
      clearQuizProgress(); // Clear saved progress after successful submit
      trackQuizCompleted(result.assessment_id);

      router.push("/results");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit assessment"
      );
      setIsSubmitting(false);
    }
  };

  // Update error state when questionsError changes
  useEffect(() => {
    if (questionsError) {
      setError(questionsError);
    }
  }, [questionsError]);

  if (questionsLoading) {
    return <LoadingOverlay message="Loading questions..." />;
  }

  if (isSubmitting) {
    return <LoadingOverlay message="Submitting your assessment..." />;
  }

  if (error || questionsError) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center">
            <h2 className="text-h3 text-red-400 mb-4">Network Error</h2>
            <p className="text-body text-white/70 mb-4">{error}</p>
            <div className="text-sm text-white/50 mb-6 space-y-2">
              <p>Make sure the backend server is running:</p>
              <code className="block bg-white/5 p-2 rounded text-xs">
                cd backend<br />
                python -m uvicorn src.api.server:app --reload --port 5174
              </code>
              <p className="text-xs mt-4">
                Then verify it&apos;s accessible at{" "}
                <a
                  href="http://localhost:5174/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline"
                >
                  http://localhost:5174/health
                </a>
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={refetch}>Try Again</Button>
              <Button variant="secondary" onClick={() => router.push("/")}>
                Go Home
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center">
            <h2 className="text-h3 text-white mb-4">No Questions Available</h2>
            <p className="text-body text-white/70 mb-6">
              Please check your backend connection.
            </p>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </Card>
        </motion.div>
      </main>
    );
  }

  // Safety check: ensure currentIndex is valid and question exists
  if (currentIndex < 0 || currentIndex >= questions.length) {
    console.error("Invalid currentIndex:", currentIndex, "questions.length:", questions.length);
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center">
            <h2 className="text-h3 text-red-400 mb-4">Invalid Question Index</h2>
            <p className="text-body text-white/70 mb-6">
              Question index is out of bounds. Resetting...
            </p>
            <Button onClick={() => { setCurrentIndex(0); refetch(); }}>
              Reload Questions
            </Button>
          </Card>
        </motion.div>
      </main>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion || !currentQuestion.id) {
    console.error("Invalid question at index:", currentIndex, "question:", currentQuestion);
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center">
            <h2 className="text-h3 text-red-400 mb-4">Invalid Question Data</h2>
            <p className="text-body text-white/70 mb-6">
              The question data format is invalid. Please try reloading.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={refetch}>Reload Questions</Button>
              <Button variant="secondary" onClick={() => router.push("/")}>
                Go Home
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
    );
  }

  const currentResponse = responses.get(currentQuestion.id) ?? null;
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <ProgressBar
            value={progress}
            max={100}
            showLabel
            label={`Question ${currentIndex + 1} of ${questions.length}`}
            color="primary"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
            />

            <Card>
              <LikertScale value={currentResponse} onChange={handleResponse} />

              <div className="mt-8 flex justify-between items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="secondary"
                    onClick={handleBack}
                    disabled={currentIndex === 0}
                    className={
                      currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }
                  >
                    ← Back
                  </Button>
                </motion.div>

                <span className="text-sm text-white/60">
                  {responses.size} of {questions.length} answered
                </span>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={currentResponse === null}
                    className={
                      currentResponse === null
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    {isLastQuestion ? "Submit Assessment" : "Next →"}
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
