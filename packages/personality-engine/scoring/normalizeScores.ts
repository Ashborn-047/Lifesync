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
        O: rawScores.O > 0 ? ((rawScores.O - min) / range) * 100 : 0,
        C: rawScores.C > 0 ? ((rawScores.C - min) / range) * 100 : 0,
        E: rawScores.E > 0 ? ((rawScores.E - min) / range) * 100 : 0,
        A: rawScores.A > 0 ? ((rawScores.A - min) / range) * 100 : 0,
        N: rawScores.N > 0 ? ((rawScores.N - min) / range) * 100 : 0,
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
        normalized[facet] = score > 0 ? ((score - min) / range) * 100 : 0;
    }

    return normalized;
}
