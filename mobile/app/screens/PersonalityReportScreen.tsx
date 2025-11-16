/**
 * LifeSync Mobile - Personality Report Screen
 * Displays real assessment results with persona information
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { safeHaptic, ImpactFeedbackStyle } from '../lib/haptics';
import { colors, gradients } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { GradientCard, MetricChip, SectionHeader } from '../components/cards';
import { springCard, pulseGlow, createStagger } from '../lib/animations';
import { getPersona } from '../lib/personas';

export const PersonalityReportScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  // Parse params
  const assessmentId = params.assessmentId as string;
  const mbti = params.mbti as string;
  const traitsJson = params.traits as string;
  const facetsJson = params.facets as string;
  const hasCompleteProfile = params.hasCompleteProfile === 'true';
  const summary = params.summary as string;
  const personaTitle = params.personaTitle as string;
  const strengthsJson = params.strengths as string;
  const growthEdgesJson = params.growthEdges as string;
  const howYouShowUp = params.howYouShowUp as string;
  const tagline = params.tagline as string;

  // Parse JSON data
  const traits = useMemo(() => {
    try {
      return JSON.parse(traitsJson || '{}') as Record<string, number | null>;
    } catch {
      return {};
    }
  }, [traitsJson]);

  const facets = useMemo(() => {
    try {
      return JSON.parse(facetsJson || '{}') as Record<string, number | null>;
    } catch {
      return {};
    }
  }, [facetsJson]);

  const strengths = useMemo(() => {
    try {
      return JSON.parse(strengthsJson || '[]') as string[];
    } catch {
      return [];
    }
  }, [strengthsJson]);

  const growthEdges = useMemo(() => {
    try {
      return JSON.parse(growthEdgesJson || '[]') as string[];
    } catch {
      return [];
    }
  }, [growthEdgesJson]);

  // Get persona data
  const persona = getPersona(mbti);

  // Convert trait scores to percentages
  const traitScores = useMemo(() => {
    const traitMap: Record<string, { label: string; color: string }> = {
      Openness: { label: 'Openness', color: colors.traitOpenness || '#8B5CF6' },
      Conscientiousness: { label: 'Conscientiousness', color: colors.traitConscientiousness || '#10B981' },
      Extraversion: { label: 'Extraversion', color: colors.traitExtraversion || '#F59E0B' },
      Agreeableness: { label: 'Agreeableness', color: colors.traitAgreeableness || '#3B82F6' },
      Neuroticism: { label: 'Neuroticism', color: colors.traitNeuroticism || '#EF4444' },
    };

    return Object.entries(traits)
      .filter(([, score]) => score !== null)
      .map(([trait, score]) => ({
        label: traitMap[trait]?.label || trait,
        value: `${Math.round((score || 0) * 100)}%`,
        color: traitMap[trait]?.color || colors.primary,
        score: score || 0,
      }))
      .sort((a, b) => b.score - a.score);
  }, [traits]);

  const handleRetake = () => {
    safeHaptic.impact(ImpactFeedbackStyle.Medium);
    router.push('/screens/QuizIntroScreen');
  };

  const handleGoHome = () => {
    safeHaptic.impact(ImpactFeedbackStyle.Medium);
    router.push('/screens/HomeScreen');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Persona Summary Card */}
        <MotiView
          from={springCard.from}
          animate={springCard.animate}
          transition={springCard.transition}
          style={styles.personaCard}
        >
          <MotiView
            from={pulseGlow.from}
            animate={pulseGlow.animate}
            transition={pulseGlow.transition}
            style={styles.glowContainer}
          >
            <LinearGradient
              colors={gradients.personaGradient || ['#8B5CF6', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.personaGradient}
            >
              <View style={styles.personaContent}>
                <Ionicons name="sparkles" size={48} color={colors.textInverse || '#FFFFFF'} />
                <Text style={styles.personaTitle}>
                  {personaTitle || persona?.personaName || 'Your Persona'}
                </Text>
                {mbti && (
                  <Text style={styles.personaSubtitle}>{mbti}</Text>
                )}
                {tagline && (
                  <Text style={styles.personaDescription}>{tagline}</Text>
                )}
                {!tagline && persona?.tagline && (
                  <Text style={styles.personaDescription}>{persona.tagline}</Text>
                )}
              </View>
            </LinearGradient>
          </MotiView>
        </MotiView>

        {/* Incomplete Profile Warning */}
        {!hasCompleteProfile && (
          <MotiView {...createStagger(1, 100)}>
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={24} color={colors.warning || '#F59E0B'} />
              <Text style={styles.warningText}>
                Some traits could not be calculated. Complete all questions for a full profile.
              </Text>
            </View>
          </MotiView>
        )}

        {/* Trait Scores */}
        <SectionHeader
          title="Trait Scores"
          subtitle="Your personality dimensions"
          delay={200}
        />
        
        <View style={styles.chipsContainer}>
          {traitScores.map((trait, index) => (
            <MotiView key={trait.label} {...createStagger(index, 50)}>
              <MetricChip
                label={trait.label}
                value={trait.value}
                backgroundColor={`${trait.color}20`}
              />
            </MotiView>
          ))}
        </View>

        {/* Summary Section */}
        {(summary || howYouShowUp) && (
          <>
            <SectionHeader
              title="Your Personality Summary"
              subtitle="How you show up in the world"
              delay={400}
            />
            <MotiView {...createStagger(5, 100)}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>
                  {howYouShowUp || summary}
                </Text>
              </View>
            </MotiView>
          </>
        )}

        {/* Strengths */}
        {(strengths.length > 0 || persona?.strengths) && (
          <>
            <SectionHeader
              title="Strengths"
              subtitle="Your natural talents"
              delay={600}
            />
            {(strengths.length > 0 ? strengths : persona?.strengths || []).map((strength, index) => (
              <MotiView key={index} {...createStagger(6 + index, 100)}>
                <View style={styles.insightCard}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success || '#10B981'} />
                  <Text style={styles.insightText}>{strength}</Text>
                </View>
              </MotiView>
            ))}
          </>
        )}

        {/* Growth Areas */}
        {(growthEdges.length > 0 || persona?.challenges) && (
          <>
            <SectionHeader
              title="Growth Areas"
              subtitle="Opportunities for development"
              delay={800}
            />
            {(growthEdges.length > 0 ? growthEdges : persona?.challenges || []).map((challenge, index) => (
              <MotiView key={index} {...createStagger(8 + index, 100)}>
                <View style={styles.insightCard}>
                  <Ionicons name="alert-circle" size={24} color={colors.warning || '#F59E0B'} />
                  <Text style={styles.insightText}>{challenge}</Text>
                </View>
              </MotiView>
            ))}
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <MotiView {...createStagger(12, 100)} style={styles.actionButtonWrapper}>
            <TouchableOpacity
              style={[styles.actionButton, styles.homeButton]}
              onPress={handleGoHome}
              activeOpacity={0.8}
            >
              <Ionicons name="home" size={20} color={colors.primary || '#6366F1'} />
              <Text style={styles.actionButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </MotiView>

          <MotiView {...createStagger(13, 100)} style={styles.actionButtonWrapper}>
            <TouchableOpacity
              style={[styles.actionButton, styles.retakeButton]}
              onPress={handleRetake}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.personaGradient || ['#8B5CF6', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Retake Assessment</Text>
                <Ionicons name="refresh" size={20} color={colors.textInverse || '#FFFFFF'} />
              </LinearGradient>
            </TouchableOpacity>
          </MotiView>
        </View>
      </ScrollView>
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
  personaCard: {
    marginBottom: spacing.xl,
    borderRadius: radius['3xl'] || 24,
    overflow: 'hidden',
    ...shadows.xl,
  },
  glowContainer: {
    borderRadius: radius['3xl'] || 24,
  },
  personaGradient: {
    padding: spacing.xl,
    minHeight: 200,
  },
  personaContent: {
    alignItems: 'center',
  },
  personaTitle: {
    ...typography.heading,
    color: colors.textInverse || '#FFFFFF',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  personaSubtitle: {
    ...typography.title,
    color: colors.textInverse || '#FFFFFF',
    opacity: 0.9,
    marginBottom: spacing.md,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  personaDescription: {
    ...typography.body,
    color: colors.textInverse || '#FFFFFF',
    opacity: 0.85,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20' || '#F59E0B20',
    padding: spacing.md,
    borderRadius: radius.xl || 16,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.xl || 16,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  summaryText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.xl || 16,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadows.md,
  },
  insightText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 24,
  },
  actionButtonsContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  actionButtonWrapper: {
    width: '100%',
  },
  actionButton: {
    borderRadius: radius.xl || 16,
    overflow: 'hidden',
    ...shadows.lg,
  },
  homeButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary || '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  retakeButton: {
    borderRadius: radius.xl || 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.primary || '#6366F1',
  },
  buttonText: {
    ...typography.button,
    color: colors.textInverse || '#FFFFFF',
  },
});

export default PersonalityReportScreen;
