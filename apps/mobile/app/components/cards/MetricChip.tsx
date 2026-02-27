/**
 * LifeSync Mobile - Metric Chip Component
 * Small rounded pill with animated highlight on press
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { radius } from '../../styles/radius';
import { pressScale } from '../../lib/animations';

export interface MetricChipProps {
  label: string;
  value?: string | number;
  backgroundColor?: string;
  onPress?: () => void;
}

export const MetricChip: React.FC<MetricChipProps> = ({
  label,
  value,
  backgroundColor = colors.primary + '20',
  onPress,
}) => {
  const ChipContent = (
    <MotiView
      from={pressScale.from}
      animate={pressScale.animate}
      transition={pressScale.transition}
      style={[styles.chip, { backgroundColor }]}
    >
      <Text style={styles.label}>{label}</Text>
      {value !== undefined && <Text style={styles.value}>{value}</Text>}
    </MotiView>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {ChipContent}
      </TouchableOpacity>
    );
  }

  return ChipContent;
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  value: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

export default MetricChip;

