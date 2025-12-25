/**
 * LifeSync Mobile - Global Animations
 * Reusable animation presets using Reanimated and Moti
 */

// Animation durations
export const durations = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

// Fade in animation
export const fadeIn = {
  from: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    type: 'timing' as const,
    duration: durations.normal,
  } as any,
} as const;

// Slide up animation
export const slideUp = {
  from: {
    opacity: 0,
    translateY: 20,
  },
  animate: {
    opacity: 1,
    translateY: 0,
  },
  transition: {
    type: 'timing' as const,
    duration: durations.normal,
  } as any,
} as const;

// Slide right animation
export const slideRight = {
  from: {
    opacity: 0,
    translateX: -20,
  },
  animate: {
    opacity: 1,
    translateX: 0,
  },
  transition: {
    type: 'timing' as const,
    duration: durations.normal,
  } as any,
} as const;

// Spring card animation
export const springCard = {
  from: {
    opacity: 0,
    scale: 0.9,
    translateY: 30,
  },
  animate: {
    opacity: 1,
    scale: 1,
    translateY: 0,
  },
  transition: {
    type: 'spring' as const,
    damping: 15,
    stiffness: 150,
  } as any,
} as const;

// Pulse glow animation
export const pulseGlow = {
  from: { scale: 1, opacity: 0.8 },
  animate: { scale: 1.05, opacity: 1 },
  transition: {
    type: 'timing' as const,
    duration: 1000,
    loop: true,
    repeatReverse: true,
  } as any,
} as const;

// Shimmer loading animation
export const shimmer = {
  from: { opacity: 0.3 },
  animate: { opacity: 0.7 },
  transition: {
    type: 'timing' as const,
    duration: 1000,
    loop: true,
    repeatReverse: true,
  } as any,
} as const;

// Press scale animation (for buttons)
export const pressScale = {
  from: { scale: 1 },
  animate: { scale: 0.95 },
  exit: { scale: 1 },
  transition: {
    type: 'timing' as const,
    duration: durations.fast,
  } as any,
} as const;

// Stagger animation helper
export const createStagger = (index: number, delay: number = 100) => ({
  from: {
    opacity: 0,
    translateY: 20,
  },
  animate: {
    opacity: 1,
    translateY: 0,
  },
  transition: {
    type: 'timing' as const,
    duration: durations.normal,
    delay: index * delay,
  } as any,
});

// Reusable animation configs for Moti
export const animationConfigs = {
  fadeIn,
  slideUp,
  slideRight,
  springCard,
  pulseGlow,
  shimmer,
  pressScale,
} as const;
