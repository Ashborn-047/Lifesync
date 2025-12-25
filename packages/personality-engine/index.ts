/**
 * LifeSync Personality Engine
 * Single source of truth for personality scoring and data
 */

export * from './types';
export * from './scoring';
export * from './mapping/factorMapping';
export * from './mapping/personaMapping';

// Export constants
export * from './constants';

export { default as questions_180 } from './data/questions_180.json';
export { default as smart_30 } from './data/smart_30.json';
