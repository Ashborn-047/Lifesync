/**
 * LifeSync Mobile - Question Card Component
 * Displays question text with children for buttons
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

import type { Question } from '@lifesync/types';

export interface QuestionCardProps {
  question: Question;
  questionNumber?: number;
  totalQuestions?: number;
  children?: React.ReactNode;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  children,
}) => {
  return (
    <View style={styles.container}>
      {questionNumber !== undefined && totalQuestions !== undefined && (
        <Text style={styles.progress}>
          Question {questionNumber} of {totalQuestions}
        </Text>
      )}
      <Text style={styles.questionText}>{question.text}</Text>
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progress: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  questionText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  childrenContainer: {
    marginTop: spacing.md,
  },
});

export default QuestionCard;

