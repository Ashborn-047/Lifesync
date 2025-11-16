/**
 * LifeSync Mobile - Gradient Card Component
 * Reusable container with gradient background, large radius, soft shadow
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { radius } from '../../styles/radius';
import { shadows } from '../../styles/shadows';
import { springCard } from '../../lib/animations';

export interface GradientCardProps {
  gradient: [string, string];
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
  delay?: number;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  gradient,
  title,
  subtitle,
  icon,
  onPress,
  style,
  delay = 0,
}) => {
  const CardContent = (
    <MotiView
      from={springCard.from}
      animate={springCard.animate}
      transition={{
        ...springCard.transition,
        delay,
      }}
      style={[styles.card, style]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={32} color={colors.textInverse} />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      </LinearGradient>
    </MotiView>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius['3xl'],
    overflow: 'hidden',
    ...shadows.lg,
  },
  gradient: {
    padding: spacing.lg,
    minHeight: 120,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    ...typography.title,
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textInverse,
    opacity: 0.9,
  },
});

export default GradientCard;

