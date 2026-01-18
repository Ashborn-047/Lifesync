// supabase/functions/_shared/personality-core/types.ts

export interface Question {
    id: string;
    text: string;
    trait: 'O' | 'C' | 'E' | 'A' | 'N';
    facet: string;
    reverse: boolean;
    weight: number;
}

export interface OceanScores {
    O: number;
    C: number;
    E: number;
    A: number;
    N: number;
}

export interface FacetScores {
    [facet: string]: number;
}

export interface ScoringOutput {
    raw_scores: Record<string, number>;
    trait_scores: Record<string, number>;
    facet_scores: Record<string, number>;
    mbti_code: string;
    persona_id: string; // lowercase mbti
    confidence: number;
    metadata: {
        engine_version: string;
        quiz_type: string;
        scoring_variant?: string;
    };
}
