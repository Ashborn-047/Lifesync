/**
 * LifeSync Mobile - Section Header Component
 * Title + subtitle with fade + slide-in animation
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { slideRight } from '../../lib/animations';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  delay?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  delay = 0,
}) => {
  return (
    <MotiView
      from={slideRight.from}
      animate={slideRight.animate}
      transition={{
        ...slideRight.transition,
        delay,
      }}
      style={styles.container}
    >
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

export default SectionHeader;

