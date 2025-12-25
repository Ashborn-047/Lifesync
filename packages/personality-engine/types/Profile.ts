/**
 * Profile and personality result type definitions
 */
export interface OceanScores {
    O: number; // Openness
    C: number; // Conscientiousness
    E: number; // Extraversion
    A: number; // Agreeableness
    N: number; // Neuroticism
}

export interface FacetScores {
    [facet: string]: number;
}

export interface PersonalityProfile {
    ocean: OceanScores;
    facets: FacetScores;
    mbti_type: string | null;
    persona: string | null;
}

export interface PersonaProfile {
    type: string;
    personaName: string;
    icon: string;
    tagline: string;
    strengths: string[];
    challenges: string[];
    communicationStyle: string;
    decisionStyle: string;
    atBest: string;
    underStress: string;
    voicePreset: string;
}
