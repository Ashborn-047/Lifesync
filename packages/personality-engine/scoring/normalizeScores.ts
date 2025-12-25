/**
 * Normalize scores to 0-100 scale
 * Input: Raw scores (typically 1-5 Likert scale)
 * Output: Normalized 0-100 scores
 */
import type { OceanScores, FacetScores } from '../types';

export function normalizeScores(
    rawScores: OceanScores,
    min: number = 1,
    max: number = 5
): OceanScores {
    const range = max - min;

    return {
        O: ((rawScores.O - min) / range) * 100,
        C: ((rawScores.C - min) / range) * 100,
        E: ((rawScores.E - min) / range) * 100,
        A: ((rawScores.A - min) / range) * 100,
        N: ((rawScores.N - min) / range) * 100,
    };
}

export function normalizeFacetScores(
    rawFacets: FacetScores,
    min: number = 1,
    max: number = 5
): FacetScores {
    const range = max - min;
    const normalized: FacetScores = {};

    for (const [facet, score] of Object.entries(rawFacets)) {
        normalized[facet] = ((score - min) / range) * 100;
    }

    return normalized;
}
