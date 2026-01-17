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
import { generateExplanation, shareResult, downloadPDF, getAssessment } from "@lifesync/api-sdk";
import type { AssessmentResult, ParsedExplanation } from "@lifesync/types";
import { mapProfileToPersona, detectUniformResponses, type OCEAN, PERSONAS } from "@lifesync/personality-engine/mapping/personaMapping";

// ... (keep other imports)

function ResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("id");

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Explanation state
  const [explanation, setExplanation] = useState<ParsedExplanation | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  // UI state
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!assessmentId) {
      // If no ID, try to find latest from local storage or redirect
      const storedId = localStorage.getItem("latest_assessment_id");
      if (storedId) {
        router.replace(`/results?id=${storedId}`);
      } else {
        router.push("/quiz");
      }
      return;
    }

    const fetchData = async () => {
      try {
        // 🚀 PHASE 4/5: Local Fallback Handling
        if (assessmentId.startsWith("OFFLINE_")) {
          console.info("🔍 Loading offline assessment from session storage");
          const storedResult = sessionStorage.getItem("assessmentResult");
          if (storedResult) {
            const rawData = JSON.parse(storedResult);
            if (rawData.assessment_id === assessmentId) {
              // Transform CanonicalScoringResponse to AssessmentResult format
              const data: AssessmentResult = {
                assessment_id: rawData.assessment_id,
                traits: {
                  Openness: rawData.ocean?.O ?? 0,
                  Conscientiousness: rawData.ocean?.C ?? 0,
                  Extraversion: rawData.ocean?.E ?? 0,
                  Agreeableness: rawData.ocean?.A ?? 0,
                  Neuroticism: rawData.ocean?.N ?? 0,
                },
                facets: rawData.facets || {},
                mbti: rawData.mbti_proxy || null,
                has_complete_profile: true,
                is_complete: true,
                traits_with_data: ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"],
                needs_retake: false,
                needs_retake_reason: null,
                explanation: null, // Will be generated later
                answers: null,
              };
              setResult(data);
              setLoading(false);
              return;
            }
          }
        }

        const data = await getAssessment(assessmentId);
        setResult(data);
        if (data.explanation) {
          setExplanation(data.explanation);
        } else {
          // Auto-generate explanation if missing
          loadExplanation(assessmentId);
        }
      } catch (err) {
        console.error("Failed to load assessment:", err);
        setError("Failed to load results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assessmentId, router]);

  const loadExplanation = async (id: string) => {
    setIsLoadingExplanation(true);
    try {
      const exp = await generateExplanation(id);
      setExplanation(exp);
    } catch (e) {
      console.error("Failed to generate explanation:", e);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleCopySummary = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation.summary || explanation.vibe_summary || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    setIsDownloading(true);
    try {
      await downloadPDF(result.assessment_id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    setIsSharing(true);
    try {
      const urlResponse = await shareResult(result.assessment_id);
      setShareUrl(urlResponse.url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareUrl = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
  };

  if (loading) return <LoadingOverlay message="Loading results..." />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center border-red-500/30 bg-red-500/10">
        <h3 className="text-xl font-semibold text-red-400 mb-2">Error</h3>
        <p className="text-white/70 mb-6">{error}</p>
        <Button onClick={() => router.push("/quiz")} variant="primary">
          Return to Quiz
        </Button>
      </Card>
    </div>
  );
  if (!result) return null;

  const hasCompleteProfile = result.is_complete;

  // Prepare traits for visualization
  const traits = [
    { name: "Openness", score: (result.traits?.Openness || 0) * 100 },
    { name: "Conscientiousness", score: (result.traits?.Conscientiousness || 0) * 100 },
    { name: "Extraversion", score: (result.traits?.Extraversion || 0) * 100 },
    { name: "Agreeableness", score: (result.traits?.Agreeableness || 0) * 100 },
    { name: "Neuroticism", score: (result.traits?.Neuroticism || 0) * 100 },
  ];

  // For radar chart - use single letter keys and 0-1 scale
  const oceanTraitsForRadar = {
    O: result.traits?.Openness || 0,
    C: result.traits?.Conscientiousness || 0,
    E: result.traits?.Extraversion || 0,
    A: result.traits?.Agreeableness || 0,
    N: result.traits?.Neuroticism || 0,
  };

  // For persona mapping - use lowercase keys and 0-100 scale
  const oceanTraitsForPersona: OCEAN = {
    openness: traits[0].score,
    conscientiousness: traits[1].score,
    extraversion: traits[2].score,
    agreeableness: traits[3].score,
    neuroticism: traits[4].score,
  };

  // Calculate Persona
  const personaResult = (() => {
    // 1. Check for Uniform Responses (Diagnostic)
    if (result.answers && detectUniformResponses(result.answers)) {
      const uniformPersona = PERSONAS.find(p => p.id === 'p_uniform_response');
      if (uniformPersona) {
        return {
          persona: uniformPersona,
          confidence: 100,
          hits: 5,
          proximity: 0,
          tie: false
        };
      }
    }

    // 2. Standard Mapping
    // Fix: A score of 0 is valid. Check for existence, not truthiness.
    const hasData = result.traits &&
      result.traits.Openness !== null && result.traits.Openness !== undefined;

    if (!hasData) return null;
    return mapProfileToPersona(oceanTraitsForPersona);
  })();

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

        {/* NEW Persona Card */}
        {personaResult ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <PersonalityResultCard
              persona={personaResult.persona}
              confidence={personaResult.confidence}
              delay={0.3}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <Card className="text-center border-yellow-500/30 bg-yellow-500/10">
              <h2 className="text-h3 text-yellow-400 mb-4">Persona Unavailable</h2>
              <p className="text-body text-white/80 mb-4">
                Your personality persona cannot be determined because the assessment is incomplete.
              </p>
              <p className="text-sm text-white/60">
                Complete all questions to see your persona.
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
                data={oceanTraitsForRadar}
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
                {explanation.error && (
                  <div className="flex items-center gap-3 p-4 bg-red-950/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p>{explanation.error}</p>
                  </div>
                )}
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
                {explanation?.vibe_summary ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-body-lg text-white/90 leading-relaxed text-center">
                      {explanation.vibe_summary}
                    </p>
                  </motion.div>
                ) : explanation?.summary ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-body-lg text-white/90 leading-relaxed">
                      {explanation?.summary}
                    </p>
                  </motion.div>
                ) : null}

                {/* How You Show Up */}
                {explanation?.how_you_show_up ? (
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

                {explanation?.strengths && explanation.strengths.length > 0 ? (
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
                {(explanation?.growth_edges && explanation.growth_edges.length > 0) ||
                  (explanation?.cautions && explanation.cautions.length > 0) ? (
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
