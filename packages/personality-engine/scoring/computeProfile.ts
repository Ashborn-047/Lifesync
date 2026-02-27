/**
 * ✨ CANONICAL PERSONALITY PROFILE COMPUTATION
 * 
 * This is the SINGLE SOURCE OF TRUTH for personality scoring.
 * Both web and mobile MUST use this exact function to ensure identical results.
 * 
 * @param answers - Map of question_id to response (1-5)
 * @param questions - Array of Question objects
 * @returns PersonalityProfile with OCEAN scores, facets, and MBTI type
 */
import type { Question, AnswerMap, PersonalityProfile } from '../types';
import { applyReverseScoring } from './applyReverseScoring';
import { aggregateTraits } from './aggregateTraits';
import { normalizeScores, normalizeFacetScores } from './normalizeScores';
import { determineMBTI } from '../mapping/factorMapping';

export function computeProfile(
    answers: AnswerMap,
    questions: Question[]
): PersonalityProfile {
    // Step 1: Apply reverse scoring
    const reversedAnswers = applyReverseScoring(answers, questions);

    // Step 2: Aggregate by traits and facets
    const { ocean: rawOcean, facets: rawFacets, traitCounts } = aggregateTraits(reversedAnswers, questions);

    // Step 3: Normalize scores to 0-100 scale
    const ocean = normalizeScores(rawOcean);
    const facets = normalizeFacetScores(rawFacets);

    // Step 3.5: Calculate Confidence (Internal Use Only)
    const maxTraitWeights: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    for (const q of questions) {
        if (maxTraitWeights[q.trait] !== undefined) {
            maxTraitWeights[q.trait] += q.weight;
        }
    }

    const trait_confidence = {
        O: maxTraitWeights.O > 0 ? traitCounts.O / maxTraitWeights.O : 0,
        C: maxTraitWeights.C > 0 ? traitCounts.C / maxTraitWeights.C : 0,
        E: maxTraitWeights.E > 0 ? traitCounts.E / maxTraitWeights.E : 0,
        A: maxTraitWeights.A > 0 ? traitCounts.A / maxTraitWeights.A : 0,
        N: maxTraitWeights.N > 0 ? traitCounts.N / maxTraitWeights.N : 0,
    };

    // Step 4: Determine MBTI type from OCEAN scores (using confidence for tie-breaking)
    const mbti_type = determineMBTI(ocean, trait_confidence);

    return {
        ocean,
        facets,
        mbti_type,
        persona: mbti_type, // Persona is same as MBTI type
    };
}

/**
 * Debug helper for verifying MBTI tie-break logic
 * @internal
 */
export function _debug_mbti_tiebreak(openness: number, confidence: number): "N" | "S" {
    if (openness > 50) return "N";
    if (openness < 50) return "S";
    return confidence > 0.5 ? "N" : "S";
}
