/**
 * LifeSync Mobile - Color Design Tokens
 * Refined palette based on web mockups: gradient greens, neon teals, soft purples, yellow cards, coral pinks
 */

export const colors = {
  // Primary brand colors
  primary: '#14B8A6', // Teal
  primaryDark: '#0D9488',
  primaryLight: '#5EEAD4',

  // Background colors
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceElevated: '#FFFFFF',
  surfaceDark: '#1F2937',

  // Text colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Status colors
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
  info: '#3B82F6', // Blue

  // Gradient colors (for gradients)
  gradientTeal: '#14B8A6',
  gradientAqua: '#06B6D4',
  gradientPurple: '#8B5CF6',
  gradientBlue: '#3B82F6',
  gradientPink: '#EC4899',
  gradientRed: '#EF4444',
  gradientGold: '#F59E0B',
  gradientAmber: '#FCD34D',
  gradientIndigo: '#6366F1',

  // Card colors
  cardPurple: '#8B5CF6',
  cardEmerald: '#10B981',
  cardGold: '#F59E0B',
  cardPink: '#EC4899',
  cardCoral: '#F87171',
  cardOrange: '#FB923C',

  // Personality trait colors
  traitOpenness: '#8B5CF6', // Purple
  traitConscientiousness: '#3B82F6', // Blue
  traitExtraversion: '#10B981', // Emerald
  traitAgreeableness: '#F59E0B', // Amber
  traitNeuroticism: '#EF4444', // Red

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
} as const;

export type Colors = typeof colors;

// Gradient definitions
export const gradients = {
  brandGradient: ['#14B8A6', '#06B6D4'], // Teal → Aqua
  personaGradient: ['#8B5CF6', '#3B82F6'], // Purple → Blue
  careerGradient: ['#EC4899', '#EF4444'], // Pink → Red
  tipGradient: ['#F59E0B', '#FCD34D'], // Gold → Amber
  wellnessGradient: ['#6366F1', '#06B6D4'], // Indigo → Aqua
  heroGradient: ['#10B981', '#14B8A6'], // Emerald → Teal
};

export type Gradients = typeof gradients;
