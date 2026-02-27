/**
 * LifeSync Mobile - Quiz Introduction Screen
 * Short description and "Begin Assessment" button
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

export const QuizIntroScreen: React.FC = () => {
  const router = useRouter();

  const handleBeginAssessment = () => {
    router.push('/screens/QuizScreen');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Personality Assessment</Text>
        <Text style={styles.subtitle}>30 Questions</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.description}>
          This assessment uses 30 carefully selected questions to evaluate your
          personality across five key dimensions:
        </Text>

        <View style={styles.dimensionsList}>
          <View style={styles.dimensionItem}>
            <Text style={styles.dimensionText}>• Openness to Experience</Text>
          </View>
          <View style={styles.dimensionItem}>
            <Text style={styles.dimensionText}>• Conscientiousness</Text>
          </View>
          <View style={styles.dimensionItem}>
            <Text style={styles.dimensionText}>• Extraversion</Text>
          </View>
          <View style={styles.dimensionItem}>
            <Text style={styles.dimensionText}>• Agreeableness</Text>
          </View>
          <View style={styles.dimensionItem}>
            <Text style={styles.dimensionText}>• Neuroticism</Text>
          </View>
        </View>

        <Text style={styles.note}>
          The assessment takes approximately 5-10 minutes to complete. Answer
          honestly for the most accurate results.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleBeginAssessment}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Begin Assessment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.subheading,
    color: colors.primary,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: spacing.xl,
  },
  description: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  dimensionsList: {
    marginBottom: spacing.lg,
    paddingLeft: spacing.md,
  },
  dimensionItem: {
    marginBottom: spacing.sm,
  },
  dimensionText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  note: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});

export default QuizIntroScreen;

