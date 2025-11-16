"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, Brain, BarChart3, Rocket } from "lucide-react";
import Button from "@/components/ui/Button";
import MotionContainer from "@/components/ui/MotionContainer";
import Card from "@/components/ui/Card";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-7xl mx-auto w-full">
        <MotionContainer className="text-center mb-16" delay={0.2}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
            className="inline-block mb-6"
          >
            <Sparkles className="w-16 h-16 text-purple-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-display gradient-text mb-6"
          >
            LifeSync Web
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-body-lg text-white/70 mb-4 max-w-2xl mx-auto"
          >
            Your Personalized Life Optimization Platform
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-body text-white/50 max-w-2xl mx-auto mb-12"
          >
            Discover your personality traits, optimize your habits, and unlock
            your full potential with AI-powered insights tailored just for you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push("/quiz")}
                className="animate-pulse-soft"
              >
                Start Assessment
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/dashboard")}
              >
                View Dashboard
              </Button>
            </motion.div>
          </motion.div>
        </MotionContainer>

        <MotionContainer
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
          stagger
          staggerDelay={0.1}
          delay={0.8}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card hover className="h-full text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1, type: "spring" }}
                  className="mb-4 flex justify-center"
                >
                  <div className="p-4 rounded-2xl bg-white/5">
                    <feature.icon className="w-12 h-12 text-purple-400" />
                  </div>
                </motion.div>
                <h3 className="text-h3 text-white mb-3">{feature.title}</h3>
                <p className="text-body-sm text-white/60">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </MotionContainer>
      </div>
    </main>
  );
}

const features = [
  {
    icon: Brain,
    title: "Personality Insights",
    description:
      "Deep dive into your Big Five traits and understand what makes you unique",
  },
  {
    icon: BarChart3,
    title: "AI-Powered Analysis",
    description:
      "Get personalized recommendations based on cutting-edge psychology research",
  },
  {
    icon: Rocket,
    title: "Life Optimization",
    description:
      "Tools for budgeting, career planning, and mental wellness all in one place",
  },
];
