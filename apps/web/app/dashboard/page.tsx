"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Brain,
  TrendingUp,
  Target,
  Smile,
  Lightbulb,
  ArrowRight,
  BarChart3,
  Puzzle,
  Wallet,
  Briefcase,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import MotionContainer from "@/components/ui/MotionContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import type { AssessmentResult } from "@lifesync/types";

export default function DashboardPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem("assessmentResult");
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    }
  }, []);

  const dashboardCards = [
    {
      id: "personality",
      title: "Personality Summary",
      icon: Brain,
      description: result
        ? `Your ${result.mbti} personality type`
        : "Complete assessment to see your summary",
      content: result ? (
        <div className="space-y-2">
          {Object.entries(result.traits)
            .slice(0, 3)
            .filter(([, score]) => score !== null)
            .map(([trait, score]) => {
              // Convert from 0-1 scale to 0-100 for display
              const displayScore = Math.round((score ?? 0) * 100);
              return (
                <div key={trait} className="flex justify-between text-sm">
                  <span className="text-white/70">{trait}</span>
                  <span className="text-white font-semibold">
                    {displayScore}%
                  </span>
                </div>
              );
            })}
        </div>
      ) : (
        <p className="text-white/50 text-sm">
          Take the assessment to unlock insights
        </p>
      ),
      colSpan: "col-span-1",
      action: result ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push("/results")}
          className="mt-4"
        >
          View Full Results
        </Button>
      ) : (
        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push("/quiz")}
          className="mt-4"
        >
          Start Assessment
        </Button>
      ),
    },
    {
      id: "insights",
      title: "Daily Insights",
      icon: TrendingUp,
      description: "Personalized recommendations for today",
      content: (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5"></div>
            <div>
              <p className="text-sm font-medium text-white">
                Focus on creative tasks
              </p>
              <p className="text-xs text-white/60">
                Your openness score suggests you&apos;ll excel today
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5"></div>
            <div>
              <p className="text-sm font-medium text-white">
                Schedule social activities
              </p>
              <p className="text-xs text-white/60">
                Boost your extraversion with connections
              </p>
            </div>
          </div>
        </div>
      ),
      colSpan: "col-span-1",
    },
    {
      id: "strengths",
      title: "Strengths & Challenges",
      icon: Target,
      description: "Areas to leverage and develop",
      content: result ? (() => {
        // Sort traits by score (highest first for strengths, lowest first for growth)
        const sortedTraits = Object.entries(result.traits)
          .filter(([, score]) => score !== null)
          .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0));
        const strengths = sortedTraits.slice(0, 2).map(([trait]) => trait);
        // Get growth areas (lowest scores) but exclude traits already in strengths
        const growthTraits = sortedTraits
          .filter(([trait]) => !strengths.includes(trait))
          .slice(-2)
          .map(([trait]) => trait);

        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-green-400 mb-2 uppercase">
                Strengths
              </h4>
              <div className="space-y-1">
                {strengths.length > 0 ? (
                  strengths.map((trait) => (
                    <Badge key={trait} variant="success" size="sm">
                      {trait}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-white/50">No data</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-yellow-400 mb-2 uppercase">
                Growth
              </h4>
              <div className="space-y-1">
                {growthTraits.length > 0 ? (
                  growthTraits.map((trait) => (
                    <Badge key={trait} variant="warning" size="sm">
                      {trait}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-white/50">No data</p>
                )}
              </div>
            </div>
          </div>
        );
      })() : (
        <p className="text-white/50 text-sm text-center py-4">
          Complete assessment to see your strengths
        </p>
      ),
      colSpan: "col-span-1",
    },
    {
      id: "mood",
      title: "Mood Tracker",
      icon: Smile,
      description: "Track your emotional patterns",
      content: (
        <div className="text-center py-4">
          <p className="text-white/50 text-sm mb-3">
            Mood tracking coming soon
          </p>
          <Badge variant="accent" size="sm">
            Coming Soon
          </Badge>
        </div>
      ),
      colSpan: "col-span-1",
    },
    {
      id: "recommendations",
      title: "Recommendation Engine",
      icon: Lightbulb,
      description: "AI-powered suggestions for you",
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="w-4 h-4 text-purple-400" />
            <span className="text-white/80">
              Explore MindMesh for mental wellness
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <span className="text-white/80">
              Check BudgetBuddy for finances
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="w-4 h-4 text-pink-400" />
            <span className="text-white/80">Review Career Path options</span>
          </div>
        </div>
      ),
      colSpan: "col-span-1",
    },
    {
      id: "next-steps",
      title: "Next Steps",
      icon: BarChart3,
      description: "Your action items",
      content: (
        <div className="space-y-3">
          {!result && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/quiz")}
              className="w-full"
            >
              Take Personality Assessment
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/results")}
            className="w-full"
            disabled={!result}
          >
            View Assessment Results
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="w-full"
          >
            Explore Features
          </Button>
        </div>
      ),
      colSpan: "col-span-1",
    },
  ];

  return (
    <main className="min-h-screen p-6 py-12">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Your LifeSync Dashboard"
          subtitle="Your personalized hub for life optimization"
          delay={0.2}
        />

        {/* Bento Grid Layout */}
        <MotionContainer
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          stagger
          staggerDelay={0.1}
          delay={0.3}
        >
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={card.colSpan}
              >
                <Card hover className="h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-white/5">
                      <Icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {card.title}
                      </h3>
                      <p className="text-xs text-white/60 mt-0.5">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 mb-4">{card.content}</div>

                  {card.action && <div>{card.action}</div>}
                </Card>
              </motion.div>
            );
          })}
        </MotionContainer>

        {/* Coming Soon Modules */}
        <MotionContainer delay={0.8} className="mt-12">
          <h2 className="text-h3 text-white mb-6">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="relative overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <Badge variant="primary" size="sm">
                      Coming Soon
                    </Badge>
                  </div>
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 rounded-2xl bg-white/5">
                      <module.icon className="w-12 h-12 text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {module.title}
                  </h3>
                  <p className="text-body-sm text-white/60">
                    {module.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </MotionContainer>
      </div>
    </main>
  );
}

const modules = [
  {
    icon: Puzzle,
    title: "MindMesh",
    description:
      "AI-powered mental wellness companion that adapts to your personality",
  },
  {
    icon: Wallet,
    title: "BudgetBuddy",
    description:
      "Smart financial planning tailored to your spending patterns and goals",
  },
  {
    icon: Briefcase,
    title: "Career Path",
    description:
      "Personalized career guidance based on your traits and aspirations",
  },
];
