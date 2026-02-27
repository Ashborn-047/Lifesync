/**
 * LifeSync Mobile - Bottom Action Bar Component
 * Persistent horizontal scroll row of main features
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { radius } from '../../styles/radius';
import { shadows } from '../../styles/shadows';
import { slideUp, createStagger } from '../../lib/animations';

export interface ActionItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}

const ACTIONS: ActionItem[] = [
  { id: 'quiz', label: 'Take Quiz', icon: 'document-text', route: '/screens/QuizIntroScreen', color: colors.primary },
  { id: 'career', label: 'Explore Careers', icon: 'briefcase', route: '/screens/CareerCompassScreen', color: colors.cardPink },
  { id: 'mind', label: 'Mind Mesh', icon: 'leaf', route: '/screens/MindMeshScreen', color: colors.gradientTeal },
  { id: 'budget', label: 'Budget Buddy', icon: 'wallet', route: '/screens/BudgetBuddyScreen', color: colors.cardGold },
  { id: 'stats', label: 'Stats Card', icon: 'stats-chart', route: '/screens/HomeScreen', color: colors.gradientPurple },
];

export const BottomActionBar: React.FC = () => {
  const router = useRouter();

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <MotiView
      from={slideUp.from}
      animate={slideUp.animate}
      transition={slideUp.transition}
      style={styles.container}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ACTIONS.map((action, index) => (
          <MotiView
            key={action.id}
            {...createStagger(index, 50)}
          >
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: action.color }]}
              onPress={() => handlePress(action.route)}
              activeOpacity={0.7}
            >
              <Ionicons name={action.icon} size={20} color={action.color} />
              <Text style={[styles.actionLabel, { color: action.color }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          </MotiView>
        ))}
      </ScrollView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.md,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    backgroundColor: colors.background,
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  actionLabel: {
    ...typography.label,
    fontWeight: '600',
  },
});

export default BottomActionBar;

