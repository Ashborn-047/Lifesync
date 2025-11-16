/**
 * Helper function to get persona data by MBTI type
 */

import { PERSONA_PROFILES, type PersonaProfile } from "@/src/data/personas";

/**
 * Get persona profile by MBTI type
 * @param type - MBTI type (e.g., "ENFJ", "ISTP")
 * @returns PersonaProfile or null if not found
 */
export function getPersona(type: string | null | undefined): PersonaProfile | null {
  if (!type) return null;
  return PERSONA_PROFILES[type] ?? null;
}

/**
 * Check if a persona exists for the given type
 * @param type - MBTI type
 * @returns boolean
 */
export function hasPersona(type: string | null | undefined): boolean {
  return type ? type in PERSONA_PROFILES : false;
}

