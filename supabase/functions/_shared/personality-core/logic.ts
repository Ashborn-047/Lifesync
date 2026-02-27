// supabase/functions/_shared/personality-core/logic.ts

import { Question, OceanScores, FacetScores, ScoringOutput } from './types.ts';

/**
 * Apply reverse scoring to responses based on question definition
 */
export function applyReverseScoring(
    answers: Record<string, number>,
    questions: Question[]
): Record<string, number> {
    const reversed: Record<string, number> = {};
    for (const [qid, score] of Object.entries(answers)) {
        const q = questions.find(item => item.id === qid);
        if (q?.reverse) {
            reversed[qid] = 6 - score;
        } else {
            reversed[qid] = score;
        }
    }
    return reversed;
}

/**
 * Aggregate scores by trait and facet
 */
export function aggregateTraits(
    answers: Record<string, number>,
    questions: Question[]
) {
    const traitSums: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const traitCounts: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const facetSums: Record<string, number> = {};
    const facetCounts: Record<string, number> = {};

    for (const [qid, score] of Object.entries(answers)) {
        const q = questions.find(item => item.id === qid);
        if (!q) continue;

        const weight = q.weight || 1.0;
        const weightedScore = score * weight;

        traitSums[q.trait] += weightedScore;
        traitCounts[q.trait] += weight;

        const facet = q.facet;
        if (facet) {
            facetSums[facet] = (facetSums[facet] || 0) + weightedScore;
            facetCounts[facet] = (facetCounts[facet] || 0) + weight;
        }
    }

    const ocean: OceanScores = {
        O: traitCounts.O > 0 ? traitSums.O / traitCounts.O : 0,
        C: traitCounts.C > 0 ? traitSums.C / traitCounts.C : 0,
        E: traitCounts.E > 0 ? traitSums.E / traitCounts.E : 0,
        A: traitCounts.A > 0 ? traitSums.A / traitCounts.A : 0,
        N: traitCounts.N > 0 ? traitSums.N / traitCounts.N : 0,
    };

    const facets: FacetScores = {};
    for (const facet in facetSums) {
        facets[facet] = facetCounts[facet] > 0 ? facetSums[facet] / facetCounts[facet] : 0;
    }

    return { ocean, facets, traitCounts };
}

/**
 * Normalize raw mean (1-5) to 0-100 scale
 */
export function normalizeScore(rawMean: number): number {
    if (rawMean === 0) return 0;
    return ((rawMean - 1) / 4) * 100;
}

/**
 * Determine MBTI code from OCEAN scores
 * Matches @lifesync/personality-engine deterministic tie-break logic
 */
export function determineMBTI(ocean: OceanScores, confidence: OceanScores): string {
    const IE = (ocean.E >= 50) ? 'E' : 'I';

    // SN tie-break uses confidence
    let SN = 'S';
    if (ocean.O > 50) SN = 'N';
    else if (ocean.O < 50) SN = 'S';
    else SN = (confidence.O > 0.5) ? 'N' : 'S';

    const TF = (ocean.A >= 50) ? 'F' : 'T';
    const JP = (ocean.C >= 50) ? 'J' : 'P';

    return `${IE}${SN}${TF}${JP}`;
}

/**
 * Main pure scoring function
 */
export function computeProfile(
    answers: Record<string, number>,
    questions: Question[],
    quizType: string,
    version: string
): ScoringOutput {
    const reversed = applyReverseScoring(answers, questions);
    const { ocean: rawOcean, facets: rawFacets, traitCounts } = aggregateTraits(reversed, questions);

    // Calculate max weights for confidence
    const maxTraitWeights: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    for (const q of questions) {
        maxTraitWeights[q.trait] += (q.weight || 1.0);
    }

    const trait_confidence: OceanScores = {
        O: maxTraitWeights.O > 0 ? traitCounts.O / maxTraitWeights.O : 0,
        C: maxTraitWeights.C > 0 ? traitCounts.C / maxTraitWeights.C : 0,
        E: maxTraitWeights.E > 0 ? traitCounts.E / maxTraitWeights.E : 0,
        A: maxTraitWeights.A > 0 ? traitCounts.A / maxTraitWeights.A : 0,
        N: maxTraitWeights.N > 0 ? traitCounts.N / maxTraitWeights.N : 0,
    };

    const trait_scores: Record<string, number> = {
        O: normalizeScore(rawOcean.O),
        C: normalizeScore(rawOcean.C),
        E: normalizeScore(rawOcean.E),
        A: normalizeScore(rawOcean.A),
        N: normalizeScore(rawOcean.N),
    };

    const facet_scores: Record<string, number> = {};
    for (const facet in rawFacets) {
        facet_scores[facet] = normalizeScore(rawFacets[facet]);
    }

    const mbti_code = determineMBTI(trait_scores as any as OceanScores, trait_confidence);

    return {
        raw_scores: answers,
        trait_scores,
        facet_scores,
        mbti_code,
        persona_id: mbti_code.toLowerCase(),
        confidence: trait_confidence.O, // Using openness confidence as general representative if needed, or avg
        metadata: {
            engine_version: version,
            quiz_type: quizType
        }
    };
}
