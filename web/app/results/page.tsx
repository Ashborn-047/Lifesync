"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ScrollText,
  Download,
  Copy,
  RotateCcw,
  Share2,
  History,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TraitBar from "@/components/ui/TraitBar";
import TraitRadarChart from "@/components/ui/TraitRadarChart";
import SectionHeader from "@/components/ui/SectionHeader";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import InvalidAssessmentBanner from "@/components/results/InvalidAssessmentBanner";
import PersonalityResultCard from "@/components/results/PersonalityResultCard";
import { generateExplanation, shareResult, downloadPDF, getAssessment } from "@/lib/api";
import { saveLastResult } from "@/lib/storage";
import {
  trackResultViewed,
  trackPDFDownloaded,
  trackResultShared,
} from "@/lib/analytics";
import { useToast } from "@/components/ui/Toast";
import type { AssessmentResult, ParsedExplanation } from "@/lib/types";

function ResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [explanation, setExplanation] = useState<ParsedExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadAssessmentData();
  }, []);

  const loadAssessmentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get assessment_id from URL params first
      const assessmentIdFromUrl = searchParams.get("assessment_id");
      
      // Get assessment_id from URL or sessionStorage
      let assessmentId: string | null = null;
      
      if (assessmentIdFromUrl) {
        assessmentId = assessmentIdFromUrl;
      } else {
        // Get from sessionStorage (from quiz submission)
        const storedResult = sessionStorage.getItem("assessmentResult");
        if (storedResult) {
          const parsed = JSON.parse(storedResult);
          assessmentId = parsed.assessment_id;
        }
      }

      if (!assessmentId) {
        router.push("/quiz");
        return;
      }

      // Fetch fresh data from backend and start explanation loading in parallel (performance optimization)
      try {
        const assessmentData = await getAssessment(assessmentId);
        setResult(assessmentData);
        saveLastResult(assessmentData);
        trackResultViewed(assessmentData.assessment_id);
        
        // Load explanation in parallel (non-blocking)
        loadExplanation(assessmentId).catch(err => {
          console.warn("Explanation loading failed:", err);
        });
      } catch (fetchError) {
        // If backend fetch fails, fall back to sessionStorage
        console.warn("Failed to fetch from backend, using sessionStorage:", fetchError);
        const storedResult = sessionStorage.getItem("assessmentResult");
        if (storedResult) {
          const assessmentData = JSON.parse(storedResult);
          if (assessmentData.assessment_id === assessmentId) {
            setResult(assessmentData);
            saveLastResult(assessmentData);
            trackResultViewed(assessmentData.assessment_id);
            await loadExplanation(assessmentData.assessment_id);
          } else {
            throw new Error("Assessment ID mismatch");
          }
        } else {
          throw fetchError;
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load assessment data";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadExplanation = async (assessmentId: string) => {
    try {
      setIsLoadingExplanation(true);
      setError(null);
      const exp = await generateExplanation(assessmentId);
      setExplanation(exp);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate explanation";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleCopySummary = async () => {
    if (!result || !explanation) return;

    // Solution D: Handle null MBTI
    let summary = `LifeSync Personality Assessment Results\n\n`;
    if (result.mbti !== null) {
      summary += `MBTI Type: ${result.mbti}\n\n`;
    } else {
      summary += `MBTI Type: Not available (incomplete assessment)\n\n`;
    }

    // Add persona title if available
    if (explanation.persona_title) {
      summary += `${explanation.persona_title}\n`;
      if (explanation.tagline) {
        summary += `"${explanation.tagline}"\n`;
      }
      summary += `\n`;
    }

    // Solution D: Add trait scores (handle null values)
    summary += `Trait Scores:\n${Object.entries(result.traits)
      .map(([trait, score]) => {
        if (score === null) {
          return `  ${trait}: No data (insufficient questions)`;
        }
        const displayScore = Math.round(score * 100);
        return `  ${trait}: ${displayScore}%`;
      })
      .join("\n")}\n\n`;

    // Add vibe summary or summary
    if (explanation.vibe_summary) {
      summary += `Vibe Summary:\n${explanation.vibe_summary}\n\n`;
    } else if (explanation.summary) {
      summary += `Summary:\n${explanation.summary}\n\n`;
    }

    // Add "How You Show Up" if available
    if (explanation.how_you_show_up) {
      summary += `How You Show Up:\n${explanation.how_you_show_up}\n\n`;
    }

    // Add strengths
    if (explanation.strengths && explanation.strengths.length > 0) {
      summary += `Strengths:\n${explanation.strengths.map((s) => `  • ${s}`).join("\n")}\n\n`;
    }

    // Add growth edges or cautions
    const growthAreas = explanation.growth_edges || explanation.cautions || [];
    if (growthAreas.length > 0) {
      summary += `Growth Edges:\n${growthAreas.map((g) => `  • ${g}`).join("\n")}\n`;
    }

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      showToast("Summary copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("Failed to copy summary", "error");
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;

    try {
      setIsDownloading(true);
      const blob = await downloadPDF(result.assessment_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lifesync-assessment-${result.assessment_id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      trackPDFDownloaded(result.assessment_id);
      showToast("PDF downloaded successfully!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to download PDF",
        "error"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    try {
      setIsSharing(true);
      const shareResponse = await shareResult(result.assessment_id);
      setShareUrl(shareResponse.url);
      trackResultShared(result.assessment_id, shareResponse.share_id);
      showToast("Share link created!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to create share link",
        "error"
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Share link copied to clipboard!", "success");
    } catch (err) {
      showToast("Failed to copy link", "error");
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading results..." />;
  }

  if (error && !result) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <Card className="text-center max-w-md">
          <h2 className="text-h3 text-red-400 mb-4">Error</h2>
          <p className="text-body text-white/70 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={loadAssessmentData}>Try Again</Button>
            <Button variant="secondary" onClick={() => router.push("/quiz")}>
              Take Quiz
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <Card className="text-center max-w-md">
          <h2 className="text-h3 text-white mb-4">No Results Found</h2>
          <p className="text-body text-white/70 mb-6">
            Please complete the assessment first.
          </p>
          <Button onClick={() => router.push("/quiz")}>Take Quiz</Button>
        </Card>
      </main>
    );
  }

  // Solution D: Convert trait scores from 0-1 to 0-100 for display (handle null)
  const convertTraitScore = (score: number | null): number | null => {
    if (score === null) return null;
    return Math.round(score * 100);
  };

  // Map full trait names to OCEAN codes
  const traitCodeMap: Record<string, string> = {
    Openness: "O",
    Conscientiousness: "C",
    Extraversion: "E",
    Agreeableness: "A",
    Neuroticism: "N",
  };

  // Prepare trait data for display (sorted by score, nulls last)
  const traits = Object.entries(result.traits)
    .map(([trait, score]) => ({
      name: trait,
      code: traitCodeMap[trait] || trait,
      score: convertTraitScore(score),
      rawScore: score, // Keep raw 0-1 score (can be null)
    }))
    .sort((a, b) => {
      // Sort nulls to the end
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });

  // Solution D: Convert to OCEAN format for radar chart (preserve null values)
  const oceanTraits = {
    O: result.traits.Openness ?? null,
    C: result.traits.Conscientiousness ?? null,
    E: result.traits.Extraversion ?? null,
    A: result.traits.Agreeableness ?? null,
    N: result.traits.Neuroticism ?? null,
  };

  // Check if profile is complete
  const hasCompleteProfile = result.has_complete_profile ?? (result.mbti !== null);

  return (
    <main className="min-h-screen p-6 py-12">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Your Personality Profile"
          subtitle="Based on the Big Five personality model"
          delay={0.2}
        />

        {/* Solution C: Invalid Assessment Banner */}
        {result.needs_retake && (
          <InvalidAssessmentBanner
            assessmentId={result.assessment_id}
            reason={result.needs_retake_reason}
          />
        )}

        {/* Solution D: Incomplete Profile Warning */}
        {!hasCompleteProfile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-yellow-500/30 bg-yellow-500/10">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                    Incomplete Profile
                  </h3>
                  <p className="text-sm text-white/80">
                    Some personality traits could not be calculated because not enough questions were answered.
                    {result.traits_with_data && result.traits_with_data.length > 0 && (
                      <> Traits with data: {result.traits_with_data.join(", ")}</>
                    )}
                  </p>
                  <p className="text-sm text-white/60 mt-2">
                    Complete a full assessment to see your complete personality profile and MBTI type.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* MBTI Proxy with Persona Card - Solution D: Handle null MBTI */}
        {result.mbti !== null ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <PersonalityResultCard mbtiType={result.mbti} delay={0.3} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <Card className="text-center border-yellow-500/30 bg-yellow-500/10">
              <h2 className="text-h3 text-yellow-400 mb-4">MBTI Type Unavailable</h2>
              <p className="text-body text-white/80 mb-4">
                Your MBTI type cannot be determined because the assessment is incomplete.
              </p>
              <p className="text-sm text-white/60">
                Complete all questions to see your MBTI type.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Trait Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Trait Bars */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-h3 text-white mb-6">Trait Scores</h2>
            <Card>
              <div className="space-y-6">
                {traits.map((trait, index) => (
                  <TraitBar
                    key={trait.name}
                    trait={trait.name}
                    score={trait.score}
                    max={100}
                    delay={0.5 + index * 0.1}
                  />
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-h3 text-white mb-6">Radar Visualization</h2>
            <Card>
              <TraitRadarChart 
                data={oceanTraits} 
                delay={0.6} 
                hasCompleteProfile={hasCompleteProfile}
              />
            </Card>
          </motion.div>
        </div>

        {/* AI Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <ScrollText className="w-6 h-6 text-purple-400" />
            <h2 className="text-h3 text-white">AI-Generated Insights</h2>
          </div>

          <Card glow>
            {isLoadingExplanation ? (
              <div className="text-center py-12">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-purple-500 mb-4"></div>
                <p className="text-body text-white/60">
                  Generating your personalized insights...
                </p>
              </div>
            ) : error && !explanation ? (
              <div className="text-center py-12">
                <p className="text-body text-red-400 mb-6">{error}</p>
                <Button
                  onClick={() => result && loadExplanation(result.assessment_id)}
                  variant="secondary"
                >
                  Try Again
                </Button>
              </div>
            ) : explanation ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Persona Title */}
                {explanation.persona_title ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center pb-6 border-b border-white/10"
                  >
                    <h2 className="text-4xl font-bold gradient-text mb-3">
                      {explanation.persona_title}
                    </h2>
                    {explanation.tagline && (
                      <p className="text-lg text-white/70 italic">
                        &ldquo;{explanation.tagline}&rdquo;
                      </p>
                    )}
                  </motion.div>
                ) : null}

                {/* Vibe Summary */}
                {explanation.vibe_summary ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-body-lg text-white/90 leading-relaxed text-center">
                      {explanation.vibe_summary}
                    </p>
                  </motion.div>
                ) : explanation.summary ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-body-lg text-white/90 leading-relaxed">
                      {explanation.summary}
                    </p>
                  </motion.div>
                ) : null}

                {/* How You Show Up */}
                {explanation.how_you_show_up ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 rounded-lg p-6 border border-white/10"
                  >
                    <h3 className="text-xl font-semibold text-white mb-4">
                      How You Show Up
                    </h3>
                    <p className="text-body text-white/80 leading-relaxed whitespace-pre-line">
                      {explanation.how_you_show_up}
                    </p>
                  </motion.div>
                ) : null}

                {/* Strengths */}
                {explanation.strengths && explanation.strengths.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-xl font-semibold text-white mb-4">Strengths</h3>
                    <ul className="space-y-3">
                      {explanation.strengths.map((strength, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + 0.1 * index }}
                          className="flex items-start gap-3 text-body text-white/80"
                        >
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{strength}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ) : null}

                {/* Growth Edges */}
                {(explanation.growth_edges && explanation.growth_edges.length > 0) ||
                (explanation.cautions && explanation.cautions.length > 0) ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Growth Edges
                    </h3>
                    <ul className="space-y-3">
                      {(explanation.growth_edges || explanation.cautions || []).map(
                        (edge, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + 0.1 * index }}
                            className="flex items-start gap-3 text-body text-white/80"
                          >
                            <XCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>{edge}</span>
                          </motion.li>
                        )
                      )}
                    </ul>
                  </motion.div>
                ) : null}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopySummary}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? "Copied!" : "Copy Summary"}
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {isDownloading ? "Downloading..." : "Download PDF"}
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleShare}
                      disabled={isSharing}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      {isSharing ? "Sharing..." : "Share Result"}
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push("/history")}
                      className="flex items-center gap-2"
                    >
                      <History className="w-4 h-4" />
                      View History
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push("/quiz")}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Take Quiz Again
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <p className="text-body text-white/60">
                  No explanation available. Please try regenerating.
                </p>
                {result && (
                  <Button
                    onClick={() => loadExplanation(result.assessment_id)}
                    variant="secondary"
                    className="mt-4"
                  >
                    Generate Explanation
                  </Button>
                )}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Share Modal */}
        {shareUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShareUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-8 max-w-md w-full mx-4"
            >
              <h3 className="text-h3 text-white mb-4">Share Your Results</h3>
              <p className="text-body text-white/70 mb-4">
                Share this link with others to view your personality assessment:
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyShareUrl}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
              <Button
                variant="primary"
                onClick={() => setShareUrl(null)}
                className="w-full"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingOverlay message="Loading results..." />}>
      <ResultsPageContent />
    </Suspense>
  );
}
