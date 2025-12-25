/**
 * LifeSync Mobile - MindMesh Screen
 * AI-guided mindfulness and meditation
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { safeHaptic, ImpactFeedbackStyle } from '../lib/haptics';
import { colors, gradients } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { GradientCard, SectionHeader } from '../components/cards';
import { springCard, createStagger, slideUp } from '../lib/animations';

export const MindMeshScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [duration, setDuration] = useState(10);

  const mcolors = ['#ec4899', '#8b5cf6'] as any;
  const moods = ['Calm', 'Focused', 'Energized', 'Restful'];
  const goals = ['Reduce Stress', 'Improve Focus', 'Better Sleep', 'Emotional Balance'];

  const handleMoodSelect = (mood: string) => {
    safeHaptic.impact(ImpactFeedbackStyle.Light);
    setSelectedMood(mood);
  };

  const handleGoalSelect = (goal: string) => {
    safeHaptic.impact(ImpactFeedbackStyle.Light);
    setSelectedGoal(goal);
  };

  const handleGenerate = () => {
    safeHaptic.impact(ImpactFeedbackStyle.Medium);
    // Generate session
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <MotiView
          from={slideUp.from}
          animate={slideUp.animate}
          transition={slideUp.transition}
          style={styles.heroBar}
        >
          <LinearGradient
            colors={gradients.wellnessGradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Text style={styles.heroTitle}>Find your center</Text>
            <Text style={styles.heroSubtitle}>with AI-guided mindfulness</Text>
          </LinearGradient>
        </MotiView>

        {/* Interactive Surface */}
        <MotiView {...createStagger(1, 100)}>
          <LinearGradient
            colors={gradients.brandGradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.interactiveSurface}
          >
            <Ionicons name="leaf" size={64} color={colors.textInverse} />
            <Text style={styles.surfaceTitle}>MindMesh</Text>
            <Text style={styles.surfaceSubtitle}>Your mindfulness companion</Text>
          </LinearGradient>
        </MotiView>

        {/* Mood Selectors */}
        <SectionHeader
          title="How are you feeling?"
          subtitle="Select your current mood"
          delay={200}
        />

        <View style={styles.chipContainer}>
          {moods.map((mood, index) => (
            <MotiView key={mood} {...createStagger(2 + index, 50)}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  selectedMood === mood && styles.chipSelected,
                ]}
                onPress={() => handleMoodSelect(mood)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedMood === mood && styles.chipTextSelected,
                  ]}
                >
                  {mood}
                </Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        {/* Goal Selectors */}
        <SectionHeader
          title="What's your goal?"
          subtitle="Choose what you want to achieve"
          delay={600}
        />

        <View style={styles.chipContainer}>
          {goals.map((goal, index) => (
            <MotiView key={goal} {...createStagger(6 + index, 50)}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  selectedGoal === goal && styles.chipSelected,
                ]}
                onPress={() => handleGoalSelect(goal)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedGoal === goal && styles.chipTextSelected,
                  ]}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        {/* Duration Slider */}
        {/* Generate Session Button */}
        <MotiView {...createStagger(11, 100)}>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerate}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={gradients.wellnessGradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="sparkles" size={20} color={colors.textInverse} />
              <Text style={styles.buttonText}>Generate Session</Text>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>

        {/* Feature Cards */}
        <View style={styles.featureCards}>
          <MotiView {...createStagger(12, 100)}>
            <GradientCard
              gradient={gradients.brandGradient}
              title="Insights"
              subtitle="Track your progress"
              icon="analytics"
              onPress={() => { }}
              delay={1200}
            />
          </MotiView>

          <MotiView {...createStagger(13, 100)}>
            <GradientCard
              gradient={gradients.personaGradient}
              title="Mood Journal"
              subtitle="Record your feelings"
              icon="journal"
              onPress={() => { }}
              delay={1300}
            />
          </MotiView>

          <MotiView {...createStagger(14, 100)}>
            <GradientCard
              gradient={gradients.tipGradient}
              title="Meditation History"
              subtitle="View past sessions"
              icon="time"
              onPress={() => { }}
              delay={1400}
            />
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
    ...typography.heading,
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textInverse,
    opacity: 0.9,
  },
  interactiveSurface: {
    padding: spacing.xxl,
    borderRadius: radius['3xl'],
    alignItems: 'center',
    marginBottom: spacing.xl,
    minHeight: 200,
    justifyContent: 'center',
    ...shadows.xl,
  },
  surfaceTitle: {
    ...typography.heading,
    color: colors.textInverse,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  surfaceSubtitle: {
    ...typography.body,
    color: colors.textInverse,
    opacity: 0.9,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  sliderContainer: {
    marginBottom: spacing.xl,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sliderLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  generateButton: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  buttonText: {
    ...typography.button,
    color: colors.textInverse,
  },
  featureCards: {
    gap: spacing.md,
  },
});

export default MindMeshScreen;

