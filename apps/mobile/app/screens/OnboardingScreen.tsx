/**
 * LifeSync Mobile - Onboarding Screen
 * Welcome screen with "Start Personality Quiz" button
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

export const OnboardingScreen: React.FC = () => {
  const router = useRouter();

  const handleStartQuiz = () => {
    router.push('/screens/QuizIntroScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to LifeSync</Text>
        <Text style={styles.subtitle}>
          Discover your personality through our comprehensive assessment
        </Text>
        <Text style={styles.description}>
          Take our scientifically-backed personality quiz to understand your
          unique traits, strengths, and growth areas.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleStartQuiz}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Start Personality Quiz</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  buttonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});

export default OnboardingScreen;

