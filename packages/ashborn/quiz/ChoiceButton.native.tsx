/**
 * LifeSync Mobile - Choice Button Component
 * 5-point Likert scale button
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

export interface ChoiceButtonProps {
  label: string;
  value: number; // 1-5
  selected: boolean;
  onPress: (value: number) => void;
}

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  label,
  value,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, selected && styles.buttonSelected]}
      onPress={() => onPress(value)}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Predefined choices for Likert scale
export const LIKERT_CHOICES = [
  { label: 'Strongly Disagree', value: 1 },
  { label: 'Disagree', value: 2 },
  { label: 'Neutral', value: 3 },
  { label: 'Agree', value: 4 },
  { label: 'Strongly Agree', value: 5 },
] as const;

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginVertical: spacing.xs,
  },
  buttonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20', // 20% opacity
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default ChoiceButton;

