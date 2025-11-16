/**
 * LifeSync Mobile - Career Compass Screen
 * Career matching and exploration
 */

import React from 'react';
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

export const CareerCompassScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    safeHaptic.impact(ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Title Bar */}
        <MotiView
          from={slideUp.from}
          animate={slideUp.animate}
          transition={slideUp.transition}
          style={styles.heroBar}
        >
          <LinearGradient
            colors={gradients.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Text style={styles.heroTitle}>Career Compass</Text>
            <Text style={styles.heroSubtitle}>Discover your ideal career paths</Text>
          </LinearGradient>
        </MotiView>

        {/* Career DNA Card */}
        <MotiView {...createStagger(1, 100)}>
          <GradientCard
            gradient={gradients.careerGradient}
            title="Career DNA"
            subtitle="Your personality-matched careers"
            icon="analytics"
            onPress={handlePress}
            delay={100}
            style={styles.careerCard}
          />
        </MotiView>

        {/* Top Careers */}
        <SectionHeader
          title="Top Career Matches"
          subtitle="Based on your personality profile"
          delay={200}
        />
        
        <View style={styles.careersGrid}>
          {[
            { title: 'UX Designer', icon: 'color-palette' },
            { title: 'Product Manager', icon: 'cube' },
            { title: 'Content Writer', icon: 'document-text' },
          ].map((career, index) => (
            <MotiView key={career.title} {...createStagger(2 + index, 100)}>
              <TouchableOpacity
                style={styles.careerItem}
                onPress={handlePress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={gradients.careerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.careerItemGradient}
                >
                  <Ionicons name={career.icon as any} size={32} color={colors.textInverse} />
                  <Text style={styles.careerItemTitle}>{career.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        {/* Hybrid Career Paths */}
        <SectionHeader
          title="Hybrid Career Paths"
          subtitle="Combining multiple interests"
          delay={500}
        />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hybridScroll}
        >
          {[
            { title: 'Design + Tech', icon: 'code' },
            { title: 'Writing + Marketing', icon: 'megaphone' },
            { title: 'Psychology + Business', icon: 'business' },
          ].map((path, index) => (
            <MotiView key={path.title} {...createStagger(5 + index, 100)}>
              <TouchableOpacity
                style={styles.hybridCard}
                onPress={handlePress}
                activeOpacity={0.8}
              >
                <Ionicons name={path.icon as any} size={24} color={colors.cardOrange} />
                <Text style={styles.hybridCardTitle}>{path.title}</Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </ScrollView>

        {/* Comparison Table Placeholder */}
        <SectionHeader
          title="Career Comparison"
          subtitle="Compare your top matches"
          delay={800}
        />
        
        <MotiView {...createStagger(8, 100)}>
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonPlaceholder}>
              Career comparison table coming soon
            </Text>
          </View>
        </MotiView>

        {/* Reading List */}
        <SectionHeader
          title="Recommended Reading"
          subtitle="Books to explore your career interests"
          delay={900}
        />
        
        {[1, 2, 3].map((item, index) => (
          <MotiView key={item} {...createStagger(9 + index, 100)}>
            <View style={styles.readingItem}>
              <Ionicons name="book" size={24} color={colors.primary} />
              <View style={styles.readingContent}>
                <Text style={styles.readingTitle}>Career Development Book {item}</Text>
                <Text style={styles.readingSubtitle}>Learn more about your field</Text>
              </View>
            </View>
          </MotiView>
        ))}

        {/* People Like You */}
        <SectionHeader
          title="People Like You"
          subtitle="See how others with similar profiles succeeded"
          delay={1200}
        />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.peopleScroll}
        >
          {[1, 2, 3].map((person, index) => (
            <MotiView key={person} {...createStagger(12 + index, 100)}>
              <View style={styles.personCard}>
                <View style={styles.personAvatar}>
                  <Ionicons name="person" size={32} color={colors.primary} />
                </View>
                <Text style={styles.personName}>Success Story {person}</Text>
                <Text style={styles.personRole}>UX Designer</Text>
              </View>
            </MotiView>
          ))}
        </ScrollView>
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
  careerCard: {
    marginBottom: spacing.xl,
  },
  careersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  careerItem: {
    flex: 1,
    minWidth: '30%',
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  careerItemGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  careerItemTitle: {
    ...typography.title,
    color: colors.textInverse,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  hybridScroll: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  hybridCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.xl,
    alignItems: 'center',
    minWidth: 140,
    ...shadows.md,
  },
  hybridCardTitle: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  comparisonCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  comparisonPlaceholder: {
    ...typography.body,
    color: colors.textSecondary,
  },
  readingItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  readingContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  readingTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  readingSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  peopleScroll: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  personCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.xl,
    alignItems: 'center',
    minWidth: 140,
    ...shadows.md,
  },
  personAvatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  personName: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  personRole: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});

export default CareerCompassScreen;

