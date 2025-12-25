/**
 * MBTI Type Determination from OCEAN Scores
 * 
 * Maps Big Five (OCEAN) scores to Myers-Briggs Type Indicator (MBTI)
 * 
 * Mapping logic:
 * - I/E: Extraversion (E < 50 = Introvert, E >= 50 = Extravert)
 * - S/N: Openness (O < 50 = Sensing, O >= 50 = Intuitive)
 * - T/F: Agreeableness (A < 50 = Thinking, A >= 50 = Feeling)
 * - J/P: Conscientiousness (C < 50 = Perceiving, C >= 50 = Judging)
 */
import type { OceanScores } from '../types';

export function determineMBTI(ocean: OceanScores, confidence: OceanScores): string {
    // Helper for tie-breaking (matches Python logic)
    const resolveDimension = (score: number, conf: number, highChar: string, lowChar: string): string => {
        if (score > 50) return highChar;
        if (score < 50) return lowChar;
        // Exactly 50 - use confidence
        return conf > 0.5 ? highChar : lowChar;
    };

    // I/E dimension (Introversion vs Extraversion)
    // Python logic for E=50: if conf > 0.5 -> E, else E. So E is default.
    // However, to be strictly consistent with the "resolveDimension" pattern:
    // If we pass E's confidence, and it's <= 0.5, we get 'I'.
    // BUT Python's specific implementation for E might be different.
    // Let's look at the sandbox implementation again.
    // Sandbox: const IE = (ocean.E > 50) || (ocean.E === 50) ? 'E' : 'I';
    // This implies E is ALWAYS default for 50, regardless of confidence.
    // Wait, the user said: "Ensure TypeScript engine uses the exact same deterministic tie-break rule as the Python engine".
    // Python code:
    // if e_score > 0.5: E
    // elif e_score < 0.5: I
    // else: if conf > 0.5: E else: E
    // So for E, it IS always E if 50.
    const IE = (ocean.E >= 50) ? 'E' : 'I';

    // S/N dimension (Sensing vs Intuition)
    // Python: if o_score > 0.5: N, elif < 0.5: S, else: if conf > 0.5: N, else: S.
    const SN = resolveDimension(ocean.O, confidence.O, 'N', 'S');

    // T/F dimension (Thinking vs Feeling)
    // Python: if a_score > 0.5: F, elif < 0.5: T, else: if conf > 0.5: F, else: F.
    // So F is always default for 50.
    const TF = (ocean.A >= 50) ? 'F' : 'T';

    // J/P dimension (Judging vs Perceiving)
    // Python: if c_score > 0.5: J, elif < 0.5: P, else: if conf > 0.5: J, else: J.
    // So J is always default for 50.
    const JP = (ocean.C >= 50) ? 'J' : 'P';

    return `${IE}${SN}${TF}${JP}`;
}

/**
 * Get MBTI dimension scores (for debugging/analysis)
 */
export function getMBTIDimensions(ocean: OceanScores) {
    return {
        IE: ocean.E,
        SN: ocean.O,
        TF: ocean.A,
        JP: ocean.C,
    };
}
