/**
 * LifeSync Mobile - Home Dashboard Screen
 * Overhauled UI matching web mockups
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { safeHaptic, ImpactFeedbackStyle } from '../lib/haptics';
import { colors, gradients } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { GradientCard, SectionHeader, BottomActionBar, MetricChip } from '../components/cards';
import { createStagger, slideUp } from '../lib/animations';
import { useLatestAssessment } from '../hooks/useLatestAssessment';
import { getPersona } from '@lifesync/personality-engine';

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { result, loading } = useLatestAssessment();

  const handlePress = (route: string) => {
    safeHaptic.impact(ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  // Get persona data from assessment
  const persona = useMemo(() => {
    if (!result?.mbti) return null;
    return getPersona(result.mbti);
  }, [result?.mbti]);

  // Map persona icon to Ionicons name
  const personaIcon = useMemo(() => {
    if (!persona?.icon) return "sparkles" as keyof typeof Ionicons.glyphMap;
    // Convert "Sparkles" to "sparkles" for Ionicons
    const iconName = persona.icon.toLowerCase();
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      sparkles: "sparkles",
      eye: "eye",
      target: "locate",
      briefcase: "briefcase",
      activity: "pulse",
      puzzle: "extension-puzzle",
      users: "people",
      zap: "flash",
      crown: "trophy",
      rocket: "rocket",
      shield: "shield-checkmark",
      palette: "color-palette",
      checkcircle: "checkmark-circle",
      wrench: "construct",
      heart: "heart",
      star: "star",
    };
    return iconMap[iconName] || "sparkles" as keyof typeof Ionicons.glyphMap;
  }, [persona?.icon]);

  // Format personality title
  const personalityTitle = useMemo(() => {
    if (!result?.mbti) return 'Take Personality Quiz';
    if (persona) {
      return `${result.mbti} - ${persona.personaName}`;
    }
    return result.mbti;
  }, [result?.mbti, persona]);

  // Format personality subtitle
  const personalitySubtitle = useMemo(() => {
    if (!result?.mbti) return 'Discover your unique personality profile';
    return persona?.tagline || 'Your personality profile';
  }, [result?.mbti, persona]);

  // Get trait scores for display
  const traitScores = useMemo(() => {
    if (!result?.traits) return [];

    const traitMap: Record<string, { label: string; color: string }> = {
      Openness: { label: 'Openness', color: colors.traitOpenness || '#8B5CF6' },
      Conscientiousness: { label: 'Conscientiousness', color: colors.traitConscientiousness || '#10B981' },
      Extraversion: { label: 'Extraversion', color: colors.traitExtraversion || '#F59E0B' },
      Agreeableness: { label: 'Agreeableness', color: colors.traitAgreeableness || '#3B82F6' },
      Neuroticism: { label: 'Neuroticism', color: colors.traitNeuroticism || '#EF4444' },
    };

    return Object.entries(result.traits)
      .filter(([, score]) => score !== null)
      .map(([trait, score]) => ({
        label: traitMap[trait]?.label || trait,
        value: `${Math.round((score || 0) * 100)}%`,
        score: score || 0,
        color: traitMap[trait]?.color || colors.primary,
      }))
      .sort((a, b) => b.score - a.score);
  }, [result?.traits]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Bar */}
        <MotiView
          from={slideUp.from}
          animate={slideUp.animate}
          transition={slideUp.transition}
          style={styles.heroBar}
        >
          <LinearGradient
            colors={gradients.heroGradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Text style={styles.heroTitle}>LifeSync</Text>
            <Text style={styles.heroSubtitle}>Your Personal Development Companion</Text>
          </LinearGradient>
        </MotiView>

        {/* Three Cards Row */}
        <View style={styles.cardsRow}>
          <MotiView {...createStagger(0, 100)} style={styles.cardWrapper}>
            <GradientCard
              gradient={gradients.personaGradient}
              title="Guest Profile"
              subtitle="View your persona"
              icon="person"
              onPress={() => handlePress('/screens/PersonalityReportScreen')}
              delay={0}
            />
          </MotiView>

          <MotiView {...createStagger(1, 100)} style={styles.cardWrapper}>
            <GradientCard
              gradient={gradients.brandGradient}
              title="Daily Sync"
              subtitle="Check in today"
              icon="sync"
              onPress={() => { }}
              delay={100}
            />
          </MotiView>

          <MotiView {...createStagger(2, 100)} style={styles.cardWrapper}>
            <GradientCard
              gradient={gradients.tipGradient}
              title="Quick Tip"
              subtitle="Daily insight"
              icon="bulb"
              onPress={() => { }}
              delay={200}
            />
          </MotiView>
        </View>

        {/* Personality Overview */}
        <SectionHeader
          title="Personality Overview"
          subtitle={result ? "Your OCEAN traits at a glance" : "Complete assessment to see your traits"}
          delay={300}
        />

        <MotiView {...createStagger(3, 100)}>
          <GradientCard
            gradient={gradients.personaGradient as any}
            title={personalityTitle}
            subtitle={personalitySubtitle}
            icon={personaIcon}
            onPress={() => {
              if (result) {
                handlePress('/screens/PersonalityReportScreen');
              } else {
                handlePress('/screens/QuizIntroScreen');
              }
            }}
            delay={300}
            style={styles.personalityCard}
          />
        </MotiView>

        {/* Trait Chips */}
        {result && traitScores.length > 0 ? (
          <View style={styles.chipsContainer}>
            {traitScores.map((trait, index) => (
              <MotiView key={trait.label} {...createStagger(4 + index, 50)}>
                <MetricChip
                  label={trait.label}
                  value={trait.value}
                  backgroundColor={trait.color + '20'}
                />
              </MotiView>
            ))}
          </View>
        ) : (
          <MotiView {...createStagger(4, 100)}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Take the personality quiz to see your trait scores
              </Text>
              <TouchableOpacity
                style={styles.takeQuizButton}
                onPress={() => handlePress('/screens/QuizIntroScreen')}
                activeOpacity={0.8}
              >
                <Text style={styles.takeQuizButtonText}>Start Assessment</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}

        {/* Career Match Preview */}
        <SectionHeader
          title="Career Match"
          subtitle="Top matches for your personality"
          delay={800}
        />

        <MotiView {...createStagger(9, 100)}>
          <GradientCard
            gradient={gradients.careerGradient as any}
            title="Career DNA"
            subtitle="Explore your ideal career paths"
            icon="briefcase"
            onPress={() => handlePress('/screens/CareerCompassScreen')}
            delay={800}
            style={styles.careerCard}
          />
        </MotiView>
      </ScrollView>

      {/* Bottom Action Bar */}
      <BottomActionBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heroBar: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  heroGradient: {
    padding: spacing.lg,
    paddingVertical: spacing.xl,
  },
  heroTitle: {
    ...typography.display,
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textInverse,
    opacity: 0.9,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  cardWrapper: {
    flex: 1,
  },
  personalityCard: {
    marginBottom: spacing.lg,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  careerCard: {
    marginBottom: spacing.lg,
  },
  emptyState: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl || 16,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  takeQuizButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full || 999,
    ...shadows.md,
  },
  takeQuizButtonText: {
    ...typography.button,
    color: colors.textInverse || '#FFFFFF',
  },
});

export default HomeScreen;

