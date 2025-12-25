/**
 * Aggregate trait scores from individual question responses
 * Groups questions by trait and calculates averages
 */
import type { Question, AnswerMap, OceanScores, FacetScores } from '../types';

export function aggregateTraits(
    answers: AnswerMap,
    questions: Question[]
): { ocean: OceanScores; facets: FacetScores; traitCounts: Record<string, number> } {
    // Initialize accumulators
    const traitSums: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const traitCounts: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const facetSums: Record<string, number> = {};
    const facetCounts: Record<string, number> = {};

    // Aggregate scores
    for (const [questionId, response] of Object.entries(answers)) {
        const question = questions.find(q => q.id === questionId);

        if (!question) {
            console.warn(`Question ${questionId} not found during aggregation`);
            continue;
        }

        const { trait, facet, weight } = question;
        const weightedResponse = response * weight;

        // Aggregate by trait
        traitSums[trait] += weightedResponse;
        traitCounts[trait] += weight;

        // Aggregate by facet
        if (!facetSums[facet]) {
            facetSums[facet] = 0;
            facetCounts[facet] = 0;
        }
        facetSums[facet] += weightedResponse;
        facetCounts[facet] += weight;
    }

    // Calculate averages
    const ocean: OceanScores = {
        O: traitCounts.O > 0 ? traitSums.O / traitCounts.O : 0,
        C: traitCounts.C > 0 ? traitSums.C / traitCounts.C : 0,
        E: traitCounts.E > 0 ? traitSums.E / traitCounts.E : 0,
        A: traitCounts.A > 0 ? traitSums.A / traitCounts.A : 0,
        N: traitCounts.N > 0 ? traitSums.N / traitCounts.N : 0,
    };

    const facets: FacetScores = {};
    for (const facet of Object.keys(facetSums)) {
        facets[facet] = facetCounts[facet] > 0 ? facetSums[facet] / facetCounts[facet] : 0;
    }

    return { ocean, facets, traitCounts };
}
