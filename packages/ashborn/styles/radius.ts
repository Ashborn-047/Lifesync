/**
 * LifeSync Mobile - Border Radius Design Tokens
 * Huge rounded cards matching web mockups
 */

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  '3xl': 32,
  full: 9999,
} as const;

export type Radius = typeof radius;

