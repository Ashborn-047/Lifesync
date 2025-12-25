/**
 * LifeSync Mobile - Budget Buddy Screen
 * Personal finance tracking and budgeting
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
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
import { GradientCard, SectionHeader, MetricChip } from '../components/cards';
import { springCard, createStagger, slideUp, fadeIn } from '../lib/animations';

export const BudgetBuddyScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddExpense = () => {
    safeHaptic.impact(ImpactFeedbackStyle.Medium);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero Bar */}
        <MotiView
          from={slideUp.from}
          animate={slideUp.animate}
          transition={slideUp.transition}
          style={styles.heroBar}
        >
          <LinearGradient
            colors={gradients.careerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Text style={styles.heroTitle}>Budget Buddy</Text>
            <Text style={styles.heroSubtitle}>Track your finances with ease</Text>
          </LinearGradient>
        </MotiView>

        {/* Monthly Budget Card */}
        <MotiView {...createStagger(1, 100)}>
          <GradientCard
            gradient={gradients.brandGradient}
            title="Monthly Budget"
            subtitle="$2,500 remaining"
            icon="wallet"
            onPress={() => {}}
            delay={100}
            style={styles.budgetCard}
          />
        </MotiView>

        {/* Quick Stats */}
        <SectionHeader
          title="Quick Stats"
          subtitle="Your spending overview"
          delay={200}
        />
        
        <MotiView {...createStagger(2, 100)}>
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <MetricChip label="Spent" value="$1,200" backgroundColor={colors.cardPink + '20'} />
              <MetricChip label="Saved" value="$800" backgroundColor={colors.success + '20'} />
              <MetricChip label="Budget" value="$3,000" backgroundColor={colors.primary + '20'} />
            </View>
          </View>
        </MotiView>

        {/* Add Expense Card */}
        <SectionHeader
          title="Add Expense"
          subtitle="Record a new transaction"
          delay={400}
        />
        
        <MotiView {...createStagger(3, 100)}>
          <View style={styles.expenseCard}>
            <TextInput
              style={styles.input}
              placeholder="Expense name"
              placeholderTextColor={colors.textTertiary}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddExpense}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.careerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={20} color={colors.textInverse} />
                <Text style={styles.addButtonText}>Add Expense</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Recent Expenses */}
        <SectionHeader
          title="Recent Expenses"
          subtitle="Your latest transactions"
          delay={600}
        />
        
        {[
          { name: 'Groceries', amount: '$120', date: 'Today' },
          { name: 'Coffee', amount: '$5', date: 'Yesterday' },
          { name: 'Transport', amount: '$45', date: '2 days ago' },
        ].map((expense, index) => (
          <MotiView key={expense.name} {...createStagger(4 + index, 100)}>
            <View style={styles.expenseItem}>
              <View style={styles.expenseIcon}>
                <Ionicons name="receipt" size={24} color={colors.primary} />
              </View>
              <View style={styles.expenseContent}>
                <Text style={styles.expenseName}>{expense.name}</Text>
                <Text style={styles.expenseDate}>{expense.date}</Text>
              </View>
              <Text style={styles.expenseAmount}>{expense.amount}</Text>
            </View>
          </MotiView>
        ))}
      </ScrollView>

      {/* Floating Success Message */}
      {showSuccess && (
        <MotiView
          from={fadeIn.from}
          animate={fadeIn.animate}
          transition={fadeIn.transition}
          style={styles.successMessage}
        >
          <LinearGradient
            colors={[colors.success, colors.success + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.successGradient}
          >
            <Ionicons name="checkmark-circle" size={24} color={colors.textInverse} />
            <Text style={styles.successText}>Expense added successfully!</Text>
          </LinearGradient>
        </MotiView>
      )}
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
  budgetCard: {
    marginBottom: spacing.xl,
  },
  statsCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  expenseCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  addButton: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: spacing.sm,
    ...shadows.md,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  addButtonText: {
    ...typography.button,
    color: colors.textInverse,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  expenseContent: {
    flex: 1,
  },
  expenseName: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  expenseDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  expenseAmount: {
    ...typography.title,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  successMessage: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  successGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  successText: {
    ...typography.button,
    color: colors.textInverse,
  },
});

export default BudgetBuddyScreen;

