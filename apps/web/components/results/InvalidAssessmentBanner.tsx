"use client";

import { motion } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface InvalidAssessmentBannerProps {
  assessmentId: string;
  reason?: string;
}

/**
 * Banner component to display when an assessment is flagged as invalid
 * (e.g., due to unbalanced question set from the bug)
 */
export default function InvalidAssessmentBanner({
  assessmentId,
  reason,
}: InvalidAssessmentBannerProps) {
  const router = useRouter();

  const handleRetake = () => {
    // Navigate to quiz page to retake assessment
    router.push("/quiz");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card className="border-red-500/30 bg-red-500/10">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Assessment Needs Retake
            </h3>
            <p className="text-sm text-white/80 mb-3">
              This assessment was completed with an unbalanced question set and may not accurately reflect your personality.
            </p>
            {reason && (
              <p className="text-xs text-white/60 mb-3">
                <strong>Reason:</strong> {reason}
              </p>
            )}
            <p className="text-sm text-white/70 mb-4">
              We recommend retaking the assessment to get accurate results based on a balanced set of questions covering all personality traits.
            </p>
            <Button
              onClick={handleRetake}
              variant="primary"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Assessment
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

