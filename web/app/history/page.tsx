"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, ExternalLink, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SectionHeader from "@/components/ui/SectionHeader";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import TraitBar from "@/components/ui/TraitBar";
import MotionContainer from "@/components/ui/MotionContainer";
import { fetchHistory } from "@/lib/api";
import type { AssessmentHistoryItem } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await fetchHistory("default");
      setHistory(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load assessment history"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleViewReport = (assessmentId: string) => {
    // Store assessment ID and navigate to results
    // In a real app, you'd fetch the full assessment data
    router.push(`/results?assessment_id=${assessmentId}`);
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading assessment history..." />;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <Card className="text-center max-w-md">
          <h2 className="text-h3 text-red-400 mb-4">Error</h2>
          <p className="text-body text-white/70 mb-6">{error}</p>
          <Button onClick={loadHistory}>Try Again</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 py-12">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Assessment History"
          subtitle="View your past personality assessments"
          delay={0.2}
        />

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Card>
              <TrendingUp className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-h3 text-white mb-4">No Assessments Yet</h3>
              <p className="text-body text-white/70 mb-6">
                Complete your first personality assessment to see it here.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push("/quiz")}
              >
                Start Assessment
              </Button>
            </Card>
          </motion.div>
        ) : (
          <MotionContainer
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            stagger
            staggerDelay={0.1}
            delay={0.3}
          >
              {history.map((item) => {
                return (
                <motion.div
                  key={item.assessment_id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card hover className="h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-white/60" />
                          <span className="text-sm text-white/60">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        <Badge variant="primary" className="mt-2">
                          {item.mbti}
                        </Badge>
                      </div>
                    </div>

                    {/* Mini Trait Preview */}
                    <div className="mb-4 flex-1">
                      <div className="space-y-2">
                          {Object.entries(item.traits)
                            .slice(0, 3)
                            .map(([trait, score]) => {
                              const safeScore = score ?? 0;
                              return (
                                <div
                                  key={trait}
                                  className="flex items-center gap-2"
                                >
                                  <span className="text-xs text-white/60 w-8">
                                    {trait}
                                  </span>
                                  <div className="flex-1 bg-white/10 rounded-full h-2">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                      style={{ width: `${safeScore}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-white/80 w-10 text-right">
                                    {Math.round(safeScore)}%
                                  </span>
                                </div>
                              );
                            })}
                      </div>
                    </div>

                    {/* Summary Preview */}
                    {item.summary && (
                      <p className="text-sm text-white/60 mb-4 line-clamp-2">
                        {item.summary}
                      </p>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewReport(item.assessment_id)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Report
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </MotionContainer>
        )}
      </div>
    </main>
  );
}

